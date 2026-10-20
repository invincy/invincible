import {makeScene} from './storyboard-model.js?v=2';
import {METHODS,IMPORT_FIELDS,uid,methodsOf,inspectImport,parseProductionImport,uniqueScenes,groupFor,taskFor,setTask,animationStage,requirements,canComplete,sceneState,projectProgress,queueScenes,canonicalScript,scriptReview,filterScenes,productionReadiness} from './production-model.js?v=2';
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const options=(values,current)=>values.map(value=>'<option '+(value===current?'selected':'')+'>'+esc(value)+'</option>').join('');
const ICONS={"board":"<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"/><path d=\"M3 10h18M9 4v16\"/>","production":"<path d=\"m8 4 12 8-12 8z\"/>","assets":"<path d=\"M3 7h7l2-3h9v16H3z\"/>","overview":"<path d=\"M4 20V10m8 10V4m8 16v-7\"/>","Blender":"<path d=\"m3 4 8 5M2 9h10M5 18l6-6\"/><ellipse cx=\"15\" cy=\"13\" rx=\"6\" ry=\"5\"/><circle cx=\"15\" cy=\"13\" r=\"2\"/>","AI Video":"<rect x=\"3\" y=\"7\" width=\"13\" height=\"13\" rx=\"2\"/><path d=\"m16 11 5-3v11l-5-3M8 2v6M5 5h6\"/>","Editing":"<circle cx=\"6\" cy=\"6\" r=\"3\"/><circle cx=\"6\" cy=\"18\" r=\"3\"/><path d=\"m8 8 13 13M8 16 21 3\"/>","Existing Footage":"<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><path d=\"M7 3v18M17 3v18M3 8h4m-4 8h4m10-8h4m-4 8h4\"/>","Mixed":"<path d=\"m4 4 16 16M4 20l6-6m4-4 6-6M15 4h5v5m-5 11h5v-5\"/>","copy":"<rect x=\"8\" y=\"8\" width=\"13\" height=\"13\" rx=\"2\"/><path d=\"M16 8V3H3v13h5\"/>","expand":"<path d=\"m6 9 6 6 6-6\"/>","close":"<path d=\"m6 6 12 12M6 18 18 6\"/>","add":"<path d=\"M12 4v16M4 12h16\"/>","reset":"<path d=\"M3 10a9 9 0 1 1 2 8M3 4v6h6\"/>","search":"<circle cx=\"10\" cy=\"10\" r=\"6\"/><path d=\"m15 15 6 6\"/>","next":"<path d=\"M4 12h16m-6-6 6 6-6 6\"/>","import":"<path d=\"M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5\"/>","trash":"<path d=\"M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7\"/>","insert":"<path d=\"M4 4h16v6H4zM12 13v8m-4-4h8\"/>","up":"<path d=\"m6 14 6-6 6 6\"/>","down":"<path d=\"m6 10 6 6 6-6\"/>","spark":"<path d=\"m12 3 3 6 6 3-6 3-3 6-3-6-6-3 6-3z\"/>","started":"<path d=\"m8 4 12 8-12 8z\"/>","modeling":"<path d=\"m12 2 9 5v10l-9 5-9-5V7zM3 7l9 5 9-5M12 12v10\"/>","animation":"<path d=\"m9 4 11 8-11 8zM4 5v14\"/>","rendering":"<rect x=\"3\" y=\"4\" width=\"18\" height=\"14\" rx=\"2\"/><path d=\"M8 22h8m-4-4v4m-5-11 3 3 7-7\"/>","ready":"<path d=\"m4 12 5 5L20 6\"/>"};
const icon=name=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(ICONS[name]||ICONS.assets)+'</svg>';
const action=(name,label,glyph,extra='')=>'<button type="button" class="wb-icon" data-action="'+name+'" title="'+esc(label)+'" aria-label="'+esc(label)+'" '+extra+'>'+icon(glyph)+'</button>';
export function createProductionWorkbench(root,{getProject,onChange,onFocus,copyText,onCopyBrief,onSplitScript}){
 let tab='Storyboard',workspace='All',groupBy='project',assetFilter='All',completionFilter='All',searchQuery='',active='',pending=[],mapping=[],importTable=null,scriptChanges=null,dragId='',activeAsset='',expandAll=false,viewMode='focused',expandedScene='',sidebarCollapsed=false,editorPane='plan',promptKey='blenderPrompt';
 root.classList.add('production-workbench');
 root.innerHTML='<div class="wb-commandbar"><nav class="wb-tabs" aria-label="Project areas">'+['Storyboard','Production','Assets','Overview'].map((name,index)=>'<button type="button" data-tab="'+name+'" title="'+name+'" aria-label="'+name+'">'+icon(['board','production','assets','overview'][index])+'<span>'+name+'</span></button>').join('')+'</nav><div data-command-actions></div></div><div class="wb-status" role="status" aria-live="polite"></div><div data-workbench></div>';
 const panel=root.querySelector('[data-workbench]'),message=text=>root.querySelector('.wb-status').textContent=text;
 const project=()=>getProject();
 const scenes=()=>project()?.scenes||[];
 const changed=(rerender=true)=>{onChange();if(rerender)render();};
 const findScene=id=>scenes().find(scene=>scene.id===id);
 function field(label,key,value,extra=''){
  return '<label>'+esc(label)+'<textarea rows="1" data-field="'+key+'" '+extra+'>'+esc(value)+'</textarea></label>';
 }
 function groupsSelect(scene){
  return '<label>Project<select data-field="animationGroupId"><option value="">Independent</option>'+(project().animationGroups||[]).map(group=>'<option value="'+esc(group.id)+'" '+(group.id===scene.animationGroupId?'selected':'')+'>'+esc(group.name)+'</option>').join('')+'</select></label>';
 }
 function methodTags(scene){
  return '<div class="wb-methods" aria-label="Production methods">'+METHODS.map(method=>'<label title="'+esc(method)+'"><input type="checkbox" aria-label="'+esc(method)+'" data-method="'+method+'" '+(methodsOf(scene).includes(method)?'checked':'')+'>'+icon(method)+'<span class="wb-sr">'+esc(method)+'</span></label>').join('')+'</div>';
 }
 function sceneStatus(scene){
  const state=sceneState(project(),scene);
  return '<label class="wb-scene-state"><span class="wb-sr">Scene completion</span><select aria-label="Scene completion" title="Scene completion" data-field="sceneState">'+options(['Planned','Assets Ready','Editing','Completed'],state)+'</select></label>';
 }
 function stageControls(scene,method){
  const task=taskFor(project(),scene,method);
  return '<section class="wb-stage"><strong>'+icon(method)+'<span>'+esc(method)+'</span><small>'+animationStage(task)+'</small></strong><div class="wb-actions">'+
   (method==='Blender'?[['started','Start'],['modeling','Model'],['animation','Animate'],['rendering','Render'],['ready','Ready']]:[['started','Start'],['ready','Ready']]).map(([key,label])=>'<button type="button" data-task="'+key+'" data-task-method="'+method+'" title="'+esc(method+' · '+label)+'" aria-pressed="'+!!task[key]+'">'+icon(key)+'<span>'+label+'</span></button>').join('')+'</div></section>';
 }
 function promptFields(scene,focused){
  const fields=[['blenderPrompt','Blender prompt'],['imagePrompt','Image prompt'],['videoPrompt','Video prompt'],['camera','Camera'],['characterPrompt','Character'],['technicalNotes','Notes'],['assetReferences','References']];
  return (focused?'<div class="wb-prompt-toolbar"><label><span class="wb-sr">Prompt type</span><select data-prompt-key aria-label="Prompt type">'+fields.map(([key,label])=>'<option value="'+key+'" '+(key===promptKey?'selected':'')+'>'+label+'</option>').join('')+'</select></label>'+action('copy-field','Copy this prompt','copy')+'</div>':action('copy','Copy prompt','copy'))+
   '<div class="wb-prompt-fields">'+fields.map(([key,label])=>'<div '+(focused&&key!==promptKey?'hidden':'')+'>'+field(label,key,scene[key]||'')+'</div>').join('')+'</div>';
 }
 function details(scene,focused=false){
  const group=groupFor(project(),scene),inView=METHODS.includes(workspace)?methodsOf(scene).filter(method=>method===workspace):methodsOf(scene);
  return '<div class="wb-details"><section class="wb-pane" data-pane="prompts" '+(focused&&editorPane!=='prompts'?'hidden':'')+'>'+
   (methodsOf(scene).includes('Blender')||group||scene.blenderFile?'<div class="wb-detail-grid">'+groupsSelect(scene)+field('Blender file','blenderFile',scene.blenderFile)+'</div>':'')+promptFields(scene,focused)+
   (group?'<p>Shared project: '+esc(group.name)+' · '+esc(group.blenderFile||'No file reference yet')+'</p>':'')+
   '</section><section class="wb-pane" data-pane="progress" '+(focused&&editorPane!=='progress'?'hidden':'')+'><section class="wb-progress-controls"><h4>Progress</h4>'+inView.filter(method=>method!=='Editing').map(method=>stageControls(scene,method)).join('')+
   '<div class="wb-actions"><label><input type="checkbox" data-check="voiceoverReady" '+(scene.voiceoverReady?'checked':'')+'>Voiceover</label><label><input type="checkbox" data-check="editingDone" '+(scene.editingDone?'checked':'')+'>Edited</label></div></section>'+
   (!scene.productionMethods?'<section class="wb-stage"><strong>Existing generated assets</strong><div class="wb-actions">'+[['characterDone','Character ready'],['imageDone','Image ready'],['videoDone','Video ready']].map(([key,label])=>'<label><input type="checkbox" data-check="'+key+'" '+(scene[key]?'checked':'')+'>'+label+'</label>').join('')+'</div><div class="wb-detail-grid">'+[['characterAssetUrl','Character link'],['imageAssetUrl','Image link'],['videoAssetUrl','Video link']].map(([key,label])=>field(label,key,scene[key]||'')).join('')+'</div></section>':'')+
   '<div class="wb-checklist">'+(scene.checklist||[]).map((item,index)=>'<label><input type="checkbox" data-checklist="'+index+'" '+(item.done?'checked':'')+'>'+esc(item.text)+'<button type="button" data-remove-check="'+index+'" aria-label="Remove checklist item">×</button></label>').join('')+'<div class="wb-actions"><input data-new-check placeholder="New task"><button type="button" data-action="add-check">Add</button></div></div>'+
   '<div class="wb-actions wb-scene-actions">'+action('up','Move scene up','up')+action('down','Move scene down','down')+action('draft','Draft blank prompts','spark') + (onFocus?'<button type="button" data-action="focus">Focused prompt editor</button>':'') + action('insert','Insert scene below','insert')+'</div></section></div>';
 }
 function visibleScenes(){return filterScenes(project(),{method:workspace,assetStatus:assetFilter,completion:completionFilter,query:searchQuery});}
 function filterBar(){
  const select=(label,attr,values,current)=>'<label title="'+label+'"><span class="wb-sr">'+label+'</span><select aria-label="'+label+'" '+attr+'>'+values.map(value=>'<option value="'+esc(value)+'" '+(value===current?'selected':'')+'>'+esc(value==='All'?'All '+label.toLowerCase():value)+'</option>').join('')+'</select></label>';
  return '<div class="wb-filters">'+select('Methods','data-filter-method',['All',...METHODS,'Assets'],workspace)+
   select('Assets','data-filter-assets',['All','Not Started','In Progress','Modeling','Animating','Rendering','Ready'],assetFilter)+
   select('Scenes','data-filter-completion',['All','Planned','Assets Ready','Editing','Completed'],completionFilter)+
   (tab==='Production'?'<label title="Group by"><span class="wb-sr">Group by</span><select data-group-by aria-label="Group by">'+[['project','By project'],['scene','By scene'],['status','By status']].map(([value,label])=>'<option value="'+value+'" '+(value===groupBy?'selected':'')+'>'+label+'</option>').join('')+'</select></label>':'')+
   '<label class="wb-search">'+icon('search')+'<input type="search" aria-label="Search scenes" data-filter-search value="'+esc(searchQuery)+'" placeholder="Search"></label>'+
   action('clear-filters','Reset filters','reset')+'<span data-filter-count>'+visibleScenes().length+'/'+scenes().length+'</span></div>';
 }
 function currentScene(){const visible=visibleScenes();return visible.find(scene=>scene.id===active)||visible[0];}
 function sceneRow(scene,index,focused=false){
  const open=focused||expandAll||expandedScene===scene.id;
  return '<article class="wb-scene '+(tab==='Production'?'wb-production-card':'')+(open?' is-open':'')+'" data-scene="'+esc(scene.id)+'">'+
   '<header class="wb-scene-controls"><div class="wb-number">'+(!focused?'<button type="button" draggable="true" data-drag="'+esc(scene.id)+'" aria-label="Drag scene '+(index+1)+'">⠿</button>':'')+'<strong>'+String(index+1).padStart(2,'0')+'</strong></div>'+
   '<label class="wb-timing"><span class="wb-sr">Timeline</span><input aria-label="Timeline" data-field="timing" value="'+esc(scene.timeline||scene.duration+' sec')+'"></label>'+
   methodTags(scene)+sceneStatus(scene)+
   action('duplicate','Duplicate scene','copy')+action('remove','Delete scene','trash')+
   (!focused?action('expand',open?'Collapse scene':'Expand scene',open?'close':'expand','aria-expanded="'+open+'"'):'')+'</header>'+
   (!open?'<button type="button" class="wb-scene-preview" data-select-scene="'+esc(scene.id)+'" title="Open scene">'+esc(scene.voiceover||'Untitled scene')+'</button>':'')+
   (focused?'<div class="wb-editor-tabs" role="tablist" aria-label="Scene sections">'+[['plan','Plan'],['prompts','Prompts'],['progress','Progress']].map(([key,label])=>'<button type="button" role="tab" data-editor-pane="'+key+'" aria-selected="'+(editorPane===key)+'">'+label+'</button>').join('')+'</div>':'')+
   '<div class="wb-scene-content" '+(!open?'hidden':'')+'><section class="wb-pane" data-pane="plan" '+(focused&&editorPane!=='plan'?'hidden':'')+'><div class="wb-writing">'+field('Voiceover','voiceover',scene.voiceover)+field('Visual / Animation','visual',scene.visual)+field('Assets Required','assets',scene.assets)+'</div>'+
   '</section>'+details(scene,focused)+'</div></article>';
 }
 function queueBuckets(queue){
  const buckets=new Map();
  for(const scene of queue){
   const group=groupFor(project(),scene),key=groupBy==='status'?productionStatus(scene):groupBy==='scene'?scene.id:group?.id||'ungrouped';
   if(!buckets.has(key))buckets.set(key,{label:groupBy==='status'?key:groupBy==='scene'?'Scene '+(scenes().indexOf(scene)+1):group?.name||'Independent',scenes:[]});
   buckets.get(key).scenes.push(scene);
  }
  return [...buckets.values()];
 }
 function navigatorEntry(scene){
  const index=scenes().indexOf(scene),selected=currentScene()?.id===scene.id,state=sceneState(project(),scene)==='Completed'?'completed':productionStatus(scene)!=='Not Started'||sceneState(project(),scene)!=='Planned'||scene.voiceoverReady?'progress':'planned';
  const label='Scene '+(index+1)+' · '+(state==='completed'?'Completed':state==='progress'?'In progress':'Planned');
  return '<div class="wb-nav-entry" data-nav-scene="'+esc(scene.id)+'"><button type="button" draggable="true" data-drag="'+esc(scene.id)+'" data-select-scene="'+esc(scene.id)+'" data-scene-status="'+state+'" title="'+label+'" aria-label="'+label+'" aria-current="'+(selected?'true':'false')+'">'+String(index+1).padStart(2,'0')+'</button></div>';
 }
 function sceneWorkspace(){
  const queue=visibleScenes(),scene=currentScene();
  if(!queue.length)return '<div class="wb-empty">No scenes match.</div>';
  if(viewMode==='all')return '<div class="wb-all-scenes">'+(tab==='Production'?queueBuckets(queue).map(bucket=>'<section class="wb-queue-group"><h3>'+esc(bucket.label)+'</h3>'+bucket.scenes.map(item=>sceneRow(item,scenes().indexOf(item))).join('')+'</section>').join(''):queue.map(item=>sceneRow(item,scenes().indexOf(item))).join(''))+'</div>';
  const index=queue.indexOf(scene);
  return '<div class="wb-focus-layout '+(sidebarCollapsed?'is-collapsed':'')+'"><aside class="wb-navigator" aria-label="Scene navigator">'+
   '<div class="wb-nav-list">'+
   (tab==='Production'?queueBuckets(queue).map(bucket=>'<div class="wb-nav-group" title="'+esc(bucket.label)+'">'+bucket.scenes.map(navigatorEntry).join('')+'</div>').join(''):queue.map(navigatorEntry).join(''))+'</div></aside>'+
   '<section class="wb-active-editor" aria-label="Active scene editor"><div class="wb-scene-navigation">'+
   action('toggle-sidebar',sidebarCollapsed?'Show scene navigator':'Hide scene navigator','board','aria-expanded="'+!sidebarCollapsed+'"')+
   '<label class="wb-scene-jump"><span class="wb-sr">Select scene</span><select data-scene-jump aria-label="Select scene">'+queue.map(item=>'<option value="'+esc(item.id)+'" '+(item.id===scene.id?'selected':'')+'>Scene '+(scenes().indexOf(item)+1)+'</option>').join('')+'</select></label><span>'+(index+1)+' / '+queue.length+'</span>'+
   action('previous-scene','Previous scene','up',index===0?'disabled':'')+action('next-scene','Next scene','down',index===queue.length-1?'disabled':'')+'</div>'+
   sceneRow(scene,scenes().indexOf(scene),true)+'</section></div>';
 }
 function productionStatus(scene){
  if(sceneState(project(),scene)==='Completed')return 'Completed';
  const tasks=methodsOf(scene).filter(method=>method!=='Editing').map(method=>taskFor(project(),scene,method));
  if(tasks.length&&tasks.every(task=>task.ready||task.rendering))return 'Rendered';
  return tasks.some(task=>Object.values(task).some(Boolean))?'In Progress':'Not Started';
 }
 function modeControls(){
  return '<button type="button" data-action="view-mode" title="'+(viewMode==='focused'?'View all scenes':'Focus selected scene')+'">'+icon(viewMode==='focused'?'board':'production')+'<span>'+(viewMode==='focused'?'All scenes':'Focus')+'</span></button>'+
   (viewMode==='all'?action('expand-all',expandAll?'Collapse all scenes':'Expand all filtered scenes','expand','aria-pressed="'+expandAll+'"'):'');
 }
 function storyboard(){
  return '<div class="wb-toolbar"><details class="wb-import" '+(!scenes().length?'open':'')+'><summary>'+icon('import')+'<span>Import</span></summary><div class="wb-import-body"><textarea aria-label="Paste storyboard" data-paste rows="3" placeholder="Paste TSV, Markdown or narration"></textarea><button type="button" data-action="preview">Preview</button><div data-import-preview></div></div></details>'+modeControls()+action('add','Add scene','add')+'</div>'+
   filterBar()+sceneWorkspace();
 }
 function groupEditor(group){
  return '<section class="wb-group" data-group="'+esc(group.id)+'"><div class="wb-detail-grid"><label>Project name<input data-group-field="name" value="'+esc(group.name)+'"></label><label>Blender file<input data-group-field="blenderFile" value="'+esc(group.blenderFile||'')+'"></label>'+
   field('Resources','resources',group.resources||'','data-group-field="resources"')+'</div></section>';
 }
 function production(){
  return '<div class="wb-toolbar"><details class="wb-group-create"><summary>'+icon('assets')+'<span>Projects</span></summary><div class="wb-group-body"><div class="wb-actions"><input data-new-group placeholder="Project name"><button type="button" data-action="add-group">Create</button></div>'+(project().animationGroups||[]).map(groupEditor).join('')+'</div></details>'+modeControls()+action('next','Next pending scene','next')+'</div>'+
   filterBar()+sceneWorkspace();
 }
 function assetEditor(asset){
  return '<details class="wb-asset" data-asset="'+esc(asset.id)+'" '+(activeAsset===asset.id?'open':'')+'><summary><strong>'+esc(asset.name)+'</strong><span>'+esc(asset.type)+' · '+esc(asset.status)+'</span></summary><div class="wb-detail-grid"><label>Name<input data-asset-field="name" value="'+esc(asset.name)+'"></label><label>Type<select data-asset-field="type">'+options(['Blender file','Video','Image','Audio','Reference','Model','Other'],asset.type)+'</select></label><label>Path / URL<input data-asset-field="path" value="'+esc(asset.path||'')+'"></label><label>Status<select data-asset-field="status">'+options(['Not Started','In Progress','Ready'],asset.status)+'</select></label>'+field('Notes','notes',asset.notes||'','data-asset-field="notes"')+'</div><div class="wb-associations"><strong>Scenes</strong>'+scenes().map((scene,index)=>'<label><input type="checkbox" data-associate-scene="'+esc(scene.id)+'" '+((asset.sceneIds||[]).includes(scene.id)?'checked':'')+'>Scene '+(index+1)+'</label>').join('')+'<strong>Animation groups</strong>'+(project().animationGroups||[]).map(group=>'<label><input type="checkbox" data-associate-group="'+esc(group.id)+'" '+((asset.groupIds||[]).includes(group.id)?'checked':'')+'>'+esc(group.name)+'</label>').join('')+'</div><div class="wb-actions"><button type="button" data-copy-path>Copy path</button>'+'<span data-asset-open-reference>'+(/^https?:\/\//i.test(asset.path||'')?'<a href="'+esc(asset.path)+'" target="_blank" rel="noopener noreferrer">Open URL ↗</a>':'Local reference')+'</span><button type="button" data-delete-asset>Remove</button></div></details>';
 }
 function assets(){
  const legacy=scenes().flatMap((scene,index)=>['characterAssetUrl','imageAssetUrl','videoAssetUrl'].filter(key=>scene[key]).map(key=>'<li>Scene '+(index+1)+' · '+esc(key)+': '+esc(scene[key])+'</li>'));
  return '<div class="wb-toolbar"><span>Assets</span>'+action('add-asset','Add asset','add')+'</div>'+
   (project().assets||[]).map(assetEditor).join('')+(legacy.length?'<details><summary>Existing scene asset links</summary><ul>'+legacy.join('')+'</ul></details>':'');
 }
 function overview(){
  const progress=projectProgress(project()),script=canonicalScript(project());
  return '<div class="wb-heading"><span>'+progress+'%</span></div><progress max="100" value="'+progress+'"></progress>'+
   '<div class="wb-overview">'+[['All','Scenes',scenes().length],['Ready','Assets ready',scenes().filter(scene=>productionReadiness(project(),scene)==='Ready').length],['Editing','Editing',scenes().filter(scene=>sceneState(project(),scene)==='Editing').length],['Completed','Completed',scenes().filter(scene=>sceneState(project(),scene)==='Completed').length]].map(([value,label,count])=>'<button type="button" data-overview-filter="'+value+'"><strong>'+count+'</strong><span>'+label+'</span></button>').join('')+'</div>'+
   '<div class="wb-pending-list">'+scenes().filter(scene=>sceneState(project(),scene)!=='Completed').slice(0,5).map(scene=>'<button type="button" data-open-scene="'+esc(scene.id)+'"><strong>Scene '+(scenes().indexOf(scene)+1)+'</strong><span>'+esc(scene.voiceover||'Untitled scene')+'</span><small>'+sceneState(project(),scene)+'</small></button>').join('')+'</div>'+
   '<details class="wb-visual-settings"><summary>Visual settings</summary><div class="wb-detail-grid">'+
   field('Visual style','visualStyle',project().visualStyle||'','data-project-field="visualStyle"')+
   '<label>Aspect ratio<select data-project-field="aspectRatio">'+options(['9:16','16:9','1:1'],project().aspectRatio||'9:16')+'</select></label>'+
   field('Language','language',project().language||'','data-project-field="language"')+
   field('Character bible','characterBible',project().characterBible||'','data-project-field="characterBible"')+
   field('Continuity and location notes','continuityNotes',project().continuityNotes||'','data-project-field="continuityNotes"')+'</div>'+
   (onCopyBrief?'<button type="button" data-action="copy-brief">Copy brief</button>':'')+'</details>'+
   '<details><summary>Notes</summary>'+field('Hook','hook',project().hook||'','data-project-field="hook"')+field('Project notes','notes',project().notes||'','data-project-field="notes"')+'</details>'+
   '<details class="wb-script"><summary>Script</summary><p>Review changes before syncing. One paragraph per scene.</p><label>Scene script<pre data-canonical-script>'+esc(script)+'</pre></label><button type="button" data-action="copy-script">Copy chronological script</button><label>Script draft<textarea rows="2" data-script-draft>'+esc(project().script||script)+'</textarea></label><div class="wb-actions"><button type="button" data-action="script-from-scenes">Scenes → draft</button><button type="button" data-action="review-script">Draft → scenes</button></div><div data-script-review></div>'+(onSplitScript?'<button type="button" data-action="split-script">Split draft</button>':'')+'</details>';
 }
 function sizeEditors(){
  root.querySelectorAll('.wb-scene.is-open textarea').forEach(input=>{
   if(!input.getClientRects().length)return;
   input.style.height='auto';
   input.style.height=Math.max(input.closest('.wb-writing')?56:44,input.scrollHeight+2)+'px';
  });
 }
 let lastWidth=0;
 const editorObserver=new ResizeObserver(()=>{if(root.clientWidth!==lastWidth){lastWidth=root.clientWidth;sizeEditors();}});
 editorObserver.observe(root);
 function render(){
  if(!project())return;
  const navScroll=root.querySelector('.wb-nav-list')?.scrollTop||0;
  if(!active&&scenes().length)active=scenes()[0].id;
  root.querySelectorAll('[data-tab]').forEach(button=>button.setAttribute('aria-current',button.dataset.tab===tab?'page':'false'));
  panel.innerHTML=tab==='Storyboard'?storyboard():tab==='Production'?production():tab==='Assets'?assets():overview();
  const tools=root.querySelector('[data-command-actions]');tools.replaceChildren();
  const toolbar=panel.querySelector('.wb-toolbar');if(toolbar)tools.append(toolbar);
  document.body.classList.toggle('creator-focus-mode',document.body.classList.contains('project-page')&&!!root.querySelector('.wb-focus-layout'));
  pending=[];scriptChanges=null;sizeEditors();
  const list=root.querySelector('.wb-nav-list'),selected=list?.querySelector('[aria-current=true]');
  if(list&&selected){list.scrollTop=navScroll;const bounds=list.getBoundingClientRect(),item=selected.getBoundingClientRect();if(item.top<bounds.top)list.scrollTop-=bounds.top-item.top;else if(item.bottom>bounds.bottom)list.scrollTop+=item.bottom-bounds.bottom;}
 }
 function preview(){
  try{
   importTable=inspectImport(root.querySelector('[data-paste]').value);mapping=[...importTable.mapping];
   const box=root.querySelector('[data-import-preview]');
   box.innerHTML='<p>'+importTable.format+' · '+importTable.rows.length+' rows. Map columns, then review every scene.</p><div class="wb-mapping">'+importTable.headers.map((header,index)=>'<label>'+esc(header)+'<select data-map="'+index+'"><option value="">Ignore column</option>'+IMPORT_FIELDS.map(key=>'<option value="'+key+'" '+(mapping[index]===key?'selected':'')+'>'+key+'</option>').join('')+'</select></label>').join('')+'</div><button type="button" data-action="map-preview">Review scenes</button><div data-mapped-preview></div>';
   mappedPreview();
  }catch(error){message(error.message);}
 }
 function mappedPreview(){
  pending=[];
  try{
   const parsed=parseProductionImport(root.querySelector('[data-paste]').value,mapping);
   const unique=uniqueScenes(scenes(),parsed);pending=unique.scenes;
   root.querySelector('[data-mapped-preview]').innerHTML='<p>'+pending.length+' new scenes · '+unique.duplicates+' duplicates skipped. Existing scenes stay in place.</p><div class="wb-preview">'+parsed.map((scene,index)=>'<article><strong>Scene '+(index+1)+' · '+esc(scene.timeline||scene.duration+' sec')+'</strong><p>'+esc(scene.voiceover)+'</p><p>'+esc(scene.visual)+'</p><p>'+esc(scene.assets)+'</p><p>'+esc(methodsOf(scene).join(', '))+'</p><p>'+esc(scene.blenderPrompt||scene.videoPrompt||'')+'</p>'+(scene.importedStatus?'<p>Imported status: '+esc(scene.importedStatus)+' (completion requires review)</p>':'')+'</article>').join('')+'</div><button type="button" data-action="import" '+(!pending.length?'disabled':'')+'>Append reviewed scenes</button>';
   message('Preview only. No scenes changed.');
  }catch(error){message(error.message);}
 }
 root.addEventListener('input',event=>{
  if(event.target.matches('.wb-scene.is-open textarea'))sizeEditors();
  const target=event.target,scene=findScene(target.closest('[data-scene]')?.dataset.scene);
  if(target.matches('[data-filter-search]')){
   searchQuery=target.value;const cursor=target.selectionStart;render();const input=root.querySelector('[data-filter-search]');input.focus();input.setSelectionRange(cursor,cursor);return;
  }
  if(target.matches('[data-paste]')){pending=[];const box=root.querySelector('[data-import-preview]');if(box)box.innerHTML='';return;}
  if(target.matches('[data-script-draft]')){project().script=target.value;scriptChanges=null;root.querySelector('[data-script-review]').innerHTML='';changed(false);return;}
  const group=(project().animationGroups||[]).find(item=>item.id===target.closest('[data-group]')?.dataset.group);
  if(group&&target.dataset.groupField){group[target.dataset.groupField]=target.value;changed(false);return;}
  const asset=(project().assets||[]).find(item=>item.id===target.closest('[data-asset]')?.dataset.asset);
  if(asset&&target.dataset.assetField){
   asset[target.dataset.assetField]=target.value;
   if(target.dataset.assetField==='name')target.closest('[data-asset]').querySelector('summary strong').textContent=target.value;
   if(target.dataset.assetField==='path'){
    const link=target.closest('[data-asset]').querySelector('[data-asset-open-reference]');
    if(link)link.innerHTML=/^https?:\/\//i.test(asset.path||'')?'<a href="'+esc(asset.path)+'" target="_blank" rel="noopener noreferrer">Open URL ↗</a>':'Local reference';
   }
   changed(false);return;
  }
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
  if(target.matches('[data-filter-method]')){workspace=target.value;render();return;}
  if(target.matches('[data-filter-assets]')){assetFilter=target.value;render();return;}
  if(target.matches('[data-filter-completion]')){completionFilter=target.value;render();return;}
  if(target.dataset.map!==undefined){mapping[Number(target.dataset.map)]=target.value;pending=[];mappedPreview();return;}
  if(target.matches('[data-scene-jump]')){active=target.value;render();return;}
  if(target.matches('[data-prompt-key]')){promptKey=target.value;render();return;}
  if(target.matches('[data-group-by]')){groupBy=target.value;render();return;}
  const asset=(project().assets||[]).find(item=>item.id===target.closest('[data-asset]')?.dataset.asset);
  if(asset&&target.dataset.assetField){if(target.tagName==='SELECT')changed();return;}
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
   if(button.dataset.overviewFilter){
    tab='Production';workspace='All';assetFilter=button.dataset.overviewFilter==='Ready'?'Ready':'All';completionFilter=['Editing','Completed'].includes(button.dataset.overviewFilter)?button.dataset.overviewFilter:'All';searchQuery='';render();return;
   }
   if(button.dataset.openScene){viewMode='focused';expandAll=false;tab='Production';workspace='All';assetFilter='All';completionFilter='All';searchQuery='';active=button.dataset.openScene;render();return;}
   if(button.dataset.editorPane){editorPane=button.dataset.editorPane;render();return;}
   if(button.dataset.selectScene){active=button.dataset.selectScene;viewMode='focused';expandAll=false;render();return;}
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
   if(action==='view-mode'){viewMode=viewMode==='focused'?'all':'focused';expandAll=false;expandedScene='';render();return;}
   if(action==='toggle-sidebar'){sidebarCollapsed=!sidebarCollapsed;render();return;}
   if(action==='previous-scene'||action==='next-scene'){
    const queue=visibleScenes(),index=queue.indexOf(currentScene()),next=queue[index+(action==='next-scene'?1:-1)];
    if(next){active=next.id;render();}return;
   }
   if(action==='expand-all'){expandAll=!expandAll;expandedScene='';render();return;}
   if(action==='clear-filters'){workspace='All';assetFilter='All';completionFilter='All';searchQuery='';render();return;}
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
   if(action==='add'){viewMode='focused';expandAll=false;const item=makeScene({productionMethods:[],sceneState:'Planned'});project().scenes.push(item);active=item.id;changed();return;}
   if(action==='add-group'){const name=root.querySelector('[data-new-group]').value.trim();if(!name)return;project().animationGroups||=[];project().animationGroups.push({id:uid(),name,blenderFile:'',resources:'',production:{}});changed();return;}
   if(action==='add-asset'){project().assets||=[];activeAsset=uid();project().assets.push({id:activeAsset,name:'Untitled asset',type:'Reference',path:'',status:'Not Started',sceneIds:[],groupIds:[],notes:''});changed();return;}
   if(action==='next'){
    viewMode='focused';expandAll=false;const next=visibleScenes().find(item=>workspace==='Editing'?!item.editingDone:workspace==='All'||workspace==='Assets'?sceneState(project(),item)!=='Completed':!taskFor(project(),item,workspace).ready);
    if(!next){message('No pending scenes in this workspace.');return;}active=next.id;render();root.querySelector('[data-scene="'+CSS.escape(next.id)+'"]')?.scrollIntoView({block:'nearest'});return;
   }
   if(action==='copy-brief'&&onCopyBrief){await onCopyBrief();message('Generator brief copied.');return;}
   if(action==='split-script'&&onSplitScript){onSplitScript();return;}
   if(action==='copy-script'){await copyText(canonicalScript(project()));message('Chronological script copied.');return;}
   if(action==='script-from-scenes'){
    scriptChanges={direction:'from',before:project().script||'',after:canonicalScript(project())};
    root.querySelector('[data-script-review]').innerHTML='<h3>Review full-script replacement</h3><p>Current draft</p><pre>'+esc(scriptChanges.before)+'</pre><p>Scene narration</p><pre>'+esc(scriptChanges.after)+'</pre><button type="button" data-action="apply-script">Replace full-script draft</button>';return;
   }
   if(action==='review-script'){
    scriptChanges={direction:'to',rows:scriptReview(project(),root.querySelector('[data-script-draft]').value)};
    root.querySelector('[data-script-review]').innerHTML=scriptChanges.rows.map((row,i)=>'<article><strong>Scene '+(i+1)+(row.changed?' · Changed':' · Unchanged')+'</strong><del>'+esc(row.before)+'</del><ins>'+esc(row.after)+'</ins></article>').join('')+'<button type="button" data-action="apply-script">Apply reviewed narration changes</button>';return;
   }
   if(action==='apply-script'&&scriptChanges){
    if(scriptChanges.direction==='from')project().script=scriptChanges.after;
    else for(const row of scriptChanges.rows)if(row.changed){const item=findScene(row.id);if(item.voiceover!==row.before)throw Error('Scene narration changed since review. Review again.');}
    if(scriptChanges.direction==='to')for(const row of scriptChanges.rows)if(row.changed){const item=findScene(row.id);item.voiceover=row.after;item.voiceoverReady=false;item.completed=false;}
    changed();message('Reviewed script changes applied.');return;
   }
   if(!scene)return;
   if(action==='expand'){expandedScene=expandAll||expandedScene!==scene.id?scene.id:'';if(expandedScene)active=scene.id;expandAll=false;render();return;}
   if(action==='copy-field'){await copyText(scene[promptKey]||'');message('Prompt copied.');return;}
   if(action==='copy'){await copyText(workspace==='AI Video'?(scene.videoPrompt||scene.imagePrompt||scene.visual||''):scene.blenderPrompt||scene.videoPrompt||scene.imagePrompt||scene.visual||'');message('Prompt copied.');return;}
   if(action==='draft'){
    const settings=project(),style=settings.visualStyle||'cinematic documentary',ratio=settings.aspectRatio||'9:16';
    if(!scene.characterPrompt?.trim())scene.characterPrompt=settings.characterBible||'';
    if(!scene.imagePrompt?.trim())scene.imagePrompt='Create a '+ratio+' '+style+' image. Narration: '+scene.voiceover+'. Visual: '+scene.visual+'. Assets: '+scene.assets+'. '+(settings.characterBible||'')+' '+(settings.continuityNotes||'')+' No captions or watermark.';
    if(!scene.videoPrompt?.trim())scene.videoPrompt='Animate for '+scene.duration+' seconds. '+scene.visual+'. '+(scene.camera||'Controlled camera movement.')+' '+(settings.continuityNotes||'')+' Preserve subject identity and visual continuity.';
    changed();message('Filled blank prompts from the scene plan.');return;
   }
   if(action==='focus'){onFocus(scene.id);return;}
   if(action==='add-check'){const text=button.closest('[data-scene]').querySelector('[data-new-check]').value.trim();if(!text)return;scene.checklist||=[];scene.checklist.push({id:uid(),text,done:false});scene.completed=false;}
   if(action==='duplicate'){expandAll=false;const copy=makeScene({...JSON.parse(JSON.stringify(scene)),id:uid(),completed:false,sceneState:'Planned',voiceoverReady:false,editingDone:false,checklist:(scene.checklist||[]).map(item=>({...item,id:uid(),done:false})),production:{}});project().scenes.splice(index+1,0,copy);active=copy.id;expandedScene=copy.id;}
   if(action==='insert'){expandAll=false;const item=makeScene({productionMethods:[],sceneState:'Planned'});project().scenes.splice(index+1,0,item);active=item.id;expandedScene=item.id;}
   if(action==='remove'){if(!confirm('Delete this scene and its production notes?'))return;const next=visibleScenes()[visibleScenes().indexOf(scene)+1]||visibleScenes()[visibleScenes().indexOf(scene)-1];project().scenes.splice(index,1);if(active===scene.id)active=next?.id||'';for(const asset of project().assets||[])asset.sceneIds=(asset.sceneIds||[]).filter(id=>id!==scene.id);}
   if(action==='up'||action==='down'){const next=index+(action==='up'?-1:1);if(next<0||next>=scenes().length)return;[project().scenes[index],project().scenes[next]]=[project().scenes[next],project().scenes[index]];}
   changed();
  }catch(error){message(error.message);}
 });
 root.addEventListener('toggle',event=>{if(event.target.open)sizeEditors();if(event.target.matches('.wb-asset')){if(event.target.open)activeAsset=event.target.dataset.asset;else if(activeAsset===event.target.dataset.asset)activeAsset='';}},true);
 root.addEventListener('keydown',event=>{if(event.key==='Enter'&&event.target.matches('input,select'))event.preventDefault();});
 root.addEventListener('dragstart',event=>{const handle=event.target.closest('[data-drag]');if(!handle)return;dragId=handle.dataset.drag;event.dataTransfer.setData('text/plain',dragId);event.dataTransfer.effectAllowed='move';});
 root.addEventListener('dragover',event=>{if(dragId&&event.target.closest('[data-scene],[data-nav-scene]'))event.preventDefault();});
 root.addEventListener('drop',event=>{event.preventDefault();dragId=event.dataTransfer?.getData('text/plain')||dragId;const target=event.target.closest('[data-scene],[data-nav-scene]'),id=target?.dataset.scene||target?.dataset.navScene;if(!dragId||!id||id===dragId)return;const from=scenes().findIndex(scene=>scene.id===dragId),to=scenes().findIndex(scene=>scene.id===id);if(from<0||to<0)return;const [item]=project().scenes.splice(from,1);project().scenes.splice(to,0,item);dragId='';changed();});
 root.addEventListener('dragend',()=>dragId='');
 return {render,open({area='Production',method,sceneId}={}){tab=area;viewMode='focused';expandAll=false;if(method)workspace=method;active=sceneId||'';render();if(active)root.querySelector('[data-scene="'+CSS.escape(active)+'"]')?.scrollIntoView({block:'nearest'});},reset(){tab="Storyboard";workspace="All";assetFilter="All";completionFilter="All";searchQuery="";groupBy="project";active="";activeAsset="";expandAll=false;viewMode="focused";expandedScene="";editorPane="plan";promptKey="blenderPrompt";message("");render();}};
}
