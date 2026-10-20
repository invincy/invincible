import{auth,db,authReady,observeAuth,storageError}from"../shared/firebase-client.js";
import{doc,getDoc,onSnapshot,setDoc,serverTimestamp}from"https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import{PRODUCTION_METHODS,WORKFLOW_STATES,SCENE_STATES,IMPORT_FIELDS,buildCanonicalScript,findDuplicates,inspectImport,makeProductionScene,mapHeaders,normalizeMethods,parseProductionStoryboard,projectProgress}from"./production-model.js?v=1";

const $=id=>document.getElementById(id),projectId=new URLSearchParams(location.search).get("id");
let user=null,project=null,projectRef=null,saveTimer=null,saveChain=Promise.resolve(),localDirty=false,cloudVersion=0;
let activeView="storyboard",methodFilter="All",groupMode="animation",pendingImport=null,dragSceneId="",inspectorSceneId="";
const esc=value=>String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
const attr=value=>esc(value).replace(/\n/g,"&#10;");
const uid=prefix=>(prefix||"id")+"-"+Date.now()+"-"+Math.random().toString(36).slice(2);
function status(message,type=""){$("status").textContent=message;$("status").className="sync-status "+type;$("saveState").textContent=message}
function draftKey(){return "invincible.creatorWorkbench."+user.uid+"."+projectId}
function copyProject(value){if(Array.isArray(value))return value.map(copyProject);if(value&&Object.getPrototypeOf(value)===Object.prototype)return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,copyProject(v)]));return value}
function normalizeProject(data={}){
 return {...data,id:projectId,scenes:(data.scenes||[]).map(makeProductionScene),assets:Array.isArray(data.assets)?data.assets:[],animationGroups:Array.isArray(data.animationGroups)?data.animationGroups:[],projectNotes:data.projectNotes||"",script:data.script||"",productionSchemaVersion:2};
}
function keepDraft(){try{localStorage.setItem(draftKey(),JSON.stringify({project,baseUpdatedAt:cloudVersion}))}catch{}}
async function save(){
 if(!projectRef||!project||!user)return false;
 clearTimeout(saveTimer);saveTimer=null;localDirty=true;const payload=copyProject(project);keepDraft();status("Saving…");
 const job=saveChain.then(async()=>{try{await setDoc(projectRef,{...payload,productionSchemaVersion:2,updatedAt:serverTimestamp()},{merge:true});localDirty=false;localStorage.removeItem(draftKey());status("Saved to Firebase","ok");return true}catch(error){status(storageError(error)+" Draft kept on this device.","error");return false}});
 saveChain=job;return job;
}
function queueSave(){clearTimeout(saveTimer);localDirty=true;keepDraft();status("Unsaved changes…");saveTimer=setTimeout(save,650)}
async function copyText(value){try{await navigator.clipboard.writeText(value)}catch{const area=document.createElement("textarea");area.value=value;area.style.position="fixed";area.style.opacity="0";document.body.append(area);area.select();document.execCommand("copy");area.remove()}}
function sceneNumber(scene){return project.scenes.indexOf(scene)+1}
function groupFor(scene){return project.animationGroups.find(group=>group.id===scene.animationGroupId)}
function displayTimeline(scene){return scene.timeline||((scene.duration||0)+"s")}
function relevantMethods(scene){return normalizeMethods(scene.productionMethods)}
function scriptDifferent(){const canonical=buildCanonicalScript(project.scenes);return !!project.script.trim()&&canonical.trim()!==project.script.trim()}
function setSceneStatus(scene,value){scene.sceneStatus=value;scene.completed=value==="Completed";queueSave()}
function setWorkflow(scene,method,value){scene.workflowProgress={...scene.workflowProgress,[method]:value};queueSave()}

