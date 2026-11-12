import { setTimeout as pause } from 'node:timers/promises';

const endpoint = 'https://asia-south1-life-by-adichimp.cloudfunctions.net';
const origin = 'http://127.0.0.1:8788';
const { INVINCIBLE_FIREBASE_AGENT_TOKEN: agentToken, INVINCIBLE_IMAGE_WORKER_TOKEN: workerToken } = process.env;
if (!agentToken || !workerToken) throw Error('Open Invincible Image Studio to load the saved laptop connection.');

async function firebase(name, data = {}) {
  const response = await fetch(endpoint + '/' + name, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: { ...data, agentToken } }), signal: AbortSignal.timeout(25_000), redirect: 'error',
  });
  const payload = await response.json();
  if (!response.ok || payload.error) {
    throw Object.assign(Error(payload.error?.message || 'Firebase image relay is unavailable.'), { code: payload.error?.status });
  }
  return payload.result ?? payload.data;
}
const relay = (action, data) => firebase('invincibleImageRelay', { action, ...data });

async function local(path, uid, data) {
  const response = await fetch(origin + path, {
    method: data ? 'POST' : 'GET',
    headers: {
      Authorization: 'Bearer ' + workerToken,
      ...(uid && { 'X-Invincible-Account': uid }),
      ...(data && { 'Content-Type': 'application/json' }),
    },
    ...(data && { body: JSON.stringify(data) }),
    signal: AbortSignal.timeout(12_000), redirect: 'error',
  });
  if (!response.ok) throw Error('Local image worker rejected the operation.');
  return response;
}
const assertOwner = async uid => {
  const session = await (await local('/api/session', uid)).json();
  if (session.uid !== uid || !session.storage?.available) throw Error('The Firebase account does not match the available image workspace.');
};

async function serviceHealth() {
  async function probe(url, verify = () => true) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(2500), redirect: 'error' });
      return response.ok && Boolean(await verify(response));
    } catch { return false; }
  }
  const [whisper, qwen, images] = await Promise.all([
    probe('http://127.0.0.1:8790/health'),
    probe('http://127.0.0.1:11434/api/tags', async response =>
      (await response.json()).models?.some(({ name }) => ['qwen3:4b', 'qwen3:4b-instruct'].includes(name))),
    probe('http://127.0.0.1:8188/queue', async response => {
      const queue = await response.json();
      return Array.isArray(queue.queue_running) && Array.isArray(queue.queue_pending);
    }),
  ]);
  return { whisper, qwen, images };
}

async function publish(action, data) {
  for (let attempt = 0; ; attempt++) {
    try { return await relay(action, data); }
    catch (error) {
      if (attempt === 2 || ['INVALID_ARGUMENT', 'FAILED_PRECONDITION', 'UNAUTHENTICATED'].includes(error.code)) throw error;
      await pause(1500 * (attempt + 1));
    }
  }
}

async function run(task, uid) {
  const receipt = { id: task.id, lease: task.lease };
  let reason = 'worker';
  const heartbeat = setInterval(() => {
    void assertOwner(uid).then(serviceHealth).then(services => relay('heartbeat', { services })).catch(() => {});
  }, 20_000);
  try {
    const route = '/api/generations';
    const submitted = await local(route, uid, { arguments: task.arguments, idempotencyKey: task.id });
    reason = 'generation';
    let { job } = await submitted.json();
    if (!/^agent_[a-f0-9]{32}$/.test(job?.id)) throw Error('Invalid local job ID.');
    const jobRoute = route + '/' + job.id;
    const deadline = Date.now() + 350_000;
    let reported = false;
    while (['queued', 'running'].includes(job.status) && Date.now() < deadline) {
      if (!reported && job.status === 'running') {
        try { await relay('running', receipt); reported = true; } catch {}
      }
      await pause(1000);
      ({ job } = await (await local(jobRoute, uid)).json());
    }
    if (job.status !== 'completed' || !job.verified || !job.image?.sha256) throw Error('Local generation did not produce a verified PNG.');
    const image = await local(jobRoute + '/image', uid);
    const parts = [];
    let size = 0;
    for await (const part of image.body) {
      size += part.length;
      if (size > 2100 * 1024) throw Error('PNG exceeds the relay limit.');
      parts.push(part);
    }
    await publish('complete', { ...receipt, png: Buffer.concat(parts).toString('base64'),
      sha256: job.image.sha256, seed: job.seed, generationSeconds: job.generationSeconds });
    console.log('Verified PNG relayed for ' + task.id);
  } catch {
    console.error('Image relay failed for ' + task.id);
    await publish('fail', { ...receipt, reason });
  } finally { clearInterval(heartbeat); }
}

const { uid } = await firebase('getInvincibleAgentStatus');
await assertOwner(uid);
console.log('Invincible mobile image relay is ready.');
let lastError;
while (true) {
  try {
    await assertOwner(uid);
    const { task } = await relay('claim', { services: await serviceHealth() });
    if (task) await run(task, uid);
    lastError = undefined;
  } catch (error) {
    const message = error.code || error.message;
    if (message !== lastError) console.error('Image relay unavailable: ' + message);
    lastError = message;
  }
  await pause(8000);
}
