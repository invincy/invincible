import{useCallback,useEffect,useMemo,useRef,useState}from'react';
import{collection,doc,getDocs,onSnapshot,query as firestoreQuery,serverTimestamp,setDoc,where}from'firebase/firestore';
import{useAuth}from'./AuthContext';
import{db}from'./firebase';
import'./workday.css';

const blank=()=>({name:'My Workday',ownerUid:'',ownerEmail:'',editorEmails:[],tasks:[],routines:[]});
const newId=()=>crypto.randomUUID?.()||String(Date.now()+Math.random());
const localDate=(date=new Date())=>new Date(date.getTime()-date.getTimezoneOffset()*60000).toISOString().slice(0,10);
const normalizeEmail=value=>(value||'').trim().toLowerCase();
const formatDate=date=>new Intl.DateTimeFormat('en-IN',{weekday:'long',day:'numeric',month:'short',year:'numeric'}).format(new Date(date+'T12:00:00'));
const previousDate=date=>{const value=new Date(date+'T12:00:00');value.setDate(value.getDate()-1);return localDate(value)};
const taskLabel=task=>[task.action,task.subject].filter(Boolean).join(' — ')||(task.title||task.outcome||'Untitled work').trim();
const taskDetail=task=>(task.outcome||task.progressNote||'').trim();
const cleanSentence=value=>{const text=(value||'').trim().replace(/[.]+$/,'');return text?text.charAt(0).toUpperCase()+text.slice(1)+'.':''};
const reportSentence=(task,note='')=>{const action=(task.action||'').trim(),subject=(task.subject||'').trim(),key=action.toLowerCase();let line='';if(key==='mailed')line=subject?`Mailed to ${subject}`:'Mailed';else if(key==='telephonic talk'||key==='had telephonic talk')line=subject?`Had telephonic talk with ${subject}`:'Had telephonic talk';else line=[action,subject].filter(Boolean).join(' ')||(task.title||task.outcome||'').trim();const detail=(note||taskDetail(task)).trim().replace(/[.]+$/,'');return cleanSentence(line+(detail?` — ${detail}`:''))};

function Modal({title,eyebrow,children,onClose,wide=false}){
 return <div className="wd-modal-backdrop" onMouseDown={event=>event.target===event.currentTarget&&onClose()}><section className={'wd-modal'+(wide?' wide':'')} role="dialog" aria-modal="true"><header><div><span className="wd-eyebrow">{eyebrow}</span><h2>{title}</h2></div><button type="button" onClick={onClose}>×</button></header>{children}</section></div>
}

