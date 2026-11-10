const crypto = require('node:crypto');

const TASK_STATUS = Object.freeze({ QUEUED: 'queued', RUNNING: 'running', COMPLETED: 'completed', FAILED: 'failed' });
const REGISTERED_LOCAL_TOOLS = new Set(['create_project']);
const MAX_ATTEMPTS = 3;
const MAX_LOG_ENTRIES = 20;
const AGENT_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function taskCollection(db, uid) { return db.collection('users').doc(uid).collection('aiTasks'); }
function agentCollection(db, uid) { return db.collection('users').doc(uid).collection('aiAgents'); }
function agentTokenCollection(db) { return db.collection('aiAgentTokens'); }
function taskIdFor(idempotencyKey) { return `localai_${crypto.createHash('sha256').update(idempotencyKey).digest('hex').slice(0, 32)}`; }
function cleanText(value, max = 4000) {
  const text = String(value || '').trim();
  if (!text || text.length > max) throw new Error(`Command must be between 1 and ${max} characters.`);
  return text;
}
function cleanWorkspace(value) {
  const workspaceId = String(value || '').trim();
  if (!/^[A-Za-z0-9_-]{3,120}$/.test(workspaceId)) throw new Error('A valid workspace ID is required.');
  return workspaceId;
}
function cleanIdempotency(value) {
  const key = String(value || '').trim();
  if (!/^[A-Za-z0-9._:-]{8,160}$/.test(key)) throw new Error('A valid idempotency key is required.');
  return key;
}
function cleanAgentId(value) {
  const id = String(value || '').trim();
  if (!/^[A-Za-z0-9._:-]{8,120}$/.test(id)) throw new Error('A valid agent ID is required.');
  return id;
}
function hashAgentToken(token) { return crypto.createHash('sha256').update(String(token || '')).digest('hex'); }
function randomAgentToken() { return crypto.randomBytes(32).toString('base64url'); }
function nowMs(value) { return Number.isFinite(Number(value)) ? Number(value) : Date.now(); }
function logEntry(type, now, detail = {}) { return { type, atMs: now, ...detail }; }
function appendLog(task, entry) { return [...(Array.isArray(task.executionLog) ? task.executionLog : []), entry].slice(-MAX_LOG_ENTRIES); }

async function enqueueTask({ db, uid, workspaceId, command, idempotencyKey, now }) {
  if (!uid) throw new Error('Authentication is required.');
  const ownerUid = String(uid);
  const workspace = cleanWorkspace(workspaceId);
  const text = cleanText(command);
  const key = cleanIdempotency(idempotencyKey);
  const taskId = taskIdFor(`${ownerUid}:${workspace}:${key}`), ref = taskCollection(db, ownerUid).doc(taskId), timestamp = nowMs(now);
  return db.runTransaction(async transaction => {
    const snapshot = await transaction.get(ref);
    if (snapshot.exists) return { id: taskId, ...snapshot.data(), deduplicated: true };
    const task = { id: taskId, ownerUid, workspaceId: workspace, command: text, idempotencyKey: key, status: TASK_STATUS.QUEUED, attempts: 0, maxAttempts: MAX_ATTEMPTS, createdAtMs: timestamp, updatedAtMs: timestamp, executionLog: [logEntry('queued', timestamp)] };
    transaction.create ? transaction.create(ref, task) : transaction.set(ref, task);
    return { ...task, deduplicated: false };
  });
}

async function createAgentPairing({ db, uid, agentId, now, ttlMs = AGENT_TOKEN_TTL_MS }) {
  if (!uid) throw new Error('Authentication is required.');
  const id = cleanAgentId(agentId), token = randomAgentToken(), timestamp = nowMs(now);
  const previous = await agentCollection(db, uid).get();
  for (const entry of previous.docs) {
    const oldHash = entry.data().tokenHash;
    if (oldHash) await agentTokenCollection(db).doc(oldHash).set({ revoked: true }, { merge: true });
  }
  const tokenHash = hashAgentToken(token), expiresAtMs = timestamp + Math.min(AGENT_TOKEN_TTL_MS, Math.max(60000, Number(ttlMs)));
  await agentCollection(db, uid).doc(id).set({ agentId: id, tokenHash, createdAtMs: timestamp, expiresAtMs, revoked: false });
  await agentTokenCollection(db).doc(tokenHash).set({ uid: String(uid), agentId: id, expiresAtMs, revoked: false });
  return { agentId: id, token, expiresAtMs };
}

async function resolveAgentToken({ db, token, now }) {
  const value = String(token || '').trim();
  if (value.length < 32) throw new Error('A valid agent token is required.');
  const timestamp = nowMs(now), hash = hashAgentToken(value), snapshot = await agentTokenCollection(db).doc(hash).get();
  if (snapshot.exists) {
    const data = snapshot.data();
    if (data.revoked || Number(data.expiresAtMs || 0) <= timestamp) throw new Error('Agent token is expired or revoked.');
    if (data.uid) return { uid: data.uid, agentId: data.agentId };
  }
  // Compatibility fallback for tokens created before the global index stored uid.
  const users = await db.collection('users').get();
  for (const user of users.docs) {
    const agents = await agentCollection(db, user.id).where('tokenHash', '==', hash).get();
    if (!agents.empty) {
      const data = agents.docs[0].data();
      if (data.revoked || Number(data.expiresAtMs || 0) <= timestamp) throw new Error('Agent token is expired or revoked.');
      await agentTokenCollection(db).doc(hash).set({ uid: user.id, agentId: data.agentId, expiresAtMs: data.expiresAtMs, revoked: false }, { merge: true });
      return { uid: user.id, agentId: data.agentId };
    }
  }
  throw new Error('Agent token is invalid.');
}

