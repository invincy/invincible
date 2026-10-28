import { db } from '../../shared/firebase-client.js';
import { collection, doc, onSnapshot, runTransaction, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';
import { customerWrite } from './model.mjs?v=1';
export function watchCustomers(uid, next, error) {
  return onSnapshot(collection(db, 'users', uid, 'licCustomers'), { includeMetadataChanges: true }, snapshot => {
    if (!snapshot.metadata.hasPendingWrites) next(snapshot.docs.map(item => ({ ...item.data(), id: item.id })), snapshot.metadata.fromCache);
  }, error);
}
export async function saveCustomer(uid, id, draft, revision, mutationId, isCurrent) {
  const ref = doc(db, 'users', uid, 'licCustomers', id);
  await runTransaction(db, async tx => {
    const snapshot = await tx.get(ref);
    if (!isCurrent()) throw Error('Account changed. Save stopped.');
    const next = customerWrite(snapshot.exists() ? snapshot.data() : null, draft, revision, mutationId);
    if (next) tx.set(ref, { ...next, updatedAt: serverTimestamp(), ...(!snapshot.exists() ? { createdAt: serverTimestamp() } : {}) });
  });
}
