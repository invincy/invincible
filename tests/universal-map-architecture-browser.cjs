// End-to-end Chromium checks for universal Map Editor architecture, plugins, rollback and multi-tab revision protection.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright'),root=path.resolve(__dirname,'..');

const tinyPngBase64='iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAEklEQVR42mNk+M9Qz0AEYBxVSF8AxQEJ+Qf5AAAAAElFTkSuQmCC';

const firebaseFixture=[
 "export const db={},auth={currentUser:{uid:'owner',email:'owner@example.com'}},authReady=Promise.resolve();export async function observeAuth(callback){queueMicrotask(()=>callback(auth.currentUser));return()=>{}}export const storageError=error=>error?.code==='revision-conflict'||error?.code==='failed-precondition'||error?.code==='aborted'?'This project was updated in another session or tab. Reload the latest cloud copy before overwriting.':'Save failed.';",
 "let listeners=[];const read=()=>JSON.parse(localStorage.getItem('test.creator')||'{}');",
 "window.addEventListener('storage',e=>{if(e.key==='test.creator')listeners.forEach(fn=>fn());});",
 "export const doc=(db,...parts)=>parts.join('/');export const collection=(db,name)=>name;export const where=(...args)=>args;export const query=(collection,...filters)=>({collection,filters});export const serverTimestamp=()=>Date.now();",
 "function snapshot(ref){const data=read();if(typeof ref==='string')return {exists:()=>Object.prototype.hasOwnProperty.call(data,ref),data:()=>data[ref],metadata:{hasPendingWrites:false,fromCache:false}};return {docs:Object.entries(data).filter(([key,value])=>key.startsWith('creatorProjects/')&&ref.filters.every(([field,op,wanted])=>op==='=='?value[field]===wanted:value[field]?.includes(wanted))).map(([key,value])=>({id:key.split('/')[1],data:()=>value}))};}",
 "export async function getDoc(ref){return snapshot(ref)}export async function getDocs(ref){return snapshot(ref)}",
 "export function onSnapshot(ref,...args){const callback=args.find(item=>typeof item==='function');const listener=()=>callback(snapshot(ref));listeners.push(listener);queueMicrotask(listener);return()=>listeners=listeners.filter(item=>item!==listener);}",
 "export async function runTransaction(db,fn){window.writes=(window.writes||0)+1;await new Promise(resolve=>setTimeout(resolve,window.saveDelay||20));if(window.failSave)throw Object.assign(Error('denied'),{code:'permission-denied'});const reads=new Map(),writes=[];const result=await fn({async get(ref){const snap=snapshot(ref);reads.set(ref,snap.exists()?JSON.stringify(snap.data()):null);return snap;},set(ref,value){writes.push([ref,value]);}});const all=read();for(const [ref,expected] of reads){const current=Object.prototype.hasOwnProperty.call(all,ref)?JSON.stringify(all[ref]):null;if(current!==expected)throw Object.assign(Error('aborted'),{code:'aborted'});}for(const [ref,value] of writes)all[ref]=value;localStorage.setItem('test.creator',JSON.stringify(all));listeners.forEach(fn=>fn());return result;}",
 "export async function setDoc(ref,value){const all=read();all[ref]={...all[ref],...value};localStorage.setItem('test.creator',JSON.stringify(all));listeners.forEach(fn=>fn());}",
 "export async function deleteDoc(ref){const all=read();delete all[ref];localStorage.setItem('test.creator',JSON.stringify(all));listeners.forEach(fn=>fn());}"
].join('\n');

