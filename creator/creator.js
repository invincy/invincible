import {initializeMapProject} from './map-defaults.js?v=2026110903';
import {attachImportedGroups} from './production-model.js?v=2026111002';
import{createProductionWorkbench}from'./production-workbench.js?v=2026111208';
import{createMediaClient,createStartingVoiceoverManifest,inspectMedia}from'./media-library.js?v=2026111301';
import{PRESETS}from'./video-studio/model.js?v=2026111207';
import{db,observeAuth,storageError}from'../shared/firebase-client.js';
import{collection,deleteDoc,doc,getDoc,getDocs,onSnapshot,query,runTransaction,serverTimestamp,where}from"https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const $=id=>document.getElementById(id);
const stages=["Ideas","Research","Script","Record","Edit","Scheduled","Published"];
let subscriptions=[],authGeneration=0;
let user=null,state={items:[]},ownedItems=new Map(),sharedItems=new Map(),editingId="",filter="All",queryText="",mobileStage="Ideas",metricFilter="";

let dialogScenes=[],dialogProject=null,dialogId="",savingContent=false,dialogWasNew=false,dialogVoiceoverAttached=false,pendingProjectArea="Video Studio",pendingToolMode="";
const storyboard=createProductionWorkbench($("contentStoryboard"),{
 getProject:()=>dialogProject,
 onChange:()=>{
  dialogScenes=dialogProject.scenes;
  for(const key of ["script","hook","notes"])$("contentForm").elements[key].value=dialogProject[key]||"";
  updateShotSummary();
 },
 copyText:async value=>{
  try{await navigator.clipboard.writeText(value);}
  catch{
   const input=document.createElement("textarea");input.value=value;input.style.position="fixed";input.style.opacity="0";$("contentDialog").append(input);input.select();
   const copied=document.execCommand("copy");input.remove();if(!copied)throw Error("Clipboard access was blocked.");
  }
 }
});
$("contentForm").addEventListener("input",event=>{
 const name=event.target.name;
 if(dialogProject&&["title","script","hook","notes","format","stage","series","publishDate"].includes(name))dialogProject[name]=event.target.value;
});
function updateShotSummary(){
  const count=dialogScenes.length,duration=dialogScenes.reduce((total,scene)=>total+(Number(scene.duration)||0),0);
  $("contentShotSummary").textContent=count?count+" scenes · "+duration+"s":"No scenes";
}

