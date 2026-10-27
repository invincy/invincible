import { db } from '../../shared/firebase-client.js';
import { collection, doc, getDocsFromServer, onSnapshot, query, orderBy, runTransaction, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';
import { policyId, mergeImport, applyResponse, archiveCase } from './model.mjs?v=2';
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
export async function importPolicies(uid, records, isCurrent, progress, { mode = 'merge', importId = '' } = {}) {
  if (!records.length) throw new Error('An empty CSV cannot replace your active list.');
  if (!['merge', 'replace'].includes(mode)) throw new Error('Choose an import mode.');
  if (mode === 'replace' && !importId) throw new Error('Import identifier is required.');
  // Capture candidates before writing. A later import can add a case without this import archiving it.
  const before = mode === 'replace' ? await getDocsFromServer(policies(uid)) : null;
  const included = new Set(records.map(row => policyId(row.policyNo)));
  const missing = before ? before.docs.filter(item => !included.has(item.id) && !item.data().archived).map(item => ({ id: item.id, importedAt: item.data().importedAt })) : [];
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
  // Only archive missing cases once every incoming row has been saved successfully.
  let archived = 0;
  for (let offset = 0; offset < missing.length; offset += 100) {
    const chunk = missing.slice(offset, offset + 100), refs = chunk.map(item => policy(uid, item.id));
    archived += await runTransaction(db, async tx => {
      const snapshots = await Promise.all(refs.map(ref => tx.get(ref)));
      if (!isCurrent()) throw new Error('Account changed. Import stopped.');
      let count = 0;
      snapshots.forEach((snapshot, i) => {
        if (!snapshot.exists()) return;
        const data = snapshot.data();
        // Do not remove a case which another import updated since this preview was read.
        if (data.archived || JSON.stringify(data.importedAt) !== JSON.stringify(chunk[i].importedAt)) return;
        const at = serverTimestamp();
        tx.set(refs[i], archiveCase(data, true, 'missing_csv', at), { merge: true });
        tx.set(doc(db, 'users', uid, 'licFollowups', chunk[i].id, 'history', 'import-' + importId), { outcome: 'case_removed', reason: 'missing_csv', note: 'Not present in the replacement CSV. Previous remarks and history retained.', followUpDate: data.followUpDate || '', at });
        count++;
      });
      return count;
    });
  }
  return { imported: done, archived };
}
export async function changeCaseState(uid, id, eventId, archived, isCurrent) {
  const ref = policy(uid, id), history = doc(db, 'users', uid, 'licFollowups', id, 'history', eventId);
  await runTransaction(db, async tx => {
    const [snapshot, prior] = await Promise.all([tx.get(ref), tx.get(history)]);
    if (!isCurrent()) throw new Error('Account changed. Save stopped.');
    if (prior.exists()) return;
    const at = serverTimestamp(), next = archiveCase(snapshot.exists() ? snapshot.data() : null, archived, 'manual', at);
    tx.set(ref, next, { merge: true });
    tx.set(history, { outcome: archived ? 'case_removed' : 'case_restored', note: '', followUpDate: next.followUpDate || '', at });
  });
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
