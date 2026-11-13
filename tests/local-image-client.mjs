import test from 'node:test';
import assert from 'node:assert/strict';
import {createLocalImageClient,localPairingKey} from '../shared/local-image-client.js';

function storage(values=new Map()){
 return{getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,String(value)),removeItem:key=>values.delete(key)};
}

test('distinguishes a local worker timeout from an offline worker',async t=>{
 const origin='http://127.0.0.1:8788',account='test-owner',values=new Map([[localPairingKey(origin,account),'fixture-token']]);
 const previous={window:globalThis.window,location:globalThis.location,history:globalThis.history,fetch:globalThis.fetch};
 globalThis.window={localStorage:storage(values),sessionStorage:storage(),dispatchEvent(){}};
 globalThis.location={hash:'',pathname:'/invincible/creator/tts.html',search:''};
 globalThis.history={replaceState(){}};
 t.after(()=>Object.assign(globalThis,previous));
 const client=createLocalImageClient({origin,getAccountId:()=>account,requireAccount:true});
 globalThis.fetch=async()=>{throw Object.assign(Error('timed out'),{name:'TimeoutError'});};
 await assert.rejects(client.request('/api/voiceover/plan',{}),error=>error.code==='LOCAL_WORKER_TIMEOUT'&&/still running/i.test(error.message));
 globalThis.fetch=async()=>{throw Error('connection refused');};
 await assert.rejects(client.request('/api/voiceover/plan',{}),error=>error.code==='LOCAL_WORKER_UNREACHABLE');
});
