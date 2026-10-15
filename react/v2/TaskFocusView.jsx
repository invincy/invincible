import React, {useEffect, useMemo, useRef, useState} from 'react';
import {cleanStep, newId} from '../src/task-model';
import {saveTaskContent, taskSaveMessage} from './task-actions';
import {moveWorkspaceTask} from './move-task';
import {contentVersion, setStepDone, setSubstepDone, taskContent} from './task-content';
import {clearDraft, draftKey, readDraft, writeDraft} from './draft-store';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const fallbackPoint = index => ({x: 170 + index * 255, y: 250 + Math.sin(index * 1.35) * 115});
const checklist = notes => String(notes || '').split(/\r?\n/).map(line => line.match(/^\s*[-*]\s*\[([ xX])\]\s+(.+)$/)).filter(Boolean)
  .map(match => ({title: match[2].trim(), done: match[1].toLowerCase() === 'x'}));

function StepEditor({active, activeIndex, steps, busy, editActive, editSteps, addSubstep, setActiveStatus, completeActive}) {
  if (!active) return <div className="v2-flow-empty"><strong>Create the first step</strong><p>This project has no workflow yet.</p></div>;
  const convertible = checklist(active.notes).filter(item => !(active.substeps || []).some(child => child.title.trim().toLowerCase() === item.title.toLowerCase()));
  return <section className="v2-flow-card" aria-label={'Working on '+active.title}>
    <header><span>STEP {activeIndex + 1} · ACTIVE WORK</span><label className="v2-flow-step-check"><input type="checkbox" aria-label={`Complete step ${activeIndex + 1}`} checked={active.done} disabled={busy} onChange={event => editSteps(steps.map(step => step.id === active.id ? setStepDone(step, event.target.checked) : step))}/> Done</label><select aria-label="Current step status" value={active.status || (active.done ? 'Done' : 'Not Started')} disabled={busy} onChange={event => setActiveStatus(event.target.value)}>{['Not Started','Working','Blocked','Done'].map(value => <option key={value}>{value}</option>)}</select></header>
    <input className="v2-flow-card-title" aria-label={`Step ${activeIndex + 1} title`} value={active.title} disabled={busy} onChange={event => editActive({title: event.target.value})}/>
    <label>Description<textarea aria-label={`Step ${activeIndex + 1} notes`} value={active.notes || ''} disabled={busy} placeholder="Working notes, decisions, links…" onChange={event => editActive({notes: event.target.value})}/></label>
    <div className="v2-flow-subhead"><span>SUBTASKS</span><button type="button" disabled={busy} onClick={addSubstep}>+ Add</button></div>
    {(active.substeps || []).length ? <ul>{active.substeps.map((child, index) => <li key={child.id}>
      <input type="checkbox" aria-label={`Complete substep ${activeIndex + 1}.${index + 1}`} checked={child.done} disabled={busy} onChange={event => editSteps(steps.map(step => step.id === active.id ? setSubstepDone(step, child.id, event.target.checked) : step))}/>
      <input aria-label={`Substep ${activeIndex + 1}.${index + 1} title`} value={child.title} disabled={busy} onChange={event => editActive({substeps: active.substeps.map(item => item.id === child.id ? {...item, title: event.target.value} : item)})}/>
      <button type="button" aria-label={`Remove substep ${activeIndex + 1}.${index + 1}`} disabled={busy} onClick={() => editActive({substeps: active.substeps.filter(item => item.id !== child.id)})}>×</button>
    </li>)}</ul> : <p className="v2-flow-no-subtasks">Add the next small actions here.</p>}
    {convertible.length > 0 && <button className="v2-flow-convert" type="button" disabled={busy} onClick={() => editActive({substeps:[...(active.substeps || []), ...convertible.map(item => ({id:newId('c'), notes:'', ...item}))]})}>Convert {convertible.length} checklist item{convertible.length === 1 ? '' : 's'} to subtasks</button>}
    <footer><button type="button" onClick={completeActive}>{active.done ? 'Reopen step' : 'Complete step'} <span>→</span></button></footer>
  </section>;
}

