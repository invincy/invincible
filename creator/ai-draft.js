const KEY='invincible.creator.ai.pending.v1';
const DB='invincible-creator-ai-drafts-v1';
const STORE='drafts';
const AUDIO_KEY='pending-audio';

function openDraftDb(){return new Promise((resolve,reject)=>{const request=indexedDB.open(DB,1);request.onupgradeneeded=()=>request.result.createObjectStore(STORE);request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error||Error('Could not open the AI draft store.'));});}
async function audioRequest(mode,run){const db=await openDraftDb();try{return await new Promise((resolve,reject)=>{const tx=db.transaction(STORE,mode),store=tx.objectStore(STORE);let result;try{result=run(store);}catch(error){reject(error);return;}tx.oncomplete=()=>resolve(result?.result);tx.onerror=()=>reject(tx.error||Error('Could not save the AI voiceover.'));tx.onabort=()=>reject(tx.error||Error('AI voiceover save was interrupted.'));});}finally{db.close();}}

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
