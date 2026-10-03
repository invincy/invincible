import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
const moduleFrom=async path=>import('data:text/javascript;base64,'+Buffer.from(await fs.readFile(new URL('../'+path,import.meta.url),'utf8')).toString('base64'));
const garage=await moduleFrom('garage/garage-model.js');
const finance=await moduleFrom('react/src/finance-storage.js');
const journal=await moduleFrom('journal/journal-strokes-hook.js');
test('Garage edits all record types and deletion cascades only the selected vehicle',()=>{
 let state=garage.normalizeGarage();
 const upsert=(kind,item,editing=false)=>{state=garage.applyGarageChange(state,{action:'upsert',kind,item,editing,date:'2026-10-03',readingId:'odo-'+item.id})};
 upsert('vehicle',{id:'a',name:'Car',odometer:100});upsert('vehicle',{id:'b',name:'Bike',odometer:50});
 upsert('vehicle',{id:'a',name:'Renamed car',odometer:120},true);
 assert.equal(state.vehicles[0].name,'Renamed car');assert.equal(state.odometerReadings.length,2);assert.equal(garage.currentOdometer(state,'a'),120);
 for(const kind of ['fuel','service','reminder']){upsert(kind,{id:kind,vehicleId:'a',date:'2026-10-03',title:'Before'});upsert(kind,{id:kind,vehicleId:'a',date:'2026-10-03',title:'After'},true);assert.equal(state[garage.recordKeys[kind]][0].title,'After')}
 upsert('service',{id:'b-service',vehicleId:'b'});
 state=garage.applyGarageChange(state,{action:'delete',kind:'vehicle',id:'a'});
 assert.deepEqual(state.vehicles.map(item=>item.id),['b']);assert.deepEqual(state.services.map(item=>item.id),['b-service']);assert.equal(state.fuel.length,0);assert.equal(state.reminders.length,0);
 assert.throws(()=>upsert('vehicle',{id:'a',name:'Stale',odometer:120},true),/removed/);
 assert.throws(()=>upsert('service',{id:'lost',vehicleId:'a'}),/no longer/);
});
test('Finance merges local changes without deleting remote additions',()=>{
 const before={accounts:[{id:'a',balance:10},{id:'removed',balance:2}],bills:[],transactions:[],checklist:[],initializedFrom:''};
 const remote={...before,accounts:[...before.accounts,{id:'other-device',balance:40}],transactions:[{id:'remote-tx',amount:5}]};
 const after={...before,accounts:[{id:'a',balance:20}],transactions:[{id:'local-tx',amount:8}]};
 const result=finance.mergeFinanceChange(remote,before,after);
 assert.deepEqual(result.accounts,[{id:'a',balance:20},{id:'other-device',balance:40}]);assert.deepEqual(result.transactions.map(item=>item.id),['remote-tx','local-tx']);
});
test('Journal retains failed writes/deletes through snapshots and reload, then retries',async()=>{
 const storage=new Map(),events=new Map();globalThis.localStorage={getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)};globalThis.window={addEventListener:(name,fn)=>events.set(name,fn),removeEventListener:()=>{},dispatchEvent:event=>events.get(event.type)?.()};
 let user={uid:'same-google-account'},fail=true,snapshot,cleanup,values=[],cursor=0,effectRun=false;const rows=new Map();
 const React={useState:initial=>{const index=cursor++;if(!(index in values))values[index]=initial;return[values[index],value=>{values[index]=typeof value==='function'?value(values[index]):value}]},useRef:initial=>{const index=cursor++;if(!(index in values))values[index]={current:initial};return values[index]},useEffect:fn=>{if(!effectRun){effectRun=true;cleanup=fn()}}};
 const store={getJournalStrokes:async()=>[],upsertJournalStroke:async()=>{},deleteJournalStroke:async()=>{},bulkUpsertJournal:async()=>{}};
 const hook=journal.createJournalStrokesHook({React,openLocalStore:async()=>store,currentUser:async()=>user,getDb:async()=>({}),collection:(...parts)=>parts,query:ref=>ref,orderBy:()=>{},onSnapshot:(ref,options,cb)=>{snapshot=cb;return()=>{}},doc:(db,...parts)=>parts.join('/'),setDoc:async(ref,data)=>{if(fail)throw{code:'permission-denied'};rows.set(data.id,data)},deleteDoc:async ref=>{if(fail)throw{code:'permission-denied'};rows.delete(ref.split('/').at(-1))},readLegacy:()=>[]});
 const render=()=>{cursor=0;return hook('2026-10-03',user?.uid)};render();await new Promise(resolve=>setTimeout(resolve,0));
 await render().saveStroke({id:'one',createdAtMs:1,points:[1,2]});
 snapshot({metadata:{hasPendingWrites:false,fromCache:false},forEach:()=>{}});
 assert.equal(render().strokes[0].id,'one');assert.equal(render().error.code,'permission-denied');assert.equal(JSON.parse(storage.get('invincible.journalPending.same-google-account.2026-10-03')).length,1);
 cleanup();values=[];effectRun=false;render();await new Promise(resolve=>setTimeout(resolve,0));assert.equal(render().strokes[0].id,'one');
 fail=false;await events.get('online')();assert.equal(rows.size,1);assert.equal(render().user.pendingCount,0);
 fail=true;await render().deleteStroke('one');snapshot({metadata:{hasPendingWrites:false,fromCache:false},forEach:fn=>fn({id:'one',data:()=>rows.get('one')})});assert.equal(render().strokes.length,0);
 fail=false;await events.get('online')();assert.equal(rows.size,0);assert.equal(render().user.pendingCount,0);cleanup();
 user=null;values=[];effectRun=false;render();await new Promise(resolve=>setTimeout(resolve,0));assert.equal(render().user,null);cleanup();
});
test('Creator save acknowledgements do not clear newer edits, and failed saves keep drafts',async()=>{
 const source=await fs.readFile(new URL('../creator/project.js',import.meta.url),'utf8');
 const functions=source.slice(source.indexOf('function copyProject('),source.indexOf('function autoGrow('));
 const storage=new Map(),writes=[],acks=[];
 const factory=new Function('localStorage','setDoc','serverTimestamp','storageError','status',`let user={uid:'owner'},projectId='project',project={title:'Original',scenes:[{voiceover:'First'}]},projectRef={},saveChain=Promise.resolve(),editVersion=0,cloudVersion=0,saveTimer=null,localDirty=false;${functions};return{save,queueSave,project,get dirty(){return localDirty},clear(){clearTimeout(saveTimer)}}`);
 const instance=factory({setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)},(ref,data)=>{writes.push(data);return new Promise((resolve,reject)=>acks.push({resolve,reject}))},()=>0,error=>error.message,()=>{});
 const first=instance.save();await Promise.resolve();instance.project.scenes[0].voiceover='Newer';instance.queueSave();instance.clear();acks.shift().resolve();await first;assert.equal(instance.dirty,true);assert.equal(writes[0].scenes[0].voiceover,'First');assert.equal(storage.size,1);
 const failed=instance.save();await Promise.resolve();acks.shift().reject(Error('Denied'));assert.equal(await failed,false);assert.equal(instance.dirty,true);assert.equal(storage.size,1);
 const last=instance.save();await Promise.resolve();acks.shift().resolve();assert.equal(await last,true);assert.equal(instance.dirty,false);assert.equal(storage.size,0);
});
