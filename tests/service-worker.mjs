import fs from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import test from 'node:test';
test('Retired Reminders worker clears only its own caches and unregisters',async()=>{
 const source=await fs.readFile(new URL('../reminders/service-worker.js',import.meta.url),'utf8'),events=new Map(),deleted=[];let unregistered=false,skipped=false;
 vm.runInNewContext(source,{self:{addEventListener:(event,handler)=>events.set(event,handler),skipWaiting:async()=>{skipped=true},registration:{unregister:async()=>{unregistered=true}}},caches:{keys:async()=>['invincible-reminders-v6','invincible-reminders-v7','another-app-cache'],delete:async key=>deleted.push(key)}});
 let pending;events.get('install')({waitUntil:promise=>pending=promise});await pending;events.get('activate')({waitUntil:promise=>pending=promise});await pending;
 assert.equal(skipped,true);assert.equal(unregistered,true);assert.deepEqual(deleted,['invincible-reminders-v6','invincible-reminders-v7']);assert.equal(events.has('fetch'),false);
});
