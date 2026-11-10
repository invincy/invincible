import {auth,authReady,db} from '../shared/firebase-client.js';
import {collection,doc,setDoc,deleteDoc,getDocs,query,orderBy,limit,startAfter} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';

// Script/settings only. Never store generated audio or credentials in Firestore.
export function createTtsHistoryClient(uid){
 if(!uid)throw Error('Sign in to open voiceover history.');
 async function ready(){await authReady;if(auth.currentUser?.uid!==uid)throw Error('Your account changed. Reopen voiceover history.');}
 function record(id){if(!/^[a-zA-Z0-9-]{1,100}$/.test(id))throw Error('Invalid voiceover history ID.');return doc(db,'users',uid,'voiceoverHistory',id);}
 return {
  async list(after=null){await ready();const page=await getDocs(query(collection(db,'users',uid,'voiceoverHistory'),orderBy('createdAt','desc'),...(after?[startAfter(after)]:[]),limit(25)));await ready();return {entries:page.docs.map(d=>({...d.data(),id:d.id})),cursor:page.size===25?page.docs.at(-1):null};},
  async save(entry){await ready();await setDoc(record(entry.id),entry);await ready();},
  async remove(id){await ready();await deleteDoc(record(id));await ready();}
 };
}
