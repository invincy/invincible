const assert=require('node:assert/strict'),http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),out=path.join(root,'.test-output/tts');
const {normalizeVoices,makeWav}=require('../functions-tts/src/tts-model'),{encodeMp3}=require('../functions-tts/src/tts-service');
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 const mp3=await encodeMp3(makeWav([Buffer.alloc(48000)]));
 const voices=normalizeVoices([
  {name:'hi-IN-Neural2-B',languageCodes:['hi-IN'],ssmlGender:'MALE'},
  {name:'hi-IN-Neural2-A',languageCodes:['hi-IN'],ssmlGender:'FEMALE'},
  {name:'hi-IN-Chirp3-HD-Charon',languageCodes:['hi-IN'],ssmlGender:'MALE'},
  {name:'en-IN-Neural2-B',languageCodes:['en-IN'],ssmlGender:'MALE'},
  {name:'hi-IN-Neural2-Z',languageCodes:['hi-IN'],ssmlGender:'NEUTRAL'}
 ]);
 const fixtureAuth="export async function observeAuth(callback){window.setTtsUser=callback;queueMicrotask(()=>callback({uid:'owner'}));}";
 const fixtureApi='export async function loadVoices(){if(window.failVoices)throw Error("Backend unavailable");return '+JSON.stringify(voices)+';} export async function generateVoiceover(data){window.lastTtsRequest=data;await new Promise(r=>setTimeout(r,window.generationDelay||30));if(window.failGenerate)throw Error("Google TTS quota is exhausted");return '+JSON.stringify({audioBase64:mp3.toString('base64'),mimeType:'audio/mpeg',filename:'test-voice.mp3',durationSeconds:1,voiceName:'hi-IN-Neural2-B'})+';}';
 const server=http.createServer((req,res)=>{
  const url=new URL(req.url,'http://localhost'),relative=decodeURIComponent(url.pathname.replace(/^\/invincible\//,''));
  res.setHeader('Content-Type',relative.endsWith('.js')?'text/javascript':relative.endsWith('.css')?'text/css':'text/html');
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
  const demoRequests=[];let demoFailure=false;const demoWav=makeWav([Buffer.alloc(24000*2*3)]);
  await page.route('https://docs.cloud.google.com/static/text-to-speech/docs/audio/**',route=>{demoRequests.push(new URL(route.request().url()).pathname);return demoFailure?route.fulfill({status:404,body:'Missing sample'}):route.fulfill({status:200,contentType:'audio/wav',body:demoWav});});
  const base='http://127.0.0.1:'+server.address().port+'/invincible/creator/tts.html';
  await page.goto(base);await page.locator('#accountStatus').filter({hasText:'voices available'}).waitFor();
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
  await page.locator('#volume').fill('3');
  await page.locator('#pause').selectOption('500');
  await page.locator('#preview').click();await page.locator('#recording').waitFor();
  const preview=await page.evaluate(()=>window.lastTtsRequest);
  assert.ok(preview.text.length<await page.locator('#script').inputValue().then(x=>x.length));
  assert.equal(preview.speed,1.15);assert.equal(preview.volume,3);assert.equal(preview.paragraphPause,500);
  await page.locator('#generate').click();await page.locator('#generationStatus').filter({hasText:'MP3 ready'}).waitFor();
  const full=await page.evaluate(()=>window.lastTtsRequest);assert.equal(full.text,await page.locator('#script').inputValue());
  const downloadPromise=page.waitForEvent('download');await page.locator('#download').click();const download=await downloadPromise;await download.saveAs(path.join(out,'download.mp3'));assert.ok(fs.statSync(path.join(out,'download.mp3')).size>10000);
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
  await page.evaluate(()=>{window.failGenerate=false;window.generationDelay=250;});await page.locator('#generate').click();
  await page.evaluate(()=>window.setTtsUser({uid:'other'}));await page.waitForTimeout(400);
  assert.equal(await page.locator('#script').inputValue(),'');assert.equal(await page.locator('#recording').isHidden(),true);
  await page.locator('#voiceDemo').click();await page.waitForFunction(()=>document.querySelector('#voiceDemo').getAttribute('aria-pressed')==='true');
  await page.evaluate(()=>window.setTtsUser(null));assert.equal(await page.locator('#voiceDemoAudio').evaluate(a=>a.paused&&!a.hasAttribute('src')),true);assert.equal(await page.locator('#workspace').isHidden(),true);assert.equal(await page.locator('#signedOut').isVisible(),true);
  assert.deepEqual(errors,[]);console.log('Voiceover browser: no-text Google demos, voice switching/stop/errors/unavailable samples without synthesis; preview/full generation, settings, download, capability constraints, XML errors, retained drafts, account isolation and 320–1280px layouts passed.');
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1;});
