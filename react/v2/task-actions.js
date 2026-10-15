import {doc, runTransaction, serverTimestamp} from 'firebase/firestore';
import {db} from '../src/firebase';
import {compatibleStepFields, contentVersion, stableContent, taskContent, validateContent} from './task-content';

export function taskSaveMessage(error) {
  const code = error.code || error.message || '';
  if (/permission-denied|unauthenticated/.test(code)) return 'Saving was denied for this account. Your draft is kept; check that you are signed in to the right account.';
  if (/unavailable|network|offline/.test(code)) return 'The save could not be confirmed. Your draft is kept; reconnect and try again.';
  return error.message || 'Could not save. Your draft is kept; try again.';
}

function reference(uid, id) {
  if (!uid || !id || id.includes('/')) throw Error('Sign in and select a valid project.');
  return doc(db, 'users', uid, 'tasks', id);
}
export async function saveTaskContent(uid, id, content, version, {create = false, token = id} = {}) {
  validateContent(content);
  const ref = reference(uid, id);
  return runTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref), current = snapshot.exists() ? snapshot.data() : null;
    if (create && current) {
      if (current.creationToken === token && contentVersion(current) === contentVersion(content)) return;
      throw Error('This project already exists. Close and reopen it before editing.');
    }
    if (!create && !current) throw Error('This project no longer exists. Your draft is still on this device.');
    if (!create && contentVersion(current) === contentVersion(content)) return;
    if (!create && contentVersion(current) !== version) throw Error('This project changed elsewhere. Your draft is kept. Discard the draft to load the latest version, or copy your edits before closing.');
    const fields = {...content, title: content.title.trim(), ...compatibleStepFields(content.steps, current || {}), updatedAt: serverTimestamp()};
    if (create) Object.assign(fields, {status: 'Backlog', activeStepId: content.steps.find(step => !step.done)?.id || null, createdAt: serverTimestamp(), creationToken: token});
    else if (current.activeStepId && !content.steps.some(step => step.id === current.activeStepId)) fields.activeStepId = content.steps.find(step => !step.done)?.id || null;
    if (create) transaction.set(ref, fields); else transaction.update(ref, fields);
  });
}
export async function importTaskPlan(uid, id, plan, {append = false, token} = {}) {
  if (!plan.steps.length) throw Error('Keep at least one step in the plan before adding it.');
  validateContent({...plan, title: append ? plan.title || 'Existing project' : plan.title});
  if (!append) return saveTaskContent(uid, id, {title: plan.title, description: plan.description, scratchpad: '', steps: plan.steps}, null, {create: true, token});
  const ref = reference(uid, id);
  return runTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists()) throw Error('This project no longer exists. Choose another project or create a new one.');
    const current = snapshot.data(), existing = taskContent(current).steps;
    const matches = plan.steps.filter(step => existing.some(item => item.id === step.id));
    if (matches.length === plan.steps.length) {
      const proposed = taskContent({steps: plan.steps}).steps;
      if (proposed.every(step => stableContent(existing.find(item => item.id === step.id)) === stableContent(step))) return;
      throw Error('These steps were already added and their content differs from this preview. Your draft is kept; open the project to review it.');
    }
    if (matches.length) throw Error('Part of this plan is already present. Reopen the project to review it.');
    const steps = [...existing, ...plan.steps];
    validateContent({...taskContent(current), steps});
    transaction.update(ref, {...compatibleStepFields(steps, current), updatedAt: serverTimestamp()});
  });
}
