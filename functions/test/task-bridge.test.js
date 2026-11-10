const test = require('node:test');
const assert = require('node:assert/strict');
const { claimNextTask, completeTask, createAgentPairing, enqueueTask, expireLeases, failTask, resolveAgentToken, TASK_STATUS, assertRegisteredTool } = require('../src/local-ai/task-bridge');

function memoryDb() {
  const docs = new Map();
  const ref = path => ({ id: path.split('/').pop(), path, collection: child => collection(`${path}/${child}`), get: async () => { const data = docs.get(path); return { exists: Boolean(data), id: path.split('/').pop(), data: () => data }; }, set: async (data, options = {}) => { docs.set(path, options.merge ? { ...(docs.get(path) || {}), ...data } : data); } });
  const collection = path => ({ doc: id => ref(`${path}/${id}`), where: (field, op, expected) => ({ orderBy: () => ({ limit: () => ({ get: async () => ({ docs: [...docs.entries()].filter(([key, data]) => key.startsWith(`${path}/`) && data[field] === expected).map(([key]) => ({ id: key.split('/').pop(), ref: ref(key), data: () => docs.get(key) })) }) }) }), get: async () => ({ docs: [...docs.entries()].filter(([key, data]) => key.startsWith(`${path}/`) && data[field] === expected).map(([key]) => ({ id: key.split('/').pop(), ref: ref(key), data: () => docs.get(key) })) }) }) });
  return { collection: path => collection(path), runTransaction: async fn => { const tx = { get: async target => target.get(), set: (target, data, options) => target.set(data, options), create: (target, data) => target.set(data) }; return fn(tx); }, _docs: docs };
}

test('deduplicates mobile retries and claims a task once', async () => {
  const db = memoryDb(); const first = await enqueueTask({ db, uid: 'user_1', workspaceId: 'user_1', command: 'Create Panipat', idempotencyKey: 'mobile-request-1', now: 100 });
  const duplicate = await enqueueTask({ db, uid: 'user_1', workspaceId: 'user_1', command: 'Create Panipat', idempotencyKey: 'mobile-request-1', now: 200 });
  assert.equal(duplicate.id, first.id); assert.equal(duplicate.deduplicated, true);
  const claimed = await claimNextTask({ db, uid: 'user_1', agentId: 'laptop-1', now: 300 });
  assert.equal(claimed.status, TASK_STATUS.RUNNING); assert.equal(claimed.attempts, 1);
  assert.equal(await claimNextTask({ db, uid: 'user_1', agentId: 'laptop-2', now: 301 }), null);
});

test('completion requires the current lease and persists an execution result', async () => {
  const db = memoryDb(); const queued = await enqueueTask({ db, uid: 'user_2', workspaceId: 'user_2', command: 'Create Panipat', idempotencyKey: 'mobile-request-2', now: 100 });
  const claimed = await claimNextTask({ db, uid: 'user_2', agentId: 'laptop-1', now: 200 });
  await assert.rejects(() => completeTask({ db, uid: 'user_2', taskId: queued.id, agentId: 'other-agent', result: { ok: true }, now: 300 }), /not leased/);
  const completed = await completeTask({ db, uid: 'user_2', taskId: queued.id, agentId: 'laptop-1', result: { projectId: 'panipat_1' }, now: 300 });
  assert.equal(completed.status, TASK_STATUS.COMPLETED); assert.equal(completed.result.projectId, 'panipat_1'); assert.equal(completed.executionLog.at(-1).type, 'completed');
});

test('failed attempts retry, then become terminal; expired leases are recovered', async () => {
  const db = memoryDb(); const task = await enqueueTask({ db, uid: 'user_3', workspaceId: 'user_3', command: 'Create Panipat', idempotencyKey: 'mobile-request-3', now: 100 });
  await claimNextTask({ db, uid: 'user_3', agentId: 'laptop-1', leaseMs: 50, now: 200 });
  const expired = await expireLeases({ db, uid: 'user_3', now: 11000 }); assert.equal(expired[0].status, TASK_STATUS.QUEUED);
  const claimed = await claimNextTask({ db, uid: 'user_3', agentId: 'laptop-1', now: 12000 });
  await failTask({ db, uid: 'user_3', taskId: task.id, agentId: 'laptop-1', error: 'test', now: 13000 });
  const again = await claimNextTask({ db, uid: 'user_3', agentId: 'laptop-1', now: 14000 }); await failTask({ db, uid: 'user_3', taskId: task.id, agentId: 'laptop-1', error: 'test', now: 15000 });
  assert.ok(claimed && again); assert.equal((await db.collection('users').doc('user_3').collection('aiTasks').doc(task.id).get()).data().status, TASK_STATUS.FAILED);
});

test('only registered tools can be executed locally', () => { assert.equal(assertRegisteredTool('create_project'), true); assert.throws(() => assertRegisteredTool('delete_project'), /not registered/); });

test('agent pairing resolves a scoped token without exposing the token hash', async () => {
  const db = memoryDb(); const pairing = await createAgentPairing({ db, uid: 'user_pair', agentId: 'laptop-agent-1', now: 1000, ttlMs: 60000 });
  assert.match(pairing.token, /^[A-Za-z0-9_-]{40,}$/); assert.equal((await resolveAgentToken({ db, token: pairing.token, now: 2000 })).uid, 'user_pair');
  assert.equal((await db.collection('users').doc('user_pair').collection('aiAgents').doc('laptop-agent-1').get()).data().tokenHash.length, 64);
  await assert.rejects(() => resolveAgentToken({ db, token: 'invalid-token-invalid-token-invalid-token', now: 2000 }), /invalid/);
});
