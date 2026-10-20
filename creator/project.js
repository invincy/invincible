import{looksLikeStoryboard,makeScene,parseStoryboard}from'./storyboard-model.js?v=2';
import{createProductionWorkbench}from'./production-workbench.js?v=1';
import{projectProgress,canComplete,canonicalScript,parseProductionImport,uniqueScenes}from'./production-model.js?v=1';
import{auth,db,authReady,observeAuth,storageError}from'../shared/firebase-client.js';
import{doc,getDoc,onSnapshot,setDoc,serverTimestamp}from"https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import{inspectScenes,parseSceneInput,splitVoiceoverScript}from"./scene-tools.js?v=2";

const $=id=>document.getElementById(id),projectId=new URLSearchParams(location.search).get("id");
const focusFields=["voiceover","characterPrompt","imagePrompt","videoPrompt"];
const focusLabels={voiceover:"Voiceover",characterPrompt:"Character reference",imagePrompt:"Image prompt",videoPrompt:"Video prompt"};
let saveChain=Promise.resolve(),editVersion=0,cloudVersion=0;
let user=null,project=null,projectRef=null,saveTimer=null,localDirty=false,pendingImport=[],pendingImportKind="advanced",focusState={sceneId:"",field:"voiceover"},touchStart=null;

function esc(value){const node=document.createElement("div");node.textContent=value??"";return node.innerHTML;}
function attr(value){return esc(value).replace(/"/g,"&quot;").replace(/'/g,"&#39;");}
function status(message,type=""){$("status").textContent=message;$("status").className="sync-status "+type;}
function focusMessage(message,type=""){$("focusToast").textContent=message;$("focusToast").className="focus-toast "+type;}

const storyboard=createProductionWorkbench($("projectStoryboard"),{
 getProject:()=>project,
 onChange:()=>{if(document.activeElement!==$("fullScript"))$("fullScript").value=project.script||"";queueSave();renderSceneWorkspace();},
 onFocus:id=>openFocus(id,"characterPrompt"),copyText
});
const refreshScriptNotice=storyboard.watchSource($("fullScript"));

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

function projectCompletion(){
  const scenes=project?.scenes||[];
  return projectProgress(project);
}

function render(){
  if(!project)return;
  $("projectTitle").textContent=project.title||"Untitled project";
  document.title=(project.title||"Content Project")+" · Invincible";
  $("projectMeta").textContent=[project.format,project.series,project.stage].filter(Boolean).join(" · ");
  $("fullScript").value=project.script||"";
  $("useShotVoiceover").hidden=!!project.script?.trim()||!project.scenes?.some(scene=>scene.voiceover);
  refreshScriptNotice();
  $("visualStyle").value=project.visualStyle||"";
  $("aspectRatio").value=project.aspectRatio||"9:16";
  $("language").value=project.language||"";
  $("characterBible").value=project.characterBible||"";
  $("continuityNotes").value=project.continuityNotes||"";
  const owner=project.ownerUid===user.uid,editors=project.editorEmails||[];
  $("shareProject").hidden=!owner;
  $("accessLabel").textContent=owner?(editors.length?"Shared with "+editors.length+" editor"+(editors.length===1?"":"s"):"Private project"):("Shared with you"+(project.ownerEmail?" by "+project.ownerEmail:""));
  storyboard.render();
  renderSceneWorkspace();
}

function renderSceneWorkspace(){
  const scenes=project.scenes||[];
  $("startProduction").hidden=!scenes.length;
  $("openAssets").hidden=!scenes.length;
  if(scenes.length){
    const savedScene=scenes.find(scene=>scene.id===project.productionState?.sceneId),unfinished=scenes.some(scene=>!scene.completed&&!scene.skipped);
    $("startProduction").textContent=savedScene&&!savedScene.completed&&!savedScene.skipped?"Resume current scene →":unfinished?"Start next scene →":"Review production →";
  }
  updateStats();
}

function updateStats(){
  const scenes=project.scenes||[],progress=projectCompletion();
  $("sceneCount").textContent=scenes.length;
  $("totalDuration").textContent=scenes.reduce((sum,scene)=>sum+Number(scene.duration||0),0)+"s";
  $("sceneProgress").textContent=progress+"%";
  $("projectProgressBar").style.width=progress+"%";
}

function copyProject(value){if(Array.isArray(value))return value.map(copyProject);if(value&&Object.getPrototypeOf(value)===Object.prototype)return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,copyProject(item)]));return value}
function draftKey(){return 'invincible.creatorDraft.'+user.uid+'.'+projectId}
function keepDraft(){try{localStorage.setItem(draftKey(),JSON.stringify({project,baseUpdatedAt:cloudVersion}))}catch(error){status("Could not keep a local draft: "+error.message,"error")}}
async function save(){
 if(!user||!project||!projectRef)return false;
 clearTimeout(saveTimer);saveTimer=null;localDirty=true;const version=++editVersion,payload=copyProject(project),ref=projectRef;
 keepDraft();status("Saving…");
 const result=saveChain.then(async()=>{
  try{
   await setDoc(ref,{...payload,updatedAt:serverTimestamp()},{merge:true});
   if(version===editVersion){localDirty=false;localStorage.removeItem(draftKey());status("Saved to Firebase","ok")}
   return true;
  }catch(error){status(storageError(error)+" Your draft is kept on this device.","error");return false}
 });saveChain=result;return result;
}
function queueSave(){
 clearTimeout(saveTimer);localDirty=true;editVersion++;keepDraft();status("Unsaved changes…");saveTimer=setTimeout(save,700);
}

