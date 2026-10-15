import React, {useEffect, useRef, useState} from 'react';
import {taskProgress} from '../src/task-model';
import {kanbanLanes as lanes} from './move-task';

export default function KanbanBoard({tasks, onInspect, onMove, pending = {}}) {
  const [dragId, setDragId] = useState(null), [target, setTarget] = useState(null), [ghost, setGhost] = useState(null);
  const pointer = useRef(null), dragged = useRef(null), suppressClick = useRef(0), restoreFocus = useRef(null), board = useRef(null);
  const clear = () => {pointer.current = null; dragged.current = null; setDragId(null); setTarget(null); setGhost(null);};
  useEffect(() => {
    const cancel = event => {if (event.key === 'Escape') clear();};
    window.addEventListener('keydown', cancel); window.addEventListener('blur', clear);
    return () => {window.removeEventListener('keydown', cancel); window.removeEventListener('blur', clear);};
  }, []);
  useEffect(() => {
    if (!restoreFocus.current || pending[restoreFocus.current]) return;
    board.current?.querySelector(`[data-task-id="${CSS.escape(restoreFocus.current)}"] select`)?.focus({preventScroll: true});
    restoreFocus.current = null;
  }, [tasks, pending]);
  const laneAt = (x, y) => document.elementFromPoint(x, y)?.closest('.v2-lane')?.dataset.status;
  const drop = (id, status) => {
    clear();
    const task = tasks.find(item => item.id === id);
    if (task && status && !pending[id] && (task.status || 'Backlog') !== status) onMove(id, status);
  };
  return <div ref={board} className="v2-kanban-board" aria-label="Kanban board">{lanes.map(([status, label]) => {
    const cards = tasks.filter(task => (task.status || 'Backlog') === status);
    return <section className={'v2-lane' + (target === status ? ' is-drop-target' : '')} key={status} data-status={status} aria-label={label}
      onDragOver={event => {if (!dragged.current) return; event.preventDefault(); event.dataTransfer.dropEffect = 'move'; setTarget(status);}}
      onDragLeave={event => {if (!event.currentTarget.contains(event.relatedTarget)) setTarget(null);}}
      onDrop={event => {event.preventDefault(); drop(dragged.current, status);}}>
      <div className="v2-lane-header"><h3>{label}</h3><span className="v2-lane-count">{cards.length}</span></div>
      <div className="v2-lane-cards">{cards.length ? cards.map(task => {
        const progress = taskProgress(task), title = task.title || 'Untitled task', saving = Boolean(pending[task.id]);
        return <article className={'v2-task-wrap' + (dragId === task.id ? ' is-dragging' : '')} key={task.id} data-task-id={task.id} aria-busy={saving}>
          <button className="v2-task-card" draggable={!saving} onDragStart={event => {
            event.dataTransfer.setData('text/plain', task.id); event.dataTransfer.effectAllowed = 'move'; dragged.current = task.id; setDragId(task.id);
          }} onDragEnd={() => {suppressClick.current = Date.now() + 300; clear();}}
            onClick={() => {if (Date.now() >= suppressClick.current) onInspect(task.id);}}>
            <strong className="v2-task-card-title">{title}</strong>
            <span className="v2-task-card-sub">{saving ? 'Saving move…' : progress.total ? `${progress.done} of ${progress.total} steps` : 'No saved steps'}</span>
            {progress.total > 0 && <progress max={progress.total} value={progress.done} aria-label={'Progress for '+title}/>}
          </button>
          <button className="v2-drag-handle" tabIndex={-1} disabled={saving} aria-label={'Drag '+title} title="Drag to another lane" onClick={event => event.preventDefault()}
            onPointerDown={event => {
              if (saving || !event.isPrimary || event.button !== 0) return;
              event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId);
              pointer.current = {id: task.id, pointerId: event.pointerId}; dragged.current = task.id; setDragId(task.id);
              setGhost({x: event.clientX, y: event.clientY, title});
            }} onPointerMove={event => {
              if (pointer.current?.pointerId !== event.pointerId) return;
              setGhost({x: event.clientX, y: event.clientY, title}); setTarget(laneAt(event.clientX, event.clientY) || null);
              const scroll = document.elementFromPoint(event.clientX, event.clientY)?.closest('.v2-lane-cards');
              if (scroll) {const rect = scroll.getBoundingClientRect(); if (event.clientY > rect.bottom-35) scroll.scrollTop += 18; else if (event.clientY < rect.top+35) scroll.scrollTop -= 18;}
            }} onPointerUp={event => {
              if (pointer.current?.pointerId !== event.pointerId) return;
              suppressClick.current = Date.now() + 300; drop(task.id, laneAt(event.clientX, event.clientY));
            }} onPointerCancel={clear} onLostPointerCapture={() => {if (pointer.current) clear();}}>⠿</button>
          <select className="v2-task-move" aria-label={'Move '+title+' to'} disabled={saving} value="" onChange={event => {restoreFocus.current = task.id; drop(task.id, event.target.value);}}>
            <option value="" disabled>Move…</option>{lanes.map(([value, name]) => <option key={value} value={value} disabled={value === status}>{name}</option>)}
          </select>
        </article>;
      }) : <p className="v2-lane-empty">{dragId ? 'Drop here' : 'Clear for now.'}</p>}</div>
    </section>;
  })}{ghost && <div className="v2-drag-ghost" style={{left: ghost.x+12, top: ghost.y+12}} aria-hidden="true">{ghost.title}</div>}</div>;
}
