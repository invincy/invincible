/* Plan 770 standard-life base benefits. Rate book pp.5,15-21,106-108,127-135;
 * LIC policy Parts B/C/D and sales brochure sections 2-4, 8-10.
 * All scheduled benefits assume survival and every required premium paid.
 */
(function (root) {
  'use strict';
  const rules = Object.freeze({7:[11,55],10:[8,55],12:[6,53],15:[3,50],18:[0,47]});
  const modes = Object.freeze({yearly:[1,1,'year'],halfYearly:[.509,2,'half-year'],quarterly:[.2568,4,'quarter'],monthly:[.0861,12,'month']});
  const highSA = {7:[0,3,6,8],10:[0,4,7,9],12:[0,5,8,10],15:[0,6,10,12],18:[0,7,12,15]};
  const channelGA = {7:30,10:30,12:24,15:22,18:20};
  const existingGA = {7:1,10:1.25,12:1.5,15:1.75,18:2};
  const defaults = Object.freeze({age:25,ppt:15,term:30,bsa:300000,mode:'yearly',channel:'agent',existing:false});
  const money = n => '₹' + Math.round(n).toLocaleString('en-IN');
  function validPpts(age) {
    if (!Number.isInteger(age)) return [];
    return Object.keys(rules).map(Number).filter(p => age >= rules[p][0] && age <= rules[p][1]);
  }
  function validTerms(age, ppt) {
    if (!validPpts(age).includes(ppt)) return [];
    return Array.from({length:41},(_,n)=>n).filter(n => n >= Math.max(ppt+10,28-age) && n <= Math.min(40,75-age));
  }
  function calculate(profile) {
    const {age,ppt,term,bsa,mode,channel,existing} = profile;
    if (!validPpts(age).includes(ppt)) throw new Error('इस age के लिए valid PPT चुनें।');
    if (!validTerms(age,ppt).includes(term)) throw new Error('इस age और PPT के लिए valid policy term चुनें।');
    if (!Number.isSafeInteger(bsa) || bsa < 300000 || bsa % 10000 !== 0) throw new Error('Cover कम से कम ₹3,00,000 और ₹10,000 के multiples में रखें।');
    if (!Object.hasOwn(modes,mode) || !['agent','online','cis'].includes(channel) || typeof existing !== 'boolean') throw new Error('Payment mode और purchase channel चुनें।');
    if (channel === 'online' && age < 18) throw new Error('Minor life के लिए agent channel चुनें।');
    const rate = root.BIMA_PREMIUM_RATES?.[ppt]?.[age]?.[term];
    if (!Number.isFinite(rate) || rate <= 0) throw new Error('इस combination की premium rate उपलब्ध नहीं है।');
    const annualPremium = Math.round(rate * bsa / 1000);
    const [factor,frequency,period] = modes[mode];
    const installment = Math.round(annualPremium * factor);
    const annualOutgo = installment * frequency;
    const slab = bsa >= 1000000 ? 3 : bsa >= 700000 ? 2 : bsa >= 500000 ? 1 : 0;
    const gaRate = 70 + highSA[ppt][slab] + (channel === 'agent' ? 0 : channelGA[ppt]) + (existing ? existingGA[ppt] : 0);
    const additionsAt = years => annualPremium * gaRate / 1000 * years * (years+1) / 2;
    const ga = additionsAt(ppt);
    return {...profile,rate,annualPremium,installment,frequency,period,annualOutgo,gaRate,ga,
      totalPremium:annualOutgo*ppt,regular:bsa/10,regularCount:term-ppt,
      booster:bsa*7/10,boosterYear:ppt+5,maturity:bsa+ga,
      totalBenefits:bsa/10*(term-ppt)+bsa*7/10+bsa+ga,
      deathSA:Math.max(bsa,11*annualPremium),riskStart:age>=8?0:Math.min(2,8-age)};
  }
  function schedule(result) {
    return Array.from({length:result.term},(_,i)=>{
      const year=i+1;
      return {year,premium:year<=result.ppt?result.annualOutgo:0,
        regular:year>=result.ppt&&year<result.term?result.regular:0,
        booster:year===result.boosterYear?result.booster:0,
        maturity:year===result.term?result.maturity:0};
    });
  }
  root.BimaPlatinumBenefits = {defaults,rules,modes,money,validPpts,validTerms,calculate,schedule};
})(globalThis);
