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
 const fixtureAudio=JSON.stringify({audioBase64:mp3.toString('base64'),mimeType:'audio/mpeg',filename:'test-voice.mp3',durationSeconds:1,voiceName:'hi-IN-Neural2-B'});
 const fixtureApi='export async function loadVoices(){if(window.failVoices)throw Error("Backend unavailable");return '+JSON.stringify(voices)+';} export async function generateVoiceover(data){window.lastTtsRequest=data;if(window.generationGate)await window.generationGate;await new Promise(r=>setTimeout(r,window.generationDelay||30));if(window.failGenerate)throw Error("Google TTS quota is exhausted");return '+fixtureAudio+';} export async function retimeVoiceover(data){window.lastRetimeRequest=data;return {...'+fixtureAudio+',filename:"test-voice-"+Number(data.speed).toFixed(2)+"x.mp3",durationSeconds:data.durationSeconds/data.speed,speed:data.speed};} export async function runCreatorOpenAi(data){window.cloudAiCalls??=[];window.cloudAiCalls.push(data);if(data.action!=="plan")throw Error("Hosted timing must never be requested");const response=await fetch("http://127.0.0.1:8788/api/voiceover/plan",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(data)});if(!response.ok)throw Error((await response.json()).error);return response.json();};';
 const server=http.createServer((req,res)=>{
  const url=new URL(req.url,'http://localhost'),relative=decodeURIComponent(url.pathname.replace(/^\/invincible\//,''));
  if(url.pathname==='/history-fixture'){
   const key=url.searchParams.get('path');res.setHeader('Content-Type','application/json');
   if(req.method==='PUT'){let body='';req.on('data',chunk=>body+=chunk);req.on('end',()=>{historyDb.set(key,JSON.parse(body));res.end('{}');});return;}
   if(req.method==='DELETE'){historyDb.delete(key);res.end('{}');return;}
   res.end(JSON.stringify([...historyDb].filter(([path])=>path.startsWith(key+'/')).map(([path,data])=>({id:path.split('/').at(-1),data}))));return;
  }
  res.setHeader('Content-Type',relative.endsWith('.js')?'text/javascript':relative.endsWith('.css')?'text/css':relative.endsWith('.svg')?'image/svg+xml':'text/html');
  if(relative==='test-project-host.html'){const timing=url.searchParams.get('timing')==='1';res.end(`<style>html,body{margin:0}iframe{width:100vw;height:100vh;border:0}</style><iframe id="voice" src="/invincible/creator/tts.html?embed=project&project=checkpoint-project${timing?'&view=timing':''}"></iframe><script>addEventListener('message',event=>{if(event.data?.type==='invincible-open-script-timing')document.querySelector('#voice').contentWindow.postMessage({type:'invincible-project-script-view',view:'timing'},location.origin)})</script>`);return;}
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
  await page.addInitScript(()=>{if(!localStorage.getItem('invincible.creator.tts.draft.v1.owner'))localStorage.setItem('invincible.creator.tts.draft.v1.owner',JSON.stringify({engine:'classic'}));localStorage.setItem('invincible.ai.planner.v2','local');localStorage.setItem('invincible.local-worker.remembered.v1.http://127.0.0.1:8788.owner','fixture-local-worker-token-1234567890');});
  let plannedTranscript=null,localTranscribeCalls=0,transcribeMissing=false,planDelay=0,planUnsupportedOnce=true,expectedPlanInstructions='Show red arrows rising above the Equator.';
  await page.route('http://127.0.0.1:8788/**',async route=>{
   const request=route.request(),url=new URL(request.url());
   if(url.pathname==='/api/voiceover/transcribe'){localTranscribeCalls++;return transcribeMissing?route.fulfill({status:404,contentType:'application/json',body:'{"error":"Not found."}'}):route.fulfill({contentType:'application/json',body:JSON.stringify({transcript:{text:'Warm air rises.',language:'en',duration:1,segments:[{id:'segment-1',start:0,end:1,text:'Warm air rises.',words:[{word:'Warm',start:0,end:.3},{word:'air',start:.3,end:.55},{word:'rises.',start:.55,end:1}]}]}})});}
   if(url.pathname==='/api/voiceover/plan'){
    const body=request.postDataJSON();plannedTranscript=body.transcript;assert.equal(body.creativeInstructions,expectedPlanInstructions);assert.equal(body.production,true,'Script & scenes requests an executable Motion Studio fallback for every locked segment');
    const semanticPlan={sourceSegmentId:'segment-1',engine:'map',sceneKind:'historical-context',presetId:'historical-year-map',title:'North India · 1526',visualIntent:'Establish the dated political context.',labelTreatment:'map-label',cameraIntent:'global-to-local',assetIds:[],locationId:'',routeId:'',historicalYear:1526,regionId:'south-asia',polityNames:['Lodi Dynasty'],emphasis:['geography','polity'],missingInfo:[],resourceRequests:[{type:'historical-territory',query:'Lodi Dynasty in 1526',importance:'required-factual',fallback:'dated-location-context'},{type:'portrait',query:'Ibrahim Lodi',importance:'optional',fallback:'name-card'}],clarifications:[{question:'Show adjacent polities?',default:'Only when narrated.',reason:'Keeps claims narrow.'}]};
    const scene={id:'scene-1',startSeconds:0,endSeconds:1,durationSeconds:1,voiceover:body.transcript.segments[0].text,voiceoverTimestamp:'0.000-1.000s',visual:'Rising air',animation:'reveal',assets:'',assetIds:[],assetReferences:'',sourceSegmentIds:['segment-1'],missingInfo:['No verified geography supplied. Using a safe Canvas scene.'],mapAnimation:null,contextCard:true,semanticPlan};
    if(planDelay)await new Promise(resolve=>setTimeout(resolve,planDelay));
    if(planUnsupportedOnce){planUnsupportedOnce=false;return route.fulfill({status:400,contentType:'application/json',body:'{"error":"Map planning failed after 2 targeted attempts: Plan 1 has an unsupported intent."}'});}
    try{return await route.fulfill({contentType:'application/json',body:JSON.stringify({analysis:{format:'invincible-voiceover-analysis',version:1,transcript:body.transcript,scenes:[scene],errors:[],valid:true},creatorStudio:{schemaVersion:1,title:'ITCZ',aspectRatio:'9:16',assets:[],audio:null,scenes:[{id:'scene-1',timeline:'0.000-1.000s',voiceover:scene.voiceover,voiceoverTimestamp:scene.voiceoverTimestamp,visual:scene.visual,assets:'',assetReferences:'',mapAnimation:null,contextCard:true}]},mapAnimations:[]})});}catch{return;}
   }
   return route.fulfill({status:404,contentType:'application/json',body:'{"error":"Not found"}'});
  });
  await page.goto(base);await page.locator('#accountStatus').filter({hasText:'voices available'}).waitFor();
  for (const [width,height] of [[1024,800],[1280,600],[1280,800],[1600,800]]) {
    await page.setViewportSize({width,height});
    const panels = await page.locator('#workspace > .space-panel').evaluateAll(elements =>
      elements.map(element => {
        const {width,height,top} = element.getBoundingClientRect();
        return {width,height,top};
      }));
    assert.equal(panels.length,3);
    for (const panel of panels) {
      assert.ok(Math.abs(panel.width-panels[0].width)<1, 'Voiceover panels have equal widths at '+width);
      assert.ok(Math.abs(panel.height-panels[0].height)<1, 'Voiceover panels have equal heights at '+width);
      assert.equal(panel.top,panels[0].top);
    }
  }
  await page.setViewportSize({width:1280,height:720});
    assert.equal(await page.locator('.tts-forest').getAttribute('aria-hidden'),'true');
    assert.equal(await page.locator('.tts-river').count(),0,'The page uses the forest background');
  for(const asset of ['tts-forest.css','tts-forest.js'])assert.equal(await page.evaluate(async asset=>(await fetch(asset)).status,asset),200,'Forest asset loads: '+asset);
  assert.equal(await page.locator('#script').inputValue(),'');assert.equal(await page.locator('#voiceDemo').isEnabled(),true);assert.equal(await page.locator('#generate').isDisabled(),true);
  await page.locator('#speed').fill('1.6');
  await page.locator('#voiceDemo').click();await page.waitForFunction(()=>document.querySelector('#voiceDemo').getAttribute('aria-pressed')==='true');
  assert.equal(await page.locator('#voiceDemoAudio').evaluate(audio=>audio.playbackRate),1.6);
  await page.locator('#speed').fill('1.25');
  assert.equal(await page.locator('#voiceDemoAudio').evaluate(audio=>audio.playbackRate),1.25);
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
  await page.locator('#speed').fill('1.6');
  await page.locator('#preview').click();await page.locator('#recording').waitFor();
  const preview=await page.evaluate(()=>window.lastTtsRequest);
  assert.ok(preview.text.length<await page.locator('#script').inputValue().then(x=>x.length));
  assert.equal(await page.locator('#player').evaluate(audio=>audio.playbackRate),1);
  assert.equal(preview.speed,1.6);assert.equal(preview.volume,3);assert.equal(preview.paragraphPause,500);
  assert.equal(await page.locator('#analyzeLocal').isDisabled(),true,'An opening preview cannot be sent to Whisper as the final MP3');
  assert.equal(historyDb.size,0,'Opening previews do not create history');
  await page.locator('#speed').fill('1.15');
  await page.locator('#generate').click();await page.locator('#generationStatus').filter({hasText:'MP3 ready'}).waitFor();
  const full=await page.evaluate(()=>window.lastTtsRequest);assert.equal(full.text,await page.locator('#script').inputValue());
  await page.locator('#playbackSpeed').selectOption('1.2');assert.equal(await page.locator('#player').evaluate(audio=>audio.playbackRate),1.2);assert.match(await page.locator('#playbackHelp').innerText(),/Download and Next use this exact speed/);
  assert.equal(await page.locator('.recording-actions #analyzeLocal').innerText(),'Scripting · Step 2');assert.equal(await page.locator('#analyzeLocal').isEnabled(),true);assert.equal(await page.locator('[data-ai-flow="audio"]').getAttribute('class'),'done');assert.equal(await page.locator('[data-ai-flow="timing"]').getAttribute('aria-current'),'step');transcribeMissing=true;await page.locator('#analyzeLocal').click();await page.locator('#localAnalysisStatus').filter({hasText:'out of date'}).waitFor();assert.match(await page.locator('#localAnalysisStatus').innerText(),/MP3 is still here/);assert.equal(await page.locator('#retryAnalysis').isVisible(),true);transcribeMissing=false;await page.locator('#retryAnalysis').click();await page.locator('#transcriptReview').waitFor();
  assert.equal((await page.evaluate(()=>window.lastRetimeRequest)).speed,1.2);assert.equal(await page.locator('#player').evaluate(audio=>audio.playbackRate),1);assert.match(await page.locator('#recordingInfo').innerText(),/final 1\.20×/);
  assert.equal(localTranscribeCalls,2,'Both the failed attempt and retry used the local Whisper endpoint');assert.equal(await page.evaluate(()=>window.cloudAiCalls),undefined,'OpenAI was not asked to transcribe audio');
  assert.equal(await page.locator('[data-ai-flow="timing"]').getAttribute('class'),'done');assert.equal(await page.locator('[data-ai-flow="plan"]').getAttribute('aria-current'),'step');
  assert.match(await page.locator('#transcriptDuration').innerText(),/00:01\.000/);assert.equal(await page.locator('.transcript-segment').count(),1);
  await page.locator('#creativeInstructions').fill('Show red arrows rising above the Equator.');await page.locator('.transcript-segment textarea').fill('Warm air rises above the Equator.');assert.equal(await page.locator('#generateScenePlan').isEnabled(),true);
  planDelay=1200;await page.locator('#generateScenePlan').click();await page.locator('#localAnalysisStatus').filter({hasText:/Local Qwen is creating the sync plan/}).waitFor();assert.equal(await page.locator('#scenePlanProgress').isVisible(),true);assert.match(await page.locator('#scenePlanProgress').innerText(),/Review sync plan will open automatically/);assert.equal(await page.locator('#generateScenePlan').innerText(),'Generating sync plan…');await page.locator('#localAnalysisStatus').filter({hasText:/Safe 1-scene sync plan ready/}).waitFor();await page.locator('#scenePlanReview').waitFor();assert.equal(await page.locator('.ai-script-flow').getAttribute('class'),'ai-script-flow plan-review-active');assert.equal(await page.locator('.timing-columns').isVisible(),true);assert.equal(await page.locator('#transcriptReview').isHidden(),true);assert.equal(await page.locator('#scenePlanReview').isVisible(),true);assert.equal(await page.locator('[data-ai-flow="plan"]').getAttribute('class'),'done');assert.equal(plannedTranscript.segments[0].text,'Warm air rises above the Equator.');assert.match(await page.locator('.scene-plan-scenes').innerText(),/Canvas/);assert.match(await page.locator('.scene-plan-scenes').innerText(),/safe Canvas scene/);assert.ok(await page.evaluate(()=>JSON.parse(localStorage.getItem('invincible.creator.ai.pending.v1')).audioAvailable));await page.locator('#openMotionStudio').scrollIntoViewIfNeeded();assert.equal(await page.locator('#openMotionStudio').getAttribute('aria-disabled'),'false');assert.equal(await page.locator('#openMotionStudio').isVisible(),true);assert.equal(await page.locator('#openMotionStudio').innerText(),'Next · Motion & export');
  planDelay=0;await page.locator('#generateScenePlan').evaluate(button=>button.click());await page.locator('#resourceReview').waitFor();assert.match(await page.locator('.scene-plan-scenes').innerText(),/Map/);assert.match(await page.locator('#resourceReviewSummary').innerText(),/1 review · 1 missing/);assert.equal(await page.locator('[data-resource-action=map]').count(),1);assert.equal(await page.locator('[data-resource-action=assets]').count(),1);assert.match(await page.locator('#resourceReviewItems').innerText(),/Default used: Only when narrated/);await page.screenshot({path:path.join(out,'script-scene-plan.png'),fullPage:true});
  await page.locator('[name=aiProvider][value=cloud]').check();await page.locator('#generateScenePlan').click();await page.waitForFunction(()=>window.cloudAiCalls?.length===1);await page.locator('#scenePlanReview').waitFor();const cloudCall=await page.evaluate(()=>window.cloudAiCalls[0]);assert.equal(cloudCall.action,'plan');assert.equal('audioBase64' in cloudCall,false);assert.equal(localTranscribeCalls,2,'Changing the planner reuses locked local timing without retranscription');
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
  assert.equal(await page.locator('#speedLabel').innerText(),'Gemini pace request');
  const downloadUrl=await page.locator('#download').getAttribute('href');
  await page.locator('#playbackSpeed').selectOption('1.6');
  assert.equal(await page.locator('#player').evaluate(a=>a.playbackRate),1.6);
  assert.equal(await page.locator('#download').getAttribute('href'),downloadUrl);
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
   if(width<=900){
    const positions=await page.locator('#workspace').evaluate(track=>{
      const panels=[...track.querySelectorAll(':scope > .space-panel')];
      return {mode:getComputedStyle(track).scrollSnapType, offsets:panels.map(panel=>panel.offsetLeft),width:track.clientWidth};
    });
    assert.match(positions.mode,/x mandatory/);
    assert.equal(positions.offsets.length,3);
    assert.ok(positions.offsets[2]-positions.offsets[1]>=positions.width-1);
    await page.locator('#generate').scrollIntoViewIfNeeded();
   }
   const action=await page.locator('#generate').boundingBox();
   assert.ok(action.height>=44&&action.y>=0&&action.y+action.height<=height,'Generate in viewport '+width);
   for(const id of ['generate','player','download']){
    const control=page.locator('#'+id);
    await control.scrollIntoViewIfNeeded();
    const reach=await control.evaluate(el=>{const r=el.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return{ok:r.y>=0&&r.bottom<=innerHeight+1&&!!hit&&(hit===el||el.contains(hit)),rect:{x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom},viewport:innerHeight,hit:hit?.id||hit?.className||hit?.tagName}});
    assert.ok(reach.ok,'Transport reachable and unobscured: '+id+' at '+width+' '+JSON.stringify(reach));
   }
    if(width>900&&height>=650){
    const editor=await page.locator('#script').boundingBox();
    assert.ok(editor.width>=220&&editor.height>=110&&editor.height<=301,'Usable, bounded desktop editor '+width);
    assert.equal(await page.locator('#engine').isVisible(),true,'Desktop settings reopen');
     for(const id of ['historyHeading','historyRefresh'])assert.ok(await page.locator('#'+id).evaluate(el=>{
      const r=el.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);
      return r.top>=0&&r.bottom<=innerHeight&&hit&&(hit===el||el.contains(hit));
     }),'Desktop history reachable without page scrolling: '+id+' at '+width);
     assert.equal(await page.locator('#workspace > .space-panel').count(),3);
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
  const projectHost=new URL('../test-project-host.html',base).href;
  await page.goto(projectHost);const projectFrame=page.frameLocator('#voice');await projectFrame.locator('#accountStatus').filter({hasText:'voices available'}).waitFor();
  await projectFrame.locator('#engine').selectOption('classic');await projectFrame.locator('#family').selectOption('Neural2');await projectFrame.locator('#script').fill('Saved project timing survives an app restart.');await projectFrame.locator('#generate').click();await projectFrame.locator('#generationStatus').filter({hasText:'MP3 ready'}).waitFor();await projectFrame.locator('#analyzeLocal').click();await projectFrame.locator('#transcriptReview').waitFor();await projectFrame.locator('#creativeInstructions').fill('Keep the atmosphere restrained and reveal the title slowly.');await page.waitForTimeout(400);
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('invincible.creator.script-sync.v1.owner.checkpoint-project')||'null')?.audioAvailable===true);
  expectedPlanInstructions='Keep the atmosphere restrained and reveal the title slowly.';planDelay=5000;await projectFrame.locator('#generateScenePlan').click();await projectFrame.locator('#localAnalysisStatus').filter({hasText:/is creating/}).waitFor();await page.goto(projectHost+'?timing=1');planDelay=0;const restoredFrame=page.frameLocator('#voice');await restoredFrame.locator('#localAnalysisStatus').filter({hasText:'Local Whisper timing and animation instructions restored'}).waitFor();assert.equal(await restoredFrame.locator('#creativeInstructions').inputValue(),expectedPlanInstructions);assert.equal(await restoredFrame.locator('.transcript-segment').count(),1);assert.match(await restoredFrame.locator('#player').getAttribute('src'),/^blob:/);assert.equal(await restoredFrame.locator('#generateScenePlan').isEnabled(),true,'A restored checkpoint can generate the sync plan without repeating Whisper');
  await page.goto(base);await page.locator('#accountStatus').filter({hasText:'voices available'}).waitFor();
    await page.evaluate(()=>{window.failGenerate=false;window.generationGate=new Promise(resolve=>{window.releaseGeneration=resolve;});});await page.locator('#generate').click();
    assert.equal(await page.locator('#generate').isDisabled(),true,'Generation disables duplicate requests');
    assert.equal(await page.locator('#preview').isDisabled(),true,'Preview is disabled while generating');
  await page.evaluate(()=>{window.setTtsUser({uid:'other'});window.releaseGeneration();});await page.waitForTimeout(400);
  assert.equal(await page.locator('#direction').inputValue(),'');
  await page.locator('#engine').selectOption('classic');await page.locator('#family').selectOption('Neural2');
  assert.equal(await page.locator('#script').inputValue(),'');assert.equal(await page.locator('#recording').isHidden(),true);
  await page.locator('#historyStatus').filter({hasText:'saved to your account'}).waitFor();assert.equal(await page.locator('.history-entry').count(),0,'Another account cannot see owner history');
  await page.locator('#voiceDemo').click();await page.waitForFunction(()=>document.querySelector('#voiceDemo').getAttribute('aria-pressed')==='true');
  await page.evaluate(()=>window.setTtsUser(null));assert.equal(await page.locator('#voiceDemoAudio').evaluate(a=>a.paused&&!a.hasAttribute('src')),true);assert.equal(await page.locator('#workspace').isHidden(),true);assert.equal(await page.locator('#signedOut').isVisible(),true);
    assert.deepEqual(errors,[]);console.log('Voiceover browser: history navigation/scroll/export/restore/retry/pagination/deletion and account isolation; demos, preview/full generation, busy states, settings, MP3 download, errors, retained drafts, keyboard disclosure and unobscured transport at 320–1920px passed.');
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1;});
