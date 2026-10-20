// Controlled Firestore-shaped fixture; never contacts production Firebase.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright'),root=path.resolve(__dirname,'..');
const fixture=[
"export const db={},auth={currentUser:{uid:'owner',email:'owner@example.com'}},authReady=Promise.resolve();export async function observeAuth(callback){queueMicrotask(()=>callback(auth.currentUser));return()=>{}}export const storageError=()=> 'Save failed.';",
"let listeners=[];const read=()=>JSON.parse(localStorage.getItem('test.creator')||'{}');",
"export const doc=(db,...parts)=>parts.join('/');export const collection=(db,name)=>name;export const where=(...args)=>args;export const query=(collection,...filters)=>({collection,filters});export const serverTimestamp=()=>1;",
"function snapshot(ref){const data=read();if(typeof ref==='string')return {exists:()=>!!data[ref],data:()=>data[ref],metadata:{hasPendingWrites:false,fromCache:false}};return {docs:Object.entries(data).filter(([key,value])=>key.startsWith('creatorProjects/')&&ref.filters.every(([field,op,wanted])=>op==='=='?value[field]===wanted:value[field]?.includes(wanted))).map(([key,value])=>({id:key.split('/')[1],data:()=>value}))}}",
"export async function getDoc(ref){return snapshot(ref)}export async function getDocs(ref){return snapshot(ref)}",
"export function onSnapshot(ref,...args){const callback=args.find(item=>typeof item==='function');const listener=()=>callback(snapshot(ref));listeners.push(listener);queueMicrotask(listener);return()=>listeners=listeners.filter(item=>item!==listener)}",
"export async function setDoc(ref,value){window.writes=(window.writes||0)+1;await new Promise(resolve=>setTimeout(resolve,window.saveDelay||20));if(window.failSave)throw Error('denied');const all=read();all[ref]={...all[ref],...value};localStorage.setItem('test.creator',JSON.stringify(all));listeners.forEach(fn=>fn())}export async function deleteDoc(ref){const all=read();delete all[ref];localStorage.setItem('test.creator',JSON.stringify(all));listeners.forEach(fn=>fn())}"
].join('\n');
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost').pathname;
 res.setHeader('Content-Type',/\.m?js$/.test(url)?'text/javascript':url.endsWith('.css')?'text/css':'text/html');
 if(url==='/fixture.mjs'||url==='/invincible/shared/firebase-client.js'){res.end(fixture);return;}
 try{
  let file=path.join(root,url.replace(/^\/invincible\/?/,''));
  if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  let content=fs.readFileSync(file,'utf8').replaceAll('https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js','/fixture.mjs');
  if(file.endsWith('.html'))content=content.replace(/<script[^>]*src="\.\.\/site-nav[^>]*><\/script>/,'');
  res.end(content);
 }catch{res.statusCode=404;res.end('Missing');}
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+server.address().port+'/invincible/creator/';
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE||undefined});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));await page.route('https://**/*',route=>route.abort());
  page.on('dialog',dialog=>dialog.accept());
  await page.addInitScript(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.copied=text}}}));
  const stored=()=>page.evaluate(()=>Object.values(JSON.parse(localStorage.getItem('test.creator')||'{}')).find(item=>item.title==='Gaganyaan production'));
  // New Content opens the shared workbench; draft interactions never submit the form.
  await page.goto(base);await page.locator('#addContent:enabled').click();
  const dialog=page.locator('#contentDialog');
  await page.locator('[name=title]').fill('Draft production');
  await dialog.locator('[data-filter-search]').fill('rocket');await dialog.locator('[data-filter-search]').press('Enter');
  assert.equal(await dialog.evaluate(node=>node.open),true);
  assert.equal(await page.evaluate(()=>window.writes||0),0);
  await dialog.locator('[data-filter-search]').fill('');
  const draftTable='Voiceover\tVisual / Animation\tAssets Required\tTimeline\tProduction Method\tAnimation Group\nभारत — exact narration!\tRocket orbit\tLVM3\t0–4s\tBlender\tUpper assembly\nSecond voice\tEarth\tTexture\t4–8s\tAI Video\t';
  await dialog.locator('[data-paste]').fill(draftTable);
  await dialog.locator('[data-action=preview]').click();
  assert.equal(await dialog.locator('.wb-preview article').count(),2);
  assert.equal(await dialog.evaluate(node=>node.open),true);
  await dialog.locator('[data-action=import]').click();
  assert.equal(await dialog.locator('.wb-scene').count(),2);
  await dialog.locator('.wb-scene').first().locator('[data-action=expand]').click();
  await dialog.locator('.wb-prompt-fields summary').click();
  await dialog.locator('[data-field=blenderPrompt]').fill('Preserve the exact camera plan.');
  await dialog.locator('[data-tab=Production]').click();await dialog.locator('[data-filter-method]').selectOption('Blender');
  assert.equal(await dialog.locator('.wb-production-card').count(),1);
  await dialog.locator('[data-filter-method]').selectOption('AI Video');
  assert.equal(await dialog.locator('.wb-production-card').count(),1);
  await dialog.locator('[data-tab=Overview]').click();await dialog.locator('.wb-visual-settings summary').click();
  await dialog.locator('[data-project-field=visualStyle]').fill('Space documentary');
  await dialog.locator('[data-tab=Assets]').click();await dialog.locator('[data-action=add-asset]').click();
  await dialog.locator('[data-asset-field=name]').fill('Rocket reference');
  await dialog.locator('[data-asset-field=path]').fill('E:\\3D\\draft.blend');
  assert.equal(await page.evaluate(()=>window.writes||0),0);
  for(const width of [320,393,768,1280]){
   await page.setViewportSize({width,height:800});
   assert.equal(await dialog.evaluate(node=>node.scrollWidth<=node.clientWidth+1),true);
   await dialog.locator('[data-tab=Storyboard]').click();
   assert.equal(await dialog.locator('#contentStoryboard').evaluate(node=>node.scrollWidth<=node.clientWidth+1),true);
   await dialog.locator('.wb-scene').last().scrollIntoViewIfNeeded();
   assert.equal(await dialog.locator('#saveContent').evaluate(button=>{const rect=button.getBoundingClientRect();return rect.bottom<=innerHeight&&rect.top>=0}),true);
  }
  await page.setViewportSize({width:1440,height:1000});
  await dialog.locator('#saveContent').click();await page.waitForURL(/project.html\?id=/);
  await page.locator('#projectTitle').filter({hasText:'Draft production'}).waitFor();
  assert.equal(await page.locator('.wb-scene').count(),2);
  await page.locator('[data-tab=Production]').click();await page.locator('[data-filter-method]').selectOption('Blender');assert.equal(await page.locator('.wb-production-card').count(),1);
  await page.locator('[data-tab=Assets]').click();assert.equal(await page.locator('[data-asset-field=path]').inputValue(),'E:\\3D\\draft.blend');
  await page.goto(base);await page.locator('.content-card').filter({hasText:'Draft production'}).locator('[data-edit]').click();
  assert.equal(await dialog.locator('[data-tab=Storyboard]').getAttribute('aria-current'),'page');
  await dialog.locator('[data-tab=Production]').click();await dialog.locator('.wb-group-create summary').click();
  await dialog.locator('[data-group-field=name]').fill('Unsaved group edit');
  await dialog.locator('.close').last().click();
  await page.locator('.content-card').filter({hasText:'Draft production'}).locator('[data-edit]').click();
  await dialog.locator('[data-tab=Production]').click();await dialog.locator('.wb-group-create summary').click();
  assert.equal(await dialog.locator('[data-group-field=name]').inputValue(),'Upper assembly');
  await dialog.locator('.close').last().click();

  // Creation still uses existing Creator pipeline, owner fields and acknowledgement.
  await page.goto(base);await page.locator('#addContent:enabled').click();await page.locator('[name=title]').fill('Gaganyaan production');
  assert.equal(await page.locator('#contentDetails').evaluate(node=>node.open),false);
  assert.equal(await page.locator('#contentStoryboard .wb-tabs button').count(),4);
  assert.equal(await page.locator('#contentStoryboard [data-paste]').isVisible(),true);
  await page.locator('#contentStoryboard [data-tab=Overview]').click();
  await page.locator('#contentStoryboard .wb-script summary').click();
  await page.locator('#contentStoryboard [data-script-draft]').fill('Existing manual draft');
  await page.locator('#contentStoryboard [data-tab=Storyboard]').click();
  await page.evaluate(()=>window.failSave=true);await page.locator('#saveContent').click();
  await page.locator('#contentSaveError').filter({hasText:'Save failed'}).waitFor();
  assert.equal(await page.locator('#contentDialog').evaluate(node=>node.open),true);
  await page.evaluate(()=>window.failSave=false);await page.locator('#saveContent').click();await page.waitForURL(/project.html\?id=/);
  await page.locator('#projectTitle').filter({hasText:'Gaganyaan production'}).waitFor();
  const projectId=new URL(page.url()).searchParams.get('id');
  const table='Voiceover\tVisual / Animation\tAssets Required\tTimeline\n'+Array.from({length:16},(_,i)=>'भारत का मिशन '+(i+1)+'!\tCamera '+(i+1)+'\tLVM3 model\t'+(i*4)+'–'+(i*4+4)+'s').join('\n');
  const paste=page.locator('#projectStoryboard [data-paste]');
  await paste.fill(table);await page.locator('[data-action=preview]').click();
  assert.equal(await page.locator('.wb-preview article').count(),16);assert.equal(await page.locator('.wb-scene').count(),0);
  await page.locator('[data-action=import]').click();
  assert.equal(await page.locator('.wb-scene').count(),8);
  assert.ok(await page.locator('.wb-row textarea').first().evaluate(el=>el.getBoundingClientRect().height<=48));
  assert.equal(await page.locator('[data-workspace]').count(),0);
  await page.locator('[data-action=page-next]').click();
  assert.equal(await page.locator('.wb-number strong').first().innerText(),'09');
  await page.locator('[data-action=page-prev]').click();
  await page.locator('[data-page-size]').selectOption('0');
  assert.equal(await page.locator('.wb-scene').count(),16);
  const scene=i=>page.locator('.wb-scene').nth(i);
  assert.equal(await scene(0).locator('[data-field=voiceover]').inputValue(),'भारत का मिशन 1!');
  assert.equal(await scene(15).locator('[data-field=timing]').inputValue(),'60–64s');
  assert.equal(await page.locator('.setup-stack,.importer,#fullScript').count(),0);
  await page.locator('[data-tab=Overview]').click();
  await page.locator('.wb-script summary').click();
  assert.equal(await page.locator('[data-script-draft]').inputValue(),'Existing manual draft');
  await page.locator('.wb-visual-settings summary').click();
  await page.locator('[data-project-field=visualStyle]').fill('Cinematic documentary');
  await page.locator('[data-project-field=aspectRatio]').selectOption('16:9');
  await page.locator('[data-action=copy-brief]').click();
  await page.waitForFunction(()=>window.copied?.includes('FULL RECORDING VOICEOVER'));
  assert.match(await page.evaluate(()=>window.copied),/FULL RECORDING VOICEOVER\nभारत का मिशन 1!/);
  await page.locator('[data-tab=Storyboard]').click();
  // Duplicate paste is reviewed but cannot append identical rows.
  await page.locator('.wb-import summary').click();await paste.fill(table);await page.locator('[data-action=preview]').click();
  assert.match(await page.locator('[data-mapped-preview]').innerText(),/16 duplicates skipped/);
  assert.equal(await page.locator('[data-action=import]').isDisabled(),true);
  await page.locator('.wb-import summary').click();
  await page.setViewportSize({width:1440,height:1600});
  await page.locator('#projectStoryboard').scrollIntoViewIfNeeded();
  await page.evaluate(()=>{
   window.creatorDragEvents=[];
   for(const type of ['dragstart','dragover','drop','dragend'])document.querySelector('#projectStoryboard').addEventListener(type,event=>{
    if(type!=='dragover'||window.creatorDragEvents.length<12)window.creatorDragEvents.push({type,tag:event.target.tagName,scene:event.target.closest('[data-scene]')?.dataset.scene});
   });
  });
  await scene(0).locator('[data-drag]').dragTo(scene(1).locator('[data-drag]'));
  assert.equal(await scene(0).locator('[data-field=voiceover]').inputValue(),'भारत का मिशन 2!',JSON.stringify(await page.evaluate(()=>window.creatorDragEvents)));
  await scene(1).locator('[data-drag]').dragTo(scene(0).locator('[data-drag]'));
  assert.equal(await scene(0).locator('[data-field=voiceover]').inputValue(),'भारत का मिशन 1!');
  await page.setViewportSize({width:1440,height:1000});
  for(const i of [0,2,10])await scene(i).locator('[data-method=Blender]').check();
  await scene(0).locator('[data-method="AI Video"]').check();await scene(1).locator('[data-method="AI Video"]').check();
  const firstId=await scene(0).getAttribute('data-scene'),thirdId=await scene(2).getAttribute('data-scene');
  await scene(0).locator('[data-action=expand]').click();
  await scene(0).locator('.wb-prompt-fields summary').click();
  await scene(0).locator('[data-field=blenderPrompt]').fill('Animate the rocket for four seconds.');
  await scene(0).locator('[data-action=copy]').click();assert.equal(await page.evaluate(()=>window.copied),'Animate the rocket for four seconds.');
  await page.locator('[data-tab=Production]').click();assert.equal(await page.locator('#focusEditor').count(),0);await page.locator('[data-filter-method]').selectOption('Blender');assert.equal(await page.locator('.wb-production-card').count(),3);
  await page.locator('.wb-group-create summary').click();await page.locator('[data-new-group]').fill('Gaganyaan upper assembly');
  await page.locator('[data-action=add-group]').click();await page.locator('.wb-group-create summary').click();
  await page.locator('[data-group-field=blenderFile]').fill('E:\\3D\\MY\\Gaganyaan\\upper.blend');
  const groupId=await page.locator('[data-group]').getAttribute('data-group');
  for(const id of [firstId,thirdId]){
   const card=page.locator('.wb-production-card[data-scene="'+id+'"]');
   if(await card.locator('[data-action=expand]').getAttribute('aria-expanded')!=='true')await card.locator('[data-action=expand]').click();await card.locator('[data-field=animationGroupId]').selectOption(groupId);
  }
  const card=page.locator('.wb-production-card[data-scene="'+firstId+'"]');
  if(await card.locator('[data-action=expand]').getAttribute('aria-expanded')!=='true')await card.locator('[data-action=expand]').click();
  // Only the active scene displays Blender progress controls.
  for(const phase of ['started','modeling','animation','rendering','ready'])await card.locator('[data-task="'+phase+'"]').click();
  await page.waitForFunction(id=>Object.values(JSON.parse(localStorage.getItem('test.creator')||'{}')).some(item=>item.id===id&&item.animationGroups?.[0]?.production?.ready),projectId);
  let saved=await stored();assert.equal(saved.scenes[0].completed,false);assert.equal(saved.scenes[2].completed,false);
  assert.equal(saved.animationGroups[0].blenderFile,'E:\\3D\\MY\\Gaganyaan\\upper.blend');
  await page.locator('[data-filter-assets]').selectOption('Ready');
  assert.equal(await page.locator('.wb-production-card').count(),2);
  assert.equal(await page.locator('[data-filter-method]').inputValue(),'Blender');
  await page.locator('[data-filter-search]').fill('upper.blend');
  assert.equal(await page.locator('.wb-production-card').count(),2);
  await page.locator('[data-filter-search]').fill('');
  await page.locator('[data-filter-assets]').selectOption('All');
  await page.locator('[data-filter-method]').selectOption('AI Video');assert.equal(await page.locator('.wb-production-card').count(),2);
  const mixed=page.locator('.wb-production-card[data-scene="'+firstId+'"]');if(await mixed.locator('[data-action=expand]').getAttribute('aria-expanded')!=='true')await mixed.locator('[data-action=expand]').click();await mixed.locator('[data-task=ready]').click();
  if(await mixed.locator('[data-action=expand]').getAttribute('aria-expanded')!=='true')await mixed.locator('[data-action=expand]').click();await mixed.locator('[data-check=voiceoverReady]').check();await mixed.locator('[data-check=editingDone]').check();
  await mixed.locator('[data-field=sceneState]').count().then(count=>assert.equal(count,1)); // completion is now editable directly in the production table
  await page.locator('[data-tab=Storyboard]').click();await scene(0).locator('[data-field=sceneState]').selectOption('Completed');
  await page.waitForFunction(id=>JSON.parse(localStorage.getItem('test.creator'))['creatorProjects/'+id]?.scenes[0].completed,projectId);
  await page.reload();await page.locator('.wb-scene').first().waitFor();assert.equal(await scene(0).locator('[data-field=sceneState]').inputValue(),'Completed');
  await page.locator('[data-tab=Production]').click();assert.equal(await page.locator('#focusEditor').count(),0);await page.locator('[data-filter-method]').selectOption('Blender');assert.equal(await page.locator('.wb-production-card').count(),3);
  await page.locator('[data-filter-method]').selectOption('Editing');assert.equal(await page.locator('.wb-production-card').count(),16);
  await page.locator('[data-tab=Overview]').click();await page.locator('.wb-script summary').click();
  const original=await page.locator('[data-canonical-script]').textContent();
  const updated=original.replace('भारत का मिशन 1!','Changed narration');
  await page.locator('[data-script-draft]').fill(updated);await page.locator('[data-action=review-script]').click();
  assert.equal((await stored()).scenes[0].voiceover,'भारत का मिशन 1!');
  await page.locator('[data-action=apply-script]').click();await page.locator('.wb-script summary').click();
  assert.match(await page.locator('[data-canonical-script]').textContent(),/^Changed narration/);
  // Asset metadata and associations survive reload; local references are never file URLs.
  await page.locator('[data-tab=Assets]').click();await page.locator('[data-action=add-asset]').click();
  await page.locator('[data-asset-field=name]').fill('Crew Module');await page.locator('[data-asset-field=path]').fill('E:\\3D\\MY\\Gaganyaan\\crew.blend');
  await page.locator('[data-associate-group]').check();await page.locator('[data-asset-field=status]').selectOption('Ready');
  assert.equal(await page.locator('.wb-asset a').count(),0);await page.locator('[data-copy-path]').click();
  assert.equal(await page.evaluate(()=>window.copied),'E:\\3D\\MY\\Gaganyaan\\crew.blend');
  await page.waitForFunction(id=>JSON.parse(localStorage.getItem('test.creator'))['creatorProjects/'+id]?.assets?.[0]?.status==='Ready',projectId);
  await page.reload();await page.locator('[data-tab=Assets]').click();assert.equal(await page.locator('[data-asset-field=name]').inputValue(),'Crew Module');
  // Markdown, mapping, voiceover only, inline edits, reorder, duplication and insertion.
  await page.locator('[data-tab=Storyboard]').click();await page.locator('.wb-import summary').click();
  await paste.fill('| Scene | Duration | Voiceover | Character Prompt | Image Prompt | Video Prompt |\n|---|---|---|---|---|---|\n| 17 | 7 | Markdown voice | Person | Still | Motion |');
  await page.locator('[data-action=preview]').click();await page.locator('[data-action=import]').click();assert.equal(await page.locator('.wb-scene').count(),17);
  assert.equal(await scene(16).locator('[data-field=voiceover]').inputValue(),'Markdown voice');
  await scene(16).locator('[data-action=expand]').click();assert.equal(await scene(16).locator('[data-field=videoPrompt]').inputValue(),'Motion');
  await scene(16).locator('[data-action=duplicate]').click();assert.equal(await page.locator('.wb-scene').count(),18);
  await scene(17).locator('[data-action=insert]').click();assert.equal(await page.locator('.wb-scene').count(),19);
  await scene(18).locator('[data-action=remove]').click();assert.equal(await page.locator('.wb-scene').count(),18);
  await scene(17).locator('[data-action=up]').click();assert.equal(await scene(16).locator('[data-field=voiceover]').inputValue(),'Markdown voice');
  fs.mkdirSync(path.join(root,'.test-output'),{recursive:true});
  await page.screenshot({path:path.join(root,'.test-output/creator-production-desktop.png'),fullPage:true});
  await page.setViewportSize({width:393,height:852});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
  await page.screenshot({path:path.join(root,'.test-output/creator-production-mobile.png'),fullPage:true});
  await page.setViewportSize({width:1440,height:1000});
  // Failed autosave retains a recoverable draft and retries after refresh.
  await page.evaluate(()=>window.failSave=true);await scene(1).locator('[data-field=visual]').fill('Recovered camera direction');
  await page.locator('#status').filter({hasText:'draft is kept'}).waitFor();await page.reload();
  await page.waitForFunction(id=>JSON.parse(localStorage.getItem('test.creator'))['creatorProjects/'+id]?.scenes[1].visual==='Recovered camera direction',projectId);
  // Untouched legacy records retain completed state, prompts, metadata and script.
  const legacy={id:'legacy',title:'Legacy',ownerUid:'owner',ownerEmail:'owner@example.com',editorEmails:[],notes:'Keep notes',hook:'Keep hook',script:'Keep draft',custom:{keep:true},scenes:[{id:'old',duration:8,voiceover:'Legacy narration',completed:true,imageDone:true,imagePrompt:'Original prompt',imageAssetUrl:'https://example.com/image',custom:'keep'}]};
  await page.evaluate(item=>{const data=JSON.parse(localStorage.getItem('test.creator'));data['creatorProjects/legacy']=item;localStorage.setItem('test.creator',JSON.stringify(data));},legacy);
  await page.goto(base+'project.html?id=legacy');await page.locator('.wb-scene').waitFor();assert.equal(await scene(0).locator('[data-field=sceneState]').inputValue(),'Completed');
  await scene(0).locator('[data-action=expand]').click();assert.equal(await scene(0).locator('[data-field=imagePrompt]').inputValue(),'Original prompt');
  await page.locator('[data-tab=Overview]').click();await page.locator('.wb-script summary').click();
  assert.equal(await page.locator('[data-script-draft]').inputValue(),'Keep draft');
  await page.locator('[data-tab=Storyboard]').click();
  for(const width of [320,393,768,1280,1920]){
   await page.setViewportSize({width,height:900});
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,'No horizontal overflow at '+width);
   assert.equal(await page.locator('.wb-scene').evaluate(el=>el.scrollWidth<=el.clientWidth+1),true);
   await page.locator('[data-tab=Production]').click();await page.locator('[data-filter-method]').selectOption('All');
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
   await page.locator('[data-tab=Storyboard]').click();
  }
  fs.mkdirSync(path.join(root,'.test-output'),{recursive:true});
  await page.screenshot({path:path.join(root,'.test-output/creator-workbench-desktop.png'),fullPage:true});
  await page.setViewportSize({width:393,height:852});await page.screenshot({path:path.join(root,'.test-output/creator-workbench-mobile.png'),fullPage:true});
  assert.deepEqual(errors,[]);console.log('Creator creation, 16-scene import, queues, shared Blender tasks, independent completion, script review, assets, Markdown, reload/draft recovery, legacy compatibility and responsive layouts passed.');
 }catch(error){
  fs.mkdirSync(path.join(root,'.test-output'),{recursive:true});
  for(const page of browser.contexts().flatMap(context=>context.pages()))await page.screenshot({path:path.join(root,'.test-output/creator-failure.png'),fullPage:true}).catch(()=>{});
  throw error;
 }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);process.exitCode=1;server.close();});
