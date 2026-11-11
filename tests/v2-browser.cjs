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
const smokeOnly = process.argv.includes('--smoke');
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
export const collection=(_,...parts)=>({path:[_?.path,...parts].filter(Boolean).join('/')});
export const doc=collection;
export const query=ref=>ref,orderBy=()=>null,limit=()=>null;
const listeners=new Set();const streaks={};
window.reads=[];window.writes=0;
const tasks=Array.from({length:24},(_,i)=>({id:'t'+i,title:i===0?'Build the living workspace':'Project '+i+' — Research, review and prepare the next meaningful action',status:['In Progress','Backlog','Today','Done'][i%4],steps:[{id:'s1',title:'Review the spatial canvas',notes:'Keep the original data.\\nVerify all user journeys.',done:false},{id:'s2',title:'Inspect existing records',done:true}]}));
const saved=JSON.parse(sessionStorage.getItem('v2-fixture-saved')||'{}');
tasks[0].steps[0].extension={keep:'nested'};
tasks[0].subtasks=[{text:'Review the spatial canvas',done:false,legacyNotes:'Keep legacy extension'},{text:'Inspect existing records',done:true}];
if(saved.tasks)tasks.splice(0,tasks.length,...Object.values(saved.tasks));
const ideas=saved.ideas||{};
let plan=saved.plan||{activeItemId:'q',items:[{id:'q',taskId:'t0',stepId:'s1'}]};
window.writeLog=[];
function snapshot(ref) {
  const owner=ref.path.split('/')[1];
  if(ref.path.endsWith('/dashboardIdeas'))return {metadata:{fromCache:false},docs:owner==='alice'?Object.entries(ideas).map(([id,value])=>({id,data:()=>value})):[]};
  if(ref.path.includes('/dashboardIdeas/')){const item=ideas[ref.path.split('/').pop()];return {exists:()=>Boolean(item),data:()=>item};}
  if(ref.path.endsWith('/tasks')) return {metadata:{fromCache:false},docs:owner==='alice'?tasks.map(task=>({id:task.id,data:()=>({...task})})):[]};
  if(ref.path.endsWith('/streaks'))return {metadata:{fromCache:false},docs:owner==='alice'?Object.entries(streaks).map(([id,value])=>({id,ref:{path:ref.path+'/'+id},data:()=>value})):[]};
  if(ref.path.includes('/streaks/'))return {exists:()=>Boolean(streaks[ref.path.split('/').pop()]),data:()=>streaks[ref.path.split('/').pop()]};
  if(ref.path.includes('/finance/'))return {metadata:{fromCache:false},exists:()=>true,data:()=>({transactions:[{type:'income',description:'Salary'}],checklist:[{done:true}],bills:[]})};
  return {metadata:{fromCache:false},exists:()=>owner==='alice',data:()=>plan};
}
export const serverTimestamp=()=>123;
export const setDoc=(ref,patch,options)=>runTransaction({},tx=>tx.set(ref,patch,options));
export const getDocs=async ref=>{if(window.failDelete)throw Error('permission-denied');return {docs:[{ref:{path:ref.path+'/image'}}]}};
export async function deleteDoc(ref){
 if(window.failDelete)throw Error('permission-denied');
 if(ref.path.split('/').length===4){const index=tasks.findIndex(task=>task.id===ref.path.split('/').pop());if(index>=0)tasks.splice(index,1);}
 window.writes++;window.writeLog.push({path:ref.path,deleted:true});
 sessionStorage.setItem('v2-fixture-saved',JSON.stringify({tasks:Object.fromEntries(tasks.map(task=>[task.id,task])),plan,ideas}));
 for(const listener of listeners)listener.next(snapshot(listener.ref));
}
export const writeBatch=()=>{const entries=[],deletes=[];return {delete:ref=>deletes.push(ref),set:(ref,patch)=>entries.push([ref,patch]),commit:async()=>{for(const ref of deletes)await deleteDoc(ref);if(entries.length)await runTransaction({},tx=>entries.forEach(([ref,patch])=>tx.set(ref,patch)))}}};

