import {Timestamp,collection,deleteDoc,doc,onSnapshot,runTransaction,serverTimestamp,setDoc,updateDoc} from 'firebase/firestore';
import {db} from './firebase';
import {asDate,completeReminder,completedTime,expireReminder,migrateQuickTodo,migratedReminderId,reminderRetention,restoreReminder,todoAsReminder} from './reminder-model';
const api={db,doc,runTransaction,serverTimestamp,Timestamp};
export function watchReminders(uid,onItems,onError) {
  if(!uid){onItems([],false);return()=>{};}
  let alive=true,reminders=[],legacy=[],ready=false,cached=false;
  const pending=new Set(),cleaning=new Set();
  const emit=()=>{
    if(!alive||!ready)return;
    const ids=new Set(reminders.map(item=>item.id));
    onItems([...reminders,...legacy.filter(item=>!ids.has(migratedReminderId(item.id))).map(item=>({...todoAsReminder(item,item.id,api),id:migratedReminderId(item.id),legacyId:item.id}))],cached);
  };
  const clean=()=>{
    if(!alive)return;
    const cutoff=Date.now()-reminderRetention;
    for(const item of reminders){
      const done=completedTime(item);
      if(!item.completed||done===null||done>cutoff||cleaning.has(item.id))continue;
      cleaning.add(item.id);expireReminder(api,uid,item.id,cutoff,()=>alive).catch(()=>{if(alive)onError(Error('Completed reminders could not be cleared. They remain saved.'));}).finally(()=>cleaning.delete(item.id));
    }
  };
  const stop=onSnapshot(collection(db,'users',uid,'reminders'),{includeMetadataChanges:true},snapshot=>{
    if(!alive)return;
    reminders=snapshot.docs.map(row=>({...row.data({serverTimestamps:'estimate'}),id:row.id}));ready=true;cached=Boolean(snapshot.metadata?.fromCache);emit();clean();
  },error=>{if(alive)onError(error);});
  const stopLegacy=onSnapshot(collection(db,'users',uid,'quickTodos'),snapshot=>{
    if(!alive)return;
    legacy=snapshot.docs.map(row=>({...row.data({serverTimestamps:'estimate'}),id:row.id}));emit();
    for(const item of legacy){
      if(pending.has(item.id))continue;pending.add(item.id);
      migrateQuickTodo(api,uid,item.id,()=>alive).catch(()=>{if(alive)onError(Error('Some older to-dos could not sync yet. Your items are still saved.'));}).finally(()=>pending.delete(item.id));
    }
  },error=>{if(alive)onError(error);});
  const timer=setInterval(clean,60000);window.addEventListener('focus',clean);
  return()=>{alive=false;stop();stopLegacy();clearInterval(timer);window.removeEventListener('focus',clean);};
}
const ensure=async(uid,item)=>{if(item.legacyId)await migrateQuickTodo(api,uid,item.legacyId);return doc(db,'users',uid,'reminders',item.id);};
export async function saveReminder(uid,item,{title,dueAt=null,repeat='none'}) {
  const due=asDate(dueAt);
  if(dueAt!==null&&!Number.isFinite(due.getTime()))throw Error('Enter a valid date and time.');
  const data={title:title.trim(),dueAt:dueAt===null?null:Timestamp.fromDate(due),repeat:dueAt===null?'none':repeat,snoozed:false,updatedAt:serverTimestamp()};
  if(item)await updateDoc(await ensure(uid,item),data);
  else await setDoc(doc(collection(db,'users',uid,'reminders'),crypto.randomUUID()),{...data,completed:false,completedAt:null,createdAt:serverTimestamp()});
}
export async function setReminderDone(uid,item,done){await ensure(uid,item);return done?completeReminder(api,uid,item.id):restoreReminder(api,uid,item.id);}
export async function deleteReminder(uid,item){return deleteDoc(await ensure(uid,item));}
export async function snoozeReminder(uid,item){return updateDoc(await ensure(uid,item),{dueAt:Timestamp.fromDate(new Date(Math.max(Date.now(),asDate(item.dueAt).getTime()||0)+3600000)),snoozed:true,updatedAt:serverTimestamp()});}
