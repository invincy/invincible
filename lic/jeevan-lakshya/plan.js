import {BROCHURE_URL,eligibleTerms,computePlan,cashflows,deathSafeguards} from './benefits.mjs';
const $=s=>document.querySelector(s);
const money=n=>n===null?'LIC quote required':'₹'+Math.round(n).toLocaleString('en-IN');
let journey='survival';
$('#brochureLink').href=BROCHURE_URL;
function terms(preferred=Number($('#policyTerm').value)||25){
  const available=eligibleTerms(Number($('#customerAge').value));
  $('#policyTerm').replaceChildren(...available.map(t=>new Option(`${t} years · pay ${t-3}`,t)));
  $('#policyTerm').value=available.includes(preferred)?preferred:available.at(-1)??'';
}
function cells(target,items){
  const nodes=items.map(([label,value])=>{const div=document.createElement('div');const span=document.createElement('span');const b=document.createElement('b');span.textContent=label;b.textContent=value;div.append(span,b);return div;});
  $(target).replaceChildren(...nodes);
}
function render(){
  try{
    const plan=computePlan({age:Number($('#customerAge').value),term:Number($('#policyTerm').value),sumAssured:Number($('#targetSumAssured').value),bonusRate:$('#bonusRate').value===''?NaN:Number($('#bonusRate').value),fabRate:$('#fabRate').value===''?NaN:Number($('#fabRate').value)});
    $('#profileError').hidden=true;$('#results').hidden=false;$('#benefitGrid').hidden=false;
    $('#structureTitle').textContent=`${plan.term} years of cover · ${plan.ppt} years of premiums`;
    cells('#planFacts',[['Basic Sum Assured',money(plan.sumAssured)],['Survival maturity · contractual',money(plan.guaranteedMaturity)],['Annual income after in-force death',money(plan.annualIncome)],['At maturity after in-force death · 110% BSA',money(plan.deathMaturity)]]);
    $('#premiumValue').textContent=plan.annual===null?'LIC quotation required':`${money(plan.annual)} / year · brochure sample`;
    $('#premiumNote').textContent=plan.annual===null?'No verified premium exists here for this combination. Benefits remain explorable; premium outflows are marked unavailable.':`Standard life, age ${plan.age}, ₹2 lakh BSA, ${plan.term}-year term; excludes taxes, riders and underwriting extras. Total base premiums: ${money(plan.totalPremium)}. ${plan.age===35?'From the separate age-35 benefit illustration.':''}`;
    cells('#benefitGrid',[['Contractual survival maturity',money(plan.guaranteedMaturity)],['Assumed future bonuses · not guaranteed',money(plan.bonus+plan.fab)],['Illustrated survival total · includes assumptions',money(plan.illustratedMaturity)]]);
    const slider=$('#demiseYearSlider');slider.max=plan.term;slider.value=Math.min(Number(slider.value),plan.term);const d=Number(slider.value);
    $('#demiseYearLabel').textContent=d;$('#whatIfControlBar').hidden=journey==='survival';
    $('#timelineTitle').textContent=`${plan.term}-year ${journey==='survival'?'survival':'death-benefit'} schedule`;
    $('#deathTiming').textContent=d===plan.term?`Death in the final policy year: no annual income instalment falls before maturity. ${money(plan.deathMaturity)} plus bonuses, if any, is scheduled at maturity.`:`Income: ${money(plan.annualIncome)} at anniversaries ${d}–${plan.term-1} (${plan.term-d} payments). ${money(plan.deathMaturity)} plus bonuses, if any, at maturity.`;
    const floor=deathSafeguards(plan,d);
    $('#deathSafeguards').textContent=floor?`Safeguards: 7 × annualised base premium = ${money(floor.sevenTimesPremium)}; 105% of premiums paid = ${money(floor.minimum105Percent)}. ${floor.needsLICReview?'LIC must determine the adjustment.':'Both are below this scheduled base death benefit.'}`:'Safeguards need an LIC premium quote; the schedule shows only 10% income and 110% BSA plus optional assumed bonuses.';
    const rows=cashflows(plan,journey==='survival'?null:d).map(e=>{const tr=document.createElement('tr');[e.year,money(e.premium),money(e.income),money(e.guaranteed),money(e.nonGuaranteed)].forEach(v=>{const td=document.createElement('td');td.textContent=v;tr.append(td);});return tr;});
    $('#cashflowTable tbody').replaceChildren(...rows);
    $('#summaryName').textContent=($('#customerName').value.trim()||'Parent')+"'s plan";
    $('#summaryGoal').textContent='Goal: '+($('#childGoal').value.trim()||'Child future');
    cells('#summaryGrid',[['Term / paying term',`${plan.term} / ${plan.ppt} years`],['Annual base premium',money(plan.annual)],['Survival contractual amount',money(plan.guaranteedMaturity)],['Future bonuses',`${money(plan.bonus+plan.fab)} assumed · not guaranteed`]]);
    $('#saPresetSelect').value=String(plan.sumAssured);
  }catch(error){$('#profileError').textContent=error.message;$('#profileError').hidden=false;$('#results').hidden=true;$('#benefitGrid').hidden=true;}
}
$('#profileForm').addEventListener('submit',e=>e.preventDefault());
$('#customerAge').addEventListener('input',()=>{terms();render();});
['policyTerm','targetSumAssured','customerName','childGoal','bonusRate','fabRate'].forEach(id=>$('#'+id).addEventListener('input',render));
$('#saPresetSelect').addEventListener('change',e=>{$('#targetSumAssured').value=e.target.value;render();});
$('#demiseYearSlider').addEventListener('input',render);
for(const [id,value] of [['viewSurvivalBtn','survival'],['viewWhatIfBtn','death']])$('#'+id).addEventListener('click',()=>{journey=value;for(const [selector,mode] of [['#viewSurvivalBtn','survival'],['#viewWhatIfBtn','death']]){$(selector).classList.toggle('active',journey===mode);$(selector).setAttribute('aria-pressed',String(journey===mode));}render();});
const params=new URLSearchParams(location.search);
for(const [key,id] of [['age','customerAge'],['sa','targetSumAssured']])if(params.has(key))$('#'+id).value=params.get(key);
if(params.has('goal'))$('#childGoal').value=params.get('goal').slice(0,160);
terms(params.has('term')?Number(params.get('term')):25);render();

document.body.dataset.ready='true';
