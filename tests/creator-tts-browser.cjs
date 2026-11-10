const assert=require('node:assert/strict'),http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),out=path.join(root,'.test-output/tts');
const {geminiVoices}=require('../functions-tts/src/tts-gemini');
const {normalizeVoices,makeWav}=require('../functions-tts/src/tts-model'),{encodeMp3}=require('../functions-tts/src/tts-service');
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 const mp3=await encodeMp3(makeWav([Buffer.alloc(48000)]));
 const voices=[...normalizeVoices([
  {name:'hi-IN-Neural2-B',languageCodes:['hi-IN'],ssmlGender:'MALE'},
  {name:'hi-IN-Neural2-A',languageCodes:['hi-IN'],ssmlGender:'FEMALE'},
  {name:'hi-IN-Chirp3-HD-Charon',languageCodes:['hi-IN'],ssmlGender:'MALE'},
  {name:'en-IN-Neural2-B',languageCodes:['en-IN'],ssmlGender:'MALE'},
  {name:'hi-IN-Neural2-Z',languageCodes:['hi-IN'],ssmlGender:'NEUTRAL'}
 ]),...geminiVoices()];
 const fixtureAuth="export const auth={currentUser:null},authReady=Promise.resolve(),db={};export async function observeAuth(callback){window.setTtsUser=user=>{auth.currentUser=user;callback(user);};queueMicrotask(()=>window.setTtsUser({uid:'owner'}));}";
 const historyDb=new Map();
 const fixtureFirestore=`export const collection=(_, ...parts)=>parts.join('/'),doc=collection;
 export const orderBy=(...args)=>({orderBy:args}),limit=n=>({limit:n}),startAfter=d=>({after:d.id}),query=(path,...rules)=>({path,rules});
 export async function getDocs(q){const response=await fetch('/history-fixture?path='+encodeURIComponent(q.path));let rows=await response.json();rows.sort((a,b)=>b.data.createdAt-a.data.createdAt);const cursor=q.rules.find(r=>r.after)?.after;if(cursor)rows=rows.slice(rows.findIndex(r=>r.id===cursor)+1);rows=rows.slice(0,q.rules.find(r=>r.limit)?.limit);return {size:rows.length,docs:rows.map(r=>({id:r.id,data:()=>r.data}))};}
 export async function setDoc(path,data){if(window.failHistorySave)throw Error('History connection failed');await fetch('/history-fixture?path='+encodeURIComponent(path),{method:'PUT',body:JSON.stringify(data)});}
 export async function deleteDoc(path){if(window.failHistoryDelete)throw Error('History deletion failed');await fetch('/history-fixture?path='+encodeURIComponent(path),{method:'DELETE'});}`;
 const fixtureApi='export async function loadVoices(){if(window.failVoices)throw Error("Backend unavailable");return '+JSON.stringify(voices)+';} export async function generateVoiceover(data){window.lastTtsRequest=data;await new Promise(r=>setTimeout(r,window.generationDelay||30));if(window.failGenerate)throw Error("Google TTS quota is exhausted");return '+JSON.stringify({audioBase64:mp3.toString('base64'),mimeType:'audio/mpeg',filename:'test-voice.mp3',durationSeconds:1,voiceName:'hi-IN-Neural2-B'})+';}';
 const server=http.createServer((req,res)=>{
  const url=new URL(req.url,'http://localhost'),relative=decodeURIComponent(url.pathname.replace(/^\/invincible\//,''));
  if(url.pathname==='/history-fixture'){
   const key=url.searchParams.get('path');res.setHeader('Content-Type','application/json');
   if(req.method==='PUT'){let body='';req.on('data',chunk=>body+=chunk);req.on('end',()=>{historyDb.set(key,JSON.parse(body));res.end('{}');});return;}
   if(req.method==='DELETE'){historyDb.delete(key);res.end('{}');return;}
   res.end(JSON.stringify([...historyDb].filter(([path])=>path.startsWith(key+'/')).map(([path,data])=>({id:path.split('/').at(-1),data}))));return;
  }
  res.setHeader('Content-Type',relative.endsWith('.js')?'text/javascript':relative.endsWith('.css')?'text/css':relative.endsWith('.svg')?'image/svg+xml':'text/html');
  if(relative==='ai/'){res.end('<style>html,body{margin:0;background:transparent;color-scheme:dark}</style>');return;}
  if(relative==='shared/firebase-client.js'){res.end(fixtureAuth);return;}
  if(relative==='creator/tts-api.js'){res.end(fixtureApi);return;}
  const file=path.resolve(root,relative);
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  try{let content=fs.readFileSync(file);res.end(content);}catch{res.writeHead(404).end();}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_EXECUTABLE?{executablePath:process.env.CHROMIUM_EXECUTABLE}:{})});
 try{
  const page=await browser.newPage({acceptDownloads:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://**/*',route=>route.abort());
  await page.route('https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js',route=>route.fulfill({contentType:'text/javascript',body:fixtureFirestore}));
  const demoRequests=[];let demoFailure=false;const demoWav=makeWav([Buffer.alloc(24000*2*3)]);
  await page.route('https://docs.cloud.google.com/static/text-to-speech/docs/audio/**',route=>{demoRequests.push(new URL(route.request().url()).pathname);return demoFailure?route.fulfill({status:404,body:'Missing sample'}):route.fulfill({status:200,contentType:'audio/wav',body:demoWav});});
  const base='http://127.0.0.1:'+server.address().port+'/invincible/creator/tts.html';
  await page.addInitScript(()=>{if(!localStorage.getItem('invincible.creator.tts.draft.v1.owner'))localStorage.setItem('invincible.creator.tts.draft.v1.owner',JSON.stringify({engine:'classic'}));});
  await page.goto(base);await page.locator('#accountStatus').filter({hasText:'voices available'}).waitFor();
    assert.equal(await page.locator('.tts-forest').getAttribute('aria-hidden'),'true');
    assert.equal(await page.locator('.tts-river').count(),0,'The page uses the forest background');
  for(const asset of ['tts-forest.css','tts-forest.js'])assert.equal(await page.evaluate(async asset=>(await fetch(asset)).status,asset),200,'Forest asset loads: '+asset);
  assert.equal(await page.locator('#script').inputValue(),'');assert.equal(await page.locator('#voiceDemo').isEnabled(),true);assert.equal(await page.locator('#generate').isDisabled(),true);
  await page.locator('#voiceDemo').click();await page.waitForFunction(()=>document.querySelector('#voiceDemo').getAttribute('aria-pressed')==='true');
  assert.ok(demoRequests.at(-1).endsWith('hi-IN-Neural2-B.wav'));assert.equal(await page.evaluate(()=>window.lastTtsRequest),undefined);
  await page.locator('#voiceDemo').click();assert.equal(await page.locator('#voiceDemoAudio').evaluate(a=>a.paused&&!a.hasAttribute('src')),true);
  await page.locator('#voiceDemo').click();await page.waitForFunction(()=>document.querySelector('#voiceDemo').getAttribute('aria-pressed')==='true');
  await page.locator('#gender').selectOption('FEMALE');assert.equal(await page.locator('#voiceDemoAudio').evaluate(a=>a.paused&&!a.hasAttribute('src')),true);
  await page.locator('#voiceDemo').click();await page.waitForFunction(()=>document.querySelector('#voiceDemo').getAttribute('aria-pressed')==='true');assert.ok(demoRequests.at(-1).endsWith('hi-IN-Neural2-A.wav'));
  await page.locator('#voiceDemo').click();demoFailure=true;await page.locator('#voiceDemo').click();await page.locator('#voiceDemoStatus').filter({hasText:/could not play|unavailable/}).waitFor();assert.equal(await page.evaluate(()=>window.lastTtsRequest),undefined);demoFailure=false;
  await page.locator('#gender').selectOption('NEUTRAL');assert.equal(await page.locator('#voiceDemo').isDisabled(),true);assert.match(await page.locator('#voiceDemoStatus').innerText(),/no ready-made sample/);
  await page.locator('#gender').selectOption('MALE');
  await page.locator('#script').fill('21 अप्रैल, 1526! पानीपत की कहानी। Military Strategy! '.repeat(8));
  await page.locator('#preset').selectOption('energetic');
  await page.locator('.advanced').evaluate(el=>el.open=true);
  await page.locator('#volume').fill('3');
  await page.locator('#pause').selectOption('500');
  await page.locator('#preview').click();await page.locator('#recording').waitFor();
  const preview=await page.evaluate(()=>window.lastTtsRequest);
  assert.ok(preview.text.length<await page.locator('#script').inputValue().then(x=>x.length));
  assert.equal(preview.speed,1.15);assert.equal(preview.volume,3);assert.equal(preview.paragraphPause,500);
  assert.equal(historyDb.size,0,'Opening previews do not create history');
  await page.locator('#generate').click();await page.locator('#generationStatus').filter({hasText:'MP3 ready'}).waitFor();
  const full=await page.evaluate(()=>window.lastTtsRequest);assert.equal(full.text,await page.locator('#script').inputValue());
  const downloadPromise=page.waitForEvent('download');await page.locator('#download').click();const download=await downloadPromise;await download.saveAs(path.join(out,'download.mp3'));assert.ok(fs.statSync(path.join(out,'download.mp3')).size>10000);
  await page.locator('#historyStatus').filter({hasText:'saved to your account'}).waitFor();
  assert.equal(historyDb.size,1);assert.equal(await page.locator('.history-entry').count(),1);
    await page.setViewportSize({width:393,height:852});await page.evaluate(()=>scrollTo(0,0));
    const historyLink=page.locator('.history-link');
    assert.ok(await historyLink.evaluate(el=>{const r=el.getBoundingClientRect();return r.height>=44&&r.top>=0&&r.bottom<=innerHeight;}),'Direct phone history link is initially reachable');
    await historyLink.focus();await page.keyboard.press('Enter');
    assert.equal(await page.evaluate(()=>location.hash),'#voiceoverHistory');
    assert.ok(await page.locator('#historyRefresh').evaluate(el=>{const r=el.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return r.top>=0&&r.bottom<=innerHeight&&(hit===el||el.contains(hit));}),'History is directly reachable and unobscured');
    await page.locator('.editor-link').click();assert.equal(await page.evaluate(()=>location.hash),'#scriptHeading');
    assert.equal(await page.locator('#script').inputValue(),full.text,'Navigating history preserves the draft');
    await page.setViewportSize({width:1280,height:720});
  const saved=[...historyDb.values()][0];assert.deepEqual(saved.request,full);assert.equal(saved.settings.script,full.text);assert.equal(saved.settings.preset,'custom');assert.equal(saved.settings.volume,'3');assert.equal(saved.settings.pause,'500');
  assert.equal('audioBase64' in saved,false);
  const recipePromise=page.waitForEvent('download');await page.locator('[data-action=export]').click();const recipe=await recipePromise;
  const recipeData=JSON.parse(fs.readFileSync(await recipe.path(),'utf8'));assert.equal(recipeData.format,'invincible-voiceover-recipe');assert.deepEqual(recipeData.request,full);
  await page.locator('#title').fill('Unsaved new title');await page.locator('#script').fill('Changed script');
  page.once('dialog',dialog=>dialog.accept());await page.locator('[data-action=restore]').click();
  assert.equal(await page.locator('#script').inputValue(),full.text);assert.equal(await page.locator('#title').inputValue(),saved.settings.title);assert.equal(await page.locator('#volume').inputValue(),'3');assert.equal(await page.locator('#speed').inputValue(),'1.15');assert.equal(await page.locator('#pause').inputValue(),'500');assert.equal(historyDb.size,1);
  await page.locator('#gender').selectOption('FEMALE');assert.equal(await page.locator('#voice').inputValue(),'hi-IN-Neural2-A');
  await page.locator('#gender').selectOption('MALE');await page.locator('#family').selectOption('Chirp3-HD');assert.equal(await page.locator('#pitch').isDisabled(),true);assert.equal(await page.locator('#pitch').inputValue(),'0');
  await page.locator('#mode').selectOption('ssml');assert.equal(await page.locator('#pause').isDisabled(),true);assert.equal(await page.locator('#preview').isDisabled(),true);
  await page.locator('#script').fill('<speak>broken');await page.locator('#generate').click();assert.match(await page.locator('#generationStatus').innerText(),/valid XML/);
  await page.locator('#mode').selectOption('text');await page.locator('#family').selectOption('Neural2');await page.locator('#script').fill('Draft survives a failed generation.');
  await page.evaluate(()=>window.failGenerate=true);await page.locator('#generate').click();await page.locator('#generationStatus').filter({hasText:'quota is exhausted'}).waitFor();assert.equal(await page.locator('#script').inputValue(),'Draft survives a failed generation.');assert.equal(await page.locator('#generate').isEnabled(),true);
  await page.waitForTimeout(350);await page.reload();await page.locator('#accountStatus').filter({hasText:'voices available'}).waitFor();assert.equal(await page.locator('#script').inputValue(),'Draft survives a failed generation.');
  for(const width of [320,393,768,1280]){await page.setViewportSize({width,height:1000});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);}
  await page.setViewportSize({width:1280,height:1100});await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(out,'desktop.png'),fullPage:true});
  await page.setViewportSize({width:393,height:852});await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(out,'mobile.png'),fullPage:true});
  assert.equal(await page.locator('#engine').isVisible(),false,'Phone settings start collapsed');
  await page.locator('#voiceSettings > summary').click();
  await page.locator('#engine').selectOption('gemini');
  assert.equal(await page.locator('#expressiveControls').isVisible(),true);
  assert.equal(await page.locator('#pitchRow').isHidden(),true);
  assert.equal(await page.locator('#mode option[value=ssml]').evaluate(el=>el.disabled),true);
  assert.equal(await page.locator('#voiceDemo').isDisabled(),true);
  await page.locator('#preset').selectOption('sales');await page.locator('#direction').fill('Warm and confident.');
  await page.locator('#speed').fill('1.35');assert.equal(await page.locator('#preset').inputValue(),'sales');
  await page.locator('.advanced').evaluate(el=>el.open=true);
  await page.locator('#model').selectOption('gemini-2.5-pro-tts');
  await page.locator('#preview').click();await page.locator('#generationStatus').filter({hasText:'Preview ready'}).waitFor();
  const expressive=await page.evaluate(()=>window.lastTtsRequest);
  assert.equal(expressive.engine,'gemini');assert.equal(expressive.delivery,'sales');assert.equal(expressive.direction,'Warm and confident.');assert.equal(expressive.speed,1.35);assert.equal(expressive.pitch,0);assert.equal(expressive.paragraphPause,0);assert.equal(expressive.modelName,'gemini-2.5-pro-tts');
  await page.waitForTimeout(350);await page.reload();await page.locator('#accountStatus').filter({hasText:'voices available'}).waitFor();
  await page.locator('#voiceSettings > summary').click();
  assert.equal(await page.locator('#direction').inputValue(),'Warm and confident.');assert.equal(await page.locator('#preset').inputValue(),'sales');
  await page.evaluate(()=>window.failHistorySave=true);await page.locator('#generate').click();
  await page.locator('#historyStatus').filter({hasText:'History not saved'}).waitFor();
  assert.equal(await page.locator('[data-action=retry]').count(),1);assert.equal(historyDb.size,1);
  await page.reload();await page.locator('#accountStatus').filter({hasText:'voices available'}).waitFor();
  await page.locator('[data-action=retry]').waitFor();await page.locator('[data-action=retry]').click();
  await page.locator('#historyStatus').filter({hasText:'saved to your account'}).waitFor();assert.equal(historyDb.size,2);
  await page.locator('#voiceSettings > summary').click();
  await page.locator('#engine').selectOption('classic');await page.locator('#family').selectOption('Neural2');
  await page.locator('.history-entry').first().locator('[data-action=restore]').click();
  assert.equal(await page.locator('#engine').inputValue(),'gemini');assert.equal(await page.locator('#model').inputValue(),'gemini-2.5-pro-tts');assert.equal(await page.locator('#direction').inputValue(),'Warm and confident.');assert.equal(await page.locator('#preset').inputValue(),'sales');assert.equal(await page.locator('#speed').inputValue(),'1.35');
  const fresh=await browser.newContext(),freshPage=await fresh.newPage();
  await freshPage.route('https://**/*',route=>route.abort());await freshPage.route('https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js',route=>route.fulfill({contentType:'text/javascript',body:fixtureFirestore}));
  await freshPage.goto(base);await freshPage.locator('.history-entry').nth(1).waitFor();assert.equal(await freshPage.locator('.history-entry').count(),2,'History is available without local drafts');await fresh.close();
  for(let i=0;i<27;i++){const id='older-'+i;historyDb.set('users/owner/voiceoverHistory/'+id,{...saved,id,createdAt:saved.createdAt-1000-i});}
  await page.locator('#historyRefresh').click();await page.locator('#historyMore').waitFor();assert.equal(await page.locator('.history-entry').count(),25);
  await page.locator('#historyMore').click();await page.waitForFunction(()=>document.querySelectorAll('.history-entry').length===29);
  await page.evaluate(()=>window.failHistoryDelete=true);page.once('dialog',dialog=>dialog.accept());await page.locator('.history-entry').first().locator('[data-action=delete]').click();await page.locator('#historyStatus').filter({hasText:'Could not delete'}).waitFor();assert.equal(historyDb.size,29);
  await page.evaluate(()=>window.failHistoryDelete=false);page.once('dialog',dialog=>dialog.accept());await page.locator('.history-entry').first().locator('[data-action=delete]').click();await page.locator('#historyStatus').filter({hasText:'entry deleted'}).waitFor();assert.equal(historyDb.size,28);
  await page.setViewportSize({width:393,height:852});await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(out,'gemini-mobile.png'),fullPage:true});
  await page.setViewportSize({width:1280,height:1000});await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(out,'gemini-desktop.png'),fullPage:true});
  for(const delivery of ['social','empathetic']){
   await page.locator('#preset').selectOption(delivery);
   await page.locator('#generate').click();await page.locator('#generationStatus').filter({hasText:'MP3 ready'}).waitFor();
   assert.equal(await page.evaluate(()=>window.lastTtsRequest.delivery),delivery);
   await page.waitForTimeout(350);await page.reload();await page.locator('#accountStatus').filter({hasText:'voices available'}).waitFor();
   assert.equal(await page.locator('#preset').inputValue(),delivery);
  }
  // Real landscape/portrait ratios, generated playback, and the phone disclosure.
  await page.locator('#title').fill('A story, in your voice');
  await page.locator('#script').fill('21 अप्रैल, 1526! पानीपत के मैदान में आमने-सामने थीं दो सेनाएँ।\n\nइस कहानी में जानिए बाबर की Military Strategy और उसकी निर्णायक चाल।');
  await page.locator('#generate').click();await page.locator('#generationStatus').filter({hasText:'MP3 ready'}).waitFor();
  for(const [width,height] of [[1920,1080],[1440,810],[1280,720],[1024,768],[820,1180],[393,852],[360,640],[320,568]]){
   await page.setViewportSize({width,height});await page.evaluate(()=>scrollTo(0,0));
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No overflow '+width);
    if(width<=600&&height<=700){
     assert.ok(await page.locator('.history-link').evaluate(el=>{const r=el.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight;}),'Direct history link on short phone '+width);
     await page.locator('#script').scrollIntoViewIfNeeded();
     assert.ok(await page.locator('#script').evaluate(el=>{const r=el.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return hit===el;}),'Editor unobscured on short phone '+width);
     await page.locator('#generate').scrollIntoViewIfNeeded();
    }
   const action=await page.locator('#generate').boundingBox();
   assert.ok(action.height>=44&&action.y>=0&&action.y+action.height<=height,'Generate in viewport '+width);
   for(const id of ['generate','player','download'])assert.ok(await page.locator('#'+id).evaluate(el=>{
    const r=el.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);
    return r.y>=0&&r.bottom<=innerHeight&&hit&&(hit===el||el.contains(hit));
   }),'Transport visible and unobscured: '+id+' at '+width);
    if(width>900&&height>=650){
    const editor=await page.locator('#script').boundingBox();
    assert.ok(editor.width>=220&&editor.height>=110&&editor.height<=301,'Usable, bounded desktop editor '+width);
    assert.equal(await page.locator('#engine').isVisible(),true,'Desktop settings reopen');
     for(const id of ['historyHeading','historyRefresh'])assert.ok(await page.locator('#'+id).evaluate(el=>{
      const r=el.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);
      return r.top>=0&&r.bottom<=innerHeight&&hit&&(hit===el||el.contains(hit));
     }),'Desktop history reachable without page scrolling: '+id+' at '+width);
     assert.equal(await page.evaluate(()=>document.documentElement.scrollHeight<=innerHeight+2),true,'Desktop workbench fits viewport '+width);
     assert.equal(await page.locator('#voiceoverHistory').evaluate(el=>el.scrollHeight>el.clientHeight),true,'Long history has its own scroll region '+width);
   }
   if(width===393){
    await page.locator('#voiceSettings').evaluate(el=>el.open=false);
    await page.locator('#voiceSettings > summary').press('Enter');
    assert.equal(await page.locator('#engine').isVisible(),true,'Keyboard opens settings');
   }
   await page.screenshot({path:path.join(out,'responsive-'+width+'.png')});
   if(width<=900){
    await page.locator('#voiceSettings').evaluate(el=>el.open=false);await page.evaluate(()=>scrollTo(0,0));
    await page.screenshot({path:path.join(out,'portrait-'+width+'.png')});
   }
  }
  await page.setViewportSize({width:1440,height:810});
  await page.locator('#engine').selectOption('classic');await page.locator('#family').selectOption('Neural2');
  assert.equal(await page.locator('#preset').inputValue(),'natural');
  for(const delivery of ['social','empathetic'])assert.equal(await page.locator('#preset option[value='+delivery+']').evaluate(el=>el.disabled),true);
    await page.evaluate(()=>{window.failGenerate=false;window.generationDelay=250;});await page.locator('#generate').click();
    assert.equal(await page.locator('#generate').isDisabled(),true,'Generation disables duplicate requests');
    assert.equal(await page.locator('#preview').isDisabled(),true,'Preview is disabled while generating');
  await page.evaluate(()=>window.setTtsUser({uid:'other'}));await page.waitForTimeout(400);
  assert.equal(await page.locator('#direction').inputValue(),'');
  await page.locator('#engine').selectOption('classic');await page.locator('#family').selectOption('Neural2');
  assert.equal(await page.locator('#script').inputValue(),'');assert.equal(await page.locator('#recording').isHidden(),true);
  await page.locator('#historyStatus').filter({hasText:'saved to your account'}).waitFor();assert.equal(await page.locator('.history-entry').count(),0,'Another account cannot see owner history');
  await page.locator('#voiceDemo').click();await page.waitForFunction(()=>document.querySelector('#voiceDemo').getAttribute('aria-pressed')==='true');
  await page.evaluate(()=>window.setTtsUser(null));assert.equal(await page.locator('#voiceDemoAudio').evaluate(a=>a.paused&&!a.hasAttribute('src')),true);assert.equal(await page.locator('#workspace').isHidden(),true);assert.equal(await page.locator('#signedOut').isVisible(),true);
    assert.deepEqual(errors,[]);console.log('Voiceover browser: history navigation/scroll/export/restore/retry/pagination/deletion and account isolation; demos, preview/full generation, busy states, settings, MP3 download, errors, retained drafts, keyboard disclosure and unobscured transport at 320–1920px passed.');
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1;});
