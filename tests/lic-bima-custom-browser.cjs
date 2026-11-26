const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const root=process.cwd(),out='.test-output/lic-bima-custom';fs.mkdirSync(out,{recursive:true});
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
 try {
  for(const [width,height] of [[320,480],[360,640],[390,844],[430,932],[844,390],[1440,900]]){
   const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});
   await page.route(/https:\/\/fonts\.(googleapis|gstatic)\.com\//,route=>route.abort());
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(base+'/lic/bima-platinum/');
   await page.click('#storyModeToggleOne');await page.click('#ctaForwardBtn');await page.click('#sceneTwoNextBtn');await page.click('#sceneTwoNextBtn');
   await page.fill('#policyExampleBsa','500000');await page.selectOption('#policyExampleMode','monthly');
   assert.match(await page.locator('#policyPremiumPreview').innerText(),/4,624.*month/);
   await page.selectOption('#policyExampleChannel','online');await page.check('#policyExampleExisting');
   if([320,390,1440].includes(width))await page.locator('#policyExampleSelection').screenshot({path:`${out}/${width}-profile.png`});
   await page.fill('#policyExampleBsa','305000');assert.equal(await page.locator('#sceneTwoNextBtn').isDisabled(),true);
   assert.equal(await page.locator('#policyPremiumPreview').innerText(),'');assert.equal(await page.locator('#policyCalculatorLink').isVisible(),false);
   await page.fill('#policyExampleBsa','500000');
   const calcUrl=new URL(await page.locator('#policyCalculatorLink').getAttribute('href'),page.url()).href;
   await page.click('#sceneTwoNextBtn');
   assert.equal(await page.locator('#policyExampleSelection').isVisible(),false);
   assert.match(await page.locator('#journeyStageBody0').innerText(),/4,624\/month/);
   await page.click('[data-journey-step="1"]');assert.match(await page.locator('#journeyStageBody1').innerText(),/6,42,789/);
   await page.click('[data-journey-step="2"]');assert.match(await page.locator('#journeyStageBody2').innerText(),/50,000/);
   await page.click('[data-journey-step="3"]');assert.match(await page.locator('#journeyStageBody3').innerText(),/3,50,000.*20/);
   await page.click('[data-journey-step="4"]');assert.match(await page.locator('#journeyStageBody4').innerText(),/30.*11,42,789/);
   assert.match(await page.locator('.benefit-journey-legend').innerText(),/4,624\/mo/);
   assert.match(await page.locator('.benefit-journey-legend').innerText(),/11,42,789/);
   if([320,390,1440].includes(width))await page.locator('.journey-financial-panel').screenshot({path:`${out}/${width}-custom-journey.png`});
   await page.click('#previewDismissBtn');assert.equal(await page.locator('#policyExampleBsa').inputValue(),'500000');assert.equal(await page.locator('#policyExampleMode').inputValue(),'monthly');
   await page.goto(calcUrl);assert.match(await page.locator('#benefitSummary').innerText(),/11,42,789/);
   assert.match(await page.locator('#benefitSummary').innerText(),/8,32,320/);
   assert.equal(await page.locator('#cashflowRows tr').count(),30);
   assert.match(await page.locator('#cashflowRows tr').nth(14).innerText(),/50,000/);
   assert.match(await page.locator('#cashflowRows tr').nth(19).innerText(),/3,50,000/);
   assert.match(await page.locator('#cashflowRows tr').last().innerText(),/11,42,789/);
   if([320,390,1440].includes(width))await page.screenshot({path:`${out}/${width}-calculator.png`,fullPage:true});
   await page.fill('#policyExampleBsa','');assert.equal(await page.locator('#policyResults').isVisible(),false);assert.equal(await page.locator('#cashflowRows tr').count(),0);
   await page.fill('#policyExampleBsa','750000');await page.selectOption('#policyExampleAge','34');await page.selectOption('#policyExamplePpt','12');await page.selectOption('#policyExampleTerm','27');
   assert.equal(await page.locator('#cashflowRows tr').count(),27);
   await page.click('#presentationLink');
   await page.click('#storyModeToggleOne');await page.click('#ctaForwardBtn');await page.click('#sceneTwoNextBtn');await page.click('#sceneTwoNextBtn');
   for(const [field,value] of [['Bsa','750000'],['Age','34'],['Ppt','12'],['Term','27'],['Mode','monthly'],['Channel','online']])assert.equal(await page.locator('#policyExample'+field).inputValue(),value);
   await page.fill('#policyExampleBsa','10000000');await page.click('#sceneTwoNextBtn');await page.click('[data-journey-step="4"]');
   assert.ok(await page.locator('.benefit-journey-legend').evaluate(el=>el.scrollWidth<=el.clientWidth),'Large rupee amounts stay within the graph');
   await page.click('#previewDismissBtn');
   await page.selectOption('#policyExampleAge','55');
   assert.deepEqual(await page.locator('#policyExamplePpt option').evaluateAll(els=>els.map(el=>el.value)),['7','10']);
   assert.deepEqual(await page.locator('#policyExampleTerm option').evaluateAll(els=>els.map(el=>el.value)),['17','18','19','20']);
   await page.selectOption('#policyExampleAge','0');
   assert.deepEqual(await page.locator('#policyExamplePpt option').evaluateAll(els=>els.map(el=>el.value)),['18']);
   assert.equal(await page.locator('#policyExampleTerm').inputValue(),'28');
   assert.equal(await page.locator('#policyExampleChannel').inputValue(),'agent');
   const geometry=await page.locator('#policyExampleSelection').evaluate(host=>{
    const r=host.getBoundingClientRect();return {width:document.documentElement.scrollWidth,viewport:innerWidth,within:[...host.querySelectorAll('input,select')].every(e=>{const b=e.getBoundingClientRect();return b.left>=r.left&&b.right<=r.right+1&&b.height>=20;})};
   });
   assert.equal(geometry.within,true);assert.ok(geometry.width<=geometry.viewport);
   assert.deepEqual(errors,[]);console.log(`PASS custom ${width}x${height}: rates, incentives, all benefits, validation, links, valid options and carry-forward`);await page.close();
  }
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
