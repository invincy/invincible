import {cleanStep, taskSteps} from '../src/task-model.js';

export function taskContent(task = {}) {
  const sourceLayout = task.workflowLayout && typeof task.workflowLayout === 'object' ? task.workflowLayout : {};
  const positions = Object.fromEntries(Object.entries(sourceLayout.positions || {}).filter(([, point]) => Number.isFinite(point?.x) && Number.isFinite(point?.y))
    .map(([id, point]) => [id, {x: Math.max(40, Math.min(3000, point.x)), y: Math.max(40, Math.min(1200, point.y))}]));
  const sourceViewport = sourceLayout.viewport || {}, viewport = Number.isFinite(sourceViewport.x) && Number.isFinite(sourceViewport.y) && Number.isFinite(sourceViewport.zoom)
    ? {x: sourceViewport.x, y: sourceViewport.y, zoom: Math.max(.45, Math.min(1.8, sourceViewport.zoom))} : null;
  return {title: task.title || '', description: task.description || '', scratchpad: task.scratchpad || '',
    workflowLayout: {positions, viewport, selectedStepId: typeof sourceLayout.selectedStepId === 'string' ? sourceLayout.selectedStepId : ''},
    steps: taskSteps(task).map((step, index) => {
      const parent = cleanStep(step, index), stored = task.stepSubsteps?.[parent.id];
      const children = Array.isArray(stored) ? stored : Array.isArray(step.substeps) ? step.substeps : [];
      return {...parent, substeps: children.map((item, childIndex) => ({...item, id: item.id || `${parent.id}_c${childIndex}`, title: item.title || item.text || '', notes: item.notes || '', done: parent.done || Boolean(item.done)}))};
    })};
}
export const stableContent = value => JSON.stringify(value, (_key, item) => item && !Array.isArray(item) && typeof item === 'object'
  ? Object.fromEntries(Object.keys(item).sort().map(key => [key, item[key]])) : item);
export const contentVersion = task => stableContent(taskContent(task || {}));

// Keep legacy fields and nested content while maintaining V1's text/done mirror.
export function compatibleStepFields(steps, current = {}) {
  const old = taskSteps(current), legacy = Array.isArray(current.subtasks) ? current.subtasks : [];
  // Child data lives beside the legacy arrays so old V1/AI writers cannot strip it.
  const stepSubsteps = {...(current.stepSubsteps || {})};
  for (const [index, step] of old.entries()) {
    const id = step.id || `legacy_${index}`;
    if (!steps.some(item => item.id === id)) delete stepSubsteps[id];
  }
  for (const step of steps) {
    if (step.substeps?.length) stepSubsteps[step.id] = step.substeps;
    else delete stepSubsteps[step.id];
  }
  return {steps: steps.map(({substeps, ...step}) => step), stepSubsteps, subtasks: steps.map(step => {
    const index = old.findIndex((item, position) => (item.id || `legacy_${position}`) === step.id);
    return {...(index >= 0 ? legacy[index] : {}), text: step.title || step.text || '', done: Boolean(step.done || step.status === 'Done')};
  })};
}
export function validateContent(content) {
  if (!content.title.trim()) throw Error('Give the project a title.');
  if (content.steps.length > 200 || content.steps.reduce((count, step) => count + (step.substeps?.length || 0), 0) > 1000) throw Error('Use at most 200 steps and 1,000 substeps per project.');
  const ids = new Set();
  for (const step of content.steps) {
    if (!step.id || ids.has(step.id) || !(step.title || step.text || '').trim()) throw Error('Each step needs its own ID and a title.');
    ids.add(step.id);
    for (const child of step.substeps || []) {
      if (!child.id || ids.has(child.id) || !child.title.trim()) throw Error('Each substep needs its own ID and a title.');
      ids.add(child.id);
    }
  }
  if (new TextEncoder().encode(JSON.stringify(content)).length > 650000) throw Error('This project is too large. Split it into smaller projects.');
}

export function setStepDone(step, done) {
  return {...step, done, status: done ? 'Done' : 'Not Started', substeps: (step.substeps || []).map(child => ({...child, done}))};
}
export function setSubstepDone(step, id, done) {
  const substeps = step.substeps.map(child => child.id === id ? {...child, done} : child);
  const complete = substeps.every(child => child.done);
  return {...step, substeps, done: complete, status: complete ? 'Done' : step.status === 'Done' ? 'Not Started' : step.status};
}
