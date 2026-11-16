import test from 'node:test';
import assert from 'node:assert/strict';
import {createAgentOperations,prepareAgentUpdate,mergeSceneChanges} from '../creator/video-studio/agent.js';
import {newStudioVideo} from '../creator/video-studio/composition.js';
import {createDefaultMap} from '../creator/map-defaults.js';
const fixture=()=>({...newStudioVideo(),scenes:Array.from({length:13},(_,i)=>({id:'scene-'+(i+1),name:'Scene '+(i+1),startSeconds:i*2,durationSeconds:2,engineType:'map',engineData:{project:{scenes:[{id:'map-'+i,duration:2}],historicalMap:createDefaultMap()},sourceStart:0},overlays:[]}))});
test('13 native maps survive validation, canonical save and reload',async()=>{
 let manifest=newStudioVideo(),revision=0,saved;const api=createAgentOperations({authorize:()=>{},getManifest:()=>manifest,getRevision:()=>revision,save:async next=>{saved=JSON.stringify(next);manifest=JSON.parse(saved);revision++;}});
 assert.equal((await api.validateJSON(fixture())).ok,true);assert.equal(revision,0);
 assert.equal((await api.applyPatch(fixture())).ok,true);
 assert.deepEqual(JSON.parse(saved),fixture());assert.equal((await api.getSceneSummary()).scenes.filter(s=>s.engineType==='map').length,13);
 assert.equal((await api.getProjectJSON()).revision,1);
 const before=structuredClone(manifest);
 assert.equal((await api.applyPatch({patchSceneId:'scene-4',expectedRevision:1,changes:{name:'Wind',engineData:{project:{historicalMap:{cameraDefaults:{zoom:5}}}}}})).ok,true);
 assert.deepEqual(manifest.scenes.filter(s=>s.id!=='scene-4'),before.scenes.filter(s=>s.id!=='scene-4'));
 assert.equal(manifest.scenes[3].engineData.project.historicalMap.cameraDefaults.zoom,5);
 assert.equal((await api.applyPatch({patchSceneId:'scene-4',expectedRevision:1,changes:{name:'Stale'}})).errors[0].code,'REVISION_CONFLICT');
});
test('patch arrays preserve siblings and require explicit replacement for unkeyed values',()=>{
 const base={layers:[{id:'a',color:'red',name:'Keep'},{id:'b',color:'blue'}]};
 assert.deepEqual(mergeSceneChanges(base,{layers:[]}),base);
 assert.deepEqual(mergeSceneChanges(base,{layers:[{id:'a',color:'gold'}]}).layers,[{id:'a',color:'gold',name:'Keep'},base.layers[1]]);
 assert.throws(()=>mergeSceneChanges({camera:[]},{camera:[{time:0}]}),/replace/);
 assert.deepEqual(mergeSceneChanges(base,{layers:{$replace:[]}}),{layers:[]});
 assert.throws(()=>mergeSceneChanges({},JSON.parse('{"__proto__":{"polluted":true}}')),/Unsafe/);
});
test('invalid maps, targets, timing and missing assets do not mutate saved state',async()=>{
 const manifest=fixture(),before=structuredClone(manifest);let writes=0;
 const api=createAgentOperations({authorize:()=>{},getManifest:()=>manifest,getRevision:()=>0,checkResources:async next=>{if(next.assets.length)throw Error('Missing asset: absent');},save:async()=>writes++});
 for(const changes of [{durationSeconds:-1},{engineType:'unknown'},{engineData:{project:{$replace:{}}}},{id:'other'}])assert.equal((await api.applyPatch({patchSceneId:'scene-4',changes})).ok,false);
 assert.equal((await api.applyPatch({patchSceneId:'absent',changes:{}})).ok,false);
 assert.equal((await api.applyPatch({...manifest,assets:[{id:'absent',name:'absent',fileId:'missing'}]})).ok,false);
 assert.equal(writes,0);assert.deepEqual(manifest,before);
});
test('unauthorized API operations reject including reads and validation',async()=>{
 const api=createAgentOperations({authorize:()=>{throw Object.assign(Error('Sign in'),{code:'UNAUTHORIZED'});},getManifest:fixture,getRevision:()=>0});
 for(const operation of ['getProjectJSON','getSceneSummary','validateJSON','applyPatch'])assert.equal((await api[operation](fixture())).errors[0].code,'UNAUTHORIZED');
});
test('patching a shared native map detaches only the selected scene',()=>{
 const m=fixture(),project=m.scenes[0].engineData.project;m.mapSources=[{id:'shared',project}];for(const s of m.scenes)s.engineData={sourceId:'shared',sourceStart:0};
 const next=prepareAgentUpdate(m,{patchSceneId:'scene-4',changes:{engineData:{project:{historicalMap:{cameraDefaults:{zoom:6}}}}}});
 assert.equal(next.scenes[3].engineData.project.historicalMap.cameraDefaults.zoom,6);
 assert.deepEqual(next.mapSources,m.mapSources);assert.deepEqual(next.scenes[0],m.scenes[0]);
});

test('map imports repair only sub-millisecond timing overflow', () => {
 const manifest = fixture();
 const scene = manifest.scenes[0];
 const map = scene.engineData.project;
 map.scenes[0].duration = 1.9999;
 map.historicalMap.camera = [{sceneId: 'map-0', offset: 2.0001, center: [91, 25], zoom: 5}];
 const parsed = prepareAgentUpdate(manifest, manifest);
 assert.equal(parsed.scenes[0].engineData.project.scenes[0].duration, 2);
 assert.equal(parsed.scenes[0].engineData.project.historicalMap.camera[0].offset, 2);
 map.historicalMap.camera[0].offset = 2.01;
 assert.throws(() => prepareAgentUpdate(manifest, manifest), /Offset must be within/);
});

test('selected scene JSON is a valid patch and round-trips map coordinates and keyframes', async () => {
 const {scenePatch} = await import('../creator/agent-panel.js');
 const manifest = fixture();
 const scene = manifest.scenes[0];
 scene.engineData.project.historicalMap.camera = [{sceneId:'map-0',offset:0,center:[91,25],zoom:5}];
 scene.overlays = [{id:'title',type:'text',text:'Rain',keyframes:[{timeSeconds:0,opacity:0},{timeSeconds:1,opacity:1}]}];
 const patch = scenePatch(scene, 3);
 assert.equal(patch.changes.name, scene.name);
 assert.deepEqual(prepareAgentUpdate(manifest,patch,{revision:3}),prepareAgentUpdate(manifest,manifest));
});

test('motion preview skips inaccessible clips and retains healthy tracks', async () => {
 const {loadAudioTracks} = await import('../creator/video-studio/audio.js');
 const clips = ['denied','healthy','denied'].map((fileId, index) => ({id:String(index),fileId,name:fileId,trimStart:0,durationSeconds:1}));
 const attempts = [], muted = [];
 const getFile = async id => {
  attempts.push(id);
  if(id === 'denied') throw Error('HTTP 403');
  return new Blob(['audio']);
 };
 const decode = async () => ({duration:1,sampleRate:48000});
 const tracks = await loadAudioTracks({audioClips:clips},getFile,{decode,onUnavailable:clip=>muted.push(clip.id)});
 assert.deepEqual(tracks.map(clip=>clip.id),['1']);
 assert.deepEqual(muted,['0','2']);
 assert.deepEqual(attempts,['denied','healthy']);
});
