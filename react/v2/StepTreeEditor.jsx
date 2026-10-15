import React from 'react';
import {newId} from '../src/task-model';
import {setStepDone, setSubstepDone} from './task-content';

export default function StepTreeEditor({steps, onChange, disabled = false}) {
  const change = (id, patch) => onChange(steps.map(step => step.id === id ? {...step, ...patch} : step));
  return <fieldset className="v2-step-editor" disabled={disabled}><legend>Steps and substeps</legend>
    <ol>{steps.map((step, index) => <li key={step.id}>
      <div className="v2-step-edit-heading">
        <input type="checkbox" aria-label={`Complete step ${index+1}`} checked={Boolean(step.done || step.status === 'Done')} onChange={event => change(step.id, setStepDone(step, event.target.checked))}/>
        <label><span>Step {index+1}</span><input aria-label={`Step ${index+1} title`} maxLength={300} value={step.title || step.text || ''} onChange={event => change(step.id, {title: event.target.value})}/></label>
        <button type="button" className="v2-quiet" aria-label={`Remove step ${index+1}`} onClick={() => onChange(steps.filter(item => item.id !== step.id))}>×</button>
      </div>
      <details open={Boolean(step.notes)}><summary>Working notes</summary><textarea aria-label={`Step ${index+1} notes`} rows={3} value={step.notes || ''} onChange={event => change(step.id, {notes: event.target.value})}/></details>
      <ul className="v2-substep-editor">{(step.substeps || []).map((child, childIndex) => <li key={child.id}>
        <div className="v2-substep-row">
          <input type="checkbox" aria-label={`Complete substep ${index+1}.${childIndex+1}`} checked={Boolean(child.done)} onChange={event => change(step.id, setSubstepDone(step, child.id, event.target.checked))}/>
          <input aria-label={`Substep ${index+1}.${childIndex+1} title`} maxLength={300} value={child.title || ''} onChange={event => change(step.id, {substeps: step.substeps.map(item => item.id === child.id ? {...item, title: event.target.value} : item)})}/>
          <button type="button" className="v2-quiet" aria-label={`Remove substep ${index+1}.${childIndex+1}`} onClick={() => {
            const substeps = step.substeps.filter(item => item.id !== child.id), done = substeps.length ? substeps.every(item => item.done) : false;
            change(step.id, {substeps, done, status: done ? 'Done' : 'Not Started'});
          }}>×</button>
        </div>
        <details open={Boolean(child.notes)}><summary>Notes</summary><textarea aria-label={`Substep ${index+1}.${childIndex+1} notes`} rows={2} value={child.notes || ''} onChange={event => change(step.id, {substeps: step.substeps.map(item => item.id === child.id ? {...item, notes: event.target.value} : item)})}/></details>
      </li>)}</ul>
      <button type="button" className="v2-quiet" onClick={() => change(step.id, {done: false, status: step.status === 'Done' ? 'Not Started' : step.status,
        substeps: [...(step.substeps || []), {id: newId('sub'), title: '', notes: '', done: false}]})}>+ Add substep to step {index+1}</button>
    </li>)}</ol>
    {!steps.length && <p className="v2-muted">Add your first step or paste a plan.</p>}
    <button type="button" className="v2-quiet" onClick={() => onChange([...steps, {id: newId('s'), title: '', notes: '', done: false, status: 'Not Started', substeps: []}])}>+ Add step</button>
  </fieldset>;
}
