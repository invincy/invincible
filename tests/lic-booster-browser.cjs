const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const root=process.cwd(),out='.test-output/lic-booster';fs.mkdirSync(out,{recursive:true});
const server=http.createServer((req,res)=>{
 const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/invincible\//,'/');
 const file=path.resolve(root,'.'+pathname+(pathname.endsWith('/')?'index.html':''));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end();return;}
 const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.mp3':'audio/mpeg','.svg':'image/svg+xml','.webp':'image/webp'};
 res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});fs.createReadStream(file).pipe(res);
});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base=process.env.LIC_PREVIEW_URL||`http://127.0.0.1:${server.address().port}`;
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE||(process.platform==='win32'?'C:/Program Files/Google/Chrome/Application/chrome.exe':undefined),args:['--autoplay-policy=no-user-gesture-required']});
 const enter=async page=>{
  await page.goto(base+'/lic/bima-platinum/?age=35&bsa=1000000&ppt=12&term=25&mode=yearly&channel=agent&existing=false');
  await page.click('#storyModeToggleOne');await page.click('#ctaForwardBtn');await page.click('#sceneTwoNextBtn');await page.click('#sceneTwoNextBtn');await page.click('#sceneTwoNextBtn');
  await page.click('[data-journey-step="4"]');await page.click('#sceneTwoNextBtn');await page.click('#sceneTwoNextBtn');
  await page.locator('#boosterPage').waitFor({state:'visible'});
 };
 try {
  for(const [width,height] of [[320,480],[320,568],[360,640],[390,844],[430,932],[844,390],[1440,900]]){
   const page=await browser.newPage({viewport:{width,height},reducedMotion:width===320?'reduce':'no-preference'});
   await page.route(/https:\/\/fonts\.(googleapis|gstatic)\.com\//,route=>route.abort());
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(()=>{
    window.boosterUtterances=[];window.boosterSpeech={paused:false,cancelled:0};
    window.SpeechSynthesisUtterance=function(text){this.text=text;};
    Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{getVoices:()=>[{lang:'hi-IN',name:'Test Hindi'}],speak:u=>{window.boosterUtterances.push(u);window.boosterSpeech.paused=false;},cancel:()=>{window.boosterSpeech.cancelled++;},pause:()=>{window.boosterSpeech.paused=true;},resume:()=>{window.boosterSpeech.paused=false;}}});
   });
   await enter(page);
   assert.equal(await page.locator('#storyStageCounter').innerText(),'6 / 6');
   assert.equal(await page.locator('#boosterPage select,#boosterPage input').count(),0);
   assert.match(await page.locator('.booster-hero').innerText(),/17.*7,00,000/s);
   const expected='₹'+Math.round(700000*Math.pow(1.0578,8)).toLocaleString('en-IN');
   assert.equal(await page.locator('#boosterProjectedValue').innerText(),expected);
   assert.match(await page.locator('.booster-rate-note').innerText(),/2026.*2027/s);
   assert.match(await page.locator('.booster-rate-note').innerText(),/example.*future rate/s);
   assert.equal(await page.locator('#boosterPage').getAttribute('data-phase'),'due');
   const stale=await page.evaluate(()=>{window.staleBooster=window.boosterUtterances.at(-1);window.staleBooster.onend();return window.boosterUtterances.length;});
   assert.equal(stale,2);assert.equal(await page.locator('#boosterPage').getAttribute('data-phase'),'grow');
   await page.click('#boosterPlayPause');assert.equal(await page.evaluate(()=>window.boosterSpeech.paused),true);
   assert.equal(await page.locator('#boosterPage').getAttribute('data-paused'),'true');
   if(width===390)await page.evaluate(()=>window.boosterUtterances.at(-1).onend());
   await page.click('#boosterPlayPause');assert.equal(await page.evaluate(()=>window.boosterSpeech.paused),false);
   if(width!==390)await page.evaluate(()=>window.boosterUtterances.at(-1).onend());
   assert.equal(await page.locator('#boosterPage').getAttribute('data-phase'),'finish');
   await page.evaluate(()=>window.boosterUtterances.at(-1).onend());
   assert.equal(await page.locator('#boosterPage').getAttribute('data-complete'),'true');
   if([320,390,1440].includes(width)) {
    if(width!==320)await page.locator('#boosterPage').screenshot({path:`${out}/${width}x${height}-content.png`});
    await page.locator('.booster-chart').screenshot({path:`${out}/${width}x${height}-chart.png`});
    await page.locator('#stagePreviewModal').evaluate(el=>el.scrollTop=0);await page.screenshot({path:`${out}/${width}x${height}-top.png`});
   }
   await page.locator('.booster-conditions summary').click();assert.match(await page.locator('.booster-conditions').innerText(),/3 महीने/);
   const geometry=await page.locator('#boosterPage').evaluate(root=>{
    const b=root.getBoundingClientRect();return {scroll:document.documentElement.scrollWidth,width:innerWidth,within:[...root.querySelectorAll('article,figure')].every(el=>{const r=el.getBoundingClientRect();return r.x>=b.x-.5&&r.right<=b.right+.5;})};
   });assert.ok(geometry.scroll<=geometry.width&&geometry.within);
   for(const selector of ['#boosterPlayPause','#sceneTwoNextBtn','#previewDismissBtn']) {
    await page.locator(selector).scrollIntoViewIfNeeded();const b=await page.locator(selector).boundingBox();assert.ok(b.y>=0&&b.y+b.height<=height+1&&b.height>=44);
   }
   await page.click('#sceneTwoNextBtn');assert.equal(await page.locator('#boosterPage').getAttribute('data-phase'),'due');
   await page.evaluate(()=>window.staleBooster.onend());assert.equal(await page.locator('#boosterPage').getAttribute('data-phase'),'due');
   await page.click('#previewDismissBtn');assert.equal(await page.locator('#storyStageCounter').innerText(),'5 / 6');
   assert.equal(await page.locator('#planJourneyPage').getAttribute('data-complete'),'true');
   assert.match(await page.locator('#journeyStageBody4').innerText(),/19,15,096/);
   assert.ok(await page.evaluate(()=>window.boosterSpeech.cancelled)>0);
   await page.click('#sceneTwoNextBtn');assert.equal(await page.locator('#boosterPage').getAttribute('data-phase'),'due');
   assert.deepEqual(errors,[]);console.log(`PASS booster ${width}x${height}: selected amounts, labelled assumptions, phases, voice lifecycle, replay, Back, touch controls and bounds`);await page.close();
  }
  const fallback=await browser.newPage({viewport:{width:390,height:844}});
  await fallback.route(/https:\/\/fonts\.(googleapis|gstatic)\.com\//,route=>route.abort());
  await fallback.addInitScript(()=>Object.defineProperty(window,'speechSynthesis',{value:undefined}));
  await fallback.clock.install();await enter(fallback);
  assert.match(await fallback.locator('#boosterVoiceStatus').innerText(),/unavailable/);
  await fallback.clock.fastForward(2800);assert.equal(await fallback.locator('#boosterPage').getAttribute('data-phase'),'grow');
  await fallback.click('#boosterPlayPause');await fallback.clock.fastForward(10000);assert.equal(await fallback.locator('#boosterPage').getAttribute('data-phase'),'grow');
  await fallback.click('#boosterPlayPause');await fallback.clock.fastForward(4700);assert.equal(await fallback.locator('#boosterPage').getAttribute('data-phase'),'finish');
  await fallback.clock.fastForward(6000);assert.equal(await fallback.locator('#boosterPage').getAttribute('data-complete'),'true');
  await fallback.close();console.log('PASS voice-unavailable animation, pause/resume and completion');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
