const {onCall,HttpsError}=require('firebase-functions/v2/https');
const {defineString}=require('firebase-functions/params');
const {getFirestore,Timestamp}=require('firebase-admin/firestore');
const {logger}=require('firebase-functions');
const {listVoices,generate,retimeMp3,GoogleTtsError}=require('./tts-service');
const {parseInput,prepareRequests}=require('./tts-model');
const accountUid=defineString('CREATOR_TTS_ACCOUNT_UID',{default:''});
const options={region:'asia-south1',timeoutSeconds:540,memory:'1GiB',maxInstances:2,concurrency:1};
function assertAccount(request,allowed=accountUid.value()){
 if(!request.auth)throw new HttpsError('unauthenticated','Sign in to Invincible first.');
 if(!allowed)throw new HttpsError('failed-precondition','Voiceover generation is not activated on this backend yet.');
 if(request.auth.uid!==allowed)throw new HttpsError('permission-denied','Voiceover generation is not enabled for this account.');
}
async function reserveUsage(uid,charge,now=Date.now()){
 const db=getFirestore(),ref=db.collection('_creatorTtsUsage').doc(uid);
 await db.runTransaction(async tx=>{
  const snap=await tx.get(ref),old=snap.data()||{},sameHour=now-(old.windowStart?.toMillis?.()||0)<3600000;
  const count=sameHour?(old.count||0):0,total=sameHour?(old.bytes||0):0;
  if((old.busyUntil?.toMillis?.()||0)>now)throw new HttpsError('resource-exhausted','Another recording is being generated. Wait for it to finish.');
  if(count>=30||total+charge>180000)throw new HttpsError('resource-exhausted','The hourly voiceover limit has been reached. Try again later.');
  tx.set(ref,{windowStart:sameHour?old.windowStart:Timestamp.fromMillis(now),count:count+1,bytes:total+charge,busyUntil:Timestamp.fromMillis(now+600000)});
 });
 return async()=>{await ref.update({busyUntil:Timestamp.fromMillis(0)});};
}
function guarded(fn){return async request=>{
 assertAccount(request);
 try{return await fn(request);}
 catch(error){
  if(error instanceof HttpsError)throw error;
  if(error instanceof GoogleTtsError){
   if(error.status===401||error.status===403)throw new HttpsError('failed-precondition','Google TTS is not available to this backend. Check API activation, billing and permissions. Gemini additionally needs aiplatform.endpoints.predict (Vertex AI User).');
   if(error.status===429)throw new HttpsError('resource-exhausted','Google TTS quota is busy or exhausted. Try again later.');
   if(error.status===400)throw new HttpsError('invalid-argument','Google rejected this voice/input combination. Check SSML and the selected voice controls.');
  }
  logger.warn('Creator TTS failed',{type:error?.name||'Error'});
  throw new HttpsError('internal','Could not generate the recording. Your text is still here. No automatic retry was made.');
 }
};}
exports.creatorTtsVoices=onCall({...options,timeoutSeconds:120},guarded(async()=>({voices:await listVoices()})));
exports.creatorTtsGenerate=onCall(options,guarded(async request=>{
 const voices=await listVoices();let charge;
 try{const voice=voices.find(v=>v.name===request.data?.voiceName);const parts=prepareRequests(parseInput(request.data,voice),voice);charge=parts.reduce((sum,part)=>sum+Buffer.byteLength(part.text||part.ssml,'utf8')+Buffer.byteLength(part.prompt||'','utf8'),0);}
 catch(error){throw new HttpsError('invalid-argument',error.message);}
 const release=await reserveUsage(request.auth.uid,charge);
 try{return await generate(request.data,{voices});}
 finally{try{await release();}catch{logger.warn('Creator TTS usage lock release failed');}}
}));
exports.creatorTtsRetime=onCall(options,guarded(async request=>{
 const data=request.data||{},encoded=String(data.audioBase64||''),speed=Number(data.speed),duration=Number(data.durationSeconds);
 if(!encoded||encoded.length>21*1024*1024||!/^[A-Za-z0-9+/]+={0,2}$/.test(encoded))throw new HttpsError('invalid-argument','A valid generated MP3 is required.');
 if(!Number.isFinite(speed)||speed<.75||speed>2)throw new HttpsError('invalid-argument','Final speed must be between 0.75× and 2.00×.');
 if(!Number.isFinite(duration)||duration<=0||duration>600)throw new HttpsError('invalid-argument','The original MP3 duration is invalid.');
 const source=Buffer.from(encoded,'base64');if(!source.length||source.length>15*1024*1024)throw new HttpsError('invalid-argument','The generated MP3 is too large.');
 const mp3=await retimeMp3(source,speed),title=String(data.filename||'voiceover.mp3').replace(/\.mp3$/i,'').replace(/[^\p{L}\p{N}._ -]+/gu,'').trim().slice(0,80)||'voiceover';
 return{audioBase64:mp3.toString('base64'),mimeType:'audio/mpeg',filename:`${title}-${speed.toFixed(2)}x.mp3`,durationSeconds:duration/speed,speed};
}));
exports.assertAccount=assertAccount;
