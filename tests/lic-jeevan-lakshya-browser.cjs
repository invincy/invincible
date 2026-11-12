const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const root=process.cwd(),out='.test-output/lic-jeevan-lakshya';fs.mkdirSync(out,{recursive:true});
const server=http.createServer((req,res)=>{const u=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/invincible\//,'/');const f=path.resolve(root,'.'+u+(u.endsWith('/')?'index.html':''));if(!f.startsWith(root+path.sep)||!fs.existsSync(f)){res.writeHead(404).end();return;}res.setHeader('Content-Type',({'.html':'text/html','.css':'text/css','.js':'text/javascript','.mjs':'text/javascript','.png':'image/png','.svg':'image/svg+xml'})[path.extname(f)]||'application/octet-stream');fs.createReadStream(f).pipe(res);});


(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port+'/invincible';
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE||(process.platform==='win32'?'C:/Program Files/Google/Chrome/Application/chrome.exe':undefined)});
 const realPage=browser.newPage.bind(browser);browser.newPage=async options=>{const p=await realPage(options);await p.route('**/*',route=>new URL(route.request().url()).origin===new URL(base).origin?route.continue():route.abort());await p.addInitScript(()=>{HTMLMediaElement.prototype.play=function(){return Promise.reject(new DOMException('Blocked playback fixture','NotAllowedError'));};});return p;};
 try{
 for(const [w,h] of [[320,568],[360,640],[405,720],[450,800]]){
  const page=await browser.newPage({viewport:{width:w,height:h},reducedMotion:'reduce'});const errors=[],missing=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.url().startsWith(base)&&r.status()===404)missing.push(r.url());});
  await page.clock.install({time:new Date('2026-11-10T00:00:00Z')});await page.clock.pauseAt(new Date('2026-11-10T00:00:01Z'));
  await page.goto(base+'/lic/');await page.getByRole('heading',{name:'Plans',exact:true}).click();await page.getByRole('link',{name:'Open Jeevan Lakshya presentation',exact:true}).click();await page.waitForFunction(()=>document.querySelector('#stageContainer').dataset.ready==='true');
  const state=async n=>assert.equal(await page.locator('#stageContainer').getAttribute('data-flow-step'),n);
  async function geometry(label){const g=await page.evaluate(()=>{const r=s=>{const e=document.querySelector(s),b=e.getBoundingClientRect();return{top:b.top,bottom:b.bottom,left:b.left,right:b.right,width:b.width,height:b.height,visible:getComputedStyle(e).display!=='none'};};return{coin:r('#goalCoin'),road:r('.story-road'),frame:r('#deviceFrame'),headline:r('#layerHeadline'),audio:r('#layerAdvisorAudio'),body:r('#sceneStageContent'),footer:r('#stageFooter'),width:innerWidth,scroll:document.documentElement.scrollWidth,height:innerHeight};});assert.ok(Math.abs(g.frame.width/g.frame.height-9/16)<.002,'9:16 canvas');assert.ok(g.headline.bottom<=g.body.top+1,label+' headline clears story');if(g.audio.visible)assert.ok(g.audio.right<=g.frame.right&&g.audio.left>=g.frame.left,label+' audio stays in header');if(g.footer.visible){assert.ok(g.body.bottom<=g.footer.top+1,label+' story clears footer');assert.ok(g.footer.bottom<=g.height+1,label+' footer visible');}assert.ok(g.scroll<=g.width,'No horizontal overflow');assert.ok(Math.abs(g.coin.left+g.coin.width/2-(g.road.left+g.road.width*268/500))<1.5,label+' coin centre on arrow x');assert.ok(Math.abs(g.coin.top+g.coin.height/2-(g.road.top+g.road.height*55/500))<1.5,label+' coin centre on arrow y');}
  await page.getByRole('button',{name:'Skip introduction'}).click();await page.locator('[data-sequence-ready="true"]').waitFor();await state('intro');assert.equal(await page.locator('#ctaNextBtn').isVisible(),false);assert.equal(await page.locator('#storyModeToggle').isVisible(),false);await geometry('intro');
  const goals=await page.locator('#goalChoices button').evaluateAll(buttons=>buttons.map(button=>button.getBoundingClientRect().toJSON()));
  assert.equal(goals.length,4);
  for(const [i,goal] of goals.entries()){
   assert.ok(goal.left>=0&&goal.right<=w&&goal.top>=0&&goal.bottom<=h,'Goal fits the portrait viewport');
   for(const other of goals.slice(i+1))assert.ok(goal.right<=other.left||other.right<=goal.left||goal.bottom<=other.top||other.bottom<=goal.top,'Goal buttons do not overlap');
  }
  await page.screenshot({path:out+'/'+w+'x'+h+'-four-goals.png'});
  await page.locator('[data-goal="career"]').click();await state('selected');assert.equal(await page.locator('#stageContainer').getAttribute('data-voice-cue'),'goal.career');assert.equal(await page.locator('#configurationPanel').isVisible(),false);await page.clock.fastForward(1800);await state('configure');assert.equal(await page.locator('#stageContainer').getAttribute('data-voice-cue'),'profile.choose');assert.match(await page.locator('#riderScenarioAmount').innerText(),/2,00,000/);await page.locator('[data-age="50"]').click();assert.equal(await page.locator('[data-term="25"]').isDisabled(),true);await page.locator('[data-age="30"]').click();await page.locator('[data-term="25"]').click();await geometry('configure');
  await page.locator('#openPreviewBtn').click();await state('preview');assert.equal(await page.locator('#maturityPill').isVisible(),false);assert.match(await page.locator('#previewPremium').innerText(),/9,222/);await page.clock.fastForward(1499);assert.equal(await page.locator('#maturityPill').isVisible(),false);await page.clock.fastForward(1);assert.equal(await page.locator('#maturityPill').isVisible(),true);await geometry('preview');
  await page.locator('#storyModeToggle').click();await page.clock.fastForward(20000);await state('preview');assert.equal(await page.locator('#stageContainer').getAttribute('data-paused'),'true');await page.locator('#storyModeToggle').click();await page.clock.fastForward(4999);await state('preview');await page.clock.fastForward(1);await state('whatif');assert.equal(await page.locator('#whatIfCaption').isVisible(),false);
  await page.clock.fastForward(1200);assert.equal(await page.locator('#whatIfCaption').isVisible(),true);await page.clock.fastForward(3500);assert.equal(await page.locator('#stageContainer').getAttribute('data-sequence-ready'),'true');assert.match(await page.locator('.story-road').evaluate(e=>getComputedStyle(e).filter),/grayscale\(1\)/);await geometry('whatif');
  await page.clock.fastForward(2500);await state('protection');const coinStart=await page.locator('#storyGoal').boundingBox();assert.equal(await page.locator('#stageContainer').getAttribute('data-benefit-step'),'1');assert.equal(await page.locator('#riderPill').isVisible(),true);assert.match(await page.locator('#riderAmount').innerText(),/2,00,000/);for(const id of ['ceasesPill','incomePill','deathMaturityPill'])assert.equal(await page.locator('#'+id).isVisible(),false);
  for(let step=1;step<=4;step++){
   assert.equal(await page.locator('#stageContainer').getAttribute('data-benefit-step'),String(step));if(step<4)assert.match(await page.locator('#storyGoal').evaluate(e=>getComputedStyle(e).filter),/grayscale\(1\)/);assert.equal(await page.locator('#protectionPanel .is-current').count(),1);
   const bounds=await page.locator('#protectionPanel .is-current').evaluate(e=>{const r=e.getBoundingClientRect(),b=document.querySelector('#sceneStageContent').getBoundingClientRect();return{top:r.top,bottom:r.bottom,left:r.left,right:r.right,body:b.toJSON()};});assert.ok(bounds.top>=bounds.body.top-1&&bounds.bottom<=bounds.body.bottom+1,'Current milestone fits portrait story');assert.ok(bounds.left>=bounds.body.left-1&&bounds.right<=bounds.body.right+1,'Milestone fits width');
   await page.screenshot({path:out+'/'+w+'x'+h+'-path-step'+step+'.png'});
   if(step<4){await page.clock.fastForward(4799);assert.equal(await page.locator('#stageContainer').getAttribute('data-benefit-step'),String(step));await page.clock.fastForward(1);}
  }
  assert.equal(await page.locator('#stageContainer').evaluate(e=>e.classList.contains('path-restored')&&e.classList.contains('goal-restored')),true);await geometry('protection');
  const coinEnd=await page.locator('#storyGoal').boundingBox();assert.deepEqual(coinEnd,coinStart,'Goal coin stays fixed through all four benefits');
  assert.ok(await page.locator('#storyGoal').evaluate(e=>Number(getComputedStyle(e).opacity)>.99),'Maturity coin stays visible');
  assert.equal(await page.locator('#maturityGoal').count(),0,'No thumbnail replaces the coin');
  const badge=await page.locator('#deathMaturityPill').boundingBox();assert.ok(badge.x>=coinEnd.x+coinEnd.width*.808+3,'Maturity badge stays right of visible career coin');
  const settled=await page.locator('#incomePill').boundingBox();assert.ok(badge.y+badge.height<settled.y,'Maturity badge clears income card');
  await page.locator('#storyModeToggle').click();assert.equal(await page.locator('#stageContainer').getAttribute('data-benefit-step'),'1');await page.clock.fastForward(1800);await page.locator('#storyModeToggle').click();await page.clock.fastForward(15000);assert.equal(await page.locator('#stageContainer').getAttribute('data-benefit-step'),'1');await page.locator('#storyModeToggle').click();await page.clock.fastForward(2999);assert.equal(await page.locator('#stageContainer').getAttribute('data-benefit-step'),'1');await page.clock.fastForward(1);assert.equal(await page.locator('#stageContainer').getAttribute('data-benefit-step'),'2');
  await page.locator('#ctaNextBtn').click();assert.equal(await page.locator('#stageContainer').getAttribute('data-benefit-step'),'3');await page.locator('#ctaNextBtn').click();assert.equal(await page.locator('#stageContainer').getAttribute('data-benefit-step'),'4');await page.locator('#ctaNextBtn').click();await state('closing');
  assert.equal(await page.locator('#ctaNextBtn').isVisible(),false);
  await geometry('closing');assert.deepEqual(await page.locator('#storyGoal').boundingBox(),coinEnd);
  await page.clock.fastForward(6540);assert.equal(await page.locator('#closingMessage').isVisible(),true);assert.equal(await page.locator('#closingTrust').isVisible(),false);
  await page.clock.fastForward(1140);assert.equal(await page.locator('#closingTrust').isVisible(),true);assert.equal(await page.locator('#ctaNextBtn').isVisible(),false);
  await page.clock.fastForward(1320);
  await page.screenshot({path:out+'/'+w+'x'+h+'-closing.png'});
  await page.getByRole('button',{name:'View plan details →'}).click();await state('details');await page.locator('#replayBtn').click();await state('intro');await page.getByRole('button',{name:'Skip introduction'}).click();
  // Back removes every pending automatic callback; restarting uses the new profile.
  await page.locator('[data-goal="career"]').click();await page.clock.fastForward(1800);await page.locator('#openPreviewBtn').click();await page.locator('#ctaPrevBtn').click();await page.clock.fastForward(30000);await state('configure');await page.locator('[data-age="50"]').click();await page.locator('[data-sa="200000"]').click();await page.locator('#openPreviewBtn').click();await page.clock.fastForward(1500);await page.clock.fastForward(5000);await state('whatif');await page.clock.fastForward(7200);await state('protection');await page.clock.fastForward(4800);await page.clock.fastForward(4800);await page.clock.fastForward(4800);await page.locator('#ctaNextBtn').click();await page.clock.fastForward(9000);await page.locator('#ctaNextBtn').click();await page.locator('#ctaNextBtn').click();await page.clock.resume();