export async function runTransaction(_,callback) {
  const patches=[];
  const result=await callback({get:async ref=>{
    if(ref.path.includes('/tasks/')){const task=tasks.find(task=>task.id===ref.path.split('/').pop()&&task.id!==window.deletedTaskId);return {exists:()=>Boolean(task)&&ref.path.startsWith('users/alice/'),data:()=>structuredClone(task)};}
    return snapshot(ref);
  },set:(ref,patch,options)=>patches.push({path:ref.path,patch,merge:!!options?.merge}),update:(ref,patch)=>patches.push({path:ref.path,patch})});
  await new Promise(resolve=>setTimeout(resolve,100));
  if(window.failNextWrite){window.failNextWrite=false;throw Error('permission-denied');}
  for(const entry of patches){
    if(entry.path.includes('/tasks/')){const id=entry.path.split('/').pop(),task=tasks.find(task=>task.id===id);if(task)Object.assign(task,entry.patch);else tasks.push({id,...entry.patch});}
    else if(entry.path.includes('/dashboardIdeas/'))ideas[entry.path.split('/').pop()]=entry.merge?{...ideas[entry.path.split('/').pop()],...entry.patch}:entry.patch;
    else if(entry.path.includes('/streaks/'))streaks[entry.path.split('/').pop()]=entry.patch;
    else plan={...plan,...entry.patch};
  }
  window.writes+=patches.length;window.writeLog.push(...patches);
  sessionStorage.setItem('v2-fixture-saved',JSON.stringify({tasks:Object.fromEntries(tasks.map(task=>[task.id,task])),plan,ideas}));
  for(const listener of listeners)listener.next(snapshot(listener.ref));
  if(window.loseNextAck){window.loseNextAck=false;throw Error('unavailable');}
  return result;
}
window.taskRecords=()=>structuredClone(tasks);
window.remoteEditTask=(id,patch)=>{Object.assign(tasks.find(task=>task.id===id),patch);for(const listener of listeners)listener.next(snapshot(listener.ref));};
export function onSnapshot(ref, options, next, error) {
  if(typeof options==='function'){error=next;next=options;}
  const listener={ref,next,error};listeners.add(listener);window.reads.push(ref.path);
  const clock=setTimeout(()=>next(snapshot(ref)),35);
  return ()=>{clearTimeout(clock);listeners.delete(listener);};
}
window.emitTaskTitle=title=>{tasks[0].title=title;for(const entry of listeners)entry.next(snapshot(entry.ref));};
window.failSync=()=>{for(const entry of listeners)entry.error(Error('permission-denied'));};
window.listenerCount=()=>listeners.size;
`;
async function checkOrbGestures(browser, base, touch) {
  const context=await browser.newContext({viewport:touch?{width:393,height:852}:{width:1440,height:1000},hasTouch:touch,isMobile:touch});
  try {
    await context.addInitScript(()=>{
      const locate=WebGLRenderingContext.prototype.getUniformLocation;
      const uniform=WebGLRenderingContext.prototype.uniform2f;
      const influence=WebGLRenderingContext.prototype.uniform3f;
      const rotationLocations=new WeakSet(),influenceLocations=new WeakSet();
      WebGLRenderingContext.prototype.getUniformLocation=function(program,name){
        const location=locate.call(this,program,name);
        if(name==='rotation'&&location)rotationLocations.add(location);
        if(name==='influence'&&location)influenceLocations.add(location);
        return location;
      };
      WebGLRenderingContext.prototype.uniform2f=function(location,x,y){
        if(rotationLocations.has(location))window.orbYaw=x;
        return uniform.call(this,location,x,y);
      };
      WebGLRenderingContext.prototype.uniform3f=function(location,x,y,strength){
        if(influenceLocations.has(location))window.orbInfluence=x*strength*.24;
        return influence.call(this,location,x,y,strength);
      };
    });
    const page=await context.newPage();
    await page.route('https://**/*',route=>route.abort());
    await page.goto(base+'/fixture');
    const orb=page.locator('.v2-orb:not(.is-compact)');
    const assertWidth=width=>page.waitForFunction(expected=>{
      const element=document.querySelector('.v2-orb:not(.is-compact)');
      return element&&Math.abs(element.getBoundingClientRect().width-expected)<2;
    },width);
    const originalNarrowWidth=()=>page.locator('.v2-guide-scene').evaluate(scene=>Math.min(scene.clientWidth*.85,544));
    await assertWidth(touch?await originalNarrowWidth():754.6875*.85);
    const ratio=await orb.evaluate(element=>{
      const globe=element.querySelector('.focus-orb-3d').getBoundingClientRect();
      const anchor=element.getBoundingClientRect();
      const shortcuts=document.querySelector('.v2-constellation').getBoundingClientRect();
      return {globe:globe.width/anchor.width,shortcuts:shortcuts.width/anchor.width};
    });
    assert.ok(Math.abs(ratio.globe-(touch?1.48:1.628))<.005,'Only the desktop particle field grows');
    assert.ok(Math.abs(ratio.shortcuts-1)<.005,'The shortcut layout aligns with the globe anchor');
    await orb.locator('[data-ready=true]').waitFor();
    await page.waitForTimeout(2300);
    const {x,y}=await orb.evaluate(element=>{
      const rect=element.getBoundingClientRect();
      const controls=[...document.querySelectorAll('.v2-constellation a,.v2-constellation button,.v2-orb-plan')]
        .filter(control=>control.getClientRects().length)
        .map(control=>control.getBoundingClientRect());
      let best;
      for(let row=.12;row<.9;row+=.025)for(let column=.15;column<.72;column+=.025){
        const x=Math.round(rect.left+rect.width*column);
        const y=Math.round(rect.top+rect.height*row);
        if(Math.hypot(column-.5,row-.5)>=.44||![0,12,24,36,48,60,72].every(dx=>
          document.elementFromPoint(x+dx,y)?.matches('.v2-orb-grab')))continue;
        const clearance=Math.min(...controls.map(control=>Math.hypot(
          Math.max(control.left-x,x-control.right,0),Math.max(control.top-y,y-control.bottom,0))));
        if(!best||clearance>best.clearance)best={x,y,clearance};
      }
      if(!best)throw new Error('No exposed strip on the globe');
      return best;
    });
    const dragState=()=>orb.getAttribute('data-dragging');
    const yaw=()=>page.evaluate(()=>window.orbYaw-window.orbInfluence);
    const assertCoasts=async(threshold=.25,releaseYaw)=>{
      const start=releaseYaw??await yaw();
      await page.waitForFunction(({start,threshold})=>{
        const delta=window.orbYaw-window.orbInfluence-start;
        return Math.atan2(Math.sin(delta),Math.cos(delta))>threshold;
      },{start,threshold},{timeout:1600});
    };
    if(touch){
      const session=await context.newCDPSession(page);
      const send=(type,touchPoints)=>session.send('Input.dispatchTouchEvent',{type,touchPoints});
      assert.equal(await page.locator('.v2-orb-grab').evaluate(element=>getComputedStyle(element).touchAction),'none');
      await send('touchStart',[{x,y}]);
      assert.equal(await dragState(),'true');
      await send('touchMove',[{x:x+24,y}]);
      await send('touchMove',[{x:x+72,y}]);
      await send('touchEnd',[]);
      await assertCoasts();
      const panelLinks=page.getByRole('navigation',{name:'Dashboard panels'});
      await panelLinks.getByRole('button',{name:'Session'}).click();
      await page.waitForFunction(()=>{
        const track=document.querySelector('.v2-guide-scene');
        return track.scrollLeft>track.clientWidth*1.8;
      });
      await panelLinks.getByRole('button',{name:'Globe'}).click();
      await page.waitForFunction(()=>document.querySelector('.v2-guide-scene').scrollLeft<2);
      await assertWidth(await originalNarrowWidth());
    }else{
      await page.mouse.move(x,y);
      await page.mouse.down();
      assert.equal(await dragState(),'true');
      await page.evaluate(()=>document.addEventListener('pointerup',()=>{
        window.orbReleaseYaw=window.orbYaw-window.orbInfluence;
      },{once:true}));
      await page.mouse.move(x+83,y);
      await page.mouse.up();
      await assertCoasts(.08,await page.evaluate(()=>window.orbReleaseYaw));
      await page.waitForTimeout(1800);
      await page.mouse.move(x,y);
      await page.waitForTimeout(400);
      await page.mouse.move(x+1,y);
      await page.mouse.move(x+65,y);
      await page.mouse.move(x+72,0);
      await assertCoasts(.035);
    }
    assert.equal(await dragState(),null);
    if(!touch){
      const icon=await page.locator('.v2-page-point[data-page="ai"] .v2-page-glow').boundingBox();
      await page.mouse.move(icon.x+icon.width/2,icon.y+icon.height/2);
      await page.mouse.down();
      assert.equal(await dragState(),null,'app icons keep their own pointer handling');
      await page.mouse.move(5,5);
      await page.mouse.up();
      await page.setViewportSize({width:1280,height:600});
      await assertWidth(452.8125*.85);
    }
  }finally{await context.close();}
}

async function checkGlobeWithoutWebGL(browser,base) {
  const context=await browser.newContext({viewport:{width:1280,height:720},reducedMotion:'reduce'});
  try{
    await context.addInitScript(()=>{
      const getContext=HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext=function(kind,...options){
        return kind==='webgl'?null:getContext.call(this,kind,...options);
      };
    });
    const page=await context.newPage();
    await page.route('https://**/*',route=>route.abort());
    await page.goto(base+'/fixture');
    const grab=page.locator('.v2-orb-grab');
    const point=await grab.evaluate(element=>{
      const rect=element.getBoundingClientRect();
      for(let row=.20;row<.8;row+=.05)for(let column=.25;column<.75;column+=.05){
        const x=rect.left+rect.width*column,y=rect.top+rect.height*row;
        if(document.elementFromPoint(x,y)===element)return {x,y};
      }
      throw new Error('No exposed globe drag target');
    });
    await page.mouse.move(point.x,point.y);
    await page.mouse.down();
    await page.locator('.v2-orb[data-dragging=true]').waitFor();
    await page.mouse.move(point.x+95,point.y,{steps:2});
    await page.mouse.up();
    const angle=await page.locator('.focus-orb-3d').evaluate(element=>parseFloat(element.style.getPropertyValue('--fallback-turn')));
    await page.waitForFunction(start=>{
      const angle=parseFloat(document.querySelector('.focus-orb-3d').style.getPropertyValue('--fallback-turn'));
      return Math.atan2(Math.sin(angle-start),Math.cos(angle-start))>.15;
    },angle);
  }finally{await context.close();}
}

(async () => {
  fs.mkdirSync(output,{recursive:true});
  await esbuild.build({
    stdin:{contents:"import './react/src/app-shell.css';import './react/v2/main.jsx';",resolveDir:root,loader:'jsx'},bundle:true,outfile:path.join(output,'fixture.js'),jsx:'automatic',
    plugins:[{name:'read-only-fixture',setup(build){
      build.onResolve({filter:/firebase$/},args=>args.path==='../src/firebase'||args.path==='./firebase'?{path:'auth',namespace:'fixture'}:null);
      build.onResolve({filter:/^firebase\/firestore$/},()=>({path:'firestore',namespace:'fixture'}));
      build.onLoad({filter:/.*/,namespace:'fixture'},args=>({contents:args.path==='auth'?authMock:firestoreMock,loader:'js'}));
    }}],
  });
  const server=http.createServer((req,res)=>{
    const url=new URL(req.url,'http://localhost');
    if(url.pathname.endsWith('/'))url.pathname+='index.html';
    if(url.pathname==='/fixture'){res.setHeader('Content-Type','text/html');res.end('<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/fixture.css"></head><body><div id="root"></div><script src="/fixture.js"></script></body></html>');return;}
    const file=url.pathname==='/fixture.js'||url.pathname==='/fixture.css'?path.join(output,url.pathname.slice(1)):
      url.pathname.startsWith('/invincible/v2/')?path.join(root,buildDirectory,url.pathname.slice('/invincible/v2/'.length)||'index.html'):url.pathname.startsWith('/invincible/')?path.join(root,url.pathname.slice('/invincible/'.length)||'index.html'):null;
    if(!file||!fs.existsSync(file)){res.statusCode=404;res.end('Not found');return;}
    res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html');
    res.end(fs.readFileSync(file));
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+server.address().port;
  try {
    const engines = (smokeOnly ? [['chromium',chromium]] : [['chromium',chromium],['firefox',firefox]]).filter(([name])=>!process.env.V2_TEST_BROWSER||name===process.env.V2_TEST_BROWSER);
    for(const [name,engine] of engines) {
      const browser=await engine.launch({headless:true});
      try {
        if (!smokeOnly) await require('./v2-canvas-scenarios.cjs')({browser,base,output,name});
        if (process.env.V2_CANVAS_ONLY === '1') continue;
        if (process.env.V2_PLAN_ONLY === '1') {await require('./v2-plan-scenarios.cjs')({browser,base,output,name}); continue;}
        if(name==='chromium'){
          await checkOrbGestures(browser,base,false);
          await checkOrbGestures(browser,base,true);
          await checkGlobeWithoutWebGL(browser,base);
        }
        const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
        const page=await context.newPage(), errors=[];
        page.on('pageerror',error=>errors.push(error.message));
        await page.route('https://**/*',route=>route.abort());
        await page.goto(base+'/fixture');
        await page.locator('.v2-guide-mission h2').getByText('Build the living workspace').waitFor();
        assert.equal(await page.getByRole('navigation',{name:'Explore spaces'}).getByRole('link').count(),2);
        assert.equal(await page.locator('.focus-orb-3d canvas').count(),1);
        await page.waitForFunction(()=>!document.querySelector('.v2-orb').classList.contains('is-compact'));
        await page.waitForFunction(()=>{
          const canvas=document.querySelector('.v2-ambient-field.has-globe > canvas');
          return canvas&&canvas.dataset.particleCount==='144'&&getComputedStyle(canvas).maskImage.startsWith('radial-gradient(');
        });
        await page.evaluate(()=>window.originalOrb=document.querySelector('.focus-orb-3d canvas'));
        await page.waitForTimeout(150);
        if(await page.locator('.focus-orb-3d').getAttribute('data-ready')==='true') {
          const orbRect=await page.locator('.v2-orb').boundingBox();
          const point=await page.locator('.v2-orb-grab').evaluate(element=>{
            const rect=element.getBoundingClientRect();
            for(let row=.16;row<=.82;row+=.04)for(let column=.2;column<=.8;column+=.04){
              const x=rect.left+rect.width*column,y=rect.top+rect.height*row;
              if(document.elementFromPoint(x,y)===element)return {x,y};
            }
            throw new Error('No exposed globe drag target');
          });
          await page.mouse.move(point.x,point.y);
          await page.mouse.down();
          assert.equal(await page.locator('.v2-orb').getAttribute('data-dragging'),'true','dragging the particle field captures the pointer');
          await page.mouse.move(orbRect.x+orbRect.width/2+24,orbRect.y+orbRect.height*.12+15);
          await page.mouse.up();
          assert.equal(await page.locator('.v2-orb').getAttribute('data-dragging'),null);
        } else {
          assert.equal(await page.locator('.orb-3d-fallback').count(),1);
        }
        await page.waitForFunction(()=>window.reads.some(path=>path.includes('/streaks')));
        assert.deepEqual(await page.evaluate(()=>[...new Set(window.reads)].map(value=>value.split('/').slice(0,3).join('/')).sort()),['users/alice/dailyPlans','users/alice/finance','users/alice/streaks','users/alice/tasks']);
        assert.equal(await page.evaluate(()=>window.writes),0);
        assert.equal(await page.evaluate(()=>getComputedStyle(document.body).paddingTop),'0px','main dashboard has no legacy shell header gap');
        assert.equal(await page.evaluate(()=>getComputedStyle(document.body).paddingBottom),'0px','main dashboard has no legacy shell bottom-nav gap');

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
        assert.ok(Object.values(positions).every(({x,y})=>Math.hypot(x-.5,y-.5)<.35),'Shortcut centers stay inside the rim');
        assert.equal(await page.locator('.focus-orb-3d.orb-theme-cyan').count(),1,'Fresh preferences default to cyan');
        const corners=await page.evaluate(()=>{
          const bounds=selector=>document.querySelector(selector).getBoundingClientRect();
          const orb=bounds('.v2-orb');
          const left=bounds('.v2-guide-mission'),timer=bounds('.v2-guide-timer'),work=bounds('.v2-guide-work');
          const borders=['.v2-guide-mission','.v2-guide-timer','.v2-guide-work'].map(selector=>{
            const style=getComputedStyle(document.querySelector(selector));
            return [style.borderTopWidth,style.borderRightWidth,style.borderBottomWidth,style.borderLeftWidth];
          });
          return {borders,leftMargin:left.left,rightMargins:[innerWidth-timer.right,innerWidth-work.right],
            widths:[left.width,timer.width,work.width],gaps:[orb.left-left.right,timer.left-orb.right,work.left-orb.right]};
        });
        assert.ok([corners.leftMargin,...corners.rightMargins].every(margin=>margin>=24&&margin<=48));
        assert.ok(corners.widths.every(width=>width>=290),'Desktop cards have room for their content');
        assert.ok(corners.gaps.every(gap=>gap>=48),'Desktop cards clear the globe');
        assert.deepEqual(corners.borders,[['1px','1px','1px','0px'],['1px','0px','1px','1px'],['1px','0px','1px','1px']]);
        for(const [width,height] of [[1920,900],[1024,600]]){
          await page.setViewportSize({width,height});
          const cards=await page.evaluate(()=>{
            const get=selector=>document.querySelector(selector);
            const bounds=selector=>get(selector).getBoundingClientRect();
            const font=selector=>parseFloat(getComputedStyle(get(selector)).fontSize);
            return {focus:bounds('.v2-guide-mission').height,timer:bounds('.v2-guide-timer').height,
              workspace:bounds('.v2-guide-work').height,gap:bounds('.v2-guide-work').top-bounds('.v2-guide-timer').bottom,
              heading:font('.v2-guide-kicker'),label:font('.v2-guide-statuses'),control:font('.v2-guide-work-link')};
          });
          assert.ok(cards.focus>=128&&cards.timer>=148&&cards.workspace>=180,JSON.stringify(cards));
          assert.ok(cards.gap>=24, 'Right-side cards stay separated on a short laptop screen');
          assert.ok(cards.heading>=14&&cards.label>=14&&cards.control>=15, 'Card text stays readable at desktop widths');
        }
        await page.setViewportSize({width:1440,height:1000});
        await page.getByRole('button',{name:'Open current task: Build the living workspace'}).click();
        await page.getByRole('region',{name:'Task workspace: Build the living workspace'}).waitFor();
        await page.setViewportSize({width:1920,height:1080});
        const taskLayout=await page.evaluate(()=>{
          const canvas=document.querySelector('.v2-flow-canvas'),rail=document.querySelector('.v2-flow-rail'),nodes=document.querySelectorAll('.v2-flow-node');
          return {canvasVisible:getComputedStyle(canvas).display!=='none',railVisible:getComputedStyle(rail).display!=='none',nodes:nodes.length,outer:document.documentElement.scrollWidth<=innerWidth+1};
        });
        assert.equal(taskLayout.canvasVisible,true,'wide task workspace shows the spatial canvas');
        assert.equal(taskLayout.railVisible,true,'wide task workspace shows its slim step navigator');
        assert.equal(taskLayout.nodes,2,'wide task workspace renders every saved step as a node');
        assert.equal(taskLayout.outer,true);
        const worldBefore=await page.locator('.v2-flow-world').getAttribute('style');
        await page.locator('.v2-flow-canvas').hover();
        await page.mouse.wheel(0,-180);
        await page.waitForFunction(before=>document.querySelector('.v2-flow-world')?.getAttribute('style')!==before,worldBefore);
        const nodeWrap=page.locator('.v2-flow-node-wrap').first(),nodeStyleBefore=await nodeWrap.getAttribute('style');
        const nodeBefore=await page.getByRole('button',{name:/Open step 1:/}).boundingBox();
        await page.mouse.move(nodeBefore.x+nodeBefore.width/2,nodeBefore.y+nodeBefore.height/2);
        await page.mouse.down(); await page.mouse.move(nodeBefore.x+nodeBefore.width/2+36,nodeBefore.y+nodeBefore.height/2+18,{steps:3}); await page.mouse.up();
        await page.waitForFunction(before=>document.querySelector('.v2-flow-node-wrap')?.getAttribute('style')!==before,nodeStyleBefore);
        assert.notEqual(await nodeWrap.getAttribute('style'),nodeStyleBefore,'workflow nodes can be repositioned');
        await page.getByRole('button',{name:'Fit workflow'}).click();
        await page.screenshot({path:path.join(output,name+'-task-focus-wide.png')});
        await page.setViewportSize({width:393,height:852});
        const mobileTaskLayout=await page.evaluate(()=>{
          const canvas=document.querySelector('.v2-flow-canvas'),mobile=document.querySelector('.v2-flow-mobile');
          return {canvasHidden:getComputedStyle(canvas).display==='none',mobileVisible:getComputedStyle(mobile).display!=='none',outer:document.documentElement.scrollWidth<=innerWidth+1};
        });
        assert.equal(mobileTaskLayout.canvasHidden,true,'mobile task workspace simplifies the freeform canvas');
        assert.equal(mobileTaskLayout.mobileVisible,true,'mobile task workspace shows the touch-friendly workflow');
        assert.equal(mobileTaskLayout.outer,true);
        await page.screenshot({path:path.join(output,name+'-task-focus-phone.png')});
        await page.setViewportSize({width:1440,height:1000});
        await page.getByRole('button',{name:/Close saved work/}).click();
        if(smokeOnly) {
          await page.getByRole('link',{name:'01 Main Dashboard'}).click();
          await page.waitForFunction(()=>{
            const orb=document.querySelector('.v2-orb:not(.is-compact)');
            return orb&&Math.abs(orb.getBoundingClientRect().left+orb.getBoundingClientRect().width/2-innerWidth/2)<2;
          });
          await page.screenshot({path:path.join(output,name+'-map.png')});
          assert.equal(await page.getByRole('button',{name:"Open today's plan"}).count(),1,'the Orb center does not repeat a current-task label');
          const centered=await page.evaluate(()=>{
            const orb=document.querySelector('.v2-orb').getBoundingClientRect();
            const task=document.querySelector('.v2-orb-task').getBoundingClientRect();
            return Math.abs((orb.left+orb.width/2)-(task.left+task.width/2));
          });
          assert.ok(centered<2,'the active task control stays centered on the Orb');
          assert.deepEqual(errors,[]);
          await context.close();
          console.log(name+': V2 cosmetic dashboard smoke check passed');
          continue;
        }
        const travelPage=await context.newPage();
        await travelPage.goto(base+'/fixture');
        await travelPage.locator('.v2-page-point[data-page="ai"]').click();
        await travelPage.waitForURL(base+'/invincible/ai/');
        await travelPage.goBack();
        await travelPage.locator('.v2-page-point[data-page="ai"]').waitFor();
        assert.equal(await travelPage.locator('.v2-travel').count(),0);
        await travelPage.close();

        // Dashboard content stays fixed; the two finite workspace regions retain navigation.
        assert.equal(await page.locator('.v2-free-canvas,.v2-canvas-tools').count(),0);

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
        await page.getByRole('button',{name:/^Resume/}).click();
        await page.getByRole('region',{name:/Task workspace/}).waitFor();
        assert.match(await page.getByLabel('Step 1 notes',{exact:true}).inputValue(),/Keep the original data/);
        await page.locator('.v2-task-route-select').filter({hasText:'Inspect existing records'}).click();
        assert.equal(await page.getByLabel('Step 2 title',{exact:true}).inputValue(),'Inspect existing records');
        assert.equal(new URL(page.url()).hash,'#dashboard');
        await page.keyboard.press('Escape');
        assert.equal(await page.getByRole('region',{name:/Task workspace/}).count(),0);
        assert.match(await page.evaluate(()=>document.activeElement.textContent),/^Resume/);

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
          if(width>=901){
            const originalWidth=Math.max(420,Math.min(width*.70,height*.875,1120));
            assert.ok(Math.abs(scene.orbWidth-originalWidth*.8625*.85)<2,name+' '+width+' desktop Orb at the reduced size');
          }else{
            const originalWidth=await page.locator('.v2-guide-scene').evaluate(element=>Math.min(element.clientWidth*.85,544));
            assert.ok(Math.abs(scene.orbWidth-originalWidth)<2,name+' '+width+' reduced narrow Orb size');
          }
          if(width>=1101) assert.ok(scene.missionRight<scene.orbLeft+scene.orbWidth*.25,name+' '+width+' mission keeps clear space for Orb');
          if([393,1280,1366,1440,1870,1920,2560].includes(width)){await page.screenshot({path:path.join(output,name+'-'+width+'.png')});}
          if(width===393){
            assert.equal(await page.locator('.v2-page-point').count(),9);
            assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
            await page.screenshot({path:path.join(output,name+'-phone-map.png')});
          }
          await page.getByRole('link',{name:'02 My Workspace'}).click();
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
        assert.equal(await page.locator('#v2-region-dashboard output[aria-label="Time remaining"]').textContent(),'25:00');
        await page.getByRole('button',{name:'Profile and settings',exact:true}).click();
        await page.getByRole('button',{name:'Settings',exact:true}).click();await page.getByRole('heading',{name:'App updates'}).waitFor();await page.keyboard.press('Escape');
        await page.getByRole('button',{name:'Profile and settings',exact:true}).click();
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
        await movePage.evaluate(()=>{
          window.dragTrace=[];
          for(const name of ['dragstart','dragenter','dragover','drop','dragend'])document.addEventListener(name,event=>window.dragTrace.push({name,lane:event.target.closest?.('.v2-lane')?.dataset.status,task:event.target.closest?.('[data-task-id]')?.dataset.taskId}),true);
        });
        const dragCardTo = async status => {
          const source = await card('t1').locator('.v2-task-card').boundingBox();
          const destination = await movePage.locator(`.v2-lane[data-status="${status}"] .v2-lane-header`).boundingBox();
          await movePage.mouse.move(source.x+20,source.y+20);
          await movePage.mouse.down();
          await movePage.mouse.move(source.x+40,source.y+24,{steps:4});
          await movePage.mouse.move(destination.x+destination.width/2,destination.y+destination.height/2,{steps:12});
          await movePage.mouse.move(destination.x+destination.width/2+1,destination.y+destination.height/2+1);
          await movePage.mouse.up();
        };
        await dragCardTo('In Progress');
        try {await movePage.getByRole('status').filter({hasText:'Moved to In Progress.'}).waitFor();}
        catch(error){console.log(name,'native drag trace',await movePage.evaluate(()=>window.dragTrace));await movePage.screenshot({path:path.join(output,name+'-native-drag-failure.png')});throw error;}
        assert.equal(await movePage.locator('.v2-lane[data-status="In Progress"] [data-task-id="t1"]').count(),1);
        assert.equal(await movePage.evaluate(()=>window.writeLog[0].path),'users/alice/tasks/t1');
        assert.deepEqual(await movePage.evaluate(()=>Object.keys(window.writeLog[0].patch).sort()),['status','updatedAt']);
        await movePage.reload();
        await movePage.locator('.v2-lane[data-status="In Progress"] [data-task-id="t1"]').waitFor();
        await dragCardTo('In Progress');
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
        await movePage.getByRole('link',{name:'01 Main Dashboard'}).click();
        await movePage.locator('.v2-guide-mission h2').getByText('Build the living workspace').waitFor();
        await movePage.getByRole('link',{name:'02 My Workspace'}).click();
        await card('t1').locator('.v2-task-card').click();
        assert.match(await movePage.getByLabel('Step 1 notes',{exact:true}).inputValue(),/Keep the original data/);
        await movePage.keyboard.press('Escape');
        const writes=await movePage.evaluate(()=>window.writes);
        await movePage.evaluate(()=>window.deletedTaskId='t1');
        await card('t1').locator('select').selectOption('Backlog');
        await movePage.getByRole('alert').waitFor();
        assert.equal(await movePage.evaluate(()=>window.writes),writes,'a deleted task is never recreated by a move');
        await movePage.evaluate(()=>{window.deletedTaskId=null;window.failDelete=true;});
        movePage.once('dialog',dialog=>dialog.dismiss());await card('t1').getByRole('button',{name:/^Delete /}).click();
        assert.equal(await card('t1').count(),1,'cancelling deletion keeps the task');
        movePage.once('dialog',dialog=>dialog.accept());await card('t1').getByRole('button',{name:/^Delete /}).click();
        await movePage.getByRole('alert').filter({hasText:'could not be deleted'}).waitFor();
        assert.equal(await card('t1').count(),1,'denied deletion keeps the card for retry');
        await movePage.evaluate(()=>window.failDelete=false);
        movePage.once('dialog',dialog=>dialog.accept());await card('t1').getByRole('button',{name:/^Delete /}).click();
        await card('t1').waitFor({state:'detached'});
        assert.equal(await movePage.evaluate(()=>window.taskRecords().some(task=>task.id==='t1')),false);
        assert.ok(await movePage.evaluate(()=>window.writeLog.some(entry=>entry.deleted&&entry.path==='users/alice/tasks/t1/assets/image')),'task attachment is deleted');
        assert.ok(await movePage.evaluate(()=>window.taskRecords().some(task=>task.id==='t0')),'other tasks are preserved');
        await movePage.reload();await movePage.getByRole('link',{name:'02 My Workspace'}).click();
        await movePage.locator('[data-task-id="t0"]').waitFor();assert.equal(await card('t1').count(),0,'deletion survives reload');
        await movePage.close();
        const compactPage=await context.newPage();await compactPage.setViewportSize({width:393,height:852});await compactPage.goto(base+'/fixture');
        await compactPage.locator('.v2-guide-mission h2').waitFor();
        assert.equal(await compactPage.locator('.v2-connection').count(),0,'healthy connection has no banner');
        await compactPage.evaluate(()=>window.switchAccount('bob'));
        await compactPage.locator('.v2-guide-empty').waitFor();
        assert.equal(await compactPage.getByText('Make space for your next move.',{exact:true}).count(),0);
        assert.ok(await compactPage.locator('.v2-guide-orb-label').evaluate(e=>e.getBoundingClientRect().top-document.querySelector('.v2-guide-scene').getBoundingClientRect().top<50),'colour selector stays at the top');
        await compactPage.screenshot({path:path.join(output,'compact-empty-phone.png'),fullPage:true});await compactPage.close();
        const toolsPage=await context.newPage();await toolsPage.goto(base+'/fixture');
        await toolsPage.getByRole('button',{name:'Notifications: no pending reminders',exact:true}).click();
        await toolsPage.getByRole('dialog',{name:'You’re all caught up.'}).waitFor();
        await toolsPage.getByRole('button',{name:'Close',exact:true}).click();
        await toolsPage.getByLabel('Daily tools',{exact:true}).click();
        await toolsPage.getByRole('button',{name:'body streak: 0 days',exact:true}).click();
        await toolsPage.getByRole('button',{name:'body streak: 1 days',exact:true}).waitFor();
        assert.equal(await toolsPage.getByRole('button',{name:'body streak: 1 days',exact:true}).getAttribute('aria-pressed'),'true');
        assert.ok(await toolsPage.evaluate(()=>window.writeLog.some(entry=>entry.path==='users/alice/streaks/body')));
        await toolsPage.getByRole('button',{name:'body streak: 1 days',exact:true}).click();
        await toolsPage.getByRole('button',{name:'body streak: 0 days',exact:true}).waitFor();
        await toolsPage.close();
        await require('./v2-plan-scenarios.cjs')({browser,base,output,name});

        // Actual production bundle: anonymous startup, no test adapter or auto sign-in.
        await page.goto(base+'/invincible/v2/#workspace');
        await page.getByRole('button',{name:'Continue with Google'}).waitFor();
        await page.goto(base+'/invincible/');
        await page.getByRole('button',{name:'Continue with Google'}).waitFor();
        assert.equal(await page.evaluate(()=>typeof window.switchAccount),'undefined');
        assert.deepEqual(errors,[]);
        await page.goto(base+'/invincible/v2/');
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
          const dashboardTrack=await touchPage.locator('.v2-guide-scene').boundingBox();
          const swipeY=Math.round(dashboardTrack.y+dashboardTrack.height-12);
          await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:350,y:swipeY}]});
          for(let x=330;x>=70;x-=20){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:swipeY}]});await touchPage.waitForTimeout(20);}
          await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
          await touchPage.waitForFunction(()=>document.querySelector('.v2-guide-scene').scrollLeft>100);
          assert.ok(await touchPage.locator('.v2-canvas').evaluate(canvas=>canvas.scrollLeft<2),'Dashboard swipes stay within its panel track');
          assert.equal(await touchPage.locator('.v2-free-canvas').count(),0,'Touch navigation remains bounded to the two workspace regions');
          await touchPage.getByRole('link',{name:'02 My Workspace'}).click();
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
