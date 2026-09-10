import{initializeApp}from"https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import{getAuth}from"https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import{getFirestore,doc,getDoc,onSnapshot,setDoc,serverTimestamp}from"https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import{estimateSeconds,inspectScenes,parseSceneInput,splitVoiceoverScript}from"./scene-tools.js?v=2";

const config={apiKey:"AIzaSyBeVpUqcRO_VXfQrGVL5OaSGHKFB8XEQMc",authDomain:"life-by-adichimp.firebaseapp.com",projectId:"life-by-adichimp",storageBucket:"life-by-adichimp.firebasestorage.app",messagingSenderId:"761981819700",appId:"1:761981819700:web:8e88516817ed40b9866361"};
const auth=getAuth(initializeApp(config)),db=getFirestore(),$=id=>document.getElementById(id),projectId=new URLSearchParams(location.search).get("id");
const focusFields=["voiceover","characterPrompt","imagePrompt","videoPrompt"];
const focusLabels={voiceover:"Voiceover",characterPrompt:"Character reference",imagePrompt:"Image prompt",videoPrompt:"Video prompt"};
let user=null,project=null,projectRef=null,saveTimer=null,localDirty=false,pendingImport=[],focusState={sceneId:"",field:"voiceover"},touchStart=null;

const newId=()=>crypto.randomUUID?.()||String(Date.now()+Math.random());
function esc(value){const node=document.createElement("div");node.textContent=value??"";return node.innerHTML;}
function attr(value){return esc(value).replace(/"/g,"&quot;").replace(/'/g,"&#39;");}
function status(message,type=""){$("status").textContent=message;$("status").className="sync-status "+type;}
function focusMessage(message,type=""){$("focusToast").textContent=message;$("focusToast").className="focus-toast "+type;}

function makeScene(data={}){
  const duration=Number(data.duration)||estimateSeconds(data.voiceover);
  return{
    id:data.id||newId(),
    duration:Math.max(1,Math.min(60,duration)),
    voiceover:data.voiceover||"",
    characterPrompt:data.characterPrompt||"",
    imagePrompt:data.imagePrompt||"",
    videoPrompt:data.videoPrompt||"",
    characterDone:!!data.characterDone,
    imageDone:!!data.imageDone,
    videoDone:!!data.videoDone,
    characterAssetUrl:data.characterAssetUrl||"",
    imageAssetUrl:data.imageAssetUrl||"",
    videoAssetUrl:data.videoAssetUrl||"",
    completed:!!data.completed,
    skipped:!!data.skipped
  };
}

function hasCharacterPrompt(scene){
  const value=scene.characterPrompt.trim().toLowerCase();
  return !!value&&!["—","-","none","n/a","na","not applicable"].includes(value);
}

function requiredAssets(scene){
  return[...(hasCharacterPrompt(scene)?["characterDone"]:[]),"imageDone","videoDone"];
}

function assetsReady(scene){
  return requiredAssets(scene).every(field=>scene[field]);
}

function sceneState(scene){
  if(scene.completed)return"complete";
  if(scene.skipped)return"skipped";
  if(assetsReady(scene))return"ready";
  return"in progress";
}

function projectCompletion(){
  const scenes=project?.scenes||[];
  return scenes.length?Math.round(scenes.filter(scene=>scene.completed).length/scenes.length*100):0;
}

function field(label,name,value,placeholder){
  return '<div class="field"><div class="field-head"><label>'+label+'</label><button data-copy="'+name+'">Copy</button></div><textarea data-field="'+name+'" placeholder="'+placeholder+'">'+esc(value||"")+'</textarea></div>';
}

function sceneTemplate(scene,index){
  const stateLabel=sceneState(scene),summary=scene.voiceover||"Untitled scene";
  return '<article class="scene-card '+(scene.completed?'complete ':scene.skipped?'skipped ':'')+'" data-id="'+scene.id+'">'
    +'<div class="scene-top"><div class="scene-ident"><span class="drag-handle" draggable="true" title="Drag to reorder">⠿</span><span class="scene-number">'+String(index+1).padStart(2,"0")+'</span><div class="scene-summary"><strong>'+esc(summary)+'</strong><label class="duration-wrap">Duration <input data-field="duration" type="number" min="1" max="60" value="'+Number(scene.duration||5)+'"> sec</label><span class="status-pill">'+stateLabel+'</span></div></div>'
    +'<div class="scene-actions"><button data-action="production" class="produce">Produce scene →</button><button data-action="copyPack">Copy full pack</button><button data-action="up" aria-label="Move up">↑</button><button data-action="down" aria-label="Move down">↓</button><button data-action="duplicate">Duplicate</button><button data-action="collapse">Collapse</button><button data-action="delete" class="delete">Delete</button></div></div>'
    +'<div class="scene-body">'
    +field("Voiceover","voiceover",scene.voiceover,"Narration for this scene")
    +field("Character prompt","characterPrompt",scene.characterPrompt,"Reusable character or subject reference; leave blank when not needed")
    +field("Image prompt","imagePrompt",scene.imagePrompt,"Still-image generation prompt")
    +field("Video prompt","videoPrompt",scene.videoPrompt,"Movement, camera and animation prompt")
    +'</div><div class="scene-footer"><span class="completion-note">Asset tracking is available in Project assets.</span><button data-action="complete" class="complete-mini '+(scene.completed?'secondary':'primary')+'">'+(scene.completed?'Reopen scene':assetsReady(scene)?'Scene complete →':'Complete anyway →')+'</button></div></article>';
}

function render(){
  if(!project)return;
  $("projectTitle").textContent=project.title||"Untitled project";
  document.title=(project.title||"Content Project")+" · Invincible";
  $("projectMeta").textContent=[project.format,project.series,project.stage].filter(Boolean).join(" · ");
  $("fullScript").value=project.script||"";
  $("visualStyle").value=project.visualStyle||"";
  $("aspectRatio").value=project.aspectRatio||"9:16";
  $("language").value=project.language||"";
  $("characterBible").value=project.characterBible||"";
  $("continuityNotes").value=project.continuityNotes||"";
  const owner=project.ownerUid===user.uid,editors=project.editorEmails||[];
  $("shareProject").hidden=!owner;
  $("accessLabel").textContent=owner?(editors.length?"Shared with "+editors.length+" editor"+(editors.length===1?"":"s"):"Private project"):("Shared with you"+(project.ownerEmail?" by "+project.ownerEmail:""));
  const scenes=project.scenes||[],complete=scenes.filter(scene=>scene.completed).length;
  $("sceneList").innerHTML=scenes.map(sceneTemplate).join("");
  $("emptyScenes").hidden=!!scenes.length;
  $("startProduction").hidden=!scenes.length;
  $("openAssets").hidden=!scenes.length;
  if(scenes.length)$("startProduction").textContent=project.productionState?.sceneId?"Resume production →":"Start production →";
  $("workspaceHint").textContent=scenes.length?complete+" of "+scenes.length+" scenes complete · open any scene to continue":"Move through every prompt without leaving the production view.";
  updateStats();
  bindDrag();
  document.querySelectorAll(".field textarea").forEach(autoGrow);
}

function updateStats(){
  const scenes=project.scenes||[],progress=projectCompletion();
  $("sceneCount").textContent=scenes.length;
  $("totalDuration").textContent=scenes.reduce((sum,scene)=>sum+Number(scene.duration||0),0)+"s";
  $("sceneProgress").textContent=progress+"%";
  $("projectProgressBar").style.width=progress+"%";
}

async function save(){
  if(!user||!project||!projectRef)return;
  clearTimeout(saveTimer);
  status("Saving…");
  try{
    await setDoc(projectRef,{...project,updatedAt:serverTimestamp()},{merge:true});
    localDirty=false;
    status("Saved to Firebase","ok");
  }catch(error){status("Save failed: "+error.message,"error");}
}

function queueSave(){
  clearTimeout(saveTimer);
  localDirty=true;
  status("Unsaved changes…");
  saveTimer=setTimeout(save,700);
}

function autoGrow(area){
  area.style.height="auto";
  area.style.height=Math.max(110,area.scrollHeight)+"px";
}

function starterPrompt(scene,type){
  const style=project.visualStyle||"clean cinematic realism",ratio=project.aspectRatio||"9:16",character=project.characterBible?" Character reference: "+project.characterBible:"",continuity=project.continuityNotes?" Continuity: "+project.continuityNotes:"";
  if(type==="image")return 'Create a '+ratio+' '+style+' visual that communicates this narration: "'+scene.voiceover+'". Clear subject, intentional composition, expressive lighting, no captions, no watermark.'+character+continuity;
  return 'Animate the supplied image for '+scene.duration+' seconds. Use natural subject and environmental motion with a controlled cinematic camera move. Preserve the exact composition, identity, clothing, colours and visual style. No morphing, no new objects, no text.'+continuity;
}

function buildAiBrief(){
  const title=project.title||"Untitled content",style=project.visualStyle||"Not specified",ratio=project.aspectRatio||"9:16",language=project.language||"Use the script's original language",characters=project.characterBible||"Infer only when the narration requires a recurring person; otherwise use —",continuity=project.continuityNotes||"Maintain continuity whenever a subject or location repeats.";
  return `You are the scene director for a short-form video. Break the exact voiceover below into production-ready scenes and write generation prompts.

RETURN FORMAT
Return only one Markdown table. Do not add an introduction, explanation, code fence or notes.
Use exactly these columns:
| Scene | Duration | Voiceover | Character Prompt | Image Prompt | Video Prompt |

NON-NEGOTIABLE RULES
1. Preserve every spoken word exactly and in the original order. Do not rewrite, shorten, add or omit voiceover.
2. Each scene must express one clear visual beat and normally last 5–10 seconds.
3. Target roughly 11–22 spoken words per scene at 2.25 words per second. Split long sentences only at a natural clause.
4. Duration must be a whole number of seconds from 5 to 10.
5. Character Prompt must be a reusable identity reference when a person or recurring subject appears. Use — when no character reference is needed.
6. Image Prompt must be detailed, self-contained and describe subject, action, setting, composition, lens/framing, lighting, mood, style and continuity. No captions, logos or watermark.
7. Video Prompt must assume the supplied scene image is the first frame. Describe subject motion, environmental motion, camera movement and ending hold. Prevent morphing, identity drift, new objects and unwanted text.
8. Never place a raw | character inside a cell. Use commas instead. Use <br> only when a line break is essential.
9. Apply the visual bible consistently to every relevant prompt.

PROJECT
Title: ${title}
Language: ${language}
Aspect ratio: ${ratio}
Visual style: ${style}
Character bible: ${characters}
Continuity notes: ${continuity}

<<<VOICEOVER START>>>
${project.script.trim()}
<<<VOICEOVER END>>>`;
}

async function copyText(value){
  try{await navigator.clipboard.writeText(value);}
  catch{
    const area=document.createElement("textarea");
    area.value=value;area.style.position="fixed";area.style.opacity="0";document.body.append(area);area.select();
    if(!document.execCommand("copy")){area.remove();throw new Error("Clipboard access was blocked.");}
    area.remove();
  }
}

function scenePack(scene,index){
  return `SCENE ${String(index+1).padStart(2,"0")} · ${scene.duration} SECONDS

VOICEOVER
${scene.voiceover||"—"}

CHARACTER REFERENCE
${scene.characterPrompt||"—"}

IMAGE PROMPT
${scene.imagePrompt||"—"}

VIDEO PROMPT
${scene.videoPrompt||"—"}`;
}

function moveScene(id,direction){
  const scenes=project.scenes,index=scenes.findIndex(scene=>scene.id===id),next=index+direction;
  if(index<0||next<0||next>=scenes.length)return;
  [scenes[index],scenes[next]]=[scenes[next],scenes[index]];
  render();save();
}

function renderRail(){
  const complete=project.scenes.filter(scene=>scene.completed).length;
  $("railProgress").textContent=complete+" of "+project.scenes.length+" complete";
  $("sceneRail").innerHTML=project.scenes.map((scene,index)=>'<button class="rail-scene '+(scene.id===focusState.sceneId?'active ':'')+(scene.completed?'complete ':scene.skipped?'skipped ':'')+'" data-focus-scene="'+scene.id+'"><span>'+String(index+1).padStart(2,"0")+'</span><strong>'+esc(scene.voiceover||"Untitled scene")+'</strong><i aria-hidden="true"></i></button>').join("");
  requestAnimationFrame(()=>$("sceneRail").querySelector(".active")?.scrollIntoView({block:"nearest",inline:"center"}));
}

function assetCard(scene,field,urlField,label,description){
  return '<article class="asset-card '+(scene[field]?'ready':'')+'"><label><input type="checkbox" data-asset-check="'+field+'" '+(scene[field]?'checked':'')+'> '+label+'</label><p>'+description+'</p><label>Optional output link<input type="url" data-asset-url="'+urlField+'" value="'+attr(scene[urlField]||"")+'" placeholder="Paste the generated asset link"></label></article>';
}

function renderProjectAssets(){
  const scenes=project.scenes||[],ready=scenes.filter(assetsReady).length;
  $("assetsProgress").textContent=ready+" of "+scenes.length+" scenes have all expected assets. This tracker never blocks scene completion.";
  $("assetList").innerHTML=scenes.map((scene,index)=>{
    const characterRequired=hasCharacterPrompt(scene);
    return '<section class="project-asset-scene" data-asset-scene="'+attr(scene.id)+'"><div class="project-asset-head"><div><span class="eyebrow">SCENE '+String(index+1).padStart(2,"0")+'</span><strong>'+esc(scene.voiceover||"Untitled scene")+'</strong></div><span class="status-pill">'+(assetsReady(scene)?"assets ready":"assets pending")+'</span></div><div class="asset-board">'
      +assetCard(scene,"characterDone","characterAssetUrl","Character/reference ready",characterRequired?"Useful for the recurring person or subject in this scene.":"Optional because this scene has no character prompt.")
      +assetCard(scene,"imageDone","imageAssetUrl","Image generated","Track the still image created from the scene image prompt.")
      +assetCard(scene,"videoDone","videoAssetUrl","Video generated","Track the final clip created from the scene video prompt.")
      +'</div></section>';
  }).join("");
}

function renderFocus(){
  const scene=project.scenes.find(item=>item.id===focusState.sceneId),sceneIndex=project.scenes.indexOf(scene),fieldIndex=focusFields.indexOf(focusState.field);
  if(!scene)return closeFocus();
  $("focusScene").textContent="SCENE "+String(sceneIndex+1).padStart(2,"0")+" · "+scene.duration+" SEC";
  $("focusTitle").textContent=focusLabels[focusState.field];
  $("focusPosition").textContent="Scene "+(sceneIndex+1)+" of "+project.scenes.length+" · Step "+(fieldIndex+1)+" of "+focusFields.length;
  $("focusTabs").querySelectorAll("button").forEach(button=>{
    const field=button.dataset.focusField,done=!!scene[field]?.trim();
    button.classList.toggle("active",field===focusState.field);
    button.classList.toggle("done",done);
    button.setAttribute("aria-selected",String(field===focusState.field));
  });
  $("focusTextarea").value=scene[focusState.field]||"";
  $("previousScene").disabled=sceneIndex===0;
  $("nextScene").disabled=sceneIndex===project.scenes.length-1;
  $("previousField").disabled=fieldIndex===0;
  $("nextField").disabled=fieldIndex===focusFields.length-1;
  $("copyFocus").textContent="Copy "+focusLabels[focusState.field].toLowerCase();
  $("skipScene").textContent=scene.skipped?"Reopen scene":"Skip for now";
  $("completeScene").textContent=scene.completed?"Reopen scene":assetsReady(scene)?"Scene complete →":"Complete anyway →";
  $("completeScene").classList.toggle("primary",!scene.completed);
  $("completeScene").classList.toggle("secondary",scene.completed);
  renderRail();
}

function rememberFocus(open=true){
  project.productionState={sceneId:focusState.sceneId,field:focusState.field,open};
  queueSave();
}

function openFocus(sceneId,field="voiceover",persist=true){
  if(!project.scenes.some(scene=>scene.id===sceneId))return;
  focusState={sceneId,field:focusFields.includes(field)?field:"voiceover"};
  $("focusEditor").hidden=false;
  document.body.style.overflow="hidden";
  focusMessage("");
  renderFocus();
  if(persist)rememberFocus(true);
  setTimeout(()=>$("focusTextarea").focus(),0);
}

function closeFocus(){
  $("focusEditor").hidden=true;
  document.body.style.overflow="";
  if(project){project.productionState={sceneId:focusState.sceneId,field:focusState.field,open:false};queueSave();render();}
}

function changeFocusField(direction){
  const next=focusFields.indexOf(focusState.field)+direction;
  if(focusFields[next]){
    focusState.field=focusFields[next];
    focusMessage("");renderFocus();rememberFocus(true);
    $("focusTextarea").focus();
  }
}

function changeFocusScene(direction){
  const index=project.scenes.findIndex(scene=>scene.id===focusState.sceneId),next=project.scenes[index+direction];
  if(next){focusState.sceneId=next.id;focusMessage("");renderFocus();rememberFocus(true);$("focusTextarea").focus();}
}

function nextOpenScene(currentIndex){
  const scenes=project.scenes;
  return[...scenes.slice(currentIndex+1),...scenes.slice(0,currentIndex)].find(scene=>!scene.completed&&!scene.skipped);
}

async function completeFocusedScene(){
  const scene=project.scenes.find(item=>item.id===focusState.sceneId),index=project.scenes.indexOf(scene);
  if(!scene)return;
  if(scene.completed){scene.completed=false;focusMessage("Scene reopened.","ok");render();renderFocus();await save();return;}
  scene.completed=true;scene.skipped=false;
  const next=nextOpenScene(index);
  render();await save();
  if(next){focusState.sceneId=next.id;focusState.field="voiceover";project.productionState={...focusState,open:true};renderFocus();focusMessage("Scene complete. Moved to the next unfinished scene.","ok");await save();}
  else{renderFocus();focusMessage("All available scenes are complete. Production run finished!","ok");}
}

async function toggleSkip(){
  const scene=project.scenes.find(item=>item.id===focusState.sceneId),index=project.scenes.indexOf(scene);
  if(!scene)return;
  if(scene.skipped){scene.skipped=false;focusMessage("Scene returned to the production queue.","ok");render();renderFocus();await save();return;}
  scene.skipped=true;scene.completed=false;
  const next=nextOpenScene(index);
  render();await save();
  if(next){focusState.sceneId=next.id;focusState.field="voiceover";project.productionState={...focusState,open:true};renderFocus();focusMessage("Scene skipped. Moved to the next unfinished scene.","ok");await save();}
  else{renderFocus();focusMessage("No unfinished scenes remain. Reopen a skipped scene when ready.","ok");}
}

function renderImportPreview(){
  const issues=inspectScenes(pendingImport),duration=pendingImport.reduce((sum,scene)=>sum+scene.duration,0);
  $("importPreview").hidden=false;
  $("importPreview").classList.toggle("has-errors",!!issues.length);
  $("previewSummary").textContent=pendingImport.length+" scenes · "+duration+" seconds";
  $("previewIssues").textContent=issues.length?issues.slice(0,3).join(" ")+(issues.length>3?" +"+(issues.length-3)+" more.":""):"Voiceover, image and video prompts are aligned and ready.";
  $("previewRows").innerHTML=pendingImport.slice(0,10).map((scene,index)=>'<div class="preview-row"><strong>SCENE '+String(index+1).padStart(2,"0")+'</strong><span>'+scene.duration+' sec</span></div>').join("")+(pendingImport.length>10?'<div class="preview-row"><strong>+'+(pendingImport.length-10)+'</strong><span>more</span></div>':"");
  $("confirmImport").disabled=!!issues.length;
  $("confirmImport").textContent=issues.length?"Fix issues first":"Import "+pendingImport.length+" scenes";
}

function renderEditors(){
  const editors=project.editorEmails||[];
  $("editorList").innerHTML=editors.length?editors.map(email=>'<div class="editor-row"><div><strong>'+esc(email)+'</strong><span>Can edit</span></div><button type="button" data-remove-editor="'+attr(email)+'">Remove</button></div>').join(""):'<div class="editor-empty">Only you can access this project.</div>';
}

$("shareProject").onclick=()=>{
  $("shareEmail").value="";$("shareFeedback").textContent="";renderEditors();$("shareDialog").showModal();setTimeout(()=>$("shareEmail").focus(),0);
};

$("addEditor").onclick=async()=>{
  const email=$("shareEmail").value.trim().toLowerCase(),ownerEmail=(project.ownerEmail||user.email||"").toLowerCase();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return $("shareFeedback").textContent="Enter a valid Google-account email.";
  if(email===ownerEmail)return $("shareFeedback").textContent="You already own this project.";
  project.editorEmails=[...new Set([...(project.editorEmails||[]),email])];
  await save();$("shareEmail").value="";$("shareFeedback").textContent="Editor added. They will see this project after signing in.";renderEditors();render();
};

$("editorList").onclick=async event=>{
  const button=event.target.closest("[data-remove-editor]");
  if(!button)return;
  const email=button.dataset.removeEditor;
  if(!confirm("Remove "+email+" from this project?"))return;
  project.editorEmails=(project.editorEmails||[]).filter(item=>item!==email);
  await save();$("shareFeedback").textContent="Editor removed.";renderEditors();render();
};

$("copyProjectLink").onclick=async()=>{
  try{await copyText(location.href);$("shareFeedback").textContent="Project link copied. Access still requires an email listed above.";}
  catch(error){$("shareFeedback").textContent=error.message;}
};

$("copyAiBrief").onclick=async()=>{
  project.script=$("fullScript").value.trim();
  if(!project.script)return status("Paste the complete voiceover before copying the ChatGPT brief.","error");
  try{await copyText(buildAiBrief());await save();status("ChatGPT brief copied. Paste it into ChatGPT, then return with the completed table.","ok");}
  catch(error){status(error.message,"error");}
};

$("splitScript").onclick=async()=>{
  const text=$("fullScript").value.trim();
  if(!text)return status("Paste the full voiceover first.","error");
  if(project.scenes.length&&!confirm("Replace the existing scenes with a local word-count split?"))return;
  project.script=text;
  project.scenes=splitVoiceoverScript(text,makeScene);
  project.scenes.forEach(scene=>{scene.imagePrompt=starterPrompt(scene,"image");scene.videoPrompt=starterPrompt(scene,"video");});
  render();await save();openFocus(project.scenes[0].id,"voiceover");
};

$("reviewImport").onclick=()=>{
  try{pendingImport=parseSceneInput($("tableInput").value,makeScene);renderImportPreview();$("importFeedback").textContent="Review passed through the scene parser. Confirm below to import.";$("importFeedback").classList.add("toast");}
  catch(error){pendingImport=[];$("importPreview").hidden=true;$("importFeedback").textContent=error.message;$("importFeedback").classList.remove("toast");}
};

$("confirmImport").onclick=async()=>{
  if(!pendingImport.length)return;
  const replace=$("importMode").value==="replace";
  if(replace&&project.scenes.length&&!confirm("Replace all existing scenes with this reviewed breakdown?"))return;
  project.scenes=replace?pendingImport:[...project.scenes,...pendingImport];
  if(!project.script)project.script=project.scenes.map(scene=>scene.voiceover).filter(Boolean).join("\n\n");
  const firstImported=replace?project.scenes[0]:project.scenes[project.scenes.length-pendingImport.length];
  $("tableInput").value="";pendingImport=[];$("importPreview").hidden=true;
  $("importFeedback").textContent="Scenes imported and aligned. Production mode is ready.";$("importFeedback").classList.add("toast");
  render();await save();openFocus(firstImported.id,"voiceover");
};

$("pasteClipboard").onclick=async()=>{
  try{$("tableInput").value=await navigator.clipboard.readText();$("importFeedback").textContent="Pasted. Press Review breakdown to validate it.";$("importPreview").hidden=true;}
  catch{$("importFeedback").textContent="Clipboard access was blocked. Long-press and paste into the box.";}
};

$("tableInput").addEventListener("input",()=>{$("importPreview").hidden=true;pendingImport=[];});
[$("fullScript"),$("visualStyle"),$("language"),$("characterBible"),$("continuityNotes"),$("aspectRatio")].forEach(input=>input.addEventListener("input",()=>{project[input.id==="fullScript"?"script":input.id]=input.value;queueSave();}));

$("addScene").onclick=()=>{const scene=makeScene();project.scenes.push(scene);render();save();openFocus(scene.id,"voiceover");};
$("startProduction").onclick=()=>{
  const saved=project.productionState,preferred=project.scenes.find(scene=>scene.id===saved?.sceneId),next=preferred||project.scenes.find(scene=>!scene.completed&&!scene.skipped)||project.scenes[0];
  if(next)openFocus(next.id,saved?.field||"voiceover");
};

$("sceneList").addEventListener("input",event=>{
  const card=event.target.closest(".scene-card"),scene=project.scenes.find(item=>item.id===card?.dataset.id),field=event.target.dataset.field;
  if(!scene||!field)return;
  scene[field]=event.target.type==="checkbox"?event.target.checked:field==="duration"?Number(event.target.value):event.target.value;
  if(field!=="duration"&&event.target.tagName==="TEXTAREA")autoGrow(event.target);
  updateStats();
  queueSave();
});

$("sceneList").addEventListener("focusin",event=>{
  if(event.target.tagName==="TEXTAREA"){
    const card=event.target.closest(".scene-card");
    openFocus(card.dataset.id,event.target.dataset.field);
  }
});

$("sceneList").addEventListener("click",async event=>{
  const card=event.target.closest(".scene-card"),scene=project.scenes.find(item=>item.id===card?.dataset.id);
  if(!scene)return;
  const copy=event.target.closest("[data-copy]");
  if(copy){await copyText(scene[copy.dataset.copy]||"");status(focusLabels[copy.dataset.copy]+" copied.","ok");return;}
  const action=event.target.closest("[data-action]")?.dataset.action;
  if(!action)return;
  if(action==="delete"){
    if(confirm("Delete this scene?")){project.scenes=project.scenes.filter(item=>item.id!==scene.id);render();save();}
  }else if(action==="duplicate"){
    const index=project.scenes.indexOf(scene),copyScene=makeScene({...scene,id:"",completed:false,skipped:false});project.scenes.splice(index+1,0,copyScene);render();save();
  }else if(action==="up")moveScene(scene.id,-1);
  else if(action==="down")moveScene(scene.id,1);
  else if(action==="collapse"){
    card.classList.toggle("collapsed");event.target.textContent=card.classList.contains("collapsed")?"Expand":"Collapse";
  }else if(action==="production")openFocus(scene.id,project.productionState?.sceneId===scene.id?project.productionState.field:"voiceover");
  else if(action==="copyPack"){
    await copyText(scenePack(scene,project.scenes.indexOf(scene)));status("Full scene pack copied.","ok");
  }else if(action==="complete"){
    openFocus(scene.id,project.productionState?.sceneId===scene.id?project.productionState.field:"voiceover");await completeFocusedScene();
  }
});

function bindDrag(){
  document.querySelectorAll(".scene-card").forEach(card=>{
    const handle=card.querySelector(".drag-handle");
    handle.ondragstart=event=>{card.classList.add("dragging");event.dataTransfer.setData("text/plain",card.dataset.id);};
    handle.ondragend=()=>card.classList.remove("dragging");
    card.ondragover=event=>{event.preventDefault();card.classList.add("drag-over");};
    card.ondragleave=()=>card.classList.remove("drag-over");
    card.ondrop=event=>{event.preventDefault();card.classList.remove("drag-over");const from=project.scenes.findIndex(scene=>scene.id===event.dataTransfer.getData("text/plain")),to=project.scenes.findIndex(scene=>scene.id===card.dataset.id);if(from>=0&&to>=0&&from!==to){const[moved]=project.scenes.splice(from,1);project.scenes.splice(to,0,moved);render();save();}};
  });
}

$("closeFocus").onclick=closeFocus;
$("previousField").onclick=()=>changeFocusField(-1);
$("nextField").onclick=()=>changeFocusField(1);
$("previousScene").onclick=()=>changeFocusScene(-1);
$("nextScene").onclick=()=>changeFocusScene(1);
$("skipScene").onclick=toggleSkip;
$("completeScene").onclick=completeFocusedScene;

$("focusTabs").onclick=event=>{
  const button=event.target.closest("[data-focus-field]");
  if(button){focusState.field=button.dataset.focusField;focusMessage("");renderFocus();rememberFocus(true);$("focusTextarea").focus();}
};

$("sceneRail").onclick=event=>{
  const button=event.target.closest("[data-focus-scene]");
  if(button){focusState.sceneId=button.dataset.focusScene;focusMessage("");renderFocus();rememberFocus(true);}
};

$("focusTextarea").oninput=event=>{
  const scene=project.scenes.find(item=>item.id===focusState.sceneId);
  if(scene){scene[focusState.field]=event.target.value;if(scene.completed)scene.completed=false;queueSave();}
};

$("openAssets").onclick=()=>{renderProjectAssets();$("assetsDialog").showModal();};
$("closeAssets").onclick=()=>$("assetsDialog").close();
$("assetList").addEventListener("input",event=>{
  const container=event.target.closest("[data-asset-scene]"),scene=project.scenes.find(item=>item.id===container?.dataset.assetScene);
  if(!scene)return;
  if(event.target.dataset.assetCheck){scene[event.target.dataset.assetCheck]=event.target.checked;render();renderProjectAssets();}
  if(event.target.dataset.assetUrl)scene[event.target.dataset.assetUrl]=event.target.value;
  queueSave();
});

$("copyFocus").onclick=async()=>{
  const scene=project.scenes.find(item=>item.id===focusState.sceneId);
  if(!scene)return;
  const value=scene[focusState.field]||"";
  if(!value.trim())return focusMessage("This field is empty.","error");
  try{await copyText(value);focusMessage(focusLabels[focusState.field]+" copied. Paste it into your GPT.","ok");}
  catch(error){focusMessage(error.message,"error");}
};

document.querySelector(".focus-work").addEventListener("touchstart",event=>{
  if(event.target.closest("textarea,input,button,.rail-list,.focus-tabs"))return;
  const touch=event.changedTouches[0];touchStart={x:touch.clientX,y:touch.clientY};
},{passive:true});
document.querySelector(".focus-work").addEventListener("touchend",event=>{
  if(!touchStart)return;
  const touch=event.changedTouches[0],dx=touch.clientX-touchStart.x,dy=touch.clientY-touchStart.y;touchStart=null;
  if(Math.abs(dx)>70&&Math.abs(dx)>Math.abs(dy)*1.25)changeFocusField(dx<0?1:-1);
  else if(Math.abs(dy)>80&&Math.abs(dy)>Math.abs(dx)*1.25)changeFocusScene(dy<0?1:-1);
},{passive:true});

document.addEventListener("keydown",event=>{
  if($("focusEditor").hidden)return;
  if(event.key==="Escape")closeFocus();
  else if(event.ctrlKey&&event.key==="ArrowLeft"){event.preventDefault();changeFocusField(-1);}
  else if(event.ctrlKey&&event.key==="ArrowRight"){event.preventDefault();changeFocusField(1);}
  else if(event.ctrlKey&&event.key==="ArrowUp"){event.preventDefault();changeFocusScene(-1);}
  else if(event.ctrlKey&&event.key==="ArrowDown"){event.preventDefault();changeFocusScene(1);}
});

document.addEventListener("visibilitychange",()=>{if(document.hidden&&saveTimer)save();});

async function load(){
  if(!projectId){status("No project was selected.","error");return;}
  await auth.authStateReady();user=auth.currentUser;
  if(!user){status("Sign in on the Dashboard first.","error");$("status").insertAdjacentHTML("beforeend",' <a href="/invincible/">Open Dashboard</a>');return;}
  try{
    projectRef=doc(db,"creatorProjects",projectId);
    let snapshot=null;
    try{snapshot=await getDoc(projectRef);}catch(error){
      const legacy=await getDoc(doc(db,"users",user.uid,"creator","main"));
      const legacyProject=(legacy.data()?.items||[]).find(item=>item.id===projectId);
      if(!legacyProject)throw error;
      project={...legacyProject,ownerUid:user.uid,ownerEmail:(user.email||"").toLowerCase(),editorEmails:[]};
      await setDoc(projectRef,{...project,createdAt:serverTimestamp(),updatedAt:serverTimestamp()});
    }
    if(snapshot?.exists())project=snapshot.data();
    else if(!project){status("This project was not found or has not been shared with your account.","error");return;}
    project.id=projectId;
    project.editorEmails=(project.editorEmails||[]).map(email=>email.toLowerCase());
    project.scenes=(project.scenes||[]).map(makeScene);
    render();$("app").hidden=false;status("Synced · "+(user.email||"signed in"),"ok");
    const saved=project.productionState;
    if(saved?.open&&project.scenes.some(scene=>scene.id===saved.sceneId))setTimeout(()=>openFocus(saved.sceneId,saved.field,false),0);
    onSnapshot(projectRef,live=>{
      if(!live.exists()){status("This shared project is no longer available.","error");return;}
      if(localDirty)return;
      const incoming={...live.data(),id:projectId};
      incoming.editorEmails=(incoming.editorEmails||[]).map(email=>email.toLowerCase());
      incoming.scenes=(incoming.scenes||[]).map(makeScene);
      project=incoming;render();
      if(!$("focusEditor").hidden){
        const active=project.scenes.some(scene=>scene.id===focusState.sceneId);
        if(active)renderFocus();else closeFocus();
      }
      status("Live collaboration · "+(user.email||"signed in"),"ok");
    },error=>status("Collaboration access changed: "+error.message,"error"));
  }catch(error){status("Could not load project: "+error.message,"error");}
}

load();
