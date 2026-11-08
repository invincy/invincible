const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const root=process.cwd(),out='.test-output/lic-journey';fs.mkdirSync(out,{recursive:true});
const server=http.createServer((req,res)=>{
 const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/invincible\//,'/');
 const file=path.resolve(root,'.'+pathname+(pathname.endsWith('/')?'index.html':''));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end();return;}
 const size=fs.statSync(file).size,range=req.headers.range?.match(/bytes=(\d+)-(\d*)/),start=range?Number(range[1]):0,end=range&&range[2]?Math.min(Number(range[2]),size-1):size-1;
 const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.mp3':'audio/mpeg','.svg':'image/svg+xml','.webp':'image/webp'};
 const headers={'Content-Type':types[path.extname(file)]||'application/octet-stream','Content-Length':end-start+1,'Accept-Ranges':'bytes'};
 if(range)headers['Content-Range']=`bytes ${start}-${end}/${size}`;
 res.writeHead(range?206:200,headers);fs.createReadStream(file,{start,end}).pipe(res);
});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base=process.env.LIC_PREVIEW_URL||`http://127.0.0.1:${server.address().port}`;
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE||(process.platform==='win32'?'C:/Program Files/Google/Chrome/Application/chrome.exe':undefined),args:['--autoplay-policy=no-user-gesture-required']});
 try {
  for(const [width,height] of [[320,480],[320,568],[360,640],[390,844],[430,932],[844,390],[1440,900]]){
   const page=await browser.newPage({viewport:{width,height},reducedMotion:width===320?'reduce':'no-preference'});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(()=>{const RealAudio=window.Audio;window.testAudios=[];window.Audio=function(...args){const a=new RealAudio(...args);window.testAudios.push(a);return a;};});
   await page.goto(base+'/lic/bima-platinum/');
   await page.click('#storyModeToggleOne');
   await page.click('#ctaForwardBtn');await page.click('#sceneTwoNextBtn');await page.click('#sceneTwoNextBtn');
   const deadline=page.locator('.reveal-deadline');await deadline.waitFor({state:'visible'});
   assert.match(await deadline.innerText(),/31 March\s+2027/);assert.equal(await page.locator('.reveal-limited').count(),0);
   // The availability date stays in the product copy above the selection/footer.
   await page.waitForTimeout(1600); // Finish the date's entrance before measuring geometry.
   const dateBounds=await deadline.boundingBox(),supportBounds=await page.locator('.reveal-support').boundingBox(),selectionBounds=await page.locator('#policyExampleSelection').boundingBox();
   assert.ok(dateBounds.y>=supportBounds.y+supportBounds.height,`date overlaps benefit copy at ${width}x${height}`);
   assert.ok(dateBounds.y+dateBounds.height<=selectionBounds.y,`date overlaps selector/footer at ${width}x${height}`);
   if([320,390,1440].includes(width))await page.screenshot({path:`${out}/${width}x${height}-page4-deadline.png`});
   await page.selectOption('#policyExampleAge','35');await page.selectOption('#policyExamplePpt','7');
   await page.click('#sceneTwoNextBtn');
   assert.equal(await page.locator('#storyStageCounter').innerText(),'5 / 5');
   assert.equal(await page.locator('#policyExampleSelection').isVisible(),false);
   assert.equal(await page.locator('#planJourneyPage select, #planJourneyPage .journey-sample-options').count(),0);
   assert.equal(await page.locator('#journeyFinancialGraph svg').count(),1);
   assert.equal(await page.locator('#journeyFinancialGraph').getAttribute('data-ppt'),'7');
   assert.equal(await page.locator('#journeyFinancialGraph').getAttribute('data-age'),'35');
   assert.equal(await page.locator('.benefit-journey-heading,.benefit-journey-context,.benefit-journey-note').count(),0);
   await page.waitForFunction(()=>window.testAudios.at(-1).src.endsWith('page6-step1.mp3')&&Number.isFinite(window.testAudios.at(-1).duration));
   await page.evaluate(()=>window.testAudios.at(-1).playbackRate=.25);
   await page.click('#journeyPlayPause');
   assert.equal(await page.evaluate(()=>window.testAudios.at(-1).paused),true);
   await page.click('#journeyPlayPause');
   for(let stage=0;stage<5;stage++) {
    if(stage) await page.evaluate(()=>{const a=window.testAudios.at(-1);a.currentTime=a.duration-.05;});
    await page.waitForFunction(stage=>document.querySelector('#journeyFinancialGraph').dataset.stage===String(stage),stage);
    await page.waitForFunction(stage=>window.testAudios.at(-1).src.endsWith(`page6-step${stage+1}.mp3`)&&Number.isFinite(window.testAudios.at(-1).duration)&&!window.testAudios.at(-1).paused,stage);
    assert.equal(await page.locator('.journey-stage[aria-expanded="true"]').count(),1);
    assert.equal(await page.locator('.journey-path').count(),[1,1,2,3,4][stage],'Additions use the premium phase');
    assert.equal(await page.locator('.premium-in').count(),3);
    assert.equal(await page.locator('.income-out').count(),stage>=2?3:0);
    assert.ok(await page.locator('.journey-cash-arrow').evaluateAll(arrows=>arrows.every(el=>{
     const from=el.getPointAtLength(0).y,to=el.getPointAtLength(el.getTotalLength()).y;
     return el.classList.contains('premium-in')?to>from:to<from;
    })),'Premium arrows point down; income arrows point up');
    if(stage<=1) assert.equal(await page.locator('.journey-axis').getAttribute('d'),'M24 220H185');
    assert.equal(await page.locator('.journey-money').count(),stage+1,'Only reached money illustrations exist');
    assert.equal(await page.locator('.benefit-journey-legend > div').count(),stage+1,'No future amounts shown');
    assert.equal((await page.locator('#journeyFinancialGraph').innerText()).includes('Maturity'),stage===4);
    if(width===320) assert.equal(await page.locator('.journey-reveal').evaluate(el=>getComputedStyle(el).animationName),'none');
    assert.equal(await page.locator('.benefit-journey-legend > .is-current').count(),1);
    const bounds=await page.evaluate(()=>{
     const box=s=>{const r=document.querySelector(s).getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height};};
     return {upper:box('.journey-upper'),stages:box('.journey-stages'),chart:box('.journey-financial-panel'),footer:box('.scene-two-footer'),svg:box('.financial-journey-svg'),shell:box('#stagePreviewModal'),scroll:document.documentElement.scrollWidth,window:innerWidth};
    });
    if(bounds.stages.bottom>bounds.chart.y){console.log(bounds);await page.screenshot({path:out+'/failure.png'});}
    assert.ok(bounds.chart.y>=bounds.upper.bottom-1,'Chart follows upper section');
    assert.ok(bounds.stages.bottom<=bounds.chart.y,'Accordion clears graph');
    assert.ok(bounds.chart.bottom<=bounds.footer.y+1,'Graph clears footer');
    assert.ok(bounds.svg.width>250&&bounds.svg.height>110,'Chart is prominent');
    assert.ok(bounds.scroll<=bounds.window,'No horizontal page overflow');
    assert.ok(bounds.chart.x>=bounds.shell.x-1&&bounds.chart.right<=bounds.shell.right+1,'Card within shell');
    assert.ok(bounds.chart.width>=bounds.shell.width-26,'Chart fills the available mobile width');
    if([390,1440,320].includes(width)){await page.waitForTimeout(750);await page.locator('.journey-financial-panel').screenshot({path:`${out}/${width}x${height}-stage${stage+1}.png`});}
    if(stage===0&&[390,1440,320].includes(width)){await page.locator('#stagePreviewModal').evaluate(el=>el.scrollTop=0);await page.screenshot({path:`${out}/${width}x${height}-upper.png`});await page.locator('.journey-financial-panel').screenshot({path:`${out}/${width}x${height}-chart.png`});}
   }
   await page.evaluate(()=>{const a=window.testAudios.at(-1);a.currentTime=a.duration-.05;});
   await page.waitForFunction(()=>document.querySelector('#planJourneyPage').dataset.complete==='true');
   assert.equal(await page.locator('#storyNextLabel').innerText(),'Replay journey');
   assert.equal(await page.locator('.journey-reveal').evaluate(el=>el.getBBox().width),600,'Completion retains the entire revealed journey');
   assert.equal(await page.locator('.journey-money.is-current').evaluate(el=>getComputedStyle(el).opacity),'1','Completed maturity illustration remains visible');
   await page.click('#sceneTwoNextBtn');await page.waitForFunction(()=>document.querySelector('#journeyFinancialGraph').dataset.stage==='0');
   assert.equal(await page.locator('.journey-path').count(),1,'Replay resets the extent');
   assert.ok(await page.locator('.journey-reveal').evaluate(el=>el.getBBox().width<=205),'Replay clears the completed extension');
   await page.click('[data-journey-step="3"]');
   assert.equal(await page.locator('.journey-path').count(),3);
   await page.click('[data-journey-step="1"]');
   assert.equal(await page.locator('.journey-path').count(),1,'Selecting additions returns to the premium period');
   await page.click('#previewDismissBtn');
   assert.equal(await page.locator('#policyExampleAge').inputValue(),'35');assert.equal(await page.locator('#policyExamplePpt').inputValue(),'7');
   assert.equal(await page.evaluate(()=>window.testAudios.at(-1).paused),false,'Page 4 recording starts');
   await page.click('#sceneTwoNextBtn');assert.match(await page.locator('#journeyStageBody0').innerText(),/87,495/);
   assert.deepEqual(errors,[]);console.log(`PASS ${width}x${height}: all stages, real audio endings, selection, replay, Back and bounds`);
   await page.close();
  }
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
