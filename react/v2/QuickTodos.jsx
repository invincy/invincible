import React, {useEffect, useState} from 'react';
import {completeTodayItem} from './today-actions';
import {addQuickTodo, calendarLink, completedTime, deleteQuickTodo, removeExpiredQuickTodo, retention, setQuickTodoDone, watchQuickTodos} from './quick-todos';

export default function QuickTodos({uid, priority}) {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState('');
  const [schedule, setSchedule] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [now, setNow] = useState(Date.now);
  useEffect(() => watchQuickTodos(uid, rows => {setItems(rows);setLoaded(true);}, () => setError('Could not load to-dos.')), [uid]);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const timer = setInterval(tick, 60000);
    window.addEventListener('focus', tick);
    return () => {clearInterval(timer);window.removeEventListener('focus', tick);};
  }, []);
  useEffect(() => {
    const cutoff = now - retention;
    for (const item of items) {
      const done = completedTime(item);
      if (done !== null && done <= cutoff) void removeExpiredQuickTodo(uid,item.id,cutoff).catch(() => {});
    }
  }, [items, now, uid]);

  async function run(action) {
    if (busy) return;
    setBusy(true);setError('');
    try {await action();}
    catch (failure) {setError(failure.message || 'Could not save. Try again.');}
    finally {setBusy(false);}
  }

  function add(event) {
    event.preventDefault();
    if (!title.trim()) return;
    const dueAt = schedule ? new Date(schedule).getTime() : null;
    if (dueAt !== null && !Number.isFinite(dueAt)) {setError('Enter a valid date and time.');return;}
    void run(async () => {
      await addQuickTodo(uid,title.trim(),dueAt);
      setTitle('');setSchedule('');
    });
  }

  const visible = items.filter(item => !item.completedAt || completedTime(item) > now-retention).sort((a,b) =>
    Number(Boolean(a.completedAt))-Number(Boolean(b.completedAt)) ||
    (completedTime(b) ?? b.createdAt?.toMillis?.() ?? 0)-(completedTime(a) ?? a.createdAt?.toMillis?.() ?? 0));
  const priorityTitle = priority?.step?.title || priority?.step?.text || priority?.task?.title;
  return <section className="v2-guide-todos" aria-labelledby="quick-todos-heading">
    <div className="v2-todo-priority">
      <span>Today’s priority</span>
      {priorityTitle ? <label><input type="checkbox" disabled={busy} checked={false} onChange={() => void run(() => completeTodayItem(uid,priority.id))}/><span>{priorityTitle}</span></label> : <p>No priority selected</p>}
    </div>
    <h2 id="quick-todos-heading">Quick to-dos</h2>
    <form onSubmit={add}>
      <div className="v2-todo-entry">
        <input aria-label="New to-do" placeholder="Add a to-do" value={title} maxLength={160} onChange={event => setTitle(event.target.value)} />
        <button type="submit" disabled={busy || !title.trim()}>Add</button>
      </div>
      <details><summary>Set date and time</summary><input type="datetime-local" aria-label="To-do date and time" value={schedule} onChange={event => setSchedule(event.target.value)} /></details>
    </form>
    {error && <p role="alert">{error}</p>}
    {!loaded && !error && <p role="status">Loading to-dos…</p>}
    <ul className="v2-todo-list">{visible.map(item => <li key={item.id} data-done={Boolean(item.completedAt)}>
      <label><input type="checkbox" disabled={busy} checked={Boolean(item.completedAt)} onChange={event => {const done=event.target.checked;void run(() => setQuickTodoDone(uid,item.id,done));}}/><span>{item.title}</span></label>
      <button type="button" aria-label={'Delete '+item.title} title="Delete" disabled={busy} onClick={() => void run(() => deleteQuickTodo(uid,item.id))}>×</button>
      {Number.isFinite(item.dueAt) && <div className="v2-todo-schedule">
        <time dateTime={new Date(item.dueAt).toISOString()}>{new Date(item.dueAt).toLocaleString(undefined,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}</time>
        {!item.completedAt && <a href={calendarLink(item)} target="_blank" rel="noopener noreferrer">Set Calendar alert ↗</a>}
      </div>}
    </li>)}</ul>
  </section>;
}
