import {emptyVideo,PRESETS,validateManifest,validateBrand,compileTimeline,exportDimensions,assetsForBrand} from './model.js';
import {createStudioRenderer} from './adapters.js';
import {decodeVoiceover} from './audio.js';
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
 <details open><summary>Animation JSON</summary><label>Import JSON file<input type="file" data-vs-json-file accept=".json,application/json"></label><textarea data-vs-json aria-label="Video manifest JSON" placeholder="Paste structured Video Studio JSON"></textarea><div class="vs-actions"><button data-vs="validate">Review import</button><button data-vs="apply" disabled>Apply reviewed import</button></div><p data-vs-review class="vs-help"></p></details>
 <details><summary>Assets & voiceover</summary><label>Upload images<input type="file" data-vs-images multiple accept="image/png,image/jpeg,image/webp"></label><p class="vs-help">PNG, JPEG or WebP, up to 25 MB each. Use the asset ID in an image overlay or logo slot. Existing map image references appear below.</p><select data-vs-library aria-label="Existing map image"><option value="">Choose existing map image</option></select><button data-vs="reuse">Reuse selected image</button><div data-vs-assets class="vs-files"></div>
 <label>Upload voiceover<input type="file" data-vs-audio accept=".mp3,.wav,audio/mpeg,audio/wav"></label><p data-vs-audio-name class="vs-help">No voiceover selected</p><div class="vs-grid"><label>Audio start (content seconds)<input type="number" min="0" max="600" step=".01" data-vs-audio-start value="0"></label><label>Gain<input type="number" min="0" max="2" step=".05" data-vs-gain value="1"></label></div><button data-vs="remove-audio">Remove voiceover from video</button></details>
 <div role="status" aria-live="polite" data-vs-status></div></div><div class="vs-preview"><canvas aria-label="Video preview"></canvas><div data-vs-track class="vs-track" aria-label="Common timeline"></div><input type="range" min="0" max="1" step=".0333333333" value="0" data-vs-seek aria-label="Video time"><output data-vs-time>0.00s</output><div class="vs-actions"><button data-vs="play">Play</button><button data-vs="pause">Pause</button><button data-vs="export">Export MP4</button><button data-vs="cancel" disabled>Cancel export</button></div><progress data-vs-progress value="0" max="1"></progress><p class="vs-help">30 fps · 1080p · MP4 with audio when voiceover is selected (AAC preferred, Opus fallback). Full audio is preserved; its duration may extend the video. Fade transitions use the brand background. Export needs H.264 and audio WebCodecs support. Opus MP4 may need a current player.</p></div></div>`;
 const $=q=>root.querySelector(q),canvas=$('canvas'),mapAssets=()=>getProject()?.historicalMap?.visual?.assets||[];
 const account=getAccountId(),projectId=getProject()?.id;const store=account?openStudioStore(account):null;
 const state=session;if(state.account!==account||state.projectId!==projectId){for(const key of Object.keys(state))delete state[key];state.account=account;state.projectId=projectId;}state.manifest??=emptyVideo();state.brands??=structuredClone(PRESETS);state.files??=new Map();state.brandAssets??=[];
 const lifecycle=new AbortController();
 let drawing=null;
 let renderer=null,timeline=null,audioBuffer=null,playing=false,raf=0,time=0,context=null,source=null,gainNode=null,clock=0,clockTime=0,disposed=false,busy=false,pending=null,controller=null,drawBusy=false,preparing=null;
 const status=text=>{if(!disposed)$('[data-vs-status]').textContent=text;};
 const getFile=async fileId=>state.files.get(fileId)||await store?.get('file:'+fileId);
 const brand=()=>state.brands.find(b=>b.id===state.manifest.brandPresetId)||state.brands[0];
 function stop(){playing=false;cancelAnimationFrame(raf);if(source){try{source.stop();}catch{}source.disconnect();source=null;}gainNode?.disconnect();gainNode=null;}
 function invalidate(){stop();renderer?.destroy();renderer=null;audioBuffer=null;time=0;pending=null;$('[data-vs=apply]').disabled=true;}
 function sync(){
  const m=state.manifest;$('[data-vs-title]').value=m.title;$('[data-vs-ratio]').value=m.aspectRatio;
  $('[data-vs-brand]').innerHTML=state.brands.map(b=>`<option value="${esc(b.id)}">${esc(b.name)}</option>`).join('');$('[data-vs-brand]').value=brand().id;
  $('[data-vs-intro]').checked=!!m.introEnabled;$('[data-vs-outro]').checked=!!m.outroEnabled;
  $('[data-vs-brand-json]').value=JSON.stringify(brand(),null,2);
  $('[data-vs-audio-name]').textContent=m.audio?.name||'No voiceover selected';$('[data-vs-audio-start]').value=m.audio?.startSeconds??0;$('[data-vs-gain]').value=m.audio?.gain??1;
  $('[data-vs-assets]').innerHTML=m.assets.map(a=>`<div>${esc(a.name)} · <code>${esc(a.id)}</code></div>`).join('');
  $('[data-vs-library]').innerHTML='<option value="">Choose existing map image</option>'+mapAssets().filter(a=>a.type==='image').map(a=>`<option value="${esc(a.id)}">${esc(a.name)}</option>`).join('');
 }
 async function prepare(){
  if(renderer)return;if(preparing)return preparing;
  preparing=(async()=>{
   const m=validateManifest(state.manifest,{mapAssets:mapAssets()}),b=validateBrand(brand(),new Set(m.assets.map(a=>a.id)));
   if(m.audio){const file=await getFile(m.audio.fileId);if(!file)throw Error('Voiceover is missing on this device. Upload the original recording again.');audioBuffer??=await decodeVoiceover(file);}
   timeline=compileTimeline(m,b,audioBuffer?.duration||0);const size=exportDimensions(m.aspectRatio);canvas.width=size.width;canvas.height=size.height;
   const next=await createStudioRenderer(canvas,m,timeline,b,{getFile,mapAssets:mapAssets(),signal:controller?.signal||lifecycle.signal});
   if(disposed){next.destroy();return;}renderer=next;
   $('[data-vs-seek]').max=timeline.duration||1;$('[data-vs-track]').innerHTML=timeline.scenes.map(s=>`<button data-vs-at="${s.startSeconds}" title="${esc(s.id)}">${esc(s.id)} · ${s.startSeconds.toFixed(1)}–${(s.startSeconds+s.durationSeconds).toFixed(1)}s · ${s.engineType}</button>`).join('');
  })().finally(()=>preparing=null);return preparing;
 }
 async function draw(){
  if(drawing)await drawing.catch(()=>{});
  const task=(async()=>{await prepare();if(disposed||!renderer)return;await renderer.draw(time);$('[data-vs-seek]').value=time;$('[data-vs-time]').textContent=`${time.toFixed(2)} / ${timeline.duration.toFixed(2)}s`;})();drawing=task;try{await task;}finally{if(drawing===task)drawing=null;}
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
  stop();controller=new AbortController();let codec=null;try{await prepare();status('Rendering MP4…');const blob=await encodeStudioVideo({canvas,timeline,audioBuffer,audioGain:state.manifest.audio?.gain??1,signal:controller.signal,onAudioCodec:value=>{codec=value;status(`Rendering H.264 + ${value.toUpperCase()} audio…`);},onProgress:p=>{if(!disposed)$('[data-vs-progress]').value=p.progress;},drawFrame:(t,signal)=>renderer.draw(t,{exporting:true,signal})});if(!disposed){download(blob,(state.manifest.title||'video').replace(/[^\p{L}\p{N}_-]/gu,'_')+'.mp4');status(audioBuffer?`MP4 exported with synchronized ${codec.toUpperCase()} voiceover.${codec==='opus'?' Opus MP4 needs a compatible player.':''}`:'MP4 exported without audio (no voiceover selected).');}}finally{controller=null;if(!disposed)await draw();}
 }
 root.addEventListener('click',event=>{
  const at=event.target.closest('[data-vs-at]');if(at&&!busy){stop();time=Number(at.dataset.vsAt);run(draw);return;}
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
   if(action==='apply'&&pending){const next=pending;invalidate();state.manifest=next;sync();await draw();status('Video instructions applied. Existing Creator data is preserved.');}
   if(action==='example'){
    const next=emptyVideo();next.title='My first video';next.assets=state.manifest.assets;next.scenes=[{id:'explain',startSeconds:0,durationSeconds:5,engineType:'graphic',engineData:{},transition:{type:'fade',durationSeconds:.3},overlays:[{id:'heading',type:'text',text:'Your next story',fontSize:72,keyframes:[{timeSeconds:0,y:.65,opacity:0,easing:'smooth'},{timeSeconds:1,y:.5,opacity:1}]}]}];invalidate();state.manifest=next;sync();$('[data-vs-json]').value=JSON.stringify(next,null,2);await draw();status('Example loaded in the video draft.');
   }
   if(action==='brand-apply'){
    const b=validateBrand(JSON.parse($('[data-vs-brand-json]').value),new Set(state.manifest.assets.map(a=>a.id)));invalidate();const i=state.brands.findIndex(x=>x.id===b.id);if(i<0){if(state.brands.length>=20)throw Error('Use up to 20 profiles.');state.brands.push(b);}else state.brands[i]=b;state.manifest.brandPresetId=b.id;sync();await draw();status('Brand profile applied. Save to reuse it on this device.');
   }
   if(action==='brand-templates'){invalidate();brand().intro=template('intro',brand().name);brand().outro=template('outro','Thank you');sync();status('Title templates added. Enable intro/outro to apply them.');}
   if(action==='reuse'){const a=mapAssets().find(a=>a.id===$('[data-vs-library]').value);if(!a)throw Error('Choose a map image first.');invalidate();if(!state.manifest.assets.some(x=>x.libraryId===a.id))state.manifest.assets.push({id:uid(),name:a.name,libraryId:a.id});sync();}
   if(action==='remove-audio'){invalidate();state.manifest.audio=null;sync();await draw();}
   if(action==='play')await play();if(action==='pause'){stop();await draw();}
   if(action==='export')await renderExport();
  });
 });
 root.addEventListener('input',event=>{
  if(event.target.matches('[data-vs-json]')){pending=null;$('[data-vs=apply]').disabled=true;$('[data-vs-review]').textContent='';}
  if(event.target.matches('[data-vs-seek]')&&!busy){stop();time=Number(event.target.value);if(!drawBusy){drawBusy=true;draw().catch(e=>status(e.message)).finally(()=>drawBusy=false);}}
 });
 root.addEventListener('change',event=>{
  const target=event.target;if(target.matches('[data-vs-seek]'))return;
  run(async()=>{
   if(target.matches('[data-vs-json-file]')){const file=target.files[0];if(file){if(file.size>1000000)throw Error('Use JSON under 1 MB.');$('[data-vs-json]').value=await file.text();pending=null;status('File loaded. Review it before applying.');}return;}
   if(target.matches('[data-vs-images]')){for(const file of target.files){if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>25*1024*1024)throw Error('Use PNG/JPEG/WebP up to 25 MB.');if(state.manifest.assets.length>=200)throw Error('Use up to 200 images.');const fileId=uid();state.files.set(fileId,file);state.manifest.assets.push({id:uid(),name:file.name,fileId});}invalidate();sync();return;}
   if(target.matches('[data-vs-audio]')){const file=target.files[0];if(!file)return;if(!/\.(mp3|wav)$/i.test(file.name))throw Error('Choose an MP3 or WAV.');const decoded=await decodeVoiceover(file),fileId=uid();invalidate();state.files.set(fileId,file);state.manifest.audio={fileId,name:file.name,startSeconds:0,gain:1};audioBuffer=decoded;sync();await draw();status('Voiceover loaded. Full recording will be included in export.');return;}
   const next=structuredClone(state.manifest);
   if(target.matches('[data-vs-title]'))next.title=target.value;
   else if(target.matches('[data-vs-ratio]'))next.aspectRatio=target.value;
   else if(target.matches('[data-vs-brand]')){next.brandPresetId=target.value;const b=state.brands.find(b=>b.id===target.value);next.assets=assetsForBrand(b,next.assets,state.brandAssets);}
   else if(target.matches('[data-vs-intro]')){if(target.checked&&!brand().intro)throw Error('Add an intro template in Brand profile first.');next.introEnabled=target.checked;}
   else if(target.matches('[data-vs-outro]')){if(target.checked&&!brand().outro)throw Error('Add an outro template in Brand profile first.');next.outroEnabled=target.checked;}
   else if(target.matches('[data-vs-audio-start],[data-vs-gain]')){if(!next.audio)throw Error('Upload voiceover first.');next.audio.startSeconds=Number($('[data-vs-audio-start]').value);next.audio.gain=Number($('[data-vs-gain]').value);}
   else return;
   validateManifest(next,{mapAssets:mapAssets()});invalidate();state.manifest=next;sync();await draw();
  });
 });
 const ready=run(async()=>{
  if(!state.loaded){if(store){const library=await store.get('brands');if(library){state.brands=library.brands;state.brandAssets=library.assets;}if(projectId){const version=await store.get('draft:'+projectId);if(version){const saved=await store.get('version:'+projectId+':'+version);if(saved)state.manifest=validateManifest(saved,{mapAssets:mapAssets()});}}}state.manifest.assets=assetsForBrand(brand(),state.manifest.assets,state.brandAssets);state.loaded=true;}
  sync();await draw();status('Import instructions or load an example to start. Save is explicit.');
 });
 const hidden=()=>{if(document.hidden)stop();};document.addEventListener('visibilitychange',hidden);
 return {ready,get manifest(){return state.manifest;},destroy(){disposed=true;stop();lifecycle.abort(new DOMException('Workspace closed','AbortError'));controller?.abort(new DOMException('Workspace closed','AbortError'));renderer?.destroy();context?.close();store?.close();document.removeEventListener('visibilitychange',hidden);}};
}