function starterPrompt(scene,type){
  const style=project.visualStyle||"clean cinematic realism",ratio=project.aspectRatio||"9:16",character=project.characterBible?" Character reference: "+project.characterBible:"",continuity=project.continuityNotes?" Continuity: "+project.continuityNotes:"";
  const visual=scene.visual?.trim()?" Scene direction: "+scene.visual.trim():"";
  const assets=scene.assets?.trim()?" Planned assets: "+scene.assets.trim():"";
  if(type==="image")return 'Create a '+ratio+' '+style+' visual for this narration: "'+scene.voiceover+'".'+visual+assets+' Clear subject, intentional composition, expressive lighting, no captions, no watermark.'+character+continuity;
  return 'Animate the supplied image for '+scene.duration+' seconds.'+visual+assets+' Use natural subject and environmental motion with a controlled camera move. Preserve composition, identity, clothing, colours and visual style. No morphing, no new objects, no text.'+continuity;
}

function buildAiBrief(){
  const title=project.title||"Untitled content",style=project.visualStyle||"Not specified",ratio=project.aspectRatio||"9:16",language=project.language||"Use the script's original language",characters=project.characterBible||"Infer only when the narration requires a recurring person; otherwise use —",continuity=project.continuityNotes||"Maintain continuity whenever a subject or location repeats.";
  if(project.scenes?.length){
    const shots=project.scenes.map((scene,index)=>({scene:index+1,durationSeconds:scene.duration,voiceover:scene.voiceover,visualAnimation:scene.visual||"",assetsRequired:scene.assets||"",...(scene.timeline?{sourceTimeline:scene.timeline}:{})}));
    return `You are the scene director for this video. Add production prompts to the existing shot plan below.

RETURN FORMAT
Return only one Markdown table with exactly these columns:
| Scene | Duration | Voiceover | Character Prompt | Image Prompt | Video Prompt |

RULES
1. Return exactly ${shots.length} rows in the same order. Do not split, combine, reorder, or retime shots.
2. Preserve each shot's voiceover exactly. Keep its duration in seconds, including shots longer than 10 seconds.
3. Use each shot's Visual/Animation and Assets Required as direction for the image and video prompts.
4. Character Prompt is a reusable identity reference when needed; use — otherwise.
5. Image Prompt describes subject, setting, composition, lighting, style, and continuity. Video Prompt describes motion and camera movement from that image. Avoid text, identity drift, and new objects.
6. Never place a raw | character inside a cell. Use commas instead.

PROJECT
Title: ${title}
Language: ${language}
Aspect ratio: ${ratio}
Visual style: ${style}
Character bible: ${characters}
Continuity notes: ${continuity}

SHOT PLAN JSON
${JSON.stringify(shots,null,2)}

FULL RECORDING VOICEOVER
${canonicalScript(project)}`;
  }
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
  $("completeScene").textContent=scene.completed?"Reopen scene":canComplete(project,scene)?"Scene complete →":"Production tasks pending";
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
  if(!canComplete(project,scene))return focusMessage("Finish required production work, voiceover and editing in the workbench first.","error");
  scene.completed=true;scene.sceneState="Completed";scene.skipped=false;
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
  const issues=pendingImportKind==="storyboard"?[]:inspectScenes(pendingImport),duration=pendingImport.reduce((sum,scene)=>sum+scene.duration,0);
  $("importPreview").hidden=false;
  $("importPreview").classList.toggle("has-errors",!!issues.length);
  $("previewSummary").textContent=pendingImport.length+" scenes · "+duration+" seconds";
  $("previewIssues").textContent=issues.length?issues.slice(0,3).join(" ")+(issues.length>3?" +"+(issues.length-3)+" more.":""):pendingImportKind==="storyboard"?"Storyboard timing and columns are ready. Generation prompts can be added later.":"Voiceover, image and video prompts are aligned and ready.";
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
  if(!await save())return;$("shareEmail").value="";$("shareFeedback").textContent="Editor added. They will see this project after signing in.";renderEditors();render();
};

