import React from 'react';
import KanbanBoard from './KanbanBoard';
import {Journey, FocusSession} from './widgets';

export default function WorkspaceRegion({data, plan, timer, onInspect}) {
  return <div className="v2-workspace-body">
    <div className="v2-workspace-intro">
      <div>
        <p className="v2-eyebrow">YOUR CONNECTED WORK</p>
        <h2>My Workspace</h2>
        <p className="v2-muted">All your saved projects, organized by status. Select one to review its steps and notes.</p>
      </div>
      <span className="v2-workspace-total">{data.tasks.length} saved records · Read only</span>
    </div>
    <KanbanBoard tasks={data.tasks} onInspect={onInspect}/>
    <div className="v2-workspace-details">
      <Journey task={plan.active?.task}/>
      <FocusSession timer={timer}/>
    </div>
  </div>;
}
