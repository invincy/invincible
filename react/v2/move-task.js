import {doc, runTransaction, serverTimestamp} from 'firebase/firestore';
import {db} from '../src/firebase';
import {taskSteps} from '../src/task-model';
import {localDayKey} from './model';

export const kanbanLanes = [['Backlog', 'Backlog'], ['In Progress', 'In progress'], ['Today', 'Today'], ['Done', 'Completed']];

// Read first: a move must never recreate a deleted task.
export async function moveWorkspaceTask(uid, taskId, status, {ensurePlan = false} = {}) {
  if (!uid || !taskId || taskId.includes('/') || !kanbanLanes.some(([value]) => value === status)) throw Error('Invalid task move');
  const taskRef = doc(db, 'users', uid, 'tasks', taskId), dateKey = localDayKey();
  return runTransaction(db, async transaction => {
    const snapshot = await transaction.get(taskRef);
    if (!snapshot.exists()) throw Error('This task is no longer available');
    const task = snapshot.data();
    if ((task.status || 'Backlog') === status && !(status === 'Today' && ensurePlan)) return;
    if (status === 'Today') {
      const planRef = doc(db, 'users', uid, 'dailyPlans', dateKey);
      const planSnapshot = await transaction.get(planRef);
      const plan = planSnapshot.exists() ? planSnapshot.data() : {};
      const step = taskSteps(task).find(item => !item.done && item.status !== 'Done');
      const stepId = step?.id || null, id = `${taskId}__${stepId || 'task'}`;
      const items = Array.isArray(plan.items) ? plan.items : [];
      transaction.set(planRef, {dateKey, initialized: true,
        items: items.some(item => item.id === id) ? items : [...items, {id, taskId, stepId, addedAt: Date.now()}],
        activeItemId: id, updatedAt: serverTimestamp()}, {merge: true});
    }
    transaction.update(taskRef, {status, updatedAt: serverTimestamp()});
  });
}
