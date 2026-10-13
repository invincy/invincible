import React from 'react';
import {taskProgress, taskSteps} from '../src/task-model';
import {FocusSession, Journey} from './widgets';

export default function DashboardRegion({data, plan, timer, onInspect, orbAnchor}) {
  const focus = plan.active?.task;
  const next = plan.active?.step || taskSteps(focus).find(step => !step.done && step.status !== 'Done');

  return (
    <div className="v2-dashboard-body">
      <section className="v2-mission" aria-label="Active mission">
        <span className="v2-eyebrow">ACTIVE MISSION · YOUR DAILY PLAN</span>
        <h2 title={focus?.title}>{focus?.title || 'Make space for your next move.'}</h2>
        <div className="v2-mission-next">
          <span className="v2-next-label">Next action</span>
          <p className="v2-next" title={next?.title || next?.text}>
            {next?.title || next?.text || (focus ? 'Continue this project' : 'No active item in your saved daily plan.')}
          </p>
        </div>
        {focus && (
          <button className="v2-primary" onClick={() => onInspect(focus.id)}>
            Resume work <span aria-hidden="true">↗</span>
          </button>
        )}
        {!focus && (
          <p className="v2-muted">Your existing projects are below. This preview never selects or changes a task for you.</p>
        )}
      </section>

      <div className="v2-orb-stage" aria-label="Focus orb">
        <div className="v2-orb-anchor" ref={orbAnchor} aria-hidden="true" />
      </div>

      <FocusSession timer={timer} compact />
      <Journey task={focus} compact onInspect={onInspect} />

      <div className="v2-board-heading">
        <h2>Your work</h2>
        <span className="v2-muted">{data.tasks.length} saved records · Read only</span>
      </div>

      <div className="v2-board">
        {[
          ['Backlog', 'Backlog'],
          ['In Progress', 'In progress'],
          ['Today', 'Today'],
          ['Done', 'Completed'],
        ].map(([status, label]) => {
          const tasks = data.tasks.filter(task => (task.status || 'Backlog') === status);
          return (
            <section className="v2-lane" key={status} data-status={status} aria-label={label}>
              <div className="v2-lane-header">
                <h3>
                  <span>{label}</span>
                  <span className="v2-lane-count">{tasks.length}</span>
                </h3>
              </div>
              <div className="v2-lane-cards">
                {tasks.length ? (
                  tasks.map(task => {
                    const progress = taskProgress(task);
                    return (
                      <button
                        key={task.id}
                        className="v2-task-card"
                        onClick={() => onInspect(task.id)}
                      >
                        <strong>{task.title || 'Untitled task'}</strong>
                        <span>
                          {progress.total
                            ? `${progress.done} of ${progress.total} steps complete`
                            : 'No saved steps'}
                        </span>
                        {progress.total > 0 && (
                          <progress
                            max={progress.total}
                            value={progress.done}
                            aria-label={`Progress for ${task.title || 'Untitled task'}`}
                          />
                        )}
                      </button>
                    );
                  })
                ) : (
                  <p className="v2-muted v2-lane-empty">Clear for now.</p>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}


