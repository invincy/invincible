import React,{useEffect,useState} from 'react';
import {completeTodayItem} from './today-actions';
import {deleteReminder,saveReminder,setReminderDone,watchReminders} from '../src/reminder-store';
import {asDate,calendarLink,completedTime} from '../src/reminder-model';

export default function DashboardReminders({uid,priority,onOpen}) {
  const [items,setItems]=useState([]),[title,setTitle]=useState(''),[schedule,setSchedule]=useState('');
  const [busy,setBusy]=useState(false),[error,setError]=useState(''),[loaded,setLoaded]=useState(false);
  useEffect(()=>{setItems([]);setLoaded(false);return watchReminders(uid,rows=>{setItems(rows);setLoaded(true);},failure=>setError(failure.message||'Could not load reminders.'));},[uid]);
  async function run(action){if(busy)return;setBusy(true);setError('');try{await action();}catch(failure){setError(failure.message||'Could not save. Try again.');}finally{setBusy(false);}}
  function add(event){event.preventDefault();if(!title.trim())return;void run(async()=>{await saveReminder(uid,null,{title,dueAt:schedule?new Date(schedule):null});setTitle('');setSchedule('');});}
  const visible=[...items].sort((a,b)=>Number(Boolean(a.completed))-Number(Boolean(b.completed))||(a.completed?(completedTime(b)||0)-(completedTime(a)||0):(asDate(a.dueAt).getTime()||Infinity)-(asDate(b.dueAt).getTime()||Infinity)));
  const priorityTitle=priority?.step?.title||priority?.step?.text||priority?.task?.title;
  return <section className="v2-guide-todos" aria-labelledby="dashboard-reminders-heading">
    <div className="v2-todo-priority"><span>Today’s priority</span>{priorityTitle?<label><input type="checkbox" disabled={busy} checked={false} onChange={()=>void run(()=>completeTodayItem(uid,priority.id))}/><span>{priorityTitle}</span></label>:<p>No priority selected</p>}</div>
    <h2 id="dashboard-reminders-heading">Reminders</h2>
    <form onSubmit={add}><div className="v2-todo-entry"><input aria-label="New reminder" placeholder="Add a reminder" value={title} maxLength={160} onChange={event=>setTitle(event.target.value)}/><button type="submit" disabled={busy||!title.trim()}>Add</button></div><details><summary>Set date and time</summary><input type="datetime-local" aria-label="Reminder date and time" value={schedule} onChange={event=>setSchedule(event.target.value)}/></details></form>
    {error&&<p role="alert">{error}</p>}{!loaded&&!error&&<p role="status">Loading reminders…</p>}
    <ul className="v2-todo-list">{visible.map(item=>{const due=asDate(item.dueAt);return <li key={item.id} data-done={Boolean(item.completed)}><label><input type="checkbox" disabled={busy} checked={Boolean(item.completed)} onChange={event=>{const done=event.target.checked;void run(()=>setReminderDone(uid,item,done));}}/><span>{item.title}</span></label><button type="button" aria-label={'Delete '+item.title} title="Delete" disabled={busy} onClick={()=>void run(()=>deleteReminder(uid,item))}>×</button>{Number.isFinite(due.getTime())&&<div className="v2-todo-schedule"><time dateTime={due.toISOString()}>{due.toLocaleString(undefined,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}</time>{!item.completed&&<a href={calendarLink(item)} target="_blank" rel="noopener noreferrer">Set Calendar alert ↗</a>}</div>}</li>;})}</ul>
    <a className="v2-reminders-open" href="/invincible/reminders/" onClick={event=>{if(onOpen&&!event.ctrlKey&&!event.metaKey&&!event.shiftKey){event.preventDefault();onOpen();}}}>All reminders <span aria-hidden="true">→</span></a>
  </section>;
}
