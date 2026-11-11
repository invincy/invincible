const { getFirestore } = require('firebase-admin/firestore');
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { resolveAgentToken } = require('./task-bridge');
const { RelayError, imageRelay } = require('./image-relay');

const browserActions = new Set(['status', 'enqueue', 'job', 'image']);
const agentActions = new Set(['claim', 'heartbeat', 'running', 'complete', 'fail']);

exports.invincibleImageRelay = onCall({ region: 'asia-south1' }, async request => {
  const db = getFirestore();
  const data = request.data || {};
  let uid, agentId;
  if (browserActions.has(data.action)) {
    uid = request.auth?.uid;
    if (!uid) throw new HttpsError('unauthenticated', 'Sign in to Invincible first.');
  } else if (agentActions.has(data.action)) {
    try { ({ uid, agentId } = await resolveAgentToken({ db, token: data.agentToken, indexedOnly: true })); }
    catch { throw new HttpsError('unauthenticated', 'The existing Invincible laptop connection could not authenticate.'); }
    if (!agentId) throw new HttpsError('unauthenticated', 'The laptop identity is missing.');
  } else {
    throw new HttpsError('invalid-argument', 'Unknown image relay action.');
  }
  try { return await imageRelay({ db, uid, agentId, data }); }
  catch (error) {
    if (error instanceof RelayError) throw new HttpsError(error.code, error.message);
    throw error;
  }
});