function renderHeader(){
 const progress=projectProgress(project),seconds=project.scenes.reduce((sum,scene)=>sum+Number(scene.duration||0),0);
 $("projectTitle").textContent=project.title||"Untitled project";document.title=(project.title||"Creator Studio")+" · Invincible";
 $("sceneCount").textContent=project.scenes.length;$("runtime").textContent=seconds+"s";$("projectProgress").textContent=progress+"%";$("progressRing").style.setProperty("--progress",(progress*3.6)+"deg");
 const owner=project.ownerUid===user.uid,editors=project.editorEmails||[];$("shareProject").hidden=!owner;
 $("accessLabel").textContent=owner?(editors.length?"Shared with "+editors.length+" editor"+(editors.length===1?"":"s"):"Private project"):"Shared with you";
}
function metric(value,label){return '<div class="metric"><strong>'+value+'</strong><span>'+label+'</span></div>'}
function renderOverview(){
 const scenes=project.scenes,complete=scenes.filter(scene=>scene.sceneStatus==="Completed").length,unassigned=scenes.filter(scene=>!relevantMethods(scene).length).length,blender=scenes.filter(scene=>relevantMethods(scene).includes("Blender")&&scene.workflowProgress.Blender!=="Ready").length,editing=scenes.filter(scene=>relevantMethods(scene).includes("Editing")&&scene.workflowProgress.Editing!=="Ready").length;
 $("overviewMetrics").innerHTML=metric(projectProgress(project)+"%","weighted progress")+metric(complete+"/"+scenes.length,"scenes completed")+metric(blender,"Blender items open")+metric(editing,"editing items open");
 const actions=[];if(unassigned)actions.push([unassigned+" scenes need a production method","Open Storyboard"]);if(blender)actions.push([blender+" Blender scenes are not ready","Open Blender workspace"]);if(editing)actions.push([editing+" editing scenes remain","Open Editing workspace"]);if(!actions.length&&scenes.length)actions.push(["Production queue is clear","Review completed scenes"]);
 $("nextActions").innerHTML=actions.map(item=>'<div class="next-action"><span>'+esc(item[0])+'</span><strong>'+esc(item[1])+'</strong></div>').join("")||'<div class="empty-state">Add scenes to start tracking production.</div>';
 $("fullScript").value=project.script||"";$("scriptSyncNotice").hidden=!scriptDifferent();
 $("visualStyle").value=project.visualStyle||"";$("aspectRatio").value=project.aspectRatio||"9:16";$("language").value=project.language||"";$("characterBible").value=project.characterBible||"";$("continuityNotes").value=project.continuityNotes||"";$("projectNotes").value=project.projectNotes||"";
}
function methodButtons(scene){
 return PRODUCTION_METHODS.map(method=>'<button type="button" class="method-toggle '+(scene.productionMethods.includes(method)?"active":"")+'" data-toggle-method="'+attr(method)+'">'+esc(method)+'</button>').join("");
}
function statusOptions(value){return SCENE_STATES.map(state=>'<option '+(state===value?"selected":"")+'>'+state+'</option>').join("")}
function groupOptions(value){return '<option value="">No animation group</option>'+project.animationGroups.map(group=>'<option value="'+attr(group.id)+'" '+(group.id===value?"selected":"")+'>'+esc(group.name)+'</option>').join("")}
function renderStoryboard(){
 const list=$("storyboardList");$("storyboardEmpty").hidden=!!project.scenes.length;
 list.innerHTML=project.scenes.map((scene,index)=>'<article class="storyboard-scene" draggable="true" data-scene-id="'+attr(scene.id)+'"><div class="storyboard-row">'+
 '<div class="scene-number"><span class="drag-handle" title="Drag to reorder">⋮⋮</span><strong>'+String(index+1).padStart(2,"0")+'</strong></div>'+
 '<div class="cell-timeline"><input data-scene-field="timeline" value="'+attr(scene.timeline||"")+'" placeholder="'+attr((scene.duration||5)+"s")+'"></div>'+
 '<div class="cell-voiceover"><textarea data-scene-field="voiceover" aria-label="Scene '+(index+1)+' voiceover">'+esc(scene.voiceover)+'</textarea></div>'+
 '<div class="cell-visual"><textarea data-scene-field="visual">'+esc(scene.visual)+'</textarea></div>'+
 '<div class="cell-assets"><textarea data-scene-field="assets">'+esc(scene.assets)+'</textarea></div>'+
 '<div class="cell-method"><div class="method-editor">'+methodButtons(scene)+'</div></div>'+
 '<div class="cell-status"><select data-scene-field="sceneStatus">'+statusOptions(scene.sceneStatus)+'</select></div>'+
 '<button type="button" class="expand-scene" data-expand aria-label="Expand scene">⌄</button></div>'+
 '<div class="storyboard-details" hidden><div class="detail-grid">'+
 '<label>Character / subject prompt<textarea data-scene-field="characterPrompt" rows="3">'+esc(scene.characterPrompt)+'</textarea></label>'+'<label>Camera movement<textarea data-scene-field="cameraMovement" rows="3">'+esc(scene.cameraMovement)+'</textarea></label>'+
 '<label>Animation group<select data-scene-field="animationGroupId">'+groupOptions(scene.animationGroupId)+'</select></label>'+
 '<label>Technical notes<textarea data-scene-field="technicalNotes" rows="3">'+esc(scene.technicalNotes)+'</textarea></label>'+
 '<label>Image-generation prompt<textarea data-scene-field="imagePrompt" rows="4">'+esc(scene.imagePrompt)+'</textarea></label>'+
 '<label>Video-generation prompt<textarea data-scene-field="videoPrompt" rows="4">'+esc(scene.videoPrompt)+'</textarea></label>'+
 '<label>Blender / Codex prompt<textarea data-scene-field="blenderPrompt" rows="5">'+esc(scene.blenderPrompt)+'</textarea></label>'+
 '<div class="scene-actions"><button type="button" class="story-action" data-open-inspector>Production checklist</button><button type="button" class="story-action" data-duplicate>Duplicate</button><button type="button" class="story-action" data-insert>Insert after</button><button type="button" class="story-action danger" data-delete>Delete</button></div>'+
 '</div></div></article>').join("");
}
function previewImport(){
 try{
  const inspected=inspectImport($("importInput").value),mapping=mapHeaders(inspected.headers);pendingImport=parseProductionStoryboard($("importInput").value,{mapping});
  $("mappingPanel").hidden=false;$("detectedFormat").textContent=inspected.format.toUpperCase();
  $("mappingFields").innerHTML=IMPORT_FIELDS.map(([field,label])=>'<label>'+esc(label)+'<select data-map-field="'+field+'"><option value="-1">Not mapped</option>'+inspected.headers.map((header,index)=>'<option value="'+index+'" '+(mapping[field]===index?"selected":"")+'>'+esc(header)+'</option>').join("")+'</select></label>').join("");
  renderImportPreview();
 }catch(error){pendingImport=null;$("mappingPanel").hidden=true;$("importPreview").hidden=true;status(error.message,"error")}
}
function readMapping(){return Object.fromEntries([...$("mappingFields").querySelectorAll("[data-map-field]")].map(select=>[select.dataset.mapField,Number(select.value)]))}
function renderImportPreview(){
 try{pendingImport=parseProductionStoryboard($("importInput").value,{mapping:readMapping()})}catch(error){$("previewMessage").textContent=error.message;$("confirmImport").disabled=true;return}
 const duplicates=findDuplicates(pendingImport.scenes,project.scenes),seconds=pendingImport.scenes.reduce((sum,scene)=>sum+Number(scene.duration||0),0);
 pendingImport.duplicates=duplicates;$("importPreview").hidden=false;$("previewSummary").textContent=pendingImport.scenes.length+" scenes · "+seconds+" seconds";
 $("previewMessage").textContent=duplicates.length?duplicates.length+" duplicate row"+(duplicates.length===1?"":"s")+" detected. Append will skip them.":"No duplicates detected. Review before importing.";
 $("previewScenes").innerHTML=pendingImport.scenes.slice(0,18).map((scene,index)=>'<div class="preview-scene"><strong>'+String(index+1).padStart(2,"0")+'</strong><span>'+esc(displayTimeline(scene))+'</span><div>'+esc(scene.voiceover||"No voiceover")+(duplicates.includes(index)?' <em>duplicate</em>':"")+'</div></div>').join("");
 $("confirmImport").disabled=!pendingImport.scenes.length||duplicates.length===pendingImport.scenes.length;
}
function confirmImport(){
 if(!pendingImport)return;const replace=$("importMode").value==="replace";
 if(replace&&project.scenes.length&&!confirm("Replace the current storyboard? Existing project notes and asset registry will remain, but current scenes will be removed."))return;
 const scenes=replace?pendingImport.scenes:pendingImport.scenes.filter((_,index)=>!pendingImport.duplicates.includes(index));
 project.scenes=replace?scenes:[...project.scenes,...scenes];
 if(!project.script.trim())project.script=buildCanonicalScript(project.scenes);
 $("importInput").value="";$("mappingPanel").hidden=true;$("importPreview").hidden=true;$("importDetails").open=false;pendingImport=null;queueSave();render();
}
function groupKey(scene){
 if(groupMode==="scene")return "Scene "+String(sceneNumber(scene)).padStart(2,"0");
 if(groupMode==="status"){const methods=methodFilter==="All"?relevantMethods(scene):[methodFilter];return methods.map(method=>scene.workflowProgress[method]||scene.sceneStatus).join(" · ")||scene.sceneStatus}
 const group=groupFor(scene);return group?.name||scene.animationGroup||"Ungrouped production";
}
function productionPrompt(scene){
 if(methodFilter==="Blender")return scene.blenderPrompt||scene.visual||scene.voiceover;
 if(methodFilter==="AI Video")return scene.videoPrompt||scene.imagePrompt||scene.visual;
 if(methodFilter==="Editing")return scene.technicalNotes||scene.visual||scene.voiceover;
 return scene.blenderPrompt||scene.videoPrompt||scene.imagePrompt||scene.visual||scene.voiceover;
}
function workflowOptions(value){return WORKFLOW_STATES.map(state=>'<option '+(state===value?"selected":"")+'>'+state+'</option>').join("")}
function renderProductionCard(scene){
 const methods=methodFilter==="All"?relevantMethods(scene):relevantMethods(scene).filter(method=>method===methodFilter);
 const lines=methods.map(method=>'<label class="workflow-line"><span>'+esc(method)+'</span><select data-workflow-method="'+attr(method)+'">'+workflowOptions(scene.workflowProgress[method])+'</select></label>').join("");
 const group=groupFor(scene),prompt=productionPrompt(scene);
 return '<article class="production-card" data-scene-id="'+attr(scene.id)+'"><div class="production-card-head"><strong>SCENE '+String(sceneNumber(scene)).padStart(2,"0")+'</strong><span class="status-chip">'+esc(scene.sceneStatus)+'</span></div><blockquote>'+esc(scene.voiceover||"No voiceover")+'</blockquote><p>'+esc(scene.visual||"No visual direction yet")+'</p><div class="chip-row">'+relevantMethods(scene).map(method=>'<span class="method-chip">'+esc(method)+'</span>').join("")+(group?'<span class="method-chip">'+esc(group.name)+'</span>':"")+'</div>'+lines+'<p><strong>Assets:</strong> '+esc(scene.assets||"Not listed")+'</p><div class="production-actions"><button data-work-action="start">Start working</button>'+(methods.includes("Blender")?'<button data-work-action="model">Model complete</button><button data-work-action="animate">Animation complete</button><button data-work-action="render">Render complete</button>':'')+'<button data-work-action="ready">Mark asset ready</button><button data-work-action="inspect">Details</button><button class="copy" data-work-action="copy" '+(!prompt.trim()?"disabled":"")+'>Copy prompt</button></div></article>';
}
function renderProduction(){
 const scenes=project.scenes.filter(scene=>methodFilter==="All"||relevantMethods(scene).includes(methodFilter));$("productionTitle").textContent=methodFilter==="All"?"All production":methodFilter+" production";
 $("methodFilters").querySelectorAll("button").forEach(button=>button.classList.toggle("active",button.dataset.method===methodFilter));$("groupBy").value=groupMode;
 const grouped=new Map;for(const scene of scenes){const key=groupKey(scene);if(!grouped.has(key))grouped.set(key,[]);grouped.get(key).push(scene)}
 $("productionQueue").innerHTML=[...grouped].map(([name,items])=>'<section class="queue-group"><h3>'+esc(name)+'<span>'+items.length+' scene'+(items.length===1?"":"s")+'</span></h3><div class="queue-cards">'+items.map(renderProductionCard).join("")+'</div></section>').join("")||'<div class="empty-state">No scenes use this production method yet.</div>';
}
function renderAssets(){
 $("assetEmpty").hidden=!!project.assets.length;
 $("assetRegistry").innerHTML=project.assets.map(asset=>'<article class="asset-entry" data-asset-id="'+attr(asset.id)+'"><div class="asset-entry-head"><h3>'+esc(asset.name)+'</h3><span class="status-chip">'+esc(asset.status||"Planned")+'</span></div><p>'+esc(asset.type||"Asset")+'</p><p>'+esc(asset.location||"No path or URL")+'</p><p>Scenes: '+esc((asset.sceneNumbers||[]).join(", ")||"Not linked")+'</p><p>Groups: '+esc((asset.groupNames||[]).join(", ")||"Not linked")+'</p><p>'+esc(asset.notes||"")+'</p><footer><button data-edit-asset>Edit</button><button data-delete-asset>Remove</button></footer></article>').join("");
 $("groupList").innerHTML=project.animationGroups.map(group=>{const scenes=project.scenes.filter(scene=>scene.animationGroupId===group.id);return '<article class="group-entry" data-group-id="'+attr(group.id)+'"><h3>'+esc(group.name)+'</h3><p>'+esc(group.file||"No project file linked")+'</p><p>'+esc(group.resources||"No shared resources listed")+'</p><p class="group-scenes">Scenes '+esc(scenes.map(sceneNumber).join(", ")||"none")+'</p><button data-edit-group>Edit group</button></article>'}).join("")||'<div class="empty-state">Create a group when scenes share one Blender project or setup.</div>';
}
function checklistHtml(scene){const fields=[["assetReady","Assets ready"],["modelingComplete","Modeling complete"],["animationComplete","Animation complete"],["renderingComplete","Rendering complete"],["voiceoverReady","Voiceover ready"],["editingComplete","Editing complete"]];return fields.map(([field,label])=>'<label class="check-item"><input type="checkbox" data-checklist="'+field+'" '+(scene.productionChecklist[field]?"checked":"")+'> '+label+'</label>').join("")}
function openInspector(sceneId){
 const scene=project.scenes.find(item=>item.id===sceneId);if(!scene)return;inspectorSceneId=sceneId;
 $("inspectorSceneNo").textContent="SCENE "+String(sceneNumber(scene)).padStart(2,"0");$("sceneInspector").hidden=false;
 $("inspectorBody").innerHTML='<section class="inspector-section"><h3>Voiceover</h3><textarea data-inspector-field="voiceover" rows="5">'+esc(scene.voiceover)+'</textarea></section><section class="inspector-section"><h3>Production methods</h3><div class="method-editor">'+methodButtons(scene)+'</div></section><section class="inspector-section"><h3>Workflow progress</h3>'+relevantMethods(scene).map(method=>'<label class="workflow-line"><span>'+esc(method)+'</span><select data-inspector-workflow="'+attr(method)+'">'+workflowOptions(scene.workflowProgress[method])+'</select></label>').join("")+'</section><section class="inspector-section"><h3>Production checklist</h3><div class="checklist-grid">'+checklistHtml(scene)+'</div></section><section class="inspector-section"><h3>Prompts and notes</h3><label>Blender / Codex prompt<textarea data-inspector-field="blenderPrompt" rows="7">'+esc(scene.blenderPrompt)+'</textarea></label><label>Technical notes<textarea data-inspector-field="technicalNotes" rows="4">'+esc(scene.technicalNotes)+'</textarea></label></section><section class="inspector-section"><label>Scene completion<select data-inspector-field="sceneStatus">'+statusOptions(scene.sceneStatus)+'</select></label><p class="hint">Workflow readiness and scene completion are tracked separately.</p></section>';
}
function render(){if(!project)return;renderHeader();renderOverview();renderStoryboard();renderProduction();renderAssets();if(inspectorSceneId&&!$("sceneInspector").hidden)openInspector(inspectorSceneId)}
function switchView(view){activeView=view;$("workspaceTabs");document.querySelectorAll(".workspace-tabs button").forEach(button=>button.classList.toggle("active",button.dataset.view===view));document.querySelectorAll("[data-panel]").forEach(panel=>{panel.hidden=panel.dataset.panel!==view;panel.classList.toggle("active",panel.dataset.panel===view)});if(view==="production")renderProduction();if(view==="assets")renderAssets();scrollTo({top:0,behavior:"smooth"})}

