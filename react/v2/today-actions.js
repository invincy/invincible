import {doc,runTransaction,serverTimestamp} from 'firebase/firestore';
import {compatibleStepFields, setStepDone, taskContent} from './task-content';
import {db} from '../src/firebase';
import {localDayKey,resolvePlan} from './model';

export async function focusTodayItem(uid,itemId) {
  if(!uid||!itemId)throw Error('Select an available plan item.');
  const ref=doc(db,'users',uid,'dailyPlans',localDayKey());
  return runTransaction(db,async transaction=>{
    const saved=await transaction.get(ref);if(!saved.exists())throw Error('Today’s plan is no longer available.');
    const plan=saved.data(),item=(plan.items||[]).find(item=>item.id===itemId);
    if(!item?.taskId||item.taskId.includes('/'))throw Error('This item is no longer in today’s plan.');
    const task=await transaction.get(doc(db,'users',uid,'tasks',item.taskId));
    if(!task.exists()||!resolvePlan([{...task.data(),id:item.taskId}],{items:[item]}).active)throw Error('This item is finished or unavailable.');
    transaction.update(ref,{activeItemId:itemId,updatedAt:serverTimestamp()});
  });
}

export async function completeTodayItem(uid, itemId) {
  if (!uid || !itemId) throw Error('Choose an available plan item.');
  const ref = doc(db, 'users', uid, 'dailyPlans', localDayKey());
  return runTransaction(db, async transaction => {
    const plan = await transaction.get(ref);
    const item = (plan.data()?.items || []).find(row => row.id === itemId);
    if (!item?.taskId || item.taskId.includes('/')) throw Error('This item is no longer in today’s plan.');
    const taskRef = doc(db, 'users', uid, 'tasks', item.taskId);
    const snapshot = await transaction.get(taskRef);
    if (!snapshot.exists()) throw Error('This task is no longer available.');
    const task = snapshot.data();
    if (task.status === 'Done') return;
    if (!item.stepId) {
      transaction.update(taskRef, {status:'Done', updatedAt:serverTimestamp()});
      return;
    }
    const steps = taskContent(task).steps;
    if (!steps.some(step => step.id === item.stepId)) throw Error('This step is no longer available.');
    const updated = steps.map(step => step.id === item.stepId ? setStepDone(step, true) : step);
    const fields = compatibleStepFields(updated, task);
    if (task.activeStepId === item.stepId) fields.activeStepId = updated.find(step => !step.done)?.id || null;
    transaction.update(taskRef, {...fields, updatedAt:serverTimestamp()});
  });
}
