import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { chromium } from 'playwright';
import { createLocalAgentServer } from '../../local-ai/agent-server.mjs';
import { fakeGpu } from '../fixtures/imagegen-service.mjs';
const directory=await fs.mkdtemp(path.join(process.env.INVINCIBLE_IMAGE_TEST_ROOT||os.tmpdir(),'invincible-ui-fixture-'));
const backend=fakeGpu(),service=await createLocalAgentServer({ownerUid:'test-owner',token:'fixture-only-browser-pairing-token-12345',port:18888,workspaceRoot:directory,fetchImpl:backend.fetchImpl,workerOptions:{pollMs:500},ask:async()=>({kind:'tool',tool:'generate_image',arguments:{prompt:'Qwen fixture illustration',preset:'square',seed:77}})});
let browser;try{
 await service.listen();browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_EXECUTABLE?{executablePath:process.env.CHROMIUM_EXECUTABLE}:{})});
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(service.origin+'/#pair='+service.token);await page.waitForSelector('#connection:has-text("Connected")');
 assert.equal(await page.locator('details').first().getAttribute('open'),null,'Advanced settings collapsed');
 await page.locator('#new-project').click();await page.waitForFunction(()=>document.querySelector('#projects').value.startsWith('local-'));
 await page.locator('[data-image-prompt]').fill('A clean illustration of a medieval Indian fortress');await page.locator('[data-image-generate]').click();
 await page.waitForSelector('[data-image-status]:has-text("Queued")');await page.waitForSelector('[data-image-status]:has-text("Running")');await page.waitForSelector('[data-image-status]:has-text("Completed")');
 assert.equal(backend.loads,1);assert.ok(await page.locator('[data-image-preview]').evaluate(i=>i.complete&&i.naturalWidth===512&&i.naturalHeight===512));
 const event=page.waitForEvent('download');await page.locator('[data-image-download]').click();const download=await event;assert.ok((await fs.stat(await download.path())).size>100);
 await page.locator('[data-image-attach]').click();await page.waitForSelector('[data-image-status]:has-text("Attached")');assert.match(await page.locator('#projects option:checked').textContent(),/1 assets/);
 await page.locator('[data-image-regenerate]').click();await page.waitForSelector('[data-image-status]:has-text("Completed")');assert.equal(backend.loads,2,'Regenerate creates one new request');
 for(const width of [320,393,820,1440]){await page.setViewportSize({width,height:950});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No horizontal overflow at '+width);}
 await page.locator('#message').fill('Generate a square illustration of a fortress');await page.locator('#send').click();await page.waitForSelector('#log:has-text("Image completed and verified")');assert.equal(backend.loads,3);
 // Exercise the existing Video Studio attachment path with its isolated media adapter.
 await page.route(service.origin+'/creator/index.html',route=>route.fulfill({contentType:'text/html',body:`<!doctype html><link rel="stylesheet" href="/creator/image-generator.css"><form id="outer-project-form"><main id="studio"></main></form><script type="module">
 window.__INVINCIBLE_LOCAL_AI_ORIGIN__=location.origin;
 const {mountVideoStudio}=await import('/creator/video-studio/workspace.js');
 window.unintendedProjectSaves=0;document.querySelector('#outer-project-form').onsubmit=event=>{event.preventDefault();window.unintendedProjectSaves++;};
 window.testSession={};const files=new Map(),records=[];
 const media={list:async()=>records,loadDraft:async()=>null,upload:async(file,info)=>{files.set(info.id,file);records.push(info);return info;},file:async id=>files.get(id)};
 window.nativeStudio=mountVideoStudio(document.querySelector('#studio'),{getProject:()=>({id:'isolated-native-project',ownerUid:'test-owner',title:'Isolated native test',scenes:[]}),getAccountId:()=> 'test-owner',session:window.testSession,mediaService:media});
 await window.nativeStudio.ready;
 </script>`}));
 await page.goto(service.origin+'/creator/index.html');await page.getByRole('tab',{name:'Create image',exact:true}).click();await page.waitForSelector('[data-image-prompt]');
 await page.locator('[data-image-prompt]').fill('Native Studio fixture fortress');await page.locator('[data-image-generate]').click();await page.waitForSelector('[data-image-status]:has-text("Completed")');
 await page.locator('[data-image-attach]').click();await page.waitForSelector('[data-image-status]:has-text("Attached")');
 assert.equal(await page.evaluate(()=>window.testSession.manifest.assets.length),1,'Native project uses existing uploadFiles/useMedia path');
 assert.equal(await page.evaluate(()=>window.testSession.files.size),1,'Original PNG retained by existing project asset store');
 await page.getByRole('tab',{name:'Upload & voiceover',exact:true}).click();assert.equal(await page.locator('[data-image-preview]').isVisible(),false);
 await page.getByRole('tab',{name:'Upload & voiceover',exact:true}).press('ArrowRight');assert.equal(await page.getByRole('tab',{name:'Create image',exact:true}).getAttribute('aria-selected'),'true');assert.ok(await page.locator('[data-image-preview]').isVisible(),'Switching tools preserves the generated image');
 assert.equal(await page.evaluate(()=>window.unintendedProjectSaves),0,'Image actions never submit the parent project form');
 // Use the actual React AI service logic; substitute only its Firebase SDK dependencies.
 const aiSource=(await fs.readFile(new URL('../../react/src/features/invincible-ai/services/aiService.js',import.meta.url),'utf8'))
 .replace(/import\{httpsCallable\}from'firebase\/functions';/,"const httpsCallable=()=>async()=>{throw Error('Cloud call is prohibited in this fixture');};")
 .replace(/import\{doc,onSnapshot\}from'firebase\/firestore';/,"const doc=()=>{},onSnapshot=()=>{throw Error('No cloud subscriptions in fixture');};")
 .replace(/import\{auth,db,functions\}from'\.\.\/\.\.\/\.\.\/firebase';/,"const auth={currentUser:{uid:'test-owner'}},db={},functions={};")
 .replace("'../../../../../shared/local-image-client.js'","'/shared/local-image-client.js'");
 await page.route(service.origin+'/test-ai-service.js',route=>route.fulfill({contentType:'text/javascript',body:aiSource}));
 const result=await page.evaluate(async()=>{const service=await import('/test-ai-service.js');return service.sendInvincibleAiMessage({message:'Generate another square fortress image',provider:service.PROVIDERS.local});});
 assert.equal(result.actions[0].tool,'generate_image');assert.equal(result.actions[0].status,'completed');assert.equal(backend.loads,5);
 backend.fail();
 await page.waitForFunction(()=>document.querySelector('[data-image-generate]').disabled===false);
 await page.locator('[data-image-prompt]').fill('Controlled failure after a successful preview');await page.locator('[data-image-generate]').click();
 await page.waitForSelector('[data-image-status]:has-text("Failed")');
 assert.equal(await page.locator('[data-image-download]').isVisible(),false,'Failed render never offers the previous successful PNG');
 assert.equal(await page.locator('[data-image-preview]').isVisible(),false,'Failed render clears the earlier preview');
 assert.deepEqual(errors,[]);console.log('PASS: actual local AI page with simulated GPU: queued/running/completed, 512px preview, PNG download, isolated attachment, Qwen route, 320–1440px layout.');
}finally{await browser?.close();await service.close();await fs.rm(directory,{recursive:true,force:true,maxRetries:3});}
