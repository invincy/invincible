const {onCall,HttpsError}=require('firebase-functions/v2/https');
const {defineSecret,defineString}=require('firebase-functions/params');
const {getFirestore}=require('firebase-admin/firestore');
const OpenAI=require('openai');
const {toFile}=require('openai');
const {z}=require('zod');
const {zodTextFormat}=require('openai/helpers/zod');
const {assertAccess}=require('./kling');

const openAiApiKey=defineSecret('OPENAI_API_KEY');
const aiModel=defineString('OPENAI_MODEL',{default:'gpt-5.6'});
const options={region:'asia-south1',timeoutSeconds:300,memory:'1GiB',maxInstances:2,secrets:[openAiApiKey]};
const id=value=>{if(typeof value!=='string'||!/^[a-zA-Z0-9_-]{1,100}$/.test(value))throw Error('Invalid project ID.');return value;};
const clean=(value,max=12000)=>String(value||'').trim().slice(0,max);

async function access(request){
 if(!request.auth)throw new HttpsError('unauthenticated','Sign in first.');
 const snap=await getFirestore().collection('creatorProjects').doc(id(request.data?.projectId)).get();
 assertAccess(request.auth,snap.exists?snap.data():null);
}
function guarded(fn){return async request=>{try{await access(request);return await fn(request.data||{});}catch(error){if(error instanceof HttpsError)throw error;throw new HttpsError('failed-precondition',error.message||'Creator AI operation failed.');}};}
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

