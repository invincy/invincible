const KEY='invincible.creator.ai.pending.v1';
const DB='invincible-creator-ai-drafts-v1';
const STORE='drafts';
const AUDIO_KEY='pending-audio';
const SCRIPT_SYNC_PREFIX='invincible.creator.script-sync.v1.';

function openDraftDb(){return new Promise((resolve,reject)=>{const request=indexedDB.open(DB,1);let settled=false;const finish=value=>{if(settled){value?.close();return;}settled=true;clearTimeout(timer);resolve(value)},fail=error=>{if(settled)return;settled=true;clearTimeout(timer);reject(error)},timer=setTimeout(()=>fail(Error('The browser audio store did not open. Close older Invincible windows and retry.')),10000);request.onupgradeneeded=()=>request.result.createObjectStore(STORE);request.onsuccess=()=>finish(request.result);request.onerror=()=>fail(request.error||Error('Could not open the AI draft store.'));request.onblocked=()=>fail(Error('An older Invincible window is blocking the audio store. Close it and retry.'));});}
async function audioRequest(mode,run){const db=await openDraftDb();try{return await new Promise((resolve,reject)=>{const tx=db.transaction(STORE,mode),store=tx.objectStore(STORE),timer=setTimeout(()=>{try{tx.abort()}catch{}reject(Error('Saving the AI voiceover took too long. Retry the sync plan.'));},15000);let result;const finish=value=>{clearTimeout(timer);resolve(value)},fail=error=>{clearTimeout(timer);reject(error)};try{result=run(store);}catch(error){fail(error);return;}tx.oncomplete=()=>finish(result?.result);tx.onerror=()=>fail(tx.error||Error('Could not save the AI voiceover.'));tx.onabort=()=>fail(tx.error||Error('AI voiceover save was interrupted.'));});}finally{db.close();}}

export async function savePendingAiDraft(payload,audioBlob=null){
 if(!payload||typeof payload!=='object')throw Error('AI draft is empty.');
 const draft={version:2,createdAt:Date.now(),audioAvailable:!!audioBlob,...payload};
 if(audioBlob)await audioRequest('readwrite',store=>store.put(audioBlob,AUDIO_KEY));
 localStorage.setItem(KEY,JSON.stringify(draft));
 return draft;
}
export function loadPendingAiDraft({accountId=null,projectId=null}={}){try{const value=JSON.parse(localStorage.getItem(KEY)||'null');if(![1,2].includes(value?.version))return null;if(value.accountId&&accountId&&value.accountId!==accountId)return null;if(value.projectId&&projectId&&value.projectId!==projectId)return null;return value;}catch{return null;}}
export async function loadPendingAiAudio(){return audioRequest('readonly',store=>store.get(AUDIO_KEY));}
export function clearPendingAiDraft(){try{localStorage.removeItem(KEY);}catch{}audioRequest('readwrite',store=>store.delete(AUDIO_KEY)).catch(()=>{});}

const syncScope=(accountId,projectId)=>encodeURIComponent(String(accountId||''))+'.'+encodeURIComponent(String(projectId||''));
const syncKey=(accountId,projectId)=>SCRIPT_SYNC_PREFIX+syncScope(accountId,projectId);
const syncAudioKey=(accountId,projectId)=>'script-sync-audio:'+syncScope(accountId,projectId);
function requireSyncScope(accountId,projectId){if(!String(accountId||'').trim()||!String(projectId||'').trim())throw Error('A signed-in project is required for the Script & scenes checkpoint.');}
function readSync(accountId,projectId){try{const value=JSON.parse(localStorage.getItem(syncKey(accountId,projectId))||'null');return value?.version===1&&value.projectId===projectId&&value.accountId===accountId?value:null;}catch{return null;}}

export function hasScriptSyncCheckpoint(accountId,projectId){return !!readSync(accountId,projectId);}
export async function saveScriptSyncCheckpoint({accountId,projectId,checkpoint,finalAudio=null,sourceAudio=null}){
 requireSyncScope(accountId,projectId);if(!checkpoint||typeof checkpoint!=='object'||!checkpoint.transcript?.segments?.length)throw Error('Whisper timing is required before saving Script & scenes.');
 const current=readSync(accountId,projectId),hasNewAudio=finalAudio instanceof Blob&&finalAudio.size>0;
 if(hasNewAudio)await audioRequest('readwrite',store=>store.put({finalAudio,sourceAudio:sourceAudio instanceof Blob&&sourceAudio.size?sourceAudio:finalAudio},syncAudioKey(accountId,projectId)));
 const value={version:1,accountId,projectId,updatedAt:Date.now(),audioAvailable:hasNewAudio||current?.audioAvailable===true,...checkpoint};
 localStorage.setItem(syncKey(accountId,projectId),JSON.stringify(value));return value;
}
export async function loadScriptSyncCheckpoint(accountId,projectId){
 requireSyncScope(accountId,projectId);const value=readSync(accountId,projectId);if(!value)return null;
 const audio=value.audioAvailable?await audioRequest('readonly',store=>store.get(syncAudioKey(accountId,projectId))):null;
 if(!audio?.finalAudio)return null;return{...value,finalAudio:audio.finalAudio,sourceAudio:audio.sourceAudio||audio.finalAudio};
}
export function clearScriptSyncCheckpoint(accountId,projectId){
 if(!String(accountId||'').trim()||!String(projectId||'').trim())return;
 try{localStorage.removeItem(syncKey(accountId,projectId));}catch{}
 audioRequest('readwrite',store=>store.delete(syncAudioKey(accountId,projectId))).catch(()=>{});
}
