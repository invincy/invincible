const test=require('node:test');
const assert=require('node:assert/strict');
const {buildPlan,projectCatalog}=require('../src/creator/openai-video-callables');

test('hosted Creator AI accepts locked timing only and has no audio transcription path',()=>{
 const source=require('node:fs').readFileSync(require.resolve('../src/creator/openai-video-callables'),'utf8');
 assert.doesNotMatch(source,/audio\.transcriptions|whisper-1|action==='transcribe'/);
 assert.match(source,/action==='plan'/);
});

const semantic=(sourceSegmentId,overrides={})=>({sourceSegmentId,engine:'canvas',sceneKind:'documentary-diagram',presetId:'documentary-diagram',title:'Air rises',visualIntent:'Show warm air rising in a restrained diagram.',labelTreatment:'title-plaque',cameraIntent:'slow-push',assetIds:[],locationId:'',routeId:'',historicalYear:0,regionId:'',polityNames:[],emphasis:['definition'],missingInfo:[],resourceRequests:[],clarifications:[],...overrides});

test('builds the same semantic plan shape used by the local planner',()=>{
 const transcript={duration:4,segments:[{id:'segment-1',start:0,end:2,text:'First.'},{id:'segment-2',start:2,end:4,text:'Second.'}]};
 const payload=buildPlan({schemaVersion:'creator-semantic-plan-v1',scenes:[semantic('segment-1'),semantic('segment-2',{engine:'motion',sceneKind:'atmospheric-system',presetId:'pressure-driven-flow',title:'Monsoon flow',visualIntent:'Show pressure driving moist winds.',labelTreatment:'map-label',cameraIntent:'global-to-local',emphasis:['pressure','wind','moisture']})]},transcript,'ITCZ');
 assert.equal(payload.analysis.scenes.length,2);
 assert.equal(payload.creatorStudio.scenes[1].timeline,'2.000-4.000s');
 assert.equal(payload.creatorStudio.scenes[1].semanticPlan.presetId,'pressure-driven-flow');
 assert.equal(payload.creatorStudio.scenes[1].canvasScene.backgroundStyle,'blueprint');
 assert.equal(payload.mapAnimations.length,0);
});

test('compiles ITCZ semantic choices into executable Map Editor animation',()=>{
 const transcript={duration:8.4,segments:[{id:'segment-1',start:0,end:5.36,text:'The ITCZ is a moving belt of low pressure near the Equator.'},{id:'segment-2',start:6.02,end:8.14,text:'It shifts north during the Indian summer.'}]};
 const catalog=projectCatalog({});
 const payload=buildPlan({schemaVersion:'creator-semantic-plan-v1',scenes:[
  semantic('segment-1',{engine:'map',sceneKind:'atmospheric-system',presetId:'pressure-driven-flow',title:'Intertropical Convergence Zone',visualIntent:'Show trade winds converging over the Equator.',labelTreatment:'map-label',cameraIntent:'global-to-local',locationId:'context-india-indian-ocean',emphasis:['geography','pressure','wind']}),
  semantic('segment-2',{engine:'map',sceneKind:'atmospheric-system',presetId:'shifting-zone',title:'Summer shift',visualIntent:'Show the convergence belt moving north toward India.',labelTreatment:'map-label',cameraIntent:'global-to-local',locationId:'context-india-indian-ocean',emphasis:['geography','pressure']})
 ]},transcript,'ITCZ',catalog);
 assert.equal(payload.mapAnimations.length,2);
 assert.equal(payload.creatorStudio.scenes[0].mapAnimation.basemap,'satellite');
 assert.ok(payload.creatorStudio.scenes[0].mapAnimation.layers.some(layer=>layer.id==='itcz-band'));
 assert.ok(payload.creatorStudio.scenes[0].mapAnimation.layers.some(layer=>layer.id==='itcz-band-glow'));
 assert.ok(payload.creatorStudio.scenes[0].mapAnimation.layers.find(layer=>layer.id==='itcz-band').coordinates.length>3);
 assert.ok(new Set(payload.creatorStudio.scenes[0].mapAnimation.layers.find(layer=>layer.id==='itcz-band').coordinates.map(point=>point[1])).size>2);
 assert.ok(payload.creatorStudio.scenes[0].mapAnimation.layers.filter(layer=>layer.arrowhead===true).length>=4);
 assert.ok(payload.creatorStudio.scenes[1].mapAnimation.layers.some(layer=>layer.id==='itcz-north'));
 assert.ok(payload.creatorStudio.scenes[1].mapAnimation.camera.at(-1).zoom>=4);
 assert.ok(payload.creatorStudio.scenes[0].mapAnimation.layers.find(layer=>layer.id==='itcz-label').fontSize>=48);
 assert.equal(payload.creatorStudio.scenes[0].canvasScene,null);
});

