import{makeScene}from'./storyboard-model.js?v=3';
import{createProductionWorkbench}from'./production-workbench.js?v=11';
import{projectProgress,canComplete,canonicalScript}from'./production-model.js?v=3';
import{auth,db,authReady,observeAuth,storageError}from'../shared/firebase-client.js';
import{doc,getDoc,onSnapshot,setDoc,serverTimestamp}from"https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import{splitVoiceoverScript}from"./scene-tools.js?v=2";

const $=id=>document.getElementById(id),projectId=new URLSearchParams(location.search).get("id");
let saveChain=Promise.resolve(),editVersion=0,cloudVersion=0;
let user=null,project=null,projectRef=null,saveTimer=null,localDirty=false;

function esc(value){const node=document.createElement("div");node.textContent=value??"";return node.innerHTML;}
function attr(value){return esc(value).replace(/"/g,"&quot;").replace(/'/g,"&#39;");}
function status(message,type=""){
 const node=$("status"),icon=$("syncIndicator");
 node.textContent=type==="error"?message:"";
 node.className="sync-status "+type;node.hidden=type!=="error";
 icon.title=message;icon.setAttribute("aria-label",message);
 icon.dataset.state=type==="error"?"error":type==="ok"?"ok":"pending";
}

const storyboard=createProductionWorkbench($("projectStoryboard"),{
 getProject:()=>project,
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

function projectCompletion(){
  const scenes=project?.scenes||[];
  return projectProgress(project);
}

function render(){
  if(!project)return;
  $("projectTitle").textContent=project.title||"Untitled project";
  document.title=(project.title||"Content Project")+" · Invincible";
  const owner=project.ownerUid===user.uid,editors=project.editorEmails||[];
  $("shareProject").hidden=!owner;
  const access=owner?(editors.length?"Shared project":"Private project"):"Shared with you";
  $("shareProject").title="Share project";
  $("accessIndicator").title=access;$("accessIndicator").setAttribute("aria-label",access);
  storyboard.render();
  renderSceneWorkspace();
}

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
    render();$("app").hidden=false;status("Synced","ok");
    if(project.productionState?.open)storyboard.open({area:"Production",sceneId:project.productionState.sceneId});
    onSnapshot(projectRef,{includeMetadataChanges:true},live=>{
      if(live.metadata.hasPendingWrites)return;
      cloudVersion=live.data()?.updatedAt?.toMillis?.()||cloudVersion;
      if(!live.exists()){status("This shared project is no longer available.","error");return;}
      if(localDirty)return;
      const incoming={...live.data(),id:projectId};
      incoming.editorEmails=(incoming.editorEmails||[]).map(email=>email.toLowerCase());
      incoming.scenes=(incoming.scenes||[]).map(makeScene);
      project=incoming;render();
      status("Synced","ok");
    },error=>status("Collaboration access changed: "+error.message,"error"));
  }catch(error){status("Could not load project: "+error.message,"error");}
}

load();
let observedUid;
observeAuth(current=>{const uid=current?.uid||'';if(observedUid===undefined){observedUid=uid;return}if(uid!==observedUid)location.reload()});
window.addEventListener('pagehide',()=>{if(localDirty&&project&&user)keepDraft()});
window.addEventListener('online',()=>{if(localDirty)save()});
