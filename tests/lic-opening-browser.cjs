const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {execFileSync}=require('node:child_process');
const http=require('node:http');
const path=require('node:path');
let base=process.env.LIC_PREVIEW_URL;
const windowsChrome='C:/Program Files/Google/Chrome/Application/chrome.exe';
const executablePath=process.env.CHROMIUM_EXECUTABLE || (fs.existsSync(windowsChrome)?windowsChrome:chromium.executablePath());
const out='.test-output/lic-opening';
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const server=base?null:http.createServer((req,res)=>{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/invincible\//,'/');
  const file=path.resolve(process.cwd(),'.'+pathname+(pathname.endsWith('/')?'index.html':''));
  if(!file.startsWith(process.cwd()+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
  const size=fs.statSync(file).size;
  const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.mp3':'audio/mpeg','.webp':'image/webp','.svg':'image/svg+xml'};
  const headers={'Content-Type':types[path.extname(file)]||'application/octet-stream','Accept-Ranges':'bytes'};
  const range=req.headers.range?.match(/bytes=(\d+)-(\d*)/);
  const start=range?Number(range[1]):0,end=range&&range[2]?Math.min(Number(range[2]),size-1):size-1;
  if(range) headers['Content-Range']=`bytes ${start}-${end}/${size}`;
  headers['Content-Length']=end-start+1;
  res.writeHead(range?206:200,headers);fs.createReadStream(file,{start,end}).pipe(res);
 });
 if(server){await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));base=`http://127.0.0.1:${server.address().port}`;}
 const browser=await chromium.launch({headless:true,executablePath,args:['--autoplay-policy=no-user-gesture-required']});
 try {
  for(const [width,height] of [[320,568],[360,640],[390,844],[320,480],[1440,900]]) {
   const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
   const errors=[]; page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(()=>{
    const RealAudio=window.Audio;
    window.testAudios=[];
    window.Audio=function(...args){const audio=new RealAudio(...args);window.testAudios.push(audio);return audio;};
   });
   await page.goto(`${base}/lic/bima-platinum/`);
   const chart=await page.locator('#storyChart').elementHandle();
   for(let step=1;step<=3;step++) {
    if(step===2) await page.click('#ctaForwardBtn');
    if(step===3) await page.click('#sceneTwoNextBtn');
    await page.waitForFunction(()=>Number.isFinite(window.testAudios.at(-1)?.duration));
    const audio=await page.evaluate(step=>{
     const a=window.testAudios.at(-1);
     return {src:a.src,duration:a.duration,active:window.testAudios.filter(x=>!x.paused).length,oldReset:window.testAudios.slice(0,-1).every(x=>x.paused&&x.currentTime===0)};
    },step);
    assert.match(audio.src,new RegExp(`newpage${step}.mp3$`));
    assert.ok(audio.duration>5 && audio.duration<10);
    assert.equal(audio.active,1); assert.ok(audio.oldReset);
    assert.ok(await chart.evaluate(e=>e===document.querySelector('#storyChart')));
    // Seek to the middle, then pause: the media clock and drawn portion hold.
    await page.evaluate(()=>{const a=window.testAudios.at(-1);a.currentTime=a.duration*.55;});
    await page.waitForTimeout(80);
    const button=step===1?'#advisorAudioBtn':'#sceneTwoDialogueBtn';
    await page.click(button);
    await page.waitForFunction(()=>document.querySelector('#storyChart').dataset.playback==='paused');
    const reveal=await page.locator('#storyChart').evaluate(e=>Number(e.style.getPropertyValue('--narration-reveal')));
    await page.waitForTimeout(80);
    assert.equal(await page.locator('#storyChart').evaluate(e=>Number(e.style.getPropertyValue('--narration-reveal'))),reveal);
    assert.ok(reveal>0 && reveal<1);
    // A completed narration leaves the final state visible and replay starts over.
    await page.click(button);
    await page.evaluate(()=>{const a=window.testAudios.at(-1);a.currentTime=a.duration-.02;});
    await page.waitForFunction(()=>document.querySelector('#storyChart').dataset.playback==='idle');
    assert.equal(await page.locator('#storyChart').evaluate(e=>e.style.getPropertyValue('--narration-reveal')),'0');
    const geometry=await page.evaluate(step=>{
     const selectors=step===1?['#advisorAudioBtn','#ctaForwardBtn']:['#sceneTwoDialogueBtn','#sceneTwoNextBtn'];
     const controls=selectors.map(s=>{
      const e=document.querySelector(s),r=e.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);
      return {visible:r.x>=0&&r.y>=0&&r.right<=innerWidth+.5&&r.bottom<=innerHeight+.5,touch:r.height>=40,hit:e===hit||e.contains(hit)};
     });
     const plot=document.querySelector('.balance-plot').getBoundingClientRect();
     const chart=document.querySelector('#storyChart').getBoundingClientRect();
     const container=step===1?document.querySelector('#stageContainer'):document.querySelector('#stagePreviewModal');
     return {controls,plot:{width:plot.width,height:plot.height},chartBottom:chart.bottom,controlsTop:document.querySelector(selectors[0]).getBoundingClientRect().top,overflow:container.scrollHeight-container.clientHeight,pageOverflow:document.documentElement.scrollHeight-innerHeight};
    },step);
    assert.ok(geometry.controls.every(x=>x.visible&&x.touch&&x.hit),JSON.stringify({width,height,step,geometry}));
    assert.ok(geometry.chartBottom<geometry.controlsTop,JSON.stringify({width,height,step,geometry}));
    assert.ok(geometry.overflow<=1 && geometry.pageOverflow<=1,JSON.stringify({width,height,step,geometry}));
    if(step===3) {
     const visible=await page.locator('.scenario-line').evaluateAll(lines=>lines.map(e=>Number(getComputedStyle(e).opacity)));
     assert.ok(visible.every(n=>n>0));
     const legend=await page.locator('.platinum-label strong').innerText(); assert.equal(legend,'Stable Allocation');
    }
    await page.screenshot({path:`${out}/${width}x${height}-page${step}.png`});
    console.log(JSON.stringify({width,height,step,duration:audio.duration,geometry}));
   }
   await page.click('#sceneTwoDialogueBtn');
   assert.ok(await page.evaluate(()=>window.testAudios.at(-1).currentTime<1));
   await page.click('#previewDismissBtn');
   await page.waitForFunction(()=>window.testAudios.at(-1).src.endsWith('newpage2.mp3'));
   assert.ok(await page.evaluate(()=>window.testAudios.at(-1).currentTime<1));
   assert.deepEqual(errors,[]);
   await page.close();
  }
  // Compare later pages against the exact starting source, including shared audio.
  const snapshots=[];
  for(const baseline of [true,false]) {
   const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
   if(baseline) for(const file of ['index.html','presentation.css','presentation.js']) {
    const body=execFileSync('git',['show',`${process.env.LIC_BASELINE_REF || 'origin/master'}:lic/bima-platinum/${file}`]);
    await page.route(`**/lic/bima-platinum/${file==='index.html'?'':file}*`,route=>route.fulfill({body,contentType:file.endsWith('.css')?'text/css':file.endsWith('.js')?'text/javascript':'text/html'}));
   }
   await page.goto(`${base}/lic/bima-platinum/`);
   await page.click('#ctaForwardBtn'); await page.click('#sceneTwoNextBtn');
   const shots=[];
   for(let step=4;step<=6;step++) {
    await page.click('#sceneTwoNextBtn');
    await page.waitForTimeout(step===6?900:300);
    if(step===6) await page.click('#journeyPlayPause');
    await page.evaluate(()=>document.fonts.ready);
    shots.push(await page.screenshot({path:`${out}/${baseline?'baseline':'updated'}-page${step}.png`}));
   }
   snapshots.push(shots); await page.close();
  }
  snapshots[0].forEach((shot,i)=>assert.ok(shot.equals(snapshots[1][i]),`Page ${i+4} screenshot changed`));
  console.log('Pages 4–6 screenshots match baseline exactly.');
 } finally {await browser.close();if(server) await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1;});
