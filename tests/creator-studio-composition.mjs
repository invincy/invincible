import test from 'node:test';
import assert from 'node:assert/strict';
import {newStudioVideo,upgradeVideo,appendProjectMaps,arrangeScenes,resizeScene} from '../creator/video-studio/composition.js';
import {emptyVideo,validateManifest,compileTimeline,PRESETS,sceneAt,visualFrameAt} from '../creator/video-studio/model.js';
import {emptyBattlefield,poseAt,elevationAt,projectBattlePoint} from '../creator/video-studio/battlefield.js';
import {mixAudioChunk,audioGainAt,scheduleAudioTracks} from '../creator/video-studio/audio.js';
import {compileAnimation} from '../creator/map-animation-import.js';
const graphic=(id,durationSeconds=2)=>({id,startSeconds:0,durationSeconds,engineType:'graphic',engineData:{},overlays:[]});
const source=()=>compileAnimation({scenes:[]},{format:'invincible-map-animation',version:1,duration:4,aspectRatio:'9:16',basemap:'physical',terrain:false,camera:[{time:0,center:[74,28],zoom:4,pitch:0,bearing:0},{time:4,center:[77,30],zoom:5,pitch:20,bearing:10}],layers:[]}).project;

test('visual pauses hold the preceding native scene without changing locked timing',()=>{
 const first={...graphic('first',2),engineType:'map'},next={...graphic('next',2),startSeconds:2.5};
 const timeline={scenes:[first,next],duration:4.6},original=structuredClone(timeline);
 assert.equal(sceneAt(timeline,2.2),undefined);
 const held=visualFrameAt(timeline,2.2);assert.equal(held.scene,first);assert.ok(held.local<2&&held.local>1.99);
 assert.deepEqual(visualFrameAt(timeline,2.5),{scene:next,local:0});
 assert.equal(visualFrameAt(timeline,4.55).scene,next);
 assert.equal(visualFrameAt(timeline,-.1),null);
 assert.deepEqual(timeline,original);
});
test('native map JSON normalizes editor fields and round-trips without changing source trim',()=>{
 const manifest=appendProjectMaps(newStudioVideo(),source());
 const scene=manifest.scenes[0],snapshot=manifest.mapSources[0].project;
 scene.startSeconds=0;scene.durationSeconds=2;
 delete scene.engineData.sourceStart;
 scene.sourceStart=1;scene.sourceEnd=3;
 for(const key of ['camera','visual','basemap','projection','overlayPreset']){
  if(snapshot.historicalMap[key]===undefined)continue;
  snapshot[key]=snapshot.historicalMap[key];
  delete snapshot.historicalMap[key];
 }
 const normalized=validateManifest(manifest);
 assert.deepEqual(normalized.scenes[0].engineData,{sourceId:scene.engineData.sourceId,sourceStart:1});
 assert.equal(normalized.mapSources[0].project.historicalMap.camera.length,2);
 assert.deepEqual(validateManifest(JSON.stringify(normalized)),normalized);
 scene.sourceEnd=4;
 assert.throws(()=>validateManifest(manifest),/source end must match/);
});
test('map backgrounds survive cloud validation and timeline compilation',()=>{
 const manifest=appendProjectMaps(newStudioVideo(),source());
 const scene=manifest.scenes[0];
 const background={background:'#102030',backgroundStyle:'grid',gridColor:'#446688',gridSpacing:54};
 Object.assign(scene.engineData,background);
 const opened=validateManifest(JSON.stringify(manifest));
 assert.deepEqual(opened.scenes[0].engineData,scene.engineData);
 assert.equal(compileTimeline(opened,PRESETS[0]).scenes[0].engineData.background,'#102030');
 assert.deepEqual(validateManifest(opened),opened);
 Object.assign(scene.engineData,{backgroundStyle:'image',backgroundAssetId:'map-art',backgroundFit:'cover'});
 assert.throws(()=>validateManifest(manifest),/Missing background artwork/);
 manifest.assets.push({id:'map-art',name:'Map artwork',fileId:'original'});
 assert.equal(validateManifest(manifest).scenes[0].engineData.backgroundAssetId,'map-art');
 scene.engineData.background='invalid';
 assert.throws(()=>validateManifest(manifest),/colors must be #rrggbb/i);
});
test('map overlays preserve CSS font weights across cloud open and save validation',()=>{
 const manifest=appendProjectMaps(newStudioVideo(),source());
 manifest.scenes[0].overlays=[800,'900','normal','bold',650.5].map((fontWeight,index)=>({id:'title-'+index,type:'text',text:'Panipat',fontWeight}));
 const opened=validateManifest(JSON.stringify(manifest));
 assert.deepEqual(opened.scenes[0].overlays.map(layer=>layer.fontWeight),[800,900,400,700,650.5]);
 assert.deepEqual(validateManifest(opened),opened);
 manifest.scenes[0].overlays[0].fontWeight=1001;
 assert.throws(()=>validateManifest(manifest),/Font weight must be between 1 and 1000/);
});
test('v1 upgrades only on an explicit edit and preserves the legacy recording',()=>{
 const old={...emptyVideo(),audio:{fileId:'voice',name:'original.wav',startSeconds:.5,gain:.7}},before=structuredClone(old);assert.throws(()=>upgradeVideo(old),/original/);const out=upgradeVideo(old,3);assert.equal(out.schemaVersion,2);assert.equal(out.audio,null);assert.equal(out.audioClips[0].durationSeconds,3);assert.equal(out.audioClips[0].startSeconds,.5);assert.deepEqual(old,before);assert.deepEqual(validateManifest(old),old);assert.equal(validateManifest(out).schemaVersion,2);assert.throws(()=>validateManifest({...old,schemaVersion:3}));
});
test('native map source is copied once and its camera/layers and original project are preserved',()=>{
 const p=source();p.scenes=[{id:'a',duration:2},{id:'b',duration:2}];p.historicalMap.camera[0].sceneId='a';p.historicalMap.camera[1].sceneId='b';p.historicalMap.camera[1].offset=2;const before=structuredClone(p),m=appendProjectMaps(newStudioVideo(),p);assert.equal(m.scenes.length,2);assert.equal(m.mapSources.length,1);assert.equal(m.scenes[1].engineData.sourceStart,2);assert.equal(m.scenes[0].engineData.sourceId,m.scenes[1].engineData.sourceId);assert.deepEqual(p,before);m.mapSources[0].project.historicalMap.camera[0].zoom=9;assert.deepEqual(p,before);assert.throws(()=>validateManifest({...m,mapSources:[]}));
});
test('scene reordering and duplication keep recordings fixed, with exact boundary and tail handling',()=>{
 const m={...newStudioVideo(),scenes:[graphic('a'),{...graphic('b'),startSeconds:2}],audioClips:[{id:'v',fileId:'f',name:'voice',role:'voiceover',startSeconds:1,trimStart:.2,durationSeconds:5,gain:1,fadeIn:0,fadeOut:0}]},out=arrangeScenes(m,[m.scenes[1],m.scenes[0],graphic('c')]);assert.deepEqual(out.audioClips,m.audioClips);assert.equal(out.scenes[1].startSeconds,2);const t=compileTimeline(out,PRESETS[0]);assert.equal(sceneAt(t,2).id,'a');assert.equal(t.duration,6);assert.equal(sceneAt(t,6),undefined);
 const b={...PRESETS[0],intro:graphic('intro')},branded=compileTimeline({...out,introEnabled:true},b);assert.equal(branded.audioClips[0].startSeconds,3);assert.equal(branded.scenes[1].startSeconds,2);
});
test('overlapping trimmed mono/stereo tracks mix by absolute sample time, fade and clip safely',()=>{
 const buffer={sampleRate:4,numberOfChannels:1,getChannelData:()=>Float32Array.of(1,.5,-1,0,1,.5,-1,0)},a={buffer,startSeconds:.5,trimStart:.25,durationSeconds:1,gain:1,fadeIn:.5,fadeOut:.5};assert.equal(audioGainAt(a,.25),.5);assert.equal(audioGainAt(a,1),0);assert.deepEqual([...mixAudioChunk([a],0,8,4).data],[0,0,0,-.5,0,.5,0,0]);const stereo={...buffer,numberOfChannels:2,getChannelData:c=>Float32Array.of(c?.25:.75,1,1,1)};const b={...a,buffer:stereo,startSeconds:0,trimStart:0,durationSeconds:1,fadeIn:0,fadeOut:0};const mixed=mixAudioChunk([b,b],0,4,4);assert.equal(mixed.channels,2);assert.deepEqual([...mixed.data],[1,1,1,1,.5,1,1,1]);assert.deepEqual([...mixAudioChunk([a],3,3,4).data],[...mixAudioChunk([a],0,8,4).data.slice(3,6)]);
});
test('preview resumes inside fades with the same gain envelope as exported audio',()=>{
 const scheduled=[],gains=[],context={currentTime:10,destination:{},createBufferSource:()=>({connect(){},disconnect(){},start:(...args)=>scheduled.push(args),stop(){}}),createGain:()=>({gain:{setValueAtTime:(...args)=>gains.push(args),linearRampToValueAtTime:(...args)=>gains.push(args)},connect(){},disconnect(){}})},a={buffer:{},startSeconds:2,trimStart:.5,durationSeconds:4,gain:.8,fadeIn:1,fadeOut:1};const stop=scheduleAudioTracks(context,[a],2.5);assert.deepEqual(scheduled[0],[10,1,3.5]);assert.equal(gains[0][0],audioGainAt(a,.5));assert.deepEqual(gains.at(-1),[0,13.5]);stop();
});
test('battlefield paths, projected camera and elevation are deterministic across seeks',()=>{
 const data=emptyBattlefield();data.terrain.push({id:'hill',kind:'hill',points:[[.2,.2],[.8,.8]],height:.2,width:.02,color:'#778855'});data.formations.push({id:'army',name:'Cavalry',assetId:'sprite',count:12,columns:4,spacing:.03,scale:.05,path:[{timeSeconds:0,x:.3,y:.7,rotation:0},{timeSeconds:2,x:.7,y:.3,rotation:90}]});const m={...newStudioVideo(),assets:[{id:'sprite',name:'sprite',fileId:'original'}],scenes:[{...graphic('battle'),engineType:'battlefield',engineData:data}]};validateManifest(m);assert.deepEqual(poseAt(data.formations[0].path,1),{x:.5,y:.5,rotation:45});const p=projectBattlePoint(data,1,.5,.5,elevationAt(data.terrain,.5,.5));for(const t of [2,0,1.5,.1,1])projectBattlePoint(data,t,.6,.4);assert.deepEqual(projectBattlePoint(data,1,.5,.5,elevationAt(data.terrain,.5,.5)),p);assert.equal(elevationAt(data.terrain,0,0),0);assert.throws(()=>validateManifest({...m,assets:[]}));m.scenes[0].engineData.formations[0].count=5000;assert.throws(()=>validateManifest(m));
});
test('invalid trims, unsupported engines, negative timing and excessive fades reject atomically',()=>{
 const m=newStudioVideo();const snapshot=structuredClone(m);for(const a of [{role:'voiceover',startSeconds:0,trimStart:-1,durationSeconds:1,gain:1,fadeIn:0,fadeOut:0},{role:'music',startSeconds:0,trimStart:0,durationSeconds:1,gain:1,fadeIn:.8,fadeOut:.8}])assert.throws(()=>validateManifest({...m,audioClips:[{id:'a',fileId:'f',name:'x',...a}]}));assert.deepEqual(m,snapshot);assert.throws(()=>validateManifest({...emptyVideo(),scenes:[{...graphic('battle'),engineType:'battlefield',engineData:emptyBattlefield()}]}));
});
test('duration changes retime battlefield movement, camera and overlays together',()=>{
 const b={...graphic('b',4),engineType:'battlefield',engineData:emptyBattlefield(),overlays:[{id:'t',type:'text',text:'test',endSeconds:4,keyframes:[{timeSeconds:0,x:0},{timeSeconds:4,x:1}]}]};b.engineData.camera.push({...b.engineData.camera[0],timeSeconds:4,x:.7});const out=resizeScene(b,2);assert.equal(out.engineData.camera[1].timeSeconds,2);assert.equal(out.overlays[0].endSeconds,2);assert.equal(out.overlays[0].keyframes[1].timeSeconds,2);assert.equal(b.durationSeconds,4);validateManifest({...newStudioVideo(),scenes:[out]});
});
