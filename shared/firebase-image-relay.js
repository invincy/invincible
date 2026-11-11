import { requestImagePrompt } from './image-prompt-task.mjs';

let callable, draftClient;
export async function callImageRelay(data) {
  if (!callable) {
    const [{ getFunctions, httpsCallable }, { firebaseApp }] = await Promise.all([
      import('https://www.gstatic.com/firebasejs/10.14.1/firebase-functions.js'),
      import('./firebase-client.js'),
    ]);
    callable = httpsCallable(getFunctions(firebaseApp, 'asia-south1'), 'invincibleImageRelay');
  }
  return (await callable(data)).data;
}

export async function draftRemoteImagePrompt(idea, signal) {
  draftClient ||= Promise.all([
    import('https://www.gstatic.com/firebasejs/10.14.1/firebase-functions.js'),
    import('https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js'),
    import('./firebase-client.js'),
  ]).then(([{ getFunctions, httpsCallable }, { doc, onSnapshot }, { firebaseApp, auth, authReady, db }]) => {
    const enqueue = httpsCallable(getFunctions(firebaseApp, 'asia-south1'), 'enqueueInvincibleAiTask', { timeout: 30_000 });
    return {
      authReady,
      getAccountId: () => auth.currentUser?.uid,
      enqueue: async data => (await enqueue(data)).data,
      subscribe: (uid, id, onData, onError) => onSnapshot(doc(db, 'users', uid, 'aiTasks', id), snapshot => onData(snapshot.data()), onError),
    };
  }).catch(error => { draftClient = undefined; throw error; });
  const client = await draftClient;
  await client.authReady;
  return requestImagePrompt(idea, { ...client, signal });
}
