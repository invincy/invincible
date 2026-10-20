import {makeScene} from './storyboard-model.js?v=2';
import {METHODS,IMPORT_FIELDS,uid,methodsOf,inspectImport,parseProductionImport,uniqueScenes,groupFor,taskFor,setTask,animationStage,requirements,canComplete,sceneState,projectProgress,queueScenes,canonicalScript,scriptReview} from './production-model.js?v=1';
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const options=(values,current)=>values.map(value=>'<option '+(value===current?'selected':'')+'>'+esc(value)+'</option>').join('');
export function createProductionWorkbench(root,{getProject,onChange,onFocus,copyText}){
 let tab='Storyboard',workspace='Blender',groupBy='project',active='',pending=[],mapping=[],importTable=null,scriptChanges=null,dragId='';
 root.classList.add('production-workbench');
 root.innerHTML='<nav class="wb-tabs" aria-label="Project areas">'+['Storyboard','Production','Assets','Overview'].map(name=>'<button data-tab="'+name+'">'+name+'</button>').join('')+'</nav><div class="wb-status" role="status" aria-live="polite"></div><div data-workbench></div>';
 const panel=root.querySelector('[data-workbench]'),message=text=>root.querySelector('.wb-status').textContent=text;
 const project=()=>getProject();
 const scenes=()=>project()?.scenes||[];
 const changed=(rerender=true)=>{onChange();if(rerender)render();};
 const findScene=id=>scenes().find(scene=>scene.id===id);
 function field(label,key,value,extra=''){
  return '<label>'+esc(label)+'<textarea rows="3" data-field="'+key+'" '+extra+'>'+esc(value)+'</textarea></label>';
 }
 function groupsSelect(scene){
  return '<label>Animation project<select data-field="animationGroupId"><option value="">Independent scene</option>'+(project().animationGroups||[]).map(group=>'<option value="'+esc(group.id)+'" '+(group.id===scene.animationGroupId?'selected':'')+'>'+esc(group.name)+'</option>').join('')+'</select></label>';
 }
 function methodTags(scene){
  return '<div class="wb-methods" aria-label="Production methods">'+METHODS.map(method=>'<label><input type="checkbox" data-method="'+method+'" '+(methodsOf(scene).includes(method)?'checked':'')+'>'+method+'</label>').join('')+'</div>';
 }
 function sceneStatus(scene){
  const state=sceneState(project(),scene);
  return '<label>Scene completion<select data-field="sceneState">'+options(['Planned','Assets Ready','Editing','Completed'],state)+'</select></label>';
 }
 function stageControls(scene,method){
  const task=taskFor(project(),scene,method);
  if(method==='Editing')return '<section class="wb-stage"><strong>Editing</strong><label><input type="checkbox" data-check="editingDone" '+(scene.editingDone?'checked':'')+'>Editing complete</label></section>';
  return '<section class="wb-stage"><strong>'+esc(method)+' · '+animationStage(task)+'</strong><div class="wb-actions">'+
   (method==='Blender'?[['started','Start working'],['modeling','Modeling complete'],['animation','Animation complete'],['rendering','Rendering complete'],['ready','Asset ready']]:[['started','Start working'],['ready','Asset ready']]).map(([key,label])=>'<button data-task="'+key+'" data-task-method="'+method+'" aria-pressed="'+!!task[key]+'">'+(task[key]?'✓ ':'')+label+'</button>').join('')+'</div></section>';
 }
 function details(scene){
  const group=groupFor(project(),scene);
  return '<div class="wb-details">'+methodTags(scene)+'<div class="wb-detail-grid">'+
   groupsSelect(scene)+field('Existing Blender file / local path','blenderFile',scene.blenderFile)+
   field('Camera movement','camera',scene.camera)+field('Character prompt','characterPrompt',scene.characterPrompt)+
   field('Image generation prompt','imagePrompt',scene.imagePrompt)+field('Video generation prompt','videoPrompt',scene.videoPrompt)+
   field('Blender / Codex prompt','blenderPrompt',scene.blenderPrompt)+field('Technical notes','technicalNotes',scene.technicalNotes)+
   field('Asset references and links','assetReferences',scene.assetReferences)+'</div>'+
   (group?'<p>Shared project: '+esc(group.name)+' · '+esc(group.blenderFile||'No file reference yet')+'</p>':'')+
   methodsOf(scene).map(method=>stageControls(scene,method)).join('')+
   '<div class="wb-actions"><label><input type="checkbox" data-check="voiceoverReady" '+(scene.voiceoverReady?'checked':'')+'>Voiceover ready</label><label><input type="checkbox" data-check="editingDone" '+(scene.editingDone?'checked':'')+'>Editing complete</label></div>'+
   '<div class="wb-checklist">'+(scene.checklist||[]).map((item,index)=>'<label><input type="checkbox" data-checklist="'+index+'" '+(item.done?'checked':'')+'>'+esc(item.text)+'<button data-remove-check="'+index+'" aria-label="Remove checklist item">×</button></label>').join('')+'<div class="wb-actions"><input data-new-check placeholder="Add production task"><button data-action="add-check">Add task</button></div></div>'+
   '<div class="wb-actions"><button data-action="copy">Copy Prompt</button><button data-action="draft">Draft prompts from plan</button><button data-action="focus">Focused prompt editor</button><button data-action="duplicate">Duplicate</button><button data-action="insert">Insert scene below</button><button data-action="remove">Delete scene</button></div></div>';
 }
 function sceneRow(scene,index){
  const open=active===scene.id;
  return '<article class="wb-scene" data-scene="'+esc(scene.id)+'"><div class="wb-row">'+
   '<div class="wb-number"><button draggable="true" data-drag="'+esc(scene.id)+'" aria-label="Drag scene '+(index+1)+'">⠿</button><strong>'+String(index+1).padStart(2,'0')+'</strong><button data-action="up" aria-label="Move scene up">↑</button><button data-action="down" aria-label="Move scene down">↓</button></div>'+
   '<label><span class="wb-mobile-label">Timeline / duration</span><input data-field="timing" value="'+esc(scene.timeline||scene.duration+' sec')+'"></label>'+
   field('Voiceover','voiceover',scene.voiceover)+field('Visual / Animation','visual',scene.visual)+field('Assets Required','assets',scene.assets)+
   '<div><span class="wb-mobile-label">Production method</span>'+methodTags(scene)+'</div><div>'+sceneStatus(scene)+'<span class="wb-production-status">'+productionStatus(scene)+'</span><button data-action="expand" aria-expanded="'+open+'">'+(open?'Close details':'Scene details')+'</button></div></div>'+
   (open?details(scene):'')+'</article>';
 }
 function productionStatus(scene){
  if(sceneState(project(),scene)==='Completed')return 'Completed';
  const tasks=methodsOf(scene).filter(method=>method!=='Editing').map(method=>taskFor(project(),scene,method));
  if(tasks.length&&tasks.every(task=>task.ready||task.rendering))return 'Rendered';
  return tasks.some(task=>Object.values(task).some(Boolean))?'In Progress':'Not Started';
 }
 function storyboard(){
  return '<div class="wb-heading"><div><h2>Storyboard</h2><p>Plan chronologically. Produce by workflow.</p></div><button data-action="add">+ Add scene</button></div>'+
   '<details class="wb-import" '+(!scenes().length?'open':'')+'><summary>Paste storyboard · TSV, Markdown or voiceover</summary><p>Four-column TSV and six-column Markdown both work. Quoted TSV preserves multiline narration; use &lt;br&gt; in Markdown cells. Imports append and skip exact duplicates.</p><textarea data-paste rows="6" placeholder="Paste the complete table here"></textarea><button data-action="preview">Preview and map columns</button><div data-import-preview></div></details>'+
   '<div class="wb-column-head" aria-hidden="true"><span>Scene</span><span>Timeline</span><span>Voiceover</span><span>Visual / Animation</span><span>Assets Required</span><span>Method</span><span>Status</span></div>'+
   (scenes().map(sceneRow).join('')||'<p>No scenes yet. Paste your storyboard above.</p>');
 }
 function groupEditor(group){
  return '<section class="wb-group" data-group="'+esc(group.id)+'"><div class="wb-detail-grid"><label>Animation project name<input data-group-field="name" value="'+esc(group.name)+'"></label><label>Blender file reference<input data-group-field="blenderFile" value="'+esc(group.blenderFile||'')+'"></label>'+
   field('Shared models / environment / camera / outputs','resources',group.resources||'','data-group-field="resources"')+'</div><p>Blender tasks are shared across this project. Scene narration and editing remain independent.</p></section>';
 }
 function production(){
  const queue=queueScenes(project(),workspace);
  const buckets=new Map();
  for(const scene of queue){
   const group=groupFor(project(),scene);
   const key=groupBy==='status'?productionStatus(scene):groupBy==='scene'?scene.id:group?.id||'ungrouped';
   if(!buckets.has(key))buckets.set(key,{group,label:groupBy==='status'?key:groupBy==='scene'?'Scene '+(scenes().indexOf(scene)+1):group?.name||'Independent scenes',scenes:[]});
   buckets.get(key).scenes.push(scene);
  }
  return '<div class="wb-heading"><div><h2>'+esc(project().title)+' — '+workspace+' Production</h2><p>'+queue.length+' scenes in this workflow</p></div><button data-action="next">Next pending '+workspace+' scene →</button></div>'+
   '<div class="wb-actions">'+['Blender','AI Video','Editing','Assets','All'].map(method=>'<button data-workspace="'+method+'" aria-pressed="'+(method===workspace)+'">'+method+'</button>').join('')+
   '<label>Group by<select data-group-by>'+[['project','Animation Project'],['scene','Scene'],['status','Status']].map(([value,label])=>'<option value="'+value+'" '+(value===groupBy?'selected':'')+'>'+label+'</option>').join('')+'</select></label></div>'+
   '<details class="wb-group-create"><summary>Animation projects · create / edit shared resources</summary><div class="wb-actions"><input data-new-group placeholder="Animation project name"><button data-action="add-group">Create group</button></div>'+(project().animationGroups||[]).map(groupEditor).join('')+'</details>'+
   [...buckets.values()].map(bucket=>'<section class="wb-queue-group"><h3>'+esc(bucket.label)+'</h3>'+bucket.scenes.map(scene=>'<article class="wb-production-card" data-scene="'+esc(scene.id)+'"><header><strong>Scene '+(scenes().indexOf(scene)+1)+' · '+esc(scene.timeline||scene.duration+' sec')+'</strong><span>'+sceneState(project(),scene)+'</span></header><p class="wb-narration">'+esc(scene.voiceover)+'</p><p>'+esc(scene.visual)+'</p><p>Required assets: '+esc(scene.assets||'None listed')+'</p>'+
   '<div class="wb-actions"><button data-action="expand" aria-expanded="'+(active===scene.id)+'">'+(active===scene.id?'Close details':'Edit scene and prompts')+'</button><button data-action="copy">Copy Prompt</button></div>'+
   (active===scene.id?details(scene):'<p class="wb-file">'+esc(groupFor(project(),scene)?.blenderFile||scene.blenderFile||'')+'</p>'+
    (workspace==='All'?methodsOf(scene):[workspace]).map(method=>stageControls(scene,method)).join(''))+'</article>').join('')+'</section>').join('')+
   (!queue.length?'<p>No scenes in this workspace. Assign method tags in Storyboard.</p>':'');
 }
 function assetEditor(asset){
  return '<article class="wb-asset" data-asset="'+esc(asset.id)+'"><div class="wb-detail-grid"><label>Name<input data-asset-field="name" value="'+esc(asset.name)+'"></label><label>Type<select data-asset-field="type">'+options(['Blender file','Video','Image','Audio','Reference','Model','Other'],asset.type)+'</select></label><label>Storage path / external URL<input data-asset-field="path" value="'+esc(asset.path||'')+'"></label><label>Status<select data-asset-field="status">'+options(['Not Started','In Progress','Ready'],asset.status)+'</select></label>'+field('Notes','notes',asset.notes||'','data-asset-field="notes"')+'</div><div class="wb-associations"><strong>Scenes</strong>'+scenes().map((scene,index)=>'<label><input type="checkbox" data-associate-scene="'+esc(scene.id)+'" '+((asset.sceneIds||[]).includes(scene.id)?'checked':'')+'>Scene '+(index+1)+'</label>').join('')+'<strong>Animation groups</strong>'+(project().animationGroups||[]).map(group=>'<label><input type="checkbox" data-associate-group="'+esc(group.id)+'" '+((asset.groupIds||[]).includes(group.id)?'checked':'')+'>'+esc(group.name)+'</label>').join('')+'</div><div class="wb-actions"><button data-copy-path>Copy reference</button>'+(/^https?:\/\//i.test(asset.path||'')?'<a href="'+esc(asset.path)+'" target="_blank" rel="noopener noreferrer">Open URL ↗</a>':'<span>Local paths are references only.</span>')+'<button data-delete-asset>Remove metadata</button></div></article>';
 }
 function assets(){
  const legacy=scenes().flatMap((scene,index)=>['characterAssetUrl','imageAssetUrl','videoAssetUrl'].filter(key=>scene[key]).map(key=>'<li>Scene '+(index+1)+' · '+esc(key)+': '+esc(scene[key])+'</li>'));
  return '<div class="wb-heading"><div><h2>Assets</h2><p>One registry for shared models, renders, audio and references.</p></div><button data-action="add-asset">+ Add asset reference</button></div>'+
   (project().assets||[]).map(assetEditor).join('')+(legacy.length?'<details><summary>Existing scene asset links</summary><ul>'+legacy.join('')+'</ul></details>':'');
 }
 function overview(){
  const progress=projectProgress(project()),script=canonicalScript(project());
  return '<div class="wb-heading"><div><h2>Overview</h2><p>'+progress+'% of required work complete</p></div></div><progress max="100" value="'+progress+'"></progress>'+
   '<div class="wb-overview">'+scenes().map((scene,index)=>'<article><strong>Scene '+(index+1)+' · '+sceneState(project(),scene)+'</strong><p>'+esc(requirements(project(),scene).filter(task=>!task.done).map(task=>task.key).join(' · ')||'All production tasks ready; review scene completion.')+'</p></article>').join('')+'</div>'+
   '<details><summary>Project hook and notes</summary>'+field('Hook','hook',project().hook||'','data-project-field="hook"')+field('Project notes','notes',project().notes||'','data-project-field="notes"')+'</details>'+
   '<details class="wb-script"><summary>Script and voiceover · review synchronization</summary><p>Scene narration is canonical. The existing full-script draft is retained separately. Applying a draft requires one paragraph per scene and a review.</p><label>Chronological scene script<textarea readonly rows="8" data-canonical-script>'+esc(script)+'</textarea></label><button data-action="copy-script">Copy chronological script</button><label>Full-script draft<textarea rows="8" data-script-draft>'+esc(project().script||script)+'</textarea></label><div class="wb-actions"><button data-action="script-from-scenes">Review scenes → full script</button><button data-action="review-script">Review full script → scenes</button></div><div data-script-review></div></details>';
 }
 function render(){
  if(!project())return;
  root.querySelectorAll('[data-tab]').forEach(button=>button.setAttribute('aria-current',button.dataset.tab===tab?'page':'false'));
  panel.innerHTML=tab==='Storyboard'?storyboard():tab==='Production'?production():tab==='Assets'?assets():overview();
  pending=[];scriptChanges=null;
 }
 function preview(){
  try{
   importTable=inspectImport(panel.querySelector('[data-paste]').value);mapping=[...importTable.mapping];
   const box=panel.querySelector('[data-import-preview]');
   box.innerHTML='<p>'+importTable.format+' · '+importTable.rows.length+' rows. Map columns, then review every scene.</p><div class="wb-mapping">'+importTable.headers.map((header,index)=>'<label>'+esc(header)+'<select data-map="'+index+'"><option value="">Ignore column</option>'+IMPORT_FIELDS.map(key=>'<option value="'+key+'" '+(mapping[index]===key?'selected':'')+'>'+key+'</option>').join('')+'</select></label>').join('')+'</div><button data-action="map-preview">Review scenes</button><div data-mapped-preview></div>';
   mappedPreview();
  }catch(error){message(error.message);}
 }
 function mappedPreview(){
  pending=[];
  try{
   const parsed=parseProductionImport(panel.querySelector('[data-paste]').value,mapping);
   const unique=uniqueScenes(scenes(),parsed);pending=unique.scenes;
   panel.querySelector('[data-mapped-preview]').innerHTML='<p>'+pending.length+' new scenes · '+unique.duplicates+' duplicates skipped. Existing scenes stay in place.</p><div class="wb-preview">'+parsed.map((scene,index)=>'<article><strong>Scene '+(index+1)+' · '+esc(scene.timeline||scene.duration+' sec')+'</strong><p>'+esc(scene.voiceover)+'</p><p>'+esc(scene.visual)+'</p><p>'+esc(scene.assets)+'</p><p>'+esc(methodsOf(scene).join(', '))+'</p><p>'+esc(scene.blenderPrompt||scene.videoPrompt||'')+'</p>'+(scene.importedStatus?'<p>Imported status: '+esc(scene.importedStatus)+' (completion requires review)</p>':'')+'</article>').join('')+'</div><button data-action="import" '+(!pending.length?'disabled':'')+'>Append reviewed scenes</button>';
   message('Preview only. No scenes changed.');
  }catch(error){message(error.message);}
 }
 root.addEventListener('input',event=>{
  const target=event.target,scene=findScene(target.closest('[data-scene]')?.dataset.scene);
  if(target.matches('[data-paste]')){pending=[];const box=panel.querySelector('[data-import-preview]');if(box)box.innerHTML='';return;}
  if(target.matches('[data-script-draft]')){project().script=target.value;scriptChanges=null;panel.querySelector('[data-script-review]').innerHTML='';changed(false);return;}
  const group=(project().animationGroups||[]).find(item=>item.id===target.closest('[data-group]')?.dataset.group);
  if(group&&target.dataset.groupField){group[target.dataset.groupField]=target.value;changed(false);return;}
  const asset=(project().assets||[]).find(item=>item.id===target.closest('[data-asset]')?.dataset.asset);
  if(asset&&target.dataset.assetField){asset[target.dataset.assetField]=target.value;changed(false);return;}
  if(target.dataset.projectField){project()[target.dataset.projectField]=target.value;changed(false);return;}
  if(!scene||!target.dataset.field||target.tagName==='SELECT')return;
  const key=target.dataset.field;
  if(key==='timing'){
   try{const parsed=parseProductionImport('Voiceover\tVisual\tAssets\tTimeline\nx\t\t\t'+target.value)[0];scene.duration=parsed.duration;scene.timeline=parsed.timeline||'';target.setCustomValidity('');}
   catch(error){target.setCustomValidity(error.message);message(error.message);return;}
  }else{scene[key]=target.value;if(['voiceover','visual','assets'].includes(key)){scene.completed=false;if(key==='voiceover')scene.voiceoverReady=false;}}
  changed(false);
 });
 root.addEventListener('change',event=>{
  const target=event.target,scene=findScene(target.closest('[data-scene]')?.dataset.scene);
  if(target.dataset.map!==undefined){mapping[Number(target.dataset.map)]=target.value;pending=[];mappedPreview();return;}
  if(target.matches('[data-group-by]')){groupBy=target.value;render();return;}
  const asset=(project().assets||[]).find(item=>item.id===target.closest('[data-asset]')?.dataset.asset);
  if(asset&&target.dataset.assetField){changed();return;}
  if(asset&&(target.dataset.associateScene||target.dataset.associateGroup)){
   const key=target.dataset.associateScene?'sceneIds':'groupIds',id=target.dataset.associateScene||target.dataset.associateGroup;
   asset[key]=target.checked?[...new Set([...(asset[key]||[]),id])]:(asset[key]||[]).filter(value=>value!==id);changed();return;
  }
  if(!scene)return;
  if(target.dataset.method){const list=methodsOf(scene);scene.productionMethods=target.checked?[...list,target.dataset.method]:list.filter(method=>method!==target.dataset.method);scene.completed=false;changed();return;}
  if(target.dataset.check){scene[target.dataset.check]=target.checked;if(!target.checked)scene.completed=false;changed();return;}
  if(target.dataset.checklist!==undefined){scene.checklist[Number(target.dataset.checklist)].done=target.checked;if(!target.checked)scene.completed=false;changed();return;}
  if(target.tagName==='SELECT'&&target.dataset.field){
   const key=target.dataset.field;
   if(key==='sceneState'&&target.value==='Completed'&&!canComplete(project(),scene)){message('Finish required assets, voiceover, checklist and editing before completing this scene.');target.value=sceneState(project(),scene);return;}
   scene[key]=target.value;if(key==='sceneState')scene.completed=target.value==='Completed';else scene.completed=false;
   changed();
  }
 });
 root.addEventListener('click',async event=>{
  const button=event.target.closest('button');if(!button)return;
  try{
   if(button.dataset.tab){tab=button.dataset.tab;message('');render();return;}
   if(button.dataset.workspace){workspace=button.dataset.workspace;active='';render();return;}
   const scene=findScene(button.closest('[data-scene]')?.dataset.scene),index=scenes().indexOf(scene),action=button.dataset.action;
   const asset=(project().assets||[]).find(item=>item.id===button.closest('[data-asset]')?.dataset.asset);
   if(button.hasAttribute('data-copy-path')){await copyText(asset.path||'');message('Reference copied.');return;}
   if(button.hasAttribute('data-delete-asset')){if(!confirm('Remove this asset metadata? Files are unaffected.'))return;project().assets=project().assets.filter(item=>item.id!==asset.id);changed();return;}
   if(button.dataset.task){
    const method=button.dataset.taskMethod,task=taskFor(project(),scene,method),key=button.dataset.task;
    if(key==='ready'&&method==='Blender'&&!['modeling','animation','rendering'].every(field=>task[field])){message('Finish modeling, animation and rendering first.');return;}
    const patch={[key]:!task[key]};if(task[key]&&key!=='ready')patch.ready=false;
    setTask(project(),scene,method,patch);changed();return;
   }
   if(button.dataset.removeCheck!==undefined){scene.checklist.splice(Number(button.dataset.removeCheck),1);scene.completed=false;changed();return;}
   if(action==='preview'){preview();return;}if(action==='map-preview'){mappedPreview();return;}
   if(action==='import'){
    if(!pending.length)return;
    const fresh=uniqueScenes(scenes(),pending).scenes;
    for(const item of fresh)if(item.animationGroup){
     project().animationGroups||=[];
     let group=project().animationGroups.find(group=>group.name===item.animationGroup);
     if(!group){group={id:uid(),name:item.animationGroup,blenderFile:'',resources:'',production:{}};project().animationGroups.push(group);}
     item.animationGroupId=group.id;
    }
    project().scenes.push(...fresh);pending=[];changed();message(fresh.length+' scenes appended.');return;
   }
   if(action==='add'){const item=makeScene({productionMethods:[],sceneState:'Planned'});project().scenes.push(item);active=item.id;changed();return;}
   if(action==='add-group'){const name=panel.querySelector('[data-new-group]').value.trim();if(!name)return;project().animationGroups||=[];project().animationGroups.push({id:uid(),name,blenderFile:'',resources:'',production:{}});changed();return;}
   if(action==='add-asset'){project().assets||=[];project().assets.push({id:uid(),name:'Untitled asset',type:'Reference',path:'',status:'Not Started',sceneIds:[],groupIds:[],notes:''});changed();return;}
   if(action==='next'){
    const next=queueScenes(project(),workspace).find(item=>workspace==='Editing'?!item.editingDone:workspace==='All'||workspace==='Assets'?sceneState(project(),item)!=='Completed':!taskFor(project(),item,workspace).ready);
    if(!next){message('No pending scenes in this workspace.');return;}active=next.id;render();panel.querySelector('[data-scene="'+CSS.escape(next.id)+'"]')?.scrollIntoView({block:'nearest'});return;
   }
   if(action==='copy-script'){await copyText(canonicalScript(project()));message('Chronological script copied.');return;}
   if(action==='script-from-scenes'){
    scriptChanges={direction:'from',before:project().script||'',after:canonicalScript(project())};
    panel.querySelector('[data-script-review]').innerHTML='<h3>Review full-script replacement</h3><p>Current draft</p><pre>'+esc(scriptChanges.before)+'</pre><p>Scene narration</p><pre>'+esc(scriptChanges.after)+'</pre><button data-action="apply-script">Replace full-script draft</button>';return;
   }
   if(action==='review-script'){
    scriptChanges={direction:'to',rows:scriptReview(project(),panel.querySelector('[data-script-draft]').value)};
    panel.querySelector('[data-script-review]').innerHTML=scriptChanges.rows.map((row,i)=>'<article><strong>Scene '+(i+1)+(row.changed?' · Changed':' · Unchanged')+'</strong><del>'+esc(row.before)+'</del><ins>'+esc(row.after)+'</ins></article>').join('')+'<button data-action="apply-script">Apply reviewed narration changes</button>';return;
   }
   if(action==='apply-script'&&scriptChanges){
    if(scriptChanges.direction==='from')project().script=scriptChanges.after;
    else for(const row of scriptChanges.rows)if(row.changed){const item=findScene(row.id);if(item.voiceover!==row.before)throw Error('Scene narration changed since review. Review again.');}
    if(scriptChanges.direction==='to')for(const row of scriptChanges.rows)if(row.changed){const item=findScene(row.id);item.voiceover=row.after;item.voiceoverReady=false;item.completed=false;}
    changed();message('Reviewed script changes applied.');return;
   }
   if(!scene)return;
   if(action==='expand'){active=active===scene.id?'':scene.id;render();return;}
   if(action==='copy'){await copyText(scene.blenderPrompt||scene.videoPrompt||scene.imagePrompt||scene.visual||'');message('Prompt copied.');return;}
   if(action==='draft'){
    const settings=project(),style=settings.visualStyle||'cinematic documentary',ratio=settings.aspectRatio||'9:16';
    if(!scene.characterPrompt?.trim())scene.characterPrompt=settings.characterBible||'';
    if(!scene.imagePrompt?.trim())scene.imagePrompt='Create a '+ratio+' '+style+' image. Narration: '+scene.voiceover+'. Visual: '+scene.visual+'. Assets: '+scene.assets+'. '+(settings.characterBible||'')+' '+(settings.continuityNotes||'')+' No captions or watermark.';
    if(!scene.videoPrompt?.trim())scene.videoPrompt='Animate for '+scene.duration+' seconds. '+scene.visual+'. '+(scene.camera||'Controlled camera movement.')+' '+(settings.continuityNotes||'')+' Preserve subject identity and visual continuity.';
    changed();message('Filled blank prompts from the scene plan.');return;
   }
   if(action==='focus'){onFocus(scene.id);return;}
   if(action==='add-check'){const text=button.closest('[data-scene]').querySelector('[data-new-check]').value.trim();if(!text)return;scene.checklist||=[];scene.checklist.push({id:uid(),text,done:false});scene.completed=false;}
   if(action==='duplicate'){const copy=makeScene({...JSON.parse(JSON.stringify(scene)),id:uid(),completed:false,sceneState:'Planned',voiceoverReady:false,editingDone:false,checklist:(scene.checklist||[]).map(item=>({...item,id:uid(),done:false})),production:{}});project().scenes.splice(index+1,0,copy);active=copy.id;}
   if(action==='insert'){const item=makeScene({productionMethods:[],sceneState:'Planned'});project().scenes.splice(index+1,0,item);active=item.id;}
   if(action==='remove'){if(!confirm('Delete this scene and its production notes?'))return;project().scenes.splice(index,1);for(const asset of project().assets||[])asset.sceneIds=(asset.sceneIds||[]).filter(id=>id!==scene.id);}
   if(action==='up'||action==='down'){const next=index+(action==='up'?-1:1);if(next<0||next>=scenes().length)return;[project().scenes[index],project().scenes[next]]=[project().scenes[next],project().scenes[index]];}
   changed();
  }catch(error){message(error.message);}
 });
 root.addEventListener('dragstart',event=>{const handle=event.target.closest('[data-drag]');if(!handle)return;dragId=handle.dataset.drag;event.dataTransfer.setData('text/plain',dragId);event.dataTransfer.effectAllowed='move';});
 root.addEventListener('dragover',event=>{if(dragId&&event.target.closest('[data-scene]'))event.preventDefault();});
 root.addEventListener('drop',event=>{event.preventDefault();const id=event.target.closest('[data-scene]')?.dataset.scene;if(!dragId||!id||id===dragId)return;const from=scenes().findIndex(scene=>scene.id===dragId),to=scenes().findIndex(scene=>scene.id===id);if(from<0||to<0)return;const [item]=project().scenes.splice(from,1);project().scenes.splice(to,0,item);dragId='';changed();});
 root.addEventListener('dragend',()=>dragId='');
 return {render,watchSource(){return ()=>{};},reset:render};
}
