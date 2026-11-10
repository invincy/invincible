import test from 'node:test';
import assert from 'node:assert/strict';
import {validateManifest,compileTimeline,PRESETS,layerFrame} from '../creator/video-studio/model.js';
import {newStudioVideo,resizeScene} from '../creator/video-studio/composition.js';
import {emptyBattlefield,validateBattlefield,projectileAt} from '../creator/video-studio/battlefield.js';
import {mixAudioChunk,scheduleAudioTracks,audioTrimWithinSource} from '../creator/video-studio/audio.js';
import {drawCanvasBackground,drawCanvasLayer} from '../creator/video-studio/canvas.js';
import {studioBrief} from '../creator/video-studio/handoff.js';
const shot=()=>({id:'shot',from:[.2,.6],to:[.8,.4],launchSeconds:.5,flightSeconds:1,arcHeight:.2,radius:.006,color:'#ffbd65',impactSeconds:.4,impactRadius:.06});
const canvasScene=()=>({id:'science',startSeconds:0,durationSeconds:3,engineType:'graphic',engineData:{background:'#071b39',backgroundStyle:'blueprint',gridColor:'#6388a8',gridSpacing:48},overlays:[{id:'square',type:'rectangle',x:.3,y:.5,width:.2,height:.2,keyframes:[{timeSeconds:0,scale:0},{timeSeconds:1,scale:1}]},{id:'formula',type:'text',text:'a² + b² = c²',fontFamily:'Invincible Sans',fontSize:64,fontWeight:600,textAlign:'center'},{id:'arrow',type:'arrow',lineWidth:6},{id:'circle',type:'circle'}]});
test('complete Canvas plus battlefield plus sound JSON roundtrips without manual scene edits',()=>{
 const battle={id:'battle',startSeconds:3,durationSeconds:3,engineType:'battlefield',engineData:{...emptyBattlefield(),projectiles:[shot()]},overlays:[]};
 const m={...newStudioVideo(),scenes:[canvasScene(),battle],audioClips:[{id:'cannon',fileId:'existing-original',name:'Cannon',role:'effect',startSeconds:3.5,trimStart:0,durationSeconds:1,gain:.6,fadeIn:0,fadeOut:.1}]};
 const snapshot=JSON.stringify(m),out=validateManifest(snapshot);assert.deepEqual(out,m);assert.equal(compileTimeline(out,PRESETS[0]).duration,6);assert.equal(JSON.stringify(m),snapshot);assert.equal(layerFrame(out.scenes[0].overlays[0],.5).scale,.5);
});
test('unsupported canvas settings, missing background artwork and arbitrary fonts reject atomically',()=>{
 const m={...newStudioVideo(),scenes:[canvasScene()]},before=structuredClone(m);
 for(const change of [{backgroundStyle:'anything'},{gridSpacing:0},{backgroundStyle:'image'},{backgroundAssetId:'missing'},{script:'run()'}]){const bad=structuredClone(m);Object.assign(bad.scenes[0].engineData,change);assert.throws(()=>validateManifest(bad));}
 const bad=structuredClone(m);bad.scenes[0].overlays[1].fontFamily='unloaded-font';assert.throws(()=>validateManifest(bad));assert.deepEqual(m,before);
});
test('projectile launch, arc, arrival, impact and backward seeks are absolute and bounded',()=>{
 const p=shot();assert.equal(projectileAt(p,.4),null);assert.equal(projectileAt(p,.5).z,0);assert.equal(projectileAt(p,1).z,.2);assert.equal(projectileAt(p,1.5).phase,'impact');assert.equal(projectileAt(p,2),null);
 const first=projectileAt(p,1);for(const t of [1.8,0,2.5,1])projectileAt(p,t);assert.deepEqual(projectileAt(p,1),first);
 const bf={...emptyBattlefield(),projectiles:[p]};assert.equal(validateBattlefield(bf,3,new Set()),bf);assert.throws(()=>validateBattlefield({...bf,projectiles:[{...p,flightSeconds:3}]},3,new Set()));
 const s={id:'b',engineType:'battlefield',durationSeconds:3,engineData:bf,overlays:[]},resized=resizeScene(s,6);assert.equal(resized.engineData.projectiles[0].launchSeconds,1);assert.equal(resized.engineData.projectiles[0].flightSeconds,2);assert.equal(p.flightSeconds,1);
});
test('movement sound loops its original segment and keeps one envelope',()=>{
 const buffer={numberOfChannels:1,sampleRate:4,duration:1,getChannelData:()=>Float32Array.of(.2,.4,.6,.8)},clip={id:'steps',fileId:'steps',name:'Steps',role:'effect',startSeconds:.5,trimStart:0,durationSeconds:2,gain:1,fadeIn:0,fadeOut:0,loop:true,sourceDurationSeconds:.5};
 const actual=mixAudioChunk([{...clip,buffer}],0,12,4).data;assert.deepEqual(Array.from(actual).map(x=>+x.toFixed(2)),[0,0,.2,.4,.2,.4,.2,.4,.2,.4,0,0]);assert.equal(audioTrimWithinSource(clip,buffer),true);assert.equal(audioTrimWithinSource({...clip,trimStart:.9},buffer),false);
 const seam=mixAudioChunk([{...clip,startSeconds:0,buffer}],0,8,8).data;assert.deepEqual(Array.from(seam).map(x=>+x.toFixed(2)),[.2,.3,.4,.3,.2,.3,.4,.3]);
 const sources=[],context={currentTime:5,destination:{},createBufferSource(){const s={connect(){},disconnect(){},stop(){},start(...args){this.args=args;}};sources.push(s);return s;},createGain(){return {connect(){},disconnect(){},gain:{setValueAtTime(){},linearRampToValueAtTime(){}}};}};
 scheduleAudioTracks(context,[{...clip,buffer}],1.25);assert.equal(sources[0].loop,true);assert.equal(sources[0].loopEnd,.5);assert.deepEqual(sources[0].args,[5,.25,1.25]);
 const m={...newStudioVideo(),audioClips:[clip]};validateManifest(m);assert.throws(()=>validateManifest({...m,audioClips:[{...clip,role:'voiceover'}]}));assert.throws(()=>validateManifest({...m,audioClips:[{...clip,sourceDurationSeconds:0}]}));
});
test('blueprint grid is bounded and typography scales with the output short edge',()=>{
 const calls=[],ctx={canvas:{width:2160,height:3840},globalAlpha:1,save(){},restore(){},beginPath(){},moveTo(){},lineTo(){},stroke(){},translate(){},rotate(){},scale(){},fillText(...a){calls.push([this.font,...a]);}};
 drawCanvasBackground(ctx,{backgroundStyle:'blueprint',gridSpacing:48},new Map());drawCanvasLayer(ctx,{...canvasScene().overlays[1],x:.5,y:.5,scale:1,rotation:0,opacity:1},PRESETS[0],new Map());assert.match(calls[0][0],/128px/);assert.match(calls[0][0],/Invincible Sans/);assert.equal(ctx.globalAlpha,1);
});
test('copied AI brief documents background, projectile, font and repeating audio contracts',()=>{const brief=studioBrief(newStudioVideo());for(const name of ['backgroundStyle','projectiles','sourceDurationSeconds','fontFamily','not automatic collision detection'])assert.ok(brief.includes(name));});
