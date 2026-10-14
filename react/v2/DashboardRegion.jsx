import React, {useState, useEffect} from 'react';
import {taskProgress, taskSteps} from '../src/task-model';
import {formatTimer} from './model';

export default function DashboardRegion({
  data,
  plan,
  timer,
  onInspect,
  orbAnchor,
  theme = 'gold',
  onChangeTheme,
}) {
  const focus = plan.active?.task;
  const next = plan.active?.step || taskSteps(focus).find(step => !step.done && step.status !== 'Done');
  const progress = taskProgress(focus);
  const progressPercent = progress.total ? Math.round((progress.done / progress.total) * 100) : 0;

  // Live client-side clock
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const clock = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(clock);
  }, []);

  const clockTime = now.toLocaleTimeString('en-US', {hour12: false});
  const clockDate = now.toLocaleDateString('en-US', {weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'});

  const completedCount = data.tasks.filter(t => (t.status || '').toLowerCase() === 'done' || t.status === 'Completed').length;
  const projectNumber = focus ? '1.' : '';

  const lanes = [
    {id: 'Backlog', label: 'Backlog', icon: '☰'},
    {id: 'In Progress', label: 'In Progress', icon: '▷'},
    {id: 'Today', label: 'Today', icon: '◈'},
    {id: 'Done', label: 'Completed', icon: '✓'},
  ];

  return (
    <div className="v2-dashboard-body">
      {/* 1. Top Shallow Header / Status Row */}
      <div className="v2-dashboard-topbar">
        <div className="v2-topbar-timer" aria-label="Focus session timer">
          <div className="v2-timer-badge">
            <span className="v2-timer-icon" aria-hidden="true">⏱</span>
          </div>
          <output className="v2-timer-digits" aria-label="Time remaining">
            {formatTimer(timer.seconds)}
          </output>
          <div className="v2-timer-ctrls">
            <button
              type="button"
              className="v2-timer-btn play"
              aria-label={timer.running ? 'Pause focus' : 'Start focus'}
              onClick={timer.running ? timer.pause : timer.start}
              title={timer.running ? 'Pause focus' : 'Start focus'}
            >
              {timer.running ? '⏸' : '▶'}
            </button>
            <button
              type="button"
              className="v2-timer-btn reset"
              aria-label="Reset timer"
              onClick={timer.reset}
              title="Reset timer"
            >
              ⏹
            </button>
          </div>
        </div>

        <div className="v2-topbar-stats">
          <div className="v2-stat-pill">
            <span className="v2-stat-icon fire" aria-hidden="true">🔥</span>
            <div className="v2-stat-data">
              <strong>{timer.running ? 1 : 0}</strong>
              <span>Focus Streak</span>
            </div>
          </div>
          <div className="v2-stat-pill">
            <span className="v2-stat-icon check" aria-hidden="true">✓</span>
            <div className="v2-stat-data">
              <strong>{completedCount}</strong>
              <span>Tasks Done</span>
            </div>
          </div>
          <div className="v2-stat-pill">
            <span className="v2-stat-icon trophy" aria-hidden="true">👑</span>
            <div className="v2-stat-data">
              <strong>{data.tasks.length}</strong>
              <span>In Pipeline</span>
            </div>
          </div>
          <div className="v2-stat-pill sync">
            <span className="v2-sync-dot" aria-hidden="true" />
            <span>Synced</span>
          </div>
          <a
            href="../#tasks"
            className="v2-v1-new-btn"
            title="Open V1 workspace to create or modify tasks"
          >
            + New Task
          </a>
        </div>

        <div className="v2-topbar-clock" aria-label="Current time and date">
          <span className="v2-clock-time">{clockTime}</span>
          <span className="v2-clock-date">{clockDate}</span>
        </div>
      </div>

      {/* 2. Main Working Workspace Split (Current Project Hero + Kanban Lanes) */}
      <div className="v2-workspace-split">
        {/* Left: Current Project Hero */}
        <section className="v2-hero-project" aria-label="Current Project">
          <div className="v2-hero-header">
            <div className="v2-hero-title-wrap">
              <span className="v2-hero-target-icon" aria-hidden="true">◎</span>
              <h3>Current Project</h3>
            </div>
            <div className="v2-hero-badges">
              {onChangeTheme && (
                <button
                  type="button"
                  className="v2-theme-badge-btn"
                  onClick={onChangeTheme}
                  title="Toggle Focus Orb Theme"
                  aria-label={`Orb theme: ${theme}. Click to change theme`}
                >
                  👑 {theme.toUpperCase()}
                </button>
              )}
              <button
                type="button"
                className="v2-more-btn"
                onClick={() => focus && onInspect(focus.id)}
                title="Inspect project details"
                aria-label="Inspect project details"
              >
                ···
              </button>
            </div>
          </div>

          <div className="v2-hero-content">
            <div className="v2-hero-orb-col">
              <div className="v2-orb-stage" aria-label="Focus orb">
                <div className="v2-orb-anchor" ref={orbAnchor} aria-hidden="true" />
                <div className="v2-orb-pedestal" aria-hidden="true" />
                <div className="v2-orb-labels">
                  <span className="v2-project-seq">{projectNumber}</span>
                  <h4 className="v2-project-heading" title={focus?.title}>
                    {focus?.title || 'No active project'}
                  </h4>
                  <span className="v2-project-subheading">
                    {next?.title || next?.text || 'Final Model'}
                  </span>
                </div>
              </div>
            </div>

            <div className="v2-hero-action-col">
              <div className="v2-next-action-card">
                <div className="v2-next-action-head">
                  <span className="v2-lightning-icon" aria-hidden="true">⚡</span>
                  <span className="v2-next-action-title">Next action</span>
                </div>
                <p className="v2-next-action-text" title={next?.title || next?.text}>
                  {next?.title || next?.text || (focus ? 'Continue model refinement and run next simulation.' : 'Select a project to begin.')}
                </p>
                <button
                  type="button"
                  className="v2-next-advance-btn"
                  onClick={() => focus && onInspect(focus.id)}
                  aria-label="View next action details"
                >
                  ›
                </button>
              </div>

              {focus ? (
                <button
                  type="button"
                  className="v2-resume-work-btn"
                  onClick={() => onInspect(focus.id)}
                >
                  <span className="v2-play-triangle" aria-hidden="true">▶</span>
                  <span>Resume work</span>
                  <span className="v2-arrow-right" aria-hidden="true">→</span>
                </button>
              ) : (
                <p className="v2-muted">No active project in daily plan.</p>
              )}
            </div>
          </div>

          <div className="v2-hero-footer">
            <div className="v2-hero-progress-block">
              <div className="v2-progress-circle-wrap">
                <svg className="v2-progress-ring" width="38" height="38" viewBox="0 0 40 40" aria-hidden="true">
                  <circle className="v2-ring-bg" cx="20" cy="20" r="16" />
                  <circle
                    className="v2-ring-fg"
                    cx="20"
                    cy="20"
                    r="16"
                    style={{
                      strokeDasharray: 100.5,
                      strokeDashoffset: 100.5 - (100.5 * progressPercent) / 100,
                    }}
                  />
                </svg>
                <div className="v2-progress-texts">
                  <span className="v2-progress-label">Project progress</span>
                  <strong className="v2-progress-percent">{progressPercent}%</strong>
                </div>
              </div>
              <div className="v2-progress-bar-glow">
                <div
                  className="v2-progress-bar-fill"
                  style={{width: `${progressPercent}%`}}
                  aria-hidden="true"
                />
              </div>
            </div>

            <div className="v2-hero-milestones-block">
              <div className="v2-milestones-target">
                <span className="v2-target-icon" aria-hidden="true">🎯</span>
                <div className="v2-target-texts">
                  <span className="v2-target-label">Today's target</span>
                  <strong className="v2-target-ratio">
                    {progress.total ? `${progress.done}/${progress.total} tasks completed` : '0/0 tasks'}
                  </strong>
                </div>
              </div>
              {focus && (
                <button
                  type="button"
                  className="v2-view-milestones-btn"
                  onClick={() => onInspect(focus.id)}
                >
                  View milestones
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Right: Live Kanban Lanes */}
        <div className="v2-kanban-board" aria-label="Kanban board">
          {lanes.map(lane => {
            const tasks = data.tasks.filter(task => {
              const s = task.status || 'Backlog';
              if (s !== lane.id) return false;
              // Today's active focus project is featured inside the Orb hero panel!
              if (lane.id === 'Today' && focus && task.id === focus.id) return false;
              return true;
            });

            return (
              <section
                key={lane.id}
                className={`v2-lane v2-lane-${lane.id.toLowerCase().replace(/\s+/g, '-')}`}
                data-status={lane.id}
                aria-label={lane.label}
              >
                <div className="v2-lane-header">
                  <div className="v2-lane-title">
                    <span className="v2-lane-icon" aria-hidden="true">{lane.icon}</span>
                    <h3>{lane.label}</h3>
                  </div>
                  <span className="v2-lane-count">{tasks.length}</span>
                </div>

                <div className="v2-lane-cards">
                  {tasks.length ? (
                    tasks.map(task => {
                      const p = taskProgress(task);
                      return (
                        <button
                          key={task.id}
                          type="button"
                          className="v2-task-card"
                          onClick={() => onInspect(task.id)}
                          aria-label={`${task.title || 'Untitled task'}: ${p.total ? `${p.done}/${p.total} subtasks` : 'No subtasks'}`}
                        >
                          <span className="v2-task-card-icon" aria-hidden="true">📄</span>
                          <div className="v2-task-card-body">
                            <strong className="v2-task-card-title">{task.title || 'Untitled task'}</strong>
                            <span className="v2-task-card-sub">
                              {p.total ? `${p.done}/${p.total} subtasks` : 'No subtasks'}
                            </span>
                            {p.total > 0 && (
                              <div className="v2-task-progress-track" aria-hidden="true">
                                <div
                                  className="v2-task-progress-fill"
                                  style={{width: `${Math.round((p.done / p.total) * 100)}%`}}
                                />
                              </div>
                            )}
                          </div>
                          <span className="v2-task-card-chevron" aria-hidden="true">›</span>
                        </button>
                      );
                    })
                  ) : (
                    <div className="v2-lane-empty">
                      {lane.id === 'Done' ? (
                        <div className="v2-empty-completed">
                          <div className="v2-empty-check-circle" aria-hidden="true">✓</div>
                          <p className="v2-empty-title">No completed tasks yet</p>
                          <p className="v2-empty-sub">Finish tasks to see them here.</p>
                        </div>
                      ) : (
                        <p className="v2-empty-simple">Clear for now.</p>
                      )}
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      {/* 3. Bottom Row: Secondary Module Shortcuts (Desktop only) */}
      <div className="v2-module-shortcuts" aria-label="Module shortcuts">
        {[
          {id: 'ai', title: 'Invincible AI', desc: 'Plan, create, and execute with your AI companion.', icon: '✦', link: '../#ai'},
          {id: 'journal', title: 'Journal', desc: 'Capture thoughts, progress, and ideas.', icon: '📑', link: '../#journal'},
          {id: 'finance', title: 'Finance', desc: 'Track your income, expenses, and goals.', icon: '📈', link: '../#finance'},
          {id: 'workday', title: 'Workday', desc: 'Plan your day and stay consistent.', icon: '📅', link: '../#workday'},
        ].map(mod => (
          <a key={mod.id} href={mod.link} className="v2-shortcut-card">
            <span className="v2-shortcut-icon" aria-hidden="true">{mod.icon}</span>
            <div className="v2-shortcut-info">
              <strong>{mod.title}</strong>
              <p>{mod.desc}</p>
            </div>
            <span className="v2-shortcut-arrow" aria-hidden="true">›</span>
          </a>
        ))}
      </div>
    </div>
  );
}
