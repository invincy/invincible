import {emptyVideo,PRESETS,validateManifest,validateBrand,compileTimeline,exportDimensions,assetsForBrand} from './model.js?v=2026110901';
import {createStudioRenderer} from './adapters.js?v=2026110901';
import {decodeVoiceover,loadAudioTracks,scheduleAudioTracks} from './audio.js';
import {mountAssembly} from './assembly.js?v=2026110901';
import {encodeStudioVideo} from './export.js';
import {openStudioStore} from './storage.js';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>crypto.randomUUID();
const template=(name,text)=>({id:name,startSeconds:0,durationSeconds:2,engineType:'graphic',engineData:{},transition:{type:'fade',durationSeconds:.3},overlays:[{id:'title',type:'text',text,x:.5,y:.5,fontSize:64}]});
export function mountVideoStudio(root,{getProject,getAccountId=()=>null,session={}}){
 root.className='video-studio';
 root.innerHTML=`<div class="vs-layout"><div><strong>Video Studio · Phase 1</strong><p class="vs-help">Separate video draft. Existing storyboard, map and LIC pages are preserved. Saves and uploaded originals stay on this device for your account; use JSON to transfer instructions.</p>
 <div class="vs-actions"><button data-vs="save">Save video draft</button><button data-vs="download">Download JSON</button><button data-vs="example">Load example</button></div>
 <label>Video title<input data-vs-title maxlength="200"></label><div class="vs-grid"><label>Frame<select data-vs-ratio><option value="9:16">Portrait · 1080 × 1920</option><option value="16:9">Landscape · 1920 × 1080</option></select></label><label>Brand<select data-vs-brand></select></label></div>
 <div class="vs-actions"><label><input type="checkbox" data-vs-intro>Apply intro</label><label><input type="checkbox" data-vs-outro>Apply outro</label></div>
 <details><summary>Brand profile</summary><p class="vs-help">Configurable colors, font family, logo asset ID, and reusable graphic intro/outro scenes. Use an installed or page-loaded font. LIC preset contains colors only.</p><textarea data-vs-brand-json aria-label="Brand profile JSON"></textarea><div class="vs-actions"><button data-vs="brand-apply">Apply profile</button><button data-vs="brand-templates">Add title intro/outro</button></div></details>
 <details><summary>Animation JSON</summary><label>Import JSON file<input type="file" data-vs-json-file accept=".json,application/json"></label><textarea data-vs-json aria-label="Video manifest JSON" placeholder="Paste structured Video Studio JSON"></textarea><div class="vs-actions"><button data-vs="validate">Review import</button><button data-vs="apply" disabled>Apply reviewed import</button></div><p data-vs-review class="vs-help"></p></details>
 <details><summary>Assets & voiceover</summary><label>Upload images<input type="file" data-vs-images multiple accept="image/png,image/jpeg,image/webp"></label><p class="vs-help">PNG, JPEG or WebP, up to 25 MB each. Use the asset ID in an image overlay or logo slot. Existing map image references appear below.</p><select data-vs-library aria-label="Existing map image"><option value="">Choose existing map image</option></select><button data-vs="reuse">Reuse selected image</button><div data-vs-assets class="vs-files"></div>
 <label>Upload voiceover<input type="file" data-vs-audio accept=".mp3,.wav,audio/mpeg,audio/wav"></label><p data-vs-audio-name class="vs-help">No voiceover selected</p><div class="vs-grid"><label>Audio start (content seconds)<input type="number" min="0" max="600" step=".01" data-vs-audio-start value="0"></label><label>Gain<input type="number" min="0" max="2" step=".05" data-vs-gain value="1"></label></div><button data-vs="remove-audio">Remove voiceover from video</button></details>
 <div role="status" aria-live="polite" data-vs-status></div></div><div class="vs-preview"><canvas aria-label="Video preview"></canvas><div data-vs-track class="vs-track" aria-label="Common timeline"></div><input type="range" min="0" max="1" step=".0333333333" value="0" data-vs-seek aria-label="Video time"><output data-vs-time>0.00s</output><div class="vs-actions"><button data-vs="play">Play</button><button data-vs="pause">Pause</button><button data-vs="export">Export MP4</button><button data-vs="cancel" disabled>Cancel export</button></div><progress data-vs-progress value="0" max="1"></progress><p class="vs-help">30 fps · 1080p · MP4 with audio when voiceover is selected (AAC preferred, Opus fallback). Full audio is preserved; its duration may extend the video. Fade transitions use the brand background. Export needs H.264 and audio WebCodecs support. Opus MP4 may need a current player.</p></div></div>`;
 const $=q=>root.querySelector(q),canvas=$('canvas'),mapAssets=()=>getProject()?.historicalMap?.visual?.assets||[];
 // Keep the original controls available under Advanced; make visual assembly the opening view.
 const legacy=$('.vs-layout > div'),advanced=document.createElement('details'),assemblyRoot=document.createElement('section'),header=document.createElement('header');
 advanced.className='vs-advanced';advanced.innerHTML='<summary>Advanced · branding, original imports & JSON</summary>';legacy.before(advanced);advanced.append(legacy);legacy.querySelector('strong').textContent='Project settings';
 assemblyRoot.dataset.assembly='';assemblyRoot.className='vs-assembly';$('.vs-layout').prepend(assemblyRoot);
 header.className='vs-studio-header';header.innerHTML='<div><span class="vs-eyebrow">CREATOR</span><h2>Studio</h2></div><div class="vs-actions" data-studio-actions></div>';root.prepend(header);const mobile=document.createElement('nav');mobile.className='vs-mobile-tabs';mobile.setAttribute('aria-label','Studio panels');mobile.innerHTML='<button data-mobile-panel=preview aria-pressed=true>Preview</button><button data-mobile-panel=scenes aria-pressed=false>Scenes & audio</button>';header.after(mobile);root.dataset.mobilePanel='preview';mobile.onclick=e=>{const b=e.target.closest('[data-mobile-panel]');if(!b)return;root.dataset.mobilePanel=b.dataset.mobilePanel;mobile.querySelectorAll('button').forEach(n=>n.setAttribute('aria-pressed',String(n===b)));};
 for(const key of ['save','export'])header.querySelector('[data-studio-actions]').append($(`[data-vs=${key}]`));
 $('.vs-layout').after(advanced);advanced.append($('[data-vs-status]'));root.append($('[data-vs-status]'));
 $('.vs-preview .vs-help').textContent='Full HD · 30 fps. Your scenes and audio export together.';
 $('[data-vs=save]').textContent='Save';$('[data-vs=export]').textContent='Export MP4';
 const account=getAccountId(),projectId=getProject()?.id;const store=account?openStudioStore(account):null;
 const state=session;if(state.account!==account||state.projectId!==projectId){for(const key of Object.keys(state))delete state[key];state.account=account;state.projectId=projectId;}state.manifest??=emptyVideo();state.brands??=structuredClone(PRESETS);state.files??=new Map();state.brandAssets??=[];
 const lifecycle=new AbortController();
 let drawing=null;
 let renderer=null,timeline=null,audioBuffer=null,audioTracks=[],stopTracks=null,assembly=null,playing=false,raf=0,time=state.time||0,context=null,source=null,gainNode=null,clock=0,clockTime=0,disposed=false,busy=false,pending=null,controller=null,drawBusy=false,preparing=null;
 const status=text=>{if(!disposed)$('[data-vs-status]').textContent=text;};
 const getFile=async fileId=>state.files.get(fileId)||await store?.get('file:'+fileId);
 const brand=()=>state.brands.find(b=>b.id===state.manifest.brandPresetId)||state.brands[0];
 function stop(){playing=false;cancelAnimationFrame(raf);stopTracks?.();stopTracks=null;if(source){try{source.stop();}catch{}source.disconnect();source=null;}gainNode?.disconnect();gainNode=null;}
 function invalidate(){stop();renderer?.destroy();renderer=null;audioBuffer=null;audioTracks=[];pending=null;$('[data-vs=apply]').disabled=true;}
 function sync(){
  const m=state.manifest;$('[data-vs-title]').value=m.title;$('[data-vs-ratio]').value=m.aspectRatio;
  $('[data-vs-brand]').innerHTML=state.brands.map(b=>`<option value="${esc(b.id)}">${esc(b.name)}</option>`).join('');$('[data-vs-brand]').value=brand().id;
  $('[data-vs-intro]').checked=!!m.introEnabled;$('[data-vs-outro]').checked=!!m.outroEnabled;
  $('[data-vs-brand-json]').value=JSON.stringify(brand(),null,2);
  $('[data-vs-audio-name]').textContent=m.audio?.name||(m.audioClips?.length?m.audioClips.length+' recordings in the Audio timeline':'No voiceover selected');$('[data-vs-audio-start]').value=m.audio?.startSeconds??0;$('[data-vs-gain]').value=m.audio?.gain??1;
  $('[data-vs-assets]').innerHTML=m.assets.map(a=>`<div>${esc(a.name)} · <code>${esc(a.id)}</code></div>`).join('');
  $('[data-vs-library]').innerHTML='<option value="">Choose existing map image</option>'+mapAssets().filter(a=>a.type==='image').map(a=>`<option value="${esc(a.id)}">${esc(a.name)}</option>`).join('');
  assembly?.sync();
 }
 async function prepare(){
  if(renderer)return;if(preparing)return preparing;
  preparing=(async()=>{
   const m=validateManifest(state.manifest,{mapAssets:mapAssets()}),b=validateBrand(brand(),new Set(m.assets.map(a=>a.id)));
   if(m.audio){const file=await getFile(m.audio.fileId);if(!file)throw Error('Voiceover is missing on this device. Upload the original recording again.');audioBuffer??=await decodeVoiceover(file);}
   audioTracks=await loadAudioTracks(m,getFile);
   timeline=compileTimeline(m,b,audioBuffer?.duration||0);const size=exportDimensions(m.aspectRatio);canvas.width=size.width;canvas.height=size.height;
   const lead=timeline.audioClips[0]&&m.audioClips?.[0]?timeline.audioClips[0].startSeconds-m.audioClips[0].startSeconds:0;audioTracks=audioTracks.map(t=>({...t,startSeconds:t.startSeconds+lead}));time=Math.min(time,timeline.duration);
   const next=await createStudioRenderer(canvas,m,timeline,b,{getFile,mapAssets:mapAssets(),signal:controller?.signal||lifecycle.signal});
   if(disposed){next.destroy();return;}renderer=next;
   $('[data-vs-seek]').max=timeline.duration||1;$('[data-vs-track]').innerHTML=timeline.scenes.map(s=>`<button data-vs-at="${s.startSeconds}" data-vs-scene-id="${esc(s.id)}" title="${esc(s.name||s.id)}">${esc(s.name||s.engineType)} · ${s.startSeconds.toFixed(1)}–${(s.startSeconds+s.durationSeconds).toFixed(1)}s</button>`).join('');
   let audioTrack=$('[data-vs-audio-track]');if(!audioTrack){audioTrack=document.createElement('div');audioTrack.dataset.vsAudioTrack='';audioTrack.className='vs-audio-track';$('[data-vs-track]').after(audioTrack);}audioTrack.innerHTML=timeline.audioClips.map(a=>`<div style="margin-left:${a.startSeconds/Math.max(1,timeline.duration)*100}%;width:${Math.max(2,a.durationSeconds/Math.max(1,timeline.duration)*100)}%" title="${esc(a.name)}">${esc(a.role)} · ${esc(a.name)}</div>`).join('');
  })().finally(()=>preparing=null);return preparing;
 }
 async function draw(){
  if(drawing)await drawing.catch(()=>{});
  const task=(async()=>{await prepare();if(disposed||!renderer)return;await renderer.draw(time);state.time=time;$('[data-vs-seek]').value=time;$('[data-vs-time]').textContent=`${time.toFixed(2)} / ${timeline.duration.toFixed(2)}s`;})();drawing=task;try{await task;}finally{if(drawing===task)drawing=null;}
 }
 async function applyManifest(next,{brands:nextBrands=null}={}){
  const prevManifest=state.manifest,prevBrands=state.brands,prevTime=time,prevPending=pending;
  stop();renderer?.destroy();renderer=null;audioBuffer=null;audioTracks=[];
  state.manifest=next;
  if(nextBrands)state.brands=nextBrands;
  try{
   await draw();
   pending=null;$('[data-vs=apply]').disabled=true;
   sync();
  }catch(error){
   stop();renderer?.destroy();renderer=null;audioBuffer=null;audioTracks=[];
   state.manifest=prevManifest;state.brands=prevBrands;time=prevTime;state.time=prevTime;pending=prevPending;
   sync();
   try{await draw();}catch{}
   throw error;
  }
 }
 async function tick(){
  if(!playing||disposed)return;time=Math.min(timeline.duration,clockTime+context.currentTime-clock);
  if(!drawBusy){drawBusy=true;try{await draw();}catch(e){stop();status(e.message);}finally{drawBusy=false;}}
  if(time>=timeline.duration)stop();if(playing)raf=requestAnimationFrame(tick);
 }
 async function play(){
  stop();await prepare();if(!timeline.duration)throw Error('Import or add a scene before playback.');if(time>=timeline.duration)time=0;
  context??=new AudioContext();await context.resume();clock=context.currentTime;clockTime=time;
  if(audioBuffer){const offset=Math.max(0,time-timeline.audioStart);if(offset<audioBuffer.duration){source=context.createBufferSource();source.buffer=audioBuffer;gainNode=context.createGain();gainNode.gain.value=state.manifest.audio.gain;source.connect(gainNode);gainNode.connect(context.destination);source.start(clock+Math.max(0,timeline.audioStart-time),offset);}}
  stopTracks=scheduleAudioTracks(context,audioTracks,time);
  playing=true;raf=requestAnimationFrame(tick);
 }
 async function save(){
  if(!store||!projectId)throw Error('Save and open the Creator project before saving its local video draft.');
  validateManifest(state.manifest,{mapAssets:mapAssets()});const assets=new Set([...state.brandAssets,...state.manifest.assets].map(a=>a.id));state.brands.forEach(b=>validateBrand(b,assets));
  // Preserve byte-identical originals. A failed quota write never updates the draft pointer.
  for(const [id,file] of state.files)await store.put('file:'+id,file);
  state.brandAssets=[...new Map([...state.brandAssets,...state.manifest.assets].map(a=>[a.id,a])).values()];await store.put('brands',{brands:state.brands,assets:state.brandAssets});
  const version=uid();await store.put('version:'+projectId+':'+version,structuredClone(state.manifest));await store.put('draft:'+projectId,version);
  status('Video draft and original uploads saved on this device. JSON contains references, not media bytes.');
 }
 function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 function lock(value){busy=value;root.querySelectorAll('button,input,textarea,select').forEach(n=>n.disabled=value);$('[data-vs=cancel]').disabled=!value;$('[data-vs=apply]').disabled=value||!pending;}
 const run=async fn=>{if(busy||disposed)return;lock(true);stop();try{if(drawing)await drawing.catch(()=>{});await fn();}catch(e){if(!disposed)sync();status(e.name==='AbortError'?'Export cancelled.':e.message);}finally{if(!disposed)lock(false);}};
 async function renderExport(){
  stop();controller=new AbortController();root.dataset.exporting='true';let codec=null;try{await prepare();status('Rendering MP4…');const blob=await encodeStudioVideo({canvas,timeline,audioBuffer,audioTracks,audioGain:state.manifest.audio?.gain??1,signal:controller.signal,onAudioCodec:value=>{codec=value;status(`Rendering H.264 + ${value.toUpperCase()} audio…`);},onProgress:p=>{if(!disposed)$('[data-vs-progress]').value=p.progress;},drawFrame:(t,signal)=>renderer.draw(t,{exporting:true,signal})});if(!disposed){download(blob,(state.manifest.title||'video').replace(/[^\p{L}\p{N}_-]/gu,'_')+'.mp4');status(audioBuffer||audioTracks.length?`MP4 exported with synchronized ${codec.toUpperCase()} voiceover and audio.${codec==='opus'?' Opus MP4 needs a compatible player.':''}`:'MP4 exported without audio (no voiceover selected).');}}finally{if(controller?.signal.aborted)invalidate();controller=null;root.dataset.exporting='false';if(!disposed)await draw();}
 }
 root.addEventListener('click',event=>{
  if(event.target.closest('[data-assembly]'))return;
  const at=event.target.closest('[data-vs-at]');if(at&&!busy){stop();time=Number(at.dataset.vsAt);assembly?.select(at.dataset.vsSceneId);run(draw);return;}
  const button=event.target.closest('[data-vs]');if(!button)return;const action=button.dataset.vs;
  if(action==='cancel'){controller?.abort(new DOMException('Export cancelled','AbortError'));return;}
  run(async()=>{
   if(action==='save')await save();
   if(action==='download')download(new Blob([JSON.stringify(state.manifest,null,2)],{type:'application/json'}),'video-studio.json');
   if(action==='validate'){
    pending=null;const next=validateManifest($('[data-vs-json]').value,{mapAssets:mapAssets()});if(!state.brands.some(b=>b.id===next.brandPresetId))throw Error('Choose or create the referenced brand profile first.');
    validateBrand(state.brands.find(b=>b.id===next.brandPresetId),new Set(next.assets.map(a=>a.id)));pending=next;
    $('[data-vs-review]').textContent=`${next.scenes.length} scenes · ${next.aspectRatio} · ${next.audio?.name||'no voiceover'} · applies only to the separate video draft.`;status('Import reviewed. Apply when ready.');
   }
   if(action==='apply'&&pending){const next=pending;await applyManifest(next);status('Video instructions applied. Existing Creator data is preserved.');}
   if(action==='example'){
    const next=emptyVideo();next.title='My first video';next.assets=state.manifest.assets;next.scenes=[{id:'explain',startSeconds:0,durationSeconds:5,engineType:'graphic',engineData:{},transition:{type:'fade',durationSeconds:.3},overlays:[{id:'heading',type:'text',text:'Your next story',fontSize:72,keyframes:[{timeSeconds:0,y:.65,opacity:0,easing:'smooth'},{timeSeconds:1,y:.5,opacity:1}]}]}];await applyManifest(next);$('[data-vs-json]').value=JSON.stringify(next,null,2);status('Example loaded in the video draft.');
   }
   if(action==='brand-apply'){
    const b=validateBrand(JSON.parse($('[data-vs-brand-json]').value),new Set(state.manifest.assets.map(a=>a.id)));
    const nextBrands=structuredClone(state.brands),i=nextBrands.findIndex(x=>x.id===b.id);
    if(i<0){if(nextBrands.length>=20)throw Error('Use up to 20 profiles.');nextBrands.push(b);}else nextBrands[i]=b;
    const nextManifest={...structuredClone(state.manifest),brandPresetId:b.id};
    await applyManifest(nextManifest,{brands:nextBrands});status('Brand profile applied. Save to reuse it on this device.');
   }
   if(action==='brand-templates'){invalidate();brand().intro=template('intro',brand().name);brand().outro=template('outro','Thank you');sync();status('Title templates added. Enable intro/outro to apply them.');}
   if(action==='reuse'){const a=mapAssets().find(a=>a.id===$('[data-vs-library]').value);if(!a)throw Error('Choose a map image first.');invalidate();if(!state.manifest.assets.some(x=>x.libraryId===a.id))state.manifest.assets.push({id:uid(),name:a.name,libraryId:a.id});sync();}
   if(action==='remove-audio'){const next=structuredClone(state.manifest);next.audio=null;if(next.audioClips)next.audioClips=next.audioClips.filter(a=>a.role!=='voiceover');await applyManifest(next);}
   if(action==='play')await play();if(action==='pause'){stop();await draw();}
   if(action==='export')await renderExport();
  });
 });
 root.addEventListener('input',event=>{
  if(event.target.matches('[data-vs-json]')){pending=null;$('[data-vs=apply]').disabled=true;$('[data-vs-review]').textContent='';}
  if(event.target.matches('[data-vs-seek]')&&!busy){stop();time=Number(event.target.value);if(!drawBusy){drawBusy=true;draw().catch(e=>status(e.message)).finally(()=>drawBusy=false);}}
 });
 root.addEventListener('change',event=>{
  if(event.target.closest('[data-assembly]'))return;
  const target=event.target;if(target.matches('[data-vs-seek]'))return;
  run(async()=>{
   if(target.matches('[data-vs-json-file]')){const file=target.files[0];if(file){if(file.size>1000000)throw Error('Use JSON under 1 MB.');$('[data-vs-json]').value=await file.text();pending=null;status('File loaded. Review it before applying.');}return;}
   if(target.matches('[data-vs-images]')){
    const files=[...target.files];
    if(state.manifest.assets.length+files.length>200)throw Error('Use up to 200 images.');
    for(const file of files)if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>25*1024*1024)throw Error('Use PNG/JPEG/WebP up to 25 MB.');
    for(const file of files){const fileId=uid();state.files.set(fileId,file);state.manifest.assets.push({id:uid(),name:file.name,fileId});}
    invalidate();sync();return;
   }
   if(target.matches('[data-vs-audio]')){
    const file=target.files[0];if(!file)return;if(!/\.(mp3|wav)$/i.test(file.name))throw Error('Choose an MP3 or WAV.');
    const decoded=await decodeVoiceover(file),fileId=uid(),next=structuredClone(state.manifest);
    state.files.set(fileId,file);
    if(next.schemaVersion===2)next.audioClips.push({id:uid(),fileId,name:file.name,role:'voiceover',startSeconds:0,trimStart:0,durationSeconds:decoded.duration,gain:1,fadeIn:0,fadeOut:0});
    else next.audio={fileId,name:file.name,startSeconds:0,gain:1};
    try{await applyManifest(next);}catch(error){state.files.delete(fileId);throw error;}
    status('Voiceover loaded. Full recording will be included in export.');return;
   }
   const next=structuredClone(state.manifest);
   if(target.matches('[data-vs-title]'))next.title=target.value;
   else if(target.matches('[data-vs-ratio]'))next.aspectRatio=target.value;
   else if(target.matches('[data-vs-brand]')){next.brandPresetId=target.value;const b=state.brands.find(b=>b.id===target.value);next.assets=assetsForBrand(b,next.assets,state.brandAssets);}
   else if(target.matches('[data-vs-intro]')){if(target.checked&&!brand().intro)throw Error('Add an intro template in Brand profile first.');next.introEnabled=target.checked;}
   else if(target.matches('[data-vs-outro]')){if(target.checked&&!brand().outro)throw Error('Add an outro template in Brand profile first.');next.outroEnabled=target.checked;}
   else if(target.matches('[data-vs-audio-start],[data-vs-gain]')){if(!next.audio)throw Error('Upload voiceover first.');next.audio.startSeconds=Number($('[data-vs-audio-start]').value);next.audio.gain=Number($('[data-vs-gain]').value);}
   else return;
   validateManifest(next,{mapAssets:mapAssets()});await applyManifest(next);
  });
 });
 assembly=mountAssembly(assemblyRoot,{session:state,getManifest:()=>state.manifest,getProject,getFile,putFile:(id,file)=>state.files.set(id,file),deleteFile:id=>state.files.delete(id),run,status,getTime:()=>time,setTime:value=>{time=value;state.time=value;},releaseRenderer:async()=>{stop();if(drawing)await drawing.catch(()=>{});invalidate();},setManifest:applyManifest,previewManifest:async next=>{if(next===state.manifest){invalidate();await draw();return;}invalidate();try{const b=brand(),t=compileTimeline(next,b);audioTracks=await loadAudioTracks(next,getFile);const lead=t.audioClips[0]&&next.audioClips?.[0]?t.audioClips[0].startSeconds-next.audioClips[0].startSeconds:0;audioTracks=audioTracks.map(a=>({...a,startSeconds:a.startSeconds+lead}));const nextRenderer=await createStudioRenderer(canvas,next,t,b,{getFile,mapAssets:mapAssets(),signal:lifecycle.signal});if(disposed){nextRenderer.destroy();return;}renderer=nextRenderer;timeline=t;await renderer.draw(time);}catch(error){invalidate();try{await draw();}catch{}throw error;}}});
 const ready=run(async()=>{
  if(!state.loaded){if(store){const library=await store.get('brands');if(library){state.brands=library.brands;state.brandAssets=library.assets;}if(projectId){const version=await store.get('draft:'+projectId);if(version){const saved=await store.get('version:'+projectId+':'+version);if(saved)state.manifest=validateManifest(saved,{mapAssets:mapAssets()});}}}state.manifest.assets=assetsForBrand(brand(),state.manifest.assets,state.brandAssets);state.loaded=true;}
  sync();await draw();status('Your draft stays on this device. Save to keep uploaded originals.');
 });
 const hidden=()=>{if(document.hidden)stop();};document.addEventListener('visibilitychange',hidden);
 return {ready,get manifest(){return state.manifest;},destroy(){disposed=true;state.time=time;assembly?.destroy();stop();lifecycle.abort(new DOMException('Workspace closed','AbortError'));controller?.abort(new DOMException('Workspace closed','AbortError'));renderer?.destroy();context?.close();store?.close();document.removeEventListener('visibilitychange',hidden);}};
}
