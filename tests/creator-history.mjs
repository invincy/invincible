import test from 'node:test';
import assert from 'node:assert/strict';
import {britishIndiaDemo} from '../creator/history-demo.js';
import {validateMap,mapFrame,timeOf,routeAt,createClip,clipTiming,exportManifest,safeUrl} from '../creator/history-model.js';
import {methodsOf,queueScenes,parseProductionImport} from '../creator/production-model.js';
const demo=()=>britishIndiaDemo();
test('demo has sourced milestones, no invented boundaries or troop paths, and independent scene IDs',()=>{
 const p=demo(),map=validateMap(p.historicalMap,p);assert.equal(p.scenes.length,4);assert.deepEqual(map.events.slice(3).map(e=>e.date),['23 June 1757','1764','1765']);assert.equal(map.features.features.length,0);assert.equal(mapFrame(p,map,0).events.length,3);assert.equal(mapFrame(p,map,8).events.length,4);assert.equal(mapFrame(p,map,24).events.length,6);assert.notEqual(p.scenes[0].id,demo().scenes[0].id);
});
test('timing follows canonical scene order and durations; scrubbing is deterministic',()=>{
 const p=demo(),event=p.historicalMap.events[3];assert.equal(timeOf(p,event),8);p.scenes[0].duration=12;assert.equal(timeOf(p,event),12);p.scenes.reverse();assert.equal(timeOf(p,event),16);const before=JSON.stringify(p);assert.deepEqual(mapFrame(p,p.historicalMap,18),mapFrame(p,p.historicalMap,18));assert.equal(JSON.stringify(p),before);
});
test('map import rejects unverified geometry, missing provenance, invalid ranges and broken scene references atomically',()=>{
 const p=demo();for(const mutate of [m=>m.events[0].sourceUrl='javascript:alert(1)',m=>m.events[0].coordinates=[181,0],m=>m.events[0].sceneId='missing',m=>m.events[0].offset=-1,m=>m.events[0].id=m.events[1].id,m=>m.camera[0].zoom=Infinity,m=>m.events[0].sourceNote='']){const m=structuredClone(p.historicalMap);mutate(m);assert.throws(()=>validateMap(m,p));}assert.equal(p.historicalMap.events[0].label,'Bombay');assert.equal(safeUrl('https://user:secret@example.com'), '');
});
function route(p){return {type:'Feature',properties:{id:'route',sceneId:p.scenes[1].id,offset:1,label:'Test fixture only',date:'1757',sourceUrl:'https://example.org/fixture',sourceNote:'Synthetic test geometry; never included in demo.',reviewed:true,duration:4},geometry:{type:'LineString',coordinates:[[80,20],[82,22],[84,24]]}};}
test('sourced route reveal and camera interpolate without mutating stored coordinates',()=>{
 const p=demo(),r=route(p);p.historicalMap.features.features.push(r);validateMap(p.historicalMap,p);assert.equal(mapFrame(p,p.historicalMap,8).features.features.length,0);assert.deepEqual(mapFrame(p,p.historicalMap,11).features.features[0].geometry.coordinates,[[80,20],[82,22]]);assert.deepEqual(routeAt(r.geometry.coordinates,1),r.geometry.coordinates);assert.deepEqual(routeAt(r.geometry.coordinates,0),[[80,20],[80,20]]);assert.deepEqual(r.geometry.coordinates,[[80,20],[82,22],[84,24]]);r.properties.reviewed=false;assert.throws(()=>validateMap(p.historicalMap,p));
});
test('reviewed polygons must have closed valid rings',()=>{const p=demo(),f=route(p);f.geometry={type:'Polygon',coordinates:[[[80,20],[82,20],[81,21],[80,20]]]};p.historicalMap.features.features=[f];validateMap(p.historicalMap,p);f.geometry.coordinates[0].pop();assert.throws(()=>validateMap(p.historicalMap,p));});
test('clip grouping retains scenes, rejects gaps/duplicates and detects reordered canonical scenes',()=>{
 const p=demo(),before=JSON.stringify(p.scenes),ids=p.scenes.map(s=>s.id),clip=createClip(p,[ids[2],ids[1]],'Bengal');assert.deepEqual(clip.sceneIds,ids.slice(1,3));assert.equal(clipTiming(p,clip).duration,16);assert.equal(JSON.stringify(p.scenes),before);assert.throws(()=>createClip(p,[ids[0],ids[2]],'bad'));assert.throws(()=>createClip(p,[ids[0],ids[0]],'bad'));assert.throws(()=>createClip(p,[],'bad'));assert.throws(()=>createClip(p,['missing'],'bad'));[p.scenes[1],p.scenes[2]]=[p.scenes[2],p.scenes[1]];assert.equal(clipTiming(p,clip).valid,false);
});
test('manifest preserves exact narration, IDs, timestamp and unknown project fields',()=>{const p=demo();p.scenes[0].voiceoverTimestamp='00:00.125–00:08.330';p.custom={keep:true};p.productionClips=[createClip(p,[p.scenes[0].id],'Start')];const m=exportManifest(p);assert.equal(m.scenes[0].voiceover,p.scenes[0].voiceover);assert.equal(m.scenes[0].voiceoverTimestamp,'00:00.125–00:08.330');assert.equal(m.clips[0].timing.duration,8);assert.equal(p.custom.keep,true);});
test('hybrid method filters extend existing workspaces without changing import column order',()=>{const p=demo();assert.equal(queueScenes(p,'Animated Maps').length,4);assert.deepEqual(methodsOf({productionMethods:['Canva','3D Civilizations']}),['3D Civilizations','Canva']);const [s]=parseProductionImport('Exact\tMap\tSource\t0–8s\t00:00.125–00:08.330');assert.equal(s.voiceover,'Exact');assert.equal(s.voiceoverTimestamp,'00:00.125–00:08.330');});
