// Separate, opt-in, account-scoped local records. Never writes creatorProjects.
export function openStudioStore(accountId){
 if(!accountId)throw Error('Sign in before saving Video Studio files on this device.');
 const opened=new Promise((resolve,reject)=>{const r=indexedDB.open('invincible-video-studio-v1',1);r.onupgradeneeded=()=>r.result.createObjectStore('records');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
 async function access(mode,key,value){const db=await opened;return new Promise((resolve,reject)=>{const tx=db.transaction('records',mode),s=tx.objectStore('records'),request=mode==='readonly'?s.get(accountId+':'+key):s.put(value,accountId+':'+key);tx.oncomplete=()=>resolve(request.result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Local save aborted.'));});}
 return {get:key=>access('readonly',key),put:(key,value)=>access('readwrite',key,value),async close(){(await opened).close();}};
}
