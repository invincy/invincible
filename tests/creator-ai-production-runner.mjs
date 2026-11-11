import test from 'node:test';
import assert from 'node:assert/strict';
import {runAiProduction} from '../creator/ai-production-runner.mjs';

const base=()=>{
 const audio=new Blob([new Uint8Array([1,2,3])],{type:'audio/mpeg'});
 const plan={analysis:{valid:true,scenes:[]},creatorStudio:{scenes:[{id:'scene-1',mapAnimation:{format:'invincible-map-animation',version:1}}]}};
 const calls={tts:0,analysis:0,imports:0,saves:0,exports:0,checkpoint:null,audio:null};
 return {audio,plan,calls,options:{uid:'user-1',projectId:'project-1',title:'Panipat',script:'Panipat narration',creativeInstructions:'Cinematic',voiceRequest:{text:'Panipat narration',engine:'gemini'},loadCheckpoint:async()=>calls.checkpoint,loadAudio:async()=>calls.audio,saveCheckpoint:async(value,blob)=>{calls.checkpoint=value;calls.audio=blob;},generateVoiceover:async()=>{calls.tts++;return{mimeType:'audio/mpeg',audioBase64:btoa('ID3sample')};},analyzeVoiceover:async()=>{calls.analysis++;return plan;},importProduction:async()=>{calls.imports++;},saveVideo:async()=>{calls.saves++;},exportVideo:async()=>{calls.exports++;const bytes=new Uint8Array(32);bytes.set(new TextEncoder().encode('ftyp'),4);return new Blob([bytes],{type:'video/mp4'});}}};
};

test('blocks descriptive scenes honestly and preserves generated audio and plan for retry',async()=>{
 const t=base(),events=[];t.plan.creatorStudio.scenes[0].mapAnimation=null;t.plan.analysis.scenes=[{missingInfo:['verified route geometry']}];
 const result=await runAiProduction({...t.options,onProgress:event=>events.push(event.stage)});
 assert.equal(result.status,'blocked');assert.equal(t.calls.tts,1);assert.equal(t.calls.analysis,1);assert.equal(t.calls.imports,0);assert.equal(t.calls.exports,0);assert.equal(t.calls.checkpoint.stage,'plan-ready');assert.deepEqual(events,['voiceover','analysis']);
});

test('reuses completed voiceover and plan checkpoints, then validates the native MP4 result',async()=>{
 const t=base();const first=await runAiProduction(t.options);assert.equal(first.status,'completed');assert.equal(t.calls.tts,1);assert.equal(t.calls.analysis,1);assert.equal(t.calls.imports,1);assert.equal(t.calls.saves,1);assert.equal(t.calls.exports,1);assert.equal(t.calls.checkpoint.stage,'completed');
 const second=await runAiProduction(t.options);assert.equal(second.status,'completed');assert.equal(t.calls.tts,1);assert.equal(t.calls.analysis,1);assert.equal(t.calls.imports,2);assert.equal(t.calls.exports,2);
});

test('rejects unsupported provider outputs and missing identity before doing paid or local work',async()=>{
 const t=base();await assert.rejects(()=>runAiProduction({...t.options,uid:null}),/Sign in/);assert.equal(t.calls.tts,0);await assert.rejects(()=>runAiProduction({...t.options,generateVoiceover:async()=>({mimeType:'audio/wav',audioBase64:'AA=='})}),/did not return an MP3/);
});
