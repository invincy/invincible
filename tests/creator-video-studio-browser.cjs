// Real WebCodecs + MP4 decode; synthetic local media, never production Firebase.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {handler:mediaHandler}=require('./fixtures/creator-media-service.cjs');
const {chromium}=require('playwright'),root=path.resolve(__dirname,'..');
const readinessMarkup=fs.readFileSync(path.join(root,'creator/project.html'),'utf8').match(/<section class="project-readiness"[^>]*>[\s\S]+?<\/section>/)[0];
const fixture=`<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/creator/production-workbench.css"><link rel="stylesheet" href="/creator/video-studio/studio.css"><link rel="stylesheet" href="/shared/spatial-workspace.css"><style>body{margin:0;background:#071426;font-family:system-ui}*{box-sizing:border-box}</style><link rel="stylesheet" href="/creator/project.css">${readinessMarkup}<div id="root"></div><script type="module">import {createProductionWorkbench} from '/creator/production-workbench.js';window.project={id:new URLSearchParams(location.search).get('project')||'test-video',title:'Original',scenes:[],historicalMap:{version:1,theme:'night',events:[],features:{type:'FeatureCollection',features:[]},camera:[]},unknown:{keep:true}};window.before=JSON.stringify(project);window.changes=0;const mediaService=(await import('/test-media-client.js')).testMedia(new URLSearchParams(location.search).get('account')||'owner');const readinessRoot=document.querySelector('.project-readiness');let readiness;
if(project.id==='automatic-video'){
 const {createProductionReadiness,mountProductionReadiness}=await import('/creator/video-studio/production-readiness.js?v=2026111209');
 readiness=mountProductionReadiness(readinessRoot,createProductionReadiness(()=> 'owner'));
}else readinessRoot.remove();
window.workbench=createProductionWorkbench(document.querySelector('#root'),{mediaService,getProject:()=>project,enableVideoStudio:true,getProductionReadiness:()=>readiness,getAccountId:()=>new URLSearchParams(location.search).get('account')||'owner',onChange:()=>changes++,copyText:async()=>{}});workbench.render();</script>`;
const server=http.createServer((req,res)=>{if(mediaHandler(req,res))return;try{const route=new URL(req.url,'http://localhost').pathname;if(route==='/fixture'){res.setHeader('Content-Type','text/html');res.end(fixture);return;}const file=path.resolve(root,'.'+decodeURIComponent(route));if(!file.startsWith(root+path.sep))throw Error('path');res.setHeader('Content-Type',/\.m?js$/.test(file)?'text/javascript':file.endsWith('.css')?'text/css':/\.(json|geojson)$/.test(file)?'application/json':'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.statusCode=404;res.end();}});
const waitReady=async page=>{await page.waitForFunction(()=>{const n=document.querySelector('[data-vs=example]');return n&&!n.disabled;});await page.locator('.vs-advanced').evaluate(n=>n.open=true);};
function wav(){const rate=48000,frames=rate,b=Buffer.alloc(44+frames*2);b.write('RIFF');b.writeUInt32LE(b.length-8,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(rate,24);b.writeUInt32LE(rate*2,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(frames*2,40);for(let i=0;i<frames;i++)b.writeInt16LE(i>rate*.05&&i<rate*.8?Math.round(Math.sin(i/rate*2*Math.PI*440)*16000):0,44+i*2);return b;}
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--enable-unsafe-swiftshader']});const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(30000);const url=`http://127.0.0.1:${server.address().port}/fixture`;
 if(process.env.STUDIO_READINESS_ONLY!=='1'){
 await page.goto(url);assert.equal(await page.locator('.video-studio').count(),0,'workspace opt-in');await page.getByRole('button',{name:'Video Studio',exact:true}).click();await waitReady(page);
 if(process.env.STUDIO_LAYOUT_ONLY==='1'){
  const track=page.locator('.vs-layout');
  assert.equal(await track.locator(':scope > .space-panel').count(),3);
  const desktop=await track.locator(':scope > .space-panel').evaluateAll(nodes=>nodes.map(node=>node.getBoundingClientRect().x));
  assert.ok(desktop[0]<desktop[1]&&desktop[1]<desktop[2]);
  await page.setViewportSize({width:393,height:852});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.getByRole('navigation',{name:'Studio panels'}).getByRole('button',{name:'Preview'}).click();
  await page.waitForFunction(()=>document.querySelector('.video-studio')?.dataset.mobilePanel==='preview');
  assert.equal(await page.locator('.vs-preview').isVisible(),true);
  assert.equal(await page.locator('.vs-assembly').isVisible(),false);
  assert.deepEqual(errors,[]);
  console.log('Motion Studio desktop columns, phone panels and preview navigation passed.');
  return;
 }
 assert.equal(await page.getByRole('heading',{name:'Create with AI'}).count(),1,'one-click AI production is available inside the existing Video Studio');assert.equal(await page.getByRole('button',{name:'Generate video',exact:true}).count(),1);
 assert.equal(await page.locator('[data-ai-production] [role=tablist]').count(),0,'asset tabs are scoped to shared media');
 await page.locator('[data-vs=example]').click();await waitReady(page);assert.equal(await page.locator('[data-vs-title]').inputValue(),'My first video');assert.equal(await page.locator('canvas').getAttribute('width'),'1080');assert.equal(await page.locator('canvas').getAttribute('height'),'1920');
 await page.locator('[data-vs-json]').evaluate(n=>n.closest('details').open=true);await page.locator('[data-vs-json]').fill('{"schemaVersion":1,"script":"alert(1)"}');await page.locator('[data-vs=validate]').click();await waitReady(page);assert.equal(await page.locator('[data-vs=apply]').isDisabled(),true);assert.equal(await page.locator('[data-vs-title]').inputValue(),'My first video');
 const manifest={schemaVersion:1,title:'Two engines',aspectRatio:'9:16',fps:30,brandPresetId:'lic',assets:[],audio:null,introEnabled:false,outroEnabled:false,scenes:[{id:'graphic',startSeconds:0,durationSeconds:1,engineType:'graphic',engineData:{},overlays:[{id:'text',type:'text',text:'Hello',keyframes:[{timeSeconds:0,x:.3},{timeSeconds:1,x:.7}]}]},{id:'policy',startSeconds:1,durationSeconds:1,engineType:'lic',engineData:{title:'Synthetic illustration',source:'Test fixture — not a policy quote',points:[{timeSeconds:0,year:1,label:'Payment',premium:100},{timeSeconds:.5,year:2,label:'Payout',income:50}]},overlays:[]}]};
 await page.locator('[data-vs-json]').fill(JSON.stringify(manifest));await page.locator('[data-vs=validate]').click();await waitReady(page);await page.locator('[data-vs=apply]').click();await waitReady(page);assert.equal(await page.locator('[data-vs-track] button').count(),2);
 await page.locator('[data-vs=play]').click();await page.waitForFunction(()=>Number(document.querySelector('[data-vs-seek]').value)>.3);await page.locator('[data-vs=pause]').click();await waitReady(page);
 // Uploaded source bytes survive save and reload unchanged; gain/start use the common timeline.
 await page.getByText('Assets & voiceover',{exact:true}).click();const imageBytes=Buffer.from(await page.evaluate(()=>{const c=document.createElement('canvas');c.width=c.height=4;const ctx=c.getContext('2d');ctx.fillStyle='#ff4466';ctx.fillRect(0,0,4,4);return c.toDataURL('image/png').split(',')[1];}),'base64');await page.locator('[data-vs-images]').setInputFiles({name:'advisor-fixture.png',mimeType:'image/png',buffer:imageBytes});await waitReady(page);
 const assetId=await page.locator('[data-vs-assets] code').textContent();const manifestDownload=page.waitForEvent('download');await page.locator('[data-vs=download]').click();const manifestFile=await manifestDownload;const withImage=JSON.parse(fs.readFileSync(await manifestFile.path(),'utf8'));withImage.scenes[0].overlays.push({id:'advisor',type:'image',assetId,x:.5,y:.8,width:.2,height:.1,keyframes:[{timeSeconds:0,rotation:0},{timeSeconds:1,rotation:10}]});await page.locator('[data-vs-json]').fill(JSON.stringify(withImage));await page.locator('[data-vs=validate]').click();await waitReady(page);await page.locator('[data-vs=apply]').click();await waitReady(page);
 const original=wav();await page.locator('[data-vs-audio]').setInputFiles({name:'voiceover.wav',mimeType:'audio/wav',buffer:original});await waitReady(page);await page.locator('[data-vs-audio-start]').fill('.25');await page.locator('[data-vs-audio-start]').dispatchEvent('change');await waitReady(page);
 await page.getByText('Brand profile',{exact:true}).click();const profile=JSON.parse(await page.locator('[data-vs-brand-json]').inputValue());profile.logoAssetId=assetId;await page.locator('[data-vs-brand-json]').fill(JSON.stringify(profile));await page.locator('[data-vs=brand-apply]').click();await waitReady(page);await page.locator('[data-vs=brand-templates]').click();await waitReady(page);await page.locator('[data-vs-intro]').check();await waitReady(page);await page.locator('[data-vs-outro]').check();await waitReady(page);assert.equal(await page.locator('[data-vs-track] button').count(),4);
 await page.locator('[data-vs=save]').click();await waitReady(page);assert.match(await page.locator('[data-vs-status]').textContent(),/Saved to your account/);
 const preserved=await page.evaluate(async()=>{const {openStudioStore}=await import('/creator/video-studio/storage.js');const s=openStudioStore('owner'),v=await s.get('draft:test-video'),m=await s.get('version:test-video:'+v),f=await s.get('file:'+m.audioClips[0].fileId);const data=Array.from(new Uint8Array(await f.arrayBuffer()));await s.close();return data;});assert.deepEqual(Buffer.from(preserved),original);
 await page.reload();await page.getByRole('button',{name:'Video Studio',exact:true}).click();await waitReady(page);assert.equal(await page.locator('[data-vs-title]').inputValue(),'Two engines');assert.match(await page.locator('[data-vs-audio-name]').textContent(),/recordings in the Audio timeline/);
 // A profile with uploaded media can be reused in another video without copying a storyboard.
 await page.goto(url+'?project=second-video');await page.getByRole('button',{name:'Video Studio',exact:true}).click();await waitReady(page);await page.locator('[data-vs-brand]').selectOption('lic');await waitReady(page);assert.match(await page.locator('[data-vs-assets]').textContent(),/advisor-fixture.png/);assert.equal(await page.locator('[data-vs-title]').inputValue(),'Untitled video');
 // A different account cannot load the prior account's manifest or bytes.
 await page.goto(url+'?account=other');await page.getByRole('button',{name:'Video Studio',exact:true}).click();await waitReady(page);assert.equal(await page.locator('[data-vs-title]').inputValue(),'Untitled video');
 await page.goto(url);await page.getByRole('button',{name:'Video Studio',exact:true}).click();await waitReady(page);
 // Export through the actual UI, including branding and uploaded voiceover.
 const avc=await page.evaluate(async()=>{const m=await import('/creator/vendor/studio-video.mjs');return m.canEncodeVideo('avc',{width:1080,height:1920,bitrate:11197440});});if(!avc&&process.env.STUDIO_SKIP_ENCODING==='1'){console.log('UI import, playback, original-byte persistence, account isolation and branding passed; H.264 unavailable, encoding assertions NOT RUN.');return;}
 const nextDownload=page.waitForEvent('download',{timeout:120000});await page.locator('[data-vs=export]').click();const download=await nextDownload,bytes=fs.readFileSync(await download.path());fs.mkdirSync(path.join(root,'.test-output'),{recursive:true});fs.writeFileSync(path.join(root,'.test-output/creator-studio-ui-audio.mp4'),bytes);await waitReady(page);assert.match(await page.locator('[data-vs-status]').textContent(),/synchronized.*voiceover/);
 // Independent decode measures energy/onset in the actual muxed track, not just encoder calls.
 const decoded=await page.evaluate(async data=>{const bytes=Uint8Array.from(atob(data),c=>c.charCodeAt(0)),blob=new Blob([bytes],{type:'video/mp4'}),video=document.createElement('video');video.src=URL.createObjectURL(blob);await new Promise((r,j)=>{video.onloadedmetadata=r;video.onerror=j;});const context=new AudioContext();const audio=await context.decodeAudioData(bytes.buffer.slice(0)),samples=audio.getChannelData(0),rate=audio.sampleRate;let energy=0,onset=-1;const step=Math.round(rate*.005);for(let i=0;i<samples.length;i+=step){let power=0;for(let n=i;n<Math.min(samples.length,i+step);n++)power+=samples[n]*samples[n];const rms=Math.sqrt(power/step);energy+=power;if(onset<0&&rms>.05)onset=i/rate;}await context.close();URL.revokeObjectURL(video.src);return {width:video.videoWidth,height:video.videoHeight,duration:video.duration,onset,energy};},bytes.toString('base64'));
 assert.equal(decoded.width,1080);assert.equal(decoded.height,1920);assert.ok(Math.abs(decoded.duration-6)<1/30);assert.ok(decoded.energy>100,'exported track is audible');assert.ok(Math.abs(decoded.onset-2.30)<=1/30,`A/V fixture onset ${decoded.onset}; expected 2.30s (intro + audio offset + tone delay)`);
 // Validate visual/audio synchronization on a shared timestamp, and both orientations.
 const direct=await page.evaluate(async()=>{
  const {encodeStudioVideo}=await import('/creator/video-studio/export.js');const {exportDimensions}=await import('/creator/video-studio/model.js');const {decodeVoiceover}=await import('/creator/video-studio/audio.js');const {openStudioStore}=await import('/creator/video-studio/storage.js');const s=openStudioStore('owner'),v=await s.get('draft:test-video'),m=await s.get('version:test-video:'+v),file=await s.get('file:'+m.audioClips[0].fileId);const audio=await decodeVoiceover(file);await s.close();
  const results=[];for(const ratio of ['9:16','16:9']){const canvas=document.createElement('canvas');Object.assign(canvas,exportDimensions(ratio));const ctx=canvas.getContext('2d'),onset=.8;let codec;
   const blob=await encodeStudioVideo({canvas,timeline:{duration:2,audioStart:.75},audioBuffer:audio,onAudioCodec:c=>codec=c,drawFrame:t=>{ctx.fillStyle=t>=onset?'#ffffff':'#000000';ctx.fillRect(0,0,canvas.width,canvas.height);}});
   const video=document.createElement('video');video.src=URL.createObjectURL(blob);await new Promise((r,j)=>{video.onloadedmetadata=r;video.onerror=j;});const {Input,BlobSource,ALL_FORMATS,CanvasSink}=await import('/creator/vendor/studio-video.mjs');const input=new Input({source:new BlobSource(blob),formats:ALL_FORMATS}),sink=new CanvasSink(await input.getPrimaryVideoTrack()),pixels=[];for(const t of [.7,.9]){const f=await sink.getCanvas(t);pixels.push(f.canvas.getContext('2d').getImageData(0,0,1,1).data[0]);}input.dispose();
   const ac=new AudioContext(),buffer=await ac.decodeAudioData(await blob.arrayBuffer()),samples=buffer.getChannelData(0),step=Math.round(buffer.sampleRate*.005);let first=-1;for(let i=0;i<samples.length;i+=step){let power=0;for(let n=i;n<i+step&&n<samples.length;n++)power+=samples[n]*samples[n];if(Math.sqrt(power/step)>.05){first=i/buffer.sampleRate;break;}}await ac.close();URL.revokeObjectURL(video.src);results.push({ratio,width:video.videoWidth,height:video.videoHeight,duration:video.duration,pixels,onset:first,codec});
  }
  return results;
 });
 console.log("Decoded direct exports",direct);for(const r of direct){assert.ok(r.pixels[0]<10&&r.pixels[1]>240);assert.ok(Math.abs(r.onset-.8)<=1/30);assert.equal(r.width,r.ratio==='9:16'?1080:1920);assert.equal(r.height,r.ratio==='9:16'?1920:1080);assert.ok(Math.abs(r.duration-2)<1/30);}
 const adapterResults=await page.evaluate(async()=>{const {verifyMedia}=await import('/tests/fixtures/video-studio-verification.js');return verifyMedia();});assert.ok(adapterResults.some(r=>r.mapAdapter));console.log('Independent graphics/LIC/Map media verification',adapterResults);
 // Cancellation rejects and the preview remains usable; no partial download.
 let unexpected=0;const count=()=>unexpected++;page.on('download',count);await page.locator('[data-vs=export]').click();await page.locator('[data-vs=cancel]').click();await waitReady(page);assert.match(await page.locator('[data-vs-status]').textContent(),/cancelled/);page.off('download',count);assert.equal(unexpected,0);
 assert.equal(await page.evaluate(()=>JSON.stringify(project)===before&&changes===0),true);
 await page.getByRole('button',{name:'Storyboard',exact:true}).click();assert.equal(await page.locator('.video-studio').count(),0);await page.getByRole('button',{name:'Video Studio',exact:true}).click();await waitReady(page);assert.equal(await page.locator('[data-vs-title]').inputValue(),'Two engines');
 for(const width of [320,390,820,1440]){await page.setViewportSize({width,height:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`overflow at ${width}`);}
 await page.locator('[data-vs-seek]').evaluate(input=>{input.value='2.5';input.dispatchEvent(new Event('input',{bubbles:true}));});await page.waitForFunction(()=>document.querySelector('[data-vs-time]').textContent.startsWith('2.50'));await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:path.join(root,'.test-output/creator-video-studio.png'),fullPage:true});assert.deepEqual(errors,[]);console.log('Video Studio UI, safe import, byte-identical persistence, account isolation, branding, playback, export, cancellation and dimensions passed.',{decoded,direct});
 }
 const mp3=fs.readFileSync(path.join(root,'lic/jeevan-lakshya/audio/intro.plan.mp3')).toString('base64');
 const automatic=await browser.newPage({acceptDownloads:true});
 let syntheses=0,offline=true;
 await automatic.addInitScript(()=>localStorage.setItem('invincible.local-worker.remembered.v1.http://127.0.0.1:8788.owner','fixture-pairing'));
 await automatic.route('**/creator/tts-api.js',route=>route.fulfill({contentType:'text/javascript',body:
  `export async function loadVoices(){return [{name:'hi-IN-test',languageCodes:['hi-IN'],family:'Neural',capabilities:{supported:true}}];}
  export async function generateVoiceover(){window.fixtureTts=true;return {mimeType:'audio/mpeg',audioBase64:${JSON.stringify(mp3)}};}`}));
 await automatic.route('http://127.0.0.1:8788/api/**',async route=>{
  const req=route.request(),endpoint=new URL(req.url()).pathname;
  const headers={'access-control-allow-origin':'*','access-control-allow-headers':'authorization,content-type,x-invincible-account','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-private-network':'true'};
  if(req.method()==='OPTIONS')return route.fulfill({status:204,headers});
  if(endpoint==='/api/session')return route.fulfill({headers,json:{uid:'owner'}});
  if(endpoint.endsWith('/catalog-status'))return route.fulfill({headers,status:offline?400:200,json:offline?{error:'Local Whisper is offline'}:{automaticContext:true}});
  if(endpoint==='/api/service-status')return route.fulfill({headers,json:{whisper:false,qwen:true}});
  assert.equal(endpoint,'/api/voiceover/analyze');
  assert.equal(req.postDataJSON().production,true);
  assert.equal(req.postDataJSON().audioBase64,mp3);
  syntheses++;
  return route.fulfill({headers,json:{analysis:{valid:true,scenes:[]},creatorStudio:{scenes:[{id:'context',timeline:'0.1-1s',contextCard:true}]}}});
 });
 await automatic.goto(url+'?project=automatic-video');
 const readiness=automatic.getByRole('region',{name:'Production readiness'});
 await readiness.getByText('Start Whisper on the laptop').waitFor();
 assert.match(await readiness.getByText('Qwen',{exact:true}).locator('..').innerText(),/✓ Ready/);
 await automatic.getByRole('button',{name:'Video Studio',exact:true}).click();await waitReady(automatic);
 await automatic.locator('[data-ai-script]').fill('A short narration test.');
 await automatic.getByRole('button',{name:'Generate video',exact:true}).click();
 await automatic.locator('[data-ai-status]').filter({hasText:'Narration generation has not started'}).waitFor();
 assert.equal(await automatic.evaluate(()=>Boolean(window.fixtureTts)),false);
 offline=false;
 await readiness.getByRole('button',{name:'Refresh connections'}).click();
 await readiness.getByText('Services ready for one-click video').waitFor();
 assert.equal(await readiness.getByText('✓ Ready',{exact:true}).count(),5);
 const generated=automatic.waitForEvent('download',{timeout:120000});
 await automatic.getByRole('button',{name:'Generate video',exact:true}).click();
 const output=fs.readFileSync(await (await generated).path());
 assert.equal(output.subarray(4,8).toString(),'ftyp');
 assert.equal(syntheses,1);
 await automatic.getByText(/MP4 exported.*1 context card/).waitFor();
 const streams=await automatic.evaluate(async base64=>{
  const {Input,BlobSource,ALL_FORMATS}=await import('/creator/vendor/studio-video.mjs');
  const source=new BlobSource(new Blob([Uint8Array.from(atob(base64),char=>char.charCodeAt(0))]));
  const input=new Input({source,formats:ALL_FORMATS});
  try{return [Boolean(await input.getPrimaryVideoTrack()),Boolean(await input.getPrimaryAudioTrack())];}
  finally{input.dispose();}
 },output.toString('base64'));
 assert.deepEqual(streams,[true,true]);
 console.log('One Generate click: readiness gate, narration, laptop analysis, save, and MP4 video/audio tracks passed.');
 }finally{await browser?.close();await new Promise(r=>server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1;});
