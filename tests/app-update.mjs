import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const source=(await fs.readFile(new URL('../shared/app-update.js',import.meta.url),'utf8')).replace("import {APP_VERSION} from './app-release.js';","const APP_VERSION='current';");
const updates=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
test('release checks bypass cache, distinguish versions and reject bad responses',async()=>{
 const original=globalThis.fetch;
 try {
  globalThis.fetch=async(url,options)=>{assert.equal(url,'/invincible/app-version.json');assert.equal(options.cache,'no-store');return{ok:true,json:async()=>({version:'current'})}};
  assert.equal((await updates.checkForUpdate()).available,false);
  globalThis.fetch=async()=>({ok:true,json:async()=>({version:'next'})});
  assert.equal((await updates.checkForUpdate()).available,true);
  globalThis.fetch=async()=>({ok:false});await assert.rejects(updates.checkForUpdate());
  globalThis.fetch=async()=>({ok:true,json:async()=>({})});await assert.rejects(updates.checkForUpdate());
 }finally{globalThis.fetch=original;}
});
