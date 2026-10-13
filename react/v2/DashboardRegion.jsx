import React from 'react';
import {taskProgress, taskSteps} from '../src/task-model';
import {FocusSession, Journey} from './widgets';
export default function DashboardRegion({data, plan, timer, onInspect, orbAnchor}) {
  const focus = plan.active?.task;
  const next = plan.active?.step || taskSteps(focus).find(step => !step.done && step.status !== 'Done');
  return <div className="v2-dashboard-body">
    <div className="v2-mission-row"><section className="v2-mission"><p className="v2-eyebrow">ACTIVE MISSION · YOUR DAILY PLAN</p><h2>{focus?.title || 'Make space for your next move.'}</h2><p className="v2-next-label">Next action</p><p className="v2-next">{next?.title || next?.text || (focus ? 'Continue this project' : 'No active item in your saved daily plan.')}</p>
      {focus && <><button className="v2-primary" onClick={() => onInspect(focus.id)}>Resume work <span aria-hidden="true">↗</span></button><p className="v2-muted">Review your saved steps and working notes.</p></>}
      {!focus && <p className="v2-muted">Your existing projects are below. This preview never selects or changes a task for you.</p>}
    </section><div className="v2-orb-anchor" ref={orbAnchor} aria-hidden="true"/></div>
    <div className="v2-dashboard-support"><FocusSession timer={timer}/><Journey task={focus}/></div>
    <div className="v2-board-heading"><div><p className="v2-eyebrow">PROJECTS & TASKS</p><h2>Your work, in motion.</h2></div><span className="v2-muted">{data.tasks.length} saved records · Read only</span></div>
    <div className="v2-board">{[['Backlog','Backlog'],['In Progress','In progress'],['Today','Today'],['Done','Completed']].map(([status,label]) => {
      const tasks = data.tasks.filter(task => (task.status || 'Backlog') === status);
      return <section className="v2-lane" key={status} data-status={status} aria-label={label}><h3><span>{label}</span><span>{tasks.length}</span></h3>{tasks.length ? tasks.map(task => {
        const progress = taskProgress(task);
        return <button key={task.id} className="v2-task-card" onClick={() => onInspect(task.id)}><strong>{task.title || 'Untitled task'}</strong><span>{progress.total ? progress.done+' of '+progress.total+' steps complete' : 'No saved steps'}</span>{progress.total > 0 && <progress max={progress.total} value={progress.done} aria-label={'Progress for '+(task.title || 'Untitled task')}/>}</button>;
      }) : <p className="v2-muted">Clear for now.</p>}</section>;
    })}</div>
  </div>;
}
