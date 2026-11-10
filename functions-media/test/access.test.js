const {test}=require('node:test'),assert=require('node:assert/strict'),{handleMedia}=require('../src/service');
const id='cloud-'+'a'.repeat(64);
function fixture(){const rows=new Map([['_creatorMedia/alice/assets/'+id,{id,name:'army.png',kind:'image',createdAt:'2026-11-10'}],['creatorProjects/video',{ownerUid:'alice'}]]),reads=[],signed=[];
 const doc=path=>({path,collection:name=>collection(path+'/'+name),get:async()=>{reads.push(path);return {exists:rows.has(path),data:()=>rows.get(path)};}});
 const collection=path=>({doc:id=>doc(path+'/'+id),orderBy:()=>({limit:()=>({get:async()=>{reads.push(path);return {size:0,docs:[]};}})})});
 return {reads,signed,db:{collection},bucket:{file:path=>({getSignedUrl:async()=>{signed.push(path);return ['https://example.invalid/private'];}})}};
}
test('Anonymous callers fail before reading account data or signing a URL',async()=>{const f=fixture();await assert.rejects(()=>handleMedia({data:{action:'read',id}},f),e=>e.code==='unauthenticated');assert.deepEqual(f.reads,[]);assert.deepEqual(f.signed,[]);});
test('Asset retrieval uses the authenticated account, never a supplied owner',async()=>{const f=fixture();await assert.rejects(()=>handleMedia({auth:{uid:'bob'},data:{action:'read',id,uid:'alice'}},f),/not in your account/);assert.deepEqual(f.signed,[]);const result=await handleMedia({auth:{uid:'alice'},data:{action:'read',id}},f);assert.ok(result.url);assert.deepEqual(f.signed,['creatorMedia/alice/originals/'+id]);});
test('Listing cannot read another account and cloud drafts enforce project ownership',async()=>{const f=fixture();await handleMedia({auth:{uid:'bob'},data:{action:'list',uid:'alice'}},f);assert.deepEqual(f.reads,['_creatorMedia/bob/assets']);await assert.rejects(()=>handleMedia({auth:{uid:'bob'},data:{action:'loadDraft',projectId:'video'}},f),e=>e.code==='permission-denied');});
