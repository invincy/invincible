const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const root=process.cwd(),out='.test-output/lic-jeevan-lakshya';fs.mkdirSync(out,{recursive:true});
const server=http.createServer((req,res)=>{const u=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/invincible\//,'/');const f=path.resolve(root,'.'+u+(u.endsWith('/')?'index.html':''));if(!f.startsWith(root+path.sep)||!fs.existsSync(f)){res.writeHead(404).end();return;}res.setHeader('Content-Type',({'.html':'text/html','.css':'text/css','.js':'text/javascript','.mjs':'text/javascript','.png':'image/png','.svg':'image/svg+xml'})[path.extname(f)]||'application/octet-stream');fs.createReadStream(f).pipe(res);});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}/invincible`;const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE||(process.platform==='win32'?'C:/Program Files/Google/Chrome/Application/chrome.exe':undefined)});
try{
for(const [w,h] of [[320,480],[390,844],[844,390],[1440,900]]){
const page=await browser.newPage({viewport:{width:w,height:h},reducedMotion:'reduce'});const errors=[],missing=[];page.on('pageerror',e=>{errors.push(e.message);console.error('PAGE ERROR',e.message);});page.on('response',r=>{if(r.url().startsWith(base)&&r.status()===404)missing.push(r.url());});
await page.goto(base+'/lic/');await page.getByRole('heading',{name:'Plans',exact:true}).click();
await page.getByRole('link',{name:'Open Jeevan Lakshya presentation',exact:true}).click();
await page.waitForFunction(()=>document.querySelector('#stageContainer').dataset.ready==='true');
assert.equal(await page.locator('#storyModeToggle').getAttribute('aria-pressed'),'false');
assert.equal(await page.locator('#inspectorFab').isVisible(),false);
await page.locator('[data-goal="career"]').click();
for(let n=1;n<=5;n++){
assert.equal(await page.locator('.stage-counter-text').innerText(),`${n} / 5`);
const geometry=await page.evaluate(()=>{const r=s=>{const b=document.querySelector(s).getBoundingClientRect();return {top:b.top,bottom:b.bottom,right:b.right};};return {headline:r('#layerHeadline'),audio:r('#layerAdvisorAudio'),body:r('#sceneStageContent'),footer:r('#stageFooter'),width:innerWidth,scroll:document.documentElement.scrollWidth,height:innerHeight};});
assert.ok(geometry.body.bottom-geometry.body.top>=100,'Scene has usable reading space');assert.ok(geometry.headline.top>=0,'Headline within viewport');assert.ok(geometry.headline.bottom<=geometry.audio.top+1,'Headline clears audio');assert.ok(geometry.audio.bottom<=geometry.body.top+1,'Audio clears body');assert.ok(geometry.body.bottom<=geometry.footer.top+1,'Body clears footer');assert.ok(geometry.footer.bottom<=geometry.height+1,'Footer within viewport');assert.ok(geometry.scroll<=geometry.width,'No page overflow');
await page.screenshot({path:`${out}/${w}x${h}-scene${n}.png`});
if(n<5)await page.locator('#ctaNextBtn').click();
}
await page.locator('[data-age="50"]').click();assert.equal(await page.locator('[data-term="25"]').isDisabled(),true);assert.equal(await page.locator('[data-term="20"]').isDisabled(),true);
await page.locator('[data-sa="200000"]').click();assert.equal(await page.locator('#liveAnnualPremium').innerText(),'₹18,698');
await page.locator('#ctaPrevBtn').click();assert.equal(await page.locator('.stage-counter-text').innerText(),'4 / 5');await page.locator('#ctaNextBtn').click();
await page.locator('#ctaNextBtn').click();
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
assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);await page.close();console.log(`PASS ${w}x${h}: navigation, five scenes, profile transfer, eligibility, bonus separation, death timing and validation`);
}
// Auto progression without speech support; callback cancellation covered by stub.
const page=await browser.newPage();await page.addInitScript(()=>{Object.defineProperty(window,'speechSynthesis',{value:{getVoices:()=>[],cancel(){},speak(u){window.lastUtterance=u;}}});});await page.goto(base+'/lic/jeevan-lakshya/');await page.locator('#storyModeToggle').click();await page.evaluate(()=>window.lastUtterance.onend());await page.waitForFunction(()=>document.querySelector('.stage-counter-text').textContent==='2 / 5');await page.locator('#storyModeToggle').click();await page.evaluate(()=>window.lastUtterance.onend());await page.waitForTimeout(2000);assert.equal(await page.locator('.stage-counter-text').innerText(),'2 / 5');await page.close();console.log('PASS narration completion and stale callback cancellation');
}finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
