import React from 'react';
import {taskProgress, taskSteps} from '../src/task-model';
import {formatTimer} from './model';
export function TaskSummary({tasks}) {
  return <div className="v2-task-summary">{[
    ['Backlog','Backlog'], ['In Progress','In progress'], ['Today','Today'], ['Done','Completed'],
  ].map(([status, label]) => <div key={status}><strong>{tasks.filter(task => (task.status || 'Backlog') === status).length}</strong><span>{label}</span></div>)}</div>;
}
export function Journey({task}) {
  const steps = taskSteps(task), progress = taskProgress(task);
  return <section className="v2-panel v2-journey" aria-label="Project journey"><div className="v2-panel-heading"><h3>Project journey</h3><span>{progress.total ? progress.done+' / '+progress.total+' steps' : 'No milestones yet'}</span></div>
    {task ? <><p>{task.title || 'Untitled project'}</p>{steps.length ? <><progress max={steps.length} value={progress.done} aria-label="Completed project steps"/><ol>{steps.map((step, index) => <li key={step.id || index} data-done={Boolean(step.done || step.status === 'Done')}><span aria-hidden="true">{step.done || step.status === 'Done' ? '✓' : String(index+1).padStart(2,'0')}</span><div>{step.title || step.text || 'Untitled step'}<small>{step.done || step.status === 'Done' ? 'Completed' : step.status || 'Not started'}</small></div></li>)}</ol></> : <p className="v2-muted">This project has no saved steps.</p>}</> : <p className="v2-muted">Your active project's saved milestones will appear here.</p>}
  </section>;
}
export function FocusSession({timer}) {
  return <section className="v2-panel v2-timer" aria-label="Focus timer"><div className="v2-panel-heading"><h3>Focus session</h3><span>This tab</span></div><output aria-label="Time remaining">{formatTimer(timer.seconds)}</output><div className="v2-actions"><button onClick={timer.running ? timer.pause : timer.start}>{timer.running ? 'Pause focus' : 'Start focus'}</button><button className="v2-quiet" onClick={timer.reset}>Reset timer</button></div><p className="v2-muted">A quiet interval. Task progress stays unchanged.</p></section>;
}
export const widgetRegistry = [
  {id: 'tasks', title: 'Task overview', description: 'The same task records as Main Dashboard.', Component: TaskSummary},
  {id: 'journey', title: 'Project journey', description: 'Milestones from your active project.', Component: Journey},
  {id: 'focus', title: 'Focus session', description: 'One timer across both regions.', Component: FocusSession},
];
