import {eligibleTerms,computePlan} from './benefits.mjs';
const SCENES={
  1:{eyebrow:'Child future · બાળકના સપના',headline:"Your Child’s <span class='gold'>Lakshya</span>",indic:'બાળકનું લક્ષ્ય, માતા-પિતાનો સંકલ્પ',subtitle:'Education, a career, a new chapter. Plan savings alongside life cover.',gu:'બાળકના શિક્ષણ અને ભવિષ્ય માટે બચત સાથે જીવન વીમાનું આયોજન કરો.'},
  2:{eyebrow:'Planned journey · નિયમિત બચત',headline:"The <span class='gold'>Golden Path</span>",indic:'બચત અને જીવન સુરક્ષા',subtitle:'Pay for the term minus three years. In-force survival maturity is BSA plus bonuses, if any.',gu:'પોલિસી ટર્મ કરતાં ત્રણ વર્ષ ઓછા પ્રીમિયમ ચૂકવો. પાકતી મુદતે મૂળ વીમા રકમ અને બોનસ, જો હોય તો મળે છે. ભાવિ બોનસની ગેરંટી નથી.'},
  3:{eyebrow:'In-force death protection',headline:"A <span class='gold'>Family Shield</span>",indic:'પરિવાર માટે આવકનો આધાર',subtitle:'All due premiums must be paid. Policy exclusions and death-benefit safeguards apply.',gu:'પોલિસી ચાલુ હોય અને બધા બાકી પ્રીમિયમ ભરેલા હોય ત્યારે મૃત્યુ પછી ભાવિ પ્રીમિયમ ચૂકવવાના રહેતા નથી. વાર્ષિક આવક પોલિસીની વર્ષગાંઠથી શરૂ થાય છે, તરત નહીં.'},
  4:{eyebrow:'Different financial roles',headline:"Savings <span class='gold'>and Life Cover</span>",indic:'બચત અને વીમાની ભૂમિકા સમજો',subtitle:'Compare life cover, liquidity and investment risk. Future bonuses and goal costs remain uncertain.',gu:'બચત અને જીવન વીમાની ભૂમિકા અલગ છે. ભાવિ બોનસ અને બાળકના લક્ષ્યનો ખર્ચ ગેરંટીડ નથી.'},
  5:{eyebrow:'Plan 733 · UIN 512N297V03',headline:"Plan for <span class='gold'>Tomorrow</span>",indic:'તમારા બાળક માટે આયોજન કરો',subtitle:'Exact brochure premiums only; other combinations need an LIC quote. Future bonuses are extra, if any.',gu:'ઉંમર, ટર્મ અને વીમા રકમ પસંદ કરો. ફક્ત બ્રોશરના ચોક્કસ ઉદાહરણ માટે પ્રીમિયમ બતાવાય છે. અન્ય ગણતરી માટે એલઆઈસીનું ક્વોટેશન જરૂરી છે.'}
};
const $=id=>document.getElementById(id);
const money=n=>n===null?'LIC quote required':'₹'+n.toLocaleString('en-IN');
let scene=1,auto=false,timer=null,speechToken=0,speaking=false;
let age=30,term=25,sa=1000000,goal='Education';
const wrapper=document.querySelector('.app-viewport-wrapper');
function fit(){const vv=window.visualViewport;const height=vv&&Math.abs(vv.scale-1)<.01?vv.height:innerHeight;wrapper.style.setProperty('--presentation-height',`${Math.floor(height)}px`);}
fit();window.addEventListener('resize',fit);window.visualViewport?.addEventListener('resize',fit);window.visualViewport?.addEventListener('scroll',fit);
function stop(){speechToken++;clearTimeout(timer);timer=null;speaking=false;if('speechSynthesis'in window)window.speechSynthesis.cancel();$('advisorAudioBtn').classList.remove('is-playing');$('advisorAudioLabel').textContent='Hear Advisor Voice';}
function nextLater(delay=6500){clearTimeout(timer);if(auto&&scene<5)timer=setTimeout(()=>show(scene+1),delay);}
function speak(){
  stop();
  if(!('speechSynthesis'in window)){ $('advisorAudioLabel').textContent='Voice unavailable';nextLater();return; }
  const token=speechToken;
  const voices=window.speechSynthesis.getVoices();
  const gu=voices.find(v=>v.lang.toLowerCase().startsWith('gu'));
  const utterance=new SpeechSynthesisUtterance(gu?SCENES[scene].gu:SCENES[scene].subtitle);
  utterance.lang=gu?'gu-IN':'en-IN';if(gu)utterance.voice=gu;utterance.rate=.95;
  speaking=true;$('advisorAudioBtn').classList.add('is-playing');$('advisorAudioLabel').textContent='Stop Advisor Voice';
  utterance.onend=utterance.onerror=()=>{if(token!==speechToken)return;speaking=false;$('advisorAudioBtn').classList.remove('is-playing');$('advisorAudioLabel').textContent='Hear Advisor Voice';nextLater(1800);};
  // Some browsers block synthesis without emitting an error or start event.
  nextLater(18000);
  utterance.onstart=()=>{if(token===speechToken)clearTimeout(timer);};
  try{window.speechSynthesis.speak(utterance);}catch{nextLater();}
}
function quote(){
  const valid=eligibleTerms(age);
  const termButtons=[...document.querySelectorAll('[data-term]')];
  if(!valid.includes(term)||!termButtons.some(b=>Number(b.dataset.term)===term))term=Number(termButtons.find(b=>valid.includes(Number(b.dataset.term)))?.dataset.term);
  for(const [key,value] of [['age',age],['term',term],['sa',sa]])document.querySelectorAll(`[data-${key}]`).forEach(b=>{b.classList.toggle('active',Number(b.dataset[key])===value);b.setAttribute('aria-pressed',String(Number(b.dataset[key])===value));if(key==='term')b.disabled=!valid.includes(Number(b.dataset.term));});
  const p=computePlan({age,term,sumAssured:sa});
  $('s2Ppt').textContent=`${p.ppt} Years`;$('s2Term').textContent=`${p.term} Years`;
  $('s2Premium').textContent=money(p.annual);$('s2Maturity').textContent=money(p.guaranteedMaturity);
  document.querySelector('.meter-fill-ppt').style.width=`${p.ppt/p.term*100}%`;
  document.querySelector('.meter-fill-bonus').style.width=`${3/p.term*100}%`;
  $('liveAnnualPremium').textContent=money(p.annual);$('liveMonthlyPremium').textContent=`${p.ppt} Years`;
  $('liveAnnualIncome').textContent=money(p.annualIncome)+'/yr';$('liveMaturityBenefit').textContent=money(p.guaranteedMaturity);
  const url='calculator.html?'+new URLSearchParams({age,term,sa,goal});
  document.querySelectorAll('a[href^="calculator.html"]').forEach(a=>a.href=url);
}
function show(n){
  if(n<1||n>5)return;stop();scene=n;const data=SCENES[n];
  $('stageContainer').dataset.storyStep=n;
  document.querySelector('.stage-counter-text').textContent=`${n} / 5`;
  document.querySelector('.stage-progress-fill').style.width=`${n/5*100}%`;
  $('eyebrowChip').textContent=data.eyebrow;$('headlineMain').innerHTML=data.headline;$('headlineIndic').textContent=data.indic;$('subtitleText').textContent=data.subtitle;
  for(let i=1;i<=5;i++){$('scene'+i).style.display=i===n?'flex':'none';$('scene'+i).setAttribute('aria-hidden',String(i!==n));}
  $('sceneStageContent').scrollTop=0;
  $('ctaPrevBtn').disabled=n===1;
  $('ctaNextBtn').textContent=n===5?'Open Full Calculator →':'Continue Story →';
  $('ctaNextBtn').setAttribute('aria-label',n===5?'Open Full Calculator':'Continue Story');
  quote();if(auto)speak();
}
$('ctaNextBtn').addEventListener('click',()=>{if(scene===5)location.href=document.querySelector('.open-calc-btn').href;else show(scene+1);});
$('ctaPrevBtn').addEventListener('click',()=>show(scene-1));
$('storyModeToggle').addEventListener('click',()=>{auto=!auto;$('storyModeToggle').setAttribute('aria-pressed',String(auto));$('storyModeToggle').textContent=auto?'Auto':'Manual';if(auto)speak();else stop();});
$('advisorAudioBtn').addEventListener('click',()=>{if(speaking)stop();else speak();});
for(const key of ['age','term','sa'])document.querySelectorAll(`[data-${key}]`).forEach(b=>b.addEventListener('click',()=>{if(key==='age')age=Number(b.dataset.age);if(key==='term')term=Number(b.dataset.term);if(key==='sa')sa=Number(b.dataset.sa);quote();}));
document.querySelectorAll('[data-goal]').forEach(b=>b.addEventListener('click',()=>{goal=b.textContent.trim();document.querySelectorAll('[data-goal]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});quote();}));
// Keep migration's inspection tools available only through an explicit debug URL.
const debug=new URLSearchParams(location.search).get('debug')==='1';
$('inspectorFab').hidden=!debug;
$('inspectorFab').addEventListener('click',()=>$('inspectorPanel').classList.toggle('open'));
$('toggle3DExploded').addEventListener('click',()=>$('stageContainer').classList.toggle('exploded-view'));
$('toggleDeviceFrame').addEventListener('click',()=>$('deviceFrame').classList.toggle('mode-fullscreen'));
document.querySelectorAll('.layer-toggle-input').forEach(input=>input.addEventListener('change',()=>{const target=$(input.dataset.target);if(target){target.style.opacity=input.checked?'1':'0';target.style.pointerEvents=input.checked?'':'none';}}));
window.addEventListener('keydown',e=>{if(e.target.closest('button,a,input,select,textarea')||e.altKey||e.ctrlKey||e.metaKey)return;if(['ArrowRight','ArrowLeft',' '].includes(e.key)){e.preventDefault();show(scene+(e.key==='ArrowLeft'?-1:1));}});
window.addEventListener('pagehide',stop);
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else if(auto)nextLater();});
show(1);$('stageContainer').dataset.ready='true';
