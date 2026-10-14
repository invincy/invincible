import React from 'react';
import {taskProgress} from '../src/task-model';

const lanes = [['Backlog', 'Backlog'], ['In Progress', 'In progress'], ['Today', 'Today'], ['Done', 'Completed']];

export default function KanbanBoard({tasks, onInspect}) {
  return <div className="v2-kanban-board" aria-label="Kanban board">{lanes.map(([status, label]) => {
    const cards = tasks.filter(task => (task.status || 'Backlog') === status);
    return <section className="v2-lane" key={status} data-status={status} aria-label={label}>
      <div className="v2-lane-header"><h3>{label}</h3><span className="v2-lane-count">{cards.length}</span></div>
      <div className="v2-lane-cards">{cards.length ? cards.map(task => {
        const progress = taskProgress(task);
        return <button className="v2-task-card" key={task.id} onClick={() => onInspect(task.id)}>
          <strong className="v2-task-card-title">{task.title || 'Untitled task'}</strong>
          <span className="v2-task-card-sub">{progress.total ? `${progress.done} of ${progress.total} steps` : 'No saved steps'}</span>
          {progress.total > 0 && <progress max={progress.total} value={progress.done} aria-label={'Progress for '+(task.title || 'Untitled task')}/>}
        </button>;
      }) : <p className="v2-lane-empty">Clear for now.</p>}</div>
    </section>;
  })}</div>;
}
