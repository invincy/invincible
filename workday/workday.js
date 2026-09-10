import{initializeApp}from"https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import{getAuth,GoogleAuthProvider,signInWithPopup}from"https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import{getFirestore,collection,doc,getDocs,onSnapshot,query,setDoc,serverTimestamp,where}from"https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const firebaseConfig={apiKey:"AIzaSyBeVpUqcRO_VXfQrGVL5OaSGHKFB8XEQMc",authDomain:"life-by-adichimp.firebaseapp.com",projectId:"life-by-adichimp",storageBucket:"life-by-adichimp.firebasestorage.app",messagingSenderId:"761981819700",appId:"1:761981819700:web:8e88516817ed40b9866361"};
const auth=getAuth(initializeApp(firebaseConfig)),db=getFirestore(),$=id=>document.getElementById(id);
const blankState=()=>({name:"My Workday",ownerUid:"",ownerEmail:"",editorEmails:[],tasks:[],routines:[]});
const newId=()=>crypto.randomUUID?.()||String(Date.now()+Math.random());
const localDate=(date=new Date())=>{const shifted=new Date(date.getTime()-date.getTimezoneOffset()*60000);return shifted.toISOString().slice(0,10)};
const email=v=>(v||"").trim().toLowerCase();
const esc=v=>{const d=document.createElement("div");d.textContent=v??"";return d.innerHTML};
let user=null,spaceId="",spaces=[],unsubscribe=null,state=blankState(),selectedDate=localDate(),pendingTaskId="",editingTaskId="",saveTimer=null,rolling=false;

function toast(message){$("toast").textContent=message;$("toast").classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>$("toast").classList.remove("show"),2200)}
function setConnection(message,type=""){$("connectionStatus").textContent=message;$("connectionStatus").className="connection "+type}
function isOwner(){return user&&state.ownerUid===user.uid}
function tasksForDay(){return state.tasks.filter(task=>task.date===selectedDate&&!task.archived)}
function taskLabel(task){const action=(task.action||"").trim(),subject=(task.subject||"").trim();return[action,subject].filter(Boolean).join(" — ")||(task.title||"").trim()||(task.outcome||"").trim()||"Untitled work"}
function taskOutcome(task){return(task.outcome||task.progressNote||"").trim()}
function taskDetail(task){const value=taskOutcome(task);return value&&value!==taskLabel(task)?value:""}
function previousDate(date){const d=new Date(date+"T12:00:00");d.setDate(d.getDate()-1);return localDate(d)}
function shiftDay(amount){const d=new Date(selectedDate+"T12:00:00");d.setDate(d.getDate()+amount);selectedDate=localDate(d);render()}
function formatDate(date){return new Intl.DateTimeFormat("en-IN",{weekday:"long",day:"numeric",month:"short",year:"numeric"}).format(new Date(date+"T12:00:00"))}

