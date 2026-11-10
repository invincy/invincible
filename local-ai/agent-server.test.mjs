import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createLocalAgentServer } from './agent-server.mjs';
import { fakeGpu } from '../tests/fixtures/imagegen-service.mjs';
const TOKEN='fixture-only-local-worker-pairing-token-12345';
async function setup(t, options={}) {
  const directory=await fs.mkdtemp(path.join(process.env.INVINCIBLE_IMAGE_TEST_ROOT||os.tmpdir(),'invincible-http-fixture-'));
  const backend=fakeGpu(options),service=await createLocalAgentServer({ownerUid:'test-owner',token:TOKEN,port:18889,workspaceRoot:directory,fetchImpl:backend.fetchImpl,workerOptions:{pollMs:1},ask:async()=>({kind:'tool',tool:'generate_image',arguments:{prompt:'Fixture fortress illustration',preset:'square',seed:42}})});
  await service.listen();t.after(async()=>{await service.close();await fs.rm(directory,{recursive:true,force:true,maxRetries:3});});
  const call=async(route,body,headers={})=>fetch(service.origin+route,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+TOKEN,'Content-Type':'application/json',...headers},...(body?{body:JSON.stringify(body)}:{})});
  return{service,backend,call};
}
test('HTTP requires pairing, account ownership, exact origin and strict arguments',async t=>{
 const{service,call}=await setup(t);
 assert.equal((await fetch(service.origin+'/api/projects')).status,401);
 assert.equal((await call('/api/projects',null,{'X-Invincible-Account':'other-user'})).status,403);
 assert.equal((await call('/api/session',null,{Origin:'https://untrusted.example'})).status,403);
 assert.equal((await call('/api/generations',{arguments:{prompt:'hi',preset:'square',workflow:{}},idempotencyKey:'invalid-001'})).status,400);
 assert.equal((await call('/api/generations',{arguments:{prompt:'hi',preset:'square'},idempotencyKey:'invalid-001',outputPath:'C:\\out'})).status,400);
 assert.equal((await call('/api/generations/agent_00000000000000000000000000000000')).status,404);
});
test('manual and Qwen routes invoke the same tool, attach once, and serve verified downloads',async t=>{
 const{service,call,backend}=await setup(t);
 const project=(await(await call('/api/projects',{title:'Isolated test project',idempotencyKey:'project-001'})).json()).project;
 const response=await call('/api/command',{message:'Generate a square fortress image',idempotencyKey:'qwen-image-001'}),queued=await response.json();
 assert.equal(queued.verified,false);assert.equal(queued.command.tool,'generate_image');assert.ok(queued.job.id);
 await service.images.drain();const done=await(await call('/api/generations/'+queued.job.id)).json();assert.equal(done.verified,true);assert.equal(done.job.status,'completed');
 const download=await call('/api/generations/'+queued.job.id+'/image?download=1');assert.equal(download.headers.get('Content-Type'),'image/png');assert.match(download.headers.get('Content-Disposition'),/attachment/);assert.ok((await download.arrayBuffer()).byteLength>100);
 for(let n=0;n<2;n++)assert.equal((await call('/api/projects/'+project.id+'/assets',{generationId:queued.job.id})).status,200);
 const rows=await(await call('/api/projects')).json();assert.equal(rows.projects[0].assets.length,1);
 assert.ok(service.api.logs.some(entry=>entry.tool==='generate_image'&&entry.status==='completed'));
 assert.equal((await call('/api/projects/local-00000000-0000-0000-0000-000000000000/assets',{generationId:queued.job.id})).status,403);
 const repeated=await(await call('/api/command',{message:'Generate a square fortress image',idempotencyKey:'qwen-image-001'})).json();assert.equal(repeated.job.id,queued.job.id);assert.equal(backend.loads,1);
});
test('failed ComfyUI jobs never have a successful image or attachment route',async t=>{
 const{service,call}=await setup(t,{failed:true});
 const queued=await(await call('/api/generations',{arguments:{prompt:'Fixture',preset:'square'},idempotencyKey:'failure-http-001'})).json();await service.images.drain();
 const done=await(await call('/api/generations/'+queued.job.id)).json();assert.equal(done.verified,false);assert.equal(done.job.status,'failed');assert.equal((await call('/api/generations/'+queued.job.id+'/image')).status,400);
});
