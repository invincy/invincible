import assert from'node:assert/strict';
import{readFile}from'node:fs/promises';
import{test}from'node:test';
import{blankCase,buildCaseChange,caseTimestamp}from'../react/src/workday-case-model.mjs';
const source=(await readFile(new URL('../react/src/workday-case-storage.js',import.meta.url),'utf8')).replace(/^import[^\n]*\n/gm,'').replace(/export /g,'');
function fixture(){
 const records=new Map(),auth={currentUser:{uid:'owner'}};let denied=false;
 const doc=(root,...parts)=>({id:[root?.id,...parts].filter(Boolean).join('/')});
 const runTransaction=async(db,fn)=>{const writes=[];await fn({get:async ref=>({exists:()=>records.has(ref.id),data:()=>records.get(ref.id)}),set:(ref,data)=>writes.push([ref.id,structuredClone(data)])});if(denied)throw{code:'permission-denied'};writes.forEach(([path,data])=>records.set(path,data))};
 const create=new Function('deps',`const{doc,collection,onSnapshot,runTransaction,serverTimestamp,auth,db,buildCaseChange,caseId,caseTimestamp}=deps;${source};return{saveCase};`);
 return{...create({doc,collection:doc,onSnapshot:()=>{},runTransaction,serverTimestamp:()=>({seconds:2000000000}),auth,db:{},buildCaseChange,caseId:()=>'',caseTimestamp}),records,auth,deny:value=>denied=value};
}
test('every confirmed case save appends one automatic event; failed/uncertain retries are atomic and idempotent',async()=>{
 const f=fixture(),draft={...blankCase(),title:'NEFT rejection'},root='users/owner/workdayCases/one';
 const initial={operationId:'create',note:'Bank proof needed',photos:[{id:'photo',name:'form.jpg',data:'data:image/jpeg;base64,YQ=='}]};
 await f.saveCase('owner','one',draft,initial);const events=()=>[...f.records.values()].filter(x=>x.kind==='activity');
 assert.equal(events().length,1);assert.equal(events()[0].action,'created');assert.deepEqual(events()[0].createdAt,{seconds:2000000000});assert.deepEqual(f.records.get(root).createdAt,{seconds:2000000000});assert.equal(f.records.size,4);
 await f.saveCase('owner','one',draft,initial);assert.equal(events().length,1);assert.equal(f.records.get(root).revision,1);
 const before=structuredClone([...f.records]);f.deny(true);const update={operationId:'update',expectedRevision:1,note:'Proof received'};await assert.rejects(()=>f.saveCase('owner','one',draft,update));assert.deepEqual([...f.records],before);
 f.deny(false);await f.saveCase('owner','one',draft,update);await f.saveCase('owner','one',draft,update);assert.equal(events().length,2);assert.equal(events().filter(x=>x.action==='saved').length,1);assert.equal(f.records.get(root).revision,2);
 await f.saveCase('owner','one',{...draft,status:'waiting'},{operationId:'status-only',expectedRevision:2});assert.equal(events().length,3);assert.equal(f.records.get(root).status,'waiting');assert.equal([...f.records.values()].filter(x=>x.kind==='photo').length,1);assert.equal([...f.records.values()].filter(x=>x.kind==='note').length,2);
 await assert.rejects(()=>f.saveCase('owner','one',draft,{operationId:'stale',expectedRevision:1}),/changed elsewhere/);assert.equal(events().length,3);
 f.auth.currentUser={uid:'different'};await assert.rejects(()=>f.saveCase('owner','one',draft,{operationId:'wrong-account',expectedRevision:3}),/account changed/);assert.equal(events().length,3);
});
test('updating legacy cases preserves their original recorded creation date',async()=>{
 const f=fixture(),root='users/owner/workdayCases/legacy';f.records.set(root,{...blankCase(),title:'Old claim',revision:1,createdAtMs:1234});
 await f.saveCase('owner','legacy',{...blankCase(),title:'Old claim'},{operationId:'old-update',expectedRevision:1});
 assert.equal(f.records.get(root).createdAtMs,1234);assert.equal(f.records.get(root).createdAt,undefined);assert.equal(f.records.get(root+'/entries/save-old-update').action,'saved');
});
