import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyVideo,PRESETS,validateManifest,validateBrand,compileTimeline,layerFrame,sceneAt,exportDimensions,assetsForBrand} from '../creator/video-studio/model.js';
import {DEFAULT_PARALLAX,parallaxTransform,projectLayer,trainTemplate} from '../creator/video-studio/parallax.js';
import {audioChunk} from '../creator/video-studio/audio.js';
import {encodeStudioVideo} from '../creator/video-studio/export.js';
import {compileAiStoryboardManifest} from '../creator/ai-preview.js';
import {createStartingVoiceoverManifest} from '../creator/media-library.js';
const graphic=(id,start=0,duration=2)=>({id,startSeconds:start,durationSeconds:duration,engineType:'graphic',engineData:{},overlays:[]});
const video=()=>({...emptyVideo(),scenes:[graphic('one'),graphic('two',2)]});
test('portrait defaults and exported dimensions reuse the existing map contract',()=>{assert.equal(emptyVideo().aspectRatio,'9:16');assert.deepEqual(exportDimensions('9:16'),{width:1080,height:1920});assert.deepEqual(exportDimensions('16:9'),{width:1920,height:1080});});
test('simple project creation attaches its uploaded voiceover to a valid existing Studio draft',()=>{
 const manifest=createStartingVoiceoverManifest({title:'New film',asset:{id:'cloud-'+'a'.repeat(64),name:'narration.mp3'},duration:42.5,clipId:'voice-1'}),valid=validateManifest(manifest);
 assert.equal(valid.title,'New film');assert.equal(valid.audioClips[0].role,'voiceover');assert.equal(valid.audioClips[0].durationSeconds,42.5);assert.equal(valid.scenes.length,0);
 assert.throws(()=>createStartingVoiceoverManifest({title:'Too long',asset:{id:'voice',name:'voice.wav'},duration:601,clipId:'voice-2'}),/10 minutes/);
});
test('AI storyboard compiles to one timestamped Video Studio v2 manifest with its original audio reference',()=>{
 const mapAnimation={format:'invincible-map-animation',version:1,title:'Panipat label',duration:3,aspectRatio:'9:16',basemap:'terrain',terrain:false,overlayPreset:'documentary',camera:[{time:0,center:[76.96,29.39],zoom:4.9,pitch:0,bearing:0,easing:'smooth'},{time:3,center:[76.96,29.39],zoom:5.2,pitch:0,bearing:0,easing:'smooth'}],assets:[],layers:[{id:'panipat',type:'label',name:'Panipat',start:0,end:3,position:[76.96,29.39],color:'#F4F5F7',scale:1}]};
 const manifest=compileAiStoryboardManifest([{id:'scene-1',timeline:'0.000-3.000s',visual:'Panipat',mapAnimation}],{audioFileId:'voice-file',audioName:'voiceover.mp3',audioDuration:3});
 assert.equal(manifest.schemaVersion,2);assert.equal(manifest.scenes[0].startSeconds,0);assert.equal(manifest.scenes[0].durationSeconds,3);assert.equal(manifest.audioClips[0].fileId,'voice-file');assert.equal(manifest.audioClips[0].durationSeconds,3);
 assert.throws(()=>compileAiStoryboardManifest([{id:'scene-1',timeline:'0.2-3s',visual:'Panipat',mapAnimation}],{audioFileId:'voice-file',audioDuration:3}),/timeline gap/);
 assert.throws(()=>compileAiStoryboardManifest([{id:'scene-1',timeline:'0-3s',visual:'Panipat',mapAnimation}],{audioFileId:'voice-file',audioDuration:4}),/final timestamp differs/);
});
test('import is atomic, bounded, cloned and rejects executable/unknown schema fields',()=>{
 const m=video(),snapshot=structuredClone(m),out=validateManifest(JSON.stringify(m));out.scenes[0].id='changed';assert.deepEqual(m,snapshot);
 for(const bad of ['{',JSON.stringify({...m,script:'alert(1)'}),JSON.stringify({...m,fps:60}),JSON.stringify({...m,schemaVersion:2})])assert.throws(()=>validateManifest(bad));
 assert.throws(()=>validateManifest({...m,title:'x'.repeat(1000001)}));
});
test('one-click production can keep original narration timing with a context card and silence gaps',()=>{
 const rows=[{id:'missing',timeline:'0.3-2s',contextCard:true}];
 const manifest=compileAiStoryboardManifest(rows,{allowContextCards:true,audioFileId:'voice-file',audioDuration:2.5});
 assert.equal(manifest.scenes[0].engineType,'graphic');
 assert.equal(manifest.scenes[0].startSeconds,.3);
 assert.equal(manifest.audioClips[0].durationSeconds,2.5);
 assert.throws(()=>compileAiStoryboardManifest(rows),/timeline gap/);
});
test('OpenAI scene plans become editable Canvas scenes without changing locked timing',()=>{
 const rows=[{id:'scene-1',timeline:'0.000-2.000s',visual:'Rising air',canvasScene:{title:'Warm air rises',subtitle:'Low pressure forms',visual:'Particles rise above the Equator',backgroundStyle:'blueprint',accentColor:'#42D6D0',motion:'rise'}}];
 const manifest=compileAiStoryboardManifest(rows,{audioFileId:'voice-file',audioDuration:2});
 assert.equal(manifest.scenes[0].engineType,'graphic');assert.equal(manifest.scenes[0].durationSeconds,2);assert.equal(manifest.scenes[0].overlays.find(layer=>layer.id==='title').text,'Warm air rises');assert.equal(manifest.audioClips[0].durationSeconds,2);
 assert.deepEqual(manifest.scenes[0].overlays.slice(0,4).map(layer=>layer.id),['frame-top','frame-bottom','frame-left','frame-right']);
});
test('reference-film semantic presets compile to editable visual primitives instead of generic cards',()=>{
 const row={id:'monsoon-flow',timeline:'0-4s',visual:'Pressure drives the monsoon',canvasScene:{title:'HOW MONSOON WINDS FORM',visual:'High pressure drives moist air toward seasonal low pressure.',backgroundStyle:'blueprint',accentColor:'#65B7E6',motion:'zoom-in',presetId:'pressure-driven-flow'}};
 const manifest=compileAiStoryboardManifest([row]);const overlays=manifest.scenes[0].overlays;
 assert.ok(overlays.some(layer=>layer.id==='high-zone'&&layer.type==='circle'));
 assert.ok(overlays.some(layer=>layer.id==='low-zone'&&layer.type==='circle'));
 assert.equal(overlays.filter(layer=>layer.type==='arrow').length,3);
 assert.doesNotThrow(()=>validateManifest(manifest));
});
test('scene order, overlap, duration, duplicate IDs and nonfinite timing are rejected',()=>{
 for(const scenes of [[graphic('a',0,3),graphic('b',2)],[graphic('a'),graphic('a',2)],[graphic('a',0,0)],[graphic('a',599,2)],[graphic('a',NaN)]])assert.throws(()=>validateManifest({...emptyVideo(),scenes}));
});
test('timeline handles exact scene boundaries and gaps deterministically',()=>{
 const t=compileTimeline({...video(),scenes:[graphic('a'),graphic('b',3)]},PRESETS[0]);assert.equal(sceneAt(t,0).id,'a');assert.equal(sceneAt(t,2),undefined);assert.equal(sceneAt(t,3).id,'b');assert.equal(t.duration,5);
});
test('branding is opt-in; enabling intro shifts scenes and audio, outro follows full recording',()=>{
 const b={...PRESETS[0],intro:graphic('intro',0,2),outro:graphic('outro',0,3)},m={...video(),audio:{fileId:'f',name:'audio.wav',startSeconds:.5,gain:1}};
 const plain=compileTimeline(m,b,8);assert.equal(plain.scenes.length,2);assert.equal(plain.audioStart,.5);assert.equal(plain.duration,8.5);
 const branded=compileTimeline({...m,introEnabled:true,outroEnabled:true},b,8);assert.equal(branded.scenes[1].startSeconds,2);assert.equal(branded.audioStart,2.5);assert.equal(branded.scenes.at(-1).startSeconds,10.5);assert.equal(branded.duration,13.5);
 assert.throws(()=>compileTimeline({...m,audio:{...m.audio,startSeconds:599}},b,8));
});
test('frame rounding extends to the next frame without dropping final narration samples',()=>{const m={...emptyVideo(),audio:{fileId:'a',name:'a',startSeconds:0,gain:1}};assert.equal(compileTimeline(m,PRESETS[0],1.001).duration,31/30);});
test('keyframe interpolation is per property and supports smooth, hold and endpoint poses',()=>{
 const l={x:.2,keyframes:[{timeSeconds:0,x:0,opacity:0,easing:'smooth'},{timeSeconds:2,x:1,opacity:1}]};assert.equal(layerFrame(l,1).x,.5);assert.equal(layerFrame(l,2).opacity,1);assert.equal(layerFrame(l,3).x,1);
 assert.equal(layerFrame({keyframes:[{timeSeconds:0,x:0,easing:'hold'},{timeSeconds:2,x:1}]},1).x,0);
 assert.equal(layerFrame({keyframes:[{timeSeconds:1,y:.8},{timeSeconds:3,x:.9}]},3).y,.8);
});
test('layer references, keyframes and fade bounds are validated before import',()=>{
 const m=video();m.scenes[0].overlays=[{id:'img',type:'image',assetId:'missing'}];assert.throws(()=>validateManifest(m));
 m.scenes[0].overlays=[{id:'text',type:'text',text:'Hello',keyframes:[{timeSeconds:1,x:.2},{timeSeconds:1,x:.3}]}];assert.throws(()=>validateManifest(m));
 m.scenes[0].overlays=[];m.scenes[0].transition={type:'fade',durationSeconds:1.1};assert.throws(()=>validateManifest(m));
});
test('asset URLs must be HTTPS; original local file references and map library IDs are distinct',()=>{
 const m=video();for(const url of ['javascript:alert(1)','http://example.com/a.png','https://user:pass@example.com/a.png'])assert.throws(()=>validateManifest({...m,assets:[{id:'a',name:'a',url}]}));
 assert.throws(()=>validateManifest({...m,assets:[{id:'a',name:'a',url:'https://example.com/a',fileId:'x'}]}));
 assert.throws(()=>validateManifest({...m,assets:[{id:'a',name:'a',libraryId:'private'}]}));
 assert.equal(validateManifest({...m,assets:[{id:'a',name:'a',libraryId:'private'}]},{mapAssets:[{id:'private',type:'image'}]}).assets[0].libraryId,'private');
});
test('brand templates are graphics only, configurable and do not alter default presets',()=>{
 const b=structuredClone(PRESETS[0]);b.intro=graphic('intro');assert.deepEqual(validateBrand(b),b);assert.equal(PRESETS[0].intro,null);
 assert.throws(()=>validateBrand({...b,logoAssetId:'missing'}));assert.throws(()=>validateBrand({...b,background:'red'}));assert.throws(()=>validateBrand({...b,intro:{...b.intro,engineType:'lic'}}));
});
test('LIC engine requires sourced explicit values and never derives policy benefits',()=>{
 const m=video();m.scenes=[{...graphic('policy'),engineType:'lic',engineData:{title:'Synthetic fixture',source:'TEST ONLY — not a policy quote',points:[{timeSeconds:0,year:1,label:'Pay',premium:100},{timeSeconds:1,year:2,label:'Payout',income:50}]}}];assert.equal(validateManifest(m).scenes[0].engineData.points[1].income,50);
 assert.throws(()=>validateManifest({...m,scenes:[{...m.scenes[0],engineData:{...m.scenes[0].engineData,source:''}}]}));
});
test('map instructions compile on an isolated draft, preserving native geometry review checks',()=>{
 const animation={format:'invincible-map-animation',version:1,duration:2,aspectRatio:'9:16',basemap:'physical',terrain:false,camera:[{time:0,center:[73,28],zoom:4,pitch:0,bearing:0}],layers:[]};
 const m={...video(),scenes:[{...graphic('map'),engineType:'map',engineData:{animation}}]},before=structuredClone(m);validateManifest(m);assert.deepEqual(m,before);
 assert.throws(()=>validateManifest({...m,scenes:[{...m.scenes[0],durationSeconds:3}]}));
 animation.layers=[{id:'border',type:'highlight',start:0,end:2,geometry:{type:'Polygon',coordinates:[[[0,0],[1,0],[1,1],[0,0]]]},source:{url:'https://example.com/source',date:'2000',note:'synthetic'}}];assert.throws(()=>validateManifest(m),/Review/);
});
test('audio chunks add exact leading silence, apply gain and preserve channel alignment',()=>{
 const source={numberOfChannels:2,sampleRate:4,getChannelData:c=>Float32Array.from(c?[1,.5,0,-.5]:[.5,1,-1,0])};
 const {data,channels}=audioChunk(source,.5,.5,0,8,4);assert.equal(channels,2);assert.deepEqual(Array.from(data.slice(0,8)),[0,0,.25,.5,-.5,0,0,0]);assert.deepEqual(Array.from(data.slice(8)),[0,0,.5,.25,0,-.25,0,0]);
});
test('audio resampling uses timeline seconds, including nonzero chunk starts',()=>{
 const b={numberOfChannels:1,sampleRate:2,getChannelData:()=>Float32Array.of(0,1,0,-1)};
 assert.deepEqual(Array.from(audioChunk(b,0,1,1,3,4).data),[.5,1,.5]);
});
test('unsupported MP4 capability fails explicitly instead of exporting silent media',async()=>{await assert.rejects(encodeStudioVideo({canvas:{},timeline:{duration:2}}),/WebCodecs/);});

