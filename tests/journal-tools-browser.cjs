// Controlled UI using the exact settings bridge and stroke renderer from the active Journal bundle.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright'),root=path.resolve(__dirname,'..');
const {createJournalServer}=require('./journal-fixture.cjs');
const server=createJournalServer();
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE||undefined});
 const page=await browser.newPage({viewport:{width:1024,height:768}}),errors=[];page.on('pageerror',error=>errors.push(error.stack));
 const settingsFor=async label=>{await page.getByRole('button',{name:label,exact:true}).click();if(!await page.getByRole('dialog',{name:label+' settings'}).count())await page.getByRole('button',{name:label,exact:true}).click();};
 try{
  await page.goto('http://127.0.0.1:'+server.address().port+'/');
  await settingsFor('Pen');const pen=page.getByRole('dialog',{name:'Pen settings'});await pen.waitFor();
  assert.ok(await pen.locator('[data-swatch]').count()>=24);
  await pen.getByLabel('Ink width',{exact:true}).fill('12');await pen.getByLabel('Ink opacity').fill('80');await pen.getByLabel('Ink hex color').fill('#e92351');await pen.getByLabel('Ink hex color').press('Tab');
  const settings=await page.evaluate(()=>window.__journalApi.settings());assert.equal(settings.color,'#e92351');assert.equal(settings.penWidth,12);assert.equal(settings.opacity,.8);
  assert.equal(await pen.count(),0);await page.evaluate(()=>window.drawSample());
  let pixel=await page.evaluate(()=>window.pixel());assert.ok(pixel[0]>200&&pixel[1]<80&&pixel[3]>150,'Custom ink reaches the actual stroke renderer');
  await settingsFor('Highlighter');const highlighter=page.getByRole('dialog',{name:'Highlighter settings'});
  await highlighter.getByLabel('Ink width',{exact:true}).fill('45');await highlighter.getByLabel('Custom ink color').fill('#34c8aa');
  assert.equal((await page.evaluate(()=>window.__journalApi.settings())).highlighterWidth,45);
  await page.getByRole('button',{name:'Select and transform',exact:true}).click();
  await settingsFor('Eraser');await page.waitForFunction(()=>!document.querySelector('.advanced-tool[data-mode=select]').classList.contains('active'));const eraser=page.getByRole('dialog',{name:'Eraser settings'});await eraser.getByLabel('Eraser size').fill('70');await eraser.getByRole('button',{name:'Area',exact:true}).click();
  assert.equal((await page.evaluate(()=>window.__journalApi.settings())).eraserMode,'pixel');assert.equal((await page.evaluate(()=>window.__journalApi.settings())).eraserWidth,70);
  assert.equal(await eraser.count(),0);await page.evaluate(()=>window.drawSample());pixel=await page.evaluate(()=>window.pixel());assert.equal(pixel[3],0,'Area eraser removes only the painted area through the existing renderer');
  await settingsFor('Eraser');await page.getByRole('button',{name:'Whole stroke',exact:true}).click();assert.equal((await page.evaluate(()=>window.__journalApi.settings())).eraserMode,'stroke');
  await page.keyboard.press('Escape');await settingsFor('Pen');assert.equal((await page.evaluate(()=>window.__journalApi.settings())).color,'#e92351','Pen and highlighter keep separate settings');
  await pen.getByRole('button',{name:'Close drawing settings'}).click();
  await page.reload();await settingsFor('Pen');assert.equal((await page.evaluate(()=>window.__journalApi.settings())).penWidth,12,'Tool preferences survive reload');
  for(const width of [320,393,768]){await page.setViewportSize({width,height:740});await settingsFor('Eraser');await page.getByRole('dialog',{name:'Eraser settings'}).waitFor();assert.equal(await page.locator('.journal-ink-panel').evaluate(el=>{const r=el.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight;}),true);await page.keyboard.press('Escape');}
  await page.setViewportSize({width:393,height:852});
  fs.mkdirSync(path.join(root,'.test-output/journal'),{recursive:true});await settingsFor('Pen');await page.screenshot({path:path.join(root,'.test-output/journal/tools-phone.png')});
  await page.keyboard.press('Escape');await page.getByRole('button',{name:'Home journal',exact:true}).click();
  const old=await page.evaluate(()=>window.__journalApi.strokes().map(s=>({id:s.id,points:s.points})));
  const surface=page.locator('.canvas-container'),bounds=await surface.boundingBox();
  await page.getByRole('button',{name:'Pan journal',exact:true}).click();await page.mouse.move(bounds.x+40,bounds.y+180);await page.mouse.down();await page.mouse.move(bounds.x+180,bounds.y+240,{steps:4});await page.mouse.up();
  assert.ok((await page.evaluate(()=>window.__journalViewport.view)).x>100);
  assert.deepEqual(await page.evaluate(()=>window.__journalApi.strokes().map(s=>({id:s.id,points:s.points}))),old,'Panning never rewrites stroke coordinates');
  await page.getByRole('button',{name:'Zoom in journal',exact:true}).click();
  await page.getByRole('button',{name:'Zoom in journal',exact:true}).focus();await page.keyboard.press('Space');
  const camera=await page.evaluate(()=>window.__journalViewport.view);assert.ok(camera.zoom>1.5,'Space activates a focused canvas button');assert.ok(camera.zoom>1);
  const mapped=await page.evaluate(()=>{const r=document.querySelector('.canvas-container').getBoundingClientRect();return window.__journalViewport.point({clientX:r.left+120,clientY:r.top+80});});
  assert.ok(Math.abs(mapped.x-(120-camera.x)/camera.zoom)<.001);
  await settingsFor('Pen');await page.waitForFunction(()=>document.querySelector('[aria-label="Pan journal"]').getAttribute('aria-pressed')==='false');await page.keyboard.press('Escape');
  await page.getByRole('button',{name:'Home journal',exact:true}).click();
  await page.getByRole('button',{name:'Save snapshot',exact:true}).click();
  await page.mouse.move(bounds.x+15,bounds.y+100);await page.mouse.down();await page.mouse.move(bounds.x+250,bounds.y+250,{steps:4});await page.mouse.up();
  const capture=page.getByRole('dialog',{name:'Save journal idea'});await capture.waitFor();await capture.getByLabel('Title',{exact:true}).fill('Journal sketch');await capture.getByLabel('Category',{exact:true}).fill('YouTube idea');
  await page.evaluate(()=>window.failIdea=true);await capture.getByRole('button',{name:'Save idea',exact:true}).click();await capture.getByRole('status').filter({hasText:'draft is kept'}).waitFor();await capture.getByRole('button',{name:'Close capture'}).click();await page.getByRole('button',{name:'Resume idea draft'}).click();assert.equal(await capture.getByLabel('Title',{exact:true}).inputValue(),'Journal sketch');await page.evaluate(()=>window.failIdea=false);await capture.getByRole('button',{name:'Save idea',exact:true}).click();await capture.getByRole('status').filter({hasText:'Saved in Dashboard'}).waitFor();
  const saved=await page.evaluate(()=>Object.entries(localStorage).find(([key])=>key.startsWith('users/fixture/dashboardIdeas/')));assert.equal(JSON.parse(saved[1]).source,'journal');assert.equal(JSON.parse(saved[1]).journalDate,'2026-10-26');
  await capture.getByRole('button',{name:'Close capture'}).click();
  await page.goto('http://127.0.0.1:'+server.address().port+'/?date=2026-10-26&view='+encodeURIComponent(JSON.stringify({x:-340,y:180,zoom:.5})));await page.waitForFunction(()=>window.__journalViewport?.view.x===-340);assert.equal(await page.evaluate(()=>window.__journalViewport.view.zoom),.5,'Saved Journal links restore the captured camera');
  const phone=await browser.newPage({viewport:{width:393,height:852},isMobile:true,hasTouch:true});phone.on('pageerror',error=>errors.push(error.stack));await phone.goto('http://127.0.0.1:'+server.address().port+'/');await phone.getByRole('button',{name:'Home journal',exact:true}).click();
  const cdp=await phone.context().newCDPSession(phone);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:70,y:240}]});for(let x=90;x<=170;x+=20)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:300}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert.ok(await phone.evaluate(()=>window.__journalViewport.view.x>80),'Finger input pans the Journal');assert.equal(await phone.evaluate(()=>window.__journalApi.strokes().length),0,'Finger panning never creates ink');
  await phone.waitForTimeout(350);await phone.getByRole('button',{name:'Capture journal area'}).tap();await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:40,y:220}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:260,y:390}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await phone.getByRole('dialog',{name:'Save journal idea'}).waitFor();await phone.close();
  const layout=await browser.newPage({viewport:{width:1440,height:900}});layout.on('pageerror',error=>errors.push(error.stack));await layout.goto('http://127.0.0.1:'+server.address().port+'/');
  await layout.addStyleTag({path:path.join(root,'journal/assets/index-DSgeQfSP.css')});await layout.addStyleTag({content:fs.readFileSync(path.join(root,'site-nav.css'),'utf8').replace(/^@import[^;]+;/,'')});
  await layout.evaluate(()=>{const app=document.createElement('div');app.className='app-container';Object.assign(app.style,{display:'flex',flexDirection:'column'});const top=document.createElement('div');top.className='topbar';top.style.minHeight='76px';top.textContent='Journal';document.body.append(app);app.append(top,document.querySelector('.toolbar'),document.querySelector('.canvas-container'));});
  for(const width of [1440,393,320]){await layout.setViewportSize({width,height:900});await layout.waitForFunction(()=>{const app=document.querySelector('.app-container');return app.classList.contains('journal-free-workspace')&&app.scrollHeight<=app.clientHeight+2;});assert.equal(await layout.locator('.canvas-container').evaluate(el=>{const r=el.getBoundingClientRect();return r.height>120&&r.height<innerHeight&&r.bottom<=innerHeight;}),true,'Native Journal styles retain a screen-sized canvas');await layout.waitForFunction(()=>{const el=document.querySelector('#base-canvas');return Math.abs(el.height-el.parentElement.clientHeight)<5;});}
  await layout.screenshot({path:path.join(root,'.test-output/journal/canvas-phone.png')});await layout.close();

  assert.deepEqual(errors,[]);console.log('Journal drawing controls, renderer, unbounded camera, coordinate mapping, capture/save/retry, draft recovery, saved view and mobile touch checks passed.');
 }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
