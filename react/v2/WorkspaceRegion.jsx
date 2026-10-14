import React from 'react';
import {widgetRegistry} from './widgets';

export default function WorkspaceRegion({data, plan, timer}) {
  return (
    <div className="v2-workspace-body">
      <div className="v2-workspace-intro">
        <p className="v2-eyebrow">CONNECTED WORKSPACE</p>
        <h2>Your essentials.<br/>Together, in one place.</h2>
        <p className="v2-muted">
          A dedicated space for strategic planning, milestone tracking, and focus intervals.
          Shared state across your entire workspace.
        </p>
      </div>
      <div className="v2-widget-grid">
        {widgetRegistry.map(({id, Component, title, description}) => (
          <div key={id} className={'v2-widget v2-widget-' + id}>
            {id === 'tasks' ? (
              <section className="v2-panel">
                <div className="v2-panel-heading">
                  <h3>{title}</h3>
                  <span className="v2-panel-badge">Pipeline volume</span>
                </div>
                <Component tasks={data.tasks} />
                <p className="v2-muted">{description}</p>
              </section>
            ) : (
              <Component task={plan.active?.task} timer={timer} />
            )}
          </div>
        ))}
      </div>
      <p className="v2-prototype-note">
        Spatial layout · Main Dashboard and My Workspace stay connected in real time.
      </p>
    </div>
  );
}