export default function TaskFocusView({uid, task, onClose, onPaste}) {
  const key = draftKey(uid, 'editor', task?.id || 'missing');
  const initial = readDraft(key) || {id: task?.id, content: taskContent(task), base: contentVersion(task), dirty: false};
  const [draft, setDraft] = useState(initial);
  const firstId = initial.content.workflowLayout?.selectedStepId || initial.content.steps.find(step => !step.done)?.id || initial.content.steps[0]?.id || '';
  const [activeId, setActiveId] = useState(firstId);
  const [view, setView] = useState(initial.content.workflowLayout?.viewport || {x: 40, y: 40, zoom: .82});
  const [isMobile, setIsMobile] = useState(() => matchMedia('(max-width: 900px)').matches);
  const [busy, setBusy] = useState(false), [statusBusy, setStatusBusy] = useState(false), [error, setError] = useState(''), [stored, setStored] = useState(true);
  const canvas = useRef(null), back = useRef(null), previousFocus = useRef(document.activeElement), gesture = useRef(null), viewTimer = useRef(null);
  useEffect(() => {back.current?.focus({preventScroll:true}); return () => previousFocus.current?.focus?.({preventScroll:true});}, []);
  useEffect(() => {const media=matchMedia('(max-width: 900px)'),change=()=>setIsMobile(media.matches);media.addEventListener('change',change);return()=>media.removeEventListener('change',change);}, []);
  useEffect(() => {const escape = event => {if (event.key === 'Escape' && !busy && !statusBusy) onClose();}; window.addEventListener('keydown', escape); return () => window.removeEventListener('keydown', escape);}, [busy, statusBusy, onClose]);
  useEffect(() => {if (draft.dirty) setStored(writeDraft(key, draft));}, [draft, key]);
  useEffect(() => {if (task) setDraft(previous => previous.dirty ? previous : {...previous, id:task.id, content:taskContent(task), base:contentVersion(task)});}, [task]);
  useEffect(() => {if (!draft.content.steps.some(step => step.id === activeId)) setActiveId(draft.content.steps.find(step => !step.done)?.id || draft.content.steps[0]?.id || '');}, [draft.content.steps, activeId]);
  const activeIndex = draft.content.steps.findIndex(step => step.id === activeId), active = draft.content.steps[activeIndex];
  const progress = useMemo(() => ({total:draft.content.steps.length, done:draft.content.steps.filter(step => step.done).length}), [draft.content.steps]);
  const positions = useMemo(() => Object.fromEntries(draft.content.steps.map((step,index) => [step.id, draft.content.workflowLayout?.positions?.[step.id] || fallbackPoint(index)])), [draft.content.steps, draft.content.workflowLayout]);
  const edit = patch => {setError(''); setDraft(previous => ({...previous, dirty:true, content:{...previous.content, ...patch}}));};
  const editLayout = patch => edit({workflowLayout:{...draft.content.workflowLayout, ...patch}});
  const editSteps = steps => edit({steps});
  const editActive = patch => editSteps(draft.content.steps.map(step => step.id === activeId ? {...step, ...patch} : step));
  const persistView = next => {clearTimeout(viewTimer.current); viewTimer.current = setTimeout(() => editLayout({viewport:next, selectedStepId:activeId}), 180);};
  const selectStep = (id, center = true) => {
    setActiveId(id); editLayout({selectedStepId:id});
    if (center && canvas.current && positions[id]) {const rect=canvas.current.getBoundingClientRect(),point=positions[id],zoom=view.zoom,next={...view,x:rect.width*.46-point.x*zoom,y:rect.height*.38-point.y*zoom};setView(next);persistView(next);}
  };
  const fit = (remember = true) => {
    const points=Object.values(positions),rect=canvas.current?.getBoundingClientRect();if(!points.length||!rect)return;
    const minX=Math.min(...points.map(p=>p.x))-120,maxX=Math.max(...points.map(p=>p.x))+120,minY=Math.min(...points.map(p=>p.y))-150,maxY=Math.max(...points.map(p=>p.y))+270;
    const zoom=clamp(Math.min((rect.width-150)/(maxX-minX),(rect.height-100)/(maxY-minY)),.45,1.15),next={zoom,x:(rect.width-(maxX-minX)*zoom)/2-minX*zoom,y:(rect.height-(maxY-minY)*zoom)/2-minY*zoom};setView(next);if(remember)persistView(next);
  };
  useEffect(() => {if (initial.content.workflowLayout?.viewport) return; const frame=requestAnimationFrame(()=>fit(false));return()=>cancelAnimationFrame(frame);}, []);
  const save = async () => {setBusy(true);setError('');try{await saveTaskContent(uid,draft.id,draft.content,draft.base);clearDraft(key);setDraft(previous=>({...previous,base:contentVersion(previous.content),dirty:false}));}catch(failure){setError(taskSaveMessage(failure));}finally{setBusy(false);}};
  const discard = () => {clearDraft(key);const content=taskContent(task);setDraft({id:task.id,content,base:contentVersion(task),dirty:false});setActiveId(content.workflowLayout.selectedStepId||content.steps.find(step=>!step.done)?.id||content.steps[0]?.id||'');setView(content.workflowLayout.viewport||{x:40,y:40,zoom:.82});setError('');};
  const moveStatus = async status => {setStatusBusy(true);setError('');try{await moveWorkspaceTask(uid,task.id,status);}catch{setError('The project status could not be changed. Try again.');}finally{setStatusBusy(false);}};
  const addStep = () => {const step=cleanStep({id:newId('s'),title:'New step',notes:'',done:false,status:'Not Started'},draft.content.steps.length),steps=[...draft.content.steps,{...step,substeps:[]}],point=fallbackPoint(steps.length-1);edit({steps,workflowLayout:{...draft.content.workflowLayout,positions:{...positions,[step.id]:point},selectedStepId:step.id}});setActiveId(step.id);};
  const completeActive = () => {if(!active)return;const done=!active.done,steps=draft.content.steps.map(step=>step.id===active.id?setStepDone(step,done):step);editSteps(steps);if(done){const next=steps.slice(activeIndex+1).find(step=>!step.done)||steps.find(step=>!step.done);if(next)selectStep(next.id);}};
  const setActiveStatus = status => editSteps(draft.content.steps.map(step => step.id === active.id ? status === 'Done' ? setStepDone(step,true) : {...step,status,done:false} : step));
  const addSubstep = () => editActive({substeps:[...(active.substeps||[]),{id:newId('c'),title:'New substep',notes:'',done:false}]});
  const startPan = event => {if(event.button!==0||event.target.closest('button,input,textarea,select,.v2-flow-card'))return;gesture.current={type:'pan',id:event.pointerId,x:event.clientX,y:event.clientY,start:view};event.currentTarget.setPointerCapture(event.pointerId);};
  const startNodeDrag = (event,id) => {event.stopPropagation();if(event.button!==0)return;gesture.current={type:'node',id:event.pointerId,step:id,x:event.clientX,y:event.clientY,start:positions[id]};event.currentTarget.setPointerCapture(event.pointerId);};
  const movePointer = event => {const drag=gesture.current;if(!drag||drag.id!==event.pointerId)return;const dx=event.clientX-drag.x,dy=event.clientY-drag.y;if(drag.type==='pan')setView({...drag.start,x:drag.start.x+dx,y:drag.start.y+dy});else editLayout({positions:{...positions,[drag.step]:{x:drag.start.x+dx/view.zoom,y:drag.start.y+dy/view.zoom}}});};
  const endPointer = () => {if(gesture.current?.type==='pan')persistView(view);gesture.current=null;};
  const wheel = event => {event.preventDefault();const rect=canvas.current.getBoundingClientRect(),nextZoom=clamp(view.zoom*Math.exp(-event.deltaY*.0012),.45,1.8),cx=event.clientX-rect.left,cy=event.clientY-rect.top,next={zoom:nextZoom,x:cx-(cx-view.x)*(nextZoom/view.zoom),y:cy-(cy-view.y)*(nextZoom/view.zoom)};setView(next);persistView(next);};
  if(!task)return <section className="v2-task-focus" role="region" aria-label="Task workspace"><button ref={back} onClick={onClose}>← My Workspace</button><p role="alert">This project is no longer available.</p></section>;
  const curve=(a,b)=>{const bend=Math.max(80,(b.x-a.x)*.42);return `M ${a.x} ${a.y} C ${a.x+bend} ${a.y}, ${b.x-bend} ${b.y}, ${b.x} ${b.y}`;};
  const editorProps={active,activeIndex,steps:draft.content.steps,busy,editActive,editSteps,addSubstep,setActiveStatus,completeActive};
  return <section className="v2-task-focus v2-flow" role="region" aria-label={'Task workspace: '+(task.title||'Untitled project')}>
    <header className="v2-task-focus-header"><button ref={back} className="v2-task-back" type="button" aria-label="Close saved work" disabled={busy||statusBusy} onClick={onClose}>← <span>My Workspace</span></button><div className="v2-task-identity"><span>PROJECT FOCUS</span><input aria-label="Project title" maxLength={300} value={draft.content.title} disabled={busy} onChange={event=>edit({title:event.target.value})}/><input aria-label="Project description" value={draft.content.description} disabled={busy} placeholder="Define the finished result…" onChange={event=>edit({description:event.target.value})}/></div><div className="v2-task-progress"><strong>{progress.total?Math.round(progress.done/progress.total*100):0}%</strong><span>{progress.done} / {progress.total} steps</span><progress max={progress.total||1} value={progress.done}/></div><label className="v2-flow-project-status">Status<select aria-label="Project status" value={task.status||'Backlog'} disabled={statusBusy} onChange={event=>moveStatus(event.target.value)}>{['Backlog','In Progress','Today','Done'].map(value=><option key={value}>{value}</option>)}</select></label><div className="v2-task-save-actions"><span>{draft.dirty?stored?'Draft on this device':'Keep this view open':'Saved project'}</span>{draft.dirty&&<button type="button" disabled={busy} onClick={discard}>Discard draft</button>}<button type="button" className="v2-primary" disabled={busy||!draft.dirty} onClick={save}>{busy?'Saving…':'Save project'}</button></div></header>
    <div className="v2-flow-workbench">
      <nav className="v2-flow-tools" aria-label="Workflow tools"><button type="button" title="Fit workflow" aria-label="Fit workflow" onClick={fit}>◎</button><button type="button" title="Add step" aria-label="Add step" onClick={addStep}>＋</button><button type="button" title="Paste plan" aria-label="Paste plan" disabled={draft.dirty} onClick={()=>onPaste(task.id)}>✦</button><details><summary aria-label="Project notes">≡</summary><textarea aria-label="Project notes" value={draft.content.scratchpad} disabled={busy} placeholder="Project notes and references…" onChange={event=>edit({scratchpad:event.target.value})}/></details></nav>
      <main ref={canvas} className="v2-flow-canvas" aria-label="Spatial project workflow" onWheel={wheel} onPointerDown={startPan} onPointerMove={movePointer} onPointerUp={endPointer} onPointerCancel={endPointer}>
        <div className="v2-flow-world" style={{transform:`translate(${view.x}px,${view.y}px) scale(${view.zoom})`}}><svg className="v2-flow-lines" viewBox="0 0 3000 1200" aria-hidden="true">{draft.content.steps.slice(0,-1).map((step,index)=>{const next=draft.content.steps[index+1],selected=step.id===activeId||next.id===activeId;return <g key={step.id}><path className={selected?'is-selected':''} d={curve(positions[step.id],positions[next.id])}/><circle className="v2-flow-pulse" r="3"><animateMotion dur={`${4+index%3}s`} repeatCount="indefinite" path={curve(positions[step.id],positions[next.id])}/></circle></g>;})}</svg>
          {draft.content.steps.map((step,index)=>{const point=positions[step.id],state=step.done?'is-done':step.id===activeId?'is-current':step.status==='Blocked'?'is-blocked':'is-upcoming';return <div className={'v2-flow-node-wrap '+state} key={step.id} style={{left:point.x,top:point.y}}><button type="button" className="v2-flow-node" aria-label={`Open step ${index+1}: ${step.title}`} aria-pressed={step.id===activeId} onPointerDown={event=>startNodeDrag(event,step.id)} onClick={()=>selectStep(step.id,false)}>{step.done?'✓':index+1}</button><button type="button" className="v2-flow-node-label v2-task-route-select" onClick={()=>selectStep(step.id,false)}><strong>{step.title}</strong><small>{step.done?'Completed':step.id===activeId?'Current focus':step.status||'Upcoming'}</small></button></div>;})}
          {active&&!isMobile&&<div className="v2-flow-card-anchor" style={{left:positions[active.id].x-175,top:positions[active.id].y+82}}><StepEditor {...editorProps}/></div>}
        </div>{!draft.content.steps.length&&<div className="v2-flow-canvas-empty"><button type="button" onClick={addStep}>+ Add the first step</button></div>}
      </main>
      <aside className="v2-flow-rail" aria-label="Project route">{draft.content.steps.map((step,index)=><button type="button" key={step.id} className={(step.id===activeId?'is-current ':'')+(step.done?'is-done':'')} aria-label={`Focus step ${index+1}: ${step.title}`} onClick={()=>selectStep(step.id)}><span>{step.done?'✓':index+1}</span></button>)}</aside>
      <div className="v2-flow-mobile"><div className="v2-flow-mobile-route">{draft.content.steps.map((step,index)=><button type="button" className={(step.id===activeId?'is-current ':'')+(step.done?'is-done':'')} key={step.id} onClick={()=>selectStep(step.id,false)}><i>{step.done?'✓':index+1}</i><span>{step.title}</span></button>)}</div>{isMobile&&<StepEditor {...editorProps}/>}</div>
      {error&&<p className="v2-task-focus-error" role="alert">{error}</p>}
    </div>
  </section>;
}
