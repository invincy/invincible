import{initializeApp}from"https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import{getAuth}from"https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import{collection,deleteDoc,doc,getDoc,getDocs,getFirestore,onSnapshot,query,serverTimestamp,setDoc,where}from"https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const config={apiKey:"AIzaSyBeVpUqcRO_VXfQrGVL5OaSGHKFB8XEQMc",authDomain:"life-by-adichimp.firebaseapp.com",projectId:"life-by-adichimp",storageBucket:"life-by-adichimp.firebasestorage.app",messagingSenderId:"761981819700",appId:"1:761981819700:web:8e88516817ed40b9866361"};
const auth=getAuth(initializeApp(config)),db=getFirestore(),$=id=>document.getElementById(id);
const stages=["Ideas","Research","Script","Record","Edit","Scheduled","Published"];
let user=null,state={items:[]},ownedItems=new Map(),sharedItems=new Map(),editingId="",filter="All",queryText="",mobileStage="Ideas";

const newId=()=>crypto.randomUUID?.()||String(Date.now()+Math.random());
const today=()=>new Date().toISOString().slice(0,10);
function esc(value){const node=document.createElement("div");node.textContent=value??"";return node.innerHTML;}
function attr(value){return esc(value).replace(/"/g,"&quot;").replace(/'/g,"&#39;");}
function status(message,type=""){$("status").textContent=message;$("status").className="sync-status "+type;}
function isOwner(item){return item.ownerUid===user?.uid;}
function filtered(){return state.items.filter(item=>(filter==="All"||item.format===filter)&&(!queryText||[item.title,item.hook,item.series].join(" ").toLowerCase().includes(queryText)));}
function dateLabel(date){if(!date)return"";return new Date(date+"T00:00:00").toLocaleDateString("en-IN",{day:"numeric",month:"short"});}
function moveButton(item,direction){const index=stages.indexOf(item.stage),next=index+direction;return '<button data-move="'+direction+'" data-id="'+item.id+'" aria-label="Move '+(direction<0?'back':'forward')+'" '+(next<0||next>=stages.length?'disabled':'')+'>'+(direction<0?'‹':'›')+'</button>';}

function card(item){
  const overdue=item.publishDate&&item.publishDate<today()&&item.stage!=="Published",sceneCount=item.scenes?.length||0,completeCount=item.scenes?.filter(scene=>scene.completed).length||0,shared=!isOwner(item),editorCount=item.editorEmails?.length||0,accessLabel=shared?"Shared with you":editorCount?"Shared · "+editorCount:"Private";
  return '<article class="content-card" draggable="true" data-id="'+item.id+'" tabindex="0" aria-label="Open '+attr(item.title)+'"><div class="card-top"><span class="format">'+esc(item.format)+'</span><span class="due '+(overdue?'overdue':'')+'">'+(item.publishDate?dateLabel(item.publishDate):"No date")+'</span></div><h3>'+esc(item.title)+'</h3>'+(item.hook?'<p class="hook">'+esc(item.hook)+'</p>':'')+'<div class="project-meta"><span>'+sceneCount+' scene'+(sceneCount===1?'':'s')+(sceneCount?' · '+completeCount+' ready':'')+'</span><span class="access-tag '+(shared?'shared':'')+'">'+accessLabel+'</span></div><button class="open-project" data-open="'+item.id+'">Open Project <span>→</span></button><div class="card-bottom"><span class="series">'+esc(item.series||"General")+'</span><div class="card-actions"><button data-edit="'+item.id+'">Edit</button>'+moveButton(item,-1)+moveButton(item,1)+'</div></div></article>';
}

function renderMetrics(){
  const active=state.items.filter(item=>item.stage!=="Published"),scheduled=state.items.filter(item=>item.stage==="Scheduled"&&item.publishDate).sort((a,b)=>a.publishDate.localeCompare(b.publishDate));
  $("inPipeline").textContent=active.length;$("readyCount").textContent=state.items.filter(item=>item.stage==="Record").length;$("publishedCount").textContent=state.items.filter(item=>item.stage==="Published").length;$("nextRelease").textContent=scheduled[0]?dateLabel(scheduled[0].publishDate):"—";$("nextReleaseTitle").textContent=scheduled[0]?.title||"nothing scheduled";
}

function render(){
  renderMetrics();const items=filtered();
  $("stageTabs").innerHTML=stages.map(stage=>'<button data-stage="'+stage+'" class="'+(mobileStage===stage?'active':'')+'">'+stage+' · '+items.filter(item=>item.stage===stage).length+'</button>').join("");
  $("board").innerHTML=stages.map(stage=>{const rows=items.filter(item=>item.stage===stage).sort((a,b)=>(a.publishDate||"9999").localeCompare(b.publishDate||"9999"));return '<section class="column '+(mobileStage===stage?'mobile-active':'')+'" data-stage="'+stage+'"><div class="column-head"><h2>'+stage+'</h2><span class="column-count">'+rows.length+'</span></div><div class="cards">'+(rows.length?rows.map(card).join(""):'<div class="empty">No content here</div>')+'</div></section>';}).join("");
  bindDrag();
}

function mergeProjects(){
  const merged=new Map([...sharedItems,...ownedItems]);
  state.items=[...merged.values()];render();$("app").hidden=false;status("Synced · "+(user.email||"signed in"),"ok");
}

async function saveItem(item){
  if(!user)return;
  status("Saving…");
  const payload={...item,id:item.id,ownerUid:item.ownerUid||user.uid,ownerEmail:item.ownerEmail||(user.email||"").toLowerCase(),editorEmails:item.editorEmails||[],updatedAt:serverTimestamp()};
  if(!item.createdAt)payload.createdAt=serverTimestamp();
  try{await setDoc(doc(db,"creatorProjects",item.id),payload,{merge:true});status("Synced to Firebase","ok");}
  catch(error){status("Save failed: "+error.message,"error");throw error;}
}

async function migrateLegacyProjects(){
  const snapshot=await getDoc(doc(db,"users",user.uid,"creator","main")),items=snapshot.data()?.items||[],existing=await getDocs(query(collection(db,"creatorProjects"),where("ownerUid","==",user.uid))),existingIds=new Set(existing.docs.map(row=>row.id));
  for(const item of items){
    if(!existingIds.has(item.id))await setDoc(doc(db,"creatorProjects",item.id),{...item,id:item.id,ownerUid:user.uid,ownerEmail:(user.email||"").toLowerCase(),editorEmails:[],createdAt:serverTimestamp(),updatedAt:serverTimestamp()});
  }
}

function subscribeProjects(){
  const projects=collection(db,"creatorProjects"),email=(user.email||"").toLowerCase();
  onSnapshot(query(projects,where("ownerUid","==",user.uid)),snapshot=>{ownedItems=new Map(snapshot.docs.map(row=>[row.id,{...row.data(),id:row.id}]));mergeProjects();},error=>status("Could not load your projects: "+error.message,"error"));
  if(email)onSnapshot(query(projects,where("editorEmails","array-contains",email)),snapshot=>{sharedItems=new Map(snapshot.docs.map(row=>[row.id,{...row.data(),id:row.id}]));mergeProjects();},error=>status("Could not load shared projects: "+error.message,"error"));
}

function openDialog(item=null){
  editingId=item?.id||"";const form=$("contentForm");form.reset();$("dialogHeading").textContent=item?"Edit content":"New content";$("deleteContent").hidden=!item||!isOwner(item);
  if(item)Object.entries(item).forEach(([key,value])=>{if(form.elements[key])form.elements[key].value=value??"";});else form.elements.stage.value=mobileStage;
  $("contentDialog").showModal();setTimeout(()=>form.elements.title.focus(),0);
}

function bindDrag(){
  document.querySelectorAll(".content-card").forEach(card=>{card.ondragstart=event=>{card.classList.add("dragging");event.dataTransfer.setData("text/plain",card.dataset.id);};card.ondragend=()=>card.classList.remove("dragging");});
  document.querySelectorAll(".column").forEach(column=>{column.ondragover=event=>{event.preventDefault();column.classList.add("drag-over");};column.ondragleave=()=>column.classList.remove("drag-over");column.ondrop=async event=>{event.preventDefault();column.classList.remove("drag-over");const item=state.items.find(row=>row.id===event.dataTransfer.getData("text/plain"));if(item&&item.stage!==column.dataset.stage){item.stage=column.dataset.stage;render();await saveItem(item);}};});
}

$("stageSelect").innerHTML=stages.map(stage=>'<option>'+stage+'</option>').join("");
$("testProject").onclick=async()=>{
  let item=state.items.find(row=>row.isTestProject&&isOwner(row));
  if(!item){
    const scene=(duration,voiceover,imagePrompt,videoPrompt)=>({id:newId(),duration,voiceover,characterPrompt:"",imagePrompt,videoPrompt,imageDone:false,videoDone:false,completed:false,skipped:false});
    item={id:newId(),isTestProject:true,title:"Test Run · What is Nomination?",format:"Short",stage:"Script",series:"Concepts, Clearly",publishDate:"",hook:"Nomination is not the same thing as ownership.",script:"Nomination is not the same thing as ownership. A nominee is the person authorised to receive the policy money after the policyholder's death. The insurer pays the nominee so the claim can be settled smoothly. Keeping nomination updated prevents avoidable delay for your family.",notes:"Built-in test project for checking the complete scene workflow.",visualStyle:"Cinematic realistic Indian family, premium insurance explainer, warm blue and gold lighting",aspectRatio:"9:16",language:"Gujarati + English",characterBible:"The same modern Indian family, with stable faces, clothing and ages across every scene.",continuityNotes:"Keep the same Indian family, clothing and modern home across all scenes. No logos, captions or watermarks.",scenes:[scene(6,"Nomination is not the same thing as ownership.","Vertical cinematic close-up of an Indian policyholder reviewing a life-insurance document at a modern desk, thoughtful expression, warm blue and gold lighting, realistic photography, no visible text or logos.","Slow push-in toward the policyholder and document, subtle hand movement and natural breathing, warm practical light flicker, preserve face and composition, no morphing."),scene(9,"A nominee is the person authorised to receive the policy money after the policyholder's death.","The same Indian family in their living room, policyholder gently indicating a trusted family member, respectful emotional tone, consistent clothes and lighting, cinematic realism, no text.","Gentle left-to-right camera slide, natural eye contact and small hand gesture, soft curtain movement, preserve identities, clothes and room layout."),scene(8,"The insurer pays the nominee so the claim can be settled smoothly.","Same nominee seated with an insurance representative across a clean desk, document handover suggesting smooth claim settlement, blue and gold palette, realistic Indian setting, no logos or text.","Controlled overhead-to-medium camera move, representative passes a document, nominee receives it naturally, subtle ambient office movement, maintain exact characters."),scene(8,"Keeping nomination updated prevents avoidable delay for your family.","Same family together in the warm living room, calm relieved expressions, policyholder updating details on a phone, hopeful final frame, cinematic 9:16, no text or watermark.","Slow pull-back revealing the family together, subtle smiles and natural movement, soft sunlight shifts through the room, stable faces and clothing, clean ending hold.")],ownerUid:user.uid,ownerEmail:(user.email||"").toLowerCase(),editorEmails:[]};
    state.items.push(item);render();await saveItem(item);
  }
  window.location.href="project.html?id="+encodeURIComponent(item.id);
};

$("addContent").onclick=()=>openDialog();
document.querySelectorAll("dialog .close").forEach(button=>button.onclick=()=>$("contentDialog").close());
$("stageTabs").onclick=event=>{const button=event.target.closest("[data-stage]");if(!button)return;mobileStage=button.dataset.stage;render();};
document.querySelector(".filter-group").onclick=event=>{const button=event.target.closest("[data-filter]");if(!button)return;filter=button.dataset.filter;document.querySelectorAll(".filter").forEach(item=>item.classList.toggle("active",item===button));render();};
$("searchInput").oninput=event=>{queryText=event.target.value.trim().toLowerCase();render();};

$("board").onclick=async event=>{
  const move=event.target.closest("[data-move]");
  if(move){event.stopPropagation();const item=state.items.find(row=>row.id===move.dataset.id),next=stages.indexOf(item.stage)+Number(move.dataset.move);if(stages[next]){item.stage=stages[next];mobileStage=item.stage;render();await saveItem(item);}return;}
  const edit=event.target.closest("[data-edit]");if(edit){event.stopPropagation();openDialog(state.items.find(row=>row.id===edit.dataset.edit));return;}
  const open=event.target.closest("[data-open]");if(open){event.stopPropagation();window.location.href="project.html?id="+encodeURIComponent(open.dataset.open);return;}
  const cardElement=event.target.closest(".content-card");if(cardElement)window.location.href="project.html?id="+encodeURIComponent(cardElement.dataset.id);
};

$("board").onkeydown=event=>{if((event.key==="Enter"||event.key===" ")&&!event.target.closest("button")){event.preventDefault();const card=event.target.closest(".content-card");if(card)window.location.href="project.html?id="+encodeURIComponent(card.dataset.id);}};

$("contentForm").onsubmit=async event=>{
  event.preventDefault();const data=new FormData(event.currentTarget),existing=state.items.find(row=>row.id===editingId),item={...(existing||{}),id:editingId||newId(),title:data.get("title").trim(),format:data.get("format"),stage:data.get("stage"),series:data.get("series"),publishDate:data.get("publishDate"),hook:data.get("hook").trim(),script:data.get("script").trim(),notes:data.get("notes").trim(),scenes:existing?.scenes||[],ownerUid:existing?.ownerUid||user.uid,ownerEmail:existing?.ownerEmail||(user.email||"").toLowerCase(),editorEmails:existing?.editorEmails||[]};
  const index=state.items.findIndex(row=>row.id===item.id);if(index>=0)state.items[index]=item;else state.items.push(item);mobileStage=item.stage;render();await saveItem(item);$("contentDialog").close();if(!existing)window.location.href="project.html?id="+encodeURIComponent(item.id);
};

$("deleteContent").onclick=async()=>{
  const item=state.items.find(row=>row.id===editingId);
  if(!item||!isOwner(item)||!confirm("Delete this content project for every collaborator?"))return;
  await deleteDoc(doc(db,"creatorProjects",editingId));$("contentDialog").close();
};

await auth.authStateReady();user=auth.currentUser;
if(user){
  try{await migrateLegacyProjects();subscribeProjects();}
  catch(error){status("Could not prepare shared projects: "+error.message,"error");}
}else{
  status("Sign in on the Dashboard first, then return to Creator Studio.","error");$("status").insertAdjacentHTML("beforeend",' <a href="/invincible/">Open Dashboard</a>');
}
