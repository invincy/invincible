import{makeScene}from'./storyboard-model.js?v=3';
import{createProductionWorkbench}from'./production-workbench.js?v=2026111317';
import{projectProgress,canonicalScript}from'./production-model.js?v=2026111002';
import{auth,db,authReady,observeAuth,storageError}from'../shared/firebase-client.js';
import{collection,doc,getDoc,getDocs,onSnapshot,query,runTransaction,serverTimestamp,where}from"https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import{createProductionReadiness,mountProductionReadiness}from'./video-studio/production-readiness.js?v=2026111209';
import{splitVoiceoverScript}from"./scene-tools.js?v=2";

const queryParams=new URLSearchParams(location.search),$=id=>document.getElementById(id);
let isNewDraft=queryParams.get("draft")==="1";
const projectId=queryParams.get("id")||(isNewDraft?crypto.randomUUID():null);
if(isNewDraft&&!queryParams.has("id")){
  queryParams.set("id",projectId);
  history.replaceState(history.state,"",location.pathname+"?"+queryParams);
}
const requestedArea=queryParams.get("area"),requestedTool=queryParams.get("tool")||"";
const tabId=(()=>{try{let id=sessionStorage.getItem("invincible.creatorTabId");if(!id){id=Math.random().toString(36).slice(2)+Date.now().toString(36);sessionStorage.setItem("invincible.creatorTabId",id);}return id;}catch{return "default";}})();
let saveChain=Promise.resolve(),editVersion=0,cloudVersion=0,baseRevision=0;
let productionReadiness;
let user=null,project=null,projectRef=null,saveTimer=null,localDirty=false,pendingConflict=null,recoveredLegacyDraft=false;
let selectedArea=requestedArea||"Voiceover",selectedTool=requestedTool;