export function WorkdayPage(){
 const{user}=useAuth();
 const[spaces,setSpaces]=useState([]),[spaceId,setSpaceId]=useState(''),[work,setWork]=useState(blank),[selectedDate,setSelectedDate]=useState(localDate()),[sync,setSync]=useState('Finding workspace…'),[toast,setToast]=useState('');
 const[action,setAction]=useState(''),[subject,setSubject]=useState(''),[outcome,setOutcome]=useState('');
 const[pendingTask,setPendingTask]=useState(null),[editingTask,setEditingTask]=useState(null),[routineOpen,setRoutineOpen]=useState(false),[shareOpen,setShareOpen]=useState(false),[reportOpen,setReportOpen]=useState(false);
 const saveTimer=useRef(),toastTimer=useRef(),rolling=useRef(false),selectedDateRef=useRef(selectedDate);
 selectedDateRef.current=selectedDate;
 const notify=message=>{setToast(message);clearTimeout(toastTimer.current);toastTimer.current=setTimeout(()=>setToast(''),2000)};

 useEffect(()=>{let cancelled=false;(async()=>{
  setSync('Finding workspace…');
  const owned=firestoreQuery(collection(db,'workdaySpaces'),where('ownerUid','==',user.uid));
  const shared=firestoreQuery(collection(db,'workdaySpaces'),where('editorEmails','array-contains',normalizeEmail(user.email)));
  const[ownedSnap,sharedSnap]=await Promise.all([getDocs(owned),getDocs(shared)]),map=new Map();
  [...ownedSnap.docs,...sharedSnap.docs].forEach(item=>map.set(item.id,{id:item.id,...item.data()}));
  let found=[...map.values()];
  if(!found.length){const id=newId(),fresh={...blank(),ownerUid:user.uid,ownerEmail:normalizeEmail(user.email),name:(user.displayName?.split(' ')[0]||'My')+' Workday',createdAt:serverTimestamp(),updatedAt:serverTimestamp()};await setDoc(doc(db,'workdaySpaces',id),fresh);found=[{id,...fresh}]}
  if(cancelled)return;setSpaces(found);const preferred=found.find(space=>space.ownerUid!==user.uid)||found[0];setSpaceId(preferred.id);
 })().catch(error=>{console.error(error);setSync('Could not open workspace')});return()=>{cancelled=true}},[user]);

 useEffect(()=>{if(!spaceId)return;setSync('Syncing workspace…');return onSnapshot(doc(db,'workdaySpaces',spaceId),snapshot=>{
  if(!snapshot.exists())return;
  let next={...blank(),...snapshot.data(),tasks:snapshot.data().tasks||[],routines:snapshot.data().routines||[],editorEmails:snapshot.data().editorEmails||[]};
  if(!rolling.current&&selectedDateRef.current===localDate()){
   const today=localDate(),existing=new Set(next.tasks.filter(task=>task.date===today&&task.carryFromId).map(task=>task.carryFromId)),latest=new Map();
   next.tasks.filter(task=>task.date<today&&!task.archived&&task.status!=='done'&&!task.rolledForward).sort((a,b)=>b.date.localeCompare(a.date)).forEach(task=>{const key=task.chainId||task.id;if(!latest.has(key))latest.set(key,task)});
   const carry=[...latest.values()].filter(task=>!existing.has(task.id));
   if(carry.length){rolling.current=true;const sourceIds=new Set(carry.map(task=>task.id));next={...next,tasks:[...next.tasks.map(task=>sourceIds.has(task.id)?{...task,rolledForward:true}:task),...carry.map(task=>({...task,id:newId(),date:today,status:task.status==='progress'?'progress':'todo',carryFromId:task.id,chainId:task.chainId||task.id,rolledForward:false,createdAt:Date.now(),completedAt:null}))]};setDoc(doc(db,'workdaySpaces',spaceId),{...next,updatedAt:serverTimestamp()},{merge:true}).finally(()=>{rolling.current=false});notify(`${carry.length} unfinished ${carry.length===1?'task':'tasks'} carried forward`)}
  }
  setWork(next);setSpaces(current=>current.map(space=>space.id===spaceId?{id:spaceId,...next}:space));setSync('Cloud synced');
 },error=>{console.error(error);setSync('Sync failed')})},[spaceId]);

 const persist=useCallback((next,immediate=false)=>{clearTimeout(saveTimer.current);const execute=async()=>{setSync('Saving…');try{await setDoc(doc(db,'workdaySpaces',spaceId),{...next,updatedAt:serverTimestamp()},{merge:true});setSync('Saved')}catch(error){console.error(error);setSync('Save failed');notify('Could not save changes')}};if(immediate)return execute();saveTimer.current=setTimeout(execute,220)},[spaceId]);
 const updateWork=(updater,immediate=false)=>setWork(current=>{const next=typeof updater==='function'?updater(current):updater;persist(next,immediate);return next});
 const tasks=useMemo(()=>work.tasks.filter(task=>task.date===selectedDate&&!task.archived),[work.tasks,selectedDate]);
 const groups=useMemo(()=>({todo:tasks.filter(task=>task.status==='todo'),progress:tasks.filter(task=>task.status==='progress'),pending:tasks.filter(task=>task.status==='pending'),done:tasks.filter(task=>task.status==='done')}),[tasks]);
 const isOwner=work.ownerUid===user.uid;
 const shiftDay=amount=>{const date=new Date(selectedDate+'T12:00:00');date.setDate(date.getDate()+amount);setSelectedDate(localDate(date))};

 const addTask=event=>{event.preventDefault();if(!action.trim()&&!subject.trim()&&!outcome.trim())return notify('Write at least one part of the work');const title=[action.trim(),subject.trim()].filter(Boolean).join(' — ')||outcome.trim(),task={id:newId(),chainId:'',title,action:action.trim(),subject:subject.trim(),outcome:outcome.trim(),date:selectedDate,status:'todo',progressNote:'',pendingReason:'',nextAction:'',createdAt:Date.now(),completedAt:null,rolledForward:false};updateWork(current=>({...current,tasks:[...current.tasks,task]}));setAction('');setSubject('');setOutcome('')};
 const changeStatus=(task,status)=>{if(status==='pending')return setPendingTask(task);updateWork(current=>({...current,tasks:current.tasks.map(item=>item.id===task.id?{...item,status,completedAt:status==='done'?Date.now():null,pendingReason:'',nextAction:''}:item)}))};
 const savePending=event=>{event.preventDefault();const data=new FormData(event.currentTarget);updateWork(current=>({...current,tasks:current.tasks.map(item=>item.id===pendingTask.id?{...item,status:'pending',pendingReason:data.get('pendingReason').trim(),nextAction:data.get('nextAction').trim(),completedAt:null}:item)}));setPendingTask(null)};
 const saveEdit=event=>{event.preventDefault();const data=new FormData(event.currentTarget),nextAction=data.get('action').trim(),nextSubject=data.get('subject').trim(),nextOutcome=data.get('outcome').trim();if(!nextAction&&!nextSubject&&!nextOutcome)return notify('Keep at least one field');updateWork(current=>({...current,tasks:current.tasks.map(item=>item.id===editingTask.id?{...item,action:nextAction,subject:nextSubject,outcome:nextOutcome,title:[nextAction,nextSubject].filter(Boolean).join(' — ')||nextOutcome,progressNote:''}:item)}));setEditingTask(null)};
 const deleteTask=()=>{if(!confirm(`Delete “${editingTask.title}”?`))return;updateWork(current=>({...current,tasks:current.tasks.filter(item=>item.id!==editingTask.id)}));setEditingTask(null)};

 const addRoutine=title=>updateWork(current=>({...current,routines:[...current.routines,{id:newId(),title}]}));
 const deleteRoutine=id=>updateWork(current=>({...current,routines:current.routines.filter(item=>item.id!==id)}));
 const loadRoutines=()=>{const existing=new Set(tasks.map(task=>task.title.toLowerCase())),fresh=work.routines.filter(item=>!existing.has(item.title.toLowerCase()));if(!fresh.length)return work.routines.length?notify('Today’s routine is already added'):setRoutineOpen(true);updateWork(current=>({...current,tasks:[...current.tasks,...fresh.map(item=>({id:newId(),chainId:'',title:item.title,date:selectedDate,status:'todo',progressNote:'',pendingReason:'',nextAction:'',createdAt:Date.now(),completedAt:null,rolledForward:false,routineId:item.id}))]}));notify(`${fresh.length} routine ${fresh.length===1?'task':'tasks'} added`)};
 const invite=async email=>{const value=normalizeEmail(email);if(!value||value===work.ownerEmail||work.editorEmails.includes(value))return;const next={...work,editorEmails:[...work.editorEmails,value]};setWork(next);await persist(next,true);notify('Workspace shared with '+value)};
 const removeEditor=async value=>{const next={...work,editorEmails:work.editorEmails.filter(email=>email!==value)};setWork(next);await persist(next,true);notify('Access removed')};

 const report=useMemo(()=>{const section=(title,list,note)=>list.length?`${title}\n${list.map(task=>`• ${reportSentence(task,note(task))}`).join('\n')}\n\n`:'';let text=`Daily Work Report — ${new Intl.DateTimeFormat('en-GB').format(new Date(selectedDate+'T12:00:00'))}\n\n`;text+=section('✅ Jobs Completed',groups.done,()=>'');text+=section('🔄 Jobs In Progress',groups.progress,()=>'');text+=section('⏳ Pending / Backlog',[...groups.pending,...groups.todo],task=>task.pendingReason||'');const next=tasks.filter(task=>task.status!=='done').map(task=>task.nextAction||(task.status==='progress'?`Finish ${taskLabel(task)}`:`Complete ${taskLabel(task)}`));if(next.length)text+=`📌 Next Working Day\n${next.map(value=>`• ${cleanSentence(value)}`).join('\n')}\n`;return text.trim()},[tasks,groups,selectedDate]);
 const copyReport=async()=>{try{await navigator.clipboard.writeText(report);notify('Report copied — ready for WhatsApp')}catch{notify('Clipboard access was blocked')}};

 return <div className="workday-shell">
  <header className="wd-hero"><div><span className="wd-eyebrow">DAILY OPERATIONS</span><h1>Workday</h1><p>Do the work. The report writes itself.</p></div><div className="wd-space-actions"><select value={spaceId} onChange={event=>setSpaceId(event.target.value)}>{spaces.map(space=><option key={space.id} value={space.id}>{space.name||'Workday'}{space.ownerUid===user.uid?'':' · shared with me'}</option>)}</select>{isOwner&&<button className="wd-ghost" onClick={()=>setShareOpen(true)}>Share</button>}</div></header>
  <div className={'wd-connection '+(sync==='Cloud synced'||sync==='Saved'?'ok':sync.includes('failed')||sync.includes('Could not')?'error':'')}>{sync}</div>
  <section className="wd-day-strip"><div className="wd-date-control"><button onClick={()=>shiftDay(-1)}>‹</button><label><strong>{selectedDate===localDate()?'Today':selectedDate===previousDate(localDate())?'Yesterday':formatDate(selectedDate).split(',')[0]}</strong><span>{formatDate(selectedDate)}</span><input type="date" value={selectedDate} max={localDate()} onChange={event=>setSelectedDate(event.target.value)}/></label><button disabled={selectedDate>=localDate()} onClick={()=>shiftDay(1)}>›</button></div><div className="wd-metrics"><span><strong>{tasks.length}</strong> Tasks</span><span className="done"><strong>{groups.done.length}</strong> Done</span><span className="progress"><strong>{groups.progress.length}</strong> In progress</span><span className="pending"><strong>{groups.pending.length}</strong> Pending</span></div></section>
  <form className="wd-composer" onSubmit={addTask}><div className="wd-composer-head"><div><span className="wd-eyebrow">QUICK ENTRY</span><strong>Add work without filling a form</strong></div><span>Any one field is enough</span></div><div className="wd-action-chips">{['Reviewed','Mailed','Telephonic talk','Confirmed','Processed'].map(value=><button type="button" key={value} onClick={()=>setAction(value)}>{value}</button>)}</div><div className="wd-task-builder"><label><span><b>1</b> Action</span><input value={action} onChange={event=>setAction(event.target.value)} placeholder="Reviewed, mailed, called…"/></label><label><span><b>2</b> To whom / what</span><input value={subject} onChange={event=>setSubject(event.target.value)} placeholder="ABC Pvt Ltd, PF challan…"/></label><label><span><b>3</b> Outcome / further action</span><input value={outcome} onChange={event=>setOutcome(event.target.value)} placeholder="Confirmed, awaiting data, call tomorrow…"/></label><button>Add work</button></div></form>
  <section className="wd-utility"><button className="wd-ghost" onClick={loadRoutines}>Add today’s routine</button><button className="wd-text" onClick={()=>setRoutineOpen(true)}>Recurring work</button><span/><button className="wd-primary" onClick={()=>setReportOpen(true)}>Generate daily report</button></section>
  {tasks.length?<section className="wd-board">{['todo','progress','pending','done'].map(status=><article className="wd-lane" data-lane={status} key={status}><header><i/><h2>{{todo:'To Do',progress:'In Progress',pending:'Pending',done:'Done'}[status]}</h2><b>{groups[status].length}</b></header><div>{groups[status].sort((a,b)=>(a.order||a.createdAt||0)-(b.order||b.createdAt||0)).map(task=><article className={'wd-task-card'+(task.carryFromId?' carried':'')} key={task.id}><div className="wd-task-top"><div>{task.action&&<span className="wd-task-action">{task.action}</span>}<p>{task.subject||(!task.action?task.title:'')}</p></div><button onClick={()=>setEditingTask(task)}>•••</button></div>{task.status==='pending'&&(task.pendingReason||task.nextAction)?<div className="wd-task-note">{task.pendingReason&&<strong>{task.pendingReason}</strong>}{task.nextAction&&<span>Next: {task.nextAction}</span>}</div>:taskDetail(task)&&taskDetail(task)!==taskLabel(task)?<div className="wd-task-outcome">{taskDetail(task)}</div>:null}<div className="wd-status-actions">{[['todo','○'],['progress','▶'],['pending','Ⅱ'],['done','✓']].map(([value,icon])=><button key={value} className={task.status===value?'active':''} data-status={value} onClick={()=>changeStatus(task,value)}>{icon}</button>)}</div></article>)}</div></article>)}</section>:<section className="wd-empty"><span>✦</span><h2>Clear runway</h2><p>Add the first task, or load today’s routine.</p></section>}
  <button className="wd-primary wd-mobile-report" onClick={()=>setReportOpen(true)}>Generate daily report</button>
  {pendingTask&&<Modal eyebrow="BLOCKER NOTE" title="What is holding this up?" onClose={()=>setPendingTask(null)}><p className="wd-dialog-task">{taskLabel(pendingTask)}</p><form className="wd-form" onSubmit={savePending}><label>Why pending? <small>optional</small><textarea name="pendingReason" defaultValue={pendingTask.pendingReason||''} rows="3" placeholder="Waiting for client data"/></label><label>Next action <small>optional</small><textarea name="nextAction" defaultValue={pendingTask.nextAction||''} rows="2" placeholder="Complete once data is received"/></label><footer><button type="button" className="wd-ghost" onClick={()=>setPendingTask(null)}>Cancel</button><button className="wd-primary">Mark pending</button></footer></form></Modal>}
  {editingTask&&<Modal eyebrow="TASK DETAILS" title="Edit work" onClose={()=>setEditingTask(null)}><form className="wd-form" onSubmit={saveEdit}><label>Action <small>optional</small><input name="action" defaultValue={editingTask.action||''}/></label><label>To whom / what <small>optional</small><input name="subject" defaultValue={editingTask.subject||editingTask.title||''}/></label><label>Outcome / further action <small>optional</small><textarea name="outcome" defaultValue={taskDetail(editingTask)} rows="3"/></label><footer className="split"><button type="button" className="wd-danger" onClick={deleteTask}>Delete</button><span/><button type="button" className="wd-ghost" onClick={()=>setEditingTask(null)}>Cancel</button><button className="wd-primary">Save</button></footer></form></Modal>}
  {routineOpen&&<RoutineModal routines={work.routines} onAdd={addRoutine} onDelete={deleteRoutine} onClose={()=>setRoutineOpen(false)}/>}
  {shareOpen&&<ShareModal emails={work.editorEmails} onInvite={invite} onRemove={removeEditor} onClose={()=>setShareOpen(false)}/>}
  {reportOpen&&<Modal eyebrow="READY TO SEND" title="Daily report" wide onClose={()=>setReportOpen(false)}><textarea className="wd-report" readOnly value={report}/><footer className="wd-modal-actions"><button className="wd-ghost" onClick={()=>setReportOpen(false)}>Close</button><button className="wd-primary" onClick={copyReport}>Copy report</button></footer></Modal>}
  <div className={'wd-toast'+(toast?' show':'')}>{toast}</div>
 </div>
}

