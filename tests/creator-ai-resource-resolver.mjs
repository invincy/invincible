import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {matchHistoricalRecords,resolveCreatorPlanResources} from '../creator/ai-resource-resolver.js';

const records=JSON.parse(await fs.readFile(new URL('../creator/history-data/cliopatria-south-asia-v021.json',import.meta.url),'utf8')).records;
const semanticPlan={sourceSegmentId:'segment-1',engine:'map',sceneKind:'historical-context',presetId:'historical-year-map',title:'North India · 1526',visualIntent:'Establish the dated political context.',labelTreatment:'map-label',cameraIntent:'global-to-local',assetIds:[],locationId:'',routeId:'',historicalYear:1526,regionId:'south-asia',polityNames:['Lodi Dynasty'],emphasis:['geography','polity'],missingInfo:[],resourceRequests:[{type:'historical-territory',query:'Lodi Dynasty in 1526',importance:'required-factual',fallback:'dated-location-context'},{type:'portrait',query:'Ibrahim Lodi',importance:'optional',fallback:'name-card'}],clarifications:[{question:'Show adjacent polities?',default:'Only when narrated.',reason:'Keeps claims narrow.'}]};

test('matches a named dated polity without broadening to every active territory',()=>{
 const matches=matchHistoricalRecords(records,{year:1526,names:['Lodi Dynasty']});
 assert.deepEqual(matches.map(row=>row.name),['Lodi Dynasty']);
 assert.equal(matchHistoricalRecords(records,{year:1526,names:[]}).length,0);
});

test('resolves a historical semantic plan into a safe locator and actionable resource review',()=>{
 const scene={id:'scene-1',durationSeconds:6,voiceoverTimestamp:'0.000-6.000s',visual:'North India in 1526',missingInfo:[],mapAnimation:null,semanticPlan};
 const payload={analysis:{scenes:[scene]},creatorStudio:{scenes:[{...scene}]},mapAnimations:[]};
 const resolved=resolveCreatorPlanResources(payload,{territoryRecords:records,availableAssets:[]});
 const result=resolved.analysis.scenes[0];
 assert.equal(result.mapAnimation.layers[0].name,'Lodi Dynasty · approximate extent');
 assert.ok(result.mapAnimation.layers.every(layer=>layer.type==='label'));
 assert.deepEqual(result.resourceResolutions.map(item=>item.status),['review','missing']);
 assert.deepEqual(result.resourceResolutions.map(item=>item.action),['map','assets']);
 assert.equal(result.clarifications[0].default,'Only when narrated.');
 assert.equal(resolved.creatorStudio.scenes[0].mapAnimation.title,'North India in 1526');
 assert.equal(resolved.mapAnimations.length,1);
});

test('keeps a missing historical resource editable instead of dropping the scene',()=>{
 const missing={...semanticPlan,polityNames:['Unlisted Polity'],resourceRequests:[]};
 const scene={id:'scene-1',durationSeconds:4,visual:'Unknown context',missingInfo:[],mapAnimation:null,semanticPlan:missing};
 const resolved=resolveCreatorPlanResources({analysis:{scenes:[scene]},creatorStudio:{scenes:[{...scene}]}},{territoryRecords:records,availableAssets:[]});
 assert.equal(resolved.analysis.scenes.length,1);
 assert.equal(resolved.analysis.scenes[0].mapAnimation,null);
 assert.equal(resolved.analysis.scenes[0].resourceResolutions[0].status,'missing');
 assert.equal(resolved.analysis.scenes[0].resourceResolutions[0].fallback,'dated-location-context');
});
