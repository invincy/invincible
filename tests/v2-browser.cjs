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
function snapshot(ref) {
  const owner=ref.path.split('/')[1];
  if(ref.path.endsWith('/tasks')) return {metadata:{fromCache:false},docs:owner==='alice'?tasks.map(task=>({id:task.id,data:()=>({...task})})):[]};
  return {metadata:{fromCache:false},exists:()=>owner==='alice',data:()=>({activeItemId:'q',items:[{id:'q',taskId:'t0',stepId:'s1'}]})};
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
        await page.getByRole('button',{name:/Build the living workspace/}).waitFor();
        assert.equal(await page.locator('.focus-orb-3d canvas').count(),1);
        await page.waitForFunction(()=>!document.querySelector('.v2-orb').classList.contains('is-compact'));
        await page.evaluate(()=>window.originalOrb=document.querySelector('.focus-orb-3d canvas'));
        assert.deepEqual(await page.evaluate(()=>[...new Set(window.reads)].map(value=>value.split('/').slice(0,3).join('/')).sort()),['users/alice/dailyPlans','users/alice/tasks']);
        assert.equal(await page.evaluate(()=>window.writes),0);

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
        await page.getByRole('heading',{name:'Your essentials.' ,exact:false}).waitFor();
        await page.waitForFunction(()=>Math.abs(document.querySelector('.v2-canvas').scrollLeft/document.querySelector('.v2-canvas').clientWidth-1)<.01);
        await page.screenshot({path:path.join(output,name+'-workspace.png')});

        await page.locator('.v2-canvas').focus();
        await page.keyboard.press('Home');
        await page.waitForFunction(()=>document.querySelector('.v2-canvas').scrollLeft<2);
        assert.equal(await page.evaluate(()=>document.activeElement.id),'dashboard-title');
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
        await page.getByRole('button',{name:/Updated from another region/}).waitFor();
        await page.getByRole('button',{name:/Resume work/}).click();
        await page.getByRole('dialog').waitFor();
        assert.match(await page.getByRole('dialog').textContent(),/Keep the original data/);
        assert.equal(new URL(page.url()).hash,'#dashboard');
        await page.keyboard.press('Escape');
        assert.equal(await page.getByRole('dialog').count(),0);
        assert.match(await page.evaluate(()=>document.activeElement.textContent),/Resume work/);

        await page.getByRole('button',{name:'View milestones',exact:true}).click();
        await page.getByRole('dialog').waitFor();
        assert.match(await page.getByRole('dialog').textContent(),/Inspect existing records/);
        await page.keyboard.press('Escape');

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
          assert.equal(sizes.outer,true,name+' '+width+' outer width');
          assert.equal(sizes.region,true,name+' '+width+' region width');
          assert.equal(sizes.canvas,true);assert.equal(sizes.orb,1);
          // The board must be usable before scrolling, even on a short laptop screen.
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
          if([393,1280,1366,1440,1870,1920,2560].includes(width)){await page.locator('#v2-region-dashboard').evaluate(element=>element.scrollTo(0,0));await page.waitForTimeout(100);await page.screenshot({path:path.join(output,name+'-'+width+'.png')});}
        }
        await page.evaluate(()=>window.emitTaskTitle('Updated from another region'));
        await page.evaluate(()=>window.failSync());
        await page.getByRole('button',{name:'Retry sync'}).waitFor();
        assert.equal(await page.getByRole('button',{name:/Updated from another region/}).count(),0);
        await page.getByRole('button',{name:'Retry sync'}).click();
        await page.getByRole('button',{name:/Updated from another region/}).waitFor();

        await page.evaluate(()=>window.switchAccount('bob'));
        await page.waitForFunction(()=>window.reads.includes('users/bob/tasks'));
        await page.waitForTimeout(100);
        assert.equal(await page.getByRole('button',{name:/Updated from another region/}).count(),0);
        assert.equal(await page.locator('#v2-region-dashboard output').textContent(),'25:00');
        await page.getByRole('button',{name:'Sign out',exact:true}).click();
        await page.getByRole('button',{name:'Continue with Google'}).waitFor();
        assert.equal(await page.evaluate(()=>window.listenerCount()),0);
        assert.equal(await page.locator('.focus-orb-3d canvas').count(),0);
        assert.equal(await page.evaluate(()=>window.writes),0);
        assert.deepEqual(errors,[]);

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
          await touchPage.getByRole('button',{name:/Build the living workspace/}).waitFor();
          const cdp=await touchContext.newCDPSession(touchPage);
          await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:350,y:540}]});
          for(let x=330;x>=110;x-=20){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:540}]});await touchPage.waitForTimeout(20);}
          await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
          await touchPage.waitForFunction(()=>document.querySelector('.v2-canvas').scrollLeft>100);
          await touchContext.close();
        }
        console.log(name+': navigation, free stopping, history, reload, timer, responsive layout, live reads, account isolation and production auth gate passed');
      } finally {await browser.close();}
    }
  } finally {await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
