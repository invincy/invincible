import{createLocalImageClient,waitForImage,hasLocalPairing}from'../../../../../shared/local-image-client.js';
import{httpsCallable}from'firebase/functions';
import{doc,onSnapshot}from'firebase/firestore';
import{auth,db,functions}from'../../../firebase';
import{isPhoneOrTablet}from'../../../../../shared/laptop-device.js';
import{requestImagePrompt}from'../../../../../shared/image-prompt-task.mjs';

const chat=httpsCallable(functions,'invincibleAiChat',{timeout:120000});
const enqueueTask=httpsCallable(functions,'enqueueInvincibleAiTask',{timeout:30000});
const pairAgent=httpsCallable(functions,'createInvincibleAgentPairing',{timeout:30000});
const imageRelay=httpsCallable(functions,'invincibleImageRelay',{timeout:12000});

const queryLocal=typeof window!=='undefined'&&new URLSearchParams(window.location.search).get('local-ai')==='1';
const imageWorkerOrigin='http://127.0.0.1:8788';
const publicLaptop=typeof window!=='undefined'&&location.origin==='https://invincy.github.io';
export const mobileLaptop=publicLaptop&&isPhoneOrTablet();
const hasLaptopPair=()=>typeof window!=='undefined'&&!!auth.currentUser?.uid&&hasLocalPairing(imageWorkerOrigin,auth.currentUser.uid);
const getLocalOrigin=()=>!mobileLaptop&&typeof window!=='undefined'&&(window.__INVINCIBLE_LOCAL_AI_ORIGIN__||(['127.0.0.1','localhost'].includes(location.hostname)||hasLaptopPair()?imageWorkerOrigin:''))||'';
const localBridgeEnabled=queryLocal||publicLaptop;
export const PROVIDERS=Object.freeze({cloud:'cloud',local:'local'});
export const isLocalAiAvailable=Boolean(getLocalOrigin()||localBridgeEnabled||publicLaptop);
const providerKey='invincible.ai.provider.v1';
export function getAiProvider(){if(typeof localStorage==='undefined')return PROVIDERS.cloud;return localStorage.getItem(providerKey)===PROVIDERS.local?PROVIDERS.local:PROVIDERS.cloud}
export function setAiProvider(provider){if(provider!==PROVIDERS.local&&provider!==PROVIDERS.cloud)throw Error('Unknown AI provider.');localStorage?.setItem(providerKey,provider);return provider}
function laptopClient(origin=imageWorkerOrigin){return createLocalImageClient({origin,getAccountId:()=>auth.currentUser?.uid||null,requireAccount:true})}
export function connectThisLaptop(){
 if(mobileLaptop)throw Error('Set up this device from your laptop.');
 return laptopClient(window.__INVINCIBLE_LOCAL_AI_ORIGIN__||imageWorkerOrigin).pairInBrowser();
}
export async function checkLaptopConnection(){
 const origin=getLocalOrigin();
 if(origin){
  const session=await laptopClient(origin).request('/api/session');
  return Boolean(session.storage?.available);
 }
 if(!localBridgeEnabled)return false;
 return (await imageRelay({action:'status'})).data?.online===true;
}
export async function createLocalAgentPairing(agentId){const response=await pairAgent({agentId});return response.data}

export function draftRemoteImagePrompt(idea,signal){
 return requestImagePrompt(idea,{
  getAccountId:()=>auth.currentUser?.uid,
  enqueue:async data=>(await enqueueTask(data)).data,
  subscribe:(uid,id,onData,onError)=>onSnapshot(doc(db,'users',uid,'aiTasks',id),snapshot=>onData(snapshot.data()),onError),
  signal,
 });
}

function waitForTask(taskId,timeoutMs=180000){
 const uid=auth.currentUser?.uid;if(!uid)throw Error('Sign in to Invincible before using Local Qwen.');
 return new Promise((resolve,reject)=>{let timer;const stop=onSnapshot(doc(db,'users',uid,'aiTasks',taskId),snapshot=>{const data=snapshot.data();if(!data)return;if(data.status==='completed'){clearTimeout(timer);stop();resolve(data.result||{});}else if(data.status==='failed'){clearTimeout(timer);stop();reject(Error(data.error||'The local AI task failed.'));}},error=>{clearTimeout(timer);stop();reject(error)});timer=setTimeout(()=>{stop();reject(Error('Local AI task timed out while waiting for the laptop.'));},timeoutMs)});
}

export async function sendInvincibleAiMessage({conversationId,message,provider=PROVIDERS.cloud}){
 if(provider===PROVIDERS.local){
  const localOrigin=getLocalOrigin();
  if(!isLocalAiAvailable)throw Error('Local Qwen3 is unavailable. Start the laptop connector first.');
  if(!localOrigin){
   if(!localBridgeEnabled)throw Error('Set up your laptop connection before using Local Qwen.');
   try{const response=await enqueueTask({command:message,idempotencyKey:`web-${Date.now()}-${Math.random().toString(36).slice(2,10)}`});const task=response.data;const result=await waitForTask(task.id);return{...result,local:true};}catch(error){throw Error(error?.message||'The laptop connector is offline.');}
  }
  const client=createLocalImageClient({origin:localOrigin,getAccountId:()=>auth.currentUser?.uid||null,requireAccount:true});
  const payload=await client.command(message,crypto.randomUUID());
  if(payload.job){
   const notification={type:'invincible-image-job',jobId:payload.job.id,origin:client.origin};
   sessionStorage.setItem('invincible.image-last.'+client.origin+'.'+auth.currentUser.uid,payload.job.id);
   window.dispatchEvent(new CustomEvent('invincible-image-job',{detail:notification}));
   if(window.parent!==window)window.parent.postMessage(notification,location.origin);
   const job=await waitForImage(client,payload.job);
   return{text:`Image generated: ${job.image.width} × ${job.image.height}. Open Create an image to preview or attach it.`,actions:[{tool:'generate_image',status:'completed',summary:'Generated and verified PNG.',generationId:job.id}],local:true};
  }
  const action=payload.result?.result?.action;
  if(action&&(!payload.verified||action.status!=='completed'))throw Error('Local action did not complete.');
  return{text:payload.text||action?.summary||'No action was completed.',actions:action?[action]:[],local:true};
 }
 if(provider!==PROVIDERS.cloud)throw Error('Unknown AI provider.');
 const response=await chat({conversationId,message});
 return response.data;
}