async function discoverSpaces(){
 const owned=query(collection(db,"workdaySpaces"),where("ownerUid","==",user.uid));
 const shared=query(collection(db,"workdaySpaces"),where("editorEmails","array-contains",email(user.email)));
 const [ownedSnap,sharedSnap]=await Promise.all([getDocs(owned),getDocs(shared)]),map=new Map();
 [...ownedSnap.docs,...sharedSnap.docs].forEach(item=>map.set(item.id,{id:item.id,...item.data()}));spaces=[...map.values()];
 if(!spaces.length){const id=newId(),fresh={...blankState(),ownerUid:user.uid,ownerEmail:email(user.email),name:(user.displayName?.split(" ")[0]||"My")+" Workday",createdAt:serverTimestamp(),updatedAt:serverTimestamp()};await setDoc(doc(db,"workdaySpaces",id),fresh);spaces=[{id,...fresh}];}
 const preferred=spaces.find(space=>space.ownerUid!==user.uid)||spaces[0];spaceId=spaces.some(space=>space.id===spaceId)?spaceId:preferred.id;renderSpaceSelect();watchSpace();
}
function renderSpaceSelect(){$("spaceSelect").innerHTML=spaces.map(space=>`<option value="${space.id}">${esc(space.name||"Workday")}${space.ownerUid===user.uid?"":" · shared with me"}</option>`).join("");$("spaceSelect").value=spaceId}
function watchSpace(){unsubscribe?.();setConnection("Syncing workspace…");unsubscribe=onSnapshot(doc(db,"workdaySpaces",spaceId),snap=>{if(!snap.exists())return;state={...blankState(),...snap.data(),tasks:snap.data().tasks||[],routines:snap.data().routines||[],editorEmails:snap.data().editorEmails||[]};const i=spaces.findIndex(s=>s.id===spaceId);if(i>=0)spaces[i]={id:spaceId,...state};renderSpaceSelect();render();setConnection("Synced · "+(user.email||"Google account"),"ok");carryForward()},error=>setConnection(error.message,"error"))}
async function save(immediate=false){
 if(!user||!spaceId)return;clearTimeout(saveTimer);
 const execute=async()=>{setConnection("Saving…");try{await setDoc(doc(db,"workdaySpaces",spaceId),{...state,updatedAt:serverTimestamp()},{merge:true});setConnection("Saved","ok")}catch(error){setConnection("Save failed: "+error.message,"error");toast("Could not save changes")}};
 if(immediate)return execute();saveTimer=setTimeout(execute,220);
}
async function carryForward(){
 if(rolling||selectedDate!==localDate())return;rolling=true;
 try{
  const existingSources=new Set(state.tasks.filter(t=>t.date===selectedDate&&t.carryFromId).map(t=>t.carryFromId));
  const earlier=state.tasks.filter(t=>t.date<selectedDate&&!t.archived&&t.status!=="done"&&!t.rolledForward).sort((a,b)=>b.date.localeCompare(a.date));
  const latestByChain=new Map();earlier.forEach(task=>{const key=task.chainId||task.id;if(!latestByChain.has(key))latestByChain.set(key,task)});
  const carry=[...latestByChain.values()].filter(task=>!existingSources.has(task.id));
  if(carry.length){carry.forEach(task=>{task.rolledForward=true;state.tasks.push({...task,id:newId(),date:selectedDate,status:task.status==="progress"?"progress":"todo",carryFromId:task.id,chainId:task.chainId||task.id,rolledForward:false,createdAt:Date.now(),completedAt:null})});render();await save(true);toast(`${carry.length} unfinished ${carry.length===1?"task":"tasks"} carried forward`)}
 }finally{rolling=false}
}

function render(){
 const today=localDate(),items=tasksForDay(),counts={todo:0,progress:0,pending:0,done:0};items.forEach(task=>counts[task.status]=(counts[task.status]||0)+1);
 $("dayTitle").textContent=selectedDate===today?"Today":selectedDate===previousDate(today)?"Yesterday":formatDate(selectedDate).split(",")[0];$("dayDate").textContent=formatDate(selectedDate);$("datePicker").value=selectedDate;$("nextDay").disabled=selectedDate>=today;
 $("totalCount").textContent=items.length;["done","progress","pending"].forEach(key=>$(key+"Count").textContent=counts[key]);["todo","done","progress","pending"].forEach(key=>$(key+"Badge").textContent=counts[key]);
 document.querySelectorAll(".task-list").forEach(list=>{const status=list.dataset.status;list.innerHTML=items.filter(t=>t.status===status).sort((a,b)=>(a.order||a.createdAt||0)-(b.order||b.createdAt||0)).map(taskCard).join("")});
 $("emptyState").hidden=items.length>0;$("board").hidden=items.length===0;$("shareButton").hidden=!isOwner();
}
function taskCard(task){
 const outcome=taskDetail(task),notes=task.status==="pending"&&(task.pendingReason||task.nextAction)?`<div class="task-note">${task.pendingReason?`<strong>${esc(task.pendingReason)}</strong>`:""}${task.nextAction?"Next: "+esc(task.nextAction):""}</div>`:outcome?`<div class="task-outcome">${esc(outcome)}</div>`:"";
 const action=task.action?`<span class="task-action">${esc(task.action)}</span>`:"",subject=task.subject||(!task.action?task.title:"");
 return `<article class="task-card ${task.carryFromId?"carried":""}" data-id="${task.id}"><div class="task-top"><div class="task-copy">${action}<p class="task-title">${esc(subject||"")}</p></div><button class="more" data-action="edit" title="Edit" aria-label="Edit task">•••</button></div>${notes}<div class="task-actions" aria-label="Change status"><button data-status="todo" class="${task.status==="todo"?"active":""}" title="To do">○</button><button data-status="progress" class="${task.status==="progress"?"active":""}" title="In progress">▶</button><button data-status="pending" class="${task.status==="pending"?"active":""}" title="Pending">Ⅱ</button><button data-status="done" class="${task.status==="done"?"active":""}" title="Done">✓</button></div></article>`;
}
function changeStatus(id,status){const task=state.tasks.find(t=>t.id===id);if(!task||task.status===status&&status!=="pending")return;if(status==="pending"){pendingTaskId=id;$("pendingTaskTitle").textContent=taskLabel(task);$("pendingForm").reset();$("pendingForm").elements.pendingReason.value=task.pendingReason||"";$("pendingForm").elements.nextAction.value=task.nextAction||"";$("pendingDialog").showModal();return}task.status=status;task.completedAt=status==="done"?Date.now():null;if(status!=="pending"){task.pendingReason="";task.nextAction=""}render();save()}

