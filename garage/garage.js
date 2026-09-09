import{initializeApp}from"https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import{getAuth}from"https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import{getFirestore,doc,onSnapshot,setDoc,serverTimestamp}from"https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
const config={apiKey:"AIzaSyBeVpUqcRO_VXfQrGVL5OaSGHKFB8XEQMc",authDomain:"life-by-adichimp.firebaseapp.com",projectId:"life-by-adichimp",storageBucket:"life-by-adichimp.firebasestorage.app",messagingSenderId:"761981819700",appId:"1:761981819700:web:8e88516817ed40b9866361"};
const auth=getAuth(initializeApp(config)),db=getFirestore(),$=id=>document.getElementById(id);
const money=n=>new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(Number(n)||0);
const newId=()=>crypto.randomUUID?.()||String(Date.now()+Math.random()),today=()=>new Date().toISOString().slice(0,10);
let user=null,activeId="",state={vehicles:[],fuel:[],services:[],reminders:[]};
function esc(v){const d=document.createElement("div");d.textContent=v??"";return d.innerHTML}
function status(m,t=""){$("status").textContent=m;$("status").className="status "+t}
function vehicle(){return state.vehicles.find(x=>x.id===activeId)}
function rows(key){return state[key].filter(x=>x.vehicleId===activeId)}
function openDialog(id){const d=$(id),v=vehicle();d.querySelectorAll('input[type="date"]').forEach(x=>x.value=today());d.querySelectorAll('[name="odometer"]').forEach(x=>x.value=v?.odometer||0);d.showModal()}
async function save(){if(!user)return;status("Saving…");await setDoc(doc(db,"users",user.uid,"garage","main"),{...state,updatedAt:serverTimestamp()},{merge:true});status("Saved to Firebase","ok")}
function render(){
 if(!activeId&&state.vehicles[0])activeId=state.vehicles[0].id;
 $("vehicleSelect").innerHTML=state.vehicles.map(v=>'<option value="'+v.id+'">'+esc(v.name)+'</option>').join("");
 $("vehicleSelect").value=activeId;
 const v=vehicle(),has=!!v;$("app").hidden=!has;
 if(!has){status("Add your first vehicle to start tracking.","ok");return}
 $("vehicleType").textContent=v.type+" · "+v.fuelType;$("vehicleName").textContent=v.name;$("vehicleMeta").textContent=v.registration||"Registration not added";$("currentKm").textContent=Number(v.odometer||0).toLocaleString("en-IN")+" km";
 const fuel=rows("fuel").sort((a,b)=>b.date.localeCompare(a.date)),services=rows("services").sort((a,b)=>b.date.localeCompare(a.date)),reminders=rows("reminders");
 const month=today().slice(0,7),monthCost=fuel.filter(x=>x.date.startsWith(month)).reduce((a,x)=>a+Number(x.cost),0);
 const chronological=[...fuel].sort((a,b)=>Number(a.odometer)-Number(b.odometer));
 const distance=chronological.length>1?Number(chronological[chronological.length-1].odometer)-Number(chronological[0].odometer):0;
 const qty=chronological.slice(1).filter(x=>x.fullTank).reduce((a,x)=>a+Number(x.quantity),0),mileage=distance>0&&qty>0?distance/qty:0,totalFuel=fuel.reduce((a,x)=>a+Number(x.cost),0);
 $("monthFuel").textContent=money(monthCost);$("monthDistance").textContent=distance.toLocaleString("en-IN")+" km";$("avgMileage").textContent=mileage?mileage.toFixed(1)+" km/"+(fuel[0]?.unit||"L"):"—";$("costPerKm").textContent=distance?money(totalFuel/distance):"—";
 $("fuelList").innerHTML=fuel.map(x=>'<div class="record"><div class="record-main"><span class="record-icon">F</span><div><strong>'+x.quantity+" "+x.unit+'</strong><small>'+x.date+" · "+Number(x.odometer).toLocaleString("en-IN")+" km"+(x.fullTank?" · full tank":"")+'</small></div></div><div class="record-actions"><strong class="amount">'+money(x.cost)+'</strong><button class="icon delete" data-kind="fuel" data-id="'+x.id+'" title="Delete">×</button></div></div>').join("");$("emptyFuel").hidden=!!fuel.length;
 $("serviceList").innerHTML=services.map(x=>'<div class="record"><div class="record-main"><span class="record-icon">S</span><div><strong>'+esc(x.work)+'</strong><small>'+x.date+" · "+Number(x.odometer).toLocaleString("en-IN")+" km"+(x.workshop?" · "+esc(x.workshop):"")+'</small></div></div><div class="record-actions"><strong class="amount">'+money(x.cost)+'</strong><button class="icon delete" data-kind="services" data-id="'+x.id+'" title="Delete">×</button></div></div>').join("");$("emptyService").hidden=!!services.length;
 $("reminderList").innerHTML=reminders.sort((a,b)=>(a.date||"9999").localeCompare(b.date||"9999")).map(x=>'<div class="reminder '+(x.date&&x.date<today()?"overdue":"")+'"><div class="record"><div><strong>'+esc(x.title)+'</strong><div class="due">'+(x.date?"Due "+x.date:"")+(x.date&&x.odometer?" · ":"")+(x.odometer?"At "+Number(x.odometer).toLocaleString("en-IN")+" km":"")+'</div></div><button class="icon delete" data-kind="reminders" data-id="'+x.id+'" title="Delete">×</button></div></div>').join("");$("emptyReminders").hidden=!!reminders.length;
 const last=services[0];$("lastService").innerHTML=last?esc(last.work)+"<small>"+last.date+" · "+Number(last.odometer).toLocaleString("en-IN")+" km · "+money(last.cost)+"</small>":"Not recorded";
}
document.querySelectorAll("dialog .close").forEach(b=>b.onclick=()=>b.closest("dialog").close());
$("addVehicle").onclick=()=>openDialog("vehicleDialog");$("updateKm").onclick=()=>openDialog("kmDialog");$("addFuel").onclick=()=>openDialog("fuelDialog");$("addService").onclick=()=>openDialog("serviceDialog");$("addReminder").onclick=()=>openDialog("reminderDialog");
$("vehicleSelect").onchange=e=>{activeId=e.target.value;render()};
$("vehicleForm").onsubmit=async e=>{e.preventDefault();const f=new FormData(e.currentTarget),v={id:newId(),name:f.get("name").trim(),type:f.get("type"),registration:f.get("registration").trim(),fuelType:f.get("fuelType"),odometer:Number(f.get("odometer"))};state.vehicles.push(v);activeId=v.id;render();await save();e.currentTarget.reset();$("vehicleDialog").close()};
$("kmForm").onsubmit=async e=>{e.preventDefault();vehicle().odometer=Math.max(Number(vehicle().odometer||0),Number(new FormData(e.currentTarget).get("odometer")));render();await save();$("kmDialog").close()};
$("fuelForm").onsubmit=async e=>{e.preventDefault();const f=new FormData(e.currentTarget),odo=Number(f.get("odometer"));state.fuel.push({id:newId(),vehicleId:activeId,date:f.get("date"),odometer:odo,quantity:Number(f.get("quantity")),unit:f.get("unit"),cost:Number(f.get("cost")),fullTank:f.get("fullTank")==="on"});vehicle().odometer=Math.max(vehicle().odometer||0,odo);render();await save();e.currentTarget.reset();$("fuelDialog").close()};
$("serviceForm").onsubmit=async e=>{e.preventDefault();const f=new FormData(e.currentTarget),odo=Number(f.get("odometer"));state.services.push({id:newId(),vehicleId:activeId,date:f.get("date"),odometer:odo,work:f.get("work").trim(),cost:Number(f.get("cost")),workshop:f.get("workshop").trim()});vehicle().odometer=Math.max(vehicle().odometer||0,odo);render();await save();e.currentTarget.reset();$("serviceDialog").close()};
$("reminderForm").onsubmit=async e=>{e.preventDefault();const f=new FormData(e.currentTarget);state.reminders.push({id:newId(),vehicleId:activeId,title:f.get("title").trim(),date:f.get("date"),odometer:Number(f.get("odometer"))||0});render();await save();e.currentTarget.reset();$("reminderDialog").close()};
document.body.onclick=async e=>{const b=e.target.closest(".delete");if(!b)return;state[b.dataset.kind]=state[b.dataset.kind].filter(x=>x.id!==b.dataset.id);render();await save()};
await auth.authStateReady();user=auth.currentUser;
if(user)onSnapshot(doc(db,"users",user.uid,"garage","main"),s=>{state=s.exists()?{vehicles:[],fuel:[],services:[],reminders:[],...s.data()}:{vehicles:[],fuel:[],services:[],reminders:[]};if(!state.vehicles.some(x=>x.id===activeId))activeId=state.vehicles[0]?.id||"";render();status("Synced · "+(user.email||"signed in"),"ok")},e=>status(e.message,"error"));
else{status("Sign in on the Dashboard first, then return to Garage.","error");$("status").insertAdjacentHTML("beforeend",' <a href="/invincible/">Open Dashboard</a>')}