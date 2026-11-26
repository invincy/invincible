document.addEventListener('DOMContentLoaded',()=>{
  const model=globalThis.BimaPlatinumBenefits;
  const get=id=>document.getElementById(id);
  const money=model.money;
  let controller;
  function render(result) {
    get('policyResults').hidden=get('cashflowSection').hidden=!result;
    get('presentationLink').hidden=!result;
    if(!result) {
      for(const id of ['benefitSummary','policyDetails','cashflowRows'])get(id).replaceChildren();
      return;
    }
    const r=result;
    const cards=[['Premium',`${money(r.installment)} / ${r.period}`,`${r.ppt} years तक`],
      ['Regular income',`${money(r.regular)} / year`,`Year ${r.ppt} end से ${r.term-1} तक`],
      ['70% Booster',money(r.booster),`Year ${r.boosterYear} end पर`],
      ['Guaranteed Additions',money(r.ga),'PPT के दौरान जुड़ेंगे'],
      ['Maturity',money(r.maturity),`Year ${r.term} पर`],
      ['Total premiums',money(r.totalPremium),`${r.frequency} payment${r.frequency===1?'':'s'} / year`]];
    get('benefitSummary').innerHTML=cards.map(([label,value,note])=>`<article><h2>${label}</h2><strong>${value}</strong><p>${note}</p></article>`).join('');
    const details=[['Cover amount',money(r.bsa)],['Life cover (Sum Assured on Death)',money(r.deathSA)],
      ['Annualized premium (without modal loading)',money(r.annualPremium)],['Annual outgo in selected mode',money(r.annualOutgo)],
      ['GA rate per ₹1,000 cumulative annualized premiums',String(r.gaRate)],['Regular income payments',String(r.regularCount)],
      ['Total scheduled survival benefits',money(r.totalBenefits)]];
    get('policyDetails').innerHTML=details.map(([label,value])=>`<div><dt>${label}</dt><dd>${value}</dd></div>`).join('');
    get('riskNote').textContent=r.riskStart?'Below age 8: risk starts after two years or the anniversary at/after age 8, whichever is earlier. Before risk starts, death benefit is premiums paid without interest.':'Risk cover starts on acceptance of risk.';
    get('cashflowCaption').textContent=`${r.term}-year schedule · ${money(r.bsa)} cover`;
    get('cashflowRows').innerHTML=model.schedule(r).map(e=>`<tr><th scope="row">${e.year}</th>${['premium','regular','booster','maturity'].map(k=>`<td>${e[k]?money(e[k]):'—'}</td>`).join('')}</tr>`).join('');
    if(controller)get('presentationLink').href=controller.url('index.html');
  }
  controller=window.mountBimaProfile(get('policyExampleSelection'),render);
  get('presentationLink').href=controller.url('index.html');
});
