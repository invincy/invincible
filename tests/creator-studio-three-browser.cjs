// Drives the actual Studio and native exporter; run with Chrome/WebCodecs available.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright'),root=path.resolve(__dirname,'..');
const fixture=`<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/creator/production-workbench.css"><link rel="stylesheet" href="/creator/video-studio/studio.css"><div id="root"></div><script type="module">import {createProductionWorkbench} from '/creator/production-workbench.js';import {testMedia} from '/test-media-client.js';const project={id:'motion',ownerUid:'fixture',scenes:[]};window.workbench=createProductionWorkbench(document.querySelector('#root'),{getProject:()=>project,getAccountId:()=> 'fixture',mediaService:testMedia('fixture'),enableVideoStudio:true,defaultArea:'Video Studio',onChange:()=>{throw Error('Source mutated');}});workbench.render();</script>`;
const ready=p=>p.waitForFunction(()=>document.querySelector('[data-vs=save]')&&!document.querySelector('[data-vs=save]').disabled);
(async()=>{let browser;try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--enable-unsafe-swiftshader','--no-proxy-server']});const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>{errors.push(e.message);console.error(e)});page.on('console',m=>{if(m.type()==='error')console.error(m.text())});page.on('requestfailed',r=>console.error('failed',r.url(),r.failure()));page.setDefaultTimeout(10000);await page.route('http://localhost/**',async route=>{
  const request=route.request(),pathname=new URL(request.url()).pathname;
  if(pathname==='/fixture'){await route.fulfill({contentType:'text/html',body:fixture});return;}
  if(pathname==='/shared/firebase-client.js'){
   await route.fulfill({contentType:'text/javascript',body:'export const firebaseApp={},auth={},db={},authReady=Promise.resolve();'});return;
  }
  if(pathname==='/test-media-client.js'){
   await route.fulfill({contentType:'text/javascript',body:'const files=new Map();export const testMedia=()=>({list:async()=>[],loadDraft:async()=>null,upload:async(file,info)=>{files.set(info.id,file);return info;},file:async id=>files.get(id)});'});return;
  }
  const file=path.resolve(root,'.'+decodeURIComponent(pathname));
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){await route.fulfill({status:404});return;}
  await route.fulfill({path:file,contentType:/\.m?js$/.test(file)?'text/javascript':undefined});
 });
 await page.route('https://www.gstatic.com/**/firebase-functions.js',r=>r.fulfill({contentType:'text/javascript',body:'export const getFunctions=()=>null,httpsCallable=()=>()=>Promise.reject(Error("Unused in fixture"));'}));
 await page.goto('http://localhost/fixture');await ready(page);

 await page.locator('[data-add-kind]').selectOption('three');
 await page.locator('[data-compose=add]').click();
 await ready(page);
 await page.locator('[data-compose-select]').filter({hasText:'3D train'}).waitFor({timeout:5000});
 const camera=page.locator('summary').filter({hasText:'3D camera'});
 await camera.click();
 const angle=page.locator('[data-assembly-prop="stage.camera.to.tilt"]');
 assert.equal(await angle.inputValue(),'42');
 await angle.fill('54');
 await angle.dispatchEvent('change');
 await ready(page);
 assert.equal(await angle.inputValue(),'54');
 const draw=()=>page.locator('.vs-preview canvas').evaluate(canvas=>{
  const ctx=canvas.getContext('2d'),{data}=ctx.getImageData(0,0,canvas.width,canvas.height);
  let hash=0;const colors=new Set();
  for(let i=0;i<data.length;i+=196){hash=(Math.imul(hash,31)+data[i])|0;colors.add(data[i]);}
  return {hash,colors:colors.size};
 });
 const start=await draw();
 assert.ok(start.colors>15,JSON.stringify(start));
 const seek=page.locator('[data-vs-seek]');
 await seek.evaluate(el=>{el.value='4.5';el.dispatchEvent(new Event('input',{bubbles:true}));});
 await page.waitForFunction(()=>document.querySelector('[data-vs-time]').textContent.startsWith('4.50'));
 const end=await draw();assert.notEqual(end.hash,start.hash);
 const model={asset:{version:'2.0'},scene:0,scenes:[{nodes:[0]}],nodes:[{mesh:0}],meshes:[{primitives:[{attributes:{POSITION:0}}]}],buffers:[{byteLength:36}],bufferViews:[{buffer:0,byteOffset:0,byteLength:36}],accessors:[{bufferView:0,componentType:5126,count:3,type:'VEC3',min:[-1,0,0],max:[1,1,0]}]};
 const json=Buffer.from(JSON.stringify(model)),n=Math.ceil(json.length/4)*4;
 const glb=Buffer.alloc(20+n+8+36,32);
 [0x46546c67,2,glb.length,n,0x4e4f534a].forEach((value,i)=>glb.writeUInt32LE(value,i*4));json.copy(glb,20);
 glb.writeUInt32LE(36,20+n);glb.writeUInt32LE(0x004e4942,24+n);
 [-1,0,0,1,0,0,0,1,0].forEach((value,i)=>glb.writeFloatLE(value,28+n+i*4));
 await page.locator('[data-media-upload]').setInputFiles({name:'sample.glb',mimeType:'model/gltf-binary',buffer:glb});
 await page.locator('button').filter({hasText:'Register 3D model'}).click();await ready(page);
 await page.locator('summary').filter({hasText:'3D models'}).click();
 await page.locator('[data-stage-source]').selectOption({label:'sample.glb'});
 await page.locator('[data-compose=stage-add]').click();await ready(page);
 await page.locator('[data-stage-model]').locator('option').filter({hasText:'sample.glb'}).waitFor({state:'attached'});
 assert.notEqual((await draw()).hash,end.hash);
 await page.setViewportSize({width:390,height:844});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 console.log('3D camera, changing preview, GLB registration and narrow layout passed.');
 const exportCheck=await page.evaluate(async()=>{
  const {canEncodeVideo}=await import('/creator/vendor/studio-video.mjs');
  return {avc:await canEncodeVideo('avc',{width:1080,height:1920,bitrate:11197440})};
 });
 assert.deepEqual(errors,[]);
 if(!exportCheck.avc){
  await page.locator('[data-vs=export]').click();
  await page.locator('[data-vs-status]').filter({hasText:'H.264 encoding is unavailable'}).waitFor();
  console.log('Confirmed existing unsupported-H.264 message; this browser cannot encode native MP4.');
  return;
 }
 const output=await page.evaluate(async()=>{
  const {trainStage}=await import('/creator/video-studio/three-scene.js');
  const {createStudioRenderer}=await import('/creator/video-studio/adapters.js');
  const {encodeStudioVideo}=await import('/creator/video-studio/export.js');
  const {validateManifest,compileTimeline,PRESETS}=await import('/creator/video-studio/model.js');
  const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1920;
  const manifest=validateManifest({schemaVersion:2,title:'3D train',fps:30,aspectRatio:'9:16',brandPresetId:PRESETS[0].id,assets:[],audioClips:[],scenes:[{id:'s',engineType:'three',engineData:trainStage(),overlays:[],startSeconds:0,durationSeconds:.6}]});
  const timeline=compileTimeline(manifest,PRESETS[0]);
  const renderer=await createStudioRenderer(canvas,manifest,timeline,PRESETS[0]);
  try{
   const audio=new AudioBuffer({length:28800,sampleRate:48000,numberOfChannels:1});
   for(let i=0;i<audio.length;i++)audio.getChannelData(0)[i]=Math.sin(i*Math.PI*2*220/48000)*.1;
   const blob=await encodeStudioVideo({canvas,timeline,audioBuffer:audio,drawFrame:t=>renderer.draw(t,{exporting:true})});
   return Array.from(new Uint8Array(await blob.arrayBuffer()));
  }finally{renderer.destroy();}
 });
 fs.mkdirSync('.test-output',{recursive:true});fs.writeFileSync('.test-output/studio-three.mp4',Buffer.from(output));
 assert.deepEqual(errors,[]);
 console.log('Native 1080p 3D MP4 with audio passed.',output.length);
 }finally{await browser?.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
