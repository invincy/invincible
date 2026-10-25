import { db } from '../../shared/firebase-client.js';
import { collection, doc, onSnapshot, query, orderBy, runTransaction, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';
import { policyId, mergeImport, applyResponse } from './model.mjs';
const policies = uid => collection(db, 'users', uid, 'licFollowups');
const policy = (uid, id) => doc(db, 'users', uid, 'licFollowups', id);
export function watchPolicies(uid, next, error) {
  return onSnapshot(policies(uid), { includeMetadataChanges: true }, snapshot => {
    if (!snapshot.metadata.hasPendingWrites) next(snapshot.docs.map(item => ({ ...item.data(), id: item.id })), snapshot.metadata.fromCache);
  }, error);
}
export function watchHistory(uid, id, next, error) {
  return onSnapshot(query(collection(db, 'users', uid, 'licFollowups', id, 'history'), orderBy('at', 'desc')), snapshot => {
    if (!snapshot.metadata.hasPendingWrites) next(snapshot.docs.map(item => ({ ...item.data(), id: item.id })));
  }, error);
}
export async function importPolicies(uid, records, isCurrent, progress) {
  let done = 0;
  for (let offset = 0; offset < records.length; offset += 100) {
    if (!isCurrent()) throw new Error('Account changed. Import stopped.');
    const chunk = records.slice(offset, offset + 100), refs = chunk.map(row => policy(uid, policyId(row.policyNo)));
    await runTransaction(db, async tx => {
      const snapshots = await Promise.all(refs.map(ref => tx.get(ref)));
      if (!isCurrent()) throw new Error('Account changed. Import stopped.');
      snapshots.forEach((snapshot, i) => tx.set(refs[i], mergeImport(snapshot.exists() ? snapshot.data() : {}, chunk[i], serverTimestamp()), { merge: true }));
    });
    done += chunk.length; if (isCurrent()) progress(done);
  }
}
export async function logResponse(uid, id, event, isCurrent) {
  const ref = policy(uid, id), history = doc(db, 'users', uid, 'licFollowups', id, 'history', event.id);
  await runTransaction(db, async tx => {
    const [snapshot, prior] = await Promise.all([tx.get(ref), tx.get(history)]);
    if (!isCurrent()) throw new Error('Account changed. Save stopped.');
    if (prior.exists()) return; // A retry after an uncertain acknowledgement must not log twice.
    const persisted = { ...event, at: serverTimestamp() };
    const next = applyResponse(snapshot.exists() ? snapshot.data() : null, persisted);
    tx.set(ref, next, { merge: true }); tx.set(history, { ...persisted, followUpDate: next.followUpDate });
  });
}
