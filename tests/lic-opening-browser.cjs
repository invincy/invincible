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
  if(!process.env.LIC_LAYOUT_ONLY) for(const [width,height] of [[320,568],[360,640],[390,844],[320,480],[1440,900]]) {
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
    await page.waitForFunction(()=>document.querySelector('#storyChart').dataset.playback==='playing');
    await page.evaluate(()=>{window.testAudios.at(-1).playbackRate=.25;});
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
    // Floating audio may share vertical space with the graph, at its clear right edge.
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
  // Audio placement may change later-page layout; product sections stay identical.
  const before=execFileSync('git',['show',`${process.env.LIC_BASELINE_REF || 'origin/master'}:lic/bima-platinum/index.html`],{encoding:'utf8'});
  const after=fs.readFileSync('lic/bima-platinum/index.html','utf8');
  for(const id of ['productReveal','planDetailsPage','planJourneyPage']) {
   const re=new RegExp(`<section id="${id}"[\\s\\S]*?</section>`);
   assert.equal(after.match(re)?.[0].replace(/\r\n/g,'\n'),before.match(re)?.[0].replace(/\r\n/g,'\n'),id);
  }
  console.log('Page 4–6 product sections are unchanged.');
  // Deterministic media states exercise layout during loading and failures too.
  for(const [width,height] of [[320,480],[320,568],[360,640],[390,844],[1440,900]]) {
   const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
   await page.addInitScript(()=>{
    window.testAudios=[];
    window.Audio=class extends EventTarget {
     constructor(src){super();this.src=src;this.duration=8;this.currentTime=0;this.paused=true;this.ended=false;window.testAudios.push(this);}
     play(){
      this.ended=false;
      if(window.testDeny) return Promise.reject(Object.assign(new Error('blocked'),{name:'NotAllowedError'}));
      return new Promise(resolve=>{this.start=()=>{this.paused=false;this.dispatchEvent(new Event('playing'));resolve();};});
     }
     pause(){this.paused=true;this.dispatchEvent(new Event('pause'));}
    };
   });
   await page.goto(`${base}/lic/bima-platinum/`);
   await page.evaluate(()=>document.fonts.ready);
   const measure=async(step)=>page.evaluate(step=>{
    const audio=document.querySelector(step===1?'#advisorAudioBtn':step===6?'#journeyPlayPause':'#sceneTwoDialogueBtn');
    const next=document.querySelector(step===1?'#ctaForwardBtn':'#sceneTwoNextBtn');
    const a=audio.getBoundingClientRect(),n=next.getBoundingClientRect();
    const visible=r=>r.x>=0&&r.y>=0&&r.right<=innerWidth+.5&&r.bottom<=innerHeight+.5;
    const hit=e=>{const r=e.getBoundingClientRect(),h=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return e===h||e.contains(h);};
    const container=step===1?document.querySelector('#stageContainer'):document.querySelector('#stagePreviewModal');
    const protectedSelectors=step===5?'.income-timeline':step===6?'.journey-track,.journey-detail':step<=3?'#storyChart .scenario-legend':'.reveal-product-copy,.reveal-credentials';
    const clear=[...document.querySelectorAll(protectedSelectors)].every(e=>{const r=e.getBoundingClientRect();return a.right<=r.left||a.left>=r.right||a.bottom<=r.top||a.top>=r.bottom;});
    return {audio:{x:a.x,y:a.y,width:a.width,height:a.height},next:{x:n.x,y:n.y,width:n.width,height:n.height},visible:visible(a)&&visible(n),hit:hit(audio)&&hit(next),clear,separate:a.bottom<=n.top,overflow:container.scrollHeight-container.clientHeight,pageOverflow:document.documentElement.scrollHeight-innerHeight,icon:audio.querySelector('.advisor-audio-icon')?.textContent};
   },step);
   for(let step=1;step<=6;step++) {
    if(step>1) await page.click(step===2?'#ctaForwardBtn':'#sceneTwoNextBtn');
    await page.evaluate(()=>document.fonts.ready);
    await page.locator(step===1?'#stageContainer':'#stagePreviewModal').evaluate(el=>Promise.all(el.getAnimations().map(a=>a.finished.catch(()=>{}))));
    if(step===6) await page.waitForFunction(()=>window.testAudios.at(-1).src.includes('page6-step1'));
    const selector=step===1?'#advisorAudioBtn':step===6?'#journeyPlayPause':'#sceneTwoDialogueBtn';
    const initial=await measure(step);
    const check=async(state)=>{
     const m=await measure(step);
     assert.equal(m.audio.width,44);assert.equal(m.audio.height,44);
     assert.ok(m.visible&&m.hit&&m.clear&&m.separate&&m.overflow<=1&&m.pageOverflow<=1,JSON.stringify({width,height,step,state,m}));
     for(const target of ['audio','next']) for(const key of ['x','y','width','height']) {
      assert.ok(Math.abs(m[target][key]-initial[target][key])<=1,`${target} ${key} moved: ${width}x${height} page ${step} ${state}`);
     }
     return m;
    };
    await check('loading');
    await page.evaluate(()=>window.testAudios.at(-1).start());
    await page.waitForFunction(selector=>document.querySelector(selector).getAttribute('aria-pressed')==='true',selector);
    assert.equal((await check('playing')).icon,'⏸');
    await page.click(selector);
    assert.equal((await check('paused')).icon,'▶');
    await page.click(selector);await page.evaluate(()=>window.testAudios.at(-1).start());
    await check('resumed');
    if(step<6) {
     await page.evaluate(()=>{const a=window.testAudios.at(-1);a.ended=true;a.currentTime=a.duration;a.dispatchEvent(new Event('ended'));});
     assert.equal((await check('completed')).icon,'▶');
     await page.evaluate(()=>{window.testDeny=true;});await page.click(selector);
     await page.waitForFunction(()=>document.querySelector('#audioStatus').textContent||document.querySelector('#sceneTwoAudioStatus').textContent);
     await check('autoplay denied');
     await page.evaluate(()=>{window.testDeny=false;});await page.click(selector);await page.evaluate(()=>window.testAudios.at(-1).start());
     await page.evaluate(()=>window.testAudios.at(-1).dispatchEvent(new Event('error')));
     await check('error');
    }
    await page.screenshot({path:`${out}/${width}x${height}-floating-page${step}.png`});
    console.log(`Fixed audio/Next layout: ${width}x${height} page ${step}`);
   }
   await page.close();
  }
  // Reproduce a phone/WebView whose layout viewport remains taller than its
  // visible screen. CSS vh/dvh alone cannot catch this mismatch.
  const mobile=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
  await mobile.addInitScript(()=>{
   window.viewportMock=Object.assign(new EventTarget(),{height:760,width:390,offsetTop:24,offsetLeft:0,scale:1});
   Object.defineProperty(window,'visualViewport',{get:()=>window.viewportMock});
  });
  await mobile.goto(`${base}/lic/bima-platinum/`);
  await mobile.evaluate(()=>document.fonts.ready);
  for(let step=1;step<=6;step++) {
   if(step>1) await mobile.click(step===2?'#ctaForwardBtn':'#sceneTwoNextBtn');
   await mobile.locator(step===1?'#stageContainer':'#stagePreviewModal').evaluate(el=>Promise.all(el.getAnimations().map(a=>a.finished.catch(()=>{}))));
   for(const [height,offsetTop,event] of [[760,24,'resize'],[640,12,'resize'],[480,0,'resize'],[760,32,'scroll']]) {
    await mobile.evaluate(({height,offsetTop,event})=>{Object.assign(window.viewportMock,{height,offsetTop});window.viewportMock.dispatchEvent(new Event(event));},{height,offsetTop,event});
    const visible=await mobile.evaluate(step=>{
     const v=window.viewportMock,frame=document.querySelector('#deviceFrame').getBoundingClientRect();
     const controls=[step===1?'#ctaForwardBtn':'#sceneTwoNextBtn',step===1?'#advisorAudioBtn':step===6?'#journeyPlayPause':'#sceneTwoDialogueBtn'];
     const bounds=controls.map(selector=>{const e=document.querySelector(selector),r=e.getBoundingClientRect();return {selector,top:r.top,bottom:r.bottom,height:r.height};});
     const container=step===1?document.querySelector('#stageContainer'):document.querySelector('#stagePreviewModal');
     return {frame:{top:frame.top,height:frame.height,bottom:frame.bottom},bounds,bottom:v.offsetTop+v.height,top:v.offsetTop,overflow:container.scrollHeight-container.clientHeight};
    },step);
    assert.equal(visible.frame.height,height);assert.equal(visible.frame.top,offsetTop);
    assert.ok(visible.bounds.every(r=>r.top>=visible.top&&r.bottom<=visible.bottom-6),JSON.stringify({step,height,offsetTop,visible}));
    assert.ok(visible.overflow<=1,JSON.stringify({step,height,offsetTop,visible}));
    await mobile.screenshot({path:`${out}/visible-${height}-${offsetTop}-page${step}.png`});
   }
  }
  await mobile.mouse.wheel(0,500);
  assert.equal(await mobile.evaluate(()=>window.scrollY),0);
  await mobile.close();console.log('All six pages fit mismatched and changing visible phone viewports.');
 } finally {await browser.close();if(server) await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1;});