$("quickAdd").onsubmit=event=>{event.preventDefault();const action=$("taskAction").value.trim(),subject=$("taskSubject").value.trim(),outcome=$("taskOutcome").value.trim();if(!action&&!subject&&!outcome){toast("Write at least one part of the work");$("taskAction").focus();return}const title=[action,subject].filter(Boolean).join(" — ")||outcome;state.tasks.push({id:newId(),chainId:"",title,action,subject,outcome,date:selectedDate,status:"todo",progressNote:"",pendingReason:"",nextAction:"",createdAt:Date.now(),completedAt:null,rolledForward:false});event.currentTarget.reset();render();save();$("taskAction").focus()};
document.querySelector(".action-chips").onclick=event=>{const button=event.target.closest("[data-quick-action]");if(!button)return;$("taskAction").value=button.dataset.quickAction;$("taskSubject").focus()};
$("board").onclick=event=>{const card=event.target.closest(".task-card");if(!card)return;const statusButton=event.target.closest("[data-status]");if(statusButton){changeStatus(card.dataset.id,statusButton.dataset.status);return}if(event.target.closest('[data-action="edit"]')){const task=state.tasks.find(t=>t.id===card.dataset.id);editingTaskId=task.id;$("editForm").elements.action.value=task.action||"";$("editForm").elements.subject.value=task.subject||task.title||"";$("editForm").elements.outcome.value=taskOutcome(task);$("editDialog").showModal()}};
$("pendingForm").onsubmit=event=>{event.preventDefault();const task=state.tasks.find(t=>t.id===pendingTaskId),data=new FormData(event.currentTarget);task.status="pending";task.pendingReason=data.get("pendingReason").trim();task.nextAction=data.get("nextAction").trim();task.completedAt=null;$("pendingDialog").close();render();save()};
$("editForm").onsubmit=event=>{event.preventDefault();const task=state.tasks.find(t=>t.id===editingTaskId),data=new FormData(event.currentTarget),action=data.get("action").trim(),subject=data.get("subject").trim(),outcome=data.get("outcome").trim();if(!action&&!subject&&!outcome)return toast("Keep at least one field");task.action=action;task.subject=subject;task.outcome=outcome;task.title=[action,subject].filter(Boolean).join(" — ")||outcome;task.progressNote="";$("editDialog").close();render();save()};
$("deleteTask").onclick=()=>{const task=state.tasks.find(t=>t.id===editingTaskId);if(!task||!confirm(`Delete “${task.title}”?`))return;state.tasks=state.tasks.filter(t=>t.id!==editingTaskId);$("editDialog").close();render();save()};

function renderRoutines(){$("routineList").innerHTML=state.routines.length?state.routines.map(r=>`<div class="routine-item" data-id="${r.id}"><span>${esc(r.title)}</span><button type="button" aria-label="Delete routine">Delete</button></div>`).join(""):'<p class="hint">No recurring work saved yet.</p>'}
$("manageRoutine").onclick=()=>{renderRoutines();$("routineDialog").showModal()};
$("routineForm").onsubmit=event=>{event.preventDefault();const title=$("routineTitle").value.trim();if(!title)return;state.routines.push({id:newId(),title});$("routineTitle").value="";renderRoutines();save()};
$("routineList").onclick=event=>{const row=event.target.closest(".routine-item");if(!row||!event.target.closest("button"))return;state.routines=state.routines.filter(r=>r.id!==row.dataset.id);renderRoutines();save()};
$("addRoutine").onclick=()=>{if(!state.routines.length){renderRoutines();$("routineDialog").showModal();return}const titles=new Set(tasksForDay().map(t=>t.title.toLowerCase()));const fresh=state.routines.filter(r=>!titles.has(r.title.toLowerCase()));fresh.forEach(r=>state.tasks.push({id:newId(),chainId:"",title:r.title,date:selectedDate,status:"todo",progressNote:"",pendingReason:"",nextAction:"",createdAt:Date.now(),completedAt:null,rolledForward:false,routineId:r.id}));render();save();toast(fresh.length?`${fresh.length} routine ${fresh.length===1?"task":"tasks"} added`:"Today’s routine is already added")};

