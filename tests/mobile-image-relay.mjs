import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import relay from '../functions-local-ai/src/image-relay.js';
import { fixturePng } from './fixtures/imagegen-service.mjs';

const { imageRelay } = relay;

function harness() {
  const docs = new Map();
  const ref = path => ({
    path,
    collection: name => ref(path + '/' + name),
    doc: name => ref(path + '/' + name),
    get: async () => ({ exists: docs.has(path), data: () => docs.get(path) }),
  });
  const db = {
    collection: ref,
    async runTransaction(fn) {
      const writes = [];
      const value = await fn({
        get: async target => {
          assert.equal(writes.length, 0, 'Firestore transactions require reads before writes');
          return target.get();
        },
        set(target, data, options) {
          writes.push(() => docs.set(target.path, options?.mergeFields ? { ...docs.get(target.path), ...data } : data));
        },
        delete(target) { writes.push(() => docs.delete(target.path)); },
      });
      writes.forEach(write => write());
      return value;
    },
  };
  let now = 500_000;
  const call = (action, data, uid = 'owner', agentId = 'laptop') => imageRelay({ db, uid, agentId, now, data: { action, ...data } });
  return { call, advance: ms => { now += ms; } };
}

const request = { arguments: { prompt: 'A fortress above a river', preset: 'square', seed: 17 }, idempotencyKey: 'request-12345678' };

test('remote image queue uses laptop presence, leases, exact PNG, account ownership and stable receipts', async () => {
  const { call, advance } = harness();
  assert.deepEqual(await call('status'), { online: false });
  await assert.rejects(call('enqueue', request), { code: 'unavailable' });
  assert.deepEqual(await call('claim'), { task: null });
  assert.deepEqual(await call('status'), { online: true });
  await assert.rejects(call('enqueue', { ...request, arguments: { ...request.arguments, model: 'other' } }), { code: 'invalid-argument' });
  const { job } = await call('enqueue', request);
  assert.equal(job.status, 'queued');
  assert.deepEqual(await call('enqueue', request), { job });
  await assert.rejects(call('enqueue', { ...request, idempotencyKey: 'request-87654321' }), { code: 'resource-exhausted' });
  await assert.rejects(call('enqueue', { ...request, arguments: { ...request.arguments, seed: 18 } }), { code: 'already-exists' });
  const { task } = await call('claim');
  assert.deepEqual(task.arguments, request.arguments);
  assert.deepEqual(await call('claim'), { task: null });
  await assert.rejects(call('running', task, 'owner', 'another-laptop'), { code: 'failed-precondition' });
  await call('running', task);
  assert.equal((await call('job', job)).job.status, 'running');
  await assert.rejects(call('complete', { ...task, png: 'YWJj', seed: 17, generationSeconds: 2 }), { code: 'invalid-argument' });
  await assert.rejects(call('image', job), { code: 'not-found' });
  const png = fixturePng(512, 512);
  const completion = { ...task, png: png.toString('base64'), seed: 17, generationSeconds: 2, sha256: createHash('sha256').update(png).digest('hex') };
  const result = await call('complete', completion);
  assert.equal(result.job.status, 'completed');
  assert.equal(result.job.verified, true);
  assert.deepEqual(await call('complete', completion), result);
  assert.deepEqual(await call('image', job), { png: completion.png });
  await assert.rejects(call('job', job, 'another-user'), { code: 'not-found' });
  await assert.rejects(call('image', job, 'another-user'), { code: 'not-found' });
  advance(46_000);
  assert.deepEqual(await call('status'), { online: false });
  assert.deepEqual(await call('enqueue', request), result);
});

test('failure and expired leases never return a PNG or report completion', async () => {
  const { call, advance } = harness();
  await call('claim');
  const { job } = await call('enqueue', request);
  const { task } = await call('claim');
  const { job: result } = await call('fail', { ...task, reason: 'worker' });
  assert.equal(result.status, 'failed');
  assert.match(result.error.message, /unavailable/);
  await assert.rejects(call('image', job), { code: 'not-found' });
  const { job: queued } = await call('enqueue', { ...request, idempotencyKey: 'another-request' });
  advance(121_000);
  assert.equal((await call('job', queued)).job.status, 'failed');
  assert.deepEqual(await call('claim'), { task: null });
  assert.equal((await call('job', job)).job.status, 'failed');
  assert.equal((await call('enqueue', request)).job.status, 'failed');
});
