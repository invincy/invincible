import{getApp,getApps,initializeApp}from'firebase/app';
import{GoogleAuthProvider,browserLocalPersistence,getAuth,onAuthStateChanged,setPersistence,signInWithPopup,signOut}from'firebase/auth';
import{getFirestore}from'firebase/firestore';
const config={apiKey:'AIzaSyBeVpUqcRO_VXfQrGVL5OaSGHKFB8XEQMc',authDomain:'life-by-adichimp.firebaseapp.com',projectId:'life-by-adichimp',storageBucket:'life-by-adichimp.firebasestorage.app',messagingSenderId:'761981819700',appId:'1:761981819700:web:8e88516817ed40b9866361'};
export const firebaseApp=getApps().length?getApp():initializeApp(config);
export const auth=getAuth(firebaseApp);
export const db=getFirestore(firebaseApp);
const provider=new GoogleAuthProvider();
export async function observeAuth(callback){await setPersistence(auth,browserLocalPersistence);return onAuthStateChanged(auth,callback)}
export const loginWithGoogle=()=>signInWithPopup(auth,provider);
export const logout=()=>signOut(auth);
