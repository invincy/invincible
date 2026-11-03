import { auth, db } from '../../shared/firebase-client.js';
import { collection, doc, onSnapshot, query, orderBy, limit, runTransaction, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';
import { applyTransaction, checkCash, transactionDetails } from './model.mjs';
const pointer = uid => doc(db, 'users', uid, 'licCashier', 'state');
const counterRef = (uid, id) => doc(db, 'users', uid, 'licCashCounters', id);
const cashValues = cash => [cash.loose, ...Object.keys(cash.counts).sort((a, b) => Number(a) - Number(b)).map(n => cash.counts[n])];
const entryValues = (amounts, received, returned) => JSON.stringify([amounts.map(item => [item.amount, item.label]), cashValues(received), cashValues(returned)]);
function guard(uid, current) {
  if (auth.currentUser?.uid !== uid || !current()) throw new Error('Account changed. Save stopped.');
}
export function watchActive(uid, next, error) {
  let stopCounter = () => {}, disposed = false, sequence = 0;
  const stopPointer = onSnapshot(pointer(uid), { includeMetadataChanges: true }, snapshot => {
    if (snapshot.metadata.hasPendingWrites || disposed) return;
    stopCounter(); const token = ++sequence;
    const id = snapshot.exists() ? snapshot.data().activeId : null;
    if (!id) return next(null);
    stopCounter = onSnapshot(counterRef(uid, id), { includeMetadataChanges: true }, item => {
      if (!disposed && token === sequence && !item.metadata.hasPendingWrites) next(item.exists() ? { ...item.data(), id } : null);
    }, error);
  }, error);
  return () => { disposed = true; stopPointer(); stopCounter(); };
}
export function watchCounters(uid, next, error) {
  return onSnapshot(query(collection(db, 'users', uid, 'licCashCounters'), orderBy('createdAtMs', 'desc'), limit(30)), { includeMetadataChanges: true }, snapshot => {
    if (!snapshot.metadata.hasPendingWrites) next(snapshot.docs.map(item => ({ ...item.data(), id: item.id })), snapshot.metadata.fromCache);
  }, error);
}
export function watchTransactions(uid, id, next, error) {
  return onSnapshot(query(collection(db, 'users', uid, 'licCashCounters', id, 'transactions'), orderBy('atMs', 'desc')), { includeMetadataChanges: true }, snapshot => {
    if (!snapshot.metadata.hasPendingWrites) next(snapshot.docs.map(item => ({ ...item.data(), id: item.id })));
  }, error);
}
export async function startCounter(uid, id, opening, current) {
  checkCash(opening); guard(uid, current);
  return runTransaction(db, async tx => {
    const state = await tx.get(pointer(uid));
    const prior = await tx.get(counterRef(uid, id));
    const activeId = state.exists() ? state.data().activeId : null;
    const active = activeId ? await tx.get(counterRef(uid, activeId)) : null;
    guard(uid, current);
    if (prior.exists()) return id;
    if (active?.exists() && active.data().status === 'open') throw new Error('A counter is already open. Reload to resume it.');
    tx.set(counterRef(uid, id), { status: 'open', opening, balance: opening, collected: 0, cashIn: 0, cashOut: 0, transactionCount: 0, createdAtMs: Date.now(), createdAt: serverTimestamp() });
    tx.set(pointer(uid), { activeId: id });
    return id;
  });
}
// A stable transaction ID makes retries safe even when a save acknowledgement is lost.
// Closing and saving the final entry happen atomically, against the latest cash balance.
export async function saveEntry(uid, id, draft, close, current) {
  guard(uid, current);
  const ref = counterRef(uid, id);
  const entryRef = draft ? doc(db, 'users', uid, 'licCashCounters', id, 'transactions', draft.id) : null;
  return runTransaction(db, async tx => {
    const snapshot = await tx.get(ref);
    const prior = entryRef ? await tx.get(entryRef) : null;
    guard(uid, current);
    if (!snapshot.exists()) throw new Error('Counter could not be found.');
    let counter = snapshot.data();
    if (prior?.exists()) {
      const saved = prior.data(), details = transactionDetails(draft);
      if (entryValues(saved.amounts, saved.receivedCash, saved.returnedCash) !== entryValues(details.amounts, draft.received, draft.returned)) {
        throw new Error('This entry was already saved with different values. Check its saved log before continuing. Your changed draft is still on this device.');
      }
      if (close && counter.status !== 'closed') throw new Error('Entry is already saved. Press Next Transaction to finish the retry, then close the counter.');
      return;
    }
    if (counter.status !== 'open') throw new Error('This counter was already closed in another tab.');
    if (draft) {
      counter = applyTransaction(counter, draft);
      tx.set(entryRef, { ...transactionDetails(draft), receivedCash: draft.received, returnedCash: draft.returned, sequence: counter.transactionCount, atMs: draft.atMs, at: serverTimestamp() });
    }
    tx.set(ref, { ...counter, ...(close ? { status: 'closed', closedAtMs: Date.now(), closedAt: serverTimestamp() } : {}), updatedAt: serverTimestamp() });
    // Keep the active pointer at the closed session; opening a new one replaces it safely.
  });
}
