const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const root=process.cwd();
const server=http.createServer((req,res)=>{
 const u=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=path.resolve(root,'.'+u+(u.endsWith('/')?'index.html':''));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)){res.writeHead(404).end();return;}
 res.setHeader('Content-Type',({'.html':'text/html','.css':'text/css','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.mp3':'audio/mpeg','.png':'image/png'})[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);
});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE||(process.platform==='win32'?'C:/Program Files/Google/Chrome/Application/chrome.exe':undefined)});
 try{
  const page=await browser.newPage({viewport:{width:360,height:640},reducedMotion:'no-preference'}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  const base='http://127.0.0.1:'+server.address().port+'/lic/jeevan-lakshya/';await page.goto(base);
  const durations=await page.evaluate(async()=>{
   const manifest=await fetch('./audio/manifest.json').then(r=>r.json()),context=new AudioContext(),out=[];
   for(const [key,clip] of Object.entries(manifest.clips)){
    const response=await fetch('./audio/'+clip.file);if(!response.ok)throw Error('Missing '+key);
    const buffer=await context.decodeAudioData(await response.arrayBuffer());out.push({key,duration:buffer.duration,expected:clip.duration});
   }
   await context.close();return out;
  });
  assert.equal(durations.length,14);for(const d of durations){assert.ok(d.duration>1,d.key+' audible duration');assert.ok(Math.abs(d.duration-d.expected)<.15,d.key+' measured duration');}
  const cue=async key=>{await page.waitForFunction(k=>document.querySelector('#stageContainer').dataset.voiceCue===k&&document.querySelector('#stageContainer').dataset.audioStatus==='playing',key,{timeout:15000});};
  const finish=async()=>{await page.evaluate(()=>{const a=document.querySelector('#storyNarration');a.currentTime=a.duration-.08;});};
  // Seeking only accelerates this test; native media ended events still drive transitions.
  await page.locator('#startStoryBtn').click();await cue('intro.dreams');assert.equal(await page.locator('#goalChoices').evaluate(e=>e.inert),true);
  await finish();await cue('intro.plan');assert.equal(await page.locator('#goalChoices').evaluate(e=>e.inert),true);
  await finish();await cue('goal.choose');assert.equal(await page.locator('#goalChoices').evaluate(e=>e.inert),false);
  await finish();await page.waitForTimeout(700);assert.equal(await page.locator('#stageContainer').getAttribute('data-flow-step'),'intro','Goal decision waits for user');
  await page.locator('[data-goal="career"]').click();await cue('goal.career');await page.waitForTimeout(1900);assert.equal(await page.locator('#stageContainer').getAttribute('data-flow-step'),'selected','Branch narration is not cut at old timer');
  await finish();await cue('profile.choose');await finish();await page.waitForTimeout(700);assert.equal(await page.locator('#stageContainer').getAttribute('data-flow-step'),'configure','Profile waits for user');
  await page.locator('#openPreviewBtn').click();await cue('plan.premium');assert.equal(await page.locator('#maturityPill').isVisible(),false);
  await page.locator('#storyModeToggle').click();const frozen=await page.locator('#storyNarration').evaluate(a=>a.currentTime);await page.waitForTimeout(600);assert.ok(Math.abs(await page.locator('#storyNarration').evaluate(a=>a.currentTime)-frozen)<.05);assert.equal(await page.locator('#storyNarration').evaluate(a=>a.paused),true);
  await page.locator('#storyModeToggle').click();await page.waitForFunction(()=>!document.querySelector('#storyNarration').paused);await finish();await cue('plan.maturity');assert.equal(await page.locator('#maturityPill').isVisible(),true);
  await page.locator('#advisorAudioBtn').click();assert.equal(await page.locator('#storyNarration').evaluate(a=>a.muted),true);await finish();await cue('family.whatif');
  await page.waitForTimeout(4800);await finish();await cue('family.rider');
  const image=await page.locator('#storyGoal').elementHandle();
  for(const key of ['family.premiums-stop','family.annual-income','family.maturity']){await finish();await cue(key);}
  assert.ok(await image.evaluate(e=>e===document.querySelector('#storyGoal')),'Persistent goal coin');await page.waitForTimeout(1400);
  assert.ok(!/grayscale/.test(await page.locator('#storyGoal').evaluate(e=>getComputedStyle(e).filter)));
  const anchor=await page.evaluate(()=>{const c=document.querySelector('#goalCoin').getBoundingClientRect(),r=document.querySelector('.story-road').getBoundingClientRect();return Math.hypot(c.x+c.width/2-r.x-r.width*268/500,c.y+c.height/2-r.y-r.height*55/500);});assert.ok(anchor<1.5);
  await finish();await page.waitForTimeout(700);assert.equal(await page.locator('#stageContainer').getAttribute('data-benefit-step'),'4','Final scene holds');
  await page.locator('#storyModeToggle').click();await cue('family.rider');await page.locator('#ctaPrevBtn').click();await cue('family.whatif');assert.match(await page.locator('#storyNarration').getAttribute('src'),/family\.whatif\.mp3$/);assert.equal(await page.locator('#stageContainer').getAttribute('data-flow-step'),'whatif');
  assert.deepEqual(errors,[]);console.log('PASS all 14 MP3s decode with measured durations; real media end, decision waits, pause/resume, mute, cancellation, persistent arrow anchor and final hold');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
