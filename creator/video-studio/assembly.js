import {BUILTIN_MODELS, CAMERA_FIELDS, MODEL_FIELDS, MAX_MODELS, modelMotion, trainStage} from './three-scene.js';
import {DEFAULT_PARALLAX,trainTemplate} from './parallax.js';
import {mountObjectEditor} from './object-editor.js?v=2026111207';
import {createDefaultMap} from '../map-defaults.js?v=2026110903';
import {appendProjectMaps,arrangeScenes,upgradeVideo,resizeScene} from './composition.js?v=2026111207';
import {emptyBattlefield} from './battlefield.js?v=2026111014';
import {decodeVoiceover} from './audio.js?v=2026111014';
import {validateManifest} from './model.js?v=2026111207';
import {mapDraft} from './adapters.js?v=2026111207';
import {mountMapEditor} from '../map-editor.js?v=2026111203';
import {safeRelativeAssetPath} from '../map-editor-model.js?v=2026111002';
import {mountBattlefieldEditor} from './battlefield-editor.js?v=2026111014';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const number=(name,key,value,min=0,max=600,step=.1)=>`<label>${name}<input type="number" data-assembly-prop="${key}" value="${value}" min="${min}" max="${max}" step="${step}"></label>`;
function stageControls(stage,assets,modelId){
 const selected=stage.models.find(model=>model.id===modelId)??stage.models[0];
 const models=assets.filter(asset=>asset.kind==='glb');
 const name=model=>model.preset??models.find(asset=>asset.id===model.assetId)?.name??'GLB model';
 const fields=(prefix,keys,pose)=>Object.entries(keys).map(([key,[min,max]])=>
  number(({yaw:'Turn (°)',tilt:'Tilt (°)',zoom:'Zoom',x:'Left / right',z:'Near / far',y:'Height',scale:'Scale'})[key],prefix+'.'+key,pose[key],min,max,.01)).join('');
 const poses=(prefix,keys,motion)=>['from','to'].map(end=>
  `<fieldset><legend>${end==='from'?'Start':'End'}</legend><div class="vs-grid">${fields(prefix+'.'+end,keys,motion[end])}</div></fieldset>`).join('');
 return `<details><summary>3D camera</summary>${poses('stage.camera',CAMERA_FIELDS,stage.camera)}</details>
  <details><summary>3D models</summary>
   <div class="vs-actions"><label>Model<select data-stage-source>
    ${BUILTIN_MODELS.map(p=>`<option value="preset:${p}">${p}</option>`).join('')}
    ${models.map(a=>`<option value="asset:${esc(a.id)}">${esc(a.name)}</option>`).join('')}
   </select></label><button data-compose="stage-add" ${stage.models.length>=MAX_MODELS?'disabled':''}>Add model</button></div>
   ${selected?`<div class="vs-actions"><label>Edit model<select data-stage-model>
    ${stage.models.map(m=>`<option value="${esc(m.id)}" ${m.id===selected.id?'selected':''}>${esc(name(m))}</option>`).join('')}
   </select></label><button data-compose="stage-remove">Remove model</button></div>${poses('stage.model',MODEL_FIELDS,selected)}`:''}
  </details>`;
}
const catalogUrl=new URL('../asset-libraries/index.json',import.meta.url);
let libraryCatalogPromise=null;
export async function loadAssetLibraryCatalog(url=catalogUrl){
 const response=await fetch(url);
 if(!response.ok)throw Error('Asset library catalog could not load.');
 const data=await response.json();
 if(data?.format!=='invincible-asset-library-catalog'||data.version!==1||!Array.isArray(data.libraries))throw Error('Invalid asset library catalog.');
 return data.libraries;
}
export function mountAssembly(root,api){
 const {getManifest,setManifest,getProject,getFile,putFile,deleteFile,importFiles,run,status,getTime,setTime,releaseRenderer,previewManifest}=api;
 let modelId='',selected=api.session.selected||'',audioSelected='',pending=null,focused=null,editor=null,focusScene=null,returnTime=0,closed=false,catalog=null,mapReviewQueue=[],mapReviewTotal=0;
 const objectRoot=document.createElement('section');objectRoot.className='vs-object-editor';root.closest('.video-studio').querySelector('.vs-preview').append(objectRoot);
 const objects=mountObjectEditor(objectRoot,{canvas:root.closest('.video-studio').querySelector('canvas'),getScene:()=>focused?null:scene(),getManifest,getTime,setTime,run,pause:api.pause,seek:()=>previewManifest(getManifest()),change:async(fn,replacement)=>{const m=replacement||await upgrade();if(fn)fn(m.scenes.find(s=>s.id===selected));await apply(m);}});
 const lockNavigation=value=>root.closest('.production-workbench')?.querySelectorAll('[data-tab]').forEach(b=>b.disabled=value);
 const mapAssets=()=>getProject()?.historicalMap?.visual?.assets||[];
 const upgrade=async()=>{const m=getManifest();if(m.schemaVersion===2)return structuredClone(m);const file=m.audio&&await getFile(m.audio.fileId),duration=file?(await decodeVoiceover(file)).duration:0;return upgradeVideo(m,duration);};
 const scene=()=>getManifest().scenes.find(s=>s.id===selected);
 async function ensureCatalog(){
  if(catalog)return catalog;
  libraryCatalogPromise??=loadAssetLibraryCatalog().catch(err=>{libraryCatalogPromise=null;throw err;});
  catalog=await libraryCatalogPromise;
  return catalog;
 }
 function populateLibrarySelect(){
  if(!catalog||closed)return;
  const select=root.querySelector('[data-asset-library]'),note=root.querySelector('[data-asset-library-note]');
  if(!select)return;
  const current=select.value;
  select.innerHTML=catalog.map(lib=>`<option value="${esc(lib.id)}">${esc(lib.title)}</option>`).join('')||'<option value="">No libraries registered</option>';
  if(current&&catalog.some(l=>l.id===current))select.value=current;
  const active=catalog.find(l=>l.id===select.value)||catalog[0];
  if(note)note.textContent=active?`${active.description} Choose artwork inside Edit scene.`:'No reusable artwork libraries configured.';
 }
 function render(){if(closed||focused)return;const openDetails=new Set([...root.querySelectorAll('details[open]')].map(n=>n.querySelector('summary')?.textContent));const m=getManifest(),s=scene(),a=m.audioClips?.find(a=>a.id===audioSelected);api.session.selected=selected;
  root.innerHTML=`<div class="vs-assembly-header"><strong>Scenes</strong><label>Add scene<select data-add-kind><option value="graphic">Canvas / explainer</option><option value="parallax">2.5D · Train template</option><option value="three">3D · Train stage</option><option value="map">Map</option><option value="battlefield">Battlefield</option></select></label><button data-compose="add">Add scene</button></div><div class="vs-actions"><button data-compose="maps">Use project maps</button><label class="vs-upload">Add image / video<input data-compose-media type="file" accept="image/png,image/jpeg,image/webp,video/mp4,video/webm"></label></div><div class="vs-scene-list">${m.scenes.map((s,i)=>`<button data-compose-select="${esc(s.id)}" aria-pressed="${selected===s.id}"><span>${i+1}. ${esc(s.name||s.engineType)}</span><small>${s.startSeconds.toFixed(1)}–${(s.startSeconds+s.durationSeconds).toFixed(1)}s · ${esc(s.engineType)}</small></button>`).join('')||'<p class="vs-help">Add a scene or copy maps from this project to begin.</p>'}</div>
  ${s?`<section class="vs-inspector"><h3>Selected scene</h3><label>Name<input data-assembly-prop="name" value="${esc(s.name||s.engineType)}" maxlength="200"></label><div class="vs-actions"><button data-compose="up">Move up</button><button data-compose="down">Move down</button><button data-compose="duplicate">Duplicate</button><button data-compose="remove">Remove</button></div><div class="vs-grid">${number('Duration (seconds)','duration',s.durationSeconds,1/30)}<label>Transition<select data-assembly-prop="transition"><option value="cut" ${s.transition?.type!=='fade'?'selected':''}>Cut</option><option value="fade" ${s.transition?.type==='fade'?'selected':''}>Fade through background</option></select></label>${number('Fade seconds','fade',s.transition?.durationSeconds||0,0,s.durationSeconds/2)}${s.engineType==='video'?number('Source trim start','trim',s.engineData.trimStart):''}${s.engineData.project||s.engineData.sourceId?number('Map source start','sourceStart',s.engineData.sourceStart):''}${['image','video'].includes(s.engineType)?`<label>Framing<select data-assembly-prop="fit"><option ${s.engineData.fit==='contain'?'selected':''}>contain</option><option ${s.engineData.fit==='cover'?'selected':''}>cover</option></select></label>`:''}</div>${s.engineType==='graphic'?`<label>Title text<textarea data-assembly-prop="text">${esc(s.overlays.find(o=>o.type==='text')?.text||'')}</textarea></label>`:''}${['map','battlefield'].includes(s.engineType)?'<button data-compose="edit">Edit scene</button>':''}${s.engineType==='three'?stageControls(s.engineData,m.assets,modelId):''}<div class="vs-actions"><label>Overlay artwork<select data-overlay-art>${m.assets.filter(a=>a.kind!=='glb').map(a=>`<option value="${esc(a.id)}">${esc(a.name)}</option>`).join('')}</select></label><button data-compose="add-overlay">Add image overlay</button></div><p class="vs-help">Overlay placement and motion can be refined in the complete video JSON. Timing changes are reviewed below before applying. Recordings keep their current positions.</p></section>`:''}
  <details><summary>Audio</summary><div class="vs-grid"><label>Type<select data-audio-role><option value="voiceover">Voice</option><option value="music">Music</option><option value="effect">Sound effect</option></select></label><label class="vs-upload">Add recording<input data-compose-audio type="file" accept=".mp3,.wav,audio/mpeg,audio/wav" multiple></label></div><div class="vs-audio-list">${(m.audioClips||[]).map(a=>`<button data-compose-audio-select="${esc(a.id)}" aria-pressed="${a.id===audioSelected}">${esc(a.name)}<small>${esc(a.role)} · ${a.startSeconds.toFixed(1)}–${(a.startSeconds+a.durationSeconds).toFixed(1)}s</small></button>`).join('')}${m.audio?'<p class="vs-help">An existing voiceover is loaded. Adding audio retains it as the first voice track.</p>':''}</div>${a?`<h4>${esc(a.name)}</h4><div class="vs-grid">${number('Timeline start','audio.startSeconds',a.startSeconds)}${number('Source trim start','audio.trimStart',a.trimStart)}${number('Duration','audio.durationSeconds',a.durationSeconds,1/48000)}${number('Volume','audio.gain',a.gain,0,2,.05)}${a.role!=='voiceover'?`<label>Repeat sound<select data-assembly-prop="audio.loop"><option value="false" ${!a.loop?'selected':''}>Off</option><option value="true" ${a.loop?'selected':''}>Loop</option></select></label>${a.loop?number('Loop source length','audio.sourceDurationSeconds',a.sourceDurationSeconds,1/48000):''}`:''}${number('Fade in','audio.fadeIn',a.fadeIn)}${number('Fade out','audio.fadeOut',a.fadeOut)}</div><button data-compose="remove-audio-clip">Remove recording</button>`:''}</details><details><summary>Reusable artwork</summary><div class="vs-actions"><select data-asset-library aria-label="Reusable artwork library"><option value="">Loading libraries…</option></select><button data-compose="load-asset-library">Load artwork library</button></div><p class="vs-help" data-asset-library-note>Choose a reusable artwork library, with source and rights notes. Choose formation artwork inside Edit scene.</p></details><div data-compose-review></div>`;
  if(root.closest('.vs-editing-first')){
   const rail=document.createElement('div');
   rail.className='vs-scene-rail';
   for(const child of [...root.children])if(!child.matches('.vs-inspector'))rail.append(child);
   root.prepend(rail);
   root.closest('.video-studio').toggleAttribute('data-empty-scenes',!m.scenes.length);
  }
  for(const details of root.querySelectorAll('details'))if(openDetails.has(details.querySelector('summary')?.textContent))details.open=true;
  objects.sync();
  if(catalog)populateLibrarySelect();
  else ensureCatalog().then(populateLibrarySelect).catch(()=>{});
 }
 function review(next,label){
  validateManifest(next,{mapAssets:mapAssets()});const current=getManifest(),changes=[];
  const timing=s=>`${s.startSeconds.toFixed(2)}–${(s.startSeconds+s.durationSeconds).toFixed(2)}s`;
  for(const s of next.scenes){const old=current.scenes.find(a=>a.id===s.id);if(!old||timing(old)!==timing(s))changes.push(`${s.name||s.engineType}: ${old?timing(old):'new'} → ${timing(s)}`);}
  for(const s of current.scenes)if(!next.scenes.some(a=>a.id===s.id))changes.push(`${s.name||s.engineType}: removed`);
  for(const a of next.audioClips||[]){const old=current.audioClips?.find(c=>c.id===a.id);if(old&&JSON.stringify(a)!==JSON.stringify(old))changes.push(`${a.name}: ${timing(old)} → ${timing(a)}; source trim ${a.trimStart.toFixed(2)}s, volume ${a.gain}, fades ${a.fadeIn.toFixed(2)} / ${a.fadeOut.toFixed(2)}s`);}
  pending=next;root.querySelector('[data-compose-review]').innerHTML=`<p>${esc(label)} ${label.startsWith('Change recording')?'Other recordings keep their positions.':'Recordings keep their existing timestamps.'}</p>${changes.length?'<ul>'+changes.map(c=>`<li>${esc(c)}</li>`).join('')+'</ul>':''}<div class="vs-actions"><button data-compose="apply-change">Apply change</button><button data-compose="discard-change">Discard</button></div>`;
 }
 async function apply(next){validateManifest(next,{mapAssets:mapAssets()});await setManifest(next);pending=null;render();}
 async function openEditor(){const m=await upgrade(),s=m.scenes.find(s=>s.id===selected);returnTime=getTime();await releaseRenderer();objects.sync();lockNavigation(true);focusScene=s;focused=m;objects.sync();root.closest('.video-studio').classList.add('vs-focusing');root.closest('.video-studio').dataset.editorKind=s.engineType;
  const continuing=mapReviewQueue.length>0,reviewNote=continuing?`<p class="vs-help"><strong>Review generated map ${mapReviewTotal-mapReviewQueue.length+1} of ${mapReviewTotal}.</strong> Save or discard to continue automatically.</p>`:'';
  root.innerHTML=reviewNote+`<div class="vs-actions"><button data-compose="finish-edit">Save scene & ${continuing?'continue':'return'}</button><button data-compose="cancel-edit">Discard & ${continuing?'continue':'return'}</button></div><div data-focused-editor></div>`;const host=root.querySelector('[data-focused-editor]');
  if(s.engineType==='battlefield')editor=mountBattlefieldEditor(host,{scene:s,assets:m.assets,onChange:()=>run(async()=>{await previewManifest(m);}).catch(()=>{})});
  else {const full=s.engineData.project||m.mapSources?.find(source=>source.id===s.engineData.sourceId)?.project||mapDraft(s.engineData.animation,s.engineData.geometryReviewed,mapAssets()),p=structuredClone({scenes:full.scenes.map(s=>({id:s.id,duration:s.duration})),historicalMap:full.historicalMap});p.id=getProject()?.id;s.engineData={project:p,sourceStart:s.engineData.sourceStart||0};editor=mountMapEditor(host,{getProject:()=>p,onChange:()=>{},initialTime:s.engineData.sourceStart+Math.max(0,returnTime-s.startSeconds),onAdvanced:()=>status('Map tools are available here. Use Save scene & return to finish.')});}
 }
 async function closeEditor(save){const next=focused,closedId=focusScene?.id;if(save){if(focusScene.engineType==='map'){const p=focusScene.engineData.project;p.scenes=p.scenes.map(s=>({id:s.id,duration:s.duration}));delete p.aspectRatio;delete p.id;}validateManifest(next,{mapAssets:mapAssets()});}editor?.destroy();editor=null;focused=null;focusScene=null;lockNavigation(false);root.closest('.video-studio').classList.remove('vs-focusing');await releaseRenderer();setTime(returnTime);if(save)await setManifest(next);else await previewManifest(getManifest());render();
  if(mapReviewQueue.length){mapReviewQueue=mapReviewQueue.filter(id=>id!==closedId);const nextMap=mapReviewQueue.find(id=>getManifest().scenes.some(scene=>scene.id===id&&scene.engineType==='map'));if(nextMap){selected=nextMap;setTime(scene().startSeconds);render();await openEditor();return;}mapReviewQueue=[];mapReviewTotal=0;root.dispatchEvent(new CustomEvent('invincible-map-review-complete',{bubbles:true}));}
 }
 async function startMapReview(){mapReviewQueue=getManifest().scenes.filter(scene=>scene.engineType==='map').map(scene=>scene.id);mapReviewTotal=mapReviewQueue.length;if(!mapReviewQueue.length)return false;selected=mapReviewQueue[0];setTime(scene().startSeconds);render();await openEditor();return true;}
 root.addEventListener('click',e=>{if(e.target.closest('[data-focused-editor]'))return;const select=e.target.closest('[data-compose-select]'),audio=e.target.closest('[data-compose-audio-select]'),action=e.target.closest('[data-compose]')?.dataset.compose;
  if(select){if(pending){status('Apply or discard the pending change first.');return;}selected=select.dataset.composeSelect;setTime(scene().startSeconds);render();run(()=>previewManifest(getManifest()));return;}
  if(audio){audioSelected=audio.dataset.composeAudioSelect;render();return;}if(!action)return;
  run(async()=>{
   if(action==='apply-change'&&pending){await apply(pending);return;}if(action==='discard-change'){pending=null;render();return;}
   if(action==='finish-edit'||action==='cancel-edit'){await closeEditor(action==='finish-edit');return;}
   if(pending)throw Error('Apply or discard the pending change first.');
   if(action==='edit'){await openEditor();return;}const m=await upgrade(),s=m.scenes.find(s=>s.id===selected),i=m.scenes.indexOf(s);
   if(action==='load-asset-library'){
    const libraries=await ensureCatalog(),chosenId=root.querySelector('[data-asset-library]')?.value||libraries[0]?.id;
    const entry=libraries.find(l=>l.id===chosenId);if(!entry||!safeRelativeAssetPath(entry.path))throw Error('Choose a valid reusable artwork library.');
    const response=await fetch(new URL(entry.path,catalogUrl));if(!response.ok)throw Error(`Asset library ${entry.title||entry.id} could not load.`);
    const library=await response.json();if(library?.format!=='invincible-map-assets'||!Array.isArray(library.assets))throw Error('Invalid asset library file format.');
    for(const asset of library.assets)if(!m.assets.some(a=>a.url===asset.url))m.assets.push({id:m.assets.some(a=>a.id===asset.id)?crypto.randomUUID():asset.id,name:asset.name,url:asset.url,credit:asset.credit||entry.title||'Reusable artwork library.'});
    await apply(m);return;
   }
   if(action==='maps'){const next=appendProjectMaps(m,getProject());review(next,`Append ${next.scenes.length-m.scenes.length} map scenes as independent copies?`);return;}
   if(action==='add'){const choice=root.querySelector('[data-add-kind]').value;
    const kind=choice==='parallax'?'graphic':choice;
    const data=kind==='three'?trainStage():choice==='parallax'?{background:'#bad7e1',parallax:{...DEFAULT_PARALLAX}}:kind==='battlefield'?emptyBattlefield():kind==='map'?{project:{scenes:[{id:crypto.randomUUID(),duration:5}],historicalMap:createDefaultMap()},sourceStart:0}:{};const row={id:crypto.randomUUID(),name:kind==='three'?'3D train':choice==='parallax'?'2.5D train':kind==='battlefield'?'Battlefield':kind==='map'?'Map':'Title',startSeconds:0,durationSeconds:5,engineType:kind,engineData:data,overlays:choice==='parallax'?trainTemplate(5):kind==='graphic'?[{id:crypto.randomUUID(),type:'text',text:'Your story',fontSize:64}]:[]};const previous=selected,previousTime=getTime();
    const next=arrangeScenes(m,[...m.scenes,row],{mapAssets:mapAssets()});
    selected=row.id;if(kind==='three')setTime(next.scenes.at(-1).startSeconds);
    try{await apply(next);}catch(error){selected=previous;setTime(previousTime);render();await previewManifest(getManifest()).catch(()=>{});throw error;}return;}
   if(s?.engineType==='three'&&['stage-add','stage-remove'].includes(action)){
    const stage=s.engineData;
    if(action==='stage-add'){
     const source=root.querySelector('[data-stage-source]').value;
     const model=modelMotion(crypto.randomUUID(),source.startsWith('preset:')?{preset:source.slice(7)}:{assetId:source.slice(6)});
     stage.models.push(model);modelId=model.id;
    }else{
     const target=root.querySelector('[data-stage-model]').value;
     stage.models=stage.models.filter(model=>model.id!==target);modelId=stage.models[0]?.id||'';
    }
    await apply(m);return;
   }
   if(action==='add-overlay'){if(!s)throw Error('Select a scene first.');const assetId=root.querySelector('[data-overlay-art]').value;if(!assetId)throw Error('Add artwork to your video from the shared library first.');s.overlays.push({id:crypto.randomUUID(),type:'image',assetId,x:.5,y:.5,width:.2,height:.2});await apply(m);return;}
   if(action==='remove-audio-clip'){m.audioClips=m.audioClips.filter(a=>a.id!==audioSelected);audioSelected='';review(m,'Remove this recording from the timeline?');return;}
   if(!s)return;
   if(action==='up'&&i>0)[m.scenes[i-1],m.scenes[i]]=[m.scenes[i],m.scenes[i-1]];
   if(action==='down'&&i<m.scenes.length-1)[m.scenes[i+1],m.scenes[i]]=[m.scenes[i],m.scenes[i+1]];
   if(action==='duplicate'){const copy=structuredClone(s);copy.id=crypto.randomUUID();copy.name=(copy.name||s.engineType)+' copy';m.scenes.splice(i+1,0,copy);}
   if(action==='remove')m.scenes.splice(i,1);
   if(['up','down','duplicate','remove'].includes(action))review(arrangeScenes(m,m.scenes,{mapAssets:mapAssets()}),'Update scene order and timing?');
  });
 });
 root.addEventListener('change',e=>{if(e.target.closest('[data-focused-editor]'))return;const target=e.target,key=target.dataset.assemblyProp;
  if(target.matches('[data-stage-model]')){modelId=target.value;render();return;}
  if(target.matches('[data-asset-library]')){populateLibrarySelect();return;}
  // A programmatic change followed by blur must not cancel the user's Apply click.
  if(key?.startsWith('audio.')&&pending?.audioClips?.find(a=>a.id===audioSelected)?.[key.slice(6)]===Number(target.value))return;
  if(!key&&!target.matches('[data-compose-audio],[data-compose-media]'))return;run(async()=>{
   if(pending)throw Error('Apply or discard the pending change first.');const m=await upgrade(),s=m.scenes.find(s=>s.id===selected);
   if(target.matches('[data-compose-audio]')&&importFiles){await importFiles([...target.files],{role:root.querySelector('[data-audio-role]').value});render();return;}
   if(target.matches('[data-compose-media]')&&importFiles){await importFiles([...target.files],{addScenes:true});render();return;}
   if(target.matches('[data-compose-audio]')){
    const role=root.querySelector('[data-audio-role]').value,files=[...target.files],decoded=[],addedIds=[];
    for(const file of files)decoded.push({file,buffer:await decodeVoiceover(file),id:crypto.randomUUID()});
    try{
     for(const item of decoded){addedIds.push(item.id);m.audioClips.push({id:item.id,fileId:item.id,name:item.file.name,role,startSeconds:getTime(),trimStart:0,durationSeconds:item.buffer.duration,gain:1,fadeIn:0,fadeOut:0});putFile(item.id,item.file);}
     await apply(m);status('Recording added. Save keeps original media on this device.');
    }catch(error){for(const fid of addedIds)deleteFile?.(fid);throw error;}
    return;
   }
   if(target.matches('[data-compose-media]')){const file=target.files[0];if(!file)return;if(file.size>100*1024*1024||!['image/png','image/jpeg','image/webp','video/mp4','video/webm'].includes(file.type))throw Error('Choose PNG/JPEG/WebP or MP4/WebM, up to 100 MB.');const id=crypto.randomUUID(),video=file.type.startsWith('video/');let duration=5;
    if(video){const v=document.createElement('video'),url=URL.createObjectURL(file);try{v.preload='metadata';await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Clip metadata timed out.')),15000);v.onloadedmetadata=()=>{clearTimeout(timer);resolve();};v.onerror=()=>{clearTimeout(timer);reject(Error('Cannot decode this clip.'));};v.src=url;});duration=v.duration;if(!Number.isFinite(duration)||duration<=0)throw Error('Invalid clip duration.');}finally{v.removeAttribute('src');v.load();URL.revokeObjectURL(url);}}
    const prevSelected=selected;m.assets.push({id,name:file.name,fileId:id});const row={id:crypto.randomUUID(),name:file.name,startSeconds:0,durationSeconds:duration,engineType:video?'video':'image',engineData:{assetId:id,fit:'contain',...(video?{trimStart:0}:{})},overlays:[]};selected=row.id;const next=arrangeScenes(m,[...m.scenes,row],{mapAssets:mapAssets()});putFile(id,file);try{await apply(next);}catch(error){selected=prevSelected;deleteFile?.(id);throw error;}status(video?'Clip added. Its original audio is muted; add a recording in Audio.':'Image added.');return;
   }
   if(key.startsWith('audio.')){const a=m.audioClips.find(a=>a.id===audioSelected);if(key==='audio.loop'){a.loop=target.value==='true';if(a.loop)a.sourceDurationSeconds=a.durationSeconds;else delete a.sourceDurationSeconds;}else a[key.slice(6)]=Number(target.value);review(m,'Change recording timing or volume?');return;}if(!s)return;
   if(key.startsWith('stage.')&&s.engineType==='three'){
    const [,kind,end,field]=key.split('.');
    const motion=kind==='camera'?s.engineData.camera:s.engineData.models.find(model=>model.id===root.querySelector('[data-stage-model]').value);
    motion[end][field]=target.valueAsNumber;
    await apply(m);return;
   }
   if(key==='name')s.name=target.value;else if(key==='duration')Object.assign(s,resizeScene(s,Number(target.value)));else if(key==='transition')s.transition={type:target.value,durationSeconds:target.value==='fade'?Math.min(.3,s.durationSeconds/2):0};else if(key==='fade')s.transition={type:'fade',durationSeconds:Number(target.value)};else if(key==='trim')s.engineData.trimStart=Number(target.value);else if(key==='sourceStart')s.engineData.sourceStart=Number(target.value);else if(key==='fit')s.engineData.fit=target.value;else if(key==='text'){const title=s.overlays.find(o=>o.type==='text');if(title)title.text=target.value;else s.overlays.push({id:crypto.randomUUID(),type:'text',text:target.value,fontSize:64});}
   review(arrangeScenes(m,m.scenes,{mapAssets:mapAssets()}),'Apply selected scene changes?');
  });
 });
 render();return {sync:render,highlight:()=>objects.highlight(),startMapReview,get focused(){return !!focused;},destroy(){closed=true;lockNavigation(false);editor?.destroy();objects.destroy();},select(id){selected=id;render();}};
}