test('rejects a semantic plan that drops a locked timestamp',()=>{
 const transcript={segments:[{id:'a',start:0,end:1,text:'A'},{id:'b',start:1,end:2,text:'B'}]};
 assert.throws(()=>buildPlan({schemaVersion:'creator-semantic-plan-v1',scenes:[semantic('a')]},transcript,'x'),/expected 2, received 1/);
});

test('rejects model-authored values outside the shared vocabulary',()=>{
 const transcript={segments:[{id:'a',start:0,end:1,text:'A'}]};
 assert.throws(()=>buildPlan({schemaVersion:'creator-semantic-plan-v1',scenes:[semantic('a',{presetId:'invented-panipat-preset'})]},transcript,'x'),/unsupported presetId/);
});

test('preserves dated historical resource requests without inventing renderer geometry',()=>{
 const transcript={segments:[{id:'segment-1',start:0,end:3,text:'In 1526, the Lodi Dynasty controlled Delhi.'}]};
 const plan=semantic('segment-1',{engine:'map',sceneKind:'historical-context',presetId:'historical-year-map',title:'North India · 1526',visualIntent:'Establish the dated political context around Delhi.',labelTreatment:'map-label',cameraIntent:'global-to-local',historicalYear:1526,regionId:'south-asia',polityNames:['Lodi Dynasty'],emphasis:['geography','polity'],resourceRequests:[{type:'historical-territory',query:'Lodi Dynasty in 1526',importance:'required-factual',fallback:'dated-location-context'}],clarifications:[{question:'Should adjacent polities be shown? ',default:'Show only narration-relevant polities.',reason:'Avoids implying claims beyond the narration.'}]});
 const payload=buildPlan({schemaVersion:'creator-semantic-plan-v1',scenes:[plan]},transcript,'Panipat');
 assert.equal(payload.analysis.scenes[0].semanticPlan.historicalYear,1526);
 assert.deepEqual(payload.analysis.scenes[0].semanticPlan.polityNames,['Lodi Dynasty']);
 assert.equal(payload.analysis.scenes[0].semanticPlan.resourceRequests[0].fallback,'dated-location-context');
 assert.equal(payload.analysis.scenes[0].mapAnimation,null);
});

test('reuses project assets, verified places and reviewed routes in the hosted planner catalog',()=>{
 const catalog=projectCatalog({assets:[{id:'babur','name':'Babur portrait',type:'image',description:'Reviewed illustration'}],historicalMap:{visual:{assets:[{id:'army-model',name:'Army model',type:'glb',credit:'Internal'}]},events:[{id:'panipat',label:'Panipat',coordinates:[76.96,29.39],sourceUrl:'https://example.org/place',date:'1526',sourceNote:'Approximate'}],features:{features:[{geometry:{type:'LineString',coordinates:[[70,30],[77,29]]},properties:{id:'babur-route',label:'Babur route',reviewed:true,sourceUrl:'https://example.org/route'}},{geometry:{type:'LineString',coordinates:[[1,1],[2,2]]},properties:{id:'draft-route',label:'Draft',reviewed:false}}]}}});
 assert.deepEqual(catalog.assets.map(item=>item.id),['babur','army-model']);
 assert.deepEqual(catalog.locations.map(item=>item.id),['context-global-equator','context-india-indian-ocean','context-south-asia','panipat']);
 assert.deepEqual(catalog.routes.map(item=>item.id),['babur-route']);
});
