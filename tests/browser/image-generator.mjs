import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { chromium } from 'playwright';
import { createLocalAgentServer } from '../../local-ai/agent-server.mjs';
import { fakeGpu } from '../fixtures/imagegen-service.mjs';
const directory=await fs.mkdtemp(path.join(process.env.INVINCIBLE_IMAGE_TEST_ROOT||os.tmpdir(),'invincible-ui-fixture-'));
const backend=fakeGpu();
let allowDraft;
const service=await createLocalAgentServer({ownerUid:'test-owner',token:'fixture-only-browser-pairing-token-12345',port:18888,workspaceRoot:directory,
 fetchImpl:async (url, options)=>{
  if(new URL(url).pathname==='/upload/image'){
   const {body}=options;
   assert.equal(body.get('type'),'temp');
   return Response.json({name:body.get('image').name,type:'temp',subfolder:''});
  }
  if(new URL(url).pathname==='/prompt'){
   const workflow=JSON.parse(options.body).prompt;
   if(workflow['8']){
    assert.equal(workflow['4'].class_type,'VAEEncode');
    assert.equal(workflow['5'].inputs.denoise,0.45);
    assert.match(workflow['8'].inputs.image,/ \[temp\]$/);
    // The simulated renderer needs dimensions to construct its fixture PNG.
    workflow['4'].inputs.width=workflow['4'].inputs.height=512;
    return backend.fetchImpl(url,{...options,body:JSON.stringify({prompt:workflow})});
   }
  }
  if(new URL(url).port==='11434'&&new URL(url).pathname==='/api/chat'){
   const body=JSON.parse(options.body);
   assert.equal(body.tools,undefined);
   const idea=body.messages.at(-1).content;
   if(idea==='Delayed draft')await new Promise(resolve=>{allowDraft=resolve;});
   return Response.json({message:{content:JSON.stringify({prompt:'Sandstone fortress at dawn, clear illustration'})}});
  }
  return backend.fetchImpl(url,options);
 },
 workerOptions:{pollMs:500},ask:async()=>({kind:'tool',tool:'generate_image',arguments:{prompt:'Qwen fixture illustration',preset:'square',seed:77}})});
let browser;try{
 await service.listen();browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_EXECUTABLE?{executablePath:process.env.CHROMIUM_EXECUTABLE}:{})});
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(service.origin+'/#pair='+service.token);await page.waitForSelector('#connection:has-text("Connected")');
 assert.equal(await page.locator('details').first().getAttribute('open'),null,'Advanced settings collapsed');
 await page.locator('#new-project').click();await page.waitForFunction(()=>document.querySelector('#projects').value.startsWith('local-'));
 const {fixturePng}=await import('../fixtures/imagegen-service.mjs');
 await page.getByLabel('Reference image').setInputFiles({name:'reference.png',mimeType:'image/png',buffer:fixturePng(384,640)});
 await page.getByText('Reference ready · 512 × 512').waitFor();
 assert.equal(await page.getByRole('radio',{name:/Portrait/}).isEnabled(),false);
 await page.locator('[data-image-prompt]').fill('A clean illustration of a medieval Indian fortress');await page.locator('[data-image-generate]').click();
 await page.waitForSelector('[data-image-status]:has-text("Queued")');await page.waitForSelector('[data-image-status]:has-text("Running")');await page.waitForSelector('[data-image-status]:has-text("Completed")');
 assert.equal(backend.loads,1);assert.ok(await page.locator('[data-image-preview]').evaluate(i=>i.complete&&i.naturalWidth===512&&i.naturalHeight===512));
 const event=page.waitForEvent('download');await page.locator('[data-image-download]').click();const download=await event;assert.ok((await fs.stat(await download.path())).size>100);
 await page.getByRole('button',{name:'Remove reference'}).click();
 assert.equal(await page.getByRole('radio',{name:/Portrait/}).isEnabled(),true);
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
 assert.equal(await page.locator('[data-image-generate]').isEnabled(),false,'Video Studio must not unlock an unpaired generator');
 await page.getByText('Advanced settings',{exact:true}).click();await page.getByText('Manual pairing',{exact:true}).click();await page.locator('[data-image-token]').fill(service.token);await page.locator('[data-image-connect]').click();await page.waitForSelector('[data-image-connection]:has-text("Laptop online")');
 const idea=page.getByRole('textbox',{name:'Describe your idea'}), prompt=page.getByRole('textbox',{name:'Prompt',exact:true});
 assert.ok(await page.getByLabel('Describe your idea').isVisible(),'Prompt drafting is visible without opening a menu');
 await idea.fill('A fortress at sunrise');
 await page.getByRole('button',{name:'Generate prompt',exact:true}).click();
 await page.getByText('Prompt ready. Edit it or click Generate.').waitFor();
 assert.equal(await prompt.inputValue(),'Sandstone fortress at dawn, clear illustration');
 assert.equal(backend.loads,3,'Prompt drafting does not render an image');
 await idea.fill('Delayed draft');
 await page.getByRole('button',{name:'Generate prompt',exact:true}).click();
 await prompt.fill('Native Studio fixture fortress');
 for(let attempt=0;!allowDraft&&attempt<100;attempt++) await new Promise(resolve=>setTimeout(resolve,20));
 assert.equal(typeof allowDraft,'function','The delayed draft reached Ollama');
 allowDraft();
 await page.getByText(/Your edits were kept/).waitFor();
 assert.equal(await prompt.inputValue(),'Native Studio fixture fortress');
 await page.locator('[data-image-generate]').click();await page.waitForSelector('[data-image-status]:has-text("Completed")');
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
 await page.reload();
 await page.getByRole('tab',{name:'Create image',exact:true}).click();
 await page.getByText('Image history',{exact:true}).click();
 const saved=page.locator('[data-image-history] li').filter({hasText:'Native Studio fixture fortress'});
 await saved.getByRole('button',{name:'Edit creation'}).click();
 await page.getByText('Editing a saved creation. Generate to make a new version.').waitFor();
 assert.equal(await prompt.inputValue(),'Native Studio fixture fortress');
 assert.equal(await page.locator('[data-image-preview]').isVisible(),true);
 await page.getByRole('button',{name:'Clear prompt',exact:true}).click();
 assert.equal(await prompt.inputValue(),'');
 page.once('dialog',dialog=>dialog.accept());
 await saved.getByRole('button',{name:'Delete',exact:true}).click();
 await saved.waitFor({state:'detached'});
 await page.reload();
 await page.getByRole('tab',{name:'Create image',exact:true}).click();
 await page.getByText('Image history',{exact:true}).click();
 await page.getByText('Saved in this browser.',{exact:true}).waitFor();
 assert.equal(await saved.count(),0,'Deleted history does not reappear on reload');
 assert.deepEqual(errors,[]);console.log('PASS: prompt drafting, preservation of manual edits, history restore and deletion, verified image preview, download, and project attachment.');
}finally{await browser?.close();await service.close();await fs.rm(directory,{recursive:true,force:true,maxRetries:3});}
