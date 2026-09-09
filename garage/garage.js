import{initializeApp}from"https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import{getAuth}from"https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import{getFirestore,doc,onSnapshot,setDoc,serverTimestamp}from"https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
const config={apiKey:"AIzaSyBeVpUqcRO_VXfQrGVL5OaSGHKFB8XEQMc",authDomain:"life-by-adichimp.firebaseapp.com",projectId:"life-by-adichimp",storageBucket:"life-by-adichimp.firebasestorage.app",messagingSenderId:"761981819700",appId:"1:761981819700:web:8e88516817ed40b9866361"};
const auth=getAuth(initializeApp(config)),db=getFirestore(),$=id=>document.getElementById(id);
const money=n=>new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:1}).format(Number(n)||0);
const newId=()=>crypto.randomUUID?.()||String(Date.now()+Math.random()),today=()=>new Date().toISOString().slice(0,10);
let user=null,activeId="",cursor=new Date(),editing={kind:"",id:""},state={vehicles:[],odometerReadings:[],fuel:[],services:[],reminders:[]};
const monthKey=()=>cursor.getFullYear()+"-"+String(cursor.getMonth()+1).padStart(2,"0");
function esc(v){const d=document.createElement("div");d.textContent=v??"";return d.innerHTML}
function status(m,t=""){$("status").textContent=m;$("status").className="status "+t}
function vehicle(){return state.vehicles.find(x=>x.id===activeId)}
function rows(key){return state[key].filter(x=>x.vehicleId===activeId)}
function formValue(form,name,value){const el=form.elements[name];if(el)el.type==="checkbox"?el.checked=!!value:el.value=value??""}
function resetEdit(kind){editing={kind,id:""};const form=$(kind+"Form");form?.reset()}
function openDialog(kind,id=""){
 const dialog=$(kind+"Dialog"),form=$(kind+"Form"),v=vehicle();form.reset();editing={kind,id};
 form.querySelectorAll('input[type="date"]').forEach(x=>x.value=today());
 form.querySelectorAll('[name="odometer"]').forEach(x=>x.value=v?.odometer||0);
 const titles={vehicle:"Vehicle",km:"odometer reading",fuel:"fill-up",service:"service",reminder:"reminder"};
 $(kind+"DialogTitle").textContent=(id?"Edit ":"Add ")+titles[kind];
 if(id){
  const source=kind==="vehicle"?state.vehicles:state[kind==="km"?"odometerReadings":kind];
  const item=source.find(x=>x.id===id);if(item)Object.entries(item).forEach(([k,val])=>formValue(form,k,val));
 }
 dialog.showModal();
}
async function save(){
 if(!user)return;status("Saving…");
 try{await setDoc(doc(db,"users",user.uid,"garage","main"),{...state,updatedAt:serverTimestamp()},{merge:true});status("Saved to Firebase","ok")}
 catch(e){status("Save failed: "+e.message,"error");throw e}
}
function syncCurrentKm(){
 const v=vehicle();if(!v)return;
 const all=rows("odometerReadings").sort((a,b)=>a.date.localeCompare(b.date));
 if(all.length)v.odometer=Number(all[all.length-1].odometer);
}
function monthDistance(readings){
 const key=monthKey(),within=readings.filter(x=>x.date.startsWith(key)).sort((a,b)=>a.date.localeCompare(b.date));
 if(!within.length)return 0;
 const prior=readings.filter(x=>x.date<key+"-01").sort((a,b)=>a.date.localeCompare(b.date)).pop();
 if(within.length===1&&!prior)return 0;
 return Math.max(0,Number(within[within.length-1].odometer)-Number(prior?.odometer??within[0].odometer));
}
function actionButtons(kind,id){return '<button class="icon edit" data-action="edit" data-kind="'+kind+'" data-id="'+id+'" title="Edit" aria-label="Edit">✎</button><button class="icon delete" data-action="delete" data-kind="'+kind+'" data-id="'+id+'" title="Delete" aria-label="Delete">×</button>'}
function render(){
 if(!activeId&&state.vehicles[0])activeId=state.vehicles[0].id;
 $("vehicleSelect").innerHTML=state.vehicles.map(v=>'<option value="'+v.id+'">'+esc(v.name)+'</option>').join("");$("vehicleSelect").value=activeId;
 $("monthLabel").textContent=cursor.toLocaleString(undefined,{month:"short",year:"numeric"});
 const v=vehicle(),has=!!v;$("app").hidden=!has;
 if(!has){status("Add your first vehicle to start tracking.","ok");return}
 syncCurrentKm();$("vehicleType").textContent=v.type+" · "+v.fuelType;$("vehicleName").textContent=v.name;$("vehicleMeta").textContent=v.registration||"Registration not added";$("currentKm").textContent=Number(v.odometer||0).toLocaleString("en-IN")+" km";
 const readings=rows("odometerReadings").sort((a,b)=>b.date.localeCompare(a.date)),fuel=rows("fuel").sort((a,b)=>b.date.localeCompare(a.date)),services=rows("services").sort((a,b)=>b.date.localeCompare(a.date)),reminders=rows("reminders");
 const key=monthKey(),monthFuel=fuel.filter(x=>x.date.startsWith(key)),distance=monthDistance(readings),monthCost=monthFuel.reduce((a,x)=>a+Number(x.cost),0);
 const fuelChron=[...fuel].sort((a,b)=>Number(a.odometer)-Number(b.odometer)),qty=fuelChron.slice(1).filter(x=>x.fullTank).reduce((a,x)=>a+Number(x.quantity),0);
 const fuelDistance=fuelChron.length>1?Number(fuelChron[fuelChron.length-1].odometer)-Number(fuelChron[0].odometer):0,mileage=fuelDistance>0&&qty>0?fuelDistance/qty:0;
 $("monthFuel").textContent=money(monthCost);$("monthDistance").textContent=distance.toLocaleString("en-IN")+" km";$("avgMileage").textContent=mileage?mileage.toFixed(1)+" km/"+(fuel[0]?.unit||"L"):"—";$("costPerKm").textContent=distance?money(monthCost/distance):"—";
 const monthReadings=readings.filter(x=>x.date.startsWith(key));
 $("kmList").innerHTML=monthReadings.map((x,i)=>{const next=monthReadings[i-1],delta=next?Number(next.odometer)-Number(x.odometer):0;return '<div class="record"><div class="record-main"><span class="record-icon">KM</span><div><strong>'+Number(x.odometer).toLocaleString("en-IN")+' km</strong><small>'+x.date+(delta>0?' · <span class="reading-delta">+'+delta.toLocaleString("en-IN")+' km</span>':"")+'</small></div></div><div class="record-actions">'+actionButtons("km",x.id)+'</div></div>'}).join("");$("emptyKm").hidden=!!monthReadings.length;
 $("fuelList").innerHTML=monthFuel.map(x=>'<div class="record"><div class="record-main"><span class="record-icon">F</span><div><strong>'+x.quantity+" "+x.unit+'</strong><small>'+x.date+" · "+Number(x.odometer).toLocaleString("en-IN")+" km"+(x.fullTank?" · full tank":"")+'</small></div></div><div class="record-actions"><strong class="amount">'+money(x.cost)+'</strong>'+actionButtons("fuel",x.id)+'</div></div>').join("");$("emptyFuel").hidden=!!monthFuel.length;
 $("serviceList").innerHTML=services.filter(x=>x.date.startsWith(key)).map(x=>'<div class="record"><div class="record-main"><span class="record-icon">S</span><div><strong>'+esc(x.work)+'</strong><small>'+x.date+" · "+Number(x.odometer).toLocaleString("en-IN")+" km"+(x.workshop?" · "+esc(x.workshop):"")+'</small></div></div><div class="record-actions"><strong class="amount">'+money(x.cost)+'</strong>'+actionButtons("service",x.id)+'</div></div>').join("");$("emptyService").hidden=!!services.filter(x=>x.date.startsWith(key)).length;
 $("reminderList").innerHTML=reminders.sort((a,b)=>(a.date||"9999").localeCompare(b.date||"9999")).map(x=>'<div class="reminder '+(x.date&&x.date<today()?"overdue":"")+'"><div class="record"><div><strong>'+esc(x.title)+'</strong><div class="due">'+(x.date?"Due "+x.date:"")+(x.date&&x.odometer?" · ":"")+(x.odometer?"At "+Number(x.odometer).toLocaleString("en-IN")+" km":"")+'</div></div><div class="record-actions">'+actionButtons("reminder",x.id)+'</div></div></div>').join("");$("emptyReminders").hidden=!!reminders.length;
 const last=services[0];$("lastService").innerHTML=last?esc(last.work)+"<small>"+last.date+" · "+Number(last.odometer).toLocaleString("en-IN")+" km · "+money(last.cost)+"</small>":"Not recorded";
}
function upsert(kind,item){
 const key=kind==="km"?"odometerReadings":kind==="vehicle"?"vehicles":kind;
 const i=state[key].findIndex(x=>x.id===item.id);if(i>=0)state[key][i]=item;else state[key].push(item);
}
document.querySelectorAll("dialog .close").forEach(b=>b.onclick=()=>{b.closest("dialog").close();editing={kind:"",id:""}});
$("addVehicle").onclick=()=>openDialog("vehicle");$("editVehicle").onclick=()=>openDialog("vehicle",activeId);
$("updateKm").onclick=$("addKm").onclick=()=>openDialog("km");$("addFuel").onclick=()=>openDialog("fuel");$("addService").onclick=()=>openDialog("service");$("addReminder").onclick=()=>openDialog("reminder");
$("prevMonth").onclick=()=>{cursor=new Date(cursor.getFullYear(),cursor.getMonth()-1,1);render()};$("nextMonth").onclick=()=>{cursor=new Date(cursor.getFullYear(),cursor.getMonth()+1,1);render()};
$("vehicleSelect").onchange=e=>{activeId=e.target.value;render()};
$("vehicleForm").onsubmit=async e=>{e.preventDefault();const f=new FormData(e.currentTarget),old=editing.id?state.vehicles.find(x=>x.id===editing.id):null,item={id:editing.id||newId(),name:f.get("name").trim(),type:f.get("type"),registration:f.get("registration").trim(),fuelType:f.get("fuelType"),odometer:Number(f.get("odometer"))};upsert("vehicle",item);activeId=item.id;if(old&&old.odometer!==item.odometer&&!rows("odometerReadings").length)state.odometerReadings.push({id:newId(),vehicleId:item.id,date:today(),odometer:item.odometer});render();await save();e.currentTarget.reset();$("vehicleDialog").close()};
$("kmForm").onsubmit=async e=>{e.preventDefault();const f=new FormData(e.currentTarget),item={id:editing.id||newId(),vehicleId:activeId,date:f.get("date"),odometer:Number(f.get("odometer"))};upsert("km",item);syncCurrentKm();cursor=new Date(item.date+"T00:00:00");render();await save();$("kmDialog").close()};
$("fuelForm").onsubmit=async e=>{e.preventDefault();const f=new FormData(e.currentTarget),item={id:editing.id||newId(),vehicleId:activeId,date:f.get("date"),odometer:Number(f.get("odometer")),quantity:Number(f.get("quantity")),unit:f.get("unit"),cost:Number(f.get("cost")),fullTank:f.get("fullTank")==="on"};upsert("fuel",item);render();await save();$("fuelDialog").close()};
$("serviceForm").onsubmit=async e=>{e.preventDefault();const f=new FormData(e.currentTarget),item={id:editing.id||newId(),vehicleId:activeId,date:f.get("date"),odometer:Number(f.get("odometer")),work:f.get("work").trim(),cost:Number(f.get("cost")),workshop:f.get("workshop").trim()};upsert("service",item);render();await save();$("serviceDialog").close()};
$("reminderForm").onsubmit=async e=>{e.preventDefault();const f=new FormData(e.currentTarget),item={id:editing.id||newId(),vehicleId:activeId,title:f.get("title").trim(),date:f.get("date"),odometer:Number(f.get("odometer"))||0};upsert("reminder",item);render();await save();$("reminderDialog").close()};
$("deleteVehicle").onclick=async()=>{const v=vehicle();if(!v||!confirm('Delete "'+v.name+'" and all its records?'))return;["odometerReadings","fuel","services","reminders"].forEach(k=>state[k]=state[k].filter(x=>x.vehicleId!==activeId));state.vehicles=state.vehicles.filter(x=>x.id!==activeId);activeId=state.vehicles[0]?.id||"";render();await save()};
document.body.onclick=async e=>{const b=e.target.closest("[data-action]");if(!b)return;const kind=b.dataset.kind,id=b.dataset.id;if(b.dataset.action==="edit"){openDialog(kind,id);return}if(!confirm("Delete this entry?"))return;const key=kind==="km"?"odometerReadings":kind;state[key]=state[key].filter(x=>x.id!==id);if(kind==="km")syncCurrentKm();render();await save()};
await auth.authStateReady();user=auth.currentUser;
if(user)onSnapshot(doc(db,"users",user.uid,"garage","main"),s=>{state=s.exists()?{vehicles:[],odometerReadings:[],fuel:[],services:[],reminders:[],...s.data()}:{vehicles:[],odometerReadings:[],fuel:[],services:[],reminders:[]};if(!state.vehicles.some(x=>x.id===activeId))activeId=state.vehicles[0]?.id||"";render();status("Synced · "+(user.email||"signed in"),"ok")},e=>status(e.message,"error"));
else{status("Sign in on the Dashboard first, then return to Garage.","error");$("status").insertAdjacentHTML("beforeend",' <a href="/invincible/">Open Dashboard</a>')}