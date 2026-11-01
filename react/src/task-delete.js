import {collection, deleteDoc, doc, getDocs, writeBatch} from 'firebase/firestore';
import {db} from './firebase';

// Share the existing task/attachment deletion flow with My Workspace.
export async function deleteTaskWithAssets(uid, id) {
  if (!uid || !id || id.includes('/')) throw Error('Sign in and select a valid task.');
  const ref = doc(db, 'users', uid, 'tasks', id);
  const assets = await getDocs(collection(ref, 'assets'));
  for (let start = 0; start < assets.docs.length; start += 450) {
    const batch = writeBatch(db);
    assets.docs.slice(start, start + 450).forEach(item => batch.delete(item.ref));
    await batch.commit();
  }
  await deleteDoc(ref);
}
