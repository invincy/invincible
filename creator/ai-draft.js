const KEY='invincible.creator.ai.pending.v1';
const DB='invincible-creator-ai-drafts-v1';
const STORE='drafts';
const AUDIO_KEY='pending-audio';

function openDraftDb(){return new Promise((resolve,reject)=>{const request=indexedDB.open(DB,1);let settled=false;const finish=value=>{if(settled){value?.close();return;}settled=true;clearTimeout(timer);resolve(value)},fail=error=>{if(settled)return;settled=true;clearTimeout(timer);reject(error)},timer=setTimeout(()=>fail(Error('The browser audio store did not open. Close older Invincible windows and retry.')),10000);request.onupgradeneeded=()=>request.result.createObjectStore(STORE);request.onsuccess=()=>finish(request.result);request.onerror=()=>fail(request.error||Error('Could not open the AI draft store.'));request.onblocked=()=>fail(Error('An older Invincible window is blocking the audio store. Close it and retry.'));});}
async function audioRequest(mode,run){const db=await openDraftDb();try{return await new Promise((resolve,reject)=>{const tx=db.transaction(STORE,mode),store=tx.objectStore(STORE),timer=setTimeout(()=>{try{tx.abort()}catch{}reject(Error('Saving the AI voiceover took too long. Retry the sync plan.'));},15000);let result;const finish=value=>{clearTimeout(timer);resolve(value)},fail=error=>{clearTimeout(timer);reject(error)};try{result=run(store);}catch(error){fail(error);return;}tx.oncomplete=()=>finish(result?.result);tx.onerror=()=>fail(tx.error||Error('Could not save the AI voiceover.'));tx.onabort=()=>fail(tx.error||Error('AI voiceover save was interrupted.'));});}finally{db.close();}}

export async function savePendingAiDraft(payload,audioBlob=null){
 if(!payload||typeof payload!=='object')throw Error('AI draft is empty.');
 const draft={version:2,createdAt:Date.now(),audioAvailable:!!audioBlob,...payload};
 if(audioBlob)await audioRequest('readwrite',store=>store.put(audioBlob,AUDIO_KEY));
 localStorage.setItem(KEY,JSON.stringify(draft));
 return draft;
}
export function loadPendingAiDraft(){try{const value=JSON.parse(localStorage.getItem(KEY)||'null');return [1,2].includes(value?.version)?value:null;}catch{return null;}}
export async function loadPendingAiAudio(){return audioRequest('readonly',store=>store.get(AUDIO_KEY));}
export function clearPendingAiDraft(){try{localStorage.removeItem(KEY);}catch{}audioRequest('readwrite',store=>store.delete(AUDIO_KEY)).catch(()=>{});}
