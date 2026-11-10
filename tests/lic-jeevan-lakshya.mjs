import test from 'node:test';
import assert from 'node:assert/strict';
import {computePlan,eligibleTerms,cashflows,deathSafeguards} from '../lic/jeevan-lakshya/benefits.mjs';
const profile={age:30,term:25,sumAssured:200000};
test('all 14 premium table cells and the separate benefit illustration match the brochure',()=>{
  for(const [age,term,expected] of [
    [20,13,20217],[20,15,16670],[20,20,11711],[20,25,9006],
    [30,13,20286],[30,15,16758],[30,20,11858],[30,25,9222],
    [40,13,20678],[40,15,17209],[40,20,12495],[40,25,10074],
    [50,13,22030],[50,15,18698],[35,25,9535]
  ])assert.equal(computePlan({...profile,age,term}).annual,expected);
  assert.equal(computePlan({...profile,age:31}).annual,null);
  assert.equal(computePlan({...profile,term:18}).annual,null);
  assert.equal(computePlan({...profile,sumAssured:1000000}).annual,null);
});
test('eligibility limits and BSA multiples reject invalid profiles',()=>{
  assert.deepEqual(eligibleTerms(50),[13,14,15]);
  assert.ok(eligibleTerms(18).includes(13));
  for(const changes of [{age:17},{age:51},{age:30.5},{term:12},{term:26},{age:50,term:20},{sumAssured:100000},{sumAssured:405000},{sumAssured:NaN},{bonusRate:-1},{fabRate:Infinity}])assert.throws(()=>computePlan({...profile,...changes}),RangeError);
  assert.equal(computePlan({...profile,sumAssured:210000}).guaranteedMaturity,210000);
  assert.equal(computePlan({...profile,sumAssured:450000}).guaranteedMaturity,450000);
});
test('guaranteed and assumed bonuses stay distinct, using full term rather than PPT',()=>{
  const p=computePlan({...profile,bonusRate:50,fabRate:30});
  assert.equal(p.ppt,22);assert.equal(p.totalPremium,202884);
  assert.equal(p.guaranteedMaturity,200000);assert.equal(p.bonus,250000);
  assert.equal(p.fab,6000);assert.equal(p.illustratedMaturity,456000);
  assert.equal(computePlan(profile).illustratedMaturity,200000);
  const rows=cashflows(p);assert.equal(rows.filter(r=>r.premium>0).length,22);
  assert.equal(rows.at(-1).guaranteed,200000);assert.equal(rows.at(-1).nonGuaranteed,256000);
});
test('death scheduling includes first eligible anniversary, stops premiums at PPT, and handles final year',()=>{
  const p=computePlan(profile);
  const early=cashflows(p,5);
  assert.equal(early.filter(r=>r.premium>0).length,5);
  assert.equal(early.filter(r=>r.income>0).length,20);
  assert.equal(early[4].income,20000);assert.equal(early.at(-1).income,0);
  assert.equal(early.at(-1).guaranteed,220000);
  assert.equal(cashflows(p,24).filter(r=>r.premium>0).length,22);
  assert.equal(cashflows(p,24).filter(r=>r.income>0).length,1);
  assert.equal(cashflows(p,25).filter(r=>r.income>0).length,0);
  assert.equal(cashflows(p,1).filter(r=>r.income>0).length,24);
  assert.throws(()=>cashflows(p,26));
});
test('death premium safeguards are calculated only for verified premiums',()=>{
  const safeguards=deathSafeguards(computePlan(profile),25);
  assert.equal(safeguards.sevenTimesPremium,64554);
  assert.equal(safeguards.minimum105Percent,213028.2);
  assert.equal(safeguards.needsLICReview,false);
  assert.equal(deathSafeguards(computePlan({...profile,sumAssured:1000000}),5),null);
  assert.equal(cashflows(computePlan({...profile,sumAssured:1000000}),24)[22].premium,0);
});
