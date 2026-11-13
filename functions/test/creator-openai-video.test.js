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

const canvas=(segmentNumber,title)=>({segmentNumber,engine:'canvas',title,subtitle:'Convection',visual:'Show rising particles.',backgroundStyle:'blueprint',accentColor:'#42D6D0',motion:'rise',mapBasemap:'satellite',mapCenter:[0,0],mapEndCenter:[0,0],mapZoom:2,mapEndZoom:2,mapLabels:[],mapRoutes:[],assets:'',missingInfo:[]});
const map=(segmentNumber,title)=>({segmentNumber,engine:'map',title,subtitle:'Geography',visual:'Show the region on the map.',backgroundStyle:'plain',accentColor:'#E1C65B',motion:'hold',mapBasemap:'satellite',mapCenter:[78,18],mapEndCenter:[80,22],mapZoom:3.2,mapEndZoom:3.8,mapLabels:[{name:'India',position:[78,22],role:'primary'}],mapRoutes:[{name:'Illustrative monsoon wind',coordinates:[[55,-5],[72,8],[78,18]],color:'#65B7E6',arrowhead:true}],assets:'',missingInfo:[]});

test('builds real Map Editor scenes and retains Canvas only when requested',()=>{
 const transcript={duration:4,segments:[{id:'segment-1',start:0,end:2,text:'First.'},{id:'segment-2',start:2,end:4,text:'Second.'}]};
 const payload=buildPlan({scenes:[map(1,'Monsoon map'),canvas(2,'Air rises')]},transcript,'ITCZ');
 assert.equal(payload.analysis.scenes.length,2);assert.equal(payload.creatorStudio.scenes[1].timeline,'2.000-4.000s');assert.equal(payload.creatorStudio.scenes[0].mapAnimation.format,'invincible-map-animation');assert.equal(payload.creatorStudio.scenes[0].mapAnimation.layers[0].type,'route');assert.equal(payload.creatorStudio.scenes[1].canvasScene.title,'Air rises');assert.equal(payload.mapAnimations.length,1);
});

test('generated map plan passes the native Map Editor instruction validator',async()=>{
 const {readAnimation}=await import('../../creator/map-animation-import.js');
 const payload=buildPlan({scenes:[map(1,'Monsoon map')]},{duration:2,segments:[{id:'segment-1',start:0,end:2,text:'Monsoon.'}]},'ITCZ');
 assert.doesNotThrow(()=>readAnimation(payload.creatorStudio.scenes[0].mapAnimation));
});

test('rejects a plan that drops a timestamp',()=>{
 const transcript={segments:[{id:'a',start:0,end:1,text:'A'},{id:'b',start:1,end:2,text:'B'}]};
 assert.throws(()=>buildPlan({scenes:[canvas(1,'A')]},transcript,'x'),/expected 2, received 1/);
});
