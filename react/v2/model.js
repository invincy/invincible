import {taskSteps} from '../src/task-model.js';

// Region URLs identify positions in one canvas, never separate page destinations.
export const regions = [
  {id: 'dashboard', label: 'Main Dashboard', number: '01'},
  {id: 'workspace', label: 'My Workspace', number: '02'},
];
export const regionFromHash = hash => regions.find(region => '#'+region.id === hash)?.id || 'dashboard';
export const localDayKey = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
export function resolvePlan(tasks, plan) {
  // Match Dashboard's daily-plan selection; do not seed a plan or invent a focus.
  const items = (Array.isArray(plan?.items) ? plan.items : []).filter(Boolean).map(reference => {
    const task = tasks.find(value => value.id === reference.taskId);
    const step = reference.stepId ? taskSteps(task).find(value => value.id === reference.stepId) : null;
    const missing = !task || Boolean(reference.stepId && !step);
    const done = missing ? false : reference.stepId ? Boolean(step.done || step.status === 'Done') : task.status === 'Done';
    return {...reference, task, step, missing, done};
  });
  return {items, active: items.find(item => item.id === plan?.activeItemId && !item.done && !item.missing)
    || items.find(item => !item.done && !item.missing) || null};
}
export const formatTimer = seconds => `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
export const remainingSeconds = (timer, now = Date.now()) => timer.endsAt
  ? Math.max(0, Math.ceil((timer.endsAt-now)/1000)) : timer.seconds;
