import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { createImageWorker, safeDirectory } from './image-worker.mjs';
import { createGpuCoordinator } from './gpu-coordinator.mjs';
import { verifyPng } from './png-verification.mjs';
import { fakeGpu, fixturePng } from '../tests/fixtures/imagegen-service.mjs';
const require = createRequire(import.meta.url);
const { createUniversalAgent } = require('../functions/src/local-ai/universal-agent-api.js');
const { imageSchema } = require('../functions/src/local-ai/image-generation.js');
const actor = { uid: 'test-owner', workspaceIds: ['test-owner'] }, args = { prompt: 'A clean illustration of a medieval Indian fortress', preset: 'square', seed: 5 };

async function fixture(t, options = {}) {
  const root = await fs.mkdtemp(path.join((process.env.INVINCIBLE_IMAGE_TEST_ROOT || os.tmpdir()), 'invincible-image-fixture-')); t.after(async () => { await worker.shutdown(); await fs.rm(root, { recursive: true, force: true, maxRetries: 3 }); });
  const backend = fakeGpu(options), gpu = createGpuCoordinator();
  const worker = createImageWorker({ workspaceRoot: root, ownerUid: actor.uid, gpu, fetchImpl: backend.fetchImpl, pollMs: 1 });
  assert.equal((await worker.init()).available, true);
  const api = createUniversalAgent({ workspaceRoot: root, toolExecutor: (context, _tool, input) => worker.execute(context, input) });
  return { root, backend, worker, api };
}
async function finished(worker, id) {
  for (let n = 0; n < 200; n++) { const job = worker.get(id, actor.uid); if (['completed','failed'].includes(job.status)) return job; await new Promise(r => setTimeout(r, 5)); }
  throw Error('Fixture did not finish');
}
test('strict image tool rejects arbitrary workflow, paths, sizes and invalid seeds', () => {
  for (const extra of [{ workflow: {} }, { model: 'other' }, { output_path: 'C:\\out' }, { shell: 'whoami' }, { width: 1024 }, { seed: -1 }, { seed: 1.2 }, { preset: 'giant' }, { prompt: '' }]) assert.throws(() => imageSchema.parse({ ...args, ...extra }));
});
for (const [preset, dimensions] of [['square',[512,512]], ['portrait',[384,640]], ['landscape',[640,384]]]) test('verified ' + preset + ' fixture uses the fixed workflow and unloads both GPU models', async t => {
  const { worker, api, backend } = await fixture(t), job = await worker.submit(api, actor, 'render-' + preset, { ...args, preset });
  const done = await finished(worker, job.id); assert.equal(done.status, 'completed'); assert.equal(done.verified, true);
  assert.deepEqual([done.image.width, done.image.height], dimensions); verifyPng(await worker.readImage(job.id, actor.uid), ...dimensions);
  const submitted = backend.calls.find(call => call.route === '/prompt').body;
  assert.equal(submitted.prompt['1'].inputs.ckpt_name, 'v1-5-pruned-emaonly-fp16.safetensors'); assert.equal(submitted.prompt['5'].inputs.steps, 20);
  assert.ok(backend.calls.findIndex(c => c.route === '/api/generate') < backend.calls.findIndex(c => c.route === '/prompt'));
  assert.ok(backend.calls.findIndex(c => c.route === '/free') > backend.calls.findIndex(c => c.route === '/view'));
  await assert.rejects(() => worker.readImage(job.id, 'other-owner'), /not found/i);
});
test('manual generation works when Ollama is not running', async t => {
  const { worker, api } = await fixture(t, { ollamaOffline: true }); const job = await worker.submit(api, actor, 'without-qwen-001', args); assert.equal((await finished(worker, job.id)).status, 'completed');
});
test('concurrent retries share one ComfyUI job and conflicting duplicates fail', async t => {
  const { worker, api, backend } = await fixture(t);
  const [a,b] = await Promise.all([worker.submit(api,actor,'duplicate-001',args),worker.submit(api,actor,'duplicate-001',args)]);
  assert.equal(a.id,b.id); assert.equal(b.deduplicated,true);
  await assert.rejects(()=>worker.submit(api,actor,'duplicate-001',{...args,prompt:'different'}),e=>e.code==='IDEMPOTENCY_CONFLICT');
  await finished(worker,a.id); assert.equal(backend.loads,1);
});
for (const failure of ['failed', 'wrongOutput', 'corrupt', 'unavailable']) test(failure + ' cannot appear as a successful generation', async t => {
  const { worker, api } = await fixture(t, { [failure]: true }); const job = await worker.submit(api,actor,'failure-'+failure,args), done = await finished(worker,job.id);
  assert.equal(done.status,'failed'); assert.equal(done.verified,false); await assert.rejects(()=>worker.readImage(job.id,actor.uid));
});
test('saved PNG corruption is rejected on retrieval', async t => {
  const { worker, api } = await fixture(t); const job = await worker.submit(api,actor,'tamper-001',args); await finished(worker,job.id);
  await fs.writeFile(path.join(worker.directory,job.id+'.png'),'bad bytes'); await assert.rejects(()=>worker.readImage(job.id,actor.uid),/PNG/);
});
test('permission failure refuses work before any GPU call', async t => {
  const { root, backend } = await fixture(t); const notDirectory=path.join(root,'file');await fs.writeFile(notDirectory,'not a directory');
  const worker=createImageWorker({workspaceRoot:notDirectory,ownerUid:actor.uid,gpu:createGpuCoordinator(),fetchImpl:backend.fetchImpl});
  assert.equal((await worker.init()).available,false);
  await assert.rejects(()=>worker.submit(createUniversalAgent(),actor,'permission-001',args),e=>e.code==='WORKSPACE_PERMISSION_DENIED');assert.equal(backend.calls.length,0);
});
test('workspace links are rejected without writing through them', async t => {
  const {root}=await fixture(t),outside=await fs.mkdtemp(path.join((process.env.INVINCIBLE_IMAGE_TEST_ROOT || os.tmpdir()),'invincible-link-fixture-'));t.after(()=>fs.rm(outside,{recursive:true,force:true}));
  await fs.symlink(outside,path.join(root,'link'),'junction');await assert.rejects(()=>safeDirectory(root,path.join(root,'link','escape')),/links/);assert.deepEqual(await fs.readdir(outside),[]);
});
test('GPU coordinator serializes chat and image work, and fails closed after unsafe cleanup', async () => {
  const gpu=createGpuCoordinator(),order=[];
  await Promise.all([gpu.run(async()=>{order.push('chat-start');await new Promise(r=>setTimeout(r,10));order.push('chat-end');}),gpu.run(async()=>order.push('image'))]);
  assert.deepEqual(order,['chat-start','chat-end','image']);gpu.block('cleanup required');await assert.rejects(()=>gpu.run(async()=>{}),/cleanup/);
});
test('PNG verifier catches truncation, wrong dimensions and damaged compressed pixels', () => {
  const bytes=fixturePng(512,512);assert.throws(()=>verifyPng(bytes.subarray(0,100),512,512));assert.throws(()=>verifyPng(bytes,384,640));const broken=Buffer.from(bytes);broken[60]^=1;assert.throws(()=>verifyPng(broken,512,512));
});



test('direct Universal Agent generate_image calls use the same verified executor', async t => {
 const {worker,api}=await fixture(t);
 const result=await api.execute({principal:actor,workspaceId:actor.uid,idempotencyKey:'direct-image-001',tool:'generate_image',arguments:args});
 assert.equal(result.verified,true);assert.equal(worker.get(result.taskId,actor.uid).status,'completed');
});
test('a second worker cannot take over live GPU state',async t=>{
 const {worker,root,backend}=await fixture(t);
 const second=createImageWorker({workspaceRoot:root,ownerUid:'other-owner',gpu:createGpuCoordinator(),fetchImpl:backend.fetchImpl});
 const status=await second.init();assert.equal(status.available,false);assert.match(status.error,/Another image worker/);await second.shutdown();
});
