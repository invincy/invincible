import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { verifyPng } from './png-verification.mjs';
const require = createRequire(import.meta.url);
const { IMAGE_PRESETS, imageSchema, imageWorkflow } = require('../functions/src/local-ai/image-generation.js');
const { assertSafeWorkspacePath, taskIdFor } = require('../functions/src/local-ai/universal-agent-api.js');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
export const WORKSPACE_ROOT = 'E:\\Invincible\\AgentWorkspace';
const hash = text => crypto.createHash('sha256').update(text).digest('hex');

// Never follows a workspace junction into a repository or a personal directory.
export async function safeDirectory(root, target) {
  assertSafeWorkspacePath(target, root);
  if ((await fs.lstat(root)).isSymbolicLink()) throw Error('Workspace root must not be a link.');
  let current = root;
  for (const part of path.relative(root, target).split(path.sep)) {
    current = path.join(current, part);
    try { await fs.mkdir(current); } catch (error) { if (error.code !== 'EEXIST') throw error; }
    const entry = await fs.lstat(current);
    if (!entry.isDirectory() || entry.isSymbolicLink()) throw Error('Workspace links are not allowed.');
  }
  const realRoot = await fs.realpath(root), realTarget = await fs.realpath(target);
  if (!realTarget.toLowerCase().startsWith(realRoot.toLowerCase() + path.sep)) throw Error('Workspace containment check failed.');
  return target;
}

