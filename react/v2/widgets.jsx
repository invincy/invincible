import React from 'react';
import {taskProgress, taskSteps} from '../src/task-model';
import {formatTimer} from './model';

export function TaskSummary({tasks}) {
  const statuses = [
    {key: 'Backlog', label: 'Backlog'},
    {key: 'In Progress', label: 'In progress'},
    {key: 'Today', label: 'Today'},
    {key: 'Done', label: 'Completed'},
  ];
  return (
    <div className="v2-task-summary">
      {statuses.map(({key, label}) => {
        const count = tasks.filter(task => (task.status || 'Backlog') === key).length;
        return (
          <div key={key} data-status={key} className="v2-summary-item">
            <strong>{count}</strong>
            <span>{label}</span>
          </div>
        );
      })}
    </div>
  );
}

export function Journey({task, compact = false, onInspect}) {
  const steps = taskSteps(task), progress = taskProgress(task);
  if (compact) {
    return (
      <div className="v2-journey-compact" aria-label="Project journey">
        <div className="v2-journey-bar">
          <div className="v2-progress-meta">
            <span>Milestones</span>
            <span>{progress.total ? `${progress.done} / ${progress.total} steps` : 'No milestones'}</span>
          </div>
          <progress max={progress.total || 1} value={progress.done} aria-label="Completed project steps" />
        </div>
        {task && (
          <button className="v2-quiet" onClick={() => onInspect(task.id)}>
            View milestones
          </button>
        )}
      </div>
    );
  }

  return (
    <section className="v2-panel v2-journey" aria-label="Project journey">
      <div className="v2-panel-heading">
        <div>
          <span className="v2-eyebrow">MILESTONE ROADMAP</span>
          <h3>{task?.title || 'Project journey'}</h3>
        </div>
        <span className="v2-panel-badge">
          {progress.total ? `${progress.done} / ${progress.total} steps` : 'No milestones yet'}
        </span>
      </div>

      {task ? (
        <>
          <div className="v2-journey-bar-wrap">
            <progress max={steps.length || 1} value={progress.done} aria-label="Completed project steps" />
          </div>
          {steps.length ? (
            <ol className="v2-journey-steps">
              {steps.map((step, index) => {
                const done = Boolean(step.done || step.status === 'Done');
                return (
                  <li key={step.id || index} data-done={done}>
                    <span className="v2-step-num" aria-hidden="true">
                      {done ? '✓' : String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="v2-step-info">
                      <div className="v2-step-line">
                        <strong>{step.title || step.text || 'Untitled step'}</strong>
                        <small className={done ? 'is-complete' : ''}>
                          {done ? 'Completed' : step.status || 'Not started'}
                        </small>
                      </div>
                      {step.notes && <p className="v2-step-notes">{step.notes}</p>}
                    </div>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="v2-muted">This project has no saved steps.</p>
          )}
        </>
      ) : (
        <p className="v2-muted">Your active project's saved milestones will appear here.</p>
      )}
    </section>
  );
}

export function FocusSession({timer, compact = false}) {
  return (
    <section className={'v2-panel v2-timer' + (compact ? ' is-compact' : '')} aria-label="Focus timer">
      <div className="v2-panel-heading">
        <h3>Focus session</h3>
        <span className="v2-timer-status">
          <span className={`v2-status-dot ${timer.running ? 'is-running' : ''}`} aria-hidden="true" />
          {timer.running ? 'Active session' : 'Ready'}
        </span>
      </div>
      <output aria-label="Time remaining">{formatTimer(timer.seconds)}</output>
      <div className="v2-actions">
        <button
          className="v2-timer-toggle"
          aria-label={timer.running ? 'Pause focus' : 'Start focus'}
          onClick={timer.running ? timer.pause : timer.start}
        >
          {compact ? (timer.running ? 'Pause' : 'Start') : (timer.running ? 'Pause focus' : 'Start focus')}
        </button>
        <button
          className="v2-quiet v2-timer-reset"
          aria-label="Reset timer"
          onClick={timer.reset}
        >
          {compact ? 'Reset' : 'Reset timer'}
        </button>
      </div>
      {!compact && <p className="v2-muted">A quiet interval. Task progress stays unchanged.</p>}
    </section>
  );
}

export const widgetRegistry = [
  {id: 'tasks', title: 'Task overview', description: 'The same task records as Main Dashboard.', Component: TaskSummary},
  {id: 'journey', title: 'Project journey', description: 'Milestones from your active project.', Component: Journey},
  {id: 'focus', title: 'Focus session', description: 'One timer across both regions.', Component: FocusSession},
];