function RoutineModal({routines,onAdd,onDelete,onClose}){
 const[title,setTitle]=useState('');
 return <Modal eyebrow="REUSABLE LIST" title="Recurring work" onClose={onClose}><div className="wd-list">{routines.length?routines.map(item=><div key={item.id}><span>{item.title}</span><button onClick={()=>onDelete(item.id)}>Delete</button></div>):<p>No recurring work saved yet.</p>}</div><form className="wd-inline-form" onSubmit={event=>{event.preventDefault();if(!title.trim())return;onAdd(title.trim());setTitle('')}}><input value={title} onChange={event=>setTitle(event.target.value)} placeholder="Attendance verification"/><button className="wd-primary">Add</button></form><p className="wd-hint">Save routine jobs once, then add all of them to any workday in one tap.</p></Modal>
}
function ShareModal({emails,onInvite,onRemove,onClose}){
 const[email,setEmail]=useState('');
 return <Modal eyebrow="WORKSPACE ACCESS" title="Share Workday" onClose={onClose}><p className="wd-hint">Editors can add and update work, but cannot change access.</p><form className="wd-inline-form" onSubmit={async event=>{event.preventDefault();await onInvite(email);setEmail('')}}><input type="email" required value={email} onChange={event=>setEmail(event.target.value)} placeholder="name@gmail.com"/><button className="wd-primary">Invite</button></form><div className="wd-list">{emails.length?emails.map(value=><div key={value}><span>{value}</span><button onClick={()=>onRemove(value)}>Remove</button></div>):<p>Only you have access.</p>}</div></Modal>
}