const playerPageFixture=`<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#09111a}.stage{position:relative;width:480px;height:854px}</style><div class="stage" id="host"></div>`;
const mapEditorFixture=`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/invincible/creator/history-workspace.css"><style>body{margin:0;background:#0c1722;font-family:system-ui}.history-workspace{max-height:none}</style><div id="editor"></div><script type="module">import {mountMapEditor} from '/invincible/creator/map-editor.js';import {emptyMap} from '/invincible/creator/history-model.js';window.project={id:'p-edit',scenes:[{id:'s1',duration:4,voiceover:'Line one',voiceoverTimestamp:'00:00.000–00:04.000',visual:'Opening',productionMethods:['Voice'],completed:true},{id:'s2',duration:6,voiceover:'Line two',voiceoverTimestamp:'00:04.000–00:10.000',visual:'Body',productionMethods:['Voice'],completed:true}],historicalMap:{...emptyMap(),theme:'parchment',basemap:{id:'physical',labels:false,borders:false},overlayPreset:'legacy',overlayPolicy:{dateBanner:{height:52}}},custom:{keep:true}};window.changes=0;window.editor=mountMapEditor(document.querySelector('#editor'),{getProject:()=>project,onChange:()=>changes++,onAdvanced:()=>{}});</script>`;
const studioFixture=`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/invincible/creator/production-workbench.css"><link rel="stylesheet" href="/invincible/creator/video-studio/studio.css"><style>body{margin:0;background:#071426;font-family:system-ui}*{box-sizing:border-box}</style><div id="root"></div><script type="module">import {createProductionWorkbench} from '/invincible/creator/production-workbench.js';window.project={id:'studio-rollback',title:'Rollback Check',scenes:[],historicalMap:{version:1,theme:'night',events:[],features:{type:'FeatureCollection',features:[]},camera:[]}};window.workbench=createProductionWorkbench(document.querySelector('#root'),{getProject:()=>project,enableVideoStudio:true,getAccountId:()=>'owner',onChange:()=>{},copyText:async()=>{}});workbench.render();</script>`;

const testPluginSource=`
export const testPluginFactory = (project, spec, options) => ({
 policy: { scaling: 'shortEdge1080', attribution: { sourceCredit: options?.credit || 'Plugin Credit' } },
 async preload() { window.__pluginEvents.push('preload:' + (options?.tag || 'default')); },
 ready() { return window.__pluginReady !== false; },
 errors() { return window.__pluginError ? [window.__pluginError] : []; },
 render(ctx, state) {
  window.__pluginRenderCalls.push({ width: state.width, height: state.height, isPortrait: state.isPortrait, presetId: state.policy.presetId, credit: state.policy.attribution.sourceCredit });
  ctx.fillStyle = '#00ff88';
  ctx.fillRect(10, 100, 30, 30);
 },
 destroy() { window.__pluginDestroyed.push(options?.tag || 'default'); }
});
`;

const customDemoCatalog=JSON.stringify({
 format:'invincible-map-demos',
 version:1,
 demos:[
  {id:'british-india',title:'British India · Map engine demo',description:'Built-in standalone demo.',builtIn:true},
  {id:'custom-doc',title:'Custom Modular Demo',description:'Loaded cleanly via data catalog + adapter + optional plugin.',projectUrl:'./history-data/__test_project.json',adapterModule:'./history-data/__test_adapter.mjs',adapterExport:'adaptCustomDemo',pluginModule:'./history-data/__test_plugin.mjs',pluginExport:'customPluginFactory',pluginId:'custom-doc-plugin'}
 ]
});
const customPluginSource=`export const customPluginFactory = () => ({ policy:{ scaling:'shortEdge1080', attribution:{ sourceCredit:'Custom Catalog Source' } }, render(){ window.__customDemoPluginRendered = (window.__customDemoPluginRendered || 0) + 1; } });`;
const customAdapterSource=`export function adaptCustomDemo(raw, entry){ return { ...raw, title: entry.title }; }`;
const customProjectJson=JSON.stringify({
 scenes:[{id:'cs1',duration:5,voiceover:'Custom modular narration',visual:'Custom map view',productionMethods:['Animated Maps'],completed:false}],
 historicalMap:{version:1,theme:'night',basemap:{id:'physical',labels:false,borders:false},overlayPreset:'documentary',overlayPlugin:'custom-doc-plugin',events:[{id:'ev1',sceneId:'cs1',offset:0,label:'Custom Marker',date:'2026',coordinates:[78,22],sourceUrl:'https://example.org/src',sourceNote:'Synthetic catalog test marker.'}],features:{type:'FeatureCollection',features:[]},camera:[{sceneId:'cs1',offset:0,center:[78,22],zoom:4,bearing:0,pitch:0}]},
 productionClips:[],
 assets:[]
});