const Coordinate=z.object({longitude:z.number().min(-180).max(180),latitude:z.number().min(-85).max(85)});
const point=value=>[value.longitude,value.latitude];
const MapLabel=z.object({
 name:z.string().min(1).max(100),
 position:Coordinate,
 role:z.enum(['primary','secondary','regional'])
});
const MapRoute=z.object({
 name:z.string().min(1).max(120),
 coordinates:z.array(Coordinate).min(2).max(16),
 color:z.string().regex(/^#[0-9a-fA-F]{6}$/),
 arrowhead:z.boolean()
});
const Scene=z.object({
 segmentNumber:z.number().int().positive(),
 engine:z.enum(['map','canvas']),
 title:z.string().min(1).max(120),
 subtitle:z.string().max(180),
 visual:z.string().min(1).max(800),
 backgroundStyle:z.enum(['plain','grid','blueprint']),
 accentColor:z.string().regex(/^#[0-9a-fA-F]{6}$/),
 motion:z.enum(['hold','rise','pan-left','pan-right','zoom-in']),
 mapBasemap:z.enum(['satellite','terrain','physical','atlas']),
 mapCenter:Coordinate,
 mapEndCenter:Coordinate,
 mapZoom:z.number().min(0).max(12),
 mapEndZoom:z.number().min(0).max(12),
 mapLabels:z.array(MapLabel).max(8),
 mapRoutes:z.array(MapRoute).max(6),
 assets:z.string().max(500),
 missingInfo:z.array(z.string().max(240)).max(8)
});
const Plan=z.object({scenes:z.array(Scene).min(1).max(100)});
function mapAnimation(idea,duration){
 const seconds=Math.max(1,Number(duration.toFixed(3))),sameCenter=idea.mapCenter.longitude===idea.mapEndCenter.longitude&&idea.mapCenter.latitude===idea.mapEndCenter.latitude,sameZoom=idea.mapZoom===idea.mapEndZoom;
 const camera=[{time:0,center:point(idea.mapCenter),zoom:idea.mapZoom,pitch:0,bearing:0,easing:'smooth'}];
 if(!sameCenter||!sameZoom)camera.push({time:seconds,center:point(idea.mapEndCenter),zoom:idea.mapEndZoom,pitch:0,bearing:0,easing:'smooth'});
 const labels=idea.mapLabels.map((label,index)=>({id:`label-${index+1}`,type:'label',name:label.name,start:0,end:seconds,position:point(label.position),role:label.role,fontSize:label.role==='primary'?64:label.role==='secondary'?48:40,fadeIn:Math.min(.3,seconds/3),fadeOut:Math.min(.2,seconds/3)}));
 const routes=idea.mapRoutes.map((route,index)=>({id:`route-${index+1}`,type:'route',name:route.name,start:0,end:seconds,coordinates:route.coordinates.map(point),color:route.color,lineWidth:4,arrowhead:route.arrowhead,revealDuration:Math.min(Math.max(.25,seconds*.65),seconds),fadeIn:0,fadeOut:Math.min(.2,seconds/3)}));
 return{format:'invincible-map-animation',version:1,title:idea.title,duration:seconds,aspectRatio:'9:16',basemap:idea.mapBasemap,terrain:idea.mapBasemap==='terrain',overlayPreset:'documentary',camera,assets:[],layers:[...routes,...labels]};
}
function buildPlan(plan,transcript,title){
 if(plan.scenes.length!==transcript.segments.length)throw Error(`OpenAI must return one scene per segment; expected ${transcript.segments.length}, received ${plan.scenes.length}.`);
 const scenes=transcript.segments.map((segment,index)=>{
  const idea=plan.scenes[index];if(idea.segmentNumber!==index+1)throw Error('OpenAI returned scenes out of timestamp order.');
  const duration=Number((segment.end-segment.start).toFixed(3)),useMap=idea.engine==='map'&&duration>=.1&&(idea.mapLabels.length||idea.mapRoutes.length);
  const canvasScene=useMap?null:{title:idea.title,subtitle:idea.subtitle,visual:idea.visual,backgroundStyle:idea.backgroundStyle,accentColor:idea.accentColor,motion:idea.motion};
  return{id:`scene-${index+1}`,startSeconds:segment.start,endSeconds:segment.end,durationSeconds:duration,voiceover:segment.text,voiceoverTimestamp:`${segment.start.toFixed(3)}-${segment.end.toFixed(3)}s`,visual:idea.visual,animation:useMap?'Map Editor':idea.motion,assets:idea.assets,assetIds:[],assetReferences:idea.assets,sourceSegmentIds:[segment.id],missingInfo:idea.missingInfo,mapAnimation:useMap?mapAnimation(idea,duration):null,contextCard:false,canvasScene};
 });
 const analysis={format:'invincible-voiceover-analysis',version:1,transcript,scenes,errors:[],valid:true};
 return{analysis,creatorStudio:{schemaVersion:1,title:title||'Voiceover sync plan',aspectRatio:'9:16',assets:[],audio:null,scenes:scenes.map(scene=>({id:scene.id,timeline:`${scene.startSeconds.toFixed(3)}-${scene.endSeconds.toFixed(3)}s`,startSeconds:scene.startSeconds,endSeconds:scene.endSeconds,durationSeconds:scene.durationSeconds,voiceover:scene.voiceover,voiceoverTimestamp:scene.voiceoverTimestamp,visual:scene.visual,assets:scene.assets,assetReferences:scene.assetReferences,mapAnimation:scene.mapAnimation,contextCard:false,canvasScene:scene.canvasScene,technicalNotes:scene.mapAnimation?'Editable Map Editor scene':`Canvas motion: ${scene.animation}`}))},mapAnimations:scenes.filter(scene=>scene.mapAnimation).map(scene=>({sceneId:scene.id,animation:scene.mapAnimation}))};
}

exports.creatorOpenAiVideo=onCall(options,guarded(async data=>{
 const client=new OpenAI({apiKey:openAiApiKey.value()});
 if(data.action==='transcribe'){
  const file=await toFile(decodeAudio(data),'voiceover.mp3',{type:'audio/mpeg'});
  const result=await client.audio.transcriptions.create({file,model:'whisper-1',response_format:'verbose_json',timestamp_granularities:['segment','word'],prompt:clean(data.script,2000)});
  return{transcript:normalizeTranscript(result)};
 }
 if(data.action==='plan'){
  const transcript=data.transcript;if(!transcript||!Array.isArray(transcript.segments)||!transcript.segments.length||transcript.segments.length>100)throw Error('Timestamped transcript is required.');
  const segments=transcript.segments.map((segment,index)=>({segmentNumber:index+1,start:Number(segment.start),end:Number(segment.end),narration:clean(segment.text,4000)}));
  const response=await client.responses.parse({model:aiModel.value(),instructions:'You are the Creator Studio scene planner. Return exactly one scene per supplied segment, in the same order. Never alter narration or timestamps. Geographic narration must use engine map so Motion Studio receives a real, editable Map Editor scene; use canvas only for genuinely non-geographic diagrams. For every map scene, provide a restrained north-up camera, essential labels, and only illustrative routes that the narration actually needs. Every coordinate object has longitude then latitude. Do not invent or approximate political or historical boundaries, territorial highlights, statistics, people, archival assets, or exact factual routes. Never treat a basemap as evidence. Put uncertainty or missing source material in missingInfo. mapRoutes may represent clearly illustrative flows such as winds; do not use them as borders. For canvas scenes, leave mapLabels and mapRoutes empty, but still return valid neutral map fields. Follow the creative instructions, use real terrain or satellite geography where appropriate, keep on-screen text concise, and preserve documentary restraint.',input:JSON.stringify({title:clean(data.title,200),aspectRatio:'9:16',creativeInstructions:clean(data.creativeInstructions,12000),segments}),text:{format:zodTextFormat(Plan,'creator_scene_plan')}});
  if(!response.output_parsed)throw Error('OpenAI returned no usable scene plan.');return buildPlan(response.output_parsed,transcript,clean(data.title,200));
 }
 throw Error('Choose OpenAI timing or scene planning.');
}));

Object.defineProperties(exports,{normalizeTranscript:{value:normalizeTranscript},buildPlan:{value:buildPlan},mapAnimation:{value:mapAnimation}});
