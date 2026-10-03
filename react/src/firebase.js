import{getApp,getApps,initializeApp}from'firebase/app';
import{GoogleAuthProvider,browserLocalPersistence,browserPopupRedirectResolver,getAuth,indexedDBLocalPersistence,initializeAuth,onAuthStateChanged,signInWithPopup,signOut}from'firebase/auth';
import{getFirestore}from'firebase/firestore';
import{getFunctions}from'firebase/functions';
import{firebaseConfig}from'../../shared/firebase-config';
export const firebaseApp=getApps().length?getApp():initializeApp(firebaseConfig);
let restoredAuth;
try{restoredAuth=initializeAuth(firebaseApp,{persistence:[browserLocalPersistence,indexedDBLocalPersistence],popupRedirectResolver:browserPopupRedirectResolver})}
catch(error){if(error.code!=='auth/already-initialized')throw error;restoredAuth=getAuth(firebaseApp)}
export const auth=restoredAuth;
export const db=getFirestore(firebaseApp);
export const functions=getFunctions(firebaseApp,'asia-south1');
const provider=new GoogleAuthProvider();
export async function observeAuth(callback){await auth.authStateReady();return onAuthStateChanged(auth,callback)}
export const loginWithGoogle=()=>signInWithPopup(auth,provider);
export const logout=()=>signOut(auth);