export function createImageWorker({ workspaceRoot = WORKSPACE_ROOT, ownerUid, gpu, fetchImpl = fetch, pollMs = 750, timeoutMs = 180000, comfyOrigin = 'http://127.0.0.1:8188', ollamaOrigin = 'http://127.0.0.1:11434' }) {
  for (const origin of [comfyOrigin, ollamaOrigin]) { const u = new URL(origin); if (u.protocol !== 'http:' || u.hostname !== '127.0.0.1' || u.username || u.password || u.pathname !== '/') throw Error('GPU services must use loopback HTTP origins.'); }
  const directory = path.join(workspaceRoot, 'image-generation', hash(ownerUid).slice(0, 32));
  const jobs = new Map(), operations = new Set(); let available = false, storageError = null;
  const lockPath = path.join(workspaceRoot, 'image-generation', '.gpu-worker.lock'), lockNonce = crypto.randomUUID(); let lockHandle = null;
  const filePath = (job, suffix) => assertSafeWorkspacePath(path.join(directory, job.id + suffix), workspaceRoot);
  async function persist(job) {
    await safeDirectory(workspaceRoot, directory);
    const target = filePath(job, '.json'), temporary = target + '.' + crypto.randomUUID() + '.tmp';
    await fs.writeFile(temporary, JSON.stringify(job, null, 2), { flag: 'wx' }); await fs.rename(temporary, target);
  }
  async function init() {
    try {
      await safeDirectory(workspaceRoot, directory);
      try { lockHandle = await fs.open(lockPath, 'wx'); }
      catch (error) {
        if (error.code !== 'EEXIST') throw error;
        if ((await fs.lstat(lockPath)).isSymbolicLink()) throw Error('Worker lock must not be a link.');
        const previous = JSON.parse(await fs.readFile(lockPath, 'utf8'));
        if (!Number.isInteger(previous.pid) || previous.pid < 1) throw Error('Invalid worker lock. Inspect it before restarting.');
        let alive = true; try { process.kill(previous.pid, 0); } catch (error) { if (error.code === 'ESRCH') alive = false; }
        if (alive) throw Error('Another image worker is using this GPU. Stop it before starting a second worker.');
        await fs.unlink(lockPath); lockHandle = await fs.open(lockPath, 'wx');
      }
      await lockHandle.writeFile(JSON.stringify({ pid: process.pid, nonce: lockNonce }));
      const probe = path.join(directory, crypto.randomUUID() + '.tmp'); await fs.writeFile(probe, '', { flag: 'wx' }); await fs.unlink(probe);
      for (const name of await fs.readdir(directory)) {
        if (!/^agent_[a-f0-9]{32}\.json$/.test(name)) continue;
        const location = path.join(directory, name); if ((await fs.lstat(location)).isSymbolicLink()) throw Error('Job metadata must not be a link.');
        const job = JSON.parse(await fs.readFile(location, 'utf8'));
        if (job.ownerUid !== ownerUid || name !== job.id + '.json') throw Error('Job metadata owner mismatch.');
        if (!['completed', 'failed'].includes(job.status)) { job.status = 'failed'; job.verified = false; job.error = { code: 'WORKER_RESTARTED', message: 'Worker restarted. This job was not resumed. Use Regenerate for a new request.' }; await persist(job); }
        jobs.set(job.id, job);
      }
      available = true;
    } catch (error) { storageError = ['EACCES','EPERM'].includes(error.code) ? 'Permission denied in the authorized workspace. Start this worker as InvincibleAgent; do not change the workspace ACL.' : error.message; }
    return { available, error: storageError };
  }
  function owned(id, uid) { const job = jobs.get(id); if (!job || job.ownerUid !== uid) throw Object.assign(Error('Generation not found.'), { code: 'NOT_FOUND' }); return job; }
  async function change(job, fields) { Object.assign(job, fields, { updatedAt: new Date().toISOString() }); await persist(job); }
  async function json(origin, route, body, milliseconds = 5000) {
    const response = await fetchImpl(origin + route, { method: body === undefined ? 'GET' : 'POST', headers: { 'content-type': 'application/json' }, ...(body === undefined ? {} : { body: JSON.stringify(body) }), signal: AbortSignal.timeout(milliseconds), redirect: 'error' });
    if (!response.ok) throw Error(`Local service rejected ${route} (${response.status}).`);
    const text = await response.text();
    if (!text && body !== undefined && ['/free','/queue','/interrupt'].includes(route)) return {};
    return JSON.parse(text);
  }
  async function releaseQwen() {
    let loaded;
    try { loaded = await json(ollamaOrigin, '/api/ps'); } catch (error) { if (error.cause?.code === 'ECONNREFUSED') return; throw Error('Cannot verify Qwen GPU memory: ' + error.message); }
    if (!Array.isArray(loaded.models)) throw Error('Cannot verify the Ollama model list.');
    for (const model of loaded.models || []) if (/qwen/i.test(model.name)) await json(ollamaOrigin, '/api/generate', { model: model.name, keep_alive: 0 }, 30000);
    const until = Date.now() + 15000;
    while (true) {
      const state = await json(ollamaOrigin, '/api/ps');
      if (!Array.isArray(state.models)) throw Error('Cannot verify Qwen GPU memory.');
      if (!(state.models || []).some(model => /qwen/i.test(model.name) && model.size_vram > 0)) return;
      if (Date.now() >= until) throw Error('Qwen did not release GPU memory.'); await delay(pollMs);
    }
  }
  async function queue() { const q = await json(comfyOrigin, '/queue'); if (!Array.isArray(q.queue_running) || !Array.isArray(q.queue_pending)) throw Error('Cannot verify the ComfyUI queue.'); return q; }
  function entries(q) { return [...(q.queue_running || []), ...(q.queue_pending || [])]; }
  async function unloadImages() {
    if (entries(await queue()).length) throw Error('ComfyUI has other GPU work. Wait for it to finish before using Qwen.');
    await json(comfyOrigin, '/free', { unload_models: true, free_memory: true });
    for (let n = 0; n < 30; n++) {
      const state = await json(comfyOrigin, '/system_stats');
      if (!Array.isArray(state.devices) || !state.devices.length || state.devices.some(device => !Number.isFinite(device.torch_vram_total) || !Number.isFinite(device.torch_vram_free))) throw Error('Cannot verify image model memory.');
      // CUDA can retain a small runtime buffer after all model weights are freed.
      if (state.devices.every(device => device.torch_vram_total <= 64 * 1024 * 1024 && device.torch_vram_total - device.torch_vram_free <= 16 * 1024 * 1024)) return;
      await delay(pollMs);
    }
    throw Error('ComfyUI did not confirm unloading the image model.');
  }
  async function png(route) {
    const response = await fetchImpl(comfyOrigin + route, { signal: AbortSignal.timeout(15000), redirect: 'error' });
    if (!response.ok) throw Error('Could not retrieve the generated PNG.');
    const chunks = []; let size = 0;
    for await (const chunk of response.body) { size += chunk.length; if (size > 8 * 1024 * 1024) throw Error('PNG exceeds the output size limit.'); chunks.push(chunk); }
    return Buffer.concat(chunks);
  }
  async function execute(context, rawArgs) {
    const args = imageSchema.parse(rawArgs);
    if (context.uid !== ownerUid || context.workspaceId !== ownerUid || !/^agent_[a-f0-9]{32}$/.test(context.taskId)) throw Error('Generation workspace is not authorized.');
    let job = jobs.get(context.taskId);
    if (!job) {
      if (!available) throw Object.assign(Error(storageError || 'Workspace is unavailable.'), { code: 'WORKSPACE_PERMISSION_DENIED' });
      if ([...jobs.values()].filter(item => !['completed','failed'].includes(item.status)).length >= 4) throw Error('The local image queue is full.');
      job = makeJob(context.taskId, args); jobs.set(job.id, job);
      try { await persist(job); } catch (error) { jobs.delete(job.id); throw error; }
    }
    if (JSON.stringify(args) !== job.fingerprint) throw Error('Generation arguments do not match this request.');
    if (job.status === 'failed') throw Error('This generation failed. Submit a new request key.');
    if (job.status === 'completed') {
      await readImage(job.id, context.uid);
      return { result: { generationId: job.id, ...job.image, seed: job.seed, preset: job.preset, comfyJobId: job.comfyJobId }, action: { tool: 'generate_image', status: 'completed', summary: 'Retrieved the existing verified PNG.' } };
    }
    return gpu.run(async () => {
      let submitted = false, promptId, began = Date.now();
      try {
        if (context.signal?.aborted) throw Error('Generation cancelled before execution.');
        if (entries(await queue()).length) throw Object.assign(Error('ComfyUI is busy with another client. Retry when it is idle.'), { code: 'GPU_BUSY' });
        await releaseQwen();
        const prefix = 'Invincible_' + job.id;
        const workflow = imageWorkflow({ ...args, seed: job.seed }, prefix);
        // A timeout while submitting is ambiguous; never blindly resubmit it.
        submitted = true;
        const queued = await json(comfyOrigin, '/prompt', { prompt: workflow, client_id: job.id, extra_data: { invincible_job_id: job.id } });
        promptId = queued.prompt_id;
        if (typeof promptId !== 'string' || !/^[a-zA-Z0-9-]{1,80}$/.test(promptId) || Object.keys(queued.node_errors || {}).length) throw Error('ComfyUI did not accept the fixed workflow.');
        await change(job, { comfyJobId: promptId, stage: 'comfy-queued' });
        let history;
        while (Date.now() - began < timeoutMs) {
          if (context.signal?.aborted) throw Error('Generation cancelled or timed out.');
          const histories = await json(comfyOrigin, '/history/' + promptId); history = histories[promptId];
          if (history) {
            if (history.status?.status_str === 'error' || history.status?.messages?.some(message => ['execution_error','execution_interrupted'].includes(message[0]))) throw Error('ComfyUI generation failed.');
            if (history.status?.completed) break;
          }
          const q = await queue();
          if (q.queue_running?.some(item => item[1] === promptId) && job.status !== 'running') await change(job, { status: 'running', stage: 'sampling', startedAt: new Date().toISOString() });
          await delay(pollMs);
        }
        if (!history?.status?.completed || history.status.status_str !== 'success') throw Error('ComfyUI generation timed out.');
        if (history.prompt?.[1] !== promptId || history.prompt?.[2]?.['7']?.inputs?.filename_prefix !== prefix) throw Error('ComfyUI output does not belong to this generation.');
        const images = history.outputs?.['7']?.images;
        if (images?.length !== 1 || images[0].type !== 'output' || images[0].subfolder || !new RegExp('^' + prefix + '_[0-9]+_\\.png$').test(images[0].filename)) throw Error('Unexpected ComfyUI output descriptor.');
        const bytes = await png('/view?' + new URLSearchParams({ filename: images[0].filename, type: 'output', subfolder: '' }));
        const [width, height] = IMAGE_PRESETS[args.preset], info = verifyPng(bytes, width, height);
        if (context.signal?.aborted) throw Error('Generation cancelled before saving.');
        await safeDirectory(workspaceRoot, directory); await fs.writeFile(filePath(job, '.png'), bytes, { flag: 'wx' });
        await change(job, { stage: 'unloading', image: info, comfyFilename: images[0].filename, generationSeconds: (Date.now() - began) / 1000 });
        await unloadImages();
        await change(job, { status: 'completed', stage: 'done', verified: true, completedAt: new Date().toISOString() });
        return { result: { generationId: job.id, ...info, seed: job.seed, preset: args.preset, comfyJobId: promptId }, action: { tool: 'generate_image', status: 'completed', summary: 'Generated and verified a ' + width + ' × ' + height + ' PNG.' } };
      } catch (error) {
        if (submitted) {
          try {
            if (!promptId) throw Error('Submission outcome is unknown. Inspect ComfyUI before restarting the worker.');
            await json(comfyOrigin, '/queue', { delete: [promptId] });
            await json(comfyOrigin, '/interrupt', { prompt_id: promptId });
            for (let n = 0; n < 30 && entries(await queue()).some(entry => entry[1] === promptId); n++) await delay(pollMs);
            await unloadImages();
          } catch (cleanup) { gpu.block('GPU cleanup needs attention: ' + cleanup.message); error.message += ' GPU cleanup needs attention: ' + cleanup.message; }
        }
        await change(job, { status: 'failed', verified: false, stage: 'failed', error: { code: error.code || 'GENERATION_FAILED', message: error.message } });
        throw error;
      }
    });
  }
  async function submit(api, principal, key, rawArgs) {
    api.authorize(principal, ownerUid, 'generate_image');
    const args = imageSchema.parse(rawArgs);
    if (!/^[A-Za-z0-9._:-]{8,160}$/.test(key)) throw Error('A valid idempotency key is required.');
    if (!available) throw Object.assign(Error(storageError || 'Workspace is unavailable.'), { code: 'WORKSPACE_PERMISSION_DENIED' });
    const id = taskIdFor(principal.uid, ownerUid, key), fingerprint = JSON.stringify(args), old = jobs.get(id);
    if (old) { if (old.fingerprint !== fingerprint) throw Object.assign(Error('This request key was used for another prompt. Use Regenerate for a new image.'), { code: 'IDEMPOTENCY_CONFLICT' }); return { ...old, deduplicated: true }; }
    if ([...jobs.values()].filter(job => !['completed','failed'].includes(job.status)).length >= 4) throw Object.assign(Error('The local image queue is full.'), { code: 'QUEUE_FULL' });
    const job = makeJob(id, args);
    // Reserve before awaiting disk I/O, so concurrent retries cannot double-submit.
    jobs.set(id, job);
    try { await persist(job); } catch (error) { jobs.delete(id); throw error; }
    const operation = api.execute({ principal, workspaceId: ownerUid, idempotencyKey: key, tool: 'generate_image', arguments: args, timeout: timeoutMs + 300000 }).catch(async error => {
      if (job.status !== 'failed') { try { await change(job, { status: 'failed', verified: false, error: { code: error.code || 'EXECUTION_FAILED', message: error.message } }); } catch {} }
    });
    operations.add(operation); void operation.finally(() => operations.delete(operation));
    return { ...job };
  }
  function makeJob(id, args) { return { id, ownerUid, workspaceId: ownerUid, status: 'queued', stage: 'waiting-for-gpu', verified: false, prompt: args.prompt, preset: args.preset, seed: args.seed ?? crypto.randomInt(0, 4294967296), fingerprint: JSON.stringify(args), createdAt: new Date().toISOString(), workflowVersion: 'sd15-euler20-v1' }; }
  async function readImage(id, uid) {
    const job = owned(id, uid); if (job.status !== 'completed' || !job.verified) throw Error('This generation has no verified PNG.');
    try {
      await safeDirectory(workspaceRoot, directory);
      const location = filePath(job, '.png'); if ((await fs.lstat(location)).isSymbolicLink()) throw Error('Image must not be a link.');
      const bytes = await fs.readFile(location), checked = verifyPng(bytes, job.image.width, job.image.height);
      if (checked.sha256 !== job.image.sha256) throw Error('Saved PNG integrity check failed.'); return bytes;
    } catch (error) { await change(job, { status: 'failed', verified: false, error: { code: 'OUTPUT_INVALID', message: error.message } }); throw error; }
  }
  async function shutdown() {
    await Promise.allSettled([...operations]);
    if (lockHandle) { await lockHandle.close(); lockHandle = null; const lock = JSON.parse(await fs.readFile(lockPath, 'utf8')); if (lock.nonce === lockNonce) await fs.unlink(lockPath); }
  }
  return { init, execute, submit, get: owned, readImage, releaseQwen, unloadImages, drain: () => Promise.allSettled([...operations]), shutdown, storage: () => ({ available, error: storageError }), directory };
}
