const {onCall,HttpsError}=require('firebase-functions/v2/https');
const {defineSecret,defineString}=require('firebase-functions/params');
const {getFirestore}=require('firebase-admin/firestore');
const OpenAI=require('openai');
const {assertAccess}=require('./access');
const {plannerSchemaForRequest,normalizeSemanticPlan,buildSemanticPlannerPrompt,semanticCanvasScene,compileSemanticMap,geographyLocations}=require('./semantic-plan');

const openAiApiKey=defineSecret('OPENAI_API_KEY');
const aiModel=defineString('OPENAI_MODEL',{default:'gpt-5.6'});
const options={region:'asia-south1',timeoutSeconds:300,memory:'1GiB',maxInstances:2,secrets:[openAiApiKey]};
const id=value=>{if(typeof value!=='string'||!/^[a-zA-Z0-9_-]{1,100}$/.test(value))throw Error('Invalid project ID.');return value;};
const clean=(value,max=12000)=>String(value||'').trim().slice(0,max);

async function access(request){
 if(!request.auth)throw new HttpsError('unauthenticated','Sign in first.');
 const snap=await getFirestore().collection('creatorProjects').doc(id(request.data?.projectId)).get();
 const project=snap.exists?snap.data():null;assertAccess(request.auth,project);return project;
}
function guarded(fn){return async request=>{try{const project=await access(request);return await fn(request.data||{},{project});}catch(error){if(error instanceof HttpsError)throw error;throw new HttpsError('failed-precondition',error.message||'Creator AI operation failed.');}};}
function projectCatalog(project={}){
 const assets=[...(project.assets||[]),...(project.historicalMap?.visual?.assets||[])].map(asset=>({id:clean(asset.id,160),name:clean(asset.name,160),type:clean(asset.type||asset.kind||'asset',80),description:clean(asset.description||asset.credit||asset.notes,160)})).filter(asset=>asset.id&&asset.name).slice(0,50);
 const locations=geographyLocations((project.historicalMap?.events||[]).map(event=>({id:clean(event.id,160),name:clean(event.label,160),coordinates:event.coordinates,sourceUrl:event.sourceUrl,sourceDate:event.date,precisionNote:clean(event.sourceNote,160)})).filter(item=>item.id&&item.name&&Array.isArray(item.coordinates))).slice(0,50);
 const routes=(project.historicalMap?.features?.features||[]).filter(feature=>feature.geometry?.type==='LineString'&&feature.properties?.reviewed===true).map(feature=>({id:clean(feature.properties.id,160),name:clean(feature.properties.label,160),coordinates:feature.geometry.coordinates,sourceUrl:feature.properties.sourceUrl,sourceDate:feature.properties.date,precisionNote:clean(feature.properties.sourceNote,160),reviewed:true})).filter(item=>item.id&&item.name).slice(0,50);
 return{assets,locations,routes};
}

function buildPlan(plan,transcript,title,catalog={assets:[],locations:[],routes:[]}){
 const semantic=normalizeSemanticPlan(plan,{segmentIds:transcript.segments.map(segment=>segment.id),assetIds:catalog.assets.map(item=>item.id),locationIds:catalog.locations.map(item=>item.id),routeIds:catalog.routes.map(item=>item.id)});
 const scenes=transcript.segments.map((segment,index)=>{
  const idea=semantic.scenes[index];if(idea.sourceSegmentId!==segment.id)throw Error('OpenAI returned scenes out of timestamp order.');
  const duration=Number((segment.end-segment.start).toFixed(3)),missingInfo=[...idea.missingInfo];
  if(idea.engine==='map'&&!idea.locationId&&!idea.routeId&&!idea.historicalYear)missingInfo.push('No reviewed location, route or dated historical context was supplied; the semantic plan remains editable without invented coordinates.');
  const mapAnimation=compileSemanticMap(idea,duration,catalog),canvasScene=mapAnimation?null:semanticCanvasScene(idea);
  return{id:`scene-${index+1}`,startSeconds:segment.start,endSeconds:segment.end,durationSeconds:duration,voiceover:segment.text,voiceoverTimestamp:`${segment.start.toFixed(3)}-${segment.end.toFixed(3)}s`,visual:idea.visualIntent,animation:idea.cameraIntent,assets:'',assetIds:idea.assetIds,assetReferences:idea.assetIds.join('; '),sourceSegmentIds:[segment.id],missingInfo,mapAnimation,contextCard:false,canvasScene,semanticPlan:idea};
 });
 const analysis={format:'invincible-voiceover-analysis',version:1,transcript,scenes,errors:[],valid:true};
 return{analysis,creatorStudio:{schemaVersion:1,title:title||'Voiceover sync plan',aspectRatio:'9:16',assets:[],audio:null,scenes:scenes.map(scene=>({id:scene.id,timeline:`${scene.startSeconds.toFixed(3)}-${scene.endSeconds.toFixed(3)}s`,startSeconds:scene.startSeconds,endSeconds:scene.endSeconds,durationSeconds:scene.durationSeconds,voiceover:scene.voiceover,voiceoverTimestamp:scene.voiceoverTimestamp,visual:scene.visual,assets:scene.assets,assetReferences:scene.assetReferences,mapAnimation:scene.mapAnimation,contextCard:false,canvasScene:scene.canvasScene,semanticPlan:scene.semanticPlan,technicalNotes:`${scene.semanticPlan.engine} · ${scene.semanticPlan.presetId} · ${scene.semanticPlan.cameraIntent}`}))},mapAnimations:scenes.filter(scene=>scene.mapAnimation).map(scene=>({sceneId:scene.id,voiceoverTimestamp:scene.voiceoverTimestamp,plan:scene.mapAnimation,missingInfo:scene.missingInfo}))};
}

exports.creatorOpenAiVideo=onCall(options,guarded(async(data,{project})=>{
 const client=new OpenAI({apiKey:openAiApiKey.value()});
 if(data.action==='plan'){
  const transcript=data.transcript;if(!transcript||!Array.isArray(transcript.segments)||!transcript.segments.length||transcript.segments.length>100)throw Error('Timestamped transcript is required.');
  const catalog=projectCatalog(project),segments=transcript.segments.map(segment=>({id:segment.id,narration:clean(segment.text,4000)})),requestSchema=plannerSchemaForRequest({segmentIds:transcript.segments.map(segment=>segment.id),assetIds:catalog.assets.map(item=>item.id),locationIds:catalog.locations.map(item=>item.id),routeIds:catalog.routes.map(item=>item.id)});
  const input=buildSemanticPlannerPrompt({segments,creativeInstructions:clean(data.creativeInstructions,12000),...catalog});
  const response=await client.responses.create({model:aiModel.value(),instructions:'You are the Invincible Creator Studio semantic scene planner. Follow the supplied locked contract and return only the structured plan.',input,text:{format:{type:'json_schema',name:'creator_semantic_plan',description:'One provider-neutral editorial scene decision for every locked narration segment.',strict:true,schema:requestSchema}}});
  if(response.status&&response.status!=='completed')throw Error(`OpenAI scene planning ended with status ${response.status}.`);
  if(!response.output_text)throw Error('OpenAI returned no usable scene plan.');
  return buildPlan(JSON.parse(response.output_text),transcript,clean(data.title,200),catalog);
 }
 throw Error('Choose OpenAI scene planning. Voiceover timing is created by local Whisper.');
}));

Object.defineProperties(exports,{buildPlan:{value:buildPlan},projectCatalog:{value:projectCatalog}});
