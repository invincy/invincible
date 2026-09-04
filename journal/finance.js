import{initializeApp}from"https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import{getAuth}from"https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import{getFirestore,doc,onSnapshot,setDoc,serverTimestamp}from"https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const config={apiKey:"AIzaSyBeVpUqcRO_VXfQrGVL5OaSGHKFB8XEQMc",authDomain:"life-by-adichimp.firebaseapp.com",projectId:"life-by-adichimp",storageBucket:"life-by-adichimp.firebasestorage.app",messagingSenderId:"761981819700",appId:"1:761981819700:web:8e88516817ed40b9866361"};
const auth=getAuth(initializeApp(config)),db=getFirestore();
const $=id=>document.getElementById(id),money=n=>new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2}).format(Number(n)||0);
const defaults=[["rent","Rent"],["maid","Maid"],["internet","Internet"],["electricity","Electricity"],["upi","HDFC UPI due"],["cc","Credit-card due"]].map(([id,label])=>({id,label,done:false}));
let cursor=new Date(),unsubscribe=null,user=null,state={accounts:[],transactions:[],checklist:defaults};
const monthKey=()=>`${cursor.getFullYear()}-${String(cursor.getMonth()+1).padStart(2,"0")}`;
const newId=()=>crypto.randomUUID?.()||`${Date.now()}-${Math.random()}`;

function setStatus(message,type=""){const el=$("status");el.textContent=message;el.className=`status ${type}`}
function totals(){const assets=state.accounts.filter(x=>x.type==="asset").reduce((a,x)=>a+Number(x.balance||0),0),liabilities=state.accounts.filter(x=>x.type==="liability").reduce((a,x)=>a+Number(x.balance||0),0),income=state.transactions.filter(x=>x.type==="income").reduce((a,x)=>a+Number(x.amount||0),0),expense=state.transactions.filter(x=>x.type==="expense").reduce((a,x)=>a+Number(x.amount||0),0);return{assets,liabilities,income,expense}}
function render(){
  $("monthLabel").textContent=cursor.toLocaleString(undefined,{month:"long",year:"numeric"});
  const t=totals();$("totalAssets").textContent=money(t.assets);$("totalLiabilities").textContent=money(t.liabilities);$("netWorth").textContent=money(t.assets-t.liabilities);$("netFlow").textContent=money(t.income-t.expense);
  $("accounts").innerHTML=state.accounts.map(x=>`<article class="account ${x.type}"><div class="row"><h3>${escapeHtml(x.name)}</h3><button class="icon remove-account" data-id="${x.id}" title="Remove">×</button></div><span class="badge">${x.type}</span><strong>${money(x.balance)}</strong></article>`).join("");
  $("emptyAccounts").hidden=state.accounts.length>0;
  const max=Math.max(t.income,t.expense,1),height=n=>Math.max(3,Math.round(n/max*155));
  $("chart").innerHTML=`<div class="bar-wrap"><div class="bar income" style="height:${height(t.income)}px"><span>${money(t.income)}</span></div><div class="bar expense" style="height:${height(t.expense)}px"><span>${money(t.expense)}</span></div></div>`;
  $("transactions").innerHTML=[...state.transactions].sort((a,b)=>b.date.localeCompare(a.date)).map(x=>`<div class="transaction"><div><strong>${escapeHtml(x.description)}</strong><small>${x.date} · ${x.type}</small></div><div><strong class="amount ${x.type}">${x.type==="expense"?"−":"+"}${money(x.amount)}</strong><button class="icon remove-transaction" data-id="${x.id}" title="Remove">×</button></div></div>`).join("");
  $("emptyTransactions").hidden=state.transactions.length>0;
  $("checklist").innerHTML=state.checklist.map(x=>`<label class="check-item ${x.done?"done":""}"><input type="checkbox" data-id="${x.id}" ${x.done?"checked":""}><span>${escapeHtml(x.label)}</span><button class="icon remove-check" data-id="${x.id}" type="button" title="Remove">×</button></label>`).join("");
  const done=state.checklist.filter(x=>x.done).length;$("checkProgress").textContent=`${done}/${state.checklist.length} done`;
}
function escapeHtml(v){const d=document.createElement("div");d.textContent=v;return d.innerHTML}
async function save(){if(!user)return;setStatus("Saving…");await setDoc(doc(db,"users",user.uid,"finance",monthKey()),{...state,updatedAt:serverTimestamp()},{merge:true});setStatus("Saved to Firebase","ok")}
function listen(){
  unsubscribe?.();setStatus("Loading month…");const ref=doc(db,"users",user.uid,"finance",monthKey());
  unsubscribe=onSnapshot(ref,s=>{state=s.exists()?{accounts:[],transactions:[],checklist:defaults,...s.data()}:{accounts:[],transactions:[],checklist:defaults.map(x=>({...x}))};render();$("app").hidden=false;setStatus(`Synced · ${user.email||"signed in"}`,"ok")},e=>setStatus(e.message,"error"));
}
function moveMonth(delta){cursor=new Date(cursor.getFullYear(),cursor.getMonth()+delta,1);listen()}
function openDialog(id){const d=$(id);if(id==="transactionDialog")d.querySelector('[name="date"]').value=`${monthKey()}-01`;d.showModal()}
document.querySelectorAll("dialog .close").forEach(b=>b.onclick=()=>b.closest("dialog").close());
$("prevMonth").onclick=()=>moveMonth(-1);$("nextMonth").onclick=()=>moveMonth(1);
["addAccount","addAccountInline"].forEach(id=>$(id).onclick=()=>openDialog("accountDialog"));
["addTransaction","addTransactionInline"].forEach(id=>$(id).onclick=()=>openDialog("transactionDialog"));
$("accountForm").onsubmit=async e=>{e.preventDefault();const f=new FormData(e.currentTarget);state.accounts.push({id:newId(),name:f.get("name").trim(),type:f.get("type"),balance:Number(f.get("balance"))});render();await save();e.currentTarget.reset();$("accountDialog").close()};
$("transactionForm").onsubmit=async e=>{e.preventDefault();const f=new FormData(e.currentTarget);state.transactions.push({id:newId(),description:f.get("description").trim(),type:f.get("type"),amount:Number(f.get("amount")),date:f.get("date")});render();await save();e.currentTarget.reset();$("transactionDialog").close()};
$("checkForm").onsubmit=async e=>{e.preventDefault();state.checklist.push({id:newId(),label:$("checkLabel").value.trim(),done:false});$("checkLabel").value="";render();await save()};
$("checklist").onchange=async e=>{if(!e.target.matches("input[type=checkbox]"))return;const x=state.checklist.find(x=>x.id===e.target.dataset.id);if(x)x.done=e.target.checked;render();await save()};
document.body.onclick=async e=>{const b=e.target.closest("[data-id]");if(!b||!b.classList.contains("icon"))return;if(b.classList.contains("remove-account"))state.accounts=state.accounts.filter(x=>x.id!==b.dataset.id);if(b.classList.contains("remove-transaction"))state.transactions=state.transactions.filter(x=>x.id!==b.dataset.id);if(b.classList.contains("remove-check"))state.checklist=state.checklist.filter(x=>x.id!==b.dataset.id);render();await save()};

await auth.authStateReady();
user=auth.currentUser;
if(user)listen();else{setStatus("Sign in on the Dashboard first, then return to Monthly Finance.","error");$("status").insertAdjacentHTML("beforeend",' <a href="/invincible/">Open Dashboard</a>')}
