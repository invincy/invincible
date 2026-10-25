import React,{useEffect,useRef,useState} from 'react';
import {focusTodayItem} from './today-actions';
import {moveWorkspaceTask} from './move-task';
export default function TodayPlanPanel({uid,plan,tasks,onClose,onInspect}) {
  const dialog=useRef(null),previous=useRef(document.activeElement),[busy,setBusy]=useState(false),[error,setError]=useState(''),[taskId,setTaskId]=useState('');
  useEffect(()=>{dialog.current.showModal();return()=>previous.current?.focus?.({preventScroll:true});},[]);
  const act=async callback=>{setError('');setBusy(true);try{await callback();}catch(failure){setError(failure.message||'The plan could not be saved. Try again.');}finally{setBusy(false);}};
  const available=tasks.filter(task=>task.status!=='Done'&&!plan.items.some(item=>item.taskId===task.id&&!item.done&&!item.missing));
  return <dialog ref={dialog} className="v2-idea-dialog v2-today-dialog" aria-labelledby="today-plan-title" onCancel={event=>{event.preventDefault();if(!busy)onClose();}}>
    <header><h2 id="today-plan-title">Today’s plan</h2><button aria-label="Close today's plan" disabled={busy} onClick={onClose}>×</button></header>
    {error&&<p role="alert">{error}</p>}
    {!plan.items.length&&<p>No tasks planned yet. Add a project below or move it into Today in My Workspace.</p>}
    <ol className="v2-today-list">{plan.items.map((item,index)=><li key={item.id} className={item.id===plan.active?.id?'is-active':''}>
      <span>{item.done?'✓':index+1}</span><div><strong>{item.missing?'Unavailable item':item.step?.title||item.step?.text||item.task?.title}</strong><small>{item.task?.title}{item.done?' · Done':item.missing?' · Missing':''}</small></div>
      {!item.done&&!item.missing&&<button disabled={busy||item.id===plan.active?.id} onClick={()=>act(()=>focusTodayItem(uid,item.id))}>{item.id===plan.active?.id?'In focus':'Focus'}</button>}
      {!item.missing&&<button aria-label={'Open project: '+item.task.title} disabled={busy} onClick={()=>{onClose();onInspect(item.taskId);}}>↗</button>}
    </li>)}</ol>
    {available.length>0&&<form className="v2-today-add" onSubmit={event=>{event.preventDefault();if(taskId)act(async()=>{await moveWorkspaceTask(uid,taskId,'Today',{ensurePlan:true});setTaskId('');});}}><label><span>Add project</span><select aria-label="Add project to today" value={taskId} disabled={busy} onChange={event=>setTaskId(event.target.value)}><option value="">Choose project</option>{available.map(task=><option key={task.id} value={task.id}>{task.title}</option>)}</select></label><button disabled={busy||!taskId}>Add</button></form>}
  </dialog>;
}
