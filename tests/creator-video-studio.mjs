import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyVideo,PRESETS,validateManifest,validateBrand,compileTimeline,layerFrame,sceneAt,exportDimensions,assetsForBrand} from '../creator/video-studio/model.js';
import {audioChunk} from '../creator/video-studio/audio.js';
import {encodeStudioVideo} from '../creator/video-studio/export.js';
const graphic=(id,start=0,duration=2)=>({id,startSeconds:start,durationSeconds:duration,engineType:'graphic',engineData:{},overlays:[]});
const video=()=>({...emptyVideo(),scenes:[graphic('one'),graphic('two',2)]});
test('portrait defaults and exported dimensions reuse the existing map contract',()=>{assert.equal(emptyVideo().aspectRatio,'9:16');assert.deepEqual(exportDimensions('9:16'),{width:1080,height:1920});assert.deepEqual(exportDimensions('16:9'),{width:1920,height:1080});});
test('import is atomic, bounded, cloned and rejects executable/unknown schema fields',()=>{
 const m=video(),snapshot=structuredClone(m),out=validateManifest(JSON.stringify(m));out.scenes[0].id='changed';assert.deepEqual(m,snapshot);
 for(const bad of ['{',JSON.stringify({...m,script:'alert(1)'}),JSON.stringify({...m,fps:60}),JSON.stringify({...m,schemaVersion:2})])assert.throws(()=>validateManifest(bad));
 assert.throws(()=>validateManifest({...m,title:'x'.repeat(1000001)}));
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
