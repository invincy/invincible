let callable;
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
