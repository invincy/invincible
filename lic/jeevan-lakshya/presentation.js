import {eligibleTerms,computePlan} from './benefits.mjs';
import {createNarrator} from './narration.mjs?v=16';
const $=id=>document.getElementById(id),stage=$('stageContainer');
const money=n=>n===null?'LIC quote required':'₹'+n.toLocaleString('en-IN');
const shortMoney=n=>'₹'+Number((n/100000).toFixed(2)).toLocaleString('en-IN')+' lakh';
const panels=['scene1','selectionPanel','configurationPanel','previewPanel','whatIfPanel','protectionPanel','detailsPanel'];
const steps=['intro','selected','configure','preview','whatif','protection','details'];
const copy={
 intro:['Child future · બાળકના સપના','Your Child’s <span class="gold">Lakshya</span>','બાળકનું લક્ષ્ય, માતા-પિતાનો સંકલ્પ',''],
 selected:['Your chosen goal','A future to <span class="gold">plan for</span>','તમારા બાળકનું લક્ષ્ય',''],
 configure:['Plan 733 · UIN 512N297V03','Make it <span class="gold">personal</span>','ઉંમર અને ટર્મ પસંદ કરો','Choose age, term and cover.'],
 preview:['Planned journey','The <span class="gold">Golden Path</span>','બચત અને જીવન સુરક્ષા','Build savings along your child’s journey.'],
 whatif:['A change in the journey','What <span class="gold">if…?</span>','જો માતા કે પિતાનું અવસાન થાય તો?','For an in-force policy, with all due premiums paid.'],
 protection:['Family protection','The path <span class="gold">continues</span>','પરિવાર માટે આવકનો આધાર',''],
 details:['Plan 733','Explore the <span class="gold">details</span>','તમારા પરિવાર માટે આયોજન કરો','Review the assumptions and full cash-flow calculation.']
};
let state='intro',age=30,term=25,sa=200000,goal='Education',goalSrc='assets/study.png',hasGoal=false;
let goalKey='education';
let timers=new Set(),generation=0,ready=true,capturing=false,flyer=null,flight=null;
let paused=false,pausedAnimations=[],benefitIndex=-1,transitioning=false,beatMoving=false,exitAnimations=[];
const BENEFIT_HOLD=4800;
const benefitIds=['riderPill','ceasesPill','incomePill','deathMaturityPill'];
const coin=$('goalCoin'),choices=$('goalChoices');
// Keep the visible artwork centred despite different transparent margins in the PNGs.
function coinArt(src){
 const artwork={
  'study.png':[232.5,272.5,329],
  'career.png':[235,245.5,338],
  'marriage.png':[259.5,242.5,371],
  'goals.png':[241.5,262.5,325],
  'jeevan-lakshya.png':[250,235.5,315]
 };
 const [x,y,diameter]=artwork[src.split('/').pop()];
 return{scale:325/diameter,dx:.5-x/500,dy:.5-y/500};
}
function centreCoinArt(img){
 const {scale,dx,dy}=coinArt(img.getAttribute('src'));
 img.style.transform=`translate(${dx*scale*100}%, ${dy*scale*100}%) scale(${scale})`;
}
choices.querySelectorAll('img').forEach(centreCoinArt);
function coinLanding(src){const r=coin.getBoundingClientRect(),a=coinArt(src),width=r.width*a.scale,height=r.height*a.scale;return{left:r.left+(r.width-width)/2+a.dx*width,top:r.top+(r.height-height)/2+a.dy*height,width,height};}
const sceneAssets=Promise.all([...document.querySelectorAll('.story-road,.story-family,#storyGoal,[data-goal] img')].map(img=>img.decode().catch(()=>{})));
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
function arm(task){task.deadline=Date.now()+task.remaining;task.id=setTimeout(()=>{timers.delete(task);if(task.token===generation)task.fn();},task.remaining);}
function later(ms,fn){const task={remaining:ms,fn,token:generation,id:null,deadline:0};timers.add(task);if(!paused)arm(task);}
function cancelSequence(){stopVoice();generation++;exitAnimations.forEach(a=>a.cancel());exitAnimations=[];transitioning=false;stage.dataset.transitioning='false';for(const task of timers)clearTimeout(task.id);timers.clear();flight?.cancel();flight=null;flyer?.remove();flyer=null;capturing=false;pausedAnimations.forEach(a=>{try{a.cancel();}catch{}});pausedAnimations=[];}
function pauseTimeline(){if(paused)return;paused=true;narration.pause();for(const task of timers){clearTimeout(task.id);task.id=null;task.remaining=Math.max(0,task.deadline-Date.now());}pausedAnimations=stage.getAnimations({subtree:true}).filter(a=>a.playState==='running');pausedAnimations.forEach(a=>a.pause());control();}
function resumeTimeline(){if(!paused)return;paused=false;narration.resume();for(const task of timers)arm(task);pausedAnimations.forEach(a=>{try{a.play();}catch{}});pausedAnimations=[];control();}
const narration=createNarrator({
 schedule:later,
 onStatus({value,muted}){
  stage.dataset.audioStatus=value;
  const blocked=value==='blocked';
  const label=blocked?'Enable narration':muted?'Unmute narration':'Mute narration';
  const soundButton=$('advisorAudioBtn');
  soundButton.classList.toggle('is-playing',value==='playing'&&!muted);
  $('advisorAudioLabel').textContent=label;
  soundButton.title=label;
  soundButton.setAttribute('aria-label',label);
  soundButton.setAttribute('aria-pressed',String(!muted&&!blocked));
 }
});
function stopVoice(){narration.cancel();}
function voiceCue(key,done,fallback,onStart){stage.dataset.voiceCue=key;stage.dispatchEvent(new CustomEvent('plan733:voice-cue',{detail:{key,goal,age,term,sumAssured:sa}}));narration.cue(key,done,fallback,onStart);}
function beginOpening(){
 stage.dataset.opening='family';
 voiceCue('intro.dreams',()=>{
  stage.dataset.opening='plan';
  $('subtitleText').hidden=false;
  $('subtitleText').textContent='Savings + life cover, planned around a goal.';
  voiceCue('intro.plan',chooseGoalReady,2800);
 },4200,()=>{
  later(300,()=>{stage.dataset.opening='path';});
  later(1350,()=>{stage.dataset.opening='coin';});
  later(1550,()=>{stage.dataset.opening='dreams';});
 });
}
function chooseGoalReady(){stage.dataset.opening='settled';ready=true;$('goalHint').hidden=false;$('goalHint').textContent='Choose your child’s goal';$('subtitleText').hidden=true;control();openGoals(true);voiceCue('goal.choose');}
function openGoals(open){if(open&&(state!=='intro'||!ready))return;stage.dataset.goalsOpen=String(open);$('scene1').classList.toggle('goals-open',open);coin.setAttribute('aria-expanded',String(open));choices.inert=!open;choices.setAttribute('aria-hidden',String(!open));}
function control(){
 const n=steps.indexOf(state);document.querySelector('.stage-counter-text').textContent=(n+1)+' / '+steps.length;document.querySelector('.stage-progress-fill').style.width=((n+1)/steps.length*100)+'%';$('ctaPrevBtn').disabled=state==='intro';
 const next=$('ctaNextBtn');next.hidden=['intro','selected','configure'].includes(state);next.disabled=transitioning||beatMoving||(state==='protection'?false:!ready);coin.disabled=transitioning||capturing||!ready||!['intro','selected'].includes(state);
 next.textContent=({preview:'What if the parent dies? →',whatif:'How does the plan help? →',protection:ready?'View plan details →':'Next benefit →',details:'Open base-plan calculator →'})[state]||'Continue →';next.setAttribute('aria-label',next.textContent);
 const toggle=$('storyModeToggle');
 const introRunning=state==='intro'&&!ready&&!capturing;
 const replayBenefits=state==='protection'&&ready;
 toggle.hidden=!paused&&!introRunning&&!['preview','whatif','protection'].includes(state);
 toggle.textContent=paused?'Resume':introRunning?'Skip intro':replayBenefits?'Replay':'Pause';
 toggle.setAttribute('aria-label',paused?'Resume automatic story':introRunning?'Skip introduction':replayBenefits?'Replay benefit journey':'Pause automatic story');
 toggle.setAttribute('aria-pressed',String(!paused));
 stage.dataset.sequenceReady=String(ready);stage.dataset.paused=String(paused);stage.dataset.capturing=String(capturing);
}
function model(){return computePlan({age,term,sumAssured:sa});}
function quote(){const valid=eligibleTerms(age);if(!valid.includes(term))term=[15,20,25].find(t=>valid.includes(t));for(const key of ['age','term','sa'])document.querySelectorAll('[data-'+key+']').forEach(b=>{const value={age,term,sa}[key];b.classList.toggle('active',Number(b.dataset[key])===value);b.setAttribute('aria-pressed',String(Number(b.dataset[key])===value));if(key==='term')b.disabled=!valid.includes(Number(b.dataset.term));});const p=model();$('previewPremium').textContent=money(p.annual);$('previewTerm').textContent='Pay '+p.ppt+' years · policy term '+p.term+' years';$('previewMaturity').textContent=shortMoney(p.guaranteedMaturity);$('previewMaturity').setAttribute('aria-label',money(p.guaranteedMaturity));$('incomeAmount').textContent=money(p.annualIncome)+' / year';$('deathMaturityAmount').textContent=shortMoney(p.deathMaturity);$('deathMaturityAmount').setAttribute('aria-label',money(p.deathMaturity));$('riderAmount').textContent=money(sa);$('riderScenarioAmount').textContent=money(sa)+' cover · equal to BSA';const url='calculator.html?'+new URLSearchParams({age,term,sa,goal});document.querySelectorAll('a[href^="calculator.html"]').forEach(a=>a.href=url);}
function reveal(id){
 $(id).hidden=false;
 stage.dataset.reveal=id;
 if(id==='maturityPill'){
  $('previewBonusNote').hidden=state!=='preview';
  alignMaturity();
 }
}
function alignMaturity(){const goal=$('storyGoal').getBoundingClientRect(),body=$('sceneStageContent').getBoundingClientRect();const left=goal.left+goal.width*(goalSrc.includes('marriage')?.90:.84)-body.left+7;stage.style.setProperty('--maturity-left',left+'px');stage.style.setProperty('--maturity-top',Math.max(8,goal.top+goal.height*.24-body.top)+'px');stage.style.setProperty('--maturity-width',Math.max(55,body.width-left)+'px');}
function setState(next,options={}){
 if(reduced()||options.immediate||!stage.dataset.ready||next==='whatif'){renderState(next,options);return;}
 cancelSequence();paused=false;transitioning=true;stage.dataset.transitioning='true';control();
 for(const id of panels){const el=$(id);if(!el.hidden&&id!=='scene1')exitAnimations.push(el.animate([{opacity:1,translate:'0 0'},{opacity:0,translate:'0 -6px'}],{duration:180,easing:'ease-out',fill:'forwards'}));}
 later(180,()=>renderState(next,options));
}
function renderState(next,{focus=true,restartOpening=false}={}){
 cancelSequence();paused=false;stopVoice();openGoals(false);state=next;ready=true;beatMoving=false;
 stage.dataset.flowStep=state;stage.dataset.storyStep=({intro:1,selected:1,configure:1,preview:2,whatif:3,protection:3,details:4})[state];
 stage.classList.remove('pills-out','family-away','child-in','path-restored','goal-restored');benefitIndex=-1;delete stage.dataset.benefitStep;stage.style.setProperty('--journey-progress','0');
 for(const id of panels)$(id).hidden=true;
 for(const id of ['maturityPill','previewBonusNote','familyBonusNote','whatIfCaption','assurancePill','riderPill','ceasesPill','incomePill','deathMaturityPill'])$(id).hidden=true;
 const visible=({intro:['scene1'],selected:['scene1','selectionPanel'],configure:['configurationPanel'],preview:['previewPanel'],whatif:['previewPanel','whatIfPanel'],protection:['protectionPanel'],details:['detailsPanel']})[state];visible.forEach(id=>$(id).hidden=false);
 const data=copy[state];$('eyebrowChip').textContent=data[0];$('headlineMain').innerHTML=data[1];$('headlineIndic').textContent=data[2];$('subtitleText').textContent=data[3];$('subtitleText').hidden=!data[3];
 const storyGoal=$('storyGoal');
 storyGoal.src=hasGoal?goalSrc:'assets/jeevan-lakshya.png';
 storyGoal.alt=hasGoal?goal:'LIC Jeevan Lakshya';
 centreCoinArt(storyGoal);
 $('goalHint').textContent=hasGoal?goal+' · tap to change':'Tap coin to choose a goal';$('selectionTitle').textContent=goal+' selected';
 $('sceneStageContent').scrollTop=0;quote();alignMaturity();
 if(!reduced()&&stage.dataset.ready==='true')$('layerHeadline').animate([{opacity:.35,translate:'0 5px'},{opacity:1,translate:'0 0'}],{duration:500,easing:'cubic-bezier(.16,1,.3,1)'});
 $('goalHint').hidden=state!=='intro';
 if(state==='intro'){
  paused=false;const token=generation;ready=false;coin.disabled=true;$('goalHint').hidden=true;
  stage.dataset.opening='family';
  if(restartOpening)beginOpening();
  else Promise.all([sceneAssets,narration.ready]).then(()=>{
   if(token!==generation||state!=='intro')return;
   const opening=hasGoal?chooseGoalReady:beginOpening;
   if(paused)later(0,opening);
   else opening();
  });
 }
 if(state==='selected'){voiceCue('goal.'+goalKey,()=>setState('configure'),1800);}
 if(state==='configure')voiceCue('profile.choose');
 if(state==='preview'){
  ready=false;reveal('premiumPill');voiceCue('plan.premium',()=>{reveal('maturityPill');ready=true;control();voiceCue('plan.maturity',()=>setState('whatif'),5000);},1500);
 }
 if(state==='whatif'){
  ready=false;reveal('premiumPill');reveal('maturityPill');voiceCue('family.whatif',()=>setState('protection'),7200);
  later(1200,()=>{stage.classList.add('pills-out');reveal('whatIfCaption');});
  later(2000,()=>stage.classList.add('child-in'));
  later(2200,()=>stage.classList.add('family-away'));
  later(4700,()=>{$('previewPanel').hidden=true;ready=true;control();});
 }
 if(state==='protection'){stage.classList.add('family-away','child-in');showBenefit(0);}

 control();if(focus){$('headlineMain').tabIndex=-1;$('headlineMain').focus({preventScroll:true});}
}
function showBenefit(index){
 if(state!=='protection'||index<0||index>=benefitIds.length)return;cancelSequence();benefitIndex=index;beatMoving=!reduced();ready=index===benefitIds.length-1;
 const progress=[.08,.38,.68,1][index];stage.dataset.benefitStep=String(index+1);stage.style.setProperty('--journey-progress',String(progress));
 stage.classList.toggle('path-restored',index>=2);stage.classList.toggle('goal-restored',index>=3);
 benefitIds.forEach((id,i)=>{$(id).hidden=i>index;$(id).classList.toggle('is-current',i===index);$(id).classList.toggle('is-settled',i<index);});
 const trail=$('benefitTrail'),point=trail.getPointAtLength(trail.getTotalLength()*progress);$('journeyOrb').setAttribute('cx',point.x);$('journeyOrb').setAttribute('cy',point.y);
 $('journeyStatus').textContent=['1 / 4 · Term Rider payout','2 / 4 · Future premiums stop','3 / 4 · Income every eligible year','4 / 4 · Maturity'][index];
 $('familyBonusNote').hidden=index!==3;
 alignMaturity();control();if(beatMoving)later(1100,()=>{beatMoving=false;control();});voiceCue(['family.rider','family.premiums-stop','family.annual-income','family.maturity'][index],index<3?()=>showBenefit(index+1):null,BENEFIT_HOLD);
}
function back(){const previous={selected:'intro',configure:'intro',preview:'configure',whatif:'preview',protection:'whatif',details:'protection'}[state];if(previous)setState(previous);else if(capturing)setState('intro');}
function next(){if(transitioning||beatMoving)return;if(state==='protection'&&!ready){if(paused)resumeTimeline();showBenefit(benefitIndex+1);return;}if(!ready||capturing)return;const target={preview:'whatif',whatif:'protection',protection:'details'}[state];if(target)setState(target);else if(state==='details')location.href=$('fullCalculatorLink').href;}
coin.addEventListener('click',()=>{
 if(state==='intro'&&!choices.inert)choices.querySelector('button').focus();
 else if(state==='selected')setState('intro');
});
document.querySelectorAll('[data-goal]').forEach(b=>b.addEventListener('click',async()=>{
 if(capturing||state!=='intro')return;stopVoice();capturing=true;ready=false;control();const token=generation;
 const source=b.querySelector('img'),from=source.getBoundingClientRect(),to=coinLanding(source.getAttribute('src'));
 flyer=source.cloneNode();flyer.dataset.captureGhost='true';flyer.alt='';flyer.setAttribute('aria-hidden','true');Object.assign(flyer.style,{position:'fixed',left:from.left+'px',top:from.top+'px',width:from.width+'px',height:from.height+'px',zIndex:1000,pointerEvents:'none',objectFit:'contain',transform:'none',transformOrigin:'0 0',filter:'drop-shadow(0 0 20px #ffe478)'});document.body.append(flyer);openGoals(false);
 if(!reduced()){flight=flyer.animate([{transform:'translate(0,0) scale(1)'},{transform:'translate('+(to.left-from.left)+'px,'+(to.top-from.top)+'px) scale('+(to.width/from.width)+')'}],{duration:700,easing:'cubic-bezier(.16,1,.3,1)',fill:'forwards'});try{await flight.finished;}catch{}}
 if(token!==generation)return;goal=b.textContent.trim();goalKey=b.dataset.goal;goalSrc=source.getAttribute('src');hasGoal=true;document.querySelectorAll('[data-goal]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});setState('selected',{immediate:true});
}));
$('openPreviewBtn').addEventListener('click',()=>setState('preview'));
$('replayBtn').addEventListener('click',()=>{paused=false;hasGoal=false;setState('intro');});
$('ctaNextBtn').addEventListener('click',next);$('ctaPrevBtn').addEventListener('click',back);
for(const key of ['age','term','sa'])document.querySelectorAll('[data-'+key+']').forEach(b=>b.addEventListener('click',()=>{if(key==='age')age=Number(b.dataset.age);if(key==='term')term=Number(b.dataset.term);if(key==='sa')sa=Number(b.dataset.sa);quote();}));
$('advisorAudioBtn').addEventListener('click',()=>{
 if(stage.dataset.audioStatus==='blocked'&&state==='intro'&&!ready){
  renderState('intro',{focus:false,restartOpening:true});
 }else narration.toggle();
});
$('storyModeToggle').addEventListener('click',()=>{if(paused){resumeTimeline();return;}if(state==='intro'){cancelSequence();chooseGoalReady();return;}if(state==='protection'&&ready){paused=false;setState('protection');}else if(paused)resumeTimeline();else pauseTimeline();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&state==='intro'&&!coin.disabled)coin.focus();if(e.target.closest('button,a,input,select,textarea')||e.altKey||e.ctrlKey||e.metaKey)return;if(e.key==='ArrowRight'){e.preventDefault();next();}if(e.key==='ArrowLeft'){e.preventDefault();back();}});
const wrapper=document.querySelector('.app-viewport-wrapper');function fit(){const vv=visualViewport;const height=vv&&Math.abs(vv.scale-1)<.01?vv.height:innerHeight;wrapper.style.setProperty('--presentation-height',Math.floor(height)+'px');if(stage.dataset.ready==='true')alignMaturity();}fit();addEventListener('resize',fit);visualViewport?.addEventListener('resize',fit);
addEventListener('pagehide',()=>{cancelSequence();stopVoice();});document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseTimeline();});
const debug=new URLSearchParams(location.search).get('debug')==='1';$('inspectorFab').hidden=!debug;$('inspectorFab').addEventListener('click',()=>$('inspectorPanel').classList.toggle('open'));$('toggle3DExploded').addEventListener('click',()=>stage.classList.toggle('exploded-view'));$('toggleDeviceFrame').addEventListener('click',()=>$('deviceFrame').classList.toggle('mode-fullscreen'));document.querySelectorAll('.layer-toggle-input').forEach(input=>input.addEventListener('change',()=>{const target=$(input.dataset.target);if(target){target.style.opacity=input.checked?'1':'0';target.style.pointerEvents=input.checked?'':'none';}}));
addEventListener('pageshow',e=>{if(e.persisted)setState(state,{focus:false});});
setState('intro',{focus:false});stage.dataset.ready='true';document.fonts?.ready.then(alignMaturity);coin.addEventListener('transitionend',e=>{if(['width','height'].includes(e.propertyName))alignMaturity();});
