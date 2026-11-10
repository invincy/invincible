const {test}=require('node:test'),assert=require('node:assert/strict'),{createHash}=require('node:crypto');
const {assetId,projectId,metadata,verifyBytes}=require('../src/model');
test('Stable asset IDs and bounded metadata reject path tricks and invalid file types',()=>{
 const record={id:'cloud-'+'a'.repeat(64),name:'army.png',mimeType:'image/png',size:24,width:64,height:64};assert.equal(metadata(record).kind,'image');
 for(const id of ['../other','cloud-../../x','user/asset'])assert.throws(()=>assetId(id));assert.throws(()=>projectId('../other'));assert.throws(()=>metadata({...record,mimeType:'text/html'}));assert.throws(()=>metadata({...record,size:101*1024*1024}));assert.throws(()=>metadata({...record,duration:601}));
});
test('Commit verifies original bytes, size, type and content hash',()=>{
 const bytes=Buffer.alloc(24);Buffer.from([137,80,78,71,13,10,26,10]).copy(bytes);const record={id:'cloud-'+createHash('sha256').update(bytes).digest('hex'),size:bytes.length,mimeType:'image/png'};verifyBytes(bytes,record);assert.throws(()=>verifyBytes(Buffer.from('different bytes'),record));assert.throws(()=>verifyBytes(bytes,{...record,size:25}));assert.throws(()=>verifyBytes(bytes,{...record,mimeType:'video/mp4'}));
});
