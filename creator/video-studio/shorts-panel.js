import {createShortManifest} from './short-manifest.js';
import {compileTimeline,exportDimensions} from './model.js?v=2026112204';
import {createStudioRenderer} from './adapters.js?v=2026112204';
import {decodeVoiceover,loadAudioTracks,scheduleAudioTracks} from './audio.js?v=2026112201';
import {encodeStudioVideo} from './export.js?v=2026112201';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const download=(blob,name)=>{const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);};

export function mountShortsPanel(root,{getManifest,setManifest,getFile,mapAssets,brand,run,status,pause}) {
 const panel=document.createElement('details');panel.className='vs-shorts';
 panel.innerHTML='<summary>Shorts from this video</summary><p class="vs-help">Reuse complete scenes and the original recording. Review portrait framing before exporting. Save the video to keep your cuts.</p><label>Short title<input data-short-title maxlength="200"></label><label>Standalone hook<textarea data-short-hook rows="2" maxlength="500"></textarea></label><div class="vs-grid"><label>First scene<select data-short-first></select></label><label>Last scene<select data-short-last></select></label></div><button type="button" data-short-add>Save cut</button><div data-short-list></div>';
 root.append(panel);
 const $=q=>panel.querySelector(q);
 let disposed=false,review=null;
 function sync(){
  const manifest=getManifest();
  for(const key of ['first','last']){const select=$('[data-short-'+key+']'),selected=select.value;select.innerHTML=manifest.scenes.map((s,i)=>`<option value="${esc(s.id)}">${i+1} · ${esc(s.name||s.id)} · ${s.startSeconds.toFixed(1)}s</option>`).join('');if(manifest.scenes.some(s=>s.id===selected))select.value=selected;}
  $('[data-short-add]').disabled=!manifest.scenes.length;
  $('[data-short-list]').innerHTML=(manifest.shortCuts||[]).map(c=>`<article><strong>${esc(c.title)}</strong><p class="vs-help">${esc(c.hook||'')}</p><div class="vs-actions"><button type="button" data-short-review="${esc(c.id)}">Review portrait</button><button type="button" data-short-remove="${esc(c.id)}">Remove cut</button></div></article>`).join('');
 }
 async function build(cut){
  const manifest=getManifest();let audioDuration=0;
  if(manifest.audio){const file=await getFile(manifest.audio.fileId);if(!file)throw Error('Restore the original narration before making a Short.');audioDuration=(await decodeVoiceover(file)).duration;}
  return createShortManifest(manifest,cut,{audioDuration,mapAssets:mapAssets()});
 }
 function close(){review?.close();review=null;}
 async function open(cut){
  pause();close();const manifest=await build(cut);if(disposed)return;
  const dialog=document.createElement('dialog');dialog.className='vs-short-review';dialog.setAttribute('aria-label','Portrait Short review');
  dialog.innerHTML=`<h3>${esc(cut.title)}</h3><p class="vs-help">Portrait review · the long video stays unchanged. For individual framing edits, download the editable JSON and use the existing reviewed import in a separate project.</p><canvas aria-label="Portrait Short preview"></canvas><label>Short time<input type="range" min="0" value="0" step="0.0333333333" data-short-seek></label><output data-short-time></output><div class="vs-actions"><button data-short-play>Play Short</button><button data-short-pause>Pause</button><button data-short-export>Export Short MP4</button><button data-short-json>Download editable JSON</button><button data-short-close>Close</button></div><p role="status" data-short-status></p>`;
  root.append(dialog);dialog.showModal();
  const canvas=dialog.querySelector('canvas'),size=exportDimensions('9:16');canvas.width=size.width;canvas.height=size.height;
  const feedback=dialog.querySelector('[data-short-status]'),seek=dialog.querySelector('[data-short-seek]'),controller=new AbortController();
  let renderer,tracks=[],timeline,time=0,context,stopAudio,raf,playing=false,drawing=false,exporting=false;
  const stop=()=>{playing=false;cancelAnimationFrame(raf);stopAudio?.();stopAudio=null;};
  const session={close(){stop();controller.abort();renderer?.destroy();context?.close();dialog.remove();}};review=session;
  dialog.querySelector('[data-short-close]').onclick=close;
  dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
  async function draw(){if(drawing||controller.signal.aborted)return;drawing=true;try{await renderer.draw(time);seek.value=time;dialog.querySelector('[data-short-time]').textContent=`${time.toFixed(2)} / ${timeline.duration.toFixed(2)}s`;}finally{drawing=false;}}
  function error(e){if(e.name!=='AbortError')feedback.textContent=e.message;}
  try{
   feedback.textContent='Loading original scenes and narration…';
   tracks=await loadAudioTracks(manifest,getFile);controller.signal.throwIfAborted();
   timeline=compileTimeline(manifest,brand());seek.max=timeline.duration;
   renderer=await createStudioRenderer(canvas,manifest,timeline,brand(),{getFile,mapAssets:mapAssets(),signal:controller.signal});
   controller.signal.throwIfAborted();await draw();feedback.textContent='Check labels, diagrams and the beginning and ending of the narration.';
   seek.oninput=()=>{if(exporting)return;stop();time=Number(seek.value);draw().catch(error);};
   dialog.querySelector('[data-short-pause]').onclick=stop;
   dialog.querySelector('[data-short-play]').onclick=async()=>{try{if(exporting)return;stop();if(time>=timeline.duration)time=0;context??=new AudioContext();await context.resume();stopAudio=scheduleAudioTracks(context,tracks,time);const origin=context.currentTime,from=time;playing=true;async function tick(){if(!playing)return;time=Math.min(timeline.duration,from+context.currentTime-origin);try{await draw();}catch(e){stop();error(e);return;}if(time>=timeline.duration)stop();else raf=requestAnimationFrame(tick);}raf=requestAnimationFrame(tick);}catch(e){error(e);}};
   dialog.querySelector('[data-short-json]').onclick=()=>download(new Blob([JSON.stringify(manifest,null,2)],{type:'application/json'}),'short-'+cut.id+'.json');
   dialog.querySelector('[data-short-export]').onclick=async()=>{
    if(exporting)return;stop();exporting=true;
    for(const button of dialog.querySelectorAll('button:not([data-short-close])'))button.disabled=true;seek.disabled=true;
    try{
     if(renderer.missingAssets.length)throw Error('Restore missing artwork before exporting the Short.');
     if(drawing)throw Error('Wait for the preview frame to finish, then export again.');
     const blob=await encodeStudioVideo({canvas,timeline,audioTracks:tracks,signal:controller.signal,drawFrame:(at,signal)=>renderer.draw(at,{exporting:true,signal}),onProgress:p=>feedback.textContent=`Rendering Short · ${Math.round(p.progress*100)}%`});
     controller.signal.throwIfAborted();download(blob,cut.title.replace(/[^\p{L}\p{N}_-]/gu,'_')+'.mp4');feedback.textContent='Short MP4 exported with its original audio timing.';
    }catch(e){error(e);}finally{exporting=false;if(!controller.signal.aborted){for(const button of dialog.querySelectorAll('button'))button.disabled=false;seek.disabled=false;await draw().catch(error);}}
   };
  }catch(e){error(e);}
 }
 panel.onclick=event=>{
  const remove=event.target.closest('[data-short-remove]');if(remove)run(async()=>{const next=structuredClone(getManifest());next.shortCuts=next.shortCuts.filter(c=>c.id!==remove.dataset.shortRemove);await setManifest(next);status('Cut removed from this draft. Source scenes and recordings are unchanged. Save to keep the change.');});
  if(event.target.closest('[data-short-add]'))run(async()=>{
   const next=structuredClone(getManifest()),cut={id:crypto.randomUUID(),title:$('[data-short-title]').value.trim(),hook:$('[data-short-hook]').value.trim(),firstSceneId:$('[data-short-first]').value,lastSceneId:$('[data-short-last]').value};
   await build(cut);next.shortCuts??=[];next.shortCuts.push(cut);await setManifest(next);status('Short cut added. Save to keep it with this video.');
  });
  const button=event.target.closest('[data-short-review]');if(button)run(async()=>{const cut=getManifest().shortCuts?.find(c=>c.id===button.dataset.shortReview);if(cut)await open(cut);});
 };
 sync();return {sync,destroy(){disposed=true;close();panel.remove();}};
}
