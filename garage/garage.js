import{db,observeAuth,storageError}from'../shared/firebase-client.js';
import{doc,onSnapshot,runTransaction,serverTimestamp}from'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';
import{applyGarageChange,currentOdometer,normalizeGarage,recordKeys}from'./garage-model.js';
const $=id=>document.getElementById(id);
const money=n=>new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:1}).format(Number(n)||0);
const newId=()=>crypto.randomUUID?.()||String(Date.now()+Math.random()),today=()=>{const date=new Date();return date.getFullYear()+"-"+String(date.getMonth()+1).padStart(2,"0")+"-"+String(date.getDate()).padStart(2,"0")};
let user=null,activeId="",cursor=new Date(),editing={kind:"",id:""},state=normalizeGarage(),loaded=false,busy=false,stopGarage=()=>{},authGeneration=0;
function controls(){document.querySelectorAll('#addVehicle,#app button,#vehicleSelect,dialog button').forEach(button=>button.disabled=busy||!user||!loaded)}
function dialogError(message){document.querySelectorAll('.garage-save-error').forEach(node=>node.remove());if(!message)return;const dialog=document.querySelector('dialog[open]');if(dialog){const node=document.createElement('p');node.className='garage-save-error';node.setAttribute('role','alert');node.textContent=message;dialog.querySelector('.dialog-actions').before(node)}}
const monthKey=()=>cursor.getFullYear()+"-"+String(cursor.getMonth()+1).padStart(2,"0");
function esc(v){const d=document.createElement("div");d.textContent=v??"";return d.innerHTML}
function status(m,t=""){$("status").textContent=m;$("status").className="status "+t}
function vehicle(){return state.vehicles.find(x=>x.id===activeId)}
function rows(key){return state[key].filter(x=>x.vehicleId===activeId)}
function formValue(form,name,value){const el=form.elements[name];if(el)el.type==="checkbox"?el.checked=!!value:el.value=value??""}
function resetEdit(kind){editing={kind,id:""};const form=$(kind+"Form");form?.reset()}
function openDialog(kind,id=""){
 if(busy||!loaded||!user)return;dialogError("");
 const dialog=$(kind+"Dialog"),form=$(kind+"Form"),v=vehicle();form.reset();editing={kind,id};
 form.querySelectorAll('input[type="date"]').forEach(x=>x.value=today());
 form.querySelectorAll('[name="odometer"]').forEach(x=>x.value=v?.odometer||0);
 const titles={vehicle:"Vehicle",km:"odometer reading",fuel:"fill-up",service:"service",reminder:"reminder"};
 $(kind+"DialogTitle").textContent=(id?"Edit ":"Add ")+titles[kind];
 if(id){
  const source=state[recordKeys[kind]];
  const item=source.find(x=>x.id===id);if(item)Object.entries(item).forEach(([k,val])=>formValue(form,k,val));
 }
 dialog.showModal();
}
async function commitChange(change){
 if(busy)return false;
 if(!user||!loaded){status('Wait for your Google account and Garage data to load.','error');return false}
 const account=user.uid,generation=authGeneration,ref=doc(db,'users',account,'garage','main');
 busy=true;controls();dialogError('');status('Saving…');
 try{
  const saved=await runTransaction(db,async transaction=>{
   const snapshot=await transaction.get(ref),next=applyGarageChange(snapshot.exists()?snapshot.data():{},change);
   transaction.set(ref,{...next,updatedAt:serverTimestamp()},{merge:true});return next;
  });
  if(generation!==authGeneration)return false;
  state=saved;if(change.kind==='vehicle'&&change.action==='upsert')activeId=change.item.id;
  if(!state.vehicles.some(item=>item.id===activeId))activeId=state.vehicles[0]?.id||'';
  if(change.kind==='km'&&change.action==='upsert')cursor=new Date(change.item.date+'T00:00:00');
  render();status('Saved to Firebase','ok');return true;
 }catch(error){if(generation===authGeneration){const message=storageError(error);status(message,'error');dialogError(message)}return false}
 finally{busy=false;controls()}
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
 $("vehicleType").textContent=v.type+" · "+v.fuelType;$("vehicleName").textContent=v.name;$("vehicleMeta").textContent=v.registration||"Registration not added";$("currentKm").textContent=currentOdometer(state,activeId).toLocaleString("en-IN")+" km";const autoKind=/bike|motorcycle|scooter/i.test(v.type+" "+v.name)?"bike":"car",art=v.art&&v.art!=="auto"?v.art:autoKind,theme=v.theme&&v.theme!=="auto"?v.theme:(autoKind==="bike"?"green":"silver");$("vehicleArt").dataset.kind=art;document.body.dataset.theme=theme;
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
document.querySelectorAll("dialog .close").forEach(button=>button.onclick=()=>{if(busy)return;button.closest("dialog").close();editing={kind:"",id:""};dialogError("")});
$("addVehicle").onclick=()=>openDialog("vehicle");$("editVehicle").onclick=()=>openDialog("vehicle",activeId);
$("updateKm").onclick=$("addKm").onclick=()=>openDialog("km");$("addFuel").onclick=()=>openDialog("fuel");$("addService").onclick=()=>openDialog("service");$("addReminder").onclick=()=>openDialog("reminder");
$("prevMonth").onclick=()=>{cursor=new Date(cursor.getFullYear(),cursor.getMonth()-1,1);render()};$("nextMonth").onclick=()=>{cursor=new Date(cursor.getFullYear(),cursor.getMonth()+1,1);render()};
$("vehicleSelect").onchange=event=>{activeId=event.target.value;render()};
for(const kind of Object.keys(recordKeys))$(kind+"Form").onsubmit=async event=>{
 event.preventDefault();if(busy)return;
 const form=event.currentTarget,data=new FormData(form),id=editing.id||newId(),wasEditing=!!editing.id;
 let item={id};
 if(kind==="vehicle")item={id,name:data.get("name").trim(),type:data.get("type"),registration:data.get("registration").trim(),fuelType:data.get("fuelType"),theme:data.get("theme")||"auto",art:data.get("art")||"auto",odometer:Number(data.get("odometer"))};
 else{
  item={id,vehicleId:activeId,date:data.get("date"),odometer:Number(data.get("odometer"))||0};
  if(kind==="fuel")Object.assign(item,{quantity:Number(data.get("quantity")),unit:data.get("unit"),cost:Number(data.get("cost")),fullTank:data.get("fullTank")==="on"});
  if(kind==="service")Object.assign(item,{work:data.get("work").trim(),cost:Number(data.get("cost")),workshop:data.get("workshop").trim()});
  if(kind==="reminder")item.title=data.get("title").trim();
 }
 if(await commitChange({action:"upsert",kind,item,editing:wasEditing,date:today(),readingId:newId()})){form.reset();$(kind+"Dialog").close();editing={kind:"",id:""}}
};
$("deleteVehicle").onclick=async()=>{const current=vehicle();if(busy||!current||!confirm('Delete "'+current.name+'" and all its records?'))return;await commitChange({action:"delete",kind:"vehicle",id:current.id})};
document.body.addEventListener("click",async event=>{
 const button=event.target.closest("[data-action]");if(!button||busy)return;
 const kind=button.dataset.kind,id=button.dataset.id;
 if(button.dataset.action==="edit"){openDialog(kind,id);return}
 if(confirm("Delete this entry?"))await commitChange({action:"delete",kind,id});
});
controls();
observeAuth(current=>{
 const generation=++authGeneration;stopGarage();user=current;loaded=false;state=normalizeGarage();activeId="";$("app").hidden=true;
 document.querySelectorAll('dialog[open]').forEach(dialog=>dialog.close());editing={kind:"",id:""};controls();
 if(!current){status("Sign in once on Dashboard to use all Invincible pages.","error");$("status").insertAdjacentHTML("beforeend",' <a href="/invincible/">Open Dashboard</a>');return}
 status("Loading your Garage…");
 stopGarage=onSnapshot(doc(db,"users",current.uid,"garage","main"),{includeMetadataChanges:true},snapshot=>{
  if(generation!==authGeneration||snapshot.metadata.hasPendingWrites)return;
  state=normalizeGarage(snapshot.exists()?snapshot.data():{});loaded=true;
  if(!state.vehicles.some(item=>item.id===activeId))activeId=state.vehicles[0]?.id||"";
  render();controls();if(!busy)status(snapshot.metadata.fromCache?"Cached data · checking Firebase…":"Synced to Firebase","ok");
 },error=>{if(generation!==authGeneration)return;loaded=false;controls();status(storageError(error),"error")});
}).catch(error=>{status("Could not restore your Google session: "+error.message,"error");controls()});
