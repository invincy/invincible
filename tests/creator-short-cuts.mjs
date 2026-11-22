import test from 'node:test';
import assert from 'node:assert/strict';
import {createShortManifest} from '../creator/video-studio/short-manifest.js';
import {validateManifest,layerFrame} from '../creator/video-studio/model.js';
import {cutAudio} from '../creator/video-studio/short-cuts.js';
import {mixAudioChunk} from '../creator/video-studio/audio.js';
const scene=(id,start)=>({id,startSeconds:start,durationSeconds:2,engineType:'graphic',engineData:{},overlays:[{id:'label',type:'text',text:id,keyframes:[{timeSeconds:0,x:.2},{timeSeconds:2,x:.8}]}]});
const recording={id:'voice',fileId:'original',name:'Narration',role:'voiceover',startSeconds:0,trimStart:1,durationSeconds:8,gain:1,fadeIn:0,fadeOut:0};
const master=()=>({schemaVersion:2,title:'Long film',aspectRatio:'16:9',fps:30,brandPresetId:'adichimp',audio:null,audioClips:[recording],scenes:[scene('a',0),scene('b',2),scene('c',4),scene('d',6)],assets:[]});
const cut={id:'short-1',title:'Why high voltage?',hook:'One independent question',firstSceneId:'b',lastSceneId:'c'};
test('portrait cut shares stable scenes, source files and local animation clocks without changing master',()=>{
 const source=master();source.shortCuts=[cut];const before=structuredClone(source),out=createShortManifest(source,cut);
 assert.deepEqual(source,before);assert.equal(out.aspectRatio,'9:16');assert.equal(out.shortCuts,undefined);
 assert.deepEqual(out.scenes.map(s=>[s.id,s.startSeconds]),[['b',0],['c',2]]);
 assert.deepEqual(out.scenes[0].overlays,source.scenes[1].overlays);
 assert.deepEqual(layerFrame(out.scenes[0].overlays[0],.7),layerFrame(source.scenes[1].overlays[0],.7));
 assert.equal(out.audioClips[0].fileId,'original');assert.equal(out.audioClips[0].trimStart,3);assert.equal(out.audioClips[0].durationSeconds,4);
 assert.equal(out.introEnabled,false);assert.equal(out.outroEnabled,false);
});
test('source gaps, local sounds and media offsets remain aligned',()=>{
 const source=master();source.scenes[2].startSeconds=4.4;source.scenes[3].startSeconds=6.4;
 source.scenes[1].audioClips=[{...recording,id:'cue',role:'effect',startSeconds:.5,durationSeconds:1}];
 source.scenes[1].engineType='video';source.assets=[{id:'film',name:'Film',fileId:'film-original'}];source.scenes[1].engineData={assetId:'film',fit:'contain',trimStart:12};
 const out=createShortManifest(source,cut);assert.ok(Math.abs(out.scenes[1].startSeconds-2.4)<1e-9);assert.equal(out.scenes[0].engineData.trimStart,12);
 assert.equal(out.scenes[0].audioClips,undefined);assert.equal(out.audioClips.find(c=>c.role==='effect').startSeconds,.5);
});
test('voiceover samples and loop phase match the same source interval at a loop boundary',()=>{
 const buffer={sampleRate:10,numberOfChannels:1,getChannelData:()=>Float32Array.from({length:100},(_,i)=>i/100)};
 const source={...recording,buffer,gain:.1},loop={...source,id:'music',role:'music',loop:true,sourceDurationSeconds:1.7,trimStart:.2};
 const out=cutAudio([source,loop],3.4,6.9).map(c=>({...c,buffer}));
 const expected=mixAudioChunk([source,loop],34,35,10),actual=mixAudioChunk(out,0,35,10);
 actual.data.forEach((sample,i)=>assert.ok(Math.abs(sample-expected.data[i])<1e-6));
});
test('legacy voiceover upgrades with measured duration and never changes speed',()=>{
 const source=master();source.schemaVersion=1;delete source.audioClips;source.audio={fileId:'mp3',name:'Final MP3',startSeconds:0,gain:1};
 assert.throws(()=>createShortManifest(source,cut),/original recording/);
 const out=createShortManifest(source,cut,{audioDuration:8});assert.equal(out.schemaVersion,2);assert.equal(out.audioClips[0].trimStart,2);
});
test('invalid or stale scene cuts cannot silently export a different passage',()=>{
 for(const changed of [{firstSceneId:'missing'},{lastSceneId:'a'},{title:''}])assert.throws(()=>createShortManifest(master(),{...cut,...changed}));
 const source=master();source.shortCuts=[cut,{...cut}];assert.throws(()=>validateManifest(source),/Duplicate Short/);
 source.shortCuts=[{...cut,script:'unexpected'}];assert.throws(()=>validateManifest(source),/fields/);
 const long=master();long.scenes=[{...scene('a',0),durationSeconds:181,overlays:[]}];assert.throws(()=>createShortManifest(long,{...cut,firstSceneId:'a',lastSceneId:'a'}),/three minutes/);
 assert.throws(()=>cutAudio([{...recording,fadeIn:3}],2,6),/fade/);
});
