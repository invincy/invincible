const { createHash, randomUUID } = require('node:crypto');

const PRESETS = { square: [512, 512], portrait: [384, 640], landscape: [640, 384] };
const CHUNK_SIZE = 700 * 1024;
const CHUNKS = 3;
const RESULT_SLOTS = 4;
const ONLINE_MS = 45_000;
const QUEUE_MS = 120_000;
const LEASE_MS = 480_000;
const ACTIVE = new Set(['queued', 'running']);

class RelayError extends Error {
  constructor(code, message) { super(message); this.code = code; }
}
function reject(code, message) { throw new RelayError(code, message); }

function parseArguments(args) {
  if (!args || typeof args !== 'object' || Object.keys(args).some(key => !['prompt', 'preset', 'seed'].includes(key))) {
    reject('invalid-argument', 'Only a prompt, frame and optional seed are allowed.');
  }
  const prompt = typeof args.prompt === 'string' ? args.prompt.trim() : '';
  if (!prompt || prompt.length > 1500 || /[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(prompt) || typeof args.preset !== 'string' || !Object.hasOwn(PRESETS, args.preset) ||
      (args.seed !== undefined && (!Number.isInteger(args.seed) || args.seed < 0 || args.seed > 4294967295))) {
    reject('invalid-argument', 'Enter a valid prompt, frame and optional seed.');
  }
  return { prompt, preset: args.preset, ...(args.seed === undefined ? {} : { seed: args.seed }) };
}
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const publicly = ({ id, status, error, seed, image, generationSeconds }) => ({
  id, status, ...(error && { error: { message: error } }),
  ...(image && { verified: true, seed, image, generationSeconds }),
});
const failed = (job, error) => ({ id: job.id, status: 'failed', error, argsHash: job.argsHash });

function readCompletion(data) {
  if (typeof data.png !== 'string' || data.png.length > CHUNK_SIZE * CHUNKS * 4 / 3 ||
      !Number.isInteger(data.seed) || data.seed < 0 || data.seed > 4294967295 ||
      typeof data.generationSeconds !== 'number' || !Number.isFinite(data.generationSeconds) || data.generationSeconds < 0) {
    reject('invalid-argument', 'Invalid image result.');
  }
  const bytes = Buffer.from(data.png, 'base64');
  if (bytes.toString('base64') !== data.png || bytes.length > CHUNK_SIZE * CHUNKS) reject('invalid-argument', 'Invalid PNG transfer.');
  return bytes;
}

async function imageRelay({ db, uid, agentId, data, now = Date.now() }) {
  const ref = db.collection('invincibleImageRelays').doc(uid);
  const heartbeat = ref.collection('state').doc('laptop');
  const slot = number => ref.collection('results').doc(String(number));
  const part = (number, index) => slot(number).collection('parts').doc(String(index));
  const { action, id } = data;
  const serviceKeys = ['whisper', 'qwen', 'images'];
  const services = data.services && serviceKeys.every(key => typeof data.services[key] === 'boolean')
    ? Object.fromEntries(serviceKeys.map(key => [key, data.services[key]]))
    : null;
  if (action === 'status') {
    const laptop = (await heartbeat.get()).data();
    const online = now - (laptop?.seenAt || 0) <= ONLINE_MS;
    return { online, ...(online && laptop?.services && { services: laptop.services }) };
  }
  const args = action === 'enqueue' ? parseArguments(data.arguments) : null;
  const argsHash = args && digest(JSON.stringify(args));
  let requestedId = id;
  if (action === 'enqueue') {
    if (!/^[a-zA-Z0-9._:-]{8,160}$/.test(data.idempotencyKey || '')) reject('invalid-argument', 'Invalid request key.');
    requestedId = 'remote_' + digest(data.idempotencyKey).slice(0, 32);
  }
  if (['job', 'image', 'running', 'complete', 'fail'].includes(action) && (typeof id !== 'string' || !/^remote_[a-f0-9]{32}$/.test(id))) {
    reject('invalid-argument', 'Invalid image generation ID.');
  }
  const bytes = action === 'complete' ? readCompletion(data) : null;
  const verifier = bytes && (await import('./png-verification.mjs')).verifyPng;

  return db.runTransaction(async tx => {
    const state = (await tx.get(ref)).data() || {};
    const original = state.job;
    let job = original;
    if (ACTIVE.has(job?.status) && job.deadline <= now) {
      job = failed(job, job.lease ? 'The laptop stopped reporting this generation.' : 'The laptop did not pick up this request.');
    }
    const history = state.history || [];
    const recent = history.find(item => item.id === requestedId);
    const save = patch => tx.set(ref, patch, { mergeFields: Object.keys(patch) });
    const loadResult = async item => {
      if (item?.slot === undefined) reject('not-found', 'This image is no longer available in the relay.');
      const record = (await tx.get(slot(item.slot))).data();
      if (record?.id !== requestedId) reject('not-found', 'This image is no longer available in the relay.');
      return record;
    };

    if (action === 'enqueue') {
      const previous = job?.id === requestedId ? job : recent;
      if (previous) {
        if (previous.argsHash !== argsHash) reject('already-exists', 'This request key belongs to different image settings.');
        return { job: publicly(previous.status === 'completed' && !previous.image ? await loadResult(previous) : previous) };
      }
      if (ACTIVE.has(job?.status)) reject('resource-exhausted', 'Another image is already queued or generating for your account.');
      const laptop = (await tx.get(heartbeat)).data();
      if (now - (laptop?.seenAt || 0) > ONLINE_MS) reject('unavailable', 'Your laptop is offline. Open Invincible Image Studio on the laptop.');
      const next = { id: requestedId, args, argsHash, status: 'queued', deadline: now + QUEUE_MS };
      const archive = job && !history.some(item => item.id === job.id)
        ? [{ id: job.id, argsHash: job.argsHash, status: job.status, error: job.error }, ...history].slice(0, 32)
        : history;
      save({ job: next, history: archive });
      return { job: publicly(next) };
    }

    if (action === 'job' || action === 'image') {
      if (action === 'job' && job?.id === id) {
        if (job !== original) save({ job });
        return { job: publicly(job) };
      }
      if (action === 'job' && recent?.status === 'failed') return { job: publicly(recent) };
      const record = await loadResult(recent);
      if (action === 'job') return { job: publicly(record) };
      const pieces = await Promise.all(Array.from({ length: record.parts }, (_, index) => tx.get(part(recent.slot, index))));
      if (pieces.some(piece => !piece.exists)) reject('data-loss', 'The PNG transfer is incomplete.');
      const png = Buffer.concat(pieces.map(piece => Buffer.from(piece.data().bytes)));
      if (digest(png) !== record.image.sha256) reject('data-loss', 'The relayed PNG did not pass its integrity check.');
      return { png: png.toString('base64') };
    }

    if (action === 'claim' || action === 'heartbeat') {
      const laptop = (await tx.get(heartbeat)).data();
      if (laptop?.agentId !== agentId || now - laptop.seenAt >= 20_000 ||
          (services && serviceKeys.some(key => laptop?.services?.[key] !== services[key]))) {
        tx.set(heartbeat, { agentId, seenAt: now, ...(services && { services }) });
      }
      if (action === 'heartbeat' || job?.status !== 'queued' || job.lease) {
        if (job !== original) save({ job });
        return { task: null };
      }
      const lease = randomUUID();
      save({ job: { ...job, agentId, lease, deadline: now + LEASE_MS } });
      return { task: { id: job.id, arguments: job.args, lease } };
    }

    if (action === 'complete' && (recent?.status === 'completed' || (job?.id === id && job.status === 'completed'))) {
      return { job: publicly(await loadResult(recent)) };
    }
    if (job?.id !== id || !ACTIVE.has(job?.status) || job.agentId !== agentId || job.lease !== data.lease) {
      reject('failed-precondition', 'This generation is no longer assigned to the laptop.');
    }
    if (action === 'running') {
      if (job.status === 'queued') save({ job: { ...job, status: 'running' } });
      return { ok: true };
    }
    if (action === 'fail') {
      const next = failed(job, data.reason === 'worker' ? 'The image worker is unavailable on the laptop.' : 'Image generation failed on the laptop.');
      save({ job: next });
      return { job: publicly(next) };
    }
    if (action !== 'complete') reject('invalid-argument', 'Unknown image relay action.');
    let image;
    try { image = verifier(bytes, ...PRESETS[job.args.preset]); }
    catch { reject('invalid-argument', 'The laptop returned an invalid PNG.'); }
    if (data.sha256 !== image.sha256 || (job.args.seed !== undefined && job.args.seed !== data.seed)) {
      reject('invalid-argument', 'The PNG or seed does not match the verified generation.');
    }
    const number = (state.nextSlot || 0) % RESULT_SLOTS;
    const record = { id, status: 'completed', argsHash: job.argsHash, image, seed: data.seed, generationSeconds: data.generationSeconds };
    const count = Math.ceil(bytes.length / CHUNK_SIZE);
    tx.set(slot(number), { ...record, parts: count });
    for (let index = 0; index < CHUNKS; index++) {
      if (index < count) tx.set(part(number, index), { bytes: bytes.subarray(index * CHUNK_SIZE, (index + 1) * CHUNK_SIZE) });
      else tx.delete(part(number, index));
    }
    save({ job: record, nextSlot: (number + 1) % RESULT_SLOTS,
      history: [{ id, argsHash: job.argsHash, status: 'completed', slot: number }, ...history].slice(0, 32) });
    return { job: publicly(record) };
  });
}

module.exports = { RelayError, imageRelay };