function wav(seconds=1){
 const rate=48000,frames=Math.round(rate*seconds),b=Buffer.alloc(44+frames*2);
 b.write('RIFF');b.writeUInt32LE(b.length-8,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(rate,24);b.writeUInt32LE(rate*2,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(frames*2,40);
 return b;
}

const server=http.createServer((req,res)=>{
 try{
  const pathname=new URL(req.url,'http://localhost').pathname;
  if(pathname==='/player-fixture'){res.setHeader('Content-Type','text/html; charset=utf-8');res.end(playerPageFixture);return;}
  if(pathname==='/map-editor-fixture'){res.setHeader('Content-Type','text/html; charset=utf-8');res.end(mapEditorFixture);return;}
  if(pathname==='/studio-fixture'){res.setHeader('Content-Type','text/html; charset=utf-8');res.end(studioFixture);return;}
  if(pathname==='/invincible/creator/history-data/__test_demos.json'){res.setHeader('Content-Type','application/json; charset=utf-8');res.end(customDemoCatalog);return;}
  if(pathname==='/invincible/creator/history-data/__test_plugin.mjs'){res.setHeader('Content-Type','text/javascript; charset=utf-8');res.end(customPluginSource);return;}
  if(pathname==='/invincible/creator/history-data/__test_adapter.mjs'){res.setHeader('Content-Type','text/javascript; charset=utf-8');res.end(customAdapterSource);return;}
  if(pathname==='/invincible/creator/history-data/__test_project.json'){res.setHeader('Content-Type','application/json; charset=utf-8');res.end(customProjectJson);return;}
  if(pathname==='/test-assets/ok.png'){res.setHeader('Content-Type','image/png');res.end(Buffer.from(tinyPngBase64,'base64'));return;}
  if(pathname==='/test-assets/fail.png'){res.statusCode=404;res.end('Missing');return;}
  if(pathname==='/fixture.mjs'||pathname==='/invincible/shared/firebase-client.js'){res.setHeader('Content-Type','text/javascript; charset=utf-8');res.end(firebaseFixture);return;}
  if(pathname==='/invincible/ai/'){res.setHeader('Content-Type','text/html; charset=utf-8');res.end('<body></body>');return;}
  const rel=pathname.replace(/^\/invincible\/?/,'');
  let file=path.resolve(root,rel);
  if(!file.startsWith(root+path.sep)&&file!==root)throw Error('path');
  if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  res.setHeader('Content-Type',file.endsWith('.html')?'text/html; charset=utf-8':/\.m?js$/.test(file)?'text/javascript; charset=utf-8':file.endsWith('.css')?'text/css; charset=utf-8':/\.(json|geojson)$/.test(file)?'application/json; charset=utf-8':file.endsWith('.png')?'image/png':file.endsWith('.svg')?'image/svg+xml':'application/octet-stream');
  let content=fs.readFileSync(file);
  if(/\.(html|m?js)$/.test(file)){
   const text=content.toString('utf8').replaceAll('https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js','/fixture.mjs');
   res.end(text);return;
  }
  res.end(content);
 }catch{res.statusCode=404;res.end('Missing');}
});

(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base='http://127.0.0.1:'+server.address().port;
 let browser;
 try{
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--enable-unsafe-swiftshader']});
  const errors=[];

  // 1. Overlay presets, shortEdge1080 scaling, optional plugin lifecycle, and route arrowhead guard.
  {
   const ctx=await browser.newContext({viewport:{width:900,height:960}});
   const page=await ctx.newPage();
   page.on('pageerror',e=>errors.push('player:'+e.message));
   await page.route('https://**/*',r=>r.abort());
   await page.goto(base+'/player-fixture');
   const result=await page.evaluate(async pluginSrc=>{
    const {createHistoryPlayer,registerMapOverlayPlugin,getMapOverlayPlugin,unregisterMapOverlayPlugin}=await import('/invincible/creator/history-player.js');
    const pluginMod=await import(URL.createObjectURL(new Blob([pluginSrc],{type:'text/javascript'})));
    window.__pluginEvents=[];window.__pluginDestroyed=[];window.__pluginRenderCalls=[];
    window.__pluginReady=true;window.__pluginError='';

    registerMapOverlayPlugin('test.alpha',pluginMod.testPluginFactory);
    registerMapOverlayPlugin('test.beta',pluginMod.testPluginFactory);

    const project={
     title:'Overlay Test',
     scenes:[{id:'s1',duration:6,voiceover:'One',visual:'Scene 1',productionMethods:['Animated Maps']}]
    };
    const baseSpec={
     version:1,
     theme:'night',
     basemap:{id:'physical',labels:false,borders:false},
     overlayPlugin:{id:'test.alpha',options:{tag:'A',credit:'Alpha Credit'}},
     events:[{id:'e1',sceneId:'s1',offset:0,label:'Capital',date:'1761 CE',coordinates:[77.2,28.6],sourceUrl:'https://example.org/e1',sourceNote:'Test event.'}],
     features:{type:'FeatureCollection',features:[]},
     camera:[{sceneId:'s1',offset:0,center:[77.2,28.6],zoom:4,bearing:0,pitch:0}],
     visual:{
      version:1,
      assets:[],
      layers:[
       {id:'ev-layer',kind:'event',ref:'e1',name:'Capital',visible:true,opacity:1,color:'#ffcc00'},
       // Fade-in ensures alpha === 0 at t = 0 while fade-in exercises alpha <= 0.01 arrowhead guard.
       {id:'rt-layer',kind:'route',name:'Fade route',classification:'illustrative',visible:true,opacity:1,color:'#ffee88',sceneId:'s1',offset:0,duration:5,revealDuration:5,fadeIn:2,fadeOut:0,coordinates:[[76,28],[78,29]]}
      ]
     }
    };

    const player=await createHistoryPlayer(document.getElementById('host'),project,baseSpec);
    await player.loaded;
    const legacyPolicy=player.overlayPolicy;
    player.seek(0);
    const alphaCallsAtLoad=window.__pluginRenderCalls.at(-1);

    // Readiness gate & error surfacing on settleFrame when plugin isn't ready / reports errors.
    window.__pluginReady=false;
    setTimeout(()=>{window.__pluginReady=true;},40);
    await player.settleFrame();
    window.__pluginError='Plugin texture missing';
    let caughtError='';
    try{await player.settleFrame();}catch(err){caughtError=err.message;}
    window.__pluginError='';

    // Switch to documentary preset and plugin beta: verify old plugin destroy & CSS coordinate contract.
    await player.setSpec({
     ...baseSpec,
     overlayPreset:'documentary',
     overlayPlugin:{id:'test.beta',options:{tag:'B',credit:'Beta Credit'}}
    });
    player.seek(2.5);
    const docPolicy=player.overlayPolicy;
    const betaCall=window.__pluginRenderCalls.at(-1);
    const canvasPixels=document.querySelector('.history-overlay').getContext('2d').getImageData(12,102,1,1).data;

    player.destroy();
    const gotPlugin=typeof getMapOverlayPlugin('test.alpha')==='function';
    const removed=unregisterMapOverlayPlugin('test.alpha');
    unregisterMapOverlayPlugin('test.beta');

    return {
     legacyPreset:legacyPolicy.presetId,
     legacyMode:legacyPolicy.dateBanner.mode,
     docPreset:docPolicy.presetId,
     docScaling:docPolicy.scaling,
     docDateMode:docPolicy.dateBanner.mode,
     docEventMode:docPolicy.events.mode,
     alphaCallsAtLoad,
     betaCall,
     events:window.__pluginEvents,
     destroyed:window.__pluginDestroyed,
     caughtError,
     pixelGreen:canvasPixels[1],
     gotPlugin,
     removed
    };
   },testPluginSource);

   assert.equal(result.legacyPreset,'legacy');
   assert.equal(result.legacyMode,'bar');
   assert.equal(result.docPreset,'documentary');
   assert.equal(result.docScaling,'shortEdge1080');
   assert.equal(result.docDateMode,'pill');
   assert.equal(result.docEventMode,'card');
   assert.equal(result.caughtError,'Plugin texture missing');
   // Plugin receives CSS host dimensions (480x854) even under shortEdge1080 scaling.
   assert.equal(result.betaCall.width,480);
   assert.equal(result.betaCall.height,854);
   assert.equal(result.betaCall.isPortrait,true);
   assert.equal(result.betaCall.presetId,'documentary');
   assert.equal(result.betaCall.credit,'Beta Credit');
   assert.ok(result.events.includes('preload:A'));
   assert.ok(result.events.includes('preload:B'));
   assert.deepEqual(result.destroyed,['A','B']);
   assert.ok(result.pixelGreen>200,'Plugin render painted onto history overlay');
   assert.equal(result.gotPlugin,true);
   assert.equal(result.removed,true);
   await ctx.close();
  }

  // 2. Data-driven history-demo.html + custom catalog loading with no Panipat hardcoding.
  {
   const ctx=await browser.newContext({viewport:{width:1200,height:900}});
   const page=await ctx.newPage();
   page.on('pageerror',e=>errors.push('demo:'+e.message));
   await page.route('https://**/*',r=>r.abort());
   await page.goto(base+'/invincible/creator/history-demo.html');
   await page.waitForFunction(()=>[...document.querySelectorAll('#demoSelect option')].some(o=>o.value==='british-india'));
   assert.match(await page.title(),/British India/);
   assert.equal(await page.evaluate(async()=>{
    const {loadDemoProject}=await import('/invincible/creator/history-demo.js');
    const loaded=await loadDemoProject('custom-doc',{catalogUrl:'/invincible/creator/history-data/__test_demos.json'});
    return loaded.project.title+':'+loaded.project.historicalMap.overlayPlugin;
   }),'Custom Modular Demo:custom-doc-plugin');
   await page.route('**/invincible/creator/history-data/demos.json',async route=>{
    const response=await route.fetch({url:base+'/invincible/creator/history-data/__test_demos.json'});
    await route.fulfill({response});
   });
   await page.goto(base+'/invincible/creator/history-demo.html?project=custom-doc');
   await page.waitForFunction(()=>document.title.includes('Custom Modular Demo')&&window.__customDemoPluginRendered>0);
   await ctx.close();
  }

  // 3. Map Editor scene-bound import UI + atomic commit() rollback on style load failure.
  {
   const ctx=await browser.newContext({viewport:{width:1440,height:1000}});
   const page=await ctx.newPage();
   page.on('pageerror',e=>errors.push('map-editor:'+e.message));
   await page.route('https://**/*',r=>r.abort());
   await page.goto(base+'/map-editor-fixture');
   await page.waitForFunction(()=>document.querySelector('[data-editor-status]').textContent.startsWith('Drag artwork'));

   await page.getByRole('button',{name:'Import animation',exact:true}).click();
   await page.locator('[data-animation-bind-scenes]').check();
   const bindPlan={
    format:'invincible-map-animation',
    version:1,
    title:'Bound 2-Scene Animation',
    duration:10,
    aspectRatio:'9:16',
    basemap:'terrain',
    terrain:false,
    camera:[{time:0,center:[77,28],zoom:4},{time:8,center:[79,29],zoom:5}],
    layers:[{id:'marker',type:'symbol',icon:'fort',name:'Bound Fort',start:5,end:9,position:[79,29]}]
   };
   await page.locator('[data-animation-plan]').fill(JSON.stringify(bindPlan));
   await page.locator('[data-edit=animation-check]').click();
   assert.match(await page.locator('[data-animation-summary]').textContent(),/bound onto 2 existing scene\(s\)/);
   await page.locator('[data-edit=animation-add]').click();
   await page.waitForFunction(()=>document.querySelector('[data-editor-status]').textContent.startsWith('Animation bound to existing scenes'));

   const afterBind=await page.evaluate(()=>({
    ids:project.scenes.map(s=>s.id),
    ts:project.scenes.map(s=>s.voiceoverTimestamp),
    completed:project.scenes.map(s=>s.completed),
    basemap:project.historicalMap.basemap.id,
    preset:project.historicalMap.overlayPreset,
    layerCount:project.historicalMap.visual.layers.length,
    custom:project.custom.keep
   }));
   assert.deepEqual(afterBind.ids,['s1','s2']);
   assert.deepEqual(afterBind.ts,['00:00.000–00:04.000','00:04.000–00:10.000']);
   assert.deepEqual(afterBind.completed,[true,true]);
   assert.equal(afterBind.basemap,'physical');
   assert.equal(afterBind.preset,'legacy');
   assert.equal(afterBind.layerCount,1);
   assert.equal(afterBind.custom,true);

   // Failing commit (offline OpenFreeMap atlas fetch) must roll back project + spec completely.
   const snapshotBeforeFail=await page.evaluate(()=>JSON.stringify(project));
   await page.getByRole('button',{name:'Map library',exact:true}).click();
   await page.locator('[data-map-style=atlas]').click();
   await page.waitForFunction(()=>/could not load|failed|Failed/i.test(document.querySelector('[data-editor-status]').textContent));
   assert.equal(await page.evaluate(()=>JSON.stringify(project)),snapshotBeforeFail);
   assert.equal(await page.locator('[data-map-style=physical]').getAttribute('aria-pressed'),'true');
   await ctx.close();
  }

  // 4. Video Studio workspace manifest rollback & Assembly data-driven artwork catalog + file rollback.
  {
   const ctx=await browser.newContext({viewport:{width:1440,height:1000}});
   const page=await ctx.newPage();
   page.on('pageerror',e=>errors.push('studio:'+e.message));
   await page.route('https://**/*',r=>r.abort());
   await page.goto(base+'/studio-fixture');
   await page.getByRole('button',{name:'Video Studio',exact:true}).click();
   await page.waitForFunction(()=>{const n=document.querySelector('[data-vs=example]');return n&&!n.disabled;});
   await page.locator('.vs-advanced').evaluate(n=>n.open=true);
   await page.locator('[data-vs=example]').click();
   await page.waitForFunction(()=>document.querySelector('[data-vs-title]').value==='My first video');

   // http:// asset URLs are rejected at review (safeAssetUrl); a valid safe-relative 404 URL passes review then fails decode in applyManifest and rolls back.
   await page.locator('[data-vs-json]').evaluate(n=>n.closest('details').open=true);
   await page.locator('[data-vs-json]').fill(JSON.stringify({
    schemaVersion:2,title:'Unsafe HTTP',aspectRatio:'9:16',fps:30,brandPresetId:'adichimp',
    assets:[{id:'http-img',name:'HTTP asset',url:base+'/test-assets/fail.png'}],
    scenes:[{id:'s-img',name:'Broken',startSeconds:0,durationSeconds:2,engineType:'image',engineData:{assetId:'http-img',fit:'contain'},overlays:[]}],
    audio:null,audioClips:[],introEnabled:false,outroEnabled:false
   }));
   await page.locator('[data-vs=validate]').click();
   await page.waitForFunction(()=>/HTTPS|safe project-relative/.test(document.querySelector('[data-vs-status]').textContent));
   assert.equal(await page.locator('[data-vs=apply]').isDisabled(),true);

   const badManifest={
    schemaVersion:2,
    title:'Should Roll Back',
    aspectRatio:'9:16',
    fps:30,
    brandPresetId:'adichimp',
    assets:[{id:'bad-img',name:'Broken relative asset',url:'/creator/test-assets/fail.png'}],
    scenes:[{id:'s-img',name:'Broken',startSeconds:0,durationSeconds:2,engineType:'image',engineData:{assetId:'bad-img',fit:'contain'},overlays:[]}],
    audio:null,
    audioClips:[],
    introEnabled:false,
    outroEnabled:false
   };
   await page.locator('[data-vs-json]').fill(JSON.stringify(badManifest));
   await page.locator('[data-vs=validate]').click();
   await page.waitForFunction(()=>!document.querySelector('[data-vs=apply]').disabled);
   await page.locator('[data-vs=apply]').click();
   await page.waitForFunction(()=>/Cannot load image/.test(document.querySelector('[data-vs-status]').textContent));
   assert.equal(await page.locator('[data-vs-title]').inputValue(),'My first video');

   // Data-driven artwork catalog in Assembly loads historical-army-commanders-v1 from index.json.
   await page.locator('.vs-assembly details').filter({hasText:'Reusable artwork'}).evaluate(n=>n.open=true);
   await page.waitForFunction(()=>[...document.querySelectorAll('[data-asset-library] option')].some(o=>o.value==='historical-army-commanders-v1'));
   await page.locator('[data-compose=load-asset-library]').click();
   await page.waitForFunction(()=>document.querySelectorAll('[data-vs-assets] div').length>0);

   // Invalid WAV rejects without mutating manifest or retaining orphan files.
   const badWav=Buffer.from('NOT-A-VALID-WAV-HEADER');
   await page.locator('.vs-assembly details').filter({hasText:'Audio'}).evaluate(n=>n.open=true);
   await page.locator('[data-compose-audio]').setInputFiles({name:'corrupt.wav',mimeType:'audio/wav',buffer:badWav});
   await page.waitForFunction(()=>/Unable|decode|error|EncodingError/i.test(document.querySelector('[data-vs-status]').textContent));
   assert.equal(await page.locator('[data-compose-audio-select]').count(),0);
   await ctx.close();
  }

  // 5. Multi-tab revision conflict banner, Reload, Keep & Overwrite, Stale Draft Recovery & Kanban Move Rollback.
  {
   const ctx=await browser.newContext({viewport:{width:1440,height:1000}});
   const tabA=await ctx.newPage();
   tabA.on('pageerror',e=>errors.push('tabA:'+e.message));
   tabA.on('dialog',d=>d.accept());
   await tabA.route('https://**/*',r=>r.abort());

   // Seed initial project at revision 1 via Creator dashboard flow.
   await tabA.goto(base+'/invincible/creator/');
   await tabA.locator('#addContent:enabled').click();
   await tabA.locator('[name=title]').fill('Concurrent Film');
   await tabA.locator('#contentStoryboard [data-paste]').fill('Voiceover\tVisual / Animation\tAssets Required\tTimeline\nInitial narration\tMap shot\tNone\t0–5s');
   await tabA.locator('#contentStoryboard [data-action=preview]').click();
   await tabA.locator('#contentStoryboard [data-action=import]').click();
   await tabA.locator('#saveContent').click();
   await tabA.waitForURL(/project\.html\?id=/);
   const projectUrl=tabA.url(),projectId=new URL(projectUrl).searchParams.get('id');
   await tabA.locator('#syncIndicator[data-state=ok]').waitFor();

   // Open second tab to same project and advance revision 1 -> 2.
   const tabB=await ctx.newPage();
   tabB.on('pageerror',e=>errors.push('tabB:'+e.message));
   tabB.on('dialog',d=>d.accept());
   await tabB.route('https://**/*',r=>r.abort());
   await tabB.goto(projectUrl);
   await tabB.locator('#syncIndicator[data-state=ok]').waitFor();
   await tabB.locator('.wb-more').evaluate(n=>n.open=true);
   await tabB.locator('[data-tab=Storyboard]').click();
   await tabB.locator('[data-field=voiceover]').fill('Updated in Tab B');
   await tabB.waitForFunction(id=>JSON.parse(localStorage.getItem('test.creator'))['creatorProjects/'+id]?.writeRevision===2,projectId);

   // In Tab A (without saving yet -> slow/dirty local edit), open Storyboard & simulate local edit conflicting with Tab B's save.
   await tabA.locator('.wb-more').evaluate(n=>n.open=true);
   await tabA.locator('[data-tab=Storyboard]').click();
   // Wait for snapshot to sync Tab B first, OR reload Tab A to clean r2, then test dirty vs r3!
   await tabA.waitForFunction(()=>document.querySelector('[data-field=voiceover]')?.value==='Updated in Tab B');
   // Now make Tab A dirty, delay Tab A's save, and have Tab B bump cloud revision 2 -> 3 first.
   await tabA.evaluate(()=>{window.saveDelay=1500;});
   await tabA.locator('[data-field=voiceover]').fill('Tab A Unsaved Draft');
   await tabB.locator('[data-field=voiceover]').fill('Updated in Tab B rev3');
   await tabB.waitForFunction(id=>JSON.parse(localStorage.getItem('test.creator'))['creatorProjects/'+id]?.writeRevision===3,projectId);

   // Tab A must show #conflictBanner without clobbering Tab A's unsaved textarea OR local draft.
   await tabA.locator('#conflictBanner:not([hidden])').waitFor();
   assert.equal(await tabA.locator('[data-field=voiceover]').inputValue(),'Tab A Unsaved Draft');
   assert.equal(await tabA.evaluate(id=>JSON.parse(localStorage.getItem('invincible.creatorDraft.owner.'+id+'.'+sessionStorage.getItem('invincible.creatorTabId'))||'{}')?.project?.scenes?.[0]?.voiceover,projectId),'Tab A Unsaved Draft');

   // Clicking Reload pulls r3 from Tab B and hides conflict banner.
   await tabA.locator('#conflictReload').click();
   await tabA.locator('#conflictBanner[hidden]').waitFor({state:'attached'});
   assert.equal(await tabA.locator('[data-field=voiceover]').inputValue(),'Updated in Tab B rev3');

   // Trigger conflict again (r3 -> r4 in Tab B while Tab A becomes dirty) and resolve via Keep & Overwrite.
   await tabA.locator('[data-field=voiceover]').fill('Tab A Wins Explicitly');
   await tabB.locator('[data-field=voiceover]').fill('Tab B rev4');
   await tabB.waitForFunction(id=>JSON.parse(localStorage.getItem('test.creator'))['creatorProjects/'+id]?.writeRevision===4,projectId);
   await tabA.locator('#conflictBanner:not([hidden])').waitFor();
   await tabA.evaluate(()=>{window.saveDelay=20;});
   await tabA.locator('#conflictKeepOverwrite').click();
   await tabA.locator('#conflictBanner[hidden]').waitFor({state:'attached'});
   await tabA.waitForFunction(id=>JSON.parse(localStorage.getItem('test.creator'))['creatorProjects/'+id]?.writeRevision===5,projectId);
   assert.equal(await tabA.evaluate(id=>JSON.parse(localStorage.getItem('test.creator'))['creatorProjects/'+id]?.scenes?.[0]?.voiceover,projectId),'Tab A Wins Explicitly');
   await tabB.close();

   // Stale localStorage draft recovery on page reload surfaces explicit conflict banner.
   await tabA.evaluate(id=>{
    const all=JSON.parse(localStorage.getItem('test.creator'));
    const server=all['creatorProjects/'+id];
    const stale=JSON.parse(JSON.stringify(server));
    stale.scenes[0].voiceover='Stale offline draft';
    localStorage.setItem('invincible.creatorDraft.owner.'+id,JSON.stringify({project:stale,baseRevision:2,baseUpdatedAt:1}));
   },projectId);
   await tabA.reload();
   await tabA.locator('#conflictBanner:not([hidden])').waitFor();
   assert.match(await tabA.locator('#conflictMessage').textContent(),/revision 2.*revision 5/);
   await tabA.locator('#conflictKeepOverwrite').click();
   await tabA.locator('#conflictBanner[hidden]').waitFor({state:'attached'});
   await tabA.waitForFunction(id=>JSON.parse(localStorage.getItem('test.creator'))['creatorProjects/'+id]?.writeRevision===6,projectId);
   assert.equal(await tabA.evaluate(id=>JSON.parse(localStorage.getItem('test.creator'))['creatorProjects/'+id]?.scenes?.[0]?.voiceover,projectId),'Stale offline draft');

   // Kanban board move rollback when remote revision bumped behind creator.js's back before tx runs.
   await tabA.goto(base+'/invincible/creator/');
   await tabA.locator('.content-card').filter({hasText:'Concurrent Film'}).waitFor();
   await tabA.evaluate(id=>{
    const all=JSON.parse(localStorage.getItem('test.creator'));
    all['creatorProjects/'+id].writeRevision=99;
    all['creatorProjects/'+id].title='Remote Bumped Title';
    localStorage.setItem('test.creator',JSON.stringify(all));
   },projectId);
   await tabA.locator('.content-card').filter({hasText:'Concurrent Film'}).locator('[data-move="1"]').click();
   await tabA.waitForFunction(()=>/another session or tab/.test(document.querySelector('#status').textContent));
   const boardState=await tabA.evaluate(id=>({
    stageInStore:JSON.parse(localStorage.getItem('test.creator'))['creatorProjects/'+id]?.stage,
    revInStore:JSON.parse(localStorage.getItem('test.creator'))['creatorProjects/'+id]?.writeRevision,
    inIdeasColumn:!!document.querySelector('.column[data-stage="Ideas"] .content-card[data-id="'+id+'"]'),
    inResearchColumn:!!document.querySelector('.column[data-stage="Research"] .content-card[data-id="'+id+'"]')
   }),projectId);
   assert.equal(boardState.revInStore,99);
   assert.equal(boardState.stageInStore,'Ideas');
   assert.equal(boardState.inIdeasColumn,true);
   assert.equal(boardState.inResearchColumn,false);
   await ctx.close();
  }

  assert.deepEqual(errors,[]);
  console.log('Universal map architecture browser checks passed: presets, shortEdge1080, plugins, catalogs, scene-binding, rollbacks and multi-tab revision protection.');
 }finally{await browser?.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