test('reusable profiles carry only referenced logo/template assets into a new video',()=>{
 const b={...PRESETS[0],logoAssetId:'logo',intro:{...graphic('intro'),overlays:[{id:'image',type:'image',assetId:'intro-art'}]}},catalog=[{id:'logo',fileId:'original-logo'},{id:'intro-art',fileId:'original-intro'},{id:'unrelated',fileId:'other'}];
 const prior=[{id:'existing',url:'https://example.com/a.png'}],result=assetsForBrand(b,prior,catalog);
 assert.deepEqual(result.map(a=>a.id),['existing','logo','intro-art']);assert.equal(prior.length,1);assert.deepEqual(assetsForBrand(b,result,catalog),result);assert.equal(result[1].fileId,'original-logo');
});

test('2.5D train JSON round-trips with deterministic camera and pinned overlays',()=>{
 const scene={...graphic('train',0,5),engineData:{parallax:{...DEFAULT_PARALLAX}},overlays:trainTemplate(5)};
 const manifest={...emptyVideo(),scenes:[scene]};
 assert.deepEqual(validateManifest(JSON.stringify(manifest)),manifest);
 const pose=layerFrame(scene.overlays[0],0);
 const project=(depth,time)=>projectLayer(pose,parallaxTransform(DEFAULT_PARALLAX,depth,time,5));
 assert.deepEqual(project(1,0),pose);
 assert.deepEqual(project(0,4),pose);
 assert.ok(project(1,5).x<project(.2,5).x);
 assert.ok(project(1,5).scale>project(.2,5).scale);
 assert.equal(project(.5,2.5).scale,1.02);
 scene.overlays[0].depth=1.1;
 assert.throws(()=>validateManifest(manifest),/layer depth/);
 scene.overlays[0].depth=0;
 scene.engineData.parallax.zoom=0;
 assert.throws(()=>validateManifest(manifest),/camera pan/);
});

