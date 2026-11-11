import {collection, deleteDoc, doc, onSnapshot, runTransaction, serverTimestamp, setDoc} from 'firebase/firestore';
import {db} from '../src/firebase';

export const retention = 7 * 24 * 60 * 60 * 1000;
export const completedTime = item => item.completedAt?.toMillis?.() ?? null;
const list = uid => collection(db, 'users', uid, 'quickTodos');

export function watchQuickTodos(uid, onItems, onError) {
  return onSnapshot(list(uid), snapshot => onItems(snapshot.docs.map(row => ({...row.data({serverTimestamps:'estimate'}), id: row.id}))), onError);
}

export function addQuickTodo(uid, title, dueAt) {
  return setDoc(doc(list(uid), crypto.randomUUID()), {title, dueAt, createdAt: serverTimestamp(), completedAt: null});
}

export function deleteQuickTodo(uid, id) {
  return deleteDoc(doc(list(uid), id));
}

export function setQuickTodoDone(uid, id, done) {
  const ref = doc(list(uid), id);
  return runTransaction(db, async tx => {
    const row = await tx.get(ref);
    if (!row.exists()) throw Error('This to-do is no longer available.');
    if (Boolean(row.data().completedAt) !== done) tx.update(ref, {completedAt: done ? serverTimestamp() : null});
  });
}

export function removeExpiredQuickTodo(uid, id, cutoff) {
  const ref = doc(list(uid), id);
  return runTransaction(db, async tx => {
    const row = await tx.get(ref);
    const completed = row.exists() ? completedTime(row.data()) : null;
    if (completed !== null && completed <= cutoff) tx.delete(ref);
  });
}

export function calendarLink(item) {
  const utc = value => new Date(value).toISOString().replace(/[-:]|\.\d{3}/g, '');
  const url = new URL('https://calendar.google.com/calendar/render');
  url.search = new URLSearchParams({action:'TEMPLATE', text:item.title, dates:utc(item.dueAt)+'/'+utc(item.dueAt+15*60*1000)});
  return url.href;
}
