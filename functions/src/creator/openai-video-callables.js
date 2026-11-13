const {onCall,HttpsError}=require('firebase-functions/v2/https');
const {defineSecret,defineString}=require('firebase-functions/params');
const {getFirestore}=require('firebase-admin/firestore');
const OpenAI=require('openai');
const {toFile}=require('openai');
const {assertAccess}=require('./kling');
const {plannerSchemaForRequest,normalizeSemanticPlan,buildSemanticPlannerPrompt,semanticCanvasScene}=require('./semantic-plan');

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
function decodeAudio(data){
 const value=data.audioBase64;if(typeof value!=='string'||!value.length||value.length>28_000_000||value.length%4||!/^[A-Za-z0-9+/]*={0,2}$/.test(value))throw Error('Use an MP3 up to 20 MB.');
 const bytes=Buffer.from(value,'base64');if(bytes.length<32||bytes.length>20*1024*1024)throw Error('Use an MP3 up to 20 MB.');return bytes;
}
function normalizeTranscript(raw){
 const sourceSegments=Array.isArray(raw.segments)?raw.segments:[],globalWords=Array.isArray(raw.words)?raw.words:[];
 const segments=sourceSegments.map((segment,index)=>{
  const start=Number(segment.start),end=Number(segment.end),words=globalWords.filter(word=>Number(word.start)>=start-.01&&Number(word.end)<=end+.01).map(word=>({word:clean(word.word,200),start:Number(word.start),end:Number(word.end)}));
  return{id:`segment-${index+1}`,start,end,text:clean(segment.text,4000),words};
 }).filter(segment=>Number.isFinite(segment.start)&&Number.isFinite(segment.end)&&segment.end>segment.start&&segment.text);
 if(!segments.length)throw Error('OpenAI did not return usable timestamped speech.');
 const duration=Number(raw.duration)||segments.at(-1).end;
 if(Number.isFinite(duration)&&duration>=segments.at(-1).end)segments.at(-1).end=duration;
 return{text:clean(raw.text,30000),language:clean(raw.language,40),duration,segments};
}

function projectCatalog(project={}){
 const assets=[...(project.assets||[]),...(project.historicalMap?.visual?.assets||[])].map(asset=>({id:clean(asset.id,160),name:clean(asset.name,160),type:clean(asset.type||asset.kind||'asset',80),description:clean(asset.description||asset.credit||asset.notes,160)})).filter(asset=>asset.id&&asset.name).slice(0,50);
 const locations=(project.historicalMap?.events||[]).map(event=>({id:clean(event.id,160),name:clean(event.label,160),coordinates:event.coordinates,sourceUrl:event.sourceUrl,sourceDate:event.date,precisionNote:clean(event.sourceNote,160)})).filter(item=>item.id&&item.name&&Array.isArray(item.coordinates)).slice(0,50);
 const routes=(project.historicalMap?.features?.features||[]).filter(feature=>feature.geometry?.type==='LineString'&&feature.properties?.reviewed===true).map(feature=>({id:clean(feature.properties.id,160),name:clean(feature.properties.label,160),coordinates:feature.geometry.coordinates,sourceUrl:feature.properties.sourceUrl,sourceDate:feature.properties.date,precisionNote:clean(feature.properties.sourceNote,160),reviewed:true})).filter(item=>item.id&&item.name).slice(0,50);
 return{assets,locations,routes};
}

