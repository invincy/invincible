import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {subscribeWorkspace} from '../react/v2/read-source.js';
import {resolvePlan, regionFromHash, localDayKey, remainingSeconds} from '../react/v2/model.js';

test('read source never subscribes without a restored account', () => {
  const values = [];
  const stop = subscribeWorkspace({tasks: () => assert.fail('protected read'), plan: () => assert.fail('protected read')}, null, '2026-10-13', data => values.push(data));
  assert.deepEqual(values[0].tasks, []);
  assert.equal(values[0].tasksReady, false);
  stop();
});
test('read source preserves document IDs/unknown fields and drops stale account callbacks', () => {
  const values = [], callbacks = {}, stopped = [];
  const adapter = {
    tasks: (uid, next, error) => {assert.equal(uid,'alice');callbacks.tasks=next;callbacks.taskError=error;return () => stopped.push('tasks');},
    plan: (uid, day, next) => {assert.equal(uid,'alice');assert.equal(day,'2026-10-13');callbacks.plan=next;return () => stopped.push('plan');},
  };
  const stop = subscribeWorkspace(adapter, 'alice', '2026-10-13', data => values.push(data));
  const fields = {id:'stored-field', title:'Real project', steps:[{id:'s', notes:'Keep notes', extension:{x:1}}]};
  callbacks.tasks({docs:[{id:'authoritative-id',data:()=>fields}],metadata:{fromCache:true}});
  callbacks.plan({exists:()=>true,data:()=>({activeItemId:'q',items:[{id:'q',taskId:'authoritative-id'}]})});
  assert.equal(values.at(-1).tasks[0].id,'authoritative-id');
  assert.equal(values.at(-1).tasks[0].steps[0].extension.x,1);
  assert.equal(values.at(-1).tasksCached,true);
  assert.equal(fields.id,'stored-field');
  const count=values.length;stop();
  callbacks.tasks({docs:[]});callbacks.taskError(Error('late'));
  assert.equal(values.length,count);assert.deepEqual(stopped,['tasks','plan']);
});
test('failed listeners clear stale records and partial subscription failures clean up', () => {
  let taskError, value, disposed=false;
  const adapter={tasks:(_uid,next,error)=>{taskError=error;next({docs:[{id:'a',data:()=>({title:'Private'})}]});return ()=>{disposed=true;};},plan:()=>()=>{}};
  const stop=subscribeWorkspace(adapter,'a','day',data=>{value=data;});
  taskError(Error('permission-denied'));
  assert.deepEqual(value.tasks,[]);assert.match(value.taskError,/could not sync/);stop();assert.equal(disposed,true);
  disposed=false;
  subscribeWorkspace({...adapter,plan:()=>{throw Error('offline');}},'a','day',data=>{value=data;});
  assert.equal(disposed,true);assert.deepEqual(value.tasks,[]);assert.equal(value.plan,null);
});
test('focus uses saved daily-plan order, skips missing/completed references, never fabricates a mission', () => {
  const tasks=[{id:'a',status:'Today',steps:[{id:'s',title:'Next',done:false}]},{id:'b',status:'Done'},{id:'c',status:'Backlog',subtasks:[{id:'legacy',text:'Legacy step'}]}];
  assert.equal(resolvePlan(tasks,null).active,null);
  const plan={activeItemId:'missing',items:[{id:'done',taskId:'b'},{id:'missing',taskId:'a',stepId:'removed'},{id:'legacy',taskId:'c',stepId:'legacy'},{id:'a',taskId:'a',stepId:'s'}]};
  assert.equal(resolvePlan(tasks,plan).active.id,'legacy');
  assert.equal(resolvePlan(tasks,{...plan,activeItemId:'a'}).active.step.title,'Next');
  assert.equal(resolvePlan(tasks,{items:'bad'}).active,null);
  const completed=[{id:'finished',status:'Done',steps:[{id:'open',done:false}]},...tasks];
  const withCompleted={activeItemId:'finished',items:[{id:'finished',taskId:'finished',stepId:'open'},...plan.items]};
  assert.equal(resolvePlan(completed,withCompleted).active.id,'legacy','completed projects cannot remain active through an unfinished step');
});
test('region links, local calendar day and deadline timer survive elapsed wall time', () => {
  assert.equal(regionFromHash('#workspace'),'workspace');assert.equal(regionFromHash('#unknown'),'dashboard');
  assert.equal(localDayKey(new Date(2026,9,13,23,59)),'2026-10-13');
  assert.equal(remainingSeconds({endsAt:10000,seconds:1500},2500),8);
  assert.equal(remainingSeconds({endsAt:10000,seconds:1500},20000),0);
  assert.equal(remainingSeconds({endsAt:null,seconds:47},20000),47);
});
test('V2 data adapter is a read-only boundary and reuses the canonical Firebase adapter', () => {
  const source=fs.readFileSync(new URL('../react/v2/useWorkspaceData.js',import.meta.url),'utf8');
  assert.match(source,/from '..\/src\/firebase'/);
  assert.doesNotMatch(source,/setDoc|updateDoc|deleteDoc|runTransaction|writeBatch|addDoc|httpsCallable/);
  const main=fs.readFileSync(new URL('../react/v2/main.jsx',import.meta.url),'utf8');
  assert.match(main,/AuthProvider/);
  const config=fs.readFileSync(new URL('../react/vite.v2.config.js',import.meta.url),'utf8');
  assert.match(config,/outDir: '..\/..\/v2-dist'/);
});
