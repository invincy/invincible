import React, {useEffect, useRef, useState} from 'react';
import {newId} from '../src/task-model';
import EditorDialog from './EditorDialog';
import StepTreeEditor from './StepTreeEditor';
import {parseStructuredPlan, planExample} from './plan-format';
import {importTaskPlan, taskSaveMessage} from './task-actions';
import {clearDraft, draftKey, readDraft, writeDraft} from './draft-store';

export default function PlanImporter({uid, tasks, targetId = '', onClose}) {
  const key = draftKey(uid, 'import');
  const [draft, setDraft] = useState(() => {
    const saved = readDraft(key);
    return saved ? {...saved, target: targetId || saved.target} : {text: '', preview: null, batchId: newId('plan'), id: newId('t'), target: targetId};
  });
  const [error, setError] = useState(''), [busy, setBusy] = useState(false), [stored, setStored] = useState(true);
  useEffect(() => {if (draft.text || draft.preview) setStored(writeDraft(key, draft));}, [key, draft]);
  const edit = patch => {setError(''); setDraft(previous => ({...previous, ...patch}));};
  const preview = draft.preview;
  const alert = useRef(null);
  useEffect(() => {if (error || preview?.errors.length) alert.current?.scrollIntoView({block: 'nearest'});}, [error, preview?.errors.length]);
  const target = tasks.find(task => task.id === draft.target);
  const save = async () => {
    if (!preview || preview.errors.length) return;
    if (draft.target && !target) {setError('Choose an available project or create a new one.'); return;}
    setBusy(true); setError('');
    try {await importTaskPlan(uid, draft.target || draft.id, preview, {append: Boolean(draft.target), token: draft.batchId}); clearDraft(key); onClose();}
    catch (failure) {setError(taskSaveMessage(failure));}
    finally {setBusy(false);}
  };
  return <EditorDialog title="Paste a plan" closeLabel="Close plan importer" onClose={onClose} busy={busy}>
    <label className="v2-project-notes">Add this plan to<select aria-label="Import destination" disabled={busy} value={draft.target} onChange={event => edit({target: event.target.value})}>
      <option value="">Create a new project</option>
      {draft.target && !target && <option value={draft.target} disabled>Unavailable project</option>}
      {tasks.map(task => <option key={task.id} value={task.id}>Append to {task.title || 'Untitled task'}</option>)}
    </select></label>
    <p className="v2-muted">Paste your custom GPT's plan, preview it, then add it. Appending keeps the project's existing title, notes, and steps.</p>
    <label className="v2-project-notes">Plan text<textarea aria-label="Plan text" rows={9} disabled={busy} placeholder={planExample} value={draft.text} onChange={event => edit({text: event.target.value, preview: null})}/></label>
    <div className="v2-editor-tools"><button type="button" disabled={busy || !draft.text.trim()} onClick={() => edit({preview: parseStructuredPlan(draft.text, draft.batchId)})}>Preview plan</button>
      <details><summary>Accepted format</summary><pre>{planExample}</pre></details>
    </div>
    {!stored && <p role="alert">Draft storage is full. Keep this window open until the plan is saved.</p>}
    {preview && (preview.errors.length ? <div ref={alert} role="alert" className="v2-editor-error"><strong>Check the plan format</strong><ul>{preview.errors.slice(0,20).map((message,index) => <li key={index}>{message}</li>)}</ul></div> : <section aria-label="Plan preview" className="v2-plan-preview">
      <h3>Preview · {preview.steps.length} steps · {preview.steps.reduce((count, step) => count + step.substeps.length, 0)} substeps</h3>
      {!draft.target ? <fieldset className="v2-project-fields" disabled={busy}>
        <label>Project title<input aria-label="Imported project title" maxLength={300} value={preview.title} onChange={event => edit({preview: {...preview, title: event.target.value}})}/></label>
        <label>Description<textarea aria-label="Imported description" rows={2} value={preview.description} onChange={event => edit({preview: {...preview, description: event.target.value}})}/></label>
      </fieldset> : <p>Adding these steps to <strong>{target?.title || 'the selected project'}</strong>.</p>}
      <StepTreeEditor steps={preview.steps} disabled={busy} onChange={steps => edit({preview: {...preview, steps}})}/>
    </section>)}
    {error && <p ref={alert} role="alert" className="v2-editor-error">{error}</p>}
    <footer className="v2-editor-footer"><button type="button" disabled={busy} onClick={onClose}>Close</button>
      <button type="button" disabled={busy} onClick={() => {clearDraft(key); setDraft({text: '', preview: null, batchId: newId('plan'), id: newId('t'), target: targetId}); setError('');}}>Clear draft</button>
      <button type="button" className="v2-primary" disabled={busy || !preview || Boolean(preview.errors.length) || !preview.steps.length} onClick={save}>{busy ? 'Saving…' : draft.target ? 'Add steps to project' : 'Create project'}</button>
    </footer>
  </EditorDialog>;
}