$("editorList").onclick=async event=>{
  const button=event.target.closest("[data-remove-editor]");
  if(!button)return;
  const email=button.dataset.removeEditor;
  if(!confirm("Remove "+email+" from this project?"))return;
  project.editorEmails=(project.editorEmails||[]).filter(item=>item!==email);
  if(!await save())return;$("shareFeedback").textContent="Editor removed.";renderEditors();render();
};

$("copyProjectLink").onclick=async()=>{
  try{await copyText(location.href);$("shareFeedback").textContent="Project link copied. Access still requires an email listed above.";}
  catch(error){$("shareFeedback").textContent=error.message;}
};

$("copyAiBrief").onclick=async()=>{
  project.script=$("fullScript").value.trim();
  if(!project.script&&project.scenes.length){project.script=project.scenes.map(scene=>scene.voiceover).filter(Boolean).join("\n\n");$("fullScript").value=project.script;$("useShotVoiceover").hidden=true;}
  if(!project.script)return status("Paste the complete voiceover before copying the ChatGPT brief.","error");
  try{await copyText(buildAiBrief());await save();status("ChatGPT brief copied. Paste it into ChatGPT, then return with the completed table.","ok");}
  catch(error){status(error.message,"error");}
};

$("useShotVoiceover").onclick=()=>{
  if($("fullScript").value.trim())return;
  project.script=project.scenes.map(scene=>scene.voiceover).filter(Boolean).join("\n\n");
  $("fullScript").value=project.script;$("useShotVoiceover").hidden=true;queueSave();
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
  try{const pasted=$("tableInput").value;pendingImportKind="storyboard";pendingImport=pasted.trim().startsWith("[")||pasted.trim().startsWith("{")?parseSceneInput(pasted,makeScene):parseProductionImport(pasted);pendingImport=uniqueScenes(project.scenes,pendingImport).scenes;renderImportPreview();$("importFeedback").textContent="Review the shots below, then confirm the import.";$("importFeedback").classList.add("toast");}
  catch(error){pendingImport=[];$("importPreview").hidden=true;$("importFeedback").textContent=error.message;$("importFeedback").classList.remove("toast");}
};

$("confirmImport").onclick=async()=>{
  if(!pendingImport.length)return;
  const replace=$("importMode").value==="replace";
  if(replace&&project.scenes.length&&!confirm("Replace all existing scenes with this reviewed breakdown?"))return;
  project.scenes=replace?pendingImport:[...project.scenes,...pendingImport];
  if(!project.script)project.script=project.scenes.map(scene=>scene.voiceover).filter(Boolean).join("\n\n");
  const firstImported=replace?project.scenes[0]:project.scenes[project.scenes.length-pendingImport.length],kind=pendingImportKind;
  $("tableInput").value="";pendingImport=[];$("importPreview").hidden=true;
  $("importFeedback").textContent="Scenes imported and aligned. Production mode is ready.";$("importFeedback").classList.add("toast");
  render();await save();if(kind==="storyboard")$("projectStoryboard").scrollIntoView({block:"start"});else openFocus(firstImported.id,"voiceover");
};

