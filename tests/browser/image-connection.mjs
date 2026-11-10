import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { chromium } from 'playwright';
import { createLocalAgentServer } from '../../local-ai/agent-server.mjs';
import { fakeGpu } from '../fixtures/imagegen-service.mjs';
const root=path.resolve(process.env.INVINCIBLE_TEST_PUBLIC_ROOT||path.resolve(import.meta.dirname,'../..')),site='https://invincy.github.io',directory=await fs.mkdtemp(path.join(process.env.INVINCIBLE_IMAGE_TEST_ROOT||os.tmpdir(),'invincible-connection-fixture-'));
const backend=fakeGpu(),service=await createLocalAgentServer({ownerUid:'test-owner',port:18890,workspaceRoot:directory,fetchImpl:backend.fetchImpl,appOrigin:site,workerOptions:{pollMs:20}});
let browser;
try{
 await service.listen();browser=await chromium.launch({headless:true});const context=await browser.newContext();await context.grantPermissions(['local-network-access'],{origin:site});
 const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.route(site+'/invincible/**',async route=>{
  const name=new URL(route.request().url()).pathname.replace('/invincible/','');
  if(name==='connection-fixture')return route.fulfill({contentType:'text/html',body:`<!doctype html><link rel="stylesheet" href="/invincible/creator/image-generator.css"><main></main><script type="module">import{createLocalImageClient}from'/invincible/shared/local-image-client.js';import{mountImageGenerator}from'/invincible/creator/image-generator.js';window.client=createLocalImageClient({origin:${JSON.stringify(service.origin)},getAccountId:()=> 'test-owner',requireAccount:true});window.panel=mountImageGenerator(document.querySelector('main'),{client,getAccountId:()=> 'test-owner'});await panel.ready;</script>`});
  const file=path.join(root,name);if(!file.startsWith(root+path.sep))throw Error('Invalid fixture path');
  return route.fulfill({contentType:name.endsWith('.css')?'text/css':'text/javascript',body:await fs.readFile(file)});
 });
 await page.goto(site+'/invincible/connection-fixture');await page.waitForSelector('[data-image-pair]');
 const popupEvent=page.waitForEvent('popup');await page.locator('[data-image-pair]').click();const popup=await popupEvent;
 await popup.waitForSelector('#connect');
 assert.equal(await page.evaluate(()=>sessionStorage.getItem('invincible.local-worker.'+client.origin)),null,'No token before local confirmation');
 await page.evaluate(()=>window.dispatchEvent(new MessageEvent('message',{origin:client.origin,source:window,data:{type:'invincible-local-pair',uid:'test-owner',nonce:'forged',token:'a'.repeat(40)}})));
 assert.equal(await page.evaluate(()=>sessionStorage.getItem('invincible.local-worker.'+client.origin)),null,'Forged handoff ignored');
 await popup.locator('#connect').click();await page.waitForSelector('[data-image-status]:has-text("Connected")');
 assert.equal(await page.locator('[data-image-pair]').isVisible(),false);
 await page.locator('[data-image-prompt]').fill('Published-origin fixture illustration');await page.locator('[data-image-generate]').click();await page.waitForSelector('[data-image-status]:has-text("Completed")');
 assert.ok(await page.locator('[data-image-preview]').evaluate(image=>image.complete&&image.naturalWidth===512));assert.equal(backend.loads,1);assert.deepEqual(errors,[]);
 console.log('PASS: HTTPS published-origin popup confirmation, nonce/source checks, browser loopback permission, CORS authentication and verified preview.');
}finally{await browser?.close();await service.close();await fs.rm(directory,{recursive:true,force:true,maxRetries:3});}
