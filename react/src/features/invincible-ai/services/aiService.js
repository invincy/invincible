import{httpsCallable}from'firebase/functions';
import{doc,onSnapshot}from'firebase/firestore';
import{auth,db,functions}from'../../../firebase';

const chat=httpsCallable(functions,'invincibleAiChat',{timeout:120000});
const enqueueTask=httpsCallable(functions,'enqueueInvincibleAiTask',{timeout:30000});

const queryLocal=typeof window!=='undefined'&&new URLSearchParams(window.location.search).get('local-ai')==='1';
const localOrigin=typeof window!=='undefined'&&(window.__INVINCIBLE_LOCAL_AI_ORIGIN__||'')||'';
const localBridgeEnabled=queryLocal&&!localOrigin;
export const PROVIDERS=Object.freeze({cloud:'cloud',local:'local'});
export const isLocalAiAvailable=Boolean(localOrigin||localBridgeEnabled);
const providerKey='invincible.ai.provider.v1';
export function getAiProvider(){if(typeof localStorage==='undefined')return PROVIDERS.cloud;return localStorage.getItem(providerKey)===PROVIDERS.local?PROVIDERS.local:PROVIDERS.cloud}
export function setAiProvider(provider){if(provider!==PROVIDERS.local&&provider!==PROVIDERS.cloud)throw Error('Unknown AI provider.');localStorage?.setItem(providerKey,provider);return provider}

function waitForTask(taskId,timeoutMs=180000){
 const uid=auth.currentUser?.uid;if(!uid)throw Error('Sign in to Invincible before using Local Qwen.');
 return new Promise((resolve,reject)=>{let timer;const stop=onSnapshot(doc(db,'users',uid,'aiTasks',taskId),snapshot=>{const data=snapshot.data();if(!data)return;if(data.status==='completed'){clearTimeout(timer);stop();resolve(data.result||{});}else if(data.status==='failed'){clearTimeout(timer);stop();reject(Error(data.error||'The local AI task failed.'));}},error=>{clearTimeout(timer);stop();reject(error)});timer=setTimeout(()=>{stop();reject(Error('Local AI task timed out while waiting for the laptop.'));},timeoutMs)});
}

export async function sendInvincibleAiMessage({conversationId,message,provider=PROVIDERS.cloud}){
 if(provider===PROVIDERS.local){
  if(!isLocalAiAvailable)throw Error('Local Qwen3 is unavailable. Start the laptop connector first.');
  if(!localOrigin){
   try{const response=await enqueueTask({command:message,idempotencyKey:`web-${Date.now()}-${Math.random().toString(36).slice(2,10)}`});const task=response.data;const result=await waitForTask(task.id);return{...result,local:true};}catch(error){throw Error(error?.message||'The laptop connector is offline.');}
  }
  let response;try{response=await fetch(`${localOrigin.replace(/\/$/,'')}/api/command`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({conversationId,message})})}catch{throw Error('Local Invincible AI is unavailable. Start the local agent and try again.')}
  const payload=await response.json();
  if(!response.ok)throw Error(payload.error||'Local Invincible AI could not complete that request.');
  const action=payload.result?.result?.action;
  return{text:action?.summary||'Local action completed.',actions:action?[action]:[],local:true};
 }
 if(provider!==PROVIDERS.cloud)throw Error('Unknown AI provider.');
 const response=await chat({conversationId,message});
 return response.data;
}
