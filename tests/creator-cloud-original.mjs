import assert from 'node:assert/strict';
import test from 'node:test';
import {downloadCloudOriginal} from '../creator/media-library.js';

test('a rejected download retries with a fresh signed URL',async()=>{
 const used=[];
 let reads=0;
 const blob=await downloadCloudOriginal('private-voiceover',async()=>String(++reads),async url=>{
  used.push(url);
  return url==='1'?new Response(null,{status:403}):new Response('original');
 });
 assert.deepEqual(used,['1','2']);
 assert.equal(await blob.text(),'original');
});

test('missing originals report the storage response without revealing the signed URL',async()=>{
 let reads=0;
 await assert.rejects(downloadCloudOriginal('file',async()=>{
  reads++;
  return 'https://storage.example/asset?signature=secret';
 },async()=>new Response(null,{status:404})),error=>{
  assert.match(error.message,/missing.*404/);
  assert.doesNotMatch(error.message,/secret/);
  return true;
 });
 assert.equal(reads,1);
});
