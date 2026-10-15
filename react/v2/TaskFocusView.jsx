import React, {useEffect, useMemo, useRef, useState} from 'react';
import {cleanStep, newId} from '../src/task-model';
import {saveTaskContent, taskSaveMessage} from './task-actions';
import {moveWorkspaceTask} from './move-task';
import {contentVersion, setStepDone, setSubstepDone, taskContent} from './task-content';
import {clearDraft, draftKey, readDraft, writeDraft} from './draft-store';

export default function TaskFocusView({uid, task, onClose, onPaste}) {
  const key = draftKey(uid, 'editor', task?.id || 'missing');
  const [draft, setDraft] = useState(() => readDraft(key) || {id: task?.id, content: taskContent(task), base: contentVersion(task), dirty: false});
  const [activeId, setActiveId] = useState(() => draft.content.steps.find(step => !step.done)?.id || draft.content.steps[0]?.id || '');
  const [busy, setBusy] = useState(false), [statusBusy, setStatusBusy] = useState(false), [error, setError] = useState(''), [stored, setStored] = useState(true);
  const back = useRef(null), previousFocus = useRef(document.activeElement);
  useEffect(() => {back.current?.focus({preventScroll: true}); return () => previousFocus.current?.focus?.({preventScroll: true});}, []);
  useEffect(() => {
    const escape = event => {if (event.key === 'Escape' && !busy && !statusBusy) onClose();};
    window.addEventListener('keydown', escape); return () => window.removeEventListener('keydown', escape);
  }, [busy, statusBusy, onClose]);
  useEffect(() => {if (draft.dirty) setStored(writeDraft(key, draft));}, [draft, key]);
  useEffect(() => {
    if (task) setDraft(previous => previous.dirty ? previous : {...previous, id: task.id, content: taskContent(task), base: contentVersion(task)});
  }, [task]);
  useEffect(() => {
    if (!draft.content.steps.some(step => step.id === activeId)) setActiveId(draft.content.steps.find(step => !step.done)?.id || draft.content.steps[0]?.id || '');
  }, [draft.content.steps, activeId]);
  const activeIndex = draft.content.steps.findIndex(step => step.id === activeId), active = draft.content.steps[activeIndex];
  const progress = useMemo(() => ({total: draft.content.steps.length, done: draft.content.steps.filter(step => step.done).length}), [draft.content.steps]);
  const edit = patch => {setError(''); setDraft(previous => ({...previous, dirty: true, content: {...previous.content, ...patch}}));};
  const editSteps = steps => edit({steps});
  const editActive = patch => editSteps(draft.content.steps.map(step => step.id === activeId ? {...step, ...patch} : step));
  const save = async () => {
    setBusy(true); setError('');
    try {
      await saveTaskContent(uid, draft.id, draft.content, draft.base);
      clearDraft(key); setDraft(previous => ({...previous, base: contentVersion(previous.content), dirty: false}));
    } catch (failure) {setError(taskSaveMessage(failure));}
    finally {setBusy(false);}
  };
  const discard = () => {clearDraft(key); const content = taskContent(task); setDraft({id: task.id, content, base: contentVersion(task), dirty: false}); setError('');};
  const moveStatus = async status => {
    setStatusBusy(true); setError('');
    try {await moveWorkspaceTask(uid, task.id, status);}
    catch {setError('The project status could not be changed. Try again.');}
    finally {setStatusBusy(false);}
  };
  const addStep = () => {
    const step = cleanStep({id: newId('s'), title: 'New step', notes: '', done: false, status: 'Not Started'}, draft.content.steps.length);
    editSteps([...draft.content.steps, {...step, substeps: []}]); setActiveId(step.id);
  };
  const removeStep = id => {
    const index = draft.content.steps.findIndex(step => step.id === id), steps = draft.content.steps.filter(step => step.id !== id);
    editSteps(steps); if (id === activeId) setActiveId(steps[Math.min(index, steps.length-1)]?.id || '');
  };
  const shiftStep = (id, direction) => {
    const steps = [...draft.content.steps], from = steps.findIndex(step => step.id === id), to = from + direction;
    if (from < 0 || to < 0 || to >= steps.length) return;
    [steps[from], steps[to]] = [steps[to], steps[from]]; editSteps(steps);
  };
  const completeActive = () => {
    if (!active) return;
    const done = !active.done, steps = draft.content.steps.map(step => step.id === active.id ? setStepDone(step, done) : step);
    editSteps(steps);
    if (done) setActiveId(steps.slice(activeIndex+1).find(step => !step.done)?.id || steps.find(step => !step.done)?.id || active.id);
  };
  const setActiveStatus = status => {
    if (!active) return;
    editSteps(draft.content.steps.map(step => step.id === active.id
      ? status === 'Done' ? setStepDone(step, true) : {...step, status, done: false}
      : step));
  };
  const addSubstep = () => editActive({substeps: [...(active.substeps || []), {id: newId('c'), title: 'New substep', notes: '', done: false}]});
  if (!task) return <section className="v2-task-focus" role="region" aria-label="Task workspace"><button ref={back} onClick={onClose}>← My Workspace</button><p role="alert">This project is no longer available.</p></section>;
  return <section className="v2-task-focus" role="region" aria-label={'Task workspace: '+(task.title || 'Untitled project')}>
    <header className="v2-task-focus-header">
      <button ref={back} className="v2-task-back" type="button" aria-label="Close saved work" disabled={busy || statusBusy} onClick={onClose}>← <span>My Workspace</span></button>
      <div className="v2-task-identity">
        <span>PROJECT FOCUS</span>
        <input aria-label="Project title" maxLength={300} value={draft.content.title} disabled={busy} onChange={event => edit({title: event.target.value})}/>
        <input aria-label="Project description" value={draft.content.description} disabled={busy} placeholder="Define the finished result…" onChange={event => edit({description: event.target.value})}/>
      </div>
      <div className="v2-task-focus-meta">
        <label>Status<select aria-label="Project status" value={task.status || 'Backlog'} disabled={statusBusy} onChange={event => moveStatus(event.target.value)}>{['Backlog','In Progress','Today','Done'].map(value => <option key={value}>{value}</option>)}</select></label>
        <div className="v2-task-progress"><strong>{progress.total ? Math.round(progress.done/progress.total*100) : 0}%</strong><span>{progress.done} / {progress.total} steps</span><progress max={progress.total || 1} value={progress.done}/></div>
      </div>
      <div className="v2-task-save-actions">
        <span>{draft.dirty ? stored ? 'Draft on this device' : 'Keep this view open' : 'Saved project'}</span>
        {draft.dirty && <button type="button" disabled={busy} onClick={discard}>Discard draft</button>}
        <button type="button" className="v2-primary" disabled={busy || !draft.dirty} onClick={save}>{busy ? 'Saving…' : 'Save project'}</button>
      </div>
    </header>
    <div className="v2-task-focus-body">
      <main className="v2-task-stage">
        {active ? <>
          <div className="v2-task-stage-heading"><div><span>ACTIVE WORK</span><small>STEP {activeIndex+1} OF {draft.content.steps.length}</small></div><select aria-label="Current step status" value={active.status || (active.done ? 'Done' : 'Not Started')} disabled={busy} onChange={event => setActiveStatus(event.target.value)}>{['Not Started','Working','Blocked','Done'].map(value => <option key={value}>{value}</option>)}</select></div>
          <input className="v2-task-active-title" aria-label={`Step ${activeIndex+1} title`} value={active.title} disabled={busy} onChange={event => editActive({title: event.target.value})}/>
          <label className="v2-task-notes">Working notes<textarea aria-label={`Step ${activeIndex+1} notes`} value={active.notes || ''} disabled={busy} placeholder="Write the decision, measurement, link, or next move here…" onChange={event => editActive({notes: event.target.value})}/></label>
          <section className="v2-task-substeps" aria-label="Substeps"><div className="v2-task-substeps-heading"><span>SUBSTEPS</span><button type="button" disabled={busy} onClick={addSubstep}>+ Add</button></div>
            {(active.substeps || []).length ? <ul>{active.substeps.map((child, index) => <li key={child.id}>
              <input type="checkbox" aria-label={`Complete substep ${activeIndex+1}.${index+1}`} checked={child.done} disabled={busy} onChange={event => editSteps(draft.content.steps.map(step => step.id === active.id ? setSubstepDone(step, child.id, event.target.checked) : step))}/>
              <input aria-label={`Substep ${activeIndex+1}.${index+1} title`} value={child.title} disabled={busy} onChange={event => editActive({substeps: active.substeps.map(item => item.id === child.id ? {...item, title: event.target.value} : item)})}/>
              <button type="button" aria-label={`Remove substep ${activeIndex+1}.${index+1}`} disabled={busy} onClick={() => editActive({substeps: active.substeps.filter(item => item.id !== child.id)})}>×</button>
            </li>)}</ul> : <p>No smaller actions yet.</p>}
          </section>
          <div className="v2-task-stage-nav"><button type="button" disabled={activeIndex <= 0} onClick={() => setActiveId(draft.content.steps[activeIndex-1].id)}>← Previous</button><button type="button" className="v2-task-complete" disabled={busy} onClick={completeActive}>{active.done ? 'Reopen step' : 'Complete & continue'} →</button><button type="button" disabled={activeIndex >= draft.content.steps.length-1} onClick={() => setActiveId(draft.content.steps[activeIndex+1].id)}>Next →</button></div>
        </> : <div className="v2-task-empty"><span>ACTIVE WORK</span><h2>Create the first step</h2><p>This project has no route yet.</p><button className="v2-primary" onClick={addStep}>+ Add first step</button></div>}
        <details className="v2-task-vault"><summary>Project vault <span>Scratchpad and loose notes ↓</span></summary><textarea aria-label="Project notes" value={draft.content.scratchpad} disabled={busy} placeholder="Store references, decisions, and notes that belong to the whole project…" onChange={event => edit({scratchpad: event.target.value})}/></details>
        {error && <p className="v2-task-focus-error" role="alert">{error}</p>}
      </main>
      <aside className="v2-task-route" aria-label="Project route">
        <div className="v2-task-route-heading"><div><span>YOUR ROUTE</span><h2>Steps</h2></div><b>{draft.content.steps.length}</b></div>
        <div className="v2-task-route-list">{draft.content.steps.map((step, index) => <div className={'v2-task-route-item'+(step.id === activeId ? ' is-active' : '')+(step.done ? ' is-done' : '')} key={step.id}>
          <button type="button" className="v2-task-route-select" onClick={() => setActiveId(step.id)}><i>{step.done ? '✓' : String(index+1).padStart(2,'0')}</i><span><strong>{step.title}</strong><small>{step.id === activeId ? 'Current focus' : step.done ? 'Completed' : step.status || 'Not Started'}</small></span></button>
          <div className="v2-task-route-controls"><input type="checkbox" aria-label={`Complete step ${index+1}`} checked={step.done} disabled={busy} onChange={event => editSteps(draft.content.steps.map(item => item.id === step.id ? setStepDone(item, event.target.checked) : item))}/><button type="button" disabled={index === 0 || busy} aria-label={'Move '+step.title+' up'} onClick={() => shiftStep(step.id,-1)}>↑</button><button type="button" disabled={index === draft.content.steps.length-1 || busy} aria-label={'Move '+step.title+' down'} onClick={() => shiftStep(step.id,1)}>↓</button><button type="button" disabled={busy} aria-label={'Remove '+step.title} onClick={() => removeStep(step.id)}>×</button></div>
        </div>)}</div>
        <div className="v2-task-route-actions"><button type="button" disabled={busy} onClick={addStep}>+ Add step</button><button type="button" disabled={busy || draft.dirty} title={draft.dirty ? 'Save or discard edits before pasting a plan' : ''} onClick={() => onPaste(task.id)}>Paste plan</button></div>
      </aside>
    </div>
  </section>;
}
