import React from 'react';
import {widgetRegistry} from './widgets';
export default function WorkspaceRegion({data, plan, timer}) {
  return <><div className="v2-workspace-intro"><p className="v2-eyebrow">A LITTLE ROOM TO THINK</p><h2>Your essentials.<br/>Together, in one place.</h2><p className="v2-muted">A first collection of connected widgets. Your task overview, project journey and focus session share the same state across this workspace.</p></div>
    <div className="v2-widget-grid">{widgetRegistry.map(({id, Component, title, description}) => <div key={id} className={'v2-widget v2-widget-'+id}>{id === 'tasks' ? <section className="v2-panel"><div className="v2-panel-heading"><h3>{title}</h3><span>Live records</span></div><Component tasks={data.tasks}/><p className="v2-muted">{description}</p></section> : <Component task={plan.active?.task} timer={timer}/>}</div>)}</div>
    <p className="v2-prototype-note">Prototype layout · Adding, moving and resizing widgets comes in the next phase.</p>
  </>;
}
