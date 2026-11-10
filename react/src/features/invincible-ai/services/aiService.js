import{httpsCallable}from'firebase/functions';
import{functions}from'../../../firebase';

const chat=httpsCallable(functions,'invincibleAiChat',{timeout:120000});

const localOrigin=typeof window!=='undefined'&&(window.__INVINCIBLE_LOCAL_AI_ORIGIN__||(new URLSearchParams(window.location.search).get('local-ai')==='1'?'http://127.0.0.1:8787':''))||'';
export const PROVIDERS=Object.freeze({cloud:'cloud',local:'local'});
export const isLocalAiAvailable=Boolean(localOrigin);
const providerKey='invincible.ai.provider.v1';
export function getAiProvider(){if(typeof localStorage==='undefined')return PROVIDERS.cloud;return localStorage.getItem(providerKey)===PROVIDERS.local?PROVIDERS.local:PROVIDERS.cloud}
export function setAiProvider(provider){if(provider!==PROVIDERS.local&&provider!==PROVIDERS.cloud)throw Error('Unknown AI provider.');localStorage?.setItem(providerKey,provider);return provider}

export async function sendInvincibleAiMessage({conversationId,message,provider=PROVIDERS.cloud}){
 if(provider===PROVIDERS.local){
  if(!isLocalAiAvailable)throw Error('Local Qwen3 is unavailable. Start the local agent first.');
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