$("pasteClipboard").onclick=async()=>{
  try{$("tableInput").value=await navigator.clipboard.readText();$("importFeedback").textContent="Pasted. Press Review breakdown to validate it.";$("importPreview").hidden=true;if(looksLikeStoryboard($("tableInput").value))$("reviewImport").click();}
  catch{$("importFeedback").textContent="Clipboard access was blocked. Long-press and paste into the box.";}
};

$("tableInput").addEventListener("input",()=>{$("importPreview").hidden=true;pendingImport=[];if(looksLikeStoryboard($("tableInput").value))$("reviewImport").click();});
[$("fullScript"),$("visualStyle"),$("language"),$("characterBible"),$("continuityNotes"),$("aspectRatio")].forEach(input=>input.addEventListener("input",()=>{project[input.id==="fullScript"?"script":input.id]=input.value;queueSave();}));

$("startProduction").onclick=()=>{
  const saved=project.productionState,preferred=project.scenes.find(scene=>scene.id===saved?.sceneId&&!scene.completed&&!scene.skipped),next=preferred||project.scenes.find(scene=>!scene.completed&&!scene.skipped)||project.scenes[0];
  if(next)openFocus(next.id,preferred?saved?.field||"voiceover":"voiceover");
};

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
  if(scene){scene[focusState.field]=event.target.value;if(scene.completed)scene.completed=false;if(focusState.field==="voiceover")scene.voiceoverReady=false;queueSave();}
};

$("openAssets").onclick=()=>{renderProjectAssets();$("assetsDialog").showModal();};
$("closeAssets").onclick=()=>$("assetsDialog").close();
$("assetList").addEventListener("input",event=>{
  const container=event.target.closest("[data-asset-scene]"),scene=project.scenes.find(item=>item.id===container?.dataset.assetScene);
  if(!scene)return;
  if(event.target.dataset.assetCheck){scene[event.target.dataset.assetCheck]=event.target.checked;if(!event.target.checked)scene.completed=false;render();renderProjectAssets();}
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
  await authReady;user=auth.currentUser;
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
    cloudVersion=project.updatedAt?.toMillis?.()||0;
    try{const draft=JSON.parse(localStorage.getItem(draftKey())||'null');if(draft?.project&&draft.baseUpdatedAt===cloudVersion){project={...draft.project,ownerUid:project.ownerUid,ownerEmail:project.ownerEmail};if(snapshot?.data()?.createdAt)project.createdAt=snapshot.data().createdAt;else delete project.createdAt;delete project.updatedAt;localDirty=true;setTimeout(save,0)}}catch{}
    project.id=projectId;
    project.editorEmails=(project.editorEmails||[]).map(email=>email.toLowerCase());
    project.scenes=(project.scenes||[]).map(makeScene);
    render();$("app").hidden=false;status("Synced · "+(user.email||"signed in"),"ok");
    const saved=project.productionState;
    if(saved?.open){
      const preferred=project.scenes.find(scene=>scene.id===saved.sceneId&&!scene.completed&&!scene.skipped),next=preferred||project.scenes.find(scene=>!scene.completed&&!scene.skipped)||project.scenes.find(scene=>scene.id===saved.sceneId)||project.scenes[0];
      if(next)setTimeout(()=>openFocus(next.id,preferred?saved.field:"voiceover",false),0);
    }
    onSnapshot(projectRef,{includeMetadataChanges:true},live=>{
      if(live.metadata.hasPendingWrites)return;
      cloudVersion=live.data()?.updatedAt?.toMillis?.()||cloudVersion;
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
let observedUid;
observeAuth(current=>{const uid=current?.uid||'';if(observedUid===undefined){observedUid=uid;return}if(uid!==observedUid)location.reload()});
window.addEventListener('pagehide',()=>{if(localDirty&&project&&user)keepDraft()});
window.addEventListener('online',()=>{if(localDirty)save()});
