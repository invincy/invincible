import React, {useEffect, useRef, useState} from 'react';
import EditorDialog from './EditorDialog';
import StepTreeEditor from './StepTreeEditor';
import {saveTaskContent, taskSaveMessage} from './task-actions';
import {contentVersion, taskContent} from './task-content';
import {clearDraft, draftKey, readDraft, writeDraft} from './draft-store';

export default function TaskEditor({uid, taskId, task, isNew, onClose, onPaste}) {
  const key = draftKey(uid, 'editor', isNew ? 'new' : taskId);
  const [draft, setDraft] = useState(() => readDraft(key) || {id: taskId, content: taskContent(task), base: contentVersion(task), dirty: false});
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [stored, setStored] = useState(true);
  const alert = useRef(null);
  useEffect(() => {if (error) alert.current?.scrollIntoView({block: 'nearest'});}, [error]);
  useEffect(() => {if (draft.dirty) setStored(writeDraft(key, draft));}, [key, draft]);
  useEffect(() => {
    if (!isNew && task) setDraft(previous => previous.dirty ? previous : {...previous, content: taskContent(task), base: contentVersion(task)});
  }, [task, isNew]);
  const edit = patch => {setError(''); setDraft(previous => ({...previous, dirty: true, content: {...previous.content, ...patch}}));};
  const save = async () => {
    setBusy(true); setError('');
    try {await saveTaskContent(uid, draft.id, draft.content, draft.base, {create: isNew}); clearDraft(key); onClose();}
    catch (failure) {setError(taskSaveMessage(failure));}
    finally {setBusy(false);}
  };
  const discard = () => {clearDraft(key); setDraft({id: taskId, content: taskContent(task), base: contentVersion(task), dirty: false}); setError('');};
  return <EditorDialog title={isNew ? 'New project' : task?.title || 'Project unavailable'} onClose={onClose} busy={busy}>
    {!task && !isNew ? <p role="alert">This project is no longer available. Any draft is still on this device.</p> : <>
      <div className="v2-editor-tools"><span className="v2-muted">{draft.dirty ? stored ? 'Draft saved on this device' : 'Draft storage is full. Keep this editor open until you save.' : 'Changes save when you press Save project.'}</span>
        {!isNew && <button type="button" disabled={busy || draft.dirty} title={draft.dirty ? 'Save or discard your edits before pasting a plan' : 'Append steps from a plan'} onClick={() => onPaste(taskId)}>Paste plan</button>}
      </div>
      <fieldset className="v2-project-fields" disabled={busy}>
        <label>Project title<input aria-label="Project title" maxLength={300} value={draft.content.title} onChange={event => edit({title: event.target.value})}/></label>
        <label>Description<textarea aria-label="Project description" rows={2} value={draft.content.description} onChange={event => edit({description: event.target.value})}/></label>
      </fieldset>
      <StepTreeEditor steps={draft.content.steps} disabled={busy} onChange={steps => edit({steps})}/>
      <label className="v2-project-notes">Project notes<textarea aria-label="Project notes" rows={4} disabled={busy} value={draft.content.scratchpad} onChange={event => edit({scratchpad: event.target.value})}/></label>
      {error && <p ref={alert} role="alert" className="v2-editor-error">{error}</p>}
      <footer className="v2-editor-footer"><button type="button" disabled={busy} onClick={onClose}>Close</button>
        {draft.dirty && <button type="button" disabled={busy} onClick={discard}>Discard draft</button>}
        <button type="button" className="v2-primary" disabled={busy || (!isNew && !draft.dirty)} onClick={save}>{busy ? 'Saving…' : 'Save project'}</button>
      </footer>
    </>}
  </EditorDialog>;
}
