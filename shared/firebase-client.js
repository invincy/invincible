import{getApp,getApps,initializeApp}from'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import{browserLocalPersistence,browserPopupRedirectResolver,getAuth,indexedDBLocalPersistence,initializeAuth,onAuthStateChanged}from'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import{getFirestore}from'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';
import{firebaseConfig}from'./firebase-config.js';

export const firebaseApp=getApps().length?getApp():initializeApp(firebaseConfig);
let restoredAuth;
try{restoredAuth=initializeAuth(firebaseApp,{persistence:[browserLocalPersistence,indexedDBLocalPersistence],popupRedirectResolver:browserPopupRedirectResolver})}
catch(error){if(error.code!=='auth/already-initialized')throw error;restoredAuth=getAuth(firebaseApp)}
export const auth=restoredAuth,db=getFirestore(firebaseApp);
export const authReady=auth.authStateReady();
export async function observeAuth(callback){await authReady;return onAuthStateChanged(auth,callback)}
export function storageError(error){
 if(error?.code==='permission-denied')return 'Firebase denied access for this account. Your change was not saved. Check the deployed Firestore rules.';
 if(error?.code==='unauthenticated')return 'Your Google session expired. Open Dashboard to restore it; your change was not saved.';
 if(error?.code==='unavailable')return 'Firebase is unreachable. Your change was not saved. Check your connection and retry.';
 return 'Could not save to Firebase. '+(error?.message||'Please retry.');
}
