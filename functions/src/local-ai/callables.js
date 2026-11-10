const { getFirestore } = require('firebase-admin/firestore');
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { claimNextTask, completeTask, enqueueTask, failTask, expireLeases } = require('./task-bridge');

const db = getFirestore();
function requireAuth(request) { if (!request.auth?.uid) throw new HttpsError('unauthenticated', 'Sign in to Invincible first.'); return request.auth.uid; }
function bridgeError(error) { if (error instanceof HttpsError) return error; return new HttpsError('failed-precondition', error.message || 'Local AI task bridge rejected the request.'); }

exports.enqueueInvincibleAiTask = onCall({ region: 'asia-south1' }, async request => {
  const uid = requireAuth(request), data = request.data || {};
  try { return await enqueueTask({ db, uid, workspaceId: data.workspaceId || uid, command: data.command, idempotencyKey: data.idempotencyKey }); } catch (error) { throw bridgeError(error); }
});

exports.claimInvincibleAiTask = onCall({ region: 'asia-south1' }, async request => {
  const uid = requireAuth(request), agentId = String(request.data?.agentId || '').trim();
  try { return await claimNextTask({ db, uid, agentId }); } catch (error) { throw bridgeError(error); }
});

exports.completeInvincibleAiTask = onCall({ region: 'asia-south1' }, async request => {
  const uid = requireAuth(request), data = request.data || {};
  try { return await completeTask({ db, uid, taskId: data.taskId, agentId: data.agentId, result: data.result }); } catch (error) { throw bridgeError(error); }
});

exports.failInvincibleAiTask = onCall({ region: 'asia-south1' }, async request => {
  const uid = requireAuth(request), data = request.data || {};
  try { return await failTask({ db, uid, taskId: data.taskId, agentId: data.agentId, error: data.error }); } catch (error) { throw bridgeError(error); }
});

exports.recoverInvincibleAiTasks = onCall({ region: 'asia-south1' }, async request => {
  const uid = requireAuth(request);
  try { return { recovered: await expireLeases({ db, uid }) }; } catch (error) { throw bridgeError(error); }
});