function esc(value){const node=document.createElement("div");node.textContent=value??"";return node.innerHTML;}
function attr(value){return esc(value).replace(/"/g,"&quot;").replace(/'/g,"&#39;");}
function status(message,type=""){
 const node=$("status"),icon=$("syncIndicator");
 node.textContent=type==="error"?message:"";
 node.className="sync-status "+type;node.hidden=type!=="error";
 icon.title=message;icon.setAttribute("aria-label",message);
 icon.dataset.state=type==="error"?"error":type==="ok"?"ok":"pending";
}
function onConflict(conflict){
 pendingConflict=conflict||null;
 const banner=$("conflictBanner"),msg=$("conflictMessage");
 if(!banner)return;
 if(!conflict){banner.hidden=true;return;}
 $('conflictKeepOverwrite').disabled=!!conflict.serverDeleted;
 if(conflict.source==='stale-draft'){
  const draftRev=conflict.draft?.baseRevision??'?';
  msg.textContent=`An unsaved local draft from revision ${draftRev} is on this device, while Firebase is now at revision ${conflict.serverRevision}. Discard the old draft to keep the cloud version, or restore and overwrite Firebase.`;
 }else if(conflict.serverDeleted){
  msg.textContent='This project was deleted or became unavailable in Firebase while you had unsaved changes.';
 }else{
  const revNote=Number.isInteger(conflict.serverRevision)?` (cloud r${conflict.serverRevision}, local base r${baseRevision})`:'';
  msg.textContent=`Another session updated this project in Firebase${revNote}. Reload the latest cloud copy or explicitly overwrite it with your local changes.`;
 }
 banner.hidden=false;
}

const storyboard=createProductionWorkbench($("projectStoryboard"),{
 getProject:()=>project,
 getAccountId:()=>user?.uid,
 getProductionReadiness:()=>productionReadiness,
 enableVideoStudio:true,
 defaultArea:'Storyboard',
 onChange:()=>{queueSave();renderSceneWorkspace();},
 copyText,
 onCopyBrief:async()=>{
  if(!canonicalScript(project).trim()&&!project.script?.trim())throw Error("Add scene narration or a script draft first.");
  await copyText(buildAiBrief());
 },
 onSplitScript:()=>{
  const text=project.script?.trim();if(!text)throw Error("Add a full-script draft first.");
  if(project.scenes.length&&!confirm("Replace the existing scenes with rough shots from the script draft?"))return;
  project.scenes=splitVoiceoverScript(text,makeScene);
  project.scenes.forEach(scene=>{scene.imagePrompt=starterPrompt(scene,"image");scene.videoPrompt=starterPrompt(scene,"video");});
  queueSave();render();
 }
});
window.addEventListener("message",async event=>{
  const frame=$("projectVoiceoverFrame");
  if(event.origin!==location.origin||event.source!==frame?.contentWindow)return;
  if(event.data?.type==="invincible-sync-project-script"){
    const script=String(event.data.script||"").trim(),instructions=String(event.data.creativeInstructions||"").trim();
    if(script&&project.script!==script)project.script=script;
    if(instructions&&project.notes!==instructions)project.notes=instructions;
    queueSave();
    return;
  }
  if(event.data?.type==="invincible-open-script-timing"){
    selectProjectArea("Storyboard");
    return;
  }
  if(event.data?.type!=="invincible-apply-ai-draft")return;
  try{await storyboard.openAiDraft();selectProjectArea("Video Studio");}
  catch(error){status(error.message||"The reviewed scene plan could not be opened.","error");}
});

function projectCompletion(){
  const scenes=project?.scenes||[];
  return projectProgress(project);
}

function render(){
  if(!project)return;
  $("projectTitle").textContent=project.title||"Untitled project";
  $("projectTitle").disabled=false;
  document.title=(project.title||"Content Project")+" · Invincible";
  const owner=project.ownerUid===user.uid,editors=project.editorEmails||[];
  $("shareProject").hidden=!owner||isNewDraft;
  const access=owner?(editors.length?"Shared project":"Private project"):"Shared with you";
  $("shareProject").title="Share project";
  $("accessIndicator").title=access;$("accessIndicator").setAttribute("aria-label",access);
  storyboard.render();
  renderSceneWorkspace();
}

function selectProjectArea(area,mode=""){
  selectedArea=area;selectedTool=mode;
  const isVoiceover=area==="Voiceover",isTiming=area==="Storyboard",showScriptWorkspace=isVoiceover||isTiming;
  $("projectVoiceoverStep").hidden=!showScriptWorkspace;
  $("projectEditingStep").hidden=showScriptWorkspace;
  document.body.classList.toggle("project-voiceover-active",showScriptWorkspace);
  if(showScriptWorkspace){
    const frame=$("projectVoiceoverFrame");
    if(!frame.hasAttribute("src"))frame.src="tts.html?"+new URLSearchParams({embed:"project",project:projectId,view:isTiming?"timing":"script"});
    else frame.contentWindow?.postMessage({type:"invincible-project-script-view",view:isTiming?"timing":"script"},location.origin);
  }else storyboard.open({area});
  document.querySelectorAll("[data-project-area]").forEach(button=>{
    const active=button.dataset.projectArea===area&&(button.dataset.toolMode||"")===mode;
    button.setAttribute("aria-current",active?"step":"false");
  });
}

const renameForm=$("renameProjectForm"), titleInput=$("projectTitleInput");
function closeRename(){
  renameForm.hidden=true;
  $("projectTitle").hidden=false;
  $("projectTitle").focus();
}
$("projectTitle").onclick=()=>{
  titleInput.value=project.title||"Untitled project";
  $("projectTitle").hidden=true;
  $("recentProjects").open=false;
  renameForm.hidden=false;
  titleInput.select();
};
renameForm.onkeydown=event=>{if(event.key==="Escape"){event.preventDefault();closeRename();}};
renameForm.onsubmit=async event=>{
  event.preventDefault();
  const title=titleInput.value.trim();
  if(!title){titleInput.focus();return;}
  closeRename();
  if(title===project.title&&!isNewDraft)return;
  project.title=title;
  $("projectTitle").textContent=title;
  document.title=title+" · Invincible";
  await save();
};

$("recentProjects").ontoggle=async()=>{
  if(!$("recentProjects").open||!user)return;
  const uid=user.uid,email=(user.email||"").toLowerCase(),list=$("recentProjectList");
  list.textContent="Loading projects…";
  const projects=collection(db,"creatorProjects");
  const reads=[getDocs(query(projects,where("ownerUid","==",uid)))];
  if(email)reads.push(getDocs(query(projects,where("editorEmails","array-contains",email))));
  const results=await Promise.allSettled(reads);
  if(user?.uid!==uid)return;
  const recent=new Map();
  for(const result of results)if(result.status==="fulfilled"){
    for(const row of result.value.docs)recent.set(row.id,{...row.data(),id:row.id});
  }
  const updated=item=>item.updatedAt?.toMillis?.()??(item.updatedAt?.seconds!=null?item.updatedAt.seconds*1000:Number(item.updatedAt)||0);
  list.replaceChildren();
  for(const item of [...recent.values()].sort((a,b)=>updated(b)-updated(a))){
    const link=document.createElement("a");
    link.href="project.html?"+new URLSearchParams({id:item.id,area:selectedArea,...(selectedTool?{tool:selectedTool}:{})});
    link.textContent=item.title||"Untitled project";
    if(item.id===projectId)link.setAttribute("aria-current","page");
    list.append(link);
  }
  if(!list.children.length)list.textContent=results.some(result=>result.status==="rejected")?"Could not load projects.":"No saved projects yet.";
};
$("recentProjects").addEventListener("click",async event=>{
  const link=event.target.closest("a[href]");
  if(!link||!localDirty||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
  event.preventDefault();
  if(await save())location.assign(link.href);
});

function renderSceneWorkspace(){
  const scenes=project.scenes||[];
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
function legacyDraftKey(){return 'invincible.creatorDraft.'+user.uid+'.'+projectId}
function draftKey(){const id=typeof tabId==='string'?tabId:'default';return legacyDraftKey()+'.'+id}
function clearLocalDraft(){try{localStorage.removeItem(draftKey());if(typeof recoveredLegacyDraft!=='undefined'&&recoveredLegacyDraft){localStorage.removeItem(legacyDraftKey());recoveredLegacyDraft=false;}}catch{}}
function keepDraft(){const id=typeof tabId==='string'?tabId:'default';try{localStorage.setItem(draftKey(),JSON.stringify({project,baseUpdatedAt:cloudVersion,baseRevision,tabId:id}))}catch(error){status("Could not keep a local draft: "+error.message,"error")}}
function buildProjectWrite(payload,server,nextRev,{isCreate=false}={}){
 const {createdAt:_c,updatedAt:_u,writtenAt:_w,writtenBy:_wb,writeRevision:_r,...clean}=payload;
 if(isCreate){
  return {...clean,id:projectId,ownerUid:clean.ownerUid||user.uid,ownerEmail:clean.ownerEmail||(user.email||"").toLowerCase(),editorEmails:clean.editorEmails||[],writeRevision:nextRev,writtenBy:user.uid,writtenAt:serverTimestamp(),createdAt:serverTimestamp(),updatedAt:serverTimestamp()};
 }
 const isOwner=(server.ownerUid||clean.ownerUid)===user.uid;
 const out={...clean,id:projectId,ownerUid:server.ownerUid||clean.ownerUid||user.uid,writeRevision:nextRev,writtenBy:user.uid,writtenAt:serverTimestamp(),updatedAt:serverTimestamp()};
 if(server.ownerEmail!==undefined)out.ownerEmail=server.ownerEmail;
 else if(isOwner)out.ownerEmail=clean.ownerEmail||(user.email||"").toLowerCase();
 if(isOwner)out.editorEmails=clean.editorEmails??server.editorEmails??[];
 else if(server.editorEmails!==undefined)out.editorEmails=server.editorEmails;
 if(server.createdAt!==undefined)out.createdAt=server.createdAt;
 return out;
}
async function save(options={}){
 if(!user||!project||!projectRef)return false;
 const force=!!options?.force,writerUid=user.uid;
 clearTimeout(saveTimer);saveTimer=null;localDirty=true;const version=++editVersion,payload=copyProject(project),ref=projectRef;
 keepDraft();status("Saving…");
 const result=saveChain.then(async()=>{
  const expectedBase=baseRevision;
  try{
   const txResult=await runTransaction(db,async tx=>{
    const snap=await tx.get(ref);if(user?.uid!==writerUid||ref!==projectRef)throw Object.assign(Error('Account changed during save.'),{code:'cancelled'});
    if(snap.exists()){
     const server=snap.data()||{};
     const serverRev=Number.isInteger(server.writeRevision)?server.writeRevision:0;
     if(!force&&serverRev!==expectedBase){
      const err=new Error('A newer cloud version exists (revision '+serverRev+', local base '+expectedBase+').');
      err.code='revision-conflict';err.serverData=server;err.serverRevision=serverRev;
      throw err;
     }
     const nextRev=serverRev+1;
     tx.set(ref,buildProjectWrite(payload,server,nextRev));
     return {nextRev};
    }
    if(typeof isNewDraft!=='undefined'&&isNewDraft&&expectedBase===0){
     tx.set(ref,buildProjectWrite(payload,{},1,{isCreate:true}));
     return {nextRev:1,created:true};
    }
    const err=new Error('This project was deleted or is no longer available in Firebase.');
    err.code='revision-conflict';err.serverDeleted=true;throw err;
   });
   if(user?.uid!==writerUid||ref!==projectRef)return false;
   baseRevision=txResult.nextRev;
   if(project)project.writeRevision=txResult.nextRev;
   if(txResult.created){
    finishDraft();
    $("shareProject").hidden=false;
    watchProject();
   }
   if(typeof onConflict==='function')onConflict(null);
   if(version===editVersion){localDirty=false;clearLocalDraft();status("Saved to Firebase","ok")}
   else{keepDraft();}
   return true;
  }catch(error){
   if(error?.code==='revision-conflict'||error?.code==='aborted'){
    if(typeof onConflict==='function')onConflict({source:'save',error,serverData:error.serverData||null,serverRevision:error.serverRevision,serverDeleted:!!error.serverDeleted});
   }
   status(storageError(error)+" Your draft is kept on this device.","error");
   return false;
  }
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
    const shots=project.scenes.map((scene,index)=>({scene:index+1,durationSeconds:scene.duration,voiceover:scene.voiceover,visualAnimation:scene.visual||"",assetsRequired:scene.assets||"",voiceoverTimestamp:scene.voiceoverTimestamp||"",...(scene.timeline?{sourceTimeline:scene.timeline}:{})}));
    return `You are the scene director for this video. Add production prompts to the existing shot plan below.

RETURN FORMAT
Return only one Markdown table with exactly these columns:
| Scene | Duration | Voiceover | Character Prompt | Image Prompt | Video Prompt | Timestamp |

RULES
1. Return exactly ${shots.length} rows in the same order. Do not split, combine, reorder, or retime shots.
2. Preserve each shot's voiceover exactly. Keep its duration in seconds, including shots longer than 10 seconds.
3. Use each shot's Visual/Animation and Assets Required as direction for the image and video prompts.
4. Character Prompt is a reusable identity reference when needed; use — otherwise.
5. Image Prompt describes subject, setting, composition, lighting, style, and continuity. Video Prompt describes motion and camera movement from that image. Avoid text, identity drift, and new objects.
6. Preserve supplied voiceover timestamps exactly in the last Timestamp column. Leave it blank if no aligned audio timestamp was supplied; never estimate it from text.
7. Never place a raw | character inside a cell. Use commas instead.

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
| Scene | Duration | Voiceover | Character Prompt | Image Prompt | Video Prompt | Timestamp |

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
10. Timestamp is the final column. Leave it blank without aligned audio timing; do not invent exact timestamps from text.

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
  const prevEditors=[...(project.editorEmails||[])];
  project.editorEmails=[...new Set([...prevEditors,email])];
  if(!await save()){project.editorEmails=prevEditors;$("shareFeedback").textContent=$("status").textContent||"Could not update editors.";return;}
  $("shareEmail").value="";$("shareFeedback").textContent="Editor added. They will see this project after signing in.";renderEditors();render();
};

$("editorList").onclick=async event=>{
  const button=event.target.closest("[data-remove-editor]");
  if(!button)return;
  const email=button.dataset.removeEditor;
  if(!confirm("Remove "+email+" from this project?"))return;
  const prevEditors=[...(project.editorEmails||[])];
  project.editorEmails=prevEditors.filter(item=>item!==email);
  if(!await save()){project.editorEmails=prevEditors;$("shareFeedback").textContent=$("status").textContent||"Could not update editors.";return;}
  $("shareFeedback").textContent="Editor removed.";renderEditors();render();
};

$("copyProjectLink").onclick=async()=>{
  try{await copyText(location.href);$("shareFeedback").textContent="Project link copied. Access still requires an email listed above.";}
  catch(error){$("shareFeedback").textContent=error.message;}
};

document.querySelector(".project-workspace-nav").addEventListener("click",event=>{
  const button=event.target.closest("[data-project-area]");
  if(!button)return;
  selectProjectArea(button.dataset.projectArea,button.dataset.toolMode||"");
});
$("saveProjectNow").onclick=async()=>{if(await save())status("Saved to Firebase","ok");};
$("saveAndReturn").onclick=async()=>{const button=$("saveAndReturn");button.disabled=true;button.textContent="Saving…";if(await save())location.href="/invincible/creator/";else{button.disabled=false;button.textContent="Save & return";}};

function applyIncomingProject(data){
  const incoming={...data,id:projectId};
  incoming.editorEmails=(incoming.editorEmails||[]).map(email=>email.toLowerCase());
  incoming.scenes=(incoming.scenes||[]).map(makeScene);
  cloudVersion=data?.updatedAt?.toMillis?.()||cloudVersion||0;
  baseRevision=Number.isInteger(data?.writeRevision)?data.writeRevision:0;
  project=incoming;
  onConflict(null);
  render();
}

$("conflictReload").onclick=async()=>{
  clearTimeout(saveTimer);saveTimer=null;
  editVersion++;
  await saveChain.catch(()=>false);
  localDirty=false;
  clearLocalDraft();
  try{
    const latest=await getDoc(projectRef);
    if(!latest.exists()){
      onConflict(null);
      status("This shared project is no longer available.","error");
      return;
    }
    applyIncomingProject(latest.data());
    status("Reloaded latest version from Firebase","ok");
  }catch(error){
    status("Could not reload project: "+error.message,"error");
  }
};

$("conflictKeepOverwrite").onclick=async()=>{
  if(pendingConflict?.source==='stale-draft'&&pendingConflict.draft?.project){
    const draftProj=pendingConflict.draft.project;
    project={
      ...draftProj,
      id:projectId,
      ownerUid:project.ownerUid,
      ownerEmail:project.ownerEmail,
      editorEmails:(draftProj.editorEmails||project.editorEmails||[]).map(email=>email.toLowerCase()),
      scenes:(draftProj.scenes||[]).map(makeScene)
    };
    if(project.createdAt===undefined)delete project.createdAt;
    delete project.updatedAt;
    render();
  }
  await save({force:true});
};

document.addEventListener("visibilitychange",()=>{if(document.hidden&&saveTimer)save();});

function finishDraft(){
  if(!isNewDraft)return;
  isNewDraft=false;
  queryParams.delete("draft");
  history.replaceState(history.state,"",location.pathname+"?"+queryParams);
}

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
      project=await runTransaction(db,async tx=>{
        const existing=await tx.get(projectRef);
        if(existing.exists())return existing.data();
        const {createdAt:_c,updatedAt:_u,writtenAt:_w,writtenBy:_wb,writeRevision:_r,...clean}=legacyProject;
        tx.set(projectRef,{...clean,id:projectId,ownerUid:user.uid,ownerEmail:(user.email||"").toLowerCase(),editorEmails:[],writeRevision:1,writtenBy:user.uid,writtenAt:serverTimestamp(),createdAt:serverTimestamp(),updatedAt:serverTimestamp()});
        return {...clean,id:projectId,ownerUid:user.uid,ownerEmail:(user.email||"").toLowerCase(),editorEmails:[],writeRevision:1};
      });
    }
    if(snapshot?.exists())project=snapshot.data();
    if(project)finishDraft();
    else if(isNewDraft){
      project={id:projectId,title:"Untitled project",stage:"Ideas",format:"Short",aspectRatio:"9:16",script:"",scenes:[],ownerUid:user.uid,ownerEmail:(user.email||"").toLowerCase(),editorEmails:[]};
    }
    else if(!project){status("This project was not found or has not been shared with your account.","error");return;}
    cloudVersion=project.updatedAt?.toMillis?.()||0;
    baseRevision=Number.isInteger(project.writeRevision)?project.writeRevision:0;
    let recoveredStaleDraft=null;
    recoveredLegacyDraft=false;
    try{
      let rawDraft=localStorage.getItem(draftKey()),fromLegacy=false;
      if(!rawDraft){rawDraft=localStorage.getItem(legacyDraftKey());fromLegacy=!!rawDraft;}
      const draft=JSON.parse(rawDraft||'null');
      if(draft?.project){
        const revisionMatches=typeof draft.baseRevision==='number'?draft.baseRevision===baseRevision:true;
        recoveredLegacyDraft=fromLegacy;
        if(revisionMatches&&draft.baseUpdatedAt===cloudVersion){
          project={...draft.project,ownerUid:project.ownerUid,ownerEmail:project.ownerEmail};
          if(snapshot?.data()?.createdAt)project.createdAt=snapshot.data().createdAt;else delete project.createdAt;
          delete project.updatedAt;
          localDirty=true;
          setTimeout(()=>save(),0);
        }else{
          recoveredStaleDraft=draft;
        }
      }
    }catch{}
    project.id=projectId;
    project.editorEmails=(project.editorEmails||[]).map(email=>email.toLowerCase());
    project.scenes=(project.scenes||[]).map(makeScene);
    productionReadiness=mountProductionReadiness(document.querySelector(".project-readiness"),createProductionReadiness(()=>user?.uid));
    render();$("app").hidden=false;status(isNewDraft?"Unsaved project":"Synced",isNewDraft?"":"ok");
    if(recoveredStaleDraft){
      onConflict({source:'stale-draft',draft:recoveredStaleDraft,serverData:project,serverRevision:baseRevision,serverUpdatedAt:cloudVersion});
      status(storageError({code:'revision-conflict'})+" An earlier local draft is waiting for your decision.","error");
    }
    if(requestedArea)selectProjectArea(requestedArea,requestedTool);
    else selectProjectArea("Voiceover");
    if(!isNewDraft)watchProject();
  }catch(error){status("Could not load project: "+error.message,"error");}
}

function watchProject(){
  onSnapshot(projectRef,{includeMetadataChanges:true},live=>{
      if(live.metadata.hasPendingWrites)return;
      if(!live.exists()){
        if(localDirty||pendingConflict?.source==='stale-draft'){
          onConflict({source:'snapshot',serverDeleted:true});
          status("This shared project is no longer available. Your draft is kept on this device.","error");
        }else{
          status("This shared project is no longer available.","error");
        }
        return;
      }
      const data=live.data()||{};
      const remoteRev=Number.isInteger(data.writeRevision)?data.writeRevision:0;
      const remoteUpdatedAt=data.updatedAt?.toMillis?.()||0;
      // Repeated metadata/own-write acknowledgements must not remount an active editor.
      if(remoteRev>0&&remoteRev===baseRevision&&pendingConflict?.source!=='stale-draft'){
        cloudVersion=remoteUpdatedAt||cloudVersion;
        if(localDirty)keepDraft();
        return;
      }
      if(localDirty||pendingConflict?.source==='stale-draft'){
        if(remoteRev>baseRevision||(remoteRev===0&&baseRevision===0&&remoteUpdatedAt>cloudVersion)){
          if(pendingConflict?.source==='stale-draft'){
            baseRevision=remoteRev;cloudVersion=remoteUpdatedAt||cloudVersion;
            onConflict({...pendingConflict,serverData:data,serverRevision:remoteRev,serverUpdatedAt:remoteUpdatedAt});
          }else{
            onConflict({source:'snapshot',serverData:data,serverRevision:remoteRev,serverUpdatedAt:remoteUpdatedAt});
            status(storageError({code:'revision-conflict'})+" Your draft is kept on this device.","error");
          }
        }
        return;
      }
      cloudVersion=remoteUpdatedAt||cloudVersion;
      applyIncomingProject(data);
      status("Synced","ok");
  },error=>status("Collaboration access changed: "+error.message,"error"));
}

load();
let observedUid;
observeAuth(current=>{const uid=current?.uid||'';if(observedUid===undefined){observedUid=uid;return}if(uid!==observedUid){user=null;projectRef=null;clearTimeout(saveTimer);location.reload();}});
window.addEventListener('pagehide',()=>{if(localDirty&&project&&user)keepDraft()});
window.addEventListener('online',()=>{if(localDirty)save()});