await page.waitForFunction(()=>document.body.dataset.ready==='true');
assert.equal(await page.locator('#customerAge').inputValue(),'50');assert.equal(await page.locator('#policyTerm').inputValue(),'15');assert.equal(await page.locator('#childGoal').inputValue(),'Career');
assert.match(await page.locator('#premiumValue').innerText(),/18,698/);
await page.locator('#customerAge').fill('30');await page.locator('#policyTerm').selectOption('25');
assert.match(await page.locator('#premiumValue').innerText(),/9,222/);
await page.locator('#bonusRate').fill('50');await page.locator('#fabRate').fill('30');
assert.match(await page.locator('#benefitGrid').innerText(),/4,56,000/);assert.match(await page.locator('#benefitGrid').innerText(),/2,00,000/);
await page.locator('#viewWhatIfBtn').click();assert.match(await page.locator('#deathTiming').innerText(),/20 payments/);
await page.locator('#demiseYearSlider').fill('25');assert.match(await page.locator('#deathTiming').innerText(),/no annual income/);
await page.locator('#customerAge').fill('50');assert.equal(await page.locator('#policyTerm option').count(),3);assert.equal(await page.locator('#demiseYearSlider').getAttribute('max'),'15');assert.equal(await page.locator('#demiseYearSlider').inputValue(),'15');
await page.locator('#targetSumAssured').fill('405000');assert.equal(await page.locator('#results').isVisible(),false);assert.equal(await page.locator('#profileError').isVisible(),true);assert.equal(await page.locator('#benefitGrid').isVisible(),false);
await page.locator('#targetSumAssured').fill('1000000');assert.match(await page.locator('#premiumValue').innerText(),/quotation required/);assert.equal(await page.locator('#results').isVisible(),true);
await page.locator('#bonusRate').fill('-1');assert.equal(await page.locator('#results').isVisible(),false);assert.equal(await page.locator('#bonusRate').isVisible(),true);await page.locator('#bonusRate').fill('0');assert.equal(await page.locator('#results').isVisible(),true);
await page.locator('#customerName').fill('<img src=x onerror=alert(1)>');await page.locator('#childGoal').fill('<script>alert(1)</script>');assert.equal(await page.locator('#summaryName img,#summaryGoal script').count(),0);
if(!await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth))console.log(await page.evaluate(()=>[...document.querySelectorAll('*')].filter(e=>e.getBoundingClientRect().right>innerWidth+1).map(e=>[e.tagName,e.className,e.getBoundingClientRect().right]).slice(0,15)));
assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Calculator fits width');
await page.screenshot({path:`${out}/${w}x${h}-calculator.png`,fullPage:true});


  assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);await page.close();console.log('PASS '+w+'x'+h+': 9:16 bounds, rider-first auto order, reading holds, pause/resume, replay, manual next, Back and calculator');
 }

 const edge=await browser.newPage({viewport:{width:320,height:568},reducedMotion:'reduce'});await edge.clock.install({time:new Date('2026-11-10T00:00:00Z')});await edge.clock.pauseAt(new Date('2026-11-10T00:00:01Z'));await edge.goto(base+'/lic/jeevan-lakshya/');await edge.getByRole('button',{name:'Skip introduction'}).click();await edge.locator('[data-goal="marriage"]').click();await edge.clock.fastForward(1800);await edge.locator('[data-sa="2000000"]').click();await edge.locator('#openPreviewBtn').click();await edge.clock.fastForward(1500);await edge.clock.fastForward(5000);await edge.clock.fastForward(7200);await edge.clock.fastForward(4800);await edge.clock.fastForward(4800);await edge.clock.fastForward(4800);
 assert.equal(await edge.locator('#deathMaturityAmount').innerText(),'₹22 lakh');assert.equal(await edge.locator('#deathMaturityAmount').getAttribute('aria-label'),'₹22,00,000');
 const edgeBounds=await edge.evaluate(()=>{const coin=document.querySelector('#storyGoal').getBoundingClientRect(),badge=document.querySelector('#deathMaturityPill').getBoundingClientRect(),amount=document.querySelector('#deathMaturityAmount');return{coinRight:coin.x+coin.width*.89,badgeLeft:badge.x,badgeRight:badge.right,width:innerWidth,textFits:amount.scrollWidth<=amount.clientWidth};});assert.ok(edgeBounds.badgeLeft>edgeBounds.coinRight+3);assert.ok(edgeBounds.badgeRight<=edgeBounds.width);assert.ok(edgeBounds.textFits,'Largest amount fits beside the widest goal coin');await edge.close();console.log('PASS small-phone marriage coin: persistent, separate maturity pill, largest amount unclipped');


 const opening=await browser.newPage({viewport:{width:405,height:720},reducedMotion:'no-preference'});
 await opening.clock.install({time:new Date('2026-11-10T00:00:00Z')});
 await opening.clock.pauseAt(new Date('2026-11-10T00:00:01Z'));
 await opening.goto(base+'/lic/jeevan-lakshya/');
 const openingPhase=()=>opening.locator('#stageContainer').getAttribute('data-opening');
 assert.equal(await openingPhase(),'family');
 assert.equal(await opening.locator('.story-family').evaluate(e=>getComputedStyle(e).opacity),'1');
 assert.equal(await opening.locator('.story-road').evaluate(e=>getComputedStyle(e).opacity),'0');
 assert.equal(await opening.locator('#startStoryBtn').count(),0);
 await opening.clock.fastForward(300);
 await opening.locator('[data-audio-status="blocked"]').waitFor();
 assert.equal(await opening.locator('#advisorAudioBtn').getAttribute('aria-label'),'Enable narration');
 assert.equal(await openingPhase(),'path');
 await opening.clock.fastForward(1050);
 assert.equal(await openingPhase(),'coin');
 await opening.clock.fastForward(200);
 assert.equal(await openingPhase(),'dreams');
 assert.equal(await opening.locator('#goalChoices button').count(),4);
 assert.equal(await opening.locator('#goalChoices').evaluate(e=>e.inert),true);
 assert.equal(await opening.locator('#stageContainer').getAttribute('data-voice-cue'),'intro.chime');
 await opening.clock.fastForward(950);
 assert.equal(await opening.locator('#stageContainer').getAttribute('data-voice-cue'),'intro.dreams');
 await opening.clock.fastForward(4200);
 assert.equal(await openingPhase(),'plan');
 assert.equal(await opening.locator('.story-family').evaluate(e=>getComputedStyle(e).opacity),'1');
 await opening.clock.fastForward(2800);
 assert.equal(await openingPhase(),'settled');
 assert.equal(await opening.locator('#goalChoices').evaluate(e=>e.inert),false);
 assert.equal(await opening.locator('#stageContainer').getAttribute('data-voice-cue'),'goal.choose');
 await opening.close();
 console.log('PASS family stays visible through a single four-goal spread with autoplay blocked');
 const capture=await browser.newPage({viewport:{width:405,height:720},reducedMotion:'no-preference'});await capture.goto(base+'/lic/jeevan-lakshya/');await capture.waitForFunction(()=>document.querySelector('#stageContainer').dataset.sequenceReady==='true');
 const visibleCentre=()=>{const img=document.querySelector('#storyGoal'),r=img.getBoundingClientRect(),src=img.getAttribute('src'),point=src.includes('study')?[232.5,272.5]:src.includes('career')?[235,245.5]:src.includes('marriage')?[259.5,242.5]:[250,235.5];return{x:r.x+r.width*point[0]/500,y:r.y+r.height*point[1]/500};};
 const centreBefore=await capture.evaluate(visibleCentre);await capture.evaluate(()=>window.originalCoin=document.querySelector('#storyGoal'));await capture.locator('[data-goal="education"]').click();await capture.waitForTimeout(350);assert.ok(await capture.locator('#goalHint').evaluate(e=>e.hidden||Number(getComputedStyle(e).opacity)<.01),'Capture cue is hidden');const origin=await capture.locator('[data-capture-ghost]').evaluateAll(xs=>xs.map(e=>getComputedStyle(e).transformOrigin));if(origin.length)assert.equal(origin[0],'0px 0px');await capture.waitForFunction(()=>document.querySelector('#stageContainer').dataset.flowStep==='selected');await capture.waitForTimeout(1100);const centreAfter=await capture.evaluate(visibleCentre);assert.ok(Math.abs(centreBefore.x-centreAfter.x)<1&&Math.abs(centreBefore.y-centreAfter.y)<1,'Gold and goal art share the same visible centre');assert.ok(await capture.evaluate(()=>window.originalCoin===document.querySelector('#storyGoal')),'The same image node survives capture');await capture.waitForFunction(()=>document.querySelector('#stageContainer').dataset.flowStep==='configure');assert.ok(await capture.evaluate(()=>window.originalCoin===document.querySelector('#storyGoal')));await capture.locator('#openPreviewBtn').click();await capture.waitForFunction(()=>document.querySelector('#stageContainer').dataset.flowStep==='preview');assert.ok(await capture.evaluate(()=>window.originalCoin===document.querySelector('#storyGoal')));await capture.close();console.log('PASS hidden capture cue, correct landing origin, visible centre continuity and single coin across stages');
 const motion=await browser.newPage({viewport:{width:405,height:720},reducedMotion:'no-preference'});await motion.goto(base+'/lic/jeevan-lakshya/');await motion.locator('[data-goal="education"]').click();await motion.waitForFunction(()=>document.querySelector('#stageContainer').dataset.flowStep==='selected');await motion.waitForFunction(()=>document.querySelector('#stageContainer').dataset.flowStep==='configure');await motion.locator('#openPreviewBtn').click();await motion.waitForFunction(()=>document.querySelector('#stageContainer').dataset.flowStep==='protection',null,{timeout:20000});assert.ok(await motion.locator('.story-family').evaluate(e=>Number(getComputedStyle(e).opacity)<.01));assert.ok(await motion.locator('.story-child').evaluate(e=>Number(getComputedStyle(e).opacity)>.95));await motion.waitForFunction(()=>document.querySelector('#stageContainer').dataset.benefitStep==='4',null,{timeout:20000});await motion.waitForTimeout(1500);assert.ok(!/grayscale/.test(await motion.locator('.story-road').evaluate(e=>getComputedStyle(e).filter)));assert.ok(!/grayscale/.test(await motion.locator('.story-goal').evaluate(e=>getComputedStyle(e).filter)));assert.ok(await motion.locator('.story-goal').evaluate(e=>Number(getComputedStyle(e).opacity)>.99));await motion.close();console.log('PASS real automatic choreography, family fade, child entrance, route and colour restoration');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