async function claimNextTask({ db, uid, agentId, leaseMs = 120000, now }) {
  if (!uid || !agentId) throw new Error('Authentication and agent identity are required.');
  const timestamp = nowMs(now), query = taskCollection(db, uid).where('status', '==', TASK_STATUS.QUEUED).orderBy('createdAtMs', 'asc').limit(10), snapshot = await query.get();
  for (const candidate of snapshot.docs) {
    const ref = candidate.ref;
    const claimed = await db.runTransaction(async transaction => {
      const current = await transaction.get(ref);
      if (!current.exists || current.data().status !== TASK_STATUS.QUEUED) return null;
      const data = current.data(), next = { ...data, status: TASK_STATUS.RUNNING, agentId: String(agentId), attempts: Number(data.attempts || 0) + 1, leaseExpiresAtMs: timestamp + Math.max(10000, Number(leaseMs)), updatedAtMs: timestamp, executionLog: appendLog(data, logEntry('claimed', timestamp, { agentId: String(agentId) })) };
      transaction.set(ref, next, { merge: true });
      return { ...next, id: ref.id };
    });
    if (claimed) return claimed;
  }
  return null;
}

async function completeTask({ db, uid, taskId, agentId, result, now }) {
  return transitionTask({ db, uid, taskId, agentId, now, transition: TASK_STATUS.COMPLETED, detail: { result: result ?? null } });
}

async function failTask({ db, uid, taskId, agentId, error, now, allowExpired = false }) {
  const timestamp = nowMs(now), ref = taskCollection(db, uid).doc(taskId);
  return db.runTransaction(async transaction => {
    const snapshot = await transaction.get(ref); if (!snapshot.exists) throw new Error('Task not found.');
    const data = snapshot.data(); assertLease(data, agentId, timestamp, allowExpired);
    const retry = Number(data.attempts || 0) < Number(data.maxAttempts || MAX_ATTEMPTS);
    const next = { ...data, status: retry ? TASK_STATUS.QUEUED : TASK_STATUS.FAILED, error: String(error || 'Local agent failed.').slice(0, 2000), updatedAtMs: timestamp, ...(retry ? { retryAtMs: timestamp + Math.min(60000, 1000 * 2 ** Number(data.attempts || 1)) } : {}), executionLog: appendLog(data, logEntry(retry ? 'retry_scheduled' : 'failed', timestamp, { agentId: String(agentId), error: String(error || '').slice(0, 500) })) };
    delete next.agentId; delete next.leaseExpiresAtMs;
    transaction.set(ref, next, { merge: true }); return { ...next, id: ref.id };
  });
}

function assertLease(data, agentId, timestamp, allowExpired = false) {
  if (data.status !== TASK_STATUS.RUNNING || data.agentId !== String(agentId)) throw new Error('Task is not leased by this agent.');
  if (!allowExpired && Number(data.leaseExpiresAtMs || 0) <= timestamp) throw new Error('Task lease expired.');
}

async function transitionTask({ db, uid, taskId, agentId, now, transition, detail }) {
  const timestamp = nowMs(now), ref = taskCollection(db, uid).doc(taskId);
  return db.runTransaction(async transaction => {
    const snapshot = await transaction.get(ref); if (!snapshot.exists) throw new Error('Task not found.');
    const data = snapshot.data(); assertLease(data, agentId, timestamp);
    const next = { ...data, status: transition, updatedAtMs: timestamp, completedAtMs: transition === TASK_STATUS.COMPLETED ? timestamp : undefined, result: detail.result, executionLog: appendLog(data, logEntry(transition, timestamp, { agentId: String(agentId) })) };
    delete next.agentId; delete next.leaseExpiresAtMs;
    transaction.set(ref, next, { merge: true }); return { ...next, id: ref.id };
  });
}

async function expireLeases({ db, uid, now }) {
  const timestamp = nowMs(now), snapshot = await taskCollection(db, uid).where('status', '==', TASK_STATUS.RUNNING).get(), expired = [];
  for (const candidate of snapshot.docs) {
    const data = candidate.data(); if (Number(data.leaseExpiresAtMs || 0) > timestamp) continue;
    const next = await failTask({ db, uid, taskId: candidate.id, agentId: data.agentId, error: 'Agent lease expired.', now: timestamp, allowExpired: true }); expired.push(next);
  }
  return expired;
}

function assertRegisteredTool(tool) { if (!REGISTERED_LOCAL_TOOLS.has(String(tool))) throw new Error(`Tool is not registered for local execution: ${tool}`); return true; }

module.exports = { AGENT_TOKEN_TTL_MS, MAX_ATTEMPTS, REGISTERED_LOCAL_TOOLS, TASK_STATUS, assertRegisteredTool, claimNextTask, completeTask, createAgentPairing, enqueueTask, expireLeases, failTask, hashAgentToken, resolveAgentToken, taskIdFor };
