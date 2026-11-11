import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { chromium } from 'playwright';
import { createLocalAgentServer } from '../../local-ai/agent-server.mjs';
import { fakeGpu } from '../fixtures/imagegen-service.mjs';
const root=path.resolve(process.env.INVINCIBLE_TEST_PUBLIC_ROOT||path.resolve(import.meta.dirname,'../..')),site='https://invincy.github.io',directory=await fs.mkdtemp(path.join(process.env.INVINCIBLE_IMAGE_TEST_ROOT||os.tmpdir(),'invincible-connection-fixture-'));
const backend=fakeGpu(),startWorker=token=>createLocalAgentServer({token,ownerUid:'test-owner',port:18890,workspaceRoot:directory,fetchImpl:backend.fetchImpl,appOrigin:site,workerOptions:{pollMs:20}});
let service=await startWorker();
let context;
async function openProfile(){
 const browserContext=await chromium.launchPersistentContext(path.join(directory,'browser-profile'),{headless:true});
 await browserContext.grantPermissions(['local-network-access'],{origin:site});
 await browserContext.route(site+'/invincible/**',async route=>{
  const name=new URL(route.request().url()).pathname.replace('/invincible/','');
  if(name==='connection-fixture')return route.fulfill({contentType:'text/html',body:`<!doctype html><link rel="stylesheet" href="/invincible/creator/image-generator.css"><main></main><script type="module">import{createLocalImageClient}from'/invincible/shared/local-image-client.js';import{mountImageGenerator}from'/invincible/creator/image-generator.js';window.fixtureUid='test-owner';const getAccountId=()=>window.fixtureUid;window.client=createLocalImageClient({origin:${JSON.stringify(service.origin)},getAccountId,requireAccount:true});window.panel=mountImageGenerator(document.querySelector('main'),{client,getAccountId});await panel.ready;</script>`});
  const file=path.join(root,name);if(!file.startsWith(root+path.sep))throw Error('Invalid fixture path');
  return route.fulfill({contentType:name.endsWith('.css')?'text/css':'text/javascript',body:await fs.readFile(file)});
 });
 return browserContext;
}
try{
 await service.listen();context=await openProfile();const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto(site+'/invincible/connection-fixture');await page.waitForSelector('[data-image-pair]');
 assert.equal(await page.locator('[data-image-generate]').isEnabled(),false,'No generation before pairing');
 assert.ok(await page.locator('.image-connection-bar [data-image-pair]').isVisible(),'Connection is above the prompt, outside Advanced settings');
 const otherTab=await context.newPage();await otherTab.goto(site+'/invincible/connection-fixture');await otherTab.waitForSelector('[data-image-pair]:visible');
 const popupEvent=page.waitForEvent('popup');await page.locator('[data-image-pair]').click();const popup=await popupEvent;
 await popup.waitForSelector('#connect');
 assert.equal(await page.evaluate(()=>client.hasPairing()),false,'No token before local confirmation');
 await page.evaluate(()=>window.dispatchEvent(new MessageEvent('message',{origin:client.origin,source:window,data:{type:'invincible-local-pair',uid:'test-owner',nonce:'forged',token:'a'.repeat(40)}})));
 assert.equal(await page.evaluate(()=>client.hasPairing()),false,'Forged handoff ignored');
 await popup.locator('#connect').click();await page.waitForSelector('[data-image-connection]:has-text("Laptop online")');
 assert.equal(await page.locator('[data-image-pair]').isVisible(),false);
 await otherTab.getByText('Laptop online',{exact:true}).waitFor();assert.equal(await otherTab.locator('[data-image-generate]').isEnabled(),true,'An already-open tab connects without another popup');
 await page.locator('[data-image-prompt]').fill('Published-origin fixture illustration');await page.locator('[data-image-generate]').click();await page.waitForSelector('[data-image-status]:has-text("Completed")');
 assert.ok(await page.locator('[data-image-preview]').evaluate(image=>image.complete&&image.naturalWidth===512));assert.equal(backend.loads,1);assert.deepEqual(errors,[]);
 await context.close();context=await openProfile();const reopened=await context.newPage();await reopened.goto(site+'/invincible/connection-fixture');await reopened.getByText('Laptop online',{exact:true}).waitFor();
 const accountIsolation=await reopened.evaluate(async()=>{window.fixtureUid='other-owner';try{await client.connect();return false}catch(error){return error.code==='LOCAL_PAIRING_REQUIRED'}finally{window.fixtureUid='test-owner'}});assert.ok(accountIsolation,'Remembered pairing belongs only to the verified account');
 const token=service.token;await service.close();await reopened.reload();await reopened.getByRole('button',{name:'Retry',exact:true}).waitFor();assert.ok(await reopened.evaluate(()=>client.hasPairing()),'Offline worker does not erase a remembered connection');
 service=await startWorker(token);await service.listen();await reopened.getByRole('button',{name:'Retry',exact:true}).click();await reopened.getByText('Laptop online',{exact:true}).waitFor();
 await reopened.getByText('Advanced settings',{exact:true}).click();
 const forget=reopened.getByRole('button',{name:'Forget laptop',exact:true});
 const cancelled=reopened.waitForEvent('dialog').then(async dialog=>{assert.match(dialog.message(),/in this browser/);await dialog.dismiss();});
 await Promise.all([cancelled,forget.click()]);
 assert.equal(await reopened.evaluate(()=>client.hasPairing()),true,'Cancel preserves the saved laptop connection');
 const confirmed=reopened.waitForEvent('dialog').then(dialog=>dialog.accept());
 await Promise.all([confirmed,forget.click()]);
 assert.equal(await reopened.evaluate(()=>client.hasPairing()),false);
 assert.equal(await reopened.locator('[data-image-generate]').isEnabled(),false);
 await reopened.evaluate(()=>localStorage.setItem(client.pairingKey,'invalid-remembered-token-for-expiry-test'));await reopened.reload();await reopened.getByRole('button',{name:'Pair',exact:true}).waitFor();assert.equal(await reopened.evaluate(()=>client.hasPairing()),false,'Expired worker token is removed');assert.equal(backend.loads,1,'Connection errors submit no GPU work');
 console.log('PASS: verified HTTPS pairing, cross-tab and browser-restart reuse, account isolation, offline retention, stable worker restart, explicit forget and expired-key rejection.');
}finally{await context?.close();await service.close();await fs.rm(directory,{recursive:true,force:true,maxRetries:3});}
