// Adapter injection makes auth restoration and stale-listener behavior testable.
// No writes, seeding, migrations, callable functions, or data caches in this source.
export function subscribeWorkspace(adapter, uid, dateKey, publish) {
  let live = true;
  let state = {tasks: [], plan: null, tasksReady: false, planReady: false, taskError: '', planError: '', tasksCached: false, planCached: false};
  const update = patch => { if (live) { state = {...state, ...patch}; publish(state); } };
  publish(state);
  if (!uid) return () => { live = false; };
  const stops = [];
  try {
    stops.push(adapter.tasks(uid, snapshot => update({
      tasks: snapshot.docs.map(item => ({...item.data(), id: item.id})),
      tasksReady: true, taskError: '', tasksCached: Boolean(snapshot.metadata?.fromCache),
    }), () => update({tasks: [], tasksReady: true, taskError: 'Tasks could not sync. Check your connection and retry.'})));
    stops.push(adapter.plan(uid, dateKey, snapshot => update({
      plan: snapshot.exists() ? snapshot.data() : null, planReady: true, planError: '',
      planCached: Boolean(snapshot.metadata?.fromCache),
    }), () => update({plan: null, planReady: true, planError: 'Your daily plan could not sync. No active mission is shown.'})));
  } catch {
    update({tasks: [], plan: null, tasksReady: true, planReady: true, taskError: 'Workspace could not connect. Retry to reconnect.'});
    live = false;
    stops.forEach(stop => stop());
  }
  return () => { live = false; stops.forEach(stop => stop()); };
}