document.querySelector(".workspace-tabs").onclick=event=>{const button=event.target.closest("[data-view]");if(button)switchView(button.dataset.view)};
$("addScene").onclick=()=>{project.scenes.push(makeProductionScene());queueSave();renderStoryboard();$("storyboardList").lastElementChild.querySelector("textarea")?.focus()};
$("storyboardList").addEventListener("input",event=>{
 const holder=event.target.closest("[data-scene-id]"),scene=project.scenes.find(item=>item.id===holder?.dataset.sceneId),field=event.target.dataset.sceneField;if(!scene||!field)return;
 if(field==="sceneStatus")setSceneStatus(scene,event.target.value);else{scene[field]=event.target.value;if(field==="timeline"){try{const parsed=parseProductionStoryboard("Voiceover\tTimeline\nx\t"+event.target.value).scenes[0];scene.duration=parsed.duration||scene.duration}catch{}}queueSave()}renderHeader();
});
$("storyboardList").addEventListener("click",event=>{
 const holder=event.target.closest("[data-scene-id]"),scene=project.scenes.find(item=>item.id===holder?.dataset.sceneId);if(!scene)return;
 const methodButton=event.target.closest("[data-toggle-method]");
 if(methodButton){const method=methodButton.dataset.toggleMethod;scene.productionMethods=scene.productionMethods.includes(method)?scene.productionMethods.filter(item=>item!==method):[...scene.productionMethods,method];queueSave();render();return}
 if(event.target.closest("[data-expand]")){const details=holder.querySelector(".storyboard-details");details.hidden=!details.hidden;event.target.closest("[data-expand]").textContent=details.hidden?"⌄":"⌃";return}
 if(event.target.closest("[data-open-inspector]"))return openInspector(scene.id);
 if(event.target.closest("[data-duplicate]")){const index=project.scenes.indexOf(scene);project.scenes.splice(index+1,0,makeProductionScene({...copyProject(scene),id:"",sourceSceneNumber:""}));queueSave();render();return}
 if(event.target.closest("[data-insert]")){const index=project.scenes.indexOf(scene);project.scenes.splice(index+1,0,makeProductionScene());queueSave();render();return}
 if(event.target.closest("[data-delete]")){if(confirm("Delete scene "+sceneNumber(scene)+"? This cannot be undone after Firebase saves.")){project.scenes=project.scenes.filter(item=>item.id!==scene.id);queueSave();render()}return}
});
$("storyboardList").addEventListener("change",event=>{if(event.target.matches("[data-scene-field]"))render()});
$("storyboardList").addEventListener("dragstart",event=>{const holder=event.target.closest("[data-scene-id]");if(holder){dragSceneId=holder.dataset.sceneId;holder.classList.add("dragging");event.dataTransfer.effectAllowed="move"}});
$("storyboardList").addEventListener("dragend",event=>{event.target.closest("[data-scene-id]")?.classList.remove("dragging");dragSceneId=""});
$("storyboardList").addEventListener("dragover",event=>event.preventDefault());
$("storyboardList").addEventListener("drop",event=>{event.preventDefault();const target=event.target.closest("[data-scene-id]");if(!target||!dragSceneId||target.dataset.sceneId===dragSceneId)return;const from=project.scenes.findIndex(scene=>scene.id===dragSceneId),to=project.scenes.findIndex(scene=>scene.id===target.dataset.sceneId),moved=project.scenes.splice(from,1)[0];project.scenes.splice(to,0,moved);queueSave();render()});
$("previewImport").onclick=previewImport;$("mappingFields").onchange=renderImportPreview;$("confirmImport").onclick=confirmImport;
$("pasteImport").onclick=async()=>{try{$("importInput").value=await navigator.clipboard.readText();previewImport()}catch{status("Clipboard access was blocked. Paste manually.","error")}};
$("methodFilters").onclick=event=>{const button=event.target.closest("[data-method]");if(button){methodFilter=button.dataset.method;renderProduction()}};
$("groupBy").onchange=event=>{groupMode=event.target.value;renderProduction()};
$("productionQueue").addEventListener("change",event=>{const scene=project.scenes.find(item=>item.id===event.target.closest("[data-scene-id]")?.dataset.sceneId);if(scene&&event.target.dataset.workflowMethod){setWorkflow(scene,event.target.dataset.workflowMethod,event.target.value);render()}});
$("productionQueue").addEventListener("click",async event=>{
 const button=event.target.closest("[data-work-action]"),scene=project.scenes.find(item=>item.id===button?.closest("[data-scene-id]")?.dataset.sceneId);if(!button||!scene)return;const action=button.dataset.workAction,method=methodFilter==="All"?(relevantMethods(scene)[0]||"Assets"):methodFilter;
 if(action==="inspect")return openInspector(scene.id);
 if(action==="copy"){await copyText(productionPrompt(scene));status("Prompt copied","ok");return}
 if(action==="start"){setWorkflow(scene,method,method==="Blender"?"Modeling":"Animating")}
 if(action==="model"){scene.productionChecklist.modelingComplete=true;setWorkflow(scene,"Blender","Animating")}
 if(action==="animate"){scene.productionChecklist.animationComplete=true;setWorkflow(scene,"Blender","Rendering")}
 if(action==="render"){scene.productionChecklist.renderingComplete=true;setWorkflow(scene,"Blender","Ready")}
 if(action==="ready"){scene.productionChecklist.assetReady=true;setWorkflow(scene,method,"Ready")}
 render();
});
$("nextPending").onclick=()=>{const scene=project.scenes.find(item=>(methodFilter==="All"||item.productionMethods.includes(methodFilter))&&(methodFilter==="All"?item.sceneStatus!=="Completed":item.workflowProgress[methodFilter]!=="Ready"));if(scene)openInspector(scene.id);else status("No pending scene in this workspace.","ok")};
$("closeInspector").onclick=()=>{$("sceneInspector").hidden=true;inspectorSceneId=""};
$("sceneInspector").addEventListener("input",event=>{
 const scene=project.scenes.find(item=>item.id===inspectorSceneId);if(!scene)return;
 if(event.target.dataset.inspectorField){const field=event.target.dataset.inspectorField;if(field==="sceneStatus")setSceneStatus(scene,event.target.value);else{scene[field]=event.target.value;queueSave()}}
 if(event.target.dataset.checklist){scene.productionChecklist[event.target.dataset.checklist]=event.target.checked;queueSave()}
});
$("sceneInspector").addEventListener("change",event=>{const scene=project.scenes.find(item=>item.id===inspectorSceneId);if(!scene)return;if(event.target.dataset.inspectorWorkflow)setWorkflow(scene,event.target.dataset.inspectorWorkflow,event.target.value);render()});
$("sceneInspector").addEventListener("click",event=>{const button=event.target.closest("[data-toggle-method]"),scene=project.scenes.find(item=>item.id===inspectorSceneId);if(button&&scene){const method=button.dataset.toggleMethod;scene.productionMethods=scene.productionMethods.includes(method)?scene.productionMethods.filter(item=>item!==method):[...scene.productionMethods,method];queueSave();render()}});
["fullScript","visualStyle","language","characterBible","continuityNotes","projectNotes","aspectRatio"].forEach(id=>$(""+id).addEventListener("input",event=>{project[id==="fullScript"?"script":id]=event.target.value;queueSave();if(id==="fullScript")$("scriptSyncNotice").hidden=!scriptDifferent()}));
$("buildScript").onclick=()=>{if(project.script.trim()&&scriptDifferent()&&!confirm("Replace the complete script with the current scene narration?"))return;project.script=buildCanonicalScript(project.scenes);queueSave();renderOverview()};
$("reviewScriptSync").onclick=()=>{$("scriptComparison").innerHTML='<div><strong>Complete script</strong><p>'+esc(project.script)+'</p></div><div><strong>Scene narration</strong><p>'+esc(buildCanonicalScript(project.scenes))+'</p></div>';$("scriptDialog").showModal()};
$("scenesToScript").onclick=()=>{project.script=buildCanonicalScript(project.scenes);queueSave();$("scriptDialog").close();renderOverview()};
$("scriptToScenes").onclick=()=>{const parts=project.script.split(/\n\s*\n/).map(value=>value.trim()).filter(Boolean);if(parts.length!==project.scenes.length){status("Script has "+parts.length+" paragraphs but the storyboard has "+project.scenes.length+" scenes. Match the counts before syncing.","error");return}project.scenes.forEach((scene,index)=>scene.voiceover=parts[index]);queueSave();$("scriptDialog").close();render()};
function openAssetDialog(asset={}){$("assetId").value=asset.id||"";$("assetName").value=asset.name||"";$("assetType").value=asset.type||"Blender file";$("assetLocation").value=asset.location||"";$("assetStatus").value=asset.status||"Planned";$("assetScenes").value=(asset.sceneNumbers||[]).join(", ");$("assetGroups").value=(asset.groupNames||[]).join(", ");$("assetNotes").value=asset.notes||"";$("assetDialogTitle").textContent=asset.id?"Edit asset":"Add asset";$("assetDialog").showModal()}
$("addAsset").onclick=()=>openAssetDialog();
$("saveAsset").onclick=()=>{const name=$("assetName").value.trim();if(!name)return status("Asset name is required.","error");const asset={id:$("assetId").value||uid("asset"),name,type:$("assetType").value,location:$("assetLocation").value.trim(),status:$("assetStatus").value,sceneNumbers:$("assetScenes").value.split(",").map(value=>Number(value.trim())).filter(Boolean),groupNames:$("assetGroups").value.split(",").map(value=>value.trim()).filter(Boolean),notes:$("assetNotes").value.trim()};const index=project.assets.findIndex(item=>item.id===asset.id);if(index>=0)project.assets[index]=asset;else project.assets.push(asset);queueSave();$("assetDialog").close();renderAssets()};
$("assetRegistry").onclick=event=>{const holder=event.target.closest("[data-asset-id]"),asset=project.assets.find(item=>item.id===holder?.dataset.assetId);if(!asset)return;if(event.target.closest("[data-edit-asset]"))openAssetDialog(asset);if(event.target.closest("[data-delete-asset]")&&confirm("Remove this asset reference?")){project.assets=project.assets.filter(item=>item.id!==asset.id);queueSave();renderAssets()}};
function openGroupDialog(group={}){$("groupId").value=group.id||"";$("groupName").value=group.name||"";$("groupFile").value=group.file||"";$("groupResources").value=group.resources||"";$("groupNotes").value=group.notes||"";$("groupDialogTitle").textContent=group.id?"Edit group":"New animation group";$("groupDialog").showModal()}
$("addGroup").onclick=()=>openGroupDialog();
$("saveGroup").onclick=()=>{const name=$("groupName").value.trim();if(!name)return status("Animation group name is required.","error");const group={id:$("groupId").value||uid("group"),name,file:$("groupFile").value.trim(),resources:$("groupResources").value.trim(),notes:$("groupNotes").value.trim()};const index=project.animationGroups.findIndex(item=>item.id===group.id);if(index>=0)project.animationGroups[index]=group;else project.animationGroups.push(group);queueSave();$("groupDialog").close();render()};
$("groupList").onclick=event=>{const holder=event.target.closest("[data-group-id]"),group=project.animationGroups.find(item=>item.id===holder?.dataset.groupId);if(group&&event.target.closest("[data-edit-group]"))openGroupDialog(group)};
$("shareProject").onclick=()=>{renderEditors();$("shareFeedback").textContent="";$("shareDialog").showModal()};
function renderEditors(){$("editorList").innerHTML=(project.editorEmails||[]).map(email=>'<div class="next-action"><span>'+esc(email)+'</span><button type="button" data-remove-editor="'+attr(email)+'">Remove</button></div>').join("")||'<p class="hint">Only you can access this project.</p>'}
$("addEditor").onclick=async()=>{const email=$("shareEmail").value.trim().toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return $("shareFeedback").textContent="Enter a valid Google email.";project.editorEmails=[...new Set([...(project.editorEmails||[]),email])];await save();$("shareEmail").value="";renderEditors();renderHeader()};
$("editorList").onclick=async event=>{const button=event.target.closest("[data-remove-editor]");if(button&&confirm("Remove "+button.dataset.removeEditor+"?")){project.editorEmails=project.editorEmails.filter(email=>email!==button.dataset.removeEditor);await save();renderEditors();renderHeader()}};
$("copyProjectLink").onclick=async()=>{await copyText(location.href);$("shareFeedback").textContent="Project link copied."};
document.addEventListener("visibilitychange",()=>{if(document.hidden&&saveTimer)save()});window.addEventListener("pagehide",()=>{if(localDirty&&project&&user)keepDraft()});window.addEventListener("online",()=>{if(localDirty)save()});

