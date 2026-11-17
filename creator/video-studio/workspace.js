import {createAgentOperations} from './agent.js?v=2026111707';
import {checkStudioGlb, MAX_MODEL_BYTES} from './three-scene.js';
import {mountConnectedImageGenerator} from '../image-generator.js?v=2026111206';
import {callImageRelay,draftRemoteImagePrompt} from '../../shared/firebase-image-relay.js?v=2026111205';
import {createMediaClient,inspectMedia,isCloudFile} from '../media-library.js?v=2026111603';
import {studioBrief} from './handoff.js?v=2026111207';
import {upgradeVideo,arrangeScenes} from './composition.js?v=2026111705';
import {emptyVideo,PRESETS,validateManifest,validateBrand,compileTimeline,exportDimensions,assetsForBrand} from './model.js?v=2026111707';
import {createStudioRenderer} from './adapters.js?v=2026111707';
import {decodeVoiceover,loadAudioTracks,scheduleAudioTracks} from './audio.js?v=2026111604';
import {mountAssembly} from './assembly.js?v=2026111707';
import {encodeStudioVideo} from './export.js?v=2026111209';
import {openStudioStore} from './storage.js';
import {compileAiStoryboardManifest} from '../ai-preview.js?v=2026111705';
import {runAiProduction} from '../ai-production-runner.mjs?v=2026111203';
import {generateVoiceover} from '../tts-api.js';
import {createProductionReadiness,selectProductionVoice} from './production-readiness.js?v=2026111322';
import {loadPendingAiDraft,loadPendingAiAudio,savePendingAiDraft} from '../ai-draft.js?v=2026111319';
import {startBrowserSceneJpgBridge} from './browser-scene-jpg-bridge.js?v=2026111605';
import {mountStyleGallery} from './style-gallery.js?v=2026111707';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>crypto.randomUUID();
const template=(name,text)=>({id:name,startSeconds:0,durationSeconds:2,engineType:'graphic',engineData:{},transition:{type:'fade',durationSeconds:.3},overlays:[{id:'title',type:'text',text,x:.5,y:.5,fontSize:64}]});
export function mountVideoStudio(root,{getProject,getAccountId=()=>null,session={},mediaService=null,readiness=createProductionReadiness(getAccountId),quickPreview=false}){
 root.classList.toggle('vs-quick-preview',quickPreview);
 root.className='video-studio';
 root.innerHTML=`<div class="vs-layout space-panels" tabindex="0" aria-label="Motion Studio panels"><div><strong>Video Studio · Phase 1</strong><p class="vs-help">Separate video draft. Existing storyboard, map and LIC pages are preserved. Use the shared uploader above for cloud media. The owner can Save the complete video draft to sync it across devices.</p>
 <div class="vs-actions"><button data-vs="save">Save video draft</button><button data-vs="download">Download JSON</button><button data-vs="example">Load example</button></div>
 <label>Video title<input data-vs-title maxlength="200"></label><div class="vs-grid"><label>Frame<select data-vs-ratio><option value="9:16">Portrait · 1080 × 1920</option><option value="16:9">Landscape · 1920 × 1080</option></select></label><label>Brand<select data-vs-brand></select></label></div>
 <div class="vs-actions"><label><input type="checkbox" data-vs-intro>Apply intro</label><label><input type="checkbox" data-vs-outro>Apply outro</label></div>
 <details><summary>Brand profile</summary><p class="vs-help">Configurable colors, font family, logo asset ID, and reusable graphic intro/outro scenes. Use an installed or page-loaded font. LIC preset contains colors only.</p><textarea data-vs-brand-json aria-label="Brand profile JSON"></textarea><div class="vs-actions"><button data-vs="brand-apply">Apply profile</button><button data-vs="brand-templates">Add title intro/outro</button></div></details>
 <details><summary>Animation JSON</summary><label>Import JSON file<input type="file" data-vs-json-file accept=".json,application/json"></label><textarea data-vs-json aria-label="Video manifest JSON" placeholder="Paste structured Video Studio JSON"></textarea><div class="vs-actions"><button data-vs="validate">Review import</button><button data-vs="apply" disabled>Apply reviewed import</button></div><p data-vs-review class="vs-help"></p></details>
 <details><summary>Assets & voiceover</summary><label>Upload images<input type="file" data-vs-images multiple accept="image/png,image/jpeg,image/webp"></label><p class="vs-help">PNG, JPEG or WebP, up to 25 MB each. Use the asset ID in an image overlay or logo slot. Existing map image references appear below.</p><select data-vs-library aria-label="Existing map image"><option value="">Choose existing map image</option></select><button data-vs="reuse">Reuse selected image</button><div data-vs-assets class="vs-files"></div>
 <label>Upload voiceover<input type="file" data-vs-audio accept=".mp3,.wav,audio/mpeg,audio/wav"></label><p data-vs-audio-name class="vs-help">No voiceover selected</p><div class="vs-grid"><label>Audio start (content seconds)<input type="number" min="0" max="600" step=".01" data-vs-audio-start value="0"></label><label>Gain<input type="number" min="0" max="2" step=".05" data-vs-gain value="1"></label></div><button data-vs="remove-audio">Remove voiceover from video</button></details>
 <div role="status" aria-live="polite" data-vs-status></div></div><div class="vs-preview space-panel"><canvas aria-label="Video preview"></canvas><div data-vs-track class="vs-track" aria-label="Common timeline"></div><input type="range" min="0" max="1" step=".0333333333" value="0" data-vs-seek aria-label="Video time"><output data-vs-time>0.00s</output><div class="vs-actions"><button data-vs="play">Play</button><button data-vs="pause">Pause</button><button data-vs="export">Export MP4</button><button data-vs="cancel" disabled>Cancel export</button></div><progress data-vs-progress value="0" max="1"></progress><p class="vs-help">30 fps · 1080p · MP4 with audio when voiceover is selected (AAC preferred, Opus fallback). Full audio is preserved; its duration may extend the video. Fade transitions use the brand background. Export needs H.264 and audio WebCodecs support. Opus MP4 may need a current player.</p></div></div>`;
 const $=q=>root.querySelector(q),canvas=$('canvas'),mapAssets=()=>getProject()?.historicalMap?.visual?.assets||[];
 // Keep the original controls available under Advanced; make visual assembly the opening view.
 const legacy=$('.vs-layout > div'),advanced=document.createElement('details'),assemblyRoot=document.createElement('section'),header=document.createElement('header');
 advanced.className='vs-advanced space-panel';advanced.innerHTML='<summary>Advanced · brand & project settings</summary>';legacy.before(advanced);advanced.append(legacy);legacy.querySelector('strong').textContent='Project settings';
 assemblyRoot.dataset.assembly='';assemblyRoot.className='vs-assembly space-panel';$('.vs-layout').prepend(assemblyRoot);
 header.className='vs-studio-header';header.innerHTML='<div><span class="vs-eyebrow">CREATOR</span><h2>Motion Studio</h2><div class="vs-workspace-shortcuts"><a href="video-workflow.html" target="_blank" rel="noopener">Workflow guide</a></div></div><div class="vs-actions" data-studio-actions></div>';root.prepend(header);const mobile=document.createElement('nav');
 mobile.className='vs-mobile-tabs';mobile.setAttribute('aria-label','Studio panels');
 mobile.innerHTML='<button type="button" data-mobile-panel="scenes">Scenes &amp; audio</button><button type="button" data-mobile-panel="preview">Preview</button><button type="button" data-mobile-panel="settings">Settings</button>';
 header.after(mobile);
 const panels={scenes:assemblyRoot,preview:$('.vs-preview'),settings:advanced};
 root.dataset.mobilePanel='preview';
 mobile.querySelector('[data-mobile-panel="preview"]').setAttribute('aria-pressed','true');
 mobile.onclick=event=>{
  const button=event.target.closest('[data-mobile-panel]');
  if(button){root.dataset.mobilePanel=button.dataset.mobilePanel;mobile.querySelectorAll('[data-mobile-panel]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));panels[button.dataset.mobilePanel].scrollIntoView({block:'nearest',inline:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
 };
 for(const key of ['save','export'])header.querySelector('[data-studio-actions]').append($(`[data-vs=${key}]`));
 const lastExport=document.createElement('a');lastExport.dataset.vsLastExport='';lastExport.className='secondary';lastExport.textContent='Download last MP4';lastExport.hidden=true;header.querySelector('[data-studio-actions]').append(lastExport);
 const saveLastExport=document.createElement('button');saveLastExport.type='button';saveLastExport.dataset.vs='save-last-export';saveLastExport.textContent='Save MP4 to library';saveLastExport.hidden=true;header.querySelector('[data-studio-actions]').append(saveLastExport);
 const cloudExport=document.createElement('a');cloudExport.dataset.vsCloudExport='';cloudExport.className='secondary';cloudExport.textContent='Download saved MP4';cloudExport.hidden=true;header.querySelector('[data-studio-actions]').append(cloudExport);
 $('.vs-layout').append(advanced);advanced.append($('[data-vs-status]'));root.append($('[data-vs-status]'));
 $('.vs-preview .vs-help').textContent='Full HD · 30 fps. Your scenes and audio export together.';
 $('[data-vs=play]').textContent='Preview full video';$('[data-vs=save]').textContent='Save';$('[data-vs=export]').textContent='Export MP4';
 const audioWarning = document.createElement('p');
 audioWarning.dataset.vsAudioWarning = '';
 audioWarning.className = 'vs-help';
 audioWarning.setAttribute('role', 'status');
 audioWarning.hidden = true;
 header.after(audioWarning);
 const allowPlaceholders=document.createElement('label');
 const placeholderConsent=document.createElement('input');
 placeholderConsent.type='checkbox';
 allowPlaceholders.append(placeholderConsent,' Allow placeholders or muted missing audio in MP4 export');
 audioWarning.after(allowPlaceholders);
 const jpgButton=document.createElement('button');jpgButton.type='button';jpgButton.dataset.vs='jpg-previews';jpgButton.textContent='Export JPG previews';$('[data-vs=export]').before(jpgButton);
 const jpgSceneButton=document.createElement('button');jpgSceneButton.type='button';jpgSceneButton.dataset.vs='jpg-scene';jpgSceneButton.textContent='Export selected scene JPG';jpgButton.before(jpgSceneButton);
 const jpgOffsetLabel=document.createElement('label');jpgOffsetLabel.className='vs-help';jpgOffsetLabel.textContent='JPG moment (s; blank = midpoint)';const jpgOffset=document.createElement('input');jpgOffset.type='number';jpgOffset.min='0';jpgOffset.step='.1';jpgOffset.placeholder='midpoint';jpgOffset.dataset.vsJpgOffset='';jpgOffset.setAttribute('aria-label','JPG moment within selected scene in seconds');jpgOffsetLabel.append(jpgOffset);jpgButton.before(jpgOffsetLabel);
 const account=getAccountId(),projectId=getProject()?.id;const store=account?openStudioStore(account):null;
 const state=session;if(state.account!==account||state.projectId!==projectId){for(const key of Object.keys(state))delete state[key];state.account=account;state.projectId=projectId;}state.manifest??=emptyVideo();state.brands??=structuredClone(PRESETS);state.files??=new Map();state.brandAssets??=[];state.cloudRevision??=0;
 const media=mediaService||createMediaClient(account);let catalogue=[],pendingCloud=null,lastExportUrl='',lastExportBlob=null,lastExportName='';
 let stopBrowserSceneJpgBridge=()=>{};
 const localWorker=readiness.worker;
 const setup=document.createElement('section');setup.className='vs-flow';setup.innerHTML=`<section class="vs-step"><h3>Optional · Shared media</h3><p class="vs-help">Upload once to your private library. Reuse the originals across videos and devices.</p><label class="vs-drop">Choose files or drop them here<input data-media-upload type="file" multiple accept="image/png,image/jpeg,image/webp,video/mp4,video/webm,.mp3,.wav,.glb"></label><div class="vs-actions"><button data-vs="library-refresh">Refresh library</button><label>Find an asset<input data-media-search type="search" placeholder="Search your library"></label></div><div data-media-library class="vs-media-library"></div><p class="vs-help" data-media-status>Loading your shared library…</p></section><section class="vs-step" data-flow-json><h3>Manual JSON import</h3><p class="vs-help">Copy a production brief with your script and exact voiceover cues, or review a saved cloud draft.</p><div class="vs-actions"><button data-vs="copy-brief">Copy ChatGPT brief</button><button data-vs="cloud-review">Review cloud draft</button></div></section>`;
 const projectAtOpen=getProject()||{},scriptAtOpen=String(projectAtOpen.script||projectAtOpen.scenes?.map(scene=>scene.voiceover||'').filter(Boolean).join('\n\n')||''),styleAtOpen=typeof projectAtOpen.visualStyle==='string'?projectAtOpen.visualStyle:'';
 const aiCreate=document.createElement('section');aiCreate.className='vs-step';aiCreate.dataset.aiProduction='';aiCreate.innerHTML='<h3>1 · Create with AI</h3><p class="vs-help">Generate narration, timed scenes and an MP4 using Google TTS, your paired laptop AI and this project’s renderer. Google TTS uses your existing quota.</p><label>Voiceover script<textarea data-ai-script rows="5" maxlength="30000" placeholder="Add the narration for this video"></textarea></label><label>Creative direction<textarea data-ai-instructions rows="3" maxlength="4000" placeholder="Describe the map, movement, camera and visual style"></textarea></label><button type="button" data-vs="generate-ai">Generate video</button><p class="vs-help" data-ai-status role="status" aria-live="polite"></p>';
 aiCreate.querySelector('[data-ai-script]').value=scriptAtOpen;aiCreate.querySelector('[data-ai-instructions]').value=styleAtOpen;setup.prepend(aiCreate);
 header.after(setup);const jsonPanel=$('[data-vs-json]').closest('details');jsonPanel.open=true;
 const jsonSection=setup.querySelector('[data-flow-json]');
 const viewJson=document.createElement('button');viewJson.type='button';viewJson.dataset.vs='view-json';viewJson.textContent='View current draft JSON';
 jsonSection.querySelector('.vs-actions').prepend(viewJson);
 const summaryButton=document.createElement('button');summaryButton.type='button';summaryButton.dataset.vs='scene-summary';summaryButton.textContent='View scene summary';viewJson.after(summaryButton);
 const summaryBox=document.createElement('textarea');summaryBox.dataset.vsSummary='';summaryBox.setAttribute('aria-label','Scene summary JSON');summaryBox.readOnly=true;summaryBox.hidden=true;jsonSection.append(summaryBox);
 const instructions=document.createElement('details');instructions.className='vs-agent-instructions';instructions.innerHTML='<summary>Agent instructions</summary><button type="button" data-vs="view-brief">View instructions</button><textarea data-vs-brief readonly aria-label="Agent workflow instructions"></textarea>';jsonSection.append(instructions);
 jsonSection.append(jsonPanel,$('[data-vs=download]'));
 const styleRoot=document.createElement('section');styleRoot.className='vs-style-library space-panel';styleRoot.setAttribute('aria-label','Visual styling library');$('.vs-layout').before(styleRoot);
 $('.vs-layout').before(Object.assign(document.createElement('h3'),{textContent:'3 · Review scenes & audio',className:'vs-review-heading'}));
 const exportNote=document.createElement('p');exportNote.className='vs-help';exportNote.textContent='4 · Export your complete MP4 with audio';$('.vs-preview').prepend(exportNote);
 if(root.closest('.project-page')){
  root.classList.add('vs-editing-first');
  header.querySelector('.vs-eyebrow').remove();
  $('.vs-review-heading').remove();
  exportNote.remove();
  $('.vs-preview .vs-help').remove();

  const create=document.createElement('details');
  create.className='vs-create';
  create.innerHTML='<summary>Create &amp; import</summary>';
  create.append(setup);
  header.querySelector('[data-studio-actions]').prepend(create);
  aiCreate.querySelector('h3').textContent='Create with AI';
  setup.querySelector('.vs-step:not([data-ai-production]) h3').textContent='Media';
  setup.querySelector('[data-flow-json] h3').textContent='Import JSON';
  const shortcuts=header.querySelector('.vs-workspace-shortcuts');
  for(const [label,target] of [
   ['Media library','[data-media-search]'],
   ['Draft JSON','[data-vs=view-json]']
  ]){
   const button=document.createElement('button');
   button.type='button';button.textContent=label;
   button.onclick=()=>{
    create.open=true;
    if(target==='[data-media-search]')selectAssetTool('upload');
    const control=setup.querySelector(target);
    control.scrollIntoView({block:'nearest'});
    control.focus({preventScroll:true});
   };
   shortcuts.append(button);
  }

  const timelinePanel=document.createElement('section');
  timelinePanel.className='vs-editing-timeline';
  timelinePanel.setAttribute('aria-label','Timeline');
  timelinePanel.innerHTML='<h3>Timeline</h3>';
  const preview=$('.vs-preview');
  for(const child of [...preview.children])if(child!==canvas)timelinePanel.append(child);
  $('.vs-layout').after(timelinePanel);
  timelinePanel.after(advanced);

  const empty=document.createElement('div');
  empty.className='vs-editing-empty';
  empty.innerHTML='<p>No scenes yet</p><div class="vs-actions"><button type="button" data-empty-add>+ Add scene</button><button type="button" data-empty-create>Create or import</button></div>';
  preview.append(empty);
  empty.querySelector('[data-empty-add]').onclick=()=>assemblyRoot.querySelector('[data-compose=add]')?.click();
  empty.querySelector('[data-empty-create]').onclick=()=>{create.open=true;create.querySelector('summary').focus();};
 }
 setup.ondragover=e=>{e.preventDefault();};setup.ondrop=e=>{e.preventDefault();if(e.dataTransfer.files.length)run(()=>uploadFiles([...e.dataTransfer.files]));};
 const lifecycle=new AbortController();
 let drawing=null;
 let renderer=null,timeline=null,audioBuffer=null,audioTracks=[],stopTracks=null,assembly=null,styleGallery=null,playing=false,raf=0,time=state.time||0,context=null,source=null,gainNode=null,clock=0,clockTime=0,disposed=false,busy=false,pending=null,controller=null,drawBusy=false,preparing=null;
 const status=text=>{if(!disposed)$('[data-vs-status]').textContent=text;};
 const canSync=()=>getProject()?.ownerUid===account||!!mediaService;
 const cloudNotice=document.createElement('div');
 cloudNotice.className='vs-help';
 cloudNotice.dataset.vsCloudNotice='';
 const cloudMessage=document.createElement('span');
 cloudMessage.setAttribute('role','status');
 const retryCloud=document.createElement('button');
 retryCloud.type='button';
 retryCloud.dataset.vs='cloud-retry';
 retryCloud.textContent='Retry cloud draft';
 retryCloud.hidden=true;
 const downloadCloud=document.createElement('button');
 downloadCloud.type='button';
 downloadCloud.dataset.vs='cloud-download';
 downloadCloud.textContent='Download cloud draft JSON';
 downloadCloud.hidden=true;
 let rejectedCloudDraft=null;
 cloudNotice.append(cloudMessage,' ',retryCloud,' ',downloadCloud);
 header.after(cloudNotice);
 const showCloud=(message,retry=false)=>{if(!disposed){cloudMessage.textContent=message;retryCloud.hidden=!retry;}};
 const draftSignature=()=>JSON.stringify([state.manifest,state.brands]);
 const currentProject=()=>!disposed&&getAccountId()===account&&getProject()?.id===projectId;
 function acceptCloud(draft,manifest){
  state.manifest=manifest;
  state.brands=draft.brands?.length?draft.brands:structuredClone(PRESETS);
  state.cloudRevision=draft.revision;
  state.savedManifest=structuredClone(manifest);
  state.cleanSignature=draftSignature();
  state.cloudReady=true;
  invalidate();
  showCloud('Cloud draft · revision '+draft.revision);
 }
 async function fetchCloudDraft(){
  rejectedCloudDraft=null;
  downloadCloud.hidden=true;
  const draft=await media.loadDraft(projectId);
  if(!draft||!currentProject())return null;
  let manifest;
  try{manifest=validateManifest(draft.manifest,{mapAssets:mapAssets()});}
  catch(error){
   rejectedCloudDraft=draft;
   downloadCloud.hidden=false;
   throw Error('Cloud revision '+draft.revision+' could not be opened: '+error.message);
  }
  return {draft,manifest};
 }
 async function refreshCloudDraft(){
  if(!canSync())return;
  state.cloudReady=false;
  showCloud('Checking cloud draft…');
  try{
   const cloud=await fetchCloudDraft();
   if(!currentProject())return;
   const dirty=state.cleanSignature!==draftSignature()||assembly?.pending||assembly?.focused;
   if(!cloud){
    if(state.cloudRevision>0)throw Error('The previously saved cloud draft could not be found.');
    state.cloudReady=true;
    showCloud('No cloud draft saved yet.');
    return;
   }
   if(dirty&&cloud.draft.revision!==state.cloudRevision){
    showCloud('Local edits are open. Cloud revision '+cloud.draft.revision+' is newer. Use Review cloud draft to compare before saving.',true);
    return;
   }
   if(!dirty)acceptCloud(cloud.draft,cloud.manifest);
   else{
    state.cloudReady=true;
    showCloud('Local edits · based on cloud revision '+state.cloudRevision);
   }
  }catch(error){
   const hasLocal=state.cloudRevision>0||state.cleanSignature!==draftSignature()||state.manifest.scenes.length||state.manifest.audio||state.manifest.audioClips?.length;
   showCloud((hasLocal?'Showing local copy. ':'')+'Cloud draft unavailable: '+error.message,true);
  }
 }

 const getFile=async fileId=>{let file=state.files.get(fileId)||await store?.get('file:'+fileId);if(!file&&isCloudFile(fileId)){file=await media.file(fileId);if(disposed||getAccountId()!==account)throw Error('Project closed or account changed.');state.files.set(fileId,file);}return file;};
 function renderLibrary(){const query=$('[data-media-search]').value.trim().toLowerCase();$('[data-media-library]').innerHTML=catalogue.filter(a=>a.name.toLowerCase().includes(query)).map(a=>`<article><strong>${esc(a.name)}</strong><small>${esc(a.kind)}${a.width?' · '+a.width+' × '+a.height:''}${a.duration?' · '+a.duration.toFixed(2)+'s':''}</small><div class="vs-actions"><button data-vs="media-use" data-media-id="${esc(a.id)}">${a.kind==='audio'?'Add voiceover':a.kind==='glb'?'Register 3D model':'Use in video'}</button>${a.kind==='audio'?`<button data-vs="media-music" data-media-id="${esc(a.id)}">Music</button><button data-vs="media-effect" data-media-id="${esc(a.id)}">Sound effect</button>`:''}${['image','video'].includes(a.kind)?`<button data-vs="media-scene" data-media-id="${esc(a.id)}">Add as scene</button>`:''}</div></article>`).join('')||'<p class="vs-help">No matching assets. Add files above.</p>';};
 async function refreshLibrary(){
  const note=$('[data-media-status]');
  note.textContent='Loading your shared library…';
  let timer;
  try{
   const timeout=new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Request timed out.')),15000);});
   const entries=await Promise.race([media.list(),timeout]);
   if(disposed)return;
   catalogue=entries;renderLibrary();
   note.textContent=catalogue.length+' assets in your private cloud library.';
  }catch(error){
   if(!disposed)note.textContent='Shared library unavailable: '+error.message+' Choose Refresh library to retry.';
  }finally{clearTimeout(timer);}
 }
 async function upgraded(){const original=state.manifest.audio&&await getFile(state.manifest.audio.fileId);return upgradeVideo(state.manifest,original?(await decodeVoiceover(original)).duration:0);}
 async function useMedia(a,{scene=false,role='voiceover'}={}){
  if(a.kind==='glb'){
   if(a.size>MAX_MODEL_BYTES)throw Error('Use GLB files up to 8 MB in 3D scenes.');
   const file=await getFile(a.id);
   if(!file||file.size>MAX_MODEL_BYTES)throw Error('Choose an available GLB file up to 8 MB.');
   checkStudioGlb(await file.arrayBuffer());
  }
  const next=await upgraded();if(a.kind==='audio'){next.audioClips.push({id:uid(),fileId:a.id,name:a.name,role,startSeconds:0,trimStart:0,durationSeconds:a.duration,gain:1,fadeIn:0,fadeOut:0});}else {if(!next.assets.some(x=>x.fileId===a.id))next.assets.push({id:a.id,name:a.name,fileId:a.id,...(a.kind==='glb'?{kind:'glb'}:{})});if(scene&&a.kind!=='glb'){const row={id:uid(),name:a.name,startSeconds:0,durationSeconds:a.duration||5,engineType:a.kind,engineData:{assetId:next.assets.find(x=>x.fileId===a.id).id,fit:'contain',...(a.kind==='video'?{trimStart:0}:{})},overlays:[]};Object.assign(next,arrangeScenes(next,[...next.scenes,row],{mapAssets:mapAssets()}));}}await applyManifest(next);if(a.kind==='glb')status('Model registered. Add it from 3D models in a 3D scene.');}
 async function uploadFiles(files,{addScenes=false,role=null}={}){for(const file of files){status('Uploading '+file.name+'…');const info=await inspectMedia(file),a=await media.upload(file,info);if(disposed||getAccountId()!==account)return;state.files.set(a.id,file);await store?.put('file:'+a.id,file);if(!catalogue.some(x=>x.id===a.id))catalogue.unshift(a);renderLibrary();if(a.kind!=='glb')await useMedia(a,{scene:addScenes&&['image','video'].includes(a.kind),role:role||'voiceover'});}status('Files saved to your cloud library. Save your video draft after making changes.');$('[data-media-status]').textContent=catalogue.length+' assets in your private cloud library.';}

 const assetStep=setup.querySelector('.vs-step:not([data-ai-production]):not([data-flow-json])'),uploadPanel=document.createElement('div'),assetTabs=document.createElement('div'),imageRoot=document.createElement('section');
 uploadPanel.id='vs-assets-upload';uploadPanel.role='tabpanel';uploadPanel.setAttribute('aria-labelledby','vs-assets-tab-upload');
 for(const child of [...assetStep.children])if(child.tagName!=='H3')uploadPanel.append(child);
 assetTabs.className='vs-asset-tabs';assetTabs.role='tablist';assetTabs.setAttribute('aria-label','Asset tools');
 assetTabs.innerHTML='<button type="button" role="tab" id="vs-assets-tab-upload" aria-controls="vs-assets-upload" data-asset-tool="upload">Upload & voiceover</button><button type="button" role="tab" id="vs-assets-tab-images" aria-controls="vs-assets-images" data-asset-tool="images">Create image</button>';
 imageRoot.id='vs-assets-images';imageRoot.role='tabpanel';imageRoot.setAttribute('aria-labelledby','vs-assets-tab-images');
 assetStep.append(assetTabs,uploadPanel,imageRoot);
 const selectAssetTool=value=>{state.assetTool=value;uploadPanel.hidden=value!=='upload';imageRoot.hidden=value!=='images';for(const button of assetTabs.querySelectorAll('button')){const selected=button.dataset.assetTool===value;button.setAttribute('aria-selected',String(selected));button.tabIndex=selected?0:-1;}};
 assetTabs.onclick=event=>{const button=event.target.closest('[data-asset-tool]');if(button)selectAssetTool(button.dataset.assetTool);};
 assetTabs.onkeydown=event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const value=event.key==='Home'?'upload':event.key==='End'?'images':state.assetTool==='upload'?'images':'upload';selectAssetTool(value);assetTabs.querySelector(`[data-asset-tool="${value}"]`).focus();};
 selectAssetTool(state.assetTool==='images'?'images':'upload');
 const images=mountConnectedImageGenerator(imageRoot,{getAccountId,callRelay:callImageRelay,draftPrompt:draftRemoteImagePrompt,getProjectId:()=>getProject()?.id,onReveal:()=>selectAssetTool('images'),onAttach:async file=>{if(disposed||getAccountId()!==account||getProject()?.id!==projectId||getProject()?.ownerUid!==account)throw Error('Only the current project owner can attach generated artwork.');await uploadFiles([file]);}});

 const brand=()=>state.brands.find(b=>b.id===state.manifest.brandPresetId)||state.brands[0];
 function stop(){playing=false;cancelAnimationFrame(raf);stopTracks?.();stopTracks=null;if(source){try{source.stop();}catch{}source.disconnect();source=null;}gainNode?.disconnect();gainNode=null;}
 function invalidate(){stop();renderer?.destroy();renderer=null;audioBuffer=null;audioTracks=[];pending=null;$('[data-vs=apply]').disabled=true;}
 function sync(){
  const m=state.manifest;$('[data-vs-title]').value=m.title;$('[data-vs-ratio]').value=m.aspectRatio;
  $('[data-vs-brand]').innerHTML=state.brands.map(b=>`<option value="${esc(b.id)}">${esc(b.name)}</option>`).join('');$('[data-vs-brand]').value=brand().id;
  $('[data-vs-intro]').checked=!!m.introEnabled;$('[data-vs-outro]').checked=!!m.outroEnabled;
  $('[data-vs-brand-json]').value=JSON.stringify(brand(),null,2);
  $('[data-vs-audio-name]').textContent=m.audio?.name||(m.audioClips?.length?m.audioClips.length+' recordings in the Audio timeline':'No voiceover selected');$('[data-vs-audio-start]').value=m.audio?.startSeconds??m.audioClips?.find(a=>a.role==='voiceover')?.startSeconds??0;$('[data-vs-gain]').value=m.audio?.gain??m.audioClips?.find(a=>a.role==='voiceover')?.gain??1;
  $('[data-vs-assets]').innerHTML=m.assets.map(a=>`<div>${esc(a.name)} · <code>${esc(a.id)}</code></div>`).join('');
  $('[data-vs-library]').innerHTML='<option value="">Choose existing map image</option>'+mapAssets().filter(a=>a.type==='image').map(a=>`<option value="${esc(a.id)}">${esc(a.name)}</option>`).join('');
  assembly?.sync();
  styleGallery?.sync();
 }
 async function loadPreviewAudio(manifest) {
  const unavailable = [];
  audioBuffer = null;
  if (manifest.audio) {
   try {
    const file = await getFile(manifest.audio.fileId);
    if (!file) throw Error('Original MP3 is missing.');
    audioBuffer = await decodeVoiceover(file);
   } catch (error) {
    if (error.name === 'AbortError') throw error;
    unavailable.push(manifest.audio.name);
   }
  }
  audioTracks = await loadAudioTracks(manifest, getFile, {
   onUnavailable: clip => unavailable.push(clip.name)
  });
  audioWarning.hidden = unavailable.length === 0;
  audioWarning.textContent = unavailable.length
   ? 'Audio clip unavailable — re-link or regenerate in Step 1. Playback and exports mute: ' + [...new Set(unavailable)].join(', ')
   : '';
 }
 async function registerVoiceover(file) {
  const metadata = await inspectMedia(file);
  const asset = await media.upload(file, metadata);
  if (asset.id !== metadata.id) throw Error('The cloud library returned a different recording ID.');
  // Check the same private read path another device uses before saving the reference.
  await media.file(asset.id);
  if (disposed || getAccountId() !== account || getProject()?.id !== projectId) throw new DOMException('Project closed or account changed.', 'AbortError');
  state.files.set(asset.id, file);
  if (!catalogue.some(item => item.id === asset.id)) { catalogue.unshift(asset); renderLibrary(); }
  return asset.id;
 }
 async function prepare(){
  if(renderer)return;if(preparing)return preparing;
  preparing=(async()=>{
   const m=validateManifest(state.manifest,{mapAssets:mapAssets()}),b=validateBrand(brand(),new Set(m.assets.filter(a=>a.kind!=='glb').map(a=>a.id)));
   await loadPreviewAudio(m);
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
  const task=(async()=>{await prepare();if(disposed||!renderer)return;await renderer.draw(time);assembly?.highlight();state.time=time;$('[data-vs-seek]').value=time;$('[data-vs-time]').textContent=`${time.toFixed(2)} / ${timeline.duration.toFixed(2)}s`;})();drawing=task;try{await task;}finally{if(drawing===task)drawing=null;}
 }
 async function applyManifest(next,{brands:nextBrands=null}={}){
  next=validateManifest(next,{mapAssets:mapAssets()});
  stop();renderer?.destroy();renderer=null;audioBuffer=null;audioTracks=[];
  state.manifest=next;if(nextBrands)state.brands=nextBrands;
  pending=null;$('[data-vs=apply]').disabled=true;sync();
  try{await draw();state.previewError=null;}catch(error){state.previewError=error.message;status('Draft retained. Preview unavailable: '+error.message);}
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
 async function save(manifest=state.manifest,{preview=true,applying=false}={}){
  if(assembly?.pending&&!applying)throw Error('Apply or discard the pending scene change before saving.');
  if(!store||!projectId)throw Error('Save and open the Creator project before saving its local video draft.');
  if(disposed||!account||getAccountId()!==account||getProject()?.id!==projectId)throw Error('Project closed or account changed.');
  const cloud=canSync();
  if(cloud&&!state.cloudReady)throw Error('Check the cloud draft before saving. Your current edits are still open.');
  const next=validateManifest(manifest,{mapAssets:mapAssets()});
  if(cloud){const refs=[...next.assets,...(next.audioClips||[]),...(next.audio?[next.audio]:[])],converted=new Map();for(const ref of refs){if(!ref.fileId||isCloudFile(ref.fileId))continue;const old=ref.fileId;if(!converted.has(old)){const file=await getFile(old);if(!file)throw Error('Missing original: '+ref.name);const named=new File([file],ref.name,{type:file.type});const a=await media.upload(named,await inspectMedia(named));converted.set(old,a.id);state.files.set(a.id,file);}ref.fileId=converted.get(old);}}
  const assets=new Set([...state.brandAssets,...next.assets].filter(a=>a.kind!=='glb').map(a=>a.id));state.brands.forEach(b=>validateBrand(b,assets));
  // Preserve byte-identical originals. A failed quota write never updates the draft pointer.
  for(const [id,file] of state.files)await store.put('file:'+id,file);
  state.brandAssets=[...new Map([...state.brandAssets,...next.assets].map(a=>[a.id,a])).values()];await store.put('brands',{brands:state.brands,assets:state.brandAssets});

  if(disposed||getAccountId()!==account||getProject()?.id!==projectId)throw Error('Project closed or account changed.');
  if(cloud){const result=await media.saveDraft(projectId,next,state.brands,state.cloudRevision);state.cloudRevision=result.revision;state.savedManifest=structuredClone(next);showCloud('Cloud draft · revision '+state.cloudRevision);await store.put('cloudRevision:'+projectId,state.cloudRevision);status('Saved to your account. Your video and cloud assets are available on your other devices.');}else status('Local video draft saved. Cloud draft sync is available to the project owner.');
  const version=uid();await store.put('version:'+projectId+':'+version,next);await store.put('draft:'+projectId,version);
  state.manifest=next;state.cleanSignature=draftSignature();if(preview)await applyManifest(next);
  return cloud;
 }
 function aiVoiceRequest(script,voices){
  const {saved,engine,language,selected}=selectProductionVoice(voices,account);
  if(!selected)throw Error('No supported Google voice is available. Refresh Google Voiceover under Production readiness.');
 const languageCode=selected.languageCodes.includes(language)?language:selected.languageCodes[0];
  const number=(value,defaultValue)=>Number.isFinite(Number(value))?Number(value):defaultValue;
  return {title:String(getProject()?.title||'Invincible AI video').slice(0,200),text:script,mode:'text',engine,voiceName:selected.name,languageCode,speed:number(saved.speed,1),pitch:number(saved.pitch,0),volume:number(saved.volume,0),paragraphPause:number(saved.pause,0),...(engine==='gemini'?{modelName:['gemini-2.5-flash-tts','gemini-2.5-pro-tts'].includes(saved.model)?saved.model:'gemini-2.5-flash-tts',delivery:['natural','sales','social','empathetic','calm','energetic','dramatic'].includes(saved.preset)?saved.preset:'natural',direction:String(saved.direction||'').slice(0,2000)}:{})};
 }
 async function analyzeAiVoiceover({title,creativeInstructions,audio}){
  const bytes=new Uint8Array(await audio.arrayBuffer());let binary='';for(let offset=0;offset<bytes.length;offset+=0x8000)binary+=String.fromCharCode(...bytes.subarray(offset,offset+0x8000));
  return localWorker.request('/api/voiceover/analyze',{title,creativeInstructions,audioBase64:btoa(binary),production:true},{timeoutMs:180000});
 }
 async function createAiVideo(){
  await ready;
  if(state.manifest.scenes.length||(state.manifest.audioClips||[]).length||state.manifest.audio)throw Error('This Video Studio draft already has content. Open a fresh Creator video project before generating another video.');
  if(!account||!projectId)throw Error('Sign in and open a saved Creator project first.');
  const script=$('[data-ai-script]').value.trim(),creativeInstructions=$('[data-ai-instructions]').value.trim();if(!script)throw Error('Add a voiceover script before generating.');
  const {services,voices}=await readiness.check();
  const blockers=Object.values(services).filter(service=>!service.ready);
  if(blockers.length)throw Error(blockers.map(service=>service.detail).join('. ')+'. Narration generation has not started.');
  const voiceRequest=aiVoiceRequest(script,voices),title=String(getProject()?.title||voiceRequest.title);
  const result=await runAiProduction({uid:account,projectId,title,script,creativeInstructions,voiceRequest,loadCheckpoint:async()=>loadPendingAiDraft({accountId:account,projectId}),loadAudio:loadPendingAiAudio,saveCheckpoint:savePendingAiDraft,generateVoiceover,analyzeVoiceover:analyzeAiVoiceover,importProduction:importAiProduction,saveVideo:save,exportVideo:renderExport,onProgress:event=>{$('[data-ai-status]').textContent=event.message;status(event.message);}});
  if(result.status==='blocked'){
   const details=result.missingInfo.length?result.missingInfo.join(' '):'The scene plan has no executable Map Editor animation.';
   const message='Narration and scene JSON are saved, but no video was exported. '+details;
   $('[data-ai-status]').textContent=message;status(message);return result;
  }
  const scenes=result.payload.creatorStudio.scenes;
  const locatorCount=scenes.filter(scene=>scene.contextSources?.length).length;
  const cardCount=scenes.filter(scene=>scene.contextCard===true).length;
  const contextNote=locatorCount||cardCount?` Used ${locatorCount} locator scene(s) and ${cardCount} context card(s) where detailed map geometry was unavailable.`:'';
  $('[data-ai-status]').textContent='MP4 exported. The editable scene plan and original narration are saved in this project.'+contextNote;
  return result;
 }
 function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 function lock(value){busy=value;root.querySelectorAll('button,input,textarea,select').forEach(n=>{if(!imageRoot.contains(n))n.disabled=value;});imageRoot.inert=value;$('[data-vs=cancel]').disabled=!value||!controller;$('[data-vs=apply]').disabled=value||!pending;}
 function clearImportReview(){
  pendingCloud=null;pending=null;
  $('[data-vs=apply]').disabled=true;
  $('[data-vs-review]').textContent='';
 }
 const run=async fn=>{if(busy||disposed)return;lock(true);stop();try{if(drawing)await drawing.catch(()=>{});await fn();}catch(e){if(!disposed)sync();status(e.name==='AbortError'?'Export cancelled.':e.message);}finally{if(!disposed)lock(false);}};
 async function renderExport(){
  stop();controller=new AbortController();$('[data-vs=cancel]').disabled=false;root.dataset.exporting='true';let codec=null;try{await prepare();if(!placeholderConsent.checked&&(!audioWarning.hidden||renderer.missingAssets.length))throw Error('Resolve unavailable media or enable Allow placeholders before exporting.');status('Rendering MP4…');const blob=await encodeStudioVideo({canvas,timeline,audioBuffer,audioTracks,audioGain:state.manifest.audio?.gain??1,signal:controller.signal,onAudioCodec:value=>{codec=value;status(`Rendering H.264 + ${value.toUpperCase()} audio…`);},onProgress:p=>{if(!disposed)$('[data-vs-progress]').value=p.progress;},drawFrame:(t,signal)=>renderer.draw(t,{exporting:true,allowPlaceholders:placeholderConsent.checked,signal})});if(!disposed){const name=(state.manifest.title||'video').replace(/[^\p{L}\p{N}_-]/gu,'_')+'.mp4';if(lastExportUrl)URL.revokeObjectURL(lastExportUrl);lastExportBlob=blob;lastExportName=name;lastExportUrl=URL.createObjectURL(blob);lastExport.href=lastExportUrl;lastExport.download=name;lastExport.hidden=false;saveLastExport.hidden=false;cloudExport.hidden=true;download(blob,name);status(audioBuffer||audioTracks.length?`MP4 exported with synchronized ${codec.toUpperCase()} voiceover and audio. Download it now or save it to your private library.${codec==='opus'?' Opus MP4 needs a compatible player.':''}`:(audioWarning.hidden?'MP4 exported without audio.':'MP4 exported with unavailable audio muted.')+' Download it now or save it to your private library.');}return blob;}finally{if(controller?.signal.aborted)invalidate();controller=null;$('[data-vs=cancel]').disabled=true;root.dataset.exporting='false';if(!disposed)await draw();}
 }
 async function renderJpgPreviews(){
  stop();await prepare();if(!renderer||!timeline?.scenes?.length)throw Error('Add or apply a video scene before generating previews.');
  const results=[];status('Rendering JPG previews…');
  for(const scene of timeline.scenes){await renderer.draw(scene.startSeconds,{exporting:true});const blob=await new Promise((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(Error('Canvas could not be exported as JPG.')),'image/jpeg',.92));const name=(state.manifest.title||'invincible').replace(/[^\p{L}\p{N}_-]/gu,'_')+'-scene-'+String(results.length+1).padStart(2,'0')+'.jpg';download(blob,name);results.push({sceneId:scene.id,name,durationSeconds:scene.durationSeconds});}
  status(`${results.length} JPG previews exported. Each file was captured from the existing renderer.`);return results;
 }
 async function renderSelectedJpg(){
  stop();await prepare();if(!renderer||!timeline?.scenes?.length)throw Error('Add or apply a video scene before generating a preview.');
  const selectedId=state.selected||timeline.scenes[0].id,scene=timeline.scenes.find(item=>item.id===selectedId)||timeline.scenes[0];
  const rawText=String(jpgOffset.value||'').trim(),rawOffset=rawText===''?NaN:Number(rawText),offset=Number.isFinite(rawOffset)?Math.max(0,Math.min(scene.durationSeconds,rawOffset)):scene.durationSeconds/2,captureAt=scene.startSeconds+offset;
  await renderer.draw(captureAt,{exporting:true});
  const blob=await new Promise((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(Error('Canvas could not be exported as JPG.')),'image/jpeg',.92));
  const index=timeline.scenes.findIndex(item=>item.id===scene.id)+1;
  const name=(state.manifest.title||'invincible').replace(/[^\p{L}\p{N}_-]/gu,'_')+'-scene-'+String(index).padStart(2,'0')+'-t-'+offset.toFixed(2)+'s.jpg';
  download(blob,name);status(`Scene ${index} JPG preview exported at ${offset.toFixed(2)}s.`);return {sceneId:scene.id,name,offsetSeconds:offset};
 }
 root.addEventListener('click',event=>{
  if(event.target.closest('[data-assembly]'))return;
  const at=event.target.closest('[data-vs-at]');if(at&&!busy){stop();time=Number(at.dataset.vsAt);assembly?.select(at.dataset.vsSceneId);run(draw);return;}
  const button=event.target.closest('[data-vs]');if(!button)return;const action=button.dataset.vs;
  if(action==='cancel'){controller?.abort(new DOMException('Export cancelled','AbortError'));return;}
  run(async()=>{
   if(action==='save')await save();
   if(action==='cloud-retry'){await refreshCloudDraft();if(currentProject()){sync();await draw();}}
   if(action==='cloud-download'&&rejectedCloudDraft&&currentProject()){
    const {manifest,revision}=rejectedCloudDraft;
    download(new Blob([JSON.stringify(manifest,null,2)],{type:'application/json'}),'cloud-video-revision-'+revision+'.json');
   }
   if(action==='save-last-export'){
    if(!(lastExportBlob instanceof Blob)||!lastExportBlob.size)throw Error('Export the MP4 before saving it to your library.');
    status('Saving the MP4 to your private library…');const file=new File([lastExportBlob],lastExportName||'creator-export.mp4',{type:'video/mp4'}),info=await inspectMedia(file),asset=await media.upload(file,info),url=await media.read(asset.id);cloudExport.href=url;cloudExport.download=file.name;cloudExport.hidden=false;status('MP4 saved to your private library. Download saved MP4 remains available from this page.');
   }
   if(action==='generate-ai'){
    $('[data-ai-status]').textContent='Checking the laptop connection…';
    try{await createAiVideo();}
    catch(error){if(!disposed)$('[data-ai-status]').textContent=error.message;throw error;}
   }
   if(action==='download')download(new Blob([JSON.stringify(state.manifest,null,2)],{type:'application/json'}),'video-studio.json');
   if(action==='jpg-scene')await renderSelectedJpg();
   if(action==='view-json'){
    clearImportReview();
    jsonPanel.open=true;
    $('[data-vs-json]').value=JSON.stringify(state.manifest,null,2);
    status('Current draft loaded into the JSON editor. Review any edits before applying.');
   }
   if(action==='library-refresh')await refreshLibrary();
   if(action==='view-brief'||action==='copy-brief'){const text=studioBrief(await upgraded(),catalogue)+'\n\nAgent API: window.invincibleAgent offers getProjectJSON, validateJSON, applyPatch and getSceneSummary. Pass expectedRevision from the read response. Single-scene JSON: {patchSceneId, expectedRevision, changes}. Objects merge; arrays of IDs merge by ID; empty arrays preserve content. To replace an array explicitly, use {$replace: [...]}. Read the scene before editing. Full manifests replace the video after review.';$('[data-vs-brief]').value=text;if(action==='view-brief')return;await navigator.clipboard.writeText(text);status('Complete-video brief copied, including asset IDs and current JSON. Add your script and exact voiceover cues.');}
   if(action==='cloud-review'){
    clearImportReview();
    const cloud=await fetchCloudDraft();
    if(!cloud)throw Error('No cloud draft has been saved for this video yet.');
    pending=cloud.manifest;pendingCloud=cloud.draft;
    $('[data-vs-review]').textContent='Cloud revision '+pendingCloud.revision+' · '+pending.scenes.length+' scenes. Applying opens this version and replaces current local edits. Download JSON first to keep a copy.';
    status('Cloud draft ready for review.');
   }
   if(action.startsWith('media-')){const a=catalogue.find(x=>x.id===button.dataset.mediaId);if(!a)throw Error('Choose an asset from your library.');await useMedia(a,{scene:action==='media-scene',role:action==='media-music'?'music':action==='media-effect'?'effect':'voiceover'});}
   if(action==='scene-summary'){clearImportReview();const result=await agent.getSceneSummary();summaryBox.hidden=false;summaryBox.value=JSON.stringify(result,null,2);}
   if(action==='validate'){pendingCloud=null;pending=null;
    const result=await agent.validateJSON($('[data-vs-json]').value);if(!result.ok)throw Error(result.errors.map(e=>e.message).join('\n'));
    pending={...result.manifest,expectedRevision:result.revision};
    $('[data-vs-review]').textContent=`${result.scenes.length} scenes · saves to this project's cloud video. Review before replacing the current video.`;status('Import reviewed. Apply when ready.');
   }
   if(action==='apply'&&pending){const next=pending,cloud=pendingCloud;
    if(cloud){acceptCloud(cloud,next);pendingCloud=null;sync();await draw();}
    else{const result=await agent.applyPatch(next);if(!result.ok)throw Error(result.errors.map(e=>e.message).join('\n'));status('Saved to your account. '+(state.previewError?'Preview unavailable: '+state.previewError:'Scenes are ready for review and export.'));}
   }
   if(action==='example'){
    const next=emptyVideo();next.title='My first video';next.assets=state.manifest.assets.filter(a=>a.kind!=='glb');next.scenes=[{id:'explain',startSeconds:0,durationSeconds:5,engineType:'graphic',engineData:{},transition:{type:'fade',durationSeconds:.3},overlays:[{id:'heading',type:'text',text:'Your next story',fontSize:72,keyframes:[{timeSeconds:0,y:.65,opacity:0,easing:'smooth'},{timeSeconds:1,y:.5,opacity:1}]}]}];await applyManifest(next);$('[data-vs-json]').value=JSON.stringify(next,null,2);status('Example loaded in the video draft.');
   }
   if(action==='brand-apply'){
    const b=validateBrand(JSON.parse($('[data-vs-brand-json]').value),new Set(state.manifest.assets.filter(a=>a.kind!=='glb').map(a=>a.id)));
    const nextBrands=structuredClone(state.brands),i=nextBrands.findIndex(x=>x.id===b.id);
    if(i<0){if(nextBrands.length>=20)throw Error('Use up to 20 profiles.');nextBrands.push(b);}else nextBrands[i]=b;
    const nextManifest={...structuredClone(state.manifest),brandPresetId:b.id};
    await applyManifest(nextManifest,{brands:nextBrands});status('Brand profile applied. Save to reuse it on this device.');
   }
   if(action==='brand-templates'){invalidate();brand().intro=template('intro',brand().name);brand().outro=template('outro','Thank you');sync();status('Title templates added. Enable intro/outro to apply them.');}
   if(action==='reuse'){const a=mapAssets().find(a=>a.id===$('[data-vs-library]').value);if(!a)throw Error('Choose a map image first.');invalidate();if(!state.manifest.assets.some(x=>x.libraryId===a.id))state.manifest.assets.push({id:uid(),name:a.name,libraryId:a.id});sync();}
   if(action==='remove-audio'){const next=structuredClone(state.manifest);next.audio=null;if(next.audioClips)next.audioClips=next.audioClips.filter(a=>a.role!=='voiceover');await applyManifest(next);}
   if(action==='play')await play();if(action==='pause'){stop();await draw();}
   if(action==='export')await renderExport();if(action==='jpg-previews')await renderJpgPreviews();
  });
 });
 root.addEventListener('input',event=>{
  if(event.target.matches('[data-media-search]'))renderLibrary();
  if(event.target.matches('[data-vs-json]'))clearImportReview();
  if(event.target.matches('[data-vs-seek]')&&!busy){stop();time=Number(event.target.value);if(!drawBusy){drawBusy=true;draw().catch(e=>status(e.message)).finally(()=>drawBusy=false);}}
 });
 root.addEventListener('change',event=>{
  if(event.target.closest('[data-assembly]'))return;
  const target=event.target;if(target.matches('[data-vs-seek]'))return;
  run(async()=>{
   if(target.matches('[data-media-upload]')){await uploadFiles([...target.files]);target.value='';return;}
   if(target.matches('[data-vs-json-file]')){const file=target.files[0];if(file){if(file.size>1000000)throw Error('Use JSON under 1 MB.');$('[data-vs-json]').value=await file.text();clearImportReview();status('File loaded. Review it before applying.');}return;}
   if(target.matches('[data-vs-images],[data-vs-audio]')){await uploadFiles([...target.files]);target.value='';return;}
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
   else if(target.matches('[data-vs-audio-start],[data-vs-gain]')){const recording=next.audio||next.audioClips?.find(a=>a.role==='voiceover');if(!recording)throw Error('Upload voiceover first.');recording.startSeconds=Number($('[data-vs-audio-start]').value);recording.gain=Number($('[data-vs-gain]').value);}
   else return;
   validateManifest(next,{mapAssets:mapAssets()});await applyManifest(next);
  });
 });
 assembly=mountAssembly(assemblyRoot,{pause:stop,session:state,getManifest:()=>state.manifest,getProject,getFile,importFiles:uploadFiles,putFile:(id,file)=>state.files.set(id,file),deleteFile:id=>state.files.delete(id),run,status,getTime:()=>time,setTime:value=>{time=value;state.time=value;},releaseRenderer:async()=>{stop();if(drawing)await drawing.catch(()=>{});invalidate();},setManifest:applyManifest,saveMapDraft:next=>save(next,{preview:false,applying:true}),previewManifest:async next=>{if(next===state.manifest){invalidate();await draw();return;}invalidate();try{const b=brand(),t=compileTimeline(next,b);await loadPreviewAudio(next);const lead=t.audioClips[0]&&next.audioClips?.[0]?t.audioClips[0].startSeconds-next.audioClips[0].startSeconds:0;audioTracks=audioTracks.map(a=>({...a,startSeconds:a.startSeconds+lead}));const nextRenderer=await createStudioRenderer(canvas,next,t,b,{getFile,mapAssets:mapAssets(),signal:lifecycle.signal});if(disposed){nextRenderer.destroy();return;}renderer=nextRenderer;timeline=t;await renderer.draw(time);}catch(error){invalidate();try{await draw();}catch{}throw error;}}});
 styleGallery=mountStyleGallery(styleRoot,{getManifest:()=>state.manifest,getSelectedSceneId:()=>assembly?.selectedId||'',applyManifest,saveManifest:next=>save(next),status});
 const libraryReady = refreshLibrary();
 const ready=run(async()=>{
  if(!state.loaded){
   try{
    if(store){
     const library=await store.get('brands');
     if(library){state.brands=library.brands;state.brandAssets=library.assets;}
     if(projectId){
      const version=await store.get('draft:'+projectId);
      if(version){
       const saved=await store.get('version:'+projectId+':'+version);
       if(saved)state.manifest=validateManifest(saved,{mapAssets:mapAssets()});
       state.cloudRevision=await store.get('cloudRevision:'+projectId)||0;
      }
     }
    }
    state.manifest.assets=assetsForBrand(brand(),state.manifest.assets,state.brandAssets);
   }catch(error){status('Local draft unavailable: '+error.message);}
   if(!currentProject())return;
   state.cleanSignature=draftSignature();
   state.loaded=true;
  }
  await refreshCloudDraft();
  if(!currentProject())return;
  sync();try{await draw();}catch(error){status('Preview unavailable: '+error.message);}
 });
 stopBrowserSceneJpgBridge=startBrowserSceneJpgBridge({account,projectId,ready,getManifest:()=>state.manifest,capture:async(sceneId,offset)=>{await prepare();const scene=timeline.scenes.find(item=>item.id===sceneId);if(!scene)throw Error('Scene is not in the current timeline.');await renderer.draw(scene.startSeconds+offset,{exporting:true});return new Promise((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(Error('Canvas could not be exported as JPG.')),'image/jpeg',.92));},upload:async(file)=>({asset:await media.upload(file,await inspectMedia(file)),read:id=>media.read(id)}),status});
 async function importAiProduction(storyboard, audioBlob, {title='Invincible AI production', allowContextCards=false, replaceExisting=false}={}){
  await ready;
  const hasDraft = state.manifest.scenes.length || state.manifest.audioClips?.length || state.manifest.audio;
  if (hasDraft && !replaceExisting) throw Error('Motion Studio already contains a different draft. Choose Replace when applying the reviewed sync plan, or keep the existing draft.');
  if (!Array.isArray(storyboard) || !storyboard.length) throw Error('The AI draft has no executable scenes.');
  if (!(audioBlob instanceof Blob) || !audioBlob.size) throw Error('The original voiceover MP3 is missing. Run AI timing again to attach it.');
  const file = new File([audioBlob], audioBlob.name || 'invincible-voiceover.mp3', {type: audioBlob.type || 'audio/mpeg'});
  const decoded = await decodeVoiceover(file);
  const registration = await registerVoiceover(file);
  const next = compileAiStoryboardManifest(storyboard, {
   aspectRatio: '9:16', audioFileId: registration, audioName: file.name,
   audioDuration: decoded.duration, mapAssets: mapAssets(), allowContextCards
  });
  next.title = String(title).slice(0, 200);
  time = 0;
  await save(next);
  status(`${next.scenes.length} scenes and the exact MP3 are saved to your account. Next: Play the full preview, then Export MP4.`);
  return next;
 }
 const agent=createAgentOperations({
  authorize:async()=>{await ready;if(disposed||!account||getAccountId()!==account||getProject()?.id!==projectId||(getProject()?.ownerUid!==account&&!mediaService))throw Object.assign(Error('Sign in as the project owner to use the agent API.'),{code:'UNAUTHORIZED'});},
  getManifest:()=>state.manifest,getSavedManifest:()=>state.savedManifest||state.manifest,getRevision:()=>state.cloudRevision,getMapAssets:mapAssets,getAvailableAssets:()=>catalogue.map(({id,name,kind,mimeType,duration,width,height})=>({id,name,kind,mimeType,duration,width,height})),
  read:()=>libraryReady,
  isBlocked:()=>assembly.focused||assembly.pending,
  checkResources:async manifest=>{
   const profile=state.brands.find(b=>b.id===manifest.brandPresetId);if(!profile)throw Error('Choose or create the referenced brand profile first.');validateBrand(profile,new Set(manifest.assets.filter(a=>a.kind!=='glb').map(a=>a.id)));
   const checked=new Set();
   const checkUrl=async asset=>{if(!asset.url||checked.has(asset.url))return;checked.add(asset.url);let response;try{response=await fetch(asset.url,{signal:AbortSignal.timeout(15000)});}catch(error){throw Error('Cannot retrieve asset '+asset.name+': '+error.message);}if(!response.ok)throw Error('Missing asset '+asset.name+' (HTTP '+response.status+'): '+asset.url);};
   for(const asset of manifest.assets)await checkUrl(asset);
   const previousAudio = new Set([...(state.manifest.audioClips || []), ...(state.manifest.audio ? [state.manifest.audio] : [])].map(clip => clip.fileId));
   const audio = [...(manifest.audioClips || []), ...(manifest.audio ? [manifest.audio] : [])];
   for (const clip of audio) if (!previousAudio.has(clip.fileId) && !await getFile(clip.fileId)) throw Error('Missing original recording: ' + clip.name);
   const refs=manifest.assets;
   for(const ref of refs)if(ref.fileId){if(isCloudFile(ref.fileId))await media.read(ref.fileId);else if(!await getFile(ref.fileId))throw Error('Missing original asset: '+ref.name+' ('+ref.fileId+')');}
   const projects=[...(manifest.mapSources||[]).map(s=>s.project),...manifest.scenes.map(s=>s.engineData.project).filter(Boolean)];
   for(const project of projects)for(const asset of project.historicalMap.visual?.assets||[]){if(asset.cloudAssetId)await media.read(asset.cloudAssetId);await checkUrl(asset);}
  },save:async next=>{await save(next);}
 });
 const exposedAgent={...agent,applyPatch:async payload=>{
  if(busy||disposed)return {ok:false,errors:[{code:'BUSY',message:'Wait for the current editor operation to finish.'}]};
  lock(true);try{return await agent.applyPatch(payload);}finally{if(!disposed)lock(false);}
 }};
 window.invincibleAgent=exposedAgent;
 const hidden=()=>{if(document.hidden)stop();};document.addEventListener('visibilitychange',hidden);
 async function reviewGeneratedMaps(){await ready;return assembly?.startMapReview()||false;}
 async function saveFocusedMap(){
  if(busy||disposed)throw Error('Wait for the current operation to finish, then save again.');
  const next=assembly.focusedMapDraft();
  if(!next)return null;
  lock(true);
  try{return {cloud:await save(next,{preview:false})};}
  finally{if(!disposed)lock(false);}
 }
 return {ready,save:async()=>{if(busy||disposed)throw Error('Wait for the current editor operation to finish.');lock(true);try{return await save();}finally{if(!disposed)lock(false);}},get manifest(){return state.manifest;},get mapFocused(){return assembly.mapFocused;},saveFocusedMap,importAiProduction,reviewGeneratedMaps,destroy(){if(window.invincibleAgent===exposedAgent)delete window.invincibleAgent;stopBrowserSceneJpgBridge();images.destroy();disposed=true;state.time=time;styleGallery?.destroy();assembly?.destroy();stop();lifecycle.abort(new DOMException('Workspace closed','AbortError'));controller?.abort(new DOMException('Workspace closed','AbortError'));renderer?.destroy();context?.close();if(lastExportUrl)URL.revokeObjectURL(lastExportUrl);store?.close();document.removeEventListener('visibilitychange',hidden);}};
}