const newId=()=>crypto.randomUUID?.()||String(Date.now()+Math.random());
const today=()=>new Date().toISOString().slice(0,10);
function esc(value){const node=document.createElement("div");node.textContent=value??"";return node.innerHTML;}
function attr(value){return esc(value).replace(/"/g,"&quot;").replace(/'/g,"&#39;");}
function status(message,type=""){$("status").textContent=message;$("status").className="sync-status "+type;}
function isOwner(item){return item.ownerUid===user?.uid;}
function metricMatch(item){if(!metricFilter)return true;if(metricFilter==="pipeline")return item.stage!=="Published";if(metricFilter==="record")return item.stage==="Record";if(metricFilter==="published")return item.stage==="Published";if(metricFilter==="next"){const next=state.items.filter(row=>row.stage==="Scheduled"&&row.publishDate).sort((a,b)=>a.publishDate.localeCompare(b.publishDate))[0];return item.id===next?.id;}return true;}
function filtered(){return state.items.filter(item=>metricMatch(item)&&(filter==="All"||item.format===filter)&&(!queryText||[item.title,item.hook,item.series].join(" ").toLowerCase().includes(queryText)));}
function dateLabel(date){if(!date)return"";return new Date(date+"T00:00:00").toLocaleDateString("en-IN",{day:"numeric",month:"short"});}
function moveButton(item,direction){const index=stages.indexOf(item.stage),next=index+direction;return '<button data-move="'+direction+'" data-id="'+item.id+'" aria-label="Move '+(direction<0?'back':'forward')+'" '+(next<0||next>=stages.length?'disabled':'')+'>'+(direction<0?'‹':'›')+'</button>';}

function card(item){
  const overdue=item.publishDate&&item.publishDate<today()&&item.stage!=="Published",sceneCount=item.scenes?.length||0,completeCount=item.scenes?.filter(scene=>scene.completed).length||0,shared=!isOwner(item),editorCount=item.editorEmails?.length||0,accessLabel=shared?"Shared with you":editorCount?"Shared · "+editorCount:"Private";
  return '<article class="content-card" draggable="true" data-id="'+item.id+'" tabindex="0" aria-label="Open '+attr(item.title)+'"><div class="card-top"><span class="format">'+esc(item.format)+'</span><span class="due '+(overdue?'overdue':'')+'">'+(item.publishDate?dateLabel(item.publishDate):"No date")+'</span></div><h3>'+esc(item.title)+'</h3>'+(item.hook?'<p class="hook">'+esc(item.hook)+'</p>':'')+'<div class="project-meta"><span>'+sceneCount+' scene'+(sceneCount===1?'':'s')+(sceneCount?' · '+completeCount+' ready':'')+'</span><span class="access-tag '+(shared?'shared':'')+'">'+accessLabel+'</span></div><button class="open-project" data-open="'+item.id+'">Open Project <span>→</span></button><div class="card-bottom"><span class="series">'+esc(item.series||"General")+'</span><div class="card-actions"><button data-edit="'+item.id+'">Edit</button>'+moveButton(item,-1)+moveButton(item,1)+'</div></div></article>';
}

function homeCard(item){
  const overdue=item.publishDate&&item.publishDate<today()&&item.stage!=="Published",sceneCount=item.scenes?.length||0,completeCount=item.scenes?.filter(scene=>scene.completed).length||0,shared=!isOwner(item),editorCount=item.editorEmails?.length||0,accessLabel=shared?"Shared with you":editorCount?"Shared · "+editorCount:"Private",progress=sceneCount?Math.round(completeCount/sceneCount*100):0;
  return '<article class="content-card project-home-card" draggable="true" data-id="'+item.id+'" tabindex="0" aria-label="Open '+attr(item.title)+'"><div class="project-home-top"><span class="project-mark" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 4h14v16H5zM9 8l7 4-7 4z"/></svg></span><div><span class="project-stage">'+esc(item.stage||"Ideas")+'</span><span class="due '+(overdue?'overdue':'')+'">'+(item.publishDate?dateLabel(item.publishDate):"No date")+'</span></div></div><h3>'+esc(item.title)+'</h3>'+(item.hook?'<p class="hook">'+esc(item.hook)+'</p>':'')+'<div class="project-home-meta"><span>'+esc(item.series||"General")+'</span><span class="access-tag '+(shared?'shared':'')+'">'+accessLabel+'</span></div><div class="project-progress-copy"><span>'+(sceneCount?sceneCount+' scenes':'Storyboard not started')+'</span><strong>'+(sceneCount?completeCount+' ready':item.format||'Project')+'</strong></div><div class="project-progress-bar" aria-label="'+progress+' percent of scenes ready"><span style="width:'+progress+'%"></span></div><div class="project-home-actions"><button class="open-project" data-open="'+item.id+'">Open Project <span>→</span></button><div class="card-actions"><button data-edit="'+item.id+'" aria-label="Edit '+attr(item.title)+'">Edit</button>'+moveButton(item,-1)+moveButton(item,1)+'</div></div></article>';
}

function renderMetrics(){
  const active=state.items.filter(item=>item.stage!=="Published"),scheduled=state.items.filter(item=>item.stage==="Scheduled"&&item.publishDate).sort((a,b)=>a.publishDate.localeCompare(b.publishDate));
  $("inPipeline").textContent=active.length;$("readyCount").textContent=state.items.filter(item=>item.stage==="Record").length;$("publishedCount").textContent=state.items.filter(item=>item.stage==="Published").length;$("nextRelease").textContent=scheduled[0]?dateLabel(scheduled[0].publishDate):"—";$("nextReleaseTitle").textContent=scheduled[0]?.title||"nothing scheduled";
}

function render(){
  renderMetrics();const items=filtered();
  const metricLabels={pipeline:"Active projects in the pipeline",record:"Projects ready to record",next:"Next scheduled release",published:"Published projects"};
  $("metricView").hidden=!metricFilter;$("metricViewLabel").textContent=metricLabels[metricFilter]||"";document.querySelectorAll("[data-metric]").forEach(card=>card.classList.toggle("active",card.dataset.metric===metricFilter));
  $("stageTabs").innerHTML=stages.map(stage=>'<button data-stage="'+stage+'" class="'+(mobileStage===stage?'active':'')+'">'+stage+' · '+items.filter(item=>item.stage===stage).length+'</button>').join("");
  $("board").innerHTML=stages.map(stage=>{const rows=items.filter(item=>item.stage===stage).sort((a,b)=>(a.publishDate||"9999").localeCompare(b.publishDate||"9999"));return '<section class="column '+(mobileStage===stage?'mobile-active':'')+'" data-stage="'+stage+'"><div class="column-head"><h2>'+stage+'</h2><span class="column-count">'+rows.length+'</span></div><div class="cards">'+(rows.length?rows.map(card).join(""):'<div class="empty">No content here</div>')+'</div></section>';}).join("");
  const recent=[...items].sort((a,b)=>Number(b.updatedAt?.seconds||b.updatedAt||0)-Number(a.updatedAt?.seconds||a.updatedAt||0));
  $("projectGrid").innerHTML=recent.map(homeCard).join("");
  $("projectCount").textContent=String(recent.length);
  $("projectEmpty").hidden=recent.length>0;
  bindDrag();
}

function mergeProjects(){
  const merged=new Map([...sharedItems,...ownedItems]);
  state.items=[...merged.values()];render();$("app").hidden=false;status("Synced · "+(user.email||"signed in"),"ok");
}

async function saveItem(item){
  attachImportedGroups(item,item.scenes||[]);
  if(!user)throw Error("Restore your Google session on Dashboard before saving.");
  status("Saving…");
  const mustExist=arguments[1]?.mustExist===true,writerUid=user.uid;
  const expectedRevision=Number.isInteger(item.writeRevision)?item.writeRevision:0;
  const {createdAt:_c,updatedAt:_u,writtenAt:_w,writtenBy:_wb,writeRevision:_r,...clean}=item;
  try{
    const result=await runTransaction(db,async tx=>{
      const ref=doc(db,"creatorProjects",item.id);
      const snap=await tx.get(ref);if(user?.uid!==writerUid)throw Object.assign(Error('Account changed during save.'),{code:'cancelled'});
      if(!snap.exists()){
        if(expectedRevision>0||mustExist){
          const err=new Error("This project no longer exists in Firebase.");
          err.code="revision-conflict";
          throw err;
        }
        tx.set(ref,{...clean,id:item.id,ownerUid:clean.ownerUid||user.uid,ownerEmail:clean.ownerEmail||(user.email||"").toLowerCase(),editorEmails:clean.editorEmails||[],writeRevision:1,writtenBy:user.uid,writtenAt:serverTimestamp(),createdAt:serverTimestamp(),updatedAt:serverTimestamp()});
        return {writeRevision:1};
      }
      const remote=snap.data()||{};
      const serverRev=Number.isInteger(remote.writeRevision)?remote.writeRevision:0;
      if(serverRev!==expectedRevision){
        const err=new Error("This project was updated in another session or tab.");
        err.code="revision-conflict";
        throw err;
      }
      const isRemoteOwner=remote.ownerUid===user.uid;
      const nextRev=serverRev+1;
      const payload={...clean,id:item.id,ownerUid:remote.ownerUid,writeRevision:nextRev,writtenBy:user.uid,writtenAt:serverTimestamp(),updatedAt:serverTimestamp()};
      if(remote.ownerEmail!==undefined)payload.ownerEmail=remote.ownerEmail;
      else if(isRemoteOwner)payload.ownerEmail=clean.ownerEmail||(user.email||"").toLowerCase();
      if(isRemoteOwner)payload.editorEmails=clean.editorEmails??remote.editorEmails??[];
      else if(remote.editorEmails!==undefined)payload.editorEmails=remote.editorEmails;
      if(remote.createdAt!==undefined)payload.createdAt=remote.createdAt;
      tx.set(ref,payload);
      return {writeRevision:nextRev};
    });
    if(user?.uid!==writerUid)return result;
    item.writeRevision=result.writeRevision;
    status("Synced to Firebase","ok");
    return result;
  }catch(error){
    status(storageError(error),"error");
    throw error;
  }
}

async function migrateLegacyProjects(){
  const migrationUser=user,migrationGeneration=authGeneration,active=()=>user?.uid===migrationUser.uid&&authGeneration===migrationGeneration;
  const snapshot=await getDoc(doc(db,"users",migrationUser.uid,"creator","main")),items=snapshot.data()?.items||[],existing=await getDocs(query(collection(db,"creatorProjects"),where("ownerUid","==",migrationUser.uid))),existingIds=new Set(existing.docs.map(row=>row.id));
  if(!active())return;
  for(const item of items){
    if(!existingIds.has(item.id)){
      const {createdAt:_c,updatedAt:_u,writtenAt:_w,writtenBy:_wb,writeRevision:_r,...clean}=item;
      await runTransaction(db,async tx=>{
        const ref=doc(db,"creatorProjects",item.id);
        const existing=await tx.get(ref);if(!active())throw Object.assign(Error('Account changed during migration.'),{code:'cancelled'});if(existing.exists())return;
        tx.set(ref,{...clean,id:item.id,ownerUid:migrationUser.uid,ownerEmail:(migrationUser.email||"").toLowerCase(),editorEmails:[],writeRevision:1,writtenBy:migrationUser.uid,writtenAt:serverTimestamp(),createdAt:serverTimestamp(),updatedAt:serverTimestamp()});
      });
    }
  }
}

function subscribeProjects(){
  const projects=collection(db,"creatorProjects"),email=(user.email||"").toLowerCase();
  subscriptions.push(onSnapshot(query(projects,where("ownerUid","==",user.uid)),snapshot=>{ownedItems=new Map(snapshot.docs.map(row=>[row.id,{...row.data(),id:row.id}]));mergeProjects();},error=>status("Could not load your projects: "+error.message,"error")));
  if(email)subscriptions.push(onSnapshot(query(projects,where("editorEmails","array-contains",email)),snapshot=>{sharedItems=new Map(snapshot.docs.map(row=>[row.id,{...row.data(),id:row.id}]));mergeProjects();},error=>status("Could not load shared projects: "+error.message,"error")));
}

function openDialog(item=null,{area="Voiceover",mode=""}={}){
  pendingProjectArea=area;pendingToolMode=mode;
  dialogWasNew=!item;
  dialogVoiceoverAttached=!!item;
  editingId=item?.id||"";dialogId=editingId||newId();
  const clone=value=>JSON.parse(JSON.stringify(value));
  dialogProject={...(item||{}),title:item?.title||"",script:item?.script||"",hook:item?.hook||"",notes:item?.notes||"",historicalMap:item?.historicalMap?clone(item.historicalMap):null,productionClips:clone(item?.productionClips||[]),scenes:clone(item?.scenes||[]),animationGroups:clone(item?.animationGroups||[]),assets:clone(item?.assets||[])};
  if(!item)initializeMapProject(dialogProject);
  dialogScenes=dialogProject.scenes;
  $("contentSaveError").textContent="";
  const form=$("contentForm");form.reset();
  $("dialogHeading").textContent=item?"Edit project":"New project";
  $("deleteContent").hidden=!item||!isOwner(item);
  $("saveContent").textContent=item?"Save":"Create";
  $("contentDetails").open=false;
  document.querySelector(".advanced-project-setup").open=false;
  $("projectVoiceover").value="";
  form.elements.instructions.value=item?.notes||"";
  if(item)Object.entries(item).forEach(([key,value])=>{if(form.elements[key])form.elements[key].value=value??"";});else form.elements.stage.value=mobileStage;
  storyboard.reset();updateShotSummary();
  $("contentDialog").showModal();form.scrollTop=0;setTimeout(()=>form.elements.title.focus(),0);
}

function bindDrag(){
  document.querySelectorAll(".content-card").forEach(card=>{card.ondragstart=event=>{card.classList.add("dragging");event.dataTransfer.setData("text/plain",card.dataset.id);};card.ondragend=()=>card.classList.remove("dragging");});
  document.querySelectorAll(".column").forEach(column=>{column.ondragover=event=>{event.preventDefault();column.classList.add("drag-over");};column.ondragleave=()=>column.classList.remove("drag-over");column.ondrop=async event=>{event.preventDefault();column.classList.remove("drag-over");const item=state.items.find(row=>row.id===event.dataTransfer.getData("text/plain"));if(item&&item.stage!==column.dataset.stage){const prevStage=item.stage;item.stage=column.dataset.stage;render();try{await saveItem(item,{mustExist:true});}catch{item.stage=prevStage;render();}}};});
}

$("stageSelect").innerHTML=stages.map(stage=>'<option>'+stage+'</option>').join("");
$("addContent").onclick=()=>openDialog();
document.querySelectorAll("dialog .close").forEach(button=>button.onclick=()=>$("contentDialog").close());
$("stageTabs").onclick=event=>{const button=event.target.closest("[data-stage]");if(!button)return;mobileStage=button.dataset.stage;render();};
document.querySelector(".metrics").onclick=event=>{const card=event.target.closest("[data-metric]");if(!card)return;metricFilter=metricFilter===card.dataset.metric?"":card.dataset.metric;const first=state.items.find(metricMatch);if(first)mobileStage=first.stage;render();$("board").scrollIntoView({behavior:"smooth",block:"start"});};
$("clearMetric").onclick=()=>{metricFilter="";render();};
document.querySelector(".filter-group").onclick=event=>{const button=event.target.closest("[data-filter]");if(!button)return;filter=button.dataset.filter;document.querySelectorAll(".filter").forEach(item=>item.classList.toggle("active",item===button));render();};
$("searchInput").oninput=event=>{queryText=event.target.value.trim().toLowerCase();render();};

async function handleProjectClick(event){
  const move=event.target.closest("[data-move]");
  if(move){event.stopPropagation();const item=state.items.find(row=>row.id===move.dataset.id),next=stages.indexOf(item.stage)+Number(move.dataset.move);if(stages[next]){const prevStage=item.stage,prevMobile=mobileStage;item.stage=stages[next];mobileStage=item.stage;render();try{await saveItem(item,{mustExist:true});}catch{item.stage=prevStage;mobileStage=prevMobile;render();}}return;}
  const edit=event.target.closest("[data-edit]");if(edit){event.stopPropagation();openDialog(state.items.find(row=>row.id===edit.dataset.edit));return;}
  const open=event.target.closest("[data-open]");if(open){event.stopPropagation();window.location.href="project.html?id="+encodeURIComponent(open.dataset.open);return;}
  const cardElement=event.target.closest(".content-card");if(cardElement)window.location.href="project.html?id="+encodeURIComponent(cardElement.dataset.id);
}
$("board").onclick=handleProjectClick;
$("projectGrid").onclick=handleProjectClick;

$("board").onkeydown=event=>{if((event.key==="Enter"||event.key===" ")&&!event.target.closest("button")){event.preventDefault();const card=event.target.closest(".content-card");if(card)window.location.href="project.html?id="+encodeURIComponent(card.dataset.id);}};
$("projectGrid").onkeydown=$("board").onkeydown;

function openToolPicker(area,mode=""){
  pendingProjectArea=area;pendingToolMode=mode;
  $("toolDialogTitle").textContent="Choose a project for "+(mode==="battlefield"?"Battlefield Editor":area);
  $("toolProjectList").innerHTML=state.items.length?state.items.map(item=>'<a href="project.html?id='+encodeURIComponent(item.id)+'&area='+encodeURIComponent(area)+(mode?'&tool='+encodeURIComponent(mode):'')+'"><strong>'+esc(item.title||"Untitled project")+'</strong><span>'+esc(item.stage||"Ideas")+' · '+(item.scenes?.length||0)+' scenes</span></a>').join(""):'<p class="project-empty">No projects yet. Start one to open this tool.</p>';
  $("toolDialog").showModal();
}
document.querySelector(".tool-grid").onclick=event=>{const button=event.target.closest("[data-project-tool]");if(button)openToolPicker(button.dataset.projectTool,button.dataset.toolMode||"");};
$("toolNewProject").onclick=()=>{$("toolDialog").close();openDialog(null,{area:pendingProjectArea,mode:pendingToolMode});};

async function attachStartingVoiceover(projectId,file,title){
  if(!file)return;
  const info=await inspectMedia(file);
  if(info.kind!=="audio")throw Error("Choose an MP3 or WAV voiceover.");
  if(!Number.isFinite(info.duration)||info.duration<=0||info.duration>600)throw Error("Voiceover must be no longer than 10 minutes.");
  const media=createMediaClient(user.uid),asset=await media.upload(file,info);
  const manifest=createStartingVoiceoverManifest({title,asset,duration:info.duration,clipId:newId()});
  await media.saveDraft(projectId,manifest,structuredClone(PRESETS),0);
}

$("contentForm").onsubmit=async event=>{
  event.preventDefault();if(savingContent||!user)return;
  const form=event.currentTarget,data=new FormData(form),existing=state.items.find(row=>row.id===editingId),generation=authGeneration;
  const instructions=String(data.get("instructions")||"").trim();
  const item={...(existing||{}),id:dialogId,title:data.get("title").trim(),format:data.get("format"),stage:data.get("stage"),series:data.get("series"),publishDate:data.get("publishDate"),hook:data.get("hook").trim(),script:data.get("script"),notes:instructions||data.get("notes"),visualStyle:dialogProject.visualStyle||"",aspectRatio:dialogProject.aspectRatio||"9:16",language:dialogProject.language||"",characterBible:dialogProject.characterBible||"",continuityNotes:dialogProject.continuityNotes||"",historicalMap:dialogProject.historicalMap||null,productionClips:dialogProject.productionClips||[],animationGroups:dialogProject.animationGroups||[],assets:dialogProject.assets||[],scenes:dialogScenes.map(scene=>({...scene})),ownerUid:existing?.ownerUid||user.uid,ownerEmail:existing?.ownerEmail||(user.email||"").toLowerCase(),editorEmails:existing?.editorEmails||[]};
  if(!item.title){form.elements.title.setCustomValidity("Enter a working title.");form.elements.title.reportValidity();return;}
  savingContent=true;$("contentSaveError").textContent="";
  const controls=[...form.querySelectorAll("button,input,select,textarea")],disabled=controls.map(control=>control.disabled);
  controls.forEach(control=>control.disabled=true);$("saveContent").textContent="Saving…";
  try{
    await saveItem(item,{mustExist:!!editingId});if(generation!==authGeneration)return;
    const index=state.items.findIndex(row=>row.id===item.id);if(index>=0)state.items[index]=item;else state.items.push(item);
    if(!existing)editingId=item.id;
    if(form.elements.voiceoverFile.files[0]&&!dialogVoiceoverAttached){status("Uploading voiceover…");await attachStartingVoiceover(item.id,form.elements.voiceoverFile.files[0],item.title);dialogVoiceoverAttached=true;}
    mobileStage=item.stage;render();$("contentDialog").close();if(dialogWasNew)window.location.href="project.html?id="+encodeURIComponent(item.id)+"&area="+encodeURIComponent(pendingProjectArea)+(pendingToolMode?"&tool="+encodeURIComponent(pendingToolMode):"");
  }catch(error){if(generation===authGeneration)$("contentSaveError").textContent=dialogWasNew&&item.writeRevision&&!dialogVoiceoverAttached?"Project created, but the voiceover did not finish uploading. Your file is still selected; choose Save to retry.":storageError(error)+" Your input is still here. Try saving again.";}
  finally{savingContent=false;controls.forEach((control,index)=>control.disabled=disabled[index]);$("saveContent").textContent=editingId?"Save":"Create";}
};
$("contentForm").elements.title.addEventListener("input",event=>event.target.setCustomValidity(""));
$("contentDialog").addEventListener("cancel",event=>{if(savingContent)event.preventDefault();});

$("deleteContent").onclick=async()=>{
  const item=state.items.find(row=>row.id===editingId);
  if(!item||!isOwner(item)||!confirm("Delete this content project for every collaborator?"))return;
  await deleteDoc(doc(db,"creatorProjects",editingId));$("contentDialog").close();
};

observeAuth(async current=>{
 const generation=++authGeneration;subscriptions.forEach(stop=>stop());subscriptions=[];
 user=current;ownedItems.clear();sharedItems.clear();state.items=[];render();$("app").hidden=true;$("addContent").disabled=!current;
 if($("contentDialog").open)$("contentDialog").close();
 if(!current){status("Sign in once on Dashboard to use Creator Studio.","error");$("status").insertAdjacentHTML("beforeend",' <a href="/invincible/">Open Dashboard</a>');return}
 subscribeProjects();
 try{await migrateLegacyProjects()}catch(error){if(generation===authGeneration)status("Legacy import failed. "+storageError(error),"error")}
}).catch(error=>status("Could not restore your Google session: "+error.message,"error"));

$('contentDialog').addEventListener('close',()=>storyboard.suspend());
