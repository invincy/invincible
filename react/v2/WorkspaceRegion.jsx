import React, {useRef, useState} from 'react';
import KanbanBoard from './KanbanBoard';
import {Journey, FocusSession} from './widgets';
import {moveWorkspaceTask} from './move-task';

export default function WorkspaceRegion({data, plan, timer, onInspect, uid}) {
  const [pending, setPending] = useState({}), [message, setMessage] = useState(''), [error, setError] = useState('');
  const busy = useRef(new Set());
  const move = async (id, status) => {
    if (busy.current.has(id)) return;
    busy.current.add(id); setError(''); setMessage('Saving move…'); setPending(previous => ({...previous, [id]: status}));
    try {await moveWorkspaceTask(uid, id, status); setMessage('Moved to '+(status === 'Done' ? 'Completed' : status)+'.');}
    catch {setMessage(''); setError('The move could not be saved. Your task is back in its original lane. Try again.');}
    finally {busy.current.delete(id); setPending(previous => {const next = {...previous}; delete next[id]; return next;});}
  };
  return <div className="v2-workspace-body">
    <div className="v2-workspace-intro">
      <div>
        <h2>Your work</h2>
      </div>
      <span className="v2-workspace-total">{data.tasks.length} tasks · Drag to move</span>
    </div>
    <p className="v2-move-feedback" role={error ? 'alert' : 'status'}>{error || message || 'Drag a card or use Move to change its lane.'}</p>
    <KanbanBoard tasks={data.tasks.map(task => pending[task.id] ? {...task, status: pending[task.id]} : task)} onInspect={onInspect} onMove={move} pending={pending}/>
    <div className="v2-workspace-details">
      <Journey task={plan.active?.task}/>
      <FocusSession timer={timer}/>
    </div>
  </div>;
}
