import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const context={};
for(const file of ['premium-rates.js','benefits.js'])vm.runInNewContext(readFileSync(new URL('../lic/bima-platinum/'+file,import.meta.url),'utf8'),context);
const model=context.BimaPlatinumBenefits;
const calculate=changes=>model.calculate({...model.defaults,...changes});

test('all 3,603 extracted rates cover exactly the eligible age/PPT/term combinations',()=>{
  let count=0;
  for(let age=0;age<=55;age++)for(const ppt of [7,10,12,15,18])for(let term=17;term<=40;term++) {
    const eligible=model.validTerms(age,ppt).includes(term);
    const rate=context.BIMA_PREMIUM_RATES[ppt]?.[age]?.[term];
    assert.equal(Number.isFinite(rate),eligible,`${age}/${ppt}/${term}`);
    if(eligible){const r=calculate({age,ppt,term});assert.equal(r.annualPremium,Math.round(rate*300));count++;}
  }
  assert.equal(count,3603);
});
test('all 20 independent LIC brochure premiums agree with the full rate table',()=>{
  const fixtures={15:[81810,54735,43020,32145,24990],25:[83145,55275,43290,32220,25005],35:[87495,57015,44160,32445,25005],45:[100365,62025,46770,33465,25425]};
  for(const [age,values] of Object.entries(fixtures))[7,10,12,15,18].forEach((ppt,i)=>assert.equal(calculate({age:Number(age),ppt}).annualPremium,values[i]));
  // Supplied rate-book worked example: age 35, term 40, PPT 7, BSA 20 lakh.
  const r=calculate({age:35,term:40,ppt:7,bsa:2000000,mode:'halfYearly'});
  assert.equal(r.annualPremium,611900);assert.equal(r.installment,311457);
});
test('custom cover uses high-SA addition incentives, with channel and existing incentives additive',()=>{
  const expected=[[490000,70],[500000,76],[690000,76],[700000,80],[990000,80],[1000000,82]];
  for(const [bsa,gaRate] of expected)assert.equal(calculate({bsa}).gaRate,gaRate);
  const r=calculate({bsa:500000});
  assert.equal(r.annualPremium,53700);assert.equal(r.ga,489744);assert.equal(r.maturity,989744);
  assert.equal(r.regular,50000);assert.equal(r.booster,350000);
  for(const ppt of [7,10,12,15,18]) {
    const base=calculate({ppt});const online=calculate({ppt,channel:'online'});
    const cis=calculate({ppt,channel:'cis'});
    assert.equal(cis.gaRate,online.gaRate);assert.equal(base.annualPremium,online.annualPremium);
    assert.equal(calculate({ppt,channel:'online',existing:true}).gaRate,online.gaRate+({7:1,10:1.25,12:1.5,15:1.75,18:2}[ppt]));
  }
});
test('mode loading changes actual outgo while GA and death SA use annualized premium',()=>{
  const yearly=calculate();
  for(const [mode,factor,frequency] of [['yearly',1,1],['halfYearly',.509,2],['quarterly',.2568,4],['monthly',.0861,12]]) {
    const r=calculate({mode});assert.equal(r.installment,Math.round(32220*factor));
    assert.equal(r.totalPremium,r.installment*frequency*15);
    assert.equal(r.ga,270648);assert.equal(r.deathSA,354420);assert.equal(r.maturity,570648);
    assert.equal(r.annualPremium,yearly.annualPremium);
  }
});
test('schedules pay income at end of PPT through the anniversary before maturity; booster PPT+5',()=>{
  for(const ppt of [7,10,12,15,18])for(const term of model.validTerms(25,ppt)) {
    const r=calculate({ppt,term,bsa:740000});const rows=model.schedule(r);
    assert.equal(rows.length,term);assert.equal(rows.filter(e=>e.regular).length,term-ppt);
    assert.equal(rows[ppt-1].regular,74000);assert.equal(rows[term-1].regular,0);
    assert.equal(rows[ppt+4].booster,518000);
    assert.equal(rows.at(-1).maturity,r.maturity);
    assert.equal(rows.reduce((sum,e)=>sum+e.regular+e.booster+e.maturity,0).toFixed(2),r.totalBenefits.toFixed(2));
  }
});
test('reject invalid custom inputs instead of extrapolating or displaying stale values',()=>{
  for(const changes of [{age:56},{age:2,ppt:15},{term:24},{bsa:299999},{bsa:305000},{bsa:NaN},{bsa:Infinity},{age:25.5},{mode:'bogus'},{channel:'posp'},{existing:'yes'},{age:15,channel:'online'}])assert.throws(()=>calculate(changes));
  assert.deepEqual(Array.from(model.validPpts(0)),[18]);assert.deepEqual(Array.from(model.validTerms(55,7)),[17,18,19,20]);
  assert.equal(calculate({age:0,ppt:18,term:28}).riskStart,2);
});
