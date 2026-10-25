import {doc,runTransaction,serverTimestamp} from 'firebase/firestore';
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
