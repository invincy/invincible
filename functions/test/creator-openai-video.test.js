const test=require('node:test');
const assert=require('node:assert/strict');
const {normalizeTranscript,buildPlan}=require('../src/creator/openai-video-callables');

test('normalizes hosted transcription timestamps',()=>{
 const transcript=normalizeTranscript({text:'Warm air rises.',language:'en',duration:2,segments:[{start:0,end:2,text:' Warm air rises. '}],words:[{word:'Warm',start:0,end:.4},{word:'air',start:.5,end:.8},{word:'rises.',start:1,end:2}]});
 assert.equal(transcript.segments[0].id,'segment-1');assert.equal(transcript.segments[0].words.length,3);assert.equal(transcript.duration,2);
});
test('extends the final locked segment through trailing MP3 silence',()=>{
 const transcript=normalizeTranscript({text:'Done.',language:'en',duration:2.5,segments:[{start:0,end:2,text:'Done.'}],words:[]});assert.equal(transcript.segments[0].end,2.5);
});

test('builds one editable canvas scene for every locked segment',()=>{
 const transcript={duration:4,segments:[{id:'segment-1',start:0,end:2,text:'First.'},{id:'segment-2',start:2,end:4,text:'Second.'}]};
 const payload=buildPlan({scenes:[{segmentNumber:1,title:'Air rises',subtitle:'Convection',visual:'Show rising particles.',backgroundStyle:'blueprint',accentColor:'#42D6D0',motion:'rise',assets:'',missingInfo:[]},{segmentNumber:2,title:'Cloud belt',subtitle:'ITCZ',visual:'Reveal a cloud band.',backgroundStyle:'grid',accentColor:'#E1C65B',motion:'zoom-in',assets:'',missingInfo:[]}]},transcript,'ITCZ');
 assert.equal(payload.analysis.scenes.length,2);assert.equal(payload.creatorStudio.scenes[1].timeline,'2.000-4.000s');assert.equal(payload.creatorStudio.scenes[0].canvasScene.title,'Air rises');
});

test('rejects a plan that drops a timestamp',()=>{
 const transcript={segments:[{id:'a',start:0,end:1,text:'A'},{id:'b',start:1,end:2,text:'B'}]};
 assert.throws(()=>buildPlan({scenes:[{segmentNumber:1}]},transcript,'x'),/expected 2, received 1/);
});
