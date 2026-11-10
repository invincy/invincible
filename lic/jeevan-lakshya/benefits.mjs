// LIC Plan 733, UIN 512N297V03. Sources and scope: docs/lic-jeevan-lakshya.md.
export const BROCHURE_URL = 'https://licindia.in/documents/20121/1319704/LIC%2BJeevan%2BLakshya%2BSales%2BBrochure_Eng_06112025.pdf/fcc745f6-e73e-c825-d3a6-9831221c5cc9';
// Exact standard-life annual samples for BSA Rs 2 lakh. Never scale/interpolate.
export const PREMIUMS = Object.freeze({
  20: {13:20217,15:16670,20:11711,25:9006},
  30: {13:20286,15:16758,20:11858,25:9222},
  35: {25:9535}, // Separate benefit illustration, not the sample table.
  40: {13:20678,15:17209,20:12495,25:10074},
  50: {13:22030,15:18698}
});
export function eligibleTerms(age) {
  if (!Number.isInteger(age) || age < 18 || age > 50) return [];
  return Array.from({length:13},(_,i)=>i+13).filter(t=>age+t>=31 && age+t<=65);
}
export function validateProfile({age,term,sumAssured,bonusRate=0,fabRate=0}) {
  if (!eligibleTerms(age).includes(term)) throw new RangeError('Use entry age 18–50, term 13–25 and maturity age 31–65. LIC must verify the age basis.');
  const step=sumAssured<=400000?10000:50000;
  if (!Number.isSafeInteger(sumAssured) || sumAssured<200000 || sumAssured%step!==0) throw new RangeError('Basic Sum Assured: minimum ₹2 lakh; multiples of ₹10,000 up to ₹4 lakh and ₹50,000 above ₹4 lakh.');
  if (![bonusRate,fabRate].every(v=>Number.isFinite(v)&&v>=0&&v<=1000)) throw new RangeError('Enter bonus assumptions between 0 and 1,000 per ₹1,000 BSA.');
}
export function computePlan(profile) {
  validateProfile(profile);
  const {age,term,sumAssured,bonusRate=0,fabRate=0}=profile;
  const annual=sumAssured===200000?PREMIUMS[age]?.[term]??null:null;
  const ppt=term-3;
  const bonus=Math.round(sumAssured/1000*bonusRate*term);
  const fab=Math.round(sumAssured/1000*fabRate);
  return {age,term,ppt,sumAssured,annual,totalPremium:annual===null?null:annual*ppt,
    guaranteedMaturity:sumAssured,bonus,fab,illustratedMaturity:sumAssured+bonus+fab,
    annualIncome:sumAssured/10,deathMaturity:Math.round(sumAssured*1.1)};
}
// Death just BEFORE anniversary d, in policy year d. Premiums at year's start;
// income at anniversaries d..term-1. Death in final year has no income instalment.
export function cashflows(plan,deathYear=null) {
  if(deathYear!==null&&(!Number.isInteger(deathYear)||deathYear<1||deathYear>plan.term)) throw new RangeError('Death year must be within the policy term.');
  return Array.from({length:plan.term},(_,i)=>{
    const year=i+1;
    return {year,premium:year<=plan.ppt&&(deathYear===null||year<=deathYear)?plan.annual:0,
      income:deathYear!==null&&year>=deathYear&&year<plan.term?plan.annualIncome:0,
      guaranteed:year===plan.term?(deathYear===null?plan.guaranteedMaturity:plan.deathMaturity):0,
      nonGuaranteed:year===plan.term?plan.bonus+plan.fab:0};
  });
}
export function deathSafeguards(plan,deathYear) {
  if(plan.annual===null) return null;
  const totalPaid=plan.annual*Math.min(deathYear,plan.ppt);
  const scheduled=plan.deathMaturity+plan.annualIncome*Math.max(0,plan.term-deathYear);
  return {sevenTimesPremium:7*plan.annual,minimum105Percent:totalPaid*1.05,scheduled,
    needsLICReview:Math.max(7*plan.annual,totalPaid*1.05)>scheduled};
}