test('3D stage survives JSON import and timeline resize with typed model references',async()=>{
 const {trainStage,modelMotion,stagePose}=await import('../creator/video-studio/three-scene.js');
 const {arrangeScenes,resizeScene,newStudioVideo}=await import('../creator/video-studio/composition.js');
 const engineData=trainStage();
 engineData.models.push(modelMotion('imported',{assetId:'rocket'}));
 const manifest={...newStudioVideo(),assets:[{id:'rocket',name:'Rocket.glb',fileId:'cloud-rocket',kind:'glb'}]};
 const scene={...graphic('stage',0,5),engineType:'three',engineData};
 const imported=validateManifest(JSON.stringify(arrangeScenes(manifest,[scene])));
 assert.deepEqual(imported.scenes[0],scene);
 assert.equal(stagePose(engineData.models[0],2.5,5).x,0);
 assert.equal(stagePose(engineData.camera,5,5).tilt,42);
 assert.equal(stagePose(engineData.camera,3,resizeScene(scene,3).durationSeconds).tilt,42);
 assert.throws(()=>arrangeScenes({...manifest,assets:[]},[scene]),/registered GLB/);
 assert.throws(()=>arrangeScenes(manifest,[{...scene,overlays:[{id:'bad',type:'image',assetId:'rocket'}]}]),/missing asset/);
 assert.throws(()=>arrangeScenes(manifest,[{...scene,engineData:{...engineData,camera:{...engineData.camera,to:{...engineData.camera.to,tilt:90}}}}]),/Camera tilt/);
});

test('lightweight GLB checks reject oversized meshes, external data and cyclic nodes',async()=>{
 const {checkStudioGlb}=await import('../creator/video-studio/three-scene.js');
 function glb(data){
  const json=Buffer.from(JSON.stringify(data));
  const length=Math.ceil(json.length/4)*4,bytes=Buffer.alloc(20+length,32);
  [0x46546c67,2,bytes.length,length,0x4e4f534a].forEach((n,i)=>bytes.writeUInt32LE(n,i*4));
  json.copy(bytes,20);
  return Uint8Array.from(bytes).buffer;
 }
 const model={buffers:[{byteLength:48}],nodes:[{mesh:0}],meshes:[{primitives:[{attributes:{POSITION:0}}]}],accessors:[{count:6}]};
 assert.equal(checkStudioGlb(glb(model)),2);
 assert.throws(()=>checkStudioGlb(glb({...model,buffers:[{uri:'https://example.com/model.bin'}]})),/embedded/);
 assert.throws(()=>checkStudioGlb(glb({...model,accessors:[{count:60003}]})),/budget/);
 assert.throws(()=>checkStudioGlb(glb({...model,nodes:[{mesh:0,children:[0]}]})),/cycle/);
});
