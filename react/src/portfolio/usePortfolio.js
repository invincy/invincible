import {useEffect,useRef,useState} from 'react';
import {doc,onSnapshot,runTransaction,serverTimestamp,collection,getDocs,query,orderBy,limit} from 'firebase/firestore';
import {auth,db} from '../firebase';
import {useAuth} from '../AuthContext';
import {emptyPortfolio} from './model.mjs';
export function usePortfolio(){
 const {user,ready}=useAuth(),uid=user?.uid;
 const [loaded,setLoaded]=useState(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);const lock=useRef(false);
 useEffect(()=>{setLoaded(null);setError('');if(!ready||!uid)return;let active=true;return (()=>{const stop=onSnapshot(doc(db,'users',uid,'portfolio','main'),snap=>{if(active)setLoaded({uid,data:snap.exists()?{...emptyPortfolio(),...snap.data()}:emptyPortfolio()})},e=>{if(active)setError(e.message)});return()=>{active=false;stop()}})()},[uid,ready]);
 const state=loaded?.uid===uid?loaded.data:null;
 async function save(next,label){
 if(!uid||!state||lock.current)throw Error('Wait for portfolio to load');
 lock.current=true;setBusy(true);setError('');const expected=state.revision||0,operation=crypto.randomUUID();
 try{await runTransaction(db,async tx=>{
 if(auth.currentUser?.uid!==uid)throw Error('Account changed. Reload before saving.');
 const ref=doc(db,'users',uid,'portfolio','main'),snap=await tx.get(ref),old=snap.exists()?snap.data():emptyPortfolio();
 if((old.revision||0)!==expected)throw Error('Portfolio changed on another device. Review the latest data and retry.');
 const clean={...next,revision:expected+1};if(JSON.stringify(clean).length>700000)throw Error('Portfolio history is full. Export a backup before continuing.');
 tx.set(doc(db,'users',uid,'portfolioHistory',operation),{before:old,label,createdAt:serverTimestamp()});
 tx.set(ref,{...clean,updatedAt:serverTimestamp()});
 });}catch(e){setError(e.message);throw e}finally{lock.current=false;setBusy(false)}
 }
 async function undo(){
 if(!uid||!state)throw Error('Wait for portfolio to load');
 const result=await getDocs(query(collection(db,'users',uid,'portfolioHistory'),orderBy('createdAt','desc'),limit(1)));
 const before=result.docs[0]?.data().before;
 if(!before||(before.revision||0)!==(state.revision||0)-1)throw Error('Latest change cannot be undone from this view. Reload first.');
 await save({...before,revision:state.revision},'Undo last change');
 }
 return {state,save,undo,error,busy,uid};
}
