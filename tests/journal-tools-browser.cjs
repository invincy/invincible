// Controlled UI using the exact settings bridge and stroke renderer from the active Journal bundle.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright'),root=path.resolve(__dirname,'..');
const bundle=fs.readFileSync(path.join(root,'journal/assets/journal-v11.js'),'utf8');
const start=bundle.indexOf('window.__journalApi={'),bridge=bundle.slice(start,bundle.indexOf(';return T.jsxs',start));
const renderStart=bundle.indexOf('dh='),renderer=bundle.slice(renderStart,bundle.indexOf(';function d_()',renderStart));
assert.ok(bridge.includes('setSettings:')&&renderer.startsWith('dh='));
const pageSource=fs.readFileSync(path.join(root,'journal/index.html'),'utf8'),guardStart=pageSource.indexOf('(function journalInputGuard()'),guard=pageSource.slice(guardStart,pageSource.indexOf('})();',guardStart)+5);
const setup=`let t={uid:'fixture'},u='2026-10-26';const Et={current:false},c=z=>u=z,uh=async()=>({}),ch=async()=>t,Oy=(_, ...parts)=>parts.join('/'),lx=async(path,record)=>{if(window.failIdea)throw Error('denied');localStorage.setItem(path,JSON.stringify(record));};
let d='pen',m='#000000',k=2,x=18,v=1,j='stroke',_=28;const Ut=[];
const A=z=>m=z,P=z=>k=z,w=z=>x=z,y=z=>v=z,E=z=>j=z,I=z=>_=z,L=()=>{};
const p=z=>{d=z;document.querySelectorAll('[data-native-tool]').forEach(b=>b.classList.toggle('active',b.dataset.nativeTool===z));};
const Ft={current:document.querySelector('.canvas-container')},fe={current:document.querySelector('#base-canvas')},de={current:document.querySelector('#live-canvas')};
const M2=(a,b)=>({x:(a.x+b.x)/2,y:(a.y+b.y)/2});let ${renderer};
const ac=()=>{const ctx=fe.current.getContext('2d');ctx.clearRect(0,0,fe.current.width,fe.current.height);Ut.forEach(stroke=>window.__journalApi.render(ctx,stroke));};
const Ci=stroke=>{const old=Ut.findIndex(item=>item.id===stroke.id);if(old>=0)Ut[old]=stroke;else Ut.push(stroke);ac();};const Ve=id=>{const index=Ut.findIndex(item=>item.id===id);if(index>=0)Ut.splice(index,1);ac();};
${bridge};
const resizeCanvas=()=>{for(const canvas of [fe.current,de.current]){canvas.width=Ft.current.clientWidth;canvas.height=400;canvas.style.width=Ft.current.clientWidth+'px';canvas.style.height='400px';}ac();};resizeCanvas();window.addEventListener('resize',resizeCanvas);
window.drawSample=()=>{const settings=window.__journalApi.settings(),tool=window.__journalApi.tool();Ci({id:crypto.randomUUID(),tool,color:settings.color,opacity:tool==='eraser'?1:settings.opacity,width:tool==='eraser'?settings.eraserWidth:tool==='highlighter'?settings.highlighterWidth:settings.penWidth,points:[{x:100,y:100},{x:300,y:100}]});};
window.pixel=()=>Array.from(fe.current.getContext('2d').getImageData(200,100,1,1).data);`;
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost').pathname;
 if(url==='/'){res.setHeader('Content-Type','text/html; charset=utf-8');res.end(`<!doctype html><meta name="viewport" content="width=device-width"><link rel="stylesheet" href="/journal/drawing-tools.css"><link rel="stylesheet" href="/journal/canvas-workspace.css"><body class="journal-page"><div class="toolbar"><div>${['Pen','Highlighter','Eraser'].map(label=>`<div class="icon-btn" role="button" tabindex="0" title="${label}" data-native-tool="${label.toLowerCase()}"><svg/></div>`).join('')}</div><div></div><div>0 strokes</div><div><div class="icon-btn" role="button" title="Undo"><svg/></div><div class="icon-btn" role="button" title="Redo"><svg/></div></div></div><div class="canvas-container" style="position:relative;height:400px;background:white"><canvas id="base-canvas" width="600" height="400"></canvas><canvas id="live-canvas" width="600" height="400" style="position:absolute;inset:0"></canvas></div><script>${setup}</script><script>${guard}</script><script src="/journal/advanced-tools.js"></script><script src="/journal/drawing-tools.js"></script><script src="/journal/canvas-workspace.js"></script>`);return;}
 try{res.setHeader('Content-Type',url.endsWith('.css')?'text/css':'text/javascript');res.end(fs.readFileSync(path.join(root,url)));}catch{res.statusCode=404;res.end('Missing');}
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE||undefined});
 const page=await browser.newPage({viewport:{width:1024,height:768}}),errors=[];page.on('pageerror',error=>errors.push(error.stack));
 try{
  await page.goto('http://127.0.0.1:'+server.address().port+'/');
  await page.getByRole('button',{name:'Pen',exact:true}).click();const pen=page.getByRole('dialog',{name:'Pen settings'});await pen.waitFor();
  assert.ok(await pen.locator('[data-swatch]').count()>=24);
  await pen.getByLabel('Ink hex color').fill('#e92351');
  await pen.getByLabel('Ink width',{exact:true}).fill('12');await pen.getByLabel('Ink opacity').fill('80');
  const settings=await page.evaluate(()=>window.__journalApi.settings());assert.equal(settings.color,'#e92351');assert.equal(settings.penWidth,12);assert.equal(settings.opacity,.8);
  await pen.getByRole('button',{name:'Close drawing settings'}).click();await page.evaluate(()=>window.drawSample());
  let pixel=await page.evaluate(()=>window.pixel());assert.ok(pixel[0]>200&&pixel[1]<80&&pixel[3]>150,'Custom ink reaches the actual stroke renderer');
  await page.getByRole('button',{name:'Highlighter',exact:true}).click();const highlighter=page.getByRole('dialog',{name:'Highlighter settings'});
  await highlighter.getByLabel('Custom ink color').fill('#34c8aa');await highlighter.getByLabel('Ink width',{exact:true}).fill('45');
  assert.equal((await page.evaluate(()=>window.__journalApi.settings())).highlighterWidth,45);
  await page.getByRole('button',{name:'Select and transform',exact:true}).click();
  await page.getByRole('button',{name:'Eraser',exact:true}).click();await page.waitForFunction(()=>!document.querySelector('.advanced-tool[data-mode=select]').classList.contains('active'));const eraser=page.getByRole('dialog',{name:'Eraser settings'});await eraser.getByRole('button',{name:'Area',exact:true}).click();
  await eraser.getByLabel('Eraser size').fill('70');assert.equal((await page.evaluate(()=>window.__journalApi.settings())).eraserMode,'pixel');assert.equal((await page.evaluate(()=>window.__journalApi.settings())).eraserWidth,70);
  await eraser.getByRole('button',{name:'Close drawing settings'}).click();await page.evaluate(()=>window.drawSample());pixel=await page.evaluate(()=>window.pixel());assert.equal(pixel[3],0,'Area eraser removes only the painted area through the existing renderer');
  await page.getByRole('button',{name:'Eraser',exact:true}).click();await page.getByRole('button',{name:'Whole stroke',exact:true}).click();assert.equal((await page.evaluate(()=>window.__journalApi.settings())).eraserMode,'stroke');
  await page.keyboard.press('Escape');await page.getByRole('button',{name:'Pen',exact:true}).click();assert.equal((await page.evaluate(()=>window.__journalApi.settings())).color,'#e92351','Pen and highlighter keep separate settings');
  await pen.getByRole('button',{name:'Close drawing settings'}).click();
  await page.reload();await page.getByRole('button',{name:'Pen',exact:true}).click();assert.equal((await page.evaluate(()=>window.__journalApi.settings())).penWidth,12,'Tool preferences survive reload');
  for(const width of [320,393,768]){await page.setViewportSize({width,height:740});await page.getByRole('button',{name:'Eraser',exact:true}).click();await page.getByRole('dialog',{name:'Eraser settings'}).waitFor();assert.equal(await page.locator('.journal-ink-panel').evaluate(el=>{const r=el.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight;}),true);await page.keyboard.press('Escape');}
  await page.setViewportSize({width:393,height:852});
  fs.mkdirSync(path.join(root,'.test-output/journal'),{recursive:true});await page.getByRole('button',{name:'Pen',exact:true}).click();await page.screenshot({path:path.join(root,'.test-output/journal/tools-phone.png')});
  await page.keyboard.press('Escape');await page.getByRole('button',{name:'Home journal',exact:true}).click();
  const old=await page.evaluate(()=>window.__journalApi.strokes().map(s=>({id:s.id,points:s.points})));
  const surface=page.locator('.canvas-container'),bounds=await surface.boundingBox();
  await page.getByRole('button',{name:'Pan journal',exact:true}).click();await page.mouse.move(bounds.x+40,bounds.y+180);await page.mouse.down();await page.mouse.move(bounds.x+180,bounds.y+240,{steps:4});await page.mouse.up();
  assert.ok((await page.evaluate(()=>window.__journalViewport.view)).x>100);
  assert.deepEqual(await page.evaluate(()=>window.__journalApi.strokes().map(s=>({id:s.id,points:s.points}))),old,'Panning never rewrites stroke coordinates');
  await page.getByRole('button',{name:'Zoom in journal',exact:true}).click();
  const camera=await page.evaluate(()=>window.__journalViewport.view);assert.ok(camera.zoom>1);
  const mapped=await page.evaluate(()=>{const r=document.querySelector('.canvas-container').getBoundingClientRect();return window.__journalViewport.point({clientX:r.left+120,clientY:r.top+80});});
  assert.ok(Math.abs(mapped.x-(120-camera.x)/camera.zoom)<.001);
  await page.getByRole('button',{name:'Pen',exact:true}).click();await page.waitForFunction(()=>document.querySelector('[aria-label="Pan journal"]').getAttribute('aria-pressed')==='false');await page.keyboard.press('Escape');
  await page.getByRole('button',{name:'Home journal',exact:true}).click();
  await page.getByRole('button',{name:'Capture journal area',exact:true}).click();
  await page.mouse.move(bounds.x+15,bounds.y+100);await page.mouse.down();await page.mouse.move(bounds.x+250,bounds.y+250,{steps:4});await page.mouse.up();
  const capture=page.getByRole('dialog',{name:'Save journal idea'});await capture.waitFor();await capture.getByLabel('Title',{exact:true}).fill('Journal sketch');await capture.getByLabel('Category',{exact:true}).fill('YouTube idea');
  await page.evaluate(()=>window.failIdea=true);await capture.getByRole('button',{name:'Save idea',exact:true}).click();await capture.getByRole('status').filter({hasText:'draft is kept'}).waitFor();await capture.getByRole('button',{name:'Close capture'}).click();await page.getByRole('button',{name:'Resume idea draft'}).click();assert.equal(await capture.getByLabel('Title',{exact:true}).inputValue(),'Journal sketch');await page.evaluate(()=>window.failIdea=false);await capture.getByRole('button',{name:'Save idea',exact:true}).click();await capture.getByRole('status').filter({hasText:'Saved in Dashboard'}).waitFor();
  const saved=await page.evaluate(()=>Object.entries(localStorage).find(([key])=>key.startsWith('users/fixture/dashboardIdeas/')));assert.equal(JSON.parse(saved[1]).source,'journal');assert.equal(JSON.parse(saved[1]).journalDate,'2026-10-26');
  await capture.getByRole('button',{name:'Close capture'}).click();
  await page.goto('http://127.0.0.1:'+server.address().port+'/?date=2026-10-26&view='+encodeURIComponent(JSON.stringify({x:-340,y:180,zoom:.5})));await page.waitForFunction(()=>window.__journalViewport?.view.x===-340);assert.equal(await page.evaluate(()=>window.__journalViewport.view.zoom),.5,'Saved Journal links restore the captured camera');
  const phone=await browser.newPage({viewport:{width:393,height:852},isMobile:true,hasTouch:true});phone.on('pageerror',error=>errors.push(error.stack));await phone.goto('http://127.0.0.1:'+server.address().port+'/');await phone.getByRole('button',{name:'Home journal',exact:true}).click();
  const cdp=await phone.context().newCDPSession(phone);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:70,y:240}]});for(let x=90;x<=170;x+=20)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:300}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert.ok(await phone.evaluate(()=>window.__journalViewport.view.x>80),'Finger input pans the Journal');assert.equal(await phone.evaluate(()=>window.__journalApi.strokes().length),0,'Finger panning never creates ink');
  await phone.waitForTimeout(350);await phone.getByRole('button',{name:'Capture journal area'}).tap();await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:40,y:220}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:260,y:390}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await phone.getByRole('dialog',{name:'Save journal idea'}).waitFor();await phone.close();
  assert.deepEqual(errors,[]);console.log('Journal drawing controls, renderer, unbounded camera, coordinate mapping, capture/save/retry, draft recovery, saved view and mobile touch checks passed.');
 }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
