const { getFirestore } = require('firebase-admin/firestore');
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { claimNextTask, completeTask, createAgentPairing, enqueueTask, failTask, expireLeases, resolveAgentToken } = require('./task-bridge');

const db = getFirestore();
function requireAuth(request) { if (!request.auth?.uid) throw new HttpsError('unauthenticated', 'Sign in to Invincible first.'); return request.auth.uid; }
function bridgeError(error) { if (error instanceof HttpsError) return error; return new HttpsError('failed-precondition', error.message || 'Local AI task bridge rejected the request.'); }
async function requireAgent(request) {
  if (request.auth?.uid) return { uid: request.auth.uid, agentId: String(request.data?.agentId || '').trim() };
  return resolveAgentToken({ db, token: request.data?.agentToken });
}

exports.createInvincibleAgentPairing = onCall({ region: 'asia-south1' }, async request => {
  const uid = requireAuth(request), agentId = String(request.data?.agentId || '').trim();
  try { return await createAgentPairing({ db, uid, agentId }); } catch (error) { throw bridgeError(error); }
});
exports.getInvincibleAgentStatus = onCall({ region: 'asia-south1' }, async request => {
  try { return await resolveAgentToken({ db, token: request.data?.agentToken }); } catch (error) { throw bridgeError(error); }
});

exports.enqueueInvincibleAiTask = onCall({ region: 'asia-south1' }, async request => {
  const uid = requireAuth(request), data = request.data || {};
  try { return await enqueueTask({ db, uid, workspaceId: data.workspaceId || uid, command: data.command, idempotencyKey: data.idempotencyKey }); } catch (error) { throw bridgeError(error); }
});

exports.claimInvincibleAiTask = onCall({ region: 'asia-south1' }, async request => {
  try { const agent = await requireAgent(request); return await claimNextTask({ db, uid: agent.uid, agentId: agent.agentId }); } catch (error) { throw bridgeError(error); }
});

exports.completeInvincibleAiTask = onCall({ region: 'asia-south1' }, async request => {
  const data = request.data || {};
  try { const agent = await requireAgent(request); return await completeTask({ db, uid: agent.uid, taskId: data.taskId, agentId: agent.agentId, result: data.result }); } catch (error) { throw bridgeError(error); }
});

exports.failInvincibleAiTask = onCall({ region: 'asia-south1' }, async request => {
  const data = request.data || {};
  try { const agent = await requireAgent(request); return await failTask({ db, uid: agent.uid, taskId: data.taskId, agentId: agent.agentId, error: data.error }); } catch (error) { throw bridgeError(error); }
});

exports.recoverInvincibleAiTasks = onCall({ region: 'asia-south1' }, async request => {
  const uid = requireAuth(request);
  try { return { recovered: await expireLeases({ db, uid }) }; } catch (error) { throw bridgeError(error); }
});
