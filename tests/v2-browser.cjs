// Actual V2 React/auth/data lifecycle with controlled Firestore; no production writes.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const {chromium, firefox} = require('playwright');
const root = path.resolve(__dirname, '..');
const buildDirectory = process.env.V2_BUILD_DIR || 'v2-dist';
const esbuild = require(path.join(root, 'react/node_modules/esbuild'));
const output = path.join(root, '.test-output/v2');
const authMock = `
let observer, current={uid:'alice'};
export const db={};
export async function observeAuth(next) {
  await new Promise(resolve=>setTimeout(resolve,80)); observer=next;next(current);
  return ()=>{if(observer===next)observer=null;};
}
export const loginWithGoogle=async()=>{current={uid:'alice'};observer?.(current);};
export const logout=async()=>{current=null;observer?.(null);};
window.switchAccount=uid=>{current=uid?{uid}:null;observer?.(current);};
`;
const firestoreMock = `
export const collection=(_,...parts)=>({path:parts.join('/')});
export const doc=collection;
const listeners=new Set();
window.reads=[];window.writes=0;
const tasks=Array.from({length:24},(_,i)=>({id:'t'+i,title:i===0?'Build the living workspace':'Project '+i+' — Research, review and prepare the next meaningful action',status:['In Progress','Backlog','Today','Done'][i%4],steps:[{id:'s1',title:'Review the spatial canvas',notes:'Keep the original data.\\nVerify all user journeys.',done:false},{id:'s2',title:'Inspect existing records',done:true}]}));
const saved=JSON.parse(sessionStorage.getItem('v2-fixture-saved')||'{}');
for(const task of tasks)Object.assign(task,saved.tasks?.[task.id]||{});
let plan=saved.plan||{activeItemId:'q',items:[{id:'q',taskId:'t0',stepId:'s1'}]};
window.writeLog=[];
function snapshot(ref) {
  const owner=ref.path.split('/')[1];
  if(ref.path.endsWith('/tasks')) return {metadata:{fromCache:false},docs:owner==='alice'?tasks.map(task=>({id:task.id,data:()=>({...task})})):[]};
  return {metadata:{fromCache:false},exists:()=>owner==='alice',data:()=>plan};
}
export const serverTimestamp=()=>123;
export async function runTransaction(_,callback) {
  const patches=[];
  const result=await callback({get:async ref=>{
    if(ref.path.includes('/tasks/')){const task=tasks.find(task=>task.id===ref.path.split('/').pop()&&task.id!==window.deletedTaskId);return {exists:()=>Boolean(task)&&ref.path.startsWith('users/alice/'),data:()=>structuredClone(task)};}
    return snapshot(ref);
  },set:(ref,patch)=>patches.push({path:ref.path,patch}),update:(ref,patch)=>patches.push({path:ref.path,patch})});
  await new Promise(resolve=>setTimeout(resolve,100));
  if(window.failNextWrite){window.failNextWrite=false;throw Error('permission-denied');}
  for(const entry of patches){
    if(entry.path.includes('/tasks/'))Object.assign(tasks.find(task=>task.id===entry.path.split('/').pop()),entry.patch);
    else plan={...plan,...entry.patch};
  }
  window.writes+=patches.length;window.writeLog.push(...patches);
  sessionStorage.setItem('v2-fixture-saved',JSON.stringify({tasks:Object.fromEntries(tasks.map(task=>[task.id,{status:task.status}])),plan}));
  for(const listener of listeners)listener.next(snapshot(listener.ref));
  return result;
}
export function onSnapshot(ref, options, next, error) {
  const listener={ref,next,error};listeners.add(listener);window.reads.push(ref.path);
  const clock=setTimeout(()=>next(snapshot(ref)),35);
  return ()=>{clearTimeout(clock);listeners.delete(listener);};
}
window.emitTaskTitle=title=>{tasks[0].title=title;for(const entry of listeners)entry.next(snapshot(entry.ref));};
window.failSync=()=>{for(const entry of listeners)entry.error(Error('permission-denied'));};
window.listenerCount=()=>listeners.size;
`;
(async () => {
  fs.mkdirSync(output,{recursive:true});
  await esbuild.build({
    entryPoints:[path.join(root,'react/v2/main.jsx')],bundle:true,outfile:path.join(output,'fixture.js'),jsx:'automatic',
    plugins:[{name:'read-only-fixture',setup(build){
      build.onResolve({filter:/firebase$/},args=>args.path==='../src/firebase'||args.path==='./firebase'?{path:'auth',namespace:'fixture'}:null);
      build.onResolve({filter:/^firebase\/firestore$/},()=>({path:'firestore',namespace:'fixture'}));
      build.onLoad({filter:/.*/,namespace:'fixture'},args=>({contents:args.path==='auth'?authMock:firestoreMock,loader:'js'}));
    }}],
  });
  const server=http.createServer((req,res)=>{
    const url=new URL(req.url,'http://localhost');
    if(url.pathname==='/fixture'){res.setHeader('Content-Type','text/html');res.end('<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/fixture.css"></head><body><div id="root"></div><script src="/fixture.js"></script></body></html>');return;}
    const file=url.pathname==='/fixture.js'||url.pathname==='/fixture.css'?path.join(output,url.pathname.slice(1)):
      url.pathname.startsWith('/invincible/v2/')?path.join(root,buildDirectory,url.pathname.slice('/invincible/v2/'.length)||'index.html'):null;
    if(!file||!fs.existsSync(file)){res.statusCode=404;res.end('Not found');return;}
    res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html');
    res.end(fs.readFileSync(file));
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+server.address().port;
  try {
    for(const [name,engine] of [['chromium',chromium],['firefox',firefox]]) {
      const browser=await engine.launch({headless:true});
      try {
        const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
        const page=await context.newPage(), errors=[];
        page.on('pageerror',error=>errors.push(error.message));
        await page.route('https://**/*',route=>route.abort());
        await page.goto(base+'/fixture');
        await page.locator('.v2-guide-mission h2').getByText('Build the living workspace').waitFor();
        assert.equal(await page.getByRole('navigation',{name:'Explore spaces'}).getByRole('link').count(),2);
        assert.equal(await page.locator('.focus-orb-3d canvas').count(),1);
        await page.waitForFunction(()=>!document.querySelector('.v2-orb').classList.contains('is-compact'));
        await page.evaluate(()=>window.originalOrb=document.querySelector('.focus-orb-3d canvas'));
        await page.waitForTimeout(150);
        if(await page.locator('.focus-orb-3d').getAttribute('data-ready')==='true') {
          const orbRect=await page.locator('.v2-orb').boundingBox();
          await page.mouse.move(orbRect.x+orbRect.width/2,orbRect.y+orbRect.height*.12);
          await page.mouse.down();
          assert.equal(await page.locator('.v2-orb').getAttribute('data-dragging'),null,'V2 Orb does not rotate away from stable map points');
          await page.mouse.move(orbRect.x+orbRect.width/2+24,orbRect.y+orbRect.height*.12+15);
          await page.mouse.up();
          assert.equal(await page.locator('.v2-orb').getAttribute('data-dragging'),null);
        } else {
          assert.equal(await page.locator('.orb-3d-fallback').count(),1);
        }
        assert.deepEqual(await page.evaluate(()=>[...new Set(window.reads)].map(value=>value.split('/').slice(0,3).join('/')).sort()),['users/alice/dailyPlans','users/alice/tasks']);
        assert.equal(await page.evaluate(()=>window.writes),0);

        // All nine real page links sit on the Orb; the Dashboard and Workspace
        // remain separate, and the center-to-island route lines are gone.
        const destinations=page.getByRole('navigation',{name:'Explore Invincible pages'}).getByRole('link');
        assert.equal(await destinations.count(),9);
        assert.equal(await destinations.locator('.v2-page-glow svg').count(),9,'each page glow has a distinct line icon');
        assert.deepEqual(await destinations.evaluateAll(links=>links.map(link=>link.dataset.page)),
          ['ai','journal','finance','garage','creator','workday','lic','reminders','portfolio']);
        assert.equal(await page.locator('.v2-constellation-lines,.v2-branch-lines').count(),0);
        assert.equal(await page.locator('.v2-guide-particles').count(),1);
        assert.equal(await page.getByRole('button',{name:'Open current task: Build the living workspace'}).count(),1);
        const positions=await page.evaluate(()=>{
          const orb=document.querySelector('.v2-orb').getBoundingClientRect();
          return Object.fromEntries(['ai','journal','creator','workday'].map(id=>{
            const glow=document.querySelector(`[data-page="${id}"] .v2-page-glow`).getBoundingClientRect();
            return [id,{x:(glow.left+glow.width/2-orb.left)/orb.width,y:(glow.top+glow.height/2-orb.top)/orb.height}];
          }));
        });
        assert.ok(positions.ai.x>.3&&positions.ai.x<.6&&positions.ai.y<.4);
        assert.ok(positions.workday.x>.2&&positions.workday.x<.5&&positions.workday.y>.5);
        assert.ok(positions.journal.x<.35&&positions.creator.x>.7);
        await page.getByRole('button',{name:'Open current task: Build the living workspace'}).click();
        await page.getByRole('dialog').getByText('Build the living workspace').waitFor();
        await page.getByRole('button',{name:/Close saved work/}).click();
        await page.screenshot({path:path.join(output,name+'-map.png')});
        const travelPage=await context.newPage();
        await travelPage.goto(base+'/fixture');
        await travelPage.locator('.v2-page-point[data-page="ai"]').click();
        await travelPage.waitForURL(base+'/invincible/ai/');
        await travelPage.goBack();
        await travelPage.locator('.v2-page-point[data-page="ai"]').waitFor();
        assert.equal(await travelPage.locator('.v2-travel').count(),0);
        await travelPage.close();

        // Native horizontal wheel input reaches the canvas through a vertical region.
        await page.mouse.move(500,600);
        await page.mouse.wheel(270,0);
        await page.waitForFunction(()=>document.querySelector('.v2-canvas').scrollLeft>100);

        // A real seam, with both regions on-screen, remains at an arbitrary offset.
        await page.locator('.v2-canvas').evaluate(element=>element.scrollTo({left:element.clientWidth*.43,behavior:'instant'}));
        await page.waitForTimeout(350);
        const seam=await page.evaluate(()=>{
          const canvas=document.querySelector('.v2-canvas'), a=document.querySelector('#v2-region-dashboard').getBoundingClientRect(),b=document.querySelector('#v2-region-workspace').getBoundingClientRect();
          return {fraction:canvas.scrollLeft/canvas.clientWidth,aRight:a.right,bLeft:b.left,snap:getComputedStyle(canvas).scrollSnapType};
        });
        assert.ok(Math.abs(seam.fraction-.43)<.01);assert.ok(seam.aRight>0&&seam.bLeft<1440);assert.equal(seam.snap,'none');
        await page.screenshot({path:path.join(output,name+'-seam.png')});
        await page.setViewportSize({width:1024,height:900});
        await page.waitForTimeout(250);
        assert.ok(Math.abs(await page.locator('.v2-canvas').evaluate(element=>element.scrollLeft/element.clientWidth)-.43)<.01,'resize preserves the free stopping position');
        await page.setViewportSize({width:1440,height:1000});

        await page.getByRole('link',{name:'02 My Workspace'}).click();
        await page.waitForFunction(()=>Math.abs(document.querySelector('.v2-canvas').scrollLeft-document.querySelector('.v2-canvas').clientWidth)<2);
        assert.equal(new URL(page.url()).hash,'#workspace');
        await page.goBack();
        await page.waitForFunction(()=>Math.abs(document.querySelector('.v2-canvas').scrollLeft/document.querySelector('.v2-canvas').clientWidth-.43)<.01);
        await page.goForward();
        await page.waitForFunction(()=>Math.abs(document.querySelector('.v2-canvas').scrollLeft/document.querySelector('.v2-canvas').clientWidth-1)<.01);
        await page.reload();
        await page.locator('.v2-workspace-intro h2').waitFor();
        await page.waitForFunction(()=>Math.abs(document.querySelector('.v2-canvas').scrollLeft/document.querySelector('.v2-canvas').clientWidth-1)<.01);
        await page.screenshot({path:path.join(output,name+'-workspace.png')});

        await page.locator('.v2-canvas').focus();
        await page.keyboard.press('Home');
        await page.waitForFunction(()=>document.querySelector('.v2-canvas').scrollLeft<2);
        assert.equal(await page.evaluate(()=>document.activeElement.getAttribute('href')),'#dashboard');
        await page.locator('#v2-region-dashboard').getByRole('button',{name:'Start focus',exact:true}).click();
        await page.waitForTimeout(1150);
        await page.getByRole('link',{name:'02 My Workspace'}).click();
        assert.notEqual(await page.locator('#v2-region-workspace output').textContent(),'25:00');
        assert.equal(await page.locator('#v2-region-workspace').getByRole('button',{name:'Pause focus'}).count(),1);
        await page.evaluate(()=>window.originalOrb=document.querySelector('.focus-orb-3d canvas'));
        await page.getByRole('link',{name:'01 Main Dashboard'}).click();
        await page.getByRole('link',{name:'02 My Workspace'}).click();
        assert.equal(await page.evaluate(()=>window.originalOrb===document.querySelector('.focus-orb-3d canvas')),true);
        await page.reload();
        await page.locator('#v2-region-workspace').getByRole('button',{name:'Pause focus'}).waitFor();
        assert.notEqual(await page.locator('#v2-region-workspace output').textContent(),'25:00');
        await page.locator('#v2-region-workspace').getByRole('button',{name:'Pause focus'}).click();
        await page.evaluate(()=>window.emitTaskTitle('Updated from another region'));
        await page.getByRole('link',{name:'01 Main Dashboard'}).click();
        await page.locator('.v2-guide-mission h2').getByText('Updated from another region').waitFor();
        await page.getByRole('button',{name:/Resume work/}).click();
        await page.getByRole('dialog').waitFor();
        assert.match(await page.getByRole('dialog').textContent(),/Keep the original data/);
        assert.match(await page.getByRole('dialog').textContent(),/Inspect existing records/);
        assert.equal(new URL(page.url()).hash,'#dashboard');
        await page.keyboard.press('Escape');
        assert.equal(await page.getByRole('dialog').count(),0);
        assert.match(await page.evaluate(()=>document.activeElement.textContent),/Resume work/);

        // Each region scrolls independently; the outer document never spills horizontally.
        await page.evaluate(()=>window.emitTaskTitle('Updated from another region — a longer project title that should never push the board below the screen'));
        for(const [width,height] of [[320,640],[393,852],[768,1024],[1024,768],[1280,600],[1366,768],[1500,674],[1870,842],[1440,900],[1920,1080],[2560,1440]]) {
          await page.setViewportSize({width,height});
          await page.getByRole('link',{name:'01 Main Dashboard'}).click();
          await page.locator('#v2-region-dashboard').evaluate(element=>element.scrollTo(0,0));
          await page.waitForTimeout(100);
          const sizes=await page.evaluate(()=>({
            outer:document.documentElement.scrollWidth<=innerWidth+1,
            region:[...document.querySelectorAll('.v2-region')].every(element=>element.scrollWidth<=element.clientWidth+1),
            canvas:document.querySelector('.v2-canvas').scrollWidth>=innerWidth*1.99,
            orb:document.querySelectorAll('.focus-orb-3d canvas').length,
          }));
          if(!sizes.outer) console.log(name,width,'overflow',await page.evaluate(()=>({
            document:document.documentElement.scrollWidth,body:document.body.scrollWidth,
            shell:document.querySelector('.v2-shell').scrollWidth,header:document.querySelector('.v2-topbar').scrollWidth,
            nav:document.querySelector('.v2-topbar nav').scrollWidth,canvas:document.querySelector('.v2-canvas').scrollWidth,
            orb:document.querySelector('.v2-orb').getBoundingClientRect().toJSON()
          })));
          assert.equal(sizes.outer,true,name+' '+width+' outer width');
          assert.equal(sizes.region,true,name+' '+width+' region width');
          assert.equal(sizes.canvas,true);assert.equal(sizes.orb,1);
          const scene=await page.evaluate(()=>{
            const orb=document.querySelector('.v2-orb').getBoundingClientRect();
            const mission=document.querySelector('.v2-guide-mission').getBoundingClientRect();
            return {orbWidth:orb.width,missionRight:mission.right,orbLeft:orb.left,compact:document.querySelector('.v2-orb').classList.contains('is-compact')};
          });
          assert.equal(scene.compact,false,name+' '+width+' dashboard Orb remains prominent');
          assert.ok(scene.orbWidth>=200,name+' '+width+' dashboard Orb size');
          if(width>=901) assert.ok(scene.orbWidth>=Math.min(width*.55,height*.87,750),name+' '+width+' enlarged desktop Orb');
          if(width>=1101) assert.ok(scene.missionRight<scene.orbLeft+scene.orbWidth*.25,name+' '+width+' mission keeps clear space for Orb');
          if([393,1280,1366,1440,1870,1920,2560].includes(width)){await page.screenshot({path:path.join(output,name+'-'+width+'.png')});}
          if(width===393){
            assert.equal(await page.locator('.v2-page-point').count(),9);
            assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
            await page.screenshot({path:path.join(output,name+'-phone-map.png')});
          }
          await page.getByRole('button',{name:/Open My Workspace/}).click();
          await page.locator('.v2-workspace-intro h2').waitFor();
          // The detailed board is in My Workspace and is usable before scrolling.
          const board=await page.evaluate(()=>{
            const viewport=document.querySelector('.v2-canvas').getBoundingClientRect();
            const cards=[...document.querySelectorAll('.v2-lane')].map(lane=>lane.querySelector('.v2-task-card').getBoundingClientRect());
            return {bottom:viewport.bottom,cards:cards.map(card=>({top:card.top,bottom:card.bottom}))};
          });
          for(const card of board.cards.slice(0,width<=600?2:4)) {
            // The smallest phone shows lane headings and the beginning of each card;
            // larger phones and desktops show the complete first row.
            const edge=width<=320?card.top+40:card.bottom;
            if(edge>board.bottom) await page.screenshot({path:path.join(output,name+'-visibility-failure.png')});
            assert.ok(edge<=board.bottom,name+' '+width+'x'+height+' first Kanban cards visible: '+JSON.stringify(board));
          }
          if(width>=1024){
            const reachable=await page.evaluate(()=>{
              const lanes=[...document.querySelectorAll('.v2-lane-cards')];
              return lanes.every(cards=>{
                cards.scrollTop=cards.scrollHeight;
                const last=cards.lastElementChild;
                if(!last)return true;
                const r=last.getBoundingClientRect(), p=cards.getBoundingClientRect();
                return r.bottom<=p.bottom+4;
              });
            });
            assert.ok(reachable, name+' '+width+'x'+height+' last lane card reachable');
            await page.evaluate(()=>[...document.querySelectorAll('.v2-lane-cards')].forEach(c=>c.scrollTop=0));
          }
          const before=await page.locator('.v2-canvas').evaluate(element=>element.scrollLeft);
          await page.locator('#v2-region-dashboard').evaluate(element=>element.scrollTo(0,element.scrollHeight));
          assert.equal(await page.locator('.v2-canvas').evaluate(element=>element.scrollLeft),before);
          await page.getByRole('link',{name:'01 Main Dashboard'}).click();
        }
        await page.evaluate(()=>window.emitTaskTitle('Updated from another region'));
        await page.evaluate(()=>window.failSync());
        await page.getByRole('button',{name:'Retry sync'}).waitFor();
        assert.equal(await page.locator('.v2-guide-mission h2').getByText('Updated from another region').count(),0);
        await page.getByRole('button',{name:'Retry sync'}).click();
        await page.locator('.v2-guide-mission h2').getByText('Updated from another region').waitFor();

        await page.evaluate(()=>window.switchAccount('bob'));
        await page.waitForFunction(()=>window.reads.includes('users/bob/tasks'));
        await page.waitForTimeout(100);
        assert.equal(await page.locator('.v2-guide-mission h2').getByText('Updated from another region').count(),0);
        assert.equal(await page.locator('#v2-region-dashboard output').textContent(),'25:00');
        await page.getByRole('button',{name:'Sign out',exact:true}).click();
        await page.getByRole('button',{name:'Continue with Google'}).waitFor();
        assert.equal(await page.evaluate(()=>window.listenerCount()),0);
        assert.equal(await page.locator('.focus-orb-3d canvas').count(),0);
        assert.equal(await page.evaluate(()=>window.writes),0);
        assert.deepEqual(errors,[]);

        // Moves use the existing account records and roll back on a denied commit.
        const movePage=await context.newPage();
        await movePage.goto(base+'/fixture#workspace');
        const card=id=>movePage.locator(`[data-task-id="${id}"]`);
        await card('t1').waitFor();
        await card('t1').locator('.v2-task-card').dragTo(movePage.locator('.v2-lane[data-status="In Progress"] .v2-lane-header'));
        await movePage.getByRole('status').filter({hasText:'Moved to In Progress.'}).waitFor();
        assert.equal(await movePage.locator('.v2-lane[data-status="In Progress"] [data-task-id="t1"]').count(),1);
        assert.equal(await movePage.evaluate(()=>window.writeLog[0].path),'users/alice/tasks/t1');
        assert.deepEqual(await movePage.evaluate(()=>Object.keys(window.writeLog[0].patch).sort()),['status','updatedAt']);
        await movePage.reload();
        await movePage.locator('.v2-lane[data-status="In Progress"] [data-task-id="t1"]').waitFor();
        await card('t1').locator('.v2-task-card').dragTo(movePage.locator('.v2-lane[data-status="In Progress"] .v2-lane-header'));
        assert.equal(await movePage.evaluate(()=>window.writes),0,'dropping into the same lane is a no-op');
        await movePage.evaluate(()=>window.failNextWrite=true);
        await card('t1').locator('select').selectOption('Today');
        await movePage.getByRole('alert').waitFor();
        assert.equal(await movePage.evaluate(()=>window.writes),0,'a failed Today move changes neither task nor plan');
        assert.equal(await movePage.locator('.v2-lane[data-status="In Progress"] [data-task-id="t1"]').count(),1);
        await card('t1').locator('select').selectOption('Today');
        await movePage.getByRole('status').filter({hasText:'Moved to Today.'}).waitFor();
        assert.equal(await movePage.evaluate(()=>window.writeLog.find(entry=>entry.path.includes('/dailyPlans/')).patch.activeItemId),'t1__s1');
        await movePage.getByRole('link',{name:'01 Main Dashboard'}).click();
        await movePage.locator('.v2-guide-mission h2').getByText('Project 1').waitFor();
        await movePage.getByRole('link',{name:'02 My Workspace'}).click();
        await movePage.evaluate(()=>window.failNextWrite=true);
        await card('t1').locator('select').selectOption('Done');
        await movePage.getByRole('alert').filter({hasText:/move could not be saved/}).waitFor();
        assert.equal(await movePage.locator('.v2-lane[data-status="Today"] [data-task-id="t1"]').count(),1);
        await card('t1').locator('select').selectOption('Done');
        await movePage.getByRole('status').filter({hasText:'Moved to Completed.'}).waitFor();
        assert.equal(await card('t1').locator('select').evaluate(element=>element===document.activeElement),true,'Move control keeps keyboard focus after a lane change');
        await card('t1').locator('.v2-task-card').click();
        await movePage.getByRole('dialog').getByText('Keep the original data.',{exact:false}).waitFor();
        await movePage.keyboard.press('Escape');
        const writes=await movePage.evaluate(()=>window.writes);
        await movePage.evaluate(()=>window.deletedTaskId='t1');
        await card('t1').locator('select').selectOption('Backlog');
        await movePage.getByRole('alert').waitFor();
        assert.equal(await movePage.evaluate(()=>window.writes),writes,'a deleted task is never recreated by a move');
        await movePage.close();

        // Actual production bundle: anonymous startup, no test adapter or auto sign-in.
        await page.goto(base+'/invincible/v2/');
        await page.getByRole('button',{name:'Continue with Google'}).waitFor();
        assert.equal(await page.evaluate(()=>typeof window.switchAccount),'undefined');
        assert.deepEqual(errors,[]);
        await page.route('**/invincible/v2/assets/*.js',route=>route.abort());
        await page.reload();
        await page.getByText('The workspace could not start.',{exact:true}).waitFor();
        assert.equal(await page.getByRole('link',{name:'Open local preview'}).isVisible(),true);
        await context.close();
        if(name==='chromium') {
          const touchContext=await browser.newContext({viewport:{width:393,height:852},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
          const touchPage=await touchContext.newPage();
          await touchPage.goto(base+'/fixture');
          await touchPage.locator('.v2-guide-mission h2').getByText('Build the living workspace').waitFor();
          const cdp=await touchContext.newCDPSession(touchPage);
          await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:350,y:540}]});
          for(let x=330;x>=110;x-=20){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:540}]});await touchPage.waitForTimeout(20);}
          await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
          await touchPage.waitForFunction(()=>document.querySelector('.v2-canvas').scrollLeft>100);
          await touchPage.getByRole('link',{name:'02 My Workspace'}).click();
          const handle=await touchPage.locator('[data-task-id="t1"] .v2-drag-handle').boundingBox();
          const destination=await touchPage.locator('.v2-lane[data-status="In Progress"] .v2-lane-header').boundingBox();
          const start={x:handle.x+handle.width/2,y:handle.y+handle.height/2},end={x:destination.x+destination.width/2,y:destination.y+destination.height/2};
          await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[start]});
          for(let i=1;i<=8;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:start.x+(end.x-start.x)*i/8,y:start.y+(end.y-start.y)*i/8}]});}
          await touchPage.locator('.v2-lane[data-status="In Progress"].is-drop-target').waitFor();
          await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
          await touchPage.getByRole('status').filter({hasText:'Moved to In Progress.'}).waitFor();
          assert.equal(await touchPage.locator('.v2-lane[data-status="In Progress"] [data-task-id="t1"]').count(),1);
          await touchPage.screenshot({path:path.join(output,'chromium-touch-kanban.png')});
          await touchContext.close();
        }
        console.log(name+': navigation, free stopping, history, reload, timer, responsive layout, live reads, account isolation and production auth gate passed');
      } finally {await browser.close();}
    }
  } finally {await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
