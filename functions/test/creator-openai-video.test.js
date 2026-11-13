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

const semantic=(sourceSegmentId,overrides={})=>({sourceSegmentId,engine:'canvas',sceneKind:'documentary-diagram',presetId:'documentary-diagram',title:'Air rises',visualIntent:'Show warm air rising in a restrained diagram.',labelTreatment:'title-plaque',cameraIntent:'slow-push',assetIds:[],locationId:'',routeId:'',emphasis:['definition'],missingInfo:[],...overrides});

test('builds the same semantic plan shape used by the local planner',()=>{
 const transcript={duration:4,segments:[{id:'segment-1',start:0,end:2,text:'First.'},{id:'segment-2',start:2,end:4,text:'Second.'}]};
 const payload=buildPlan({schemaVersion:'creator-semantic-plan-v1',scenes:[semantic('segment-1'),semantic('segment-2',{engine:'motion',sceneKind:'atmospheric-system',presetId:'pressure-driven-flow',title:'Monsoon flow',visualIntent:'Show pressure driving moist winds.',labelTreatment:'map-label',cameraIntent:'global-to-local',emphasis:['pressure','wind','moisture']})]},transcript,'ITCZ');
 assert.equal(payload.analysis.scenes.length,2);
 assert.equal(payload.creatorStudio.scenes[1].timeline,'2.000-4.000s');
 assert.equal(payload.creatorStudio.scenes[1].semanticPlan.presetId,'pressure-driven-flow');
 assert.equal(payload.creatorStudio.scenes[1].canvasScene.backgroundStyle,'blueprint');
 assert.equal(payload.mapAnimations.length,0);
});

test('rejects a semantic plan that drops a locked timestamp',()=>{
 const transcript={segments:[{id:'a',start:0,end:1,text:'A'},{id:'b',start:1,end:2,text:'B'}]};
 assert.throws(()=>buildPlan({schemaVersion:'creator-semantic-plan-v1',scenes:[semantic('a')]},transcript,'x'),/expected 2, received 1/);
});

test('rejects model-authored values outside the shared vocabulary',()=>{
 const transcript={segments:[{id:'a',start:0,end:1,text:'A'}]};
 assert.throws(()=>buildPlan({schemaVersion:'creator-semantic-plan-v1',scenes:[semantic('a',{presetId:'invented-panipat-preset'})]},transcript,'x'),/unsupported presetId/);
});
