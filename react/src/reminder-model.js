// Calendar dates are local: advancing a day preserves the scheduled wall-clock time across DST.
export const asDate = value => value?.toDate ? value.toDate() : new Date(value ?? NaN);
export const reminderRetention = 7 * 24 * 60 * 60 * 1000;
export const completedTime = item => item.completedAt?.toMillis?.() ?? (item.completedAt instanceof Date ? item.completedAt.getTime() : typeof item.completedAt==='number'?item.completedAt:null);
export const dateKey = (date = new Date()) => new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
export function groupReminders(items, now = new Date()) {
  const todayKey = dateKey(now), overdue = [], today = [], upcoming = {}, anytime=[];
  for (const item of items) {
    if (item.completed) continue;
    const due = asDate(item.dueAt);
    if (!Number.isFinite(due.getTime())) {anytime.push(item);continue;}
    const key = dateKey(due);
    if (key < todayKey) overdue.push(item);
    else if (key === todayKey) today.push(item);
    else (upcoming[key] ||= []).push(item);
  }
  return {overdue, today, anytime, upcoming: Object.fromEntries(Object.entries(upcoming).sort(([a], [b]) => a.localeCompare(b)))};
}

export const migratedReminderId = id => 'quick_'+id;
export function todoAsReminder(item, id, api) {
  const date=asDate(item.dueAt),scheduled=Number.isFinite(date.getTime());
  return {...item,title:item.title||'Untitled reminder',dueAt:scheduled?api.Timestamp.fromDate(date):null,
    completed:Boolean(item.completedAt),repeat:'none',snoozed:false,sourceQuickTodoId:id};
}
// Move, never copy-and-delete across separate requests. Concurrent browsers and
// retries share one destination and cannot overwrite a reminder already edited.
export async function migrateQuickTodo(api,uid,id,isCurrent=()=>true) {
  const {db,doc,runTransaction}=api,targetId=migratedReminderId(id);
  return runTransaction(db,async tx=>{
    const source=doc(db,'users',uid,'quickTodos',id),target=doc(db,'users',uid,'reminders',targetId);
    const [old,next]=await Promise.all([tx.get(source),tx.get(target)]);
    if(!isCurrent())throw Error('Account changed. Please reopen Reminders.');
    if(!old.exists())return targetId;
    if(next.exists()&&next.data().sourceQuickTodoId!==id)throw Error('This item could not be combined safely. Please retry.');
    if(!next.exists())tx.set(target,todoAsReminder(old.data(),id,api));
    tx.delete(source);
    return targetId;
  });
}
export async function restoreReminder(api,uid,id) {
  const ref=api.doc(api.db,'users',uid,'reminders',id);
  return api.runTransaction(api.db,async tx=>{
    const row=await tx.get(ref);if(!row.exists())throw Error('This reminder is no longer available.');
    tx.update(ref,{completed:false,completedAt:null,updatedAt:api.serverTimestamp()});
  });
}
export async function expireReminder(api,uid,id,cutoff,isCurrent=()=>true) {
  const ref=api.doc(api.db,'users',uid,'reminders',id);
  return api.runTransaction(api.db,async tx=>{
    const row=await tx.get(ref),item=row.exists()?row.data():null,done=item&&completedTime(item);
    if(!isCurrent())return;
    if(item?.completed&&done!==null&&done<=cutoff)tx.delete(ref);
  });
}
export function calendarLink(item) {
  const due=asDate(item.dueAt).getTime();
  const utc=value=>new Date(value).toISOString().replace(/[-:]|\.\d{3}/g,'');
  const url=new URL('https://calendar.google.com/calendar/render');
  url.search=new URLSearchParams({action:'TEMPLATE',text:item.title,dates:utc(due)+'/'+utc(due+15*60*1000)});
  return url.href;
}
export function nextDailyDue(value, now = new Date()) {
  const next = asDate(value);
  next.setDate(next.getDate() + 1);
  if (dateKey(next) <= dateKey(now)) {
    next.setFullYear(now.getFullYear(), now.getMonth(), now.getDate());
    next.setDate(next.getDate() + 1);
  }
  return next;
}
// Read fresh data inside the transaction. Both writes commit together, and a completed
// source is a no-op even if a second device or a retried request completes it again.
export async function completeReminder(api, uid, id, now = new Date()) {
  const {db, doc, runTransaction, Timestamp, serverTimestamp} = api;
  const source = doc(db, 'users', uid, 'reminders', id);
  return runTransaction(db, async transaction => {
    const snapshot = await transaction.get(source);
    if (!snapshot.exists() || snapshot.data().completed) return false;
    const current = snapshot.data();
    if (current.repeat === 'daily') {
      const due = nextDailyDue(current.dueAt, now), seriesId = current.seriesId || id;
      const next = doc(db, 'users', uid, 'reminders', `daily_${seriesId}_${due.getTime()}`);
      const nextSnapshot = await transaction.get(next);
      if (!nextSnapshot.exists()) transaction.set(next, {
        title: current.title, dueAt: Timestamp.fromDate(due), seriesId,
        repeat: 'daily', completed: false, snoozed: false,
        createdAt: serverTimestamp(), updatedAt: serverTimestamp()
      });
    }
    transaction.update(source, {completed: true, completedAt: serverTimestamp(), updatedAt: serverTimestamp()});
    return true;
  });
}