function buildReport(){const items=tasksForDay(),section=(title,list,detail)=>list.length?`${title}\n${list.map(task=>`• ${taskLabel(task)}${detail(task)}`).join("\n")}\n\n`:"";let report=`Daily Work Report — ${new Intl.DateTimeFormat("en-GB").format(new Date(selectedDate+"T12:00:00"))}\n\n`;report+=section("✅ Jobs Completed",items.filter(t=>t.status==="done"),t=>taskDetail(t)?`\n  ${taskDetail(t)}`:"");report+=section("🔄 Jobs In Progress",items.filter(t=>t.status==="progress"),t=>taskDetail(t)?`\n  ${taskDetail(t)}`:"");report+=section("⏳ Pending / Backlog",items.filter(t=>t.status==="pending"||t.status==="todo"),t=>t.pendingReason?`\n  ${t.pendingReason}`:taskDetail(t)?`\n  ${taskDetail(t)}`:"");const next=items.filter(t=>t.status!=="done").map(t=>t.nextAction||(t.status==="progress"?`Finish ${taskLabel(t)}`:`Complete ${taskLabel(t)}`));if(next.length)report+=`📌 Next Working Day\n${next.map(x=>`• ${x}`).join("\n")}\n`;return report.trim()||`Daily Work Report — ${selectedDate}\n\nNo work recorded.`}
function openReport(){$("reportText").value=buildReport();$("reportDialog").showModal()}
$("generateReportTop").onclick=openReport;$("generateReportBottom").onclick=openReport;$("copyReport").onclick=async()=>{try{await navigator.clipboard.writeText($("reportText").value);$("copyReport").textContent="Copied ✓";toast("Report copied — ready for WhatsApp");setTimeout(()=>$("copyReport").textContent="Copy report",1600)}catch{$("reportText").select();document.execCommand("copy");toast("Report copied")}};

function renderEditors(){$("editorList").innerHTML=state.editorEmails.length?state.editorEmails.map(value=>`<div class="routine-item" data-email="${esc(value)}"><span>${esc(value)}</span><button type="button">Remove</button></div>`).join(""):'<p class="hint">Only you have access.</p>'}
$("shareButton").onclick=()=>{renderEditors();$("shareDialog").showModal()};
$("shareForm").onsubmit=async event=>{event.preventDefault();const value=email($("shareEmail").value);if(!value||value===state.ownerEmail||state.editorEmails.includes(value))return;state.editorEmails.push(value);$("shareEmail").value="";renderEditors();await save(true);toast("Workspace shared with "+value)};
$("editorList").onclick=async event=>{const row=event.target.closest(".routine-item");if(!row||!event.target.closest("button"))return;state.editorEmails=state.editorEmails.filter(value=>value!==row.dataset.email);renderEditors();await save(true);toast("Access removed")};

$("previousDay").onclick=()=>shiftDay(-1);$("nextDay").onclick=()=>shiftDay(1);$("dateButton").onclick=()=>$("datePicker").showPicker?.();$("datePicker").onchange=event=>{selectedDate=event.target.value;render()};$("spaceSelect").onchange=event=>{spaceId=event.target.value;watchSpace()};
document.querySelectorAll("dialog .close").forEach(button=>button.onclick=()=>button.closest("dialog").close());
$("signIn").onclick=async()=>{try{$("authError").textContent="";await signInWithPopup(auth,new GoogleAuthProvider())}catch(error){$("authError").textContent=error.message}};

await auth.authStateReady();user=auth.currentUser;
if(!user){$("authGate").hidden=false;setConnection("Sign in required");auth.onAuthStateChanged(async current=>{if(!current)return;user=current;$("authGate").hidden=true;$("app").hidden=false;await discoverSpaces()})}
else{$("app").hidden=false;await discoverSpaces()}