async function load(){
 if(!projectId){status("No project selected.","error");return}await authReady;user=auth.currentUser;if(!user){status("Sign in on the Dashboard first.","error");return}
 try{
  projectRef=doc(db,"creatorProjects",projectId);let snapshot=null;
  try{snapshot=await getDoc(projectRef)}catch(error){const legacy=await getDoc(doc(db,"users",user.uid,"creator","main")),legacyProject=(legacy.data()?.items||[]).find(item=>item.id===projectId);if(!legacyProject)throw error;project=normalizeProject({...legacyProject,ownerUid:user.uid,ownerEmail:(user.email||"").toLowerCase(),editorEmails:[]});await setDoc(projectRef,{...project,createdAt:serverTimestamp(),updatedAt:serverTimestamp()})}
  if(snapshot?.exists())project=normalizeProject(snapshot.data());else if(!project){status("Project not found or not shared with this account.","error");return}
  cloudVersion=project.updatedAt?.toMillis?.()||0;
  try{const draft=JSON.parse(localStorage.getItem(draftKey())||"null");if(draft?.project&&draft.baseUpdatedAt===cloudVersion){project=normalizeProject({...draft.project,ownerUid:project.ownerUid,ownerEmail:project.ownerEmail});localDirty=true;setTimeout(save,0)}}catch{}
  project.editorEmails=(project.editorEmails||[]).map(email=>email.toLowerCase());render();$("app").hidden=false;status("Synced · "+(user.email||"signed in"),"ok");
  onSnapshot(projectRef,{includeMetadataChanges:true},live=>{if(live.metadata.hasPendingWrites)return;if(!live.exists())return status("Project is no longer available.","error");cloudVersion=live.data()?.updatedAt?.toMillis?.()||cloudVersion;if(localDirty)return;project=normalizeProject(live.data());render();status("Live collaboration · "+(user.email||"signed in"),"ok")},error=>status("Sync error: "+error.message,"error"));
 }catch(error){status("Could not load project: "+error.message,"error")}
}
load();let observedUid;observeAuth(current=>{const uidNow=current?.uid||"";if(observedUid===undefined){observedUid=uidNow;return}if(uidNow!==observedUid)location.reload()});