function buildPlan(plan,transcript,title,catalog={assets:[],locations:[],routes:[]}){
 const semantic=normalizeSemanticPlan(plan,{segmentIds:transcript.segments.map(segment=>segment.id),assetIds:catalog.assets.map(item=>item.id),locationIds:catalog.locations.map(item=>item.id),routeIds:catalog.routes.map(item=>item.id)});
 const scenes=transcript.segments.map((segment,index)=>{
  const idea=semantic.scenes[index];if(idea.sourceSegmentId!==segment.id)throw Error('OpenAI returned scenes out of timestamp order.');
  const duration=Number((segment.end-segment.start).toFixed(3)),missingInfo=[...idea.missingInfo];
  if(idea.engine==='map'&&!idea.locationId&&!idea.routeId&&!idea.historicalYear)missingInfo.push('No reviewed location, route or dated historical context was supplied; the semantic plan remains editable without invented coordinates.');
  const canvasScene=semanticCanvasScene(idea);
  return{id:`scene-${index+1}`,startSeconds:segment.start,endSeconds:segment.end,durationSeconds:duration,voiceover:segment.text,voiceoverTimestamp:`${segment.start.toFixed(3)}-${segment.end.toFixed(3)}s`,visual:idea.visualIntent,animation:idea.cameraIntent,assets:'',assetIds:idea.assetIds,assetReferences:idea.assetIds.join('; '),sourceSegmentIds:[segment.id],missingInfo,mapAnimation:null,contextCard:false,canvasScene,semanticPlan:idea};
 });
 const analysis={format:'invincible-voiceover-analysis',version:1,transcript,scenes,errors:[],valid:true};
 return{analysis,creatorStudio:{schemaVersion:1,title:title||'Voiceover sync plan',aspectRatio:'9:16',assets:[],audio:null,scenes:scenes.map(scene=>({id:scene.id,timeline:`${scene.startSeconds.toFixed(3)}-${scene.endSeconds.toFixed(3)}s`,startSeconds:scene.startSeconds,endSeconds:scene.endSeconds,durationSeconds:scene.durationSeconds,voiceover:scene.voiceover,voiceoverTimestamp:scene.voiceoverTimestamp,visual:scene.visual,assets:scene.assets,assetReferences:scene.assetReferences,mapAnimation:null,contextCard:false,canvasScene:scene.canvasScene,semanticPlan:scene.semanticPlan,technicalNotes:`${scene.semanticPlan.engine} · ${scene.semanticPlan.presetId} · ${scene.semanticPlan.cameraIntent}`}))},mapAnimations:[]};
}

exports.creatorOpenAiVideo=onCall(options,guarded(async(data,{project})=>{
 const client=new OpenAI({apiKey:openAiApiKey.value()});
 if(data.action==='transcribe'){
  const file=await toFile(decodeAudio(data),'voiceover.mp3',{type:'audio/mpeg'});
  const result=await client.audio.transcriptions.create({file,model:'whisper-1',response_format:'verbose_json',timestamp_granularities:['segment','word'],prompt:clean(data.script,2000)});
  return{transcript:normalizeTranscript(result)};
 }
 if(data.action==='plan'){
  const transcript=data.transcript;if(!transcript||!Array.isArray(transcript.segments)||!transcript.segments.length||transcript.segments.length>100)throw Error('Timestamped transcript is required.');
  const catalog=projectCatalog(project),segments=transcript.segments.map(segment=>({id:segment.id,narration:clean(segment.text,4000)})),requestSchema=plannerSchemaForRequest({segmentIds:transcript.segments.map(segment=>segment.id),assetIds:catalog.assets.map(item=>item.id),locationIds:catalog.locations.map(item=>item.id),routeIds:catalog.routes.map(item=>item.id)});
  const input=buildSemanticPlannerPrompt({segments,creativeInstructions:clean(data.creativeInstructions,12000),...catalog});
  const response=await client.responses.create({model:aiModel.value(),instructions:'You are the Invincible Creator Studio semantic scene planner. Follow the supplied locked contract and return only the structured plan.',input,text:{format:{type:'json_schema',name:'creator_semantic_plan',description:'One provider-neutral editorial scene decision for every locked narration segment.',strict:true,schema:requestSchema}}});
  if(response.status&&response.status!=='completed')throw Error(`OpenAI scene planning ended with status ${response.status}.`);
  if(!response.output_text)throw Error('OpenAI returned no usable scene plan.');
  return buildPlan(JSON.parse(response.output_text),transcript,clean(data.title,200),catalog);
 }
 throw Error('Choose OpenAI timing or scene planning.');
}));

Object.defineProperties(exports,{normalizeTranscript:{value:normalizeTranscript},buildPlan:{value:buildPlan},projectCatalog:{value:projectCatalog}});
