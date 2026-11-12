import React, {useRef} from 'react';
import {taskProgress, taskSteps} from '../src/task-model';
import {formatTimer} from './model';
import ConstellationNav from './ConstellationNav';
import DashboardReminders from './DashboardReminders';

const stages = [
  ['Backlog', 'Backlog'],
  ['In Progress', 'In progress'],
  ['Today', 'Today'],
  ['Done', 'Completed'],
];

export default function DashboardRegion({uid, data, plan, timer, onInspect, orbAnchor, theme = 'gold', onChangeTheme, onOpenWorkspace, onTravel, onPlan, onPanelScroll}) {
  const scene = useRef(null);
  const focus = plan.active?.task;
  const next = plan.active?.step || taskSteps(focus).find(step => !step.done && step.status !== 'Done');
  const progress = taskProgress(focus);

  return <div className="v2-dashboard-body">
    <nav className="v2-guide-panel-links" aria-label="Dashboard panels">
      {['Globe','Focus & reminders','Session'].map((label,index)=><button key={label} type="button"
        onClick={()=>scene.current.children[index].scrollIntoView({block:'nearest',inline:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})}>{label}</button>)}
    </nav>
    <section ref={scene} className="v2-guide-scene" aria-label="Your focus and connected work" onScroll={onPanelScroll}>
      <div className="v2-guide-globe-panel">
      <div className="v2-guide-atmosphere" aria-hidden="true"/>
      <div className="v2-guide-orb-anchor" ref={orbAnchor}><div className="v2-orb-grab" aria-hidden="true"/><svg className="v2-theme-two-emblem" viewBox="0 0 48 48" aria-hidden="true"><path d="M39 6C23 7 10 13 9 25c-.5 6 3 10 8 11 11 2 20-12 22-30ZM8 42c5-12 13-20 25-29"/></svg><button className="v2-orb-plan" type="button" aria-label="Open today's plan" onClick={onPlan}><span>Today’s plan</span><strong>{plan.items.filter(item=>!item.done&&!item.missing).length} remaining</strong><span className="v2-orb-plan-preview">{plan.active?.step?.title||plan.active?.step?.text||focus?.title||'Choose your next task'}</span></button></div>
      <ConstellationNav task={focus} onInspect={onInspect} onTravel={onTravel}/>
      <div className="v2-guide-orb-label">
        <button onClick={onChangeTheme} aria-label={'Orb theme: '+theme+'. Change theme'}>◐ {theme}</button>
      </div>
      </div>

      <div className="v2-guide-left">
      <div className="v2-guide-mission">
        <span className="v2-guide-kicker">IN FOCUS</span>
        {focus ? <h2 title={focus.title}>{focus.title}</h2> : <p className="v2-guide-empty">No task selected</p>}
        {next && <p className="v2-guide-nextline" title={next.title || next.text}><span>Next</span>{next.title || next.text}</p>}
        {focus && <button className="v2-guide-primary" onClick={() => onInspect(focus.id)}>Resume <span aria-hidden="true">↗</span></button>}
        {focus && <div className="v2-guide-progress" aria-label="Project progress">
          <span>{progress.total ? `${progress.done} / ${progress.total} steps` : 'No steps'}</span>
          <progress max={progress.total || 1} value={progress.done} aria-label="Completed project steps"/>
        </div>}
      </div>

      <DashboardReminders uid={uid} priority={plan.active} onOpen={()=>onTravel({href:"/invincible/reminders/",label:"Reminders"})}/>
      </div>

      <div className="v2-guide-session-panel">
      <div className="v2-guide-timer" aria-label="Focus session">
        <span className="v2-guide-kicker">FOCUS SESSION</span>
        <output aria-label="Time remaining">{formatTimer(timer.seconds)}</output>
        <div className="v2-guide-timer-controls">
          <button aria-label={timer.running ? 'Pause focus' : 'Start focus'} onClick={timer.running ? timer.pause : timer.start}>{timer.running ? 'Pause' : 'Start'}</button>
          <button aria-label="Reset timer" onClick={timer.reset}>Reset</button>
        </div>
      </div>

      <div className="v2-guide-work">
        <span className="v2-guide-kicker">WORKSPACE</span>
        <div className="v2-guide-statuses" aria-label="Task counts by status">{stages.map(([status, label]) =>
          <span key={status} data-status={status}><b>{data.tasks.filter(task => (task.status || 'Backlog') === status).length}</b> {label}</span>
        )}</div>
        <button className="v2-guide-work-link" onClick={onOpenWorkspace}>Open workspace <span aria-hidden="true">→</span></button>
      </div>
      </div>
    </section>
  </div>;
}
