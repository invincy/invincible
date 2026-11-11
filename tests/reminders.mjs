import assert from 'node:assert/strict';
import test from 'node:test';
import {groupReminders,nextDailyDue,completeReminder,migrateQuickTodo,restoreReminder,expireReminder} from '../react/src/reminder-model.js';
const date = (day, hour=9) => new Date(2026,9,day,hour);
test('overdue, today and future include all incomplete records across calendar boundaries',()=>{
 const items=[{id:'past',dueAt:date(2)},{id:'today',dueAt:date(3)},{id:'future',dueAt:date(4)},{id:'done',dueAt:date(1),completed:true}];
 const groups=groupReminders(items,date(3));
 assert.deepEqual(groups.overdue.map(x=>x.id),['past']);assert.deepEqual(groups.today.map(x=>x.id),['today']);assert.deepEqual(Object.values(groups.upcoming).flat().map(x=>x.id),['future']);
 assert.equal(groupReminders(items,date(4)).overdue.length,2);
});
test('daily recurrence skips missed dates and retains scheduled local time',()=>{
 const next=nextDailyDue(date(1,17),date(3));assert.equal(next.getDate(),4);assert.equal(next.getHours(),17);
 const original=date(3,17);nextDailyDue(original,date(3));assert.equal(original.getDate(),3);
 const year=nextDailyDue(new Date(2026,11,31,9),new Date(2026,11,31));assert.equal(year.getFullYear(),2027);assert.equal(year.getMonth(),0);
});
function database(initial){
 let records=new Map(Object.entries(initial)),fail=false;
 const api={db:{},doc:(_,...parts)=>parts.join('/'),Timestamp:{fromDate:x=>new Date(x)},serverTimestamp:()=>123,
 runTransaction:async(_,fn)=>{const pending=[];const result=await fn({get:async ref=>({exists:()=>records.has(ref),data:()=>records.get(ref)}),set:(ref,value)=>pending.push([ref,value]),update:(ref,value)=>pending.push([ref,{...records.get(ref),...value}]),delete:ref=>pending.push([ref,null])});if(fail){fail=false;throw Error('commit failed')}for(const [key,value] of pending){if(value===null)records.delete(key);else records.set(key,value);}return result}};
 return {api,get records(){return records},fail:()=>{fail=true}};
}
test('daily completion is atomic, retryable after failure and idempotent after success',async()=>{
 const source='users/u/reminders/r',store=database({[source]:{title:'Updated server title',dueAt:date(2),repeat:'daily',completed:false}});
 store.fail();await assert.rejects(completeReminder(store.api,'u','r',date(3)));assert.equal(store.records.size,1);assert.equal(store.records.get(source).completed,false);
 assert.equal(await completeReminder(store.api,'u','r',date(3)),true);assert.equal(store.records.size,2);assert.equal(store.records.get(source).completed,true);
 const next=[...store.records.entries()].find(([key])=>key!==source)[1];assert.equal(next.title,'Updated server title');assert.equal(next.dueAt.getDate(),4);
 assert.equal(await completeReminder(store.api,'u','r',date(3)),false);assert.equal(store.records.size,2);
});
test('nonrecurring completion and removed reminders create no successor',async()=>{
 const store=database({'users/u/reminders/r':{repeat:'none'}});await completeReminder(store.api,'u','r');assert.equal(store.records.size,1);assert.equal(await completeReminder(store.api,'u','missing'),false);
});


test('no-date reminders remain in Anytime instead of becoming overdue',()=>{
 const grouped=groupReminders([{id:'shopping',dueAt:null},{id:'missing-date'},{id:'invalid',dueAt:'bad'}],date(3));
 assert.equal(grouped.overdue.length,0);assert.equal(grouped.anytime.length,3);
});
test('todo consolidation moves atomically, preserves metadata and never overwrites an edited reminder',async()=>{
 const source='users/u/quickTodos/a',target='users/u/reminders/quick_a';
 const store=database({[source]:{title:'Shopping',dueAt:null,createdAt:7,completedAt:null,unknown:{keep:true}}});
 store.fail();await assert.rejects(migrateQuickTodo(store.api,'u','a'));assert.equal(store.records.has(source),true);assert.equal(store.records.has(target),false);
 await migrateQuickTodo(store.api,'u','a');assert.equal(store.records.has(source),false);assert.equal(store.records.get(target).dueAt,null);assert.equal(store.records.get(target).completed,false);assert.deepEqual(store.records.get(target).unknown,{keep:true});
 store.records.get(target).title='Edited reminder';await migrateQuickTodo(store.api,'u','a');assert.equal(store.records.get(target).title,'Edited reminder');
 store.records.set(source,{title:'Stale cached todo'});await migrateQuickTodo(store.api,'u','a');assert.equal(store.records.get(target).title,'Edited reminder');assert.equal(store.records.has(source),false);
});
test('migration collision, account changes and cleanup cannot erase unchecked or restored items',async()=>{
 const store=database({'users/u/quickTodos/a':{title:'Keep me'},'users/u/reminders/quick_a':{title:'Unrelated',completed:false},'users/u/reminders/done':{completed:true,completedAt:1}});
 await assert.rejects(migrateQuickTodo(store.api,'u','a'));assert.equal(store.records.has('users/u/quickTodos/a'),true);
 await assert.rejects(migrateQuickTodo(store.api,'u','a',()=>false));
 await expireReminder(store.api,'u','quick_a',10);assert.equal(store.records.has('users/u/reminders/quick_a'),true);
 await restoreReminder(store.api,'u','done');await expireReminder(store.api,'u','done',10);assert.equal(store.records.has('users/u/reminders/done'),true);
 store.records.set('users/u/reminders/old',{completed:true,completedAt:1});await expireReminder(store.api,'u','old',10);assert.equal(store.records.has('users/u/reminders/old'),false);
});
