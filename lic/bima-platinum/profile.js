/* One selector, shared between the presentation and calculator; no customer data saved. */
(function(root) {
  'use strict';
  const model=root.BimaPlatinumBenefits;
  root.mountBimaProfile=function(host,onChange) {
    const read=()=>{
      const params=new URLSearchParams(root.location.search);
      const p={...model.defaults};
      for(const k of ['age','ppt','term','bsa']) if(params.has(k)) p[k]=Number(params.get(k));
      for(const k of ['mode','channel']) if(params.has(k)) p[k]=params.get(k);
      if(params.has('existing')) p.existing=params.get('existing')==='true';
      try {model.calculate(p);return p;} catch {return {...model.defaults};}
    };
    let profile=read(),result=null;
    host.innerHTML=`<legend>अपना plan चुनें</legend><div class="policy-profile-grid">
      <label for="policyExampleAge">Entry age<select id="policyExampleAge"></select></label>
      <label for="policyExampleBsa">Cover amount (₹)<input id="policyExampleBsa" type="number" inputmode="numeric" min="300000" step="10000" required aria-describedby="policyProfileError"></label>
      <label for="policyExamplePpt">Pay for (PPT)<select id="policyExamplePpt"></select></label>
      <label for="policyExampleTerm">Policy term<select id="policyExampleTerm"></select></label>
      <label for="policyExampleMode">Payment mode<select id="policyExampleMode"><option value="yearly">Yearly</option><option value="halfYearly">Half-yearly</option><option value="quarterly">Quarterly</option><option value="monthly" title="Through NACH or salary deduction">Monthly</option></select></label>
      <label for="policyExampleChannel">Purchase channel<select id="policyExampleChannel"><option value="agent">Through agent</option><option value="online">Direct online</option><option value="cis">LIC employee (CIS)</option></select></label>
      </div><label class="policy-existing"><input id="policyExampleExisting" type="checkbox"> Eligible existing LIC policyholder / beneficiary</label>
      <p id="policyProfileError" class="policy-profile-error" role="status" aria-live="polite"></p>
      <p id="policyPremiumPreview" class="policy-premium-preview" aria-live="polite"></p>
      <p class="policy-profile-note">Standard-life base plan · riders / extras excluded · LIC quote से final confirmation</p>`;
    const get=id=>host.querySelector('#policyExample'+id);
    const selectOptions=(element,values,label=value=>value)=>{
      element.replaceChildren(...values.map(value=>{const option=document.createElement('option');option.value=value;option.textContent=label(value);return option;}));
    };
    selectOptions(get('Age'),Array.from({length:56},(_,n)=>n),n=>n===0?'Under 1 (30+ days)':`${n} years`);
    for(const key of ['Age','Bsa','Mode','Channel']) get(key).value=profile[key.toLowerCase()];
    get('Existing').checked=profile.existing;
    function dependencies() {
      get('Channel').querySelector('option[value="online"]').disabled=profile.age<18;
      if(profile.age<18 && profile.channel==='online') {profile.channel='agent';get('Channel').value='agent';}
      const ppts=model.validPpts(profile.age);
      if(!ppts.includes(profile.ppt)) profile.ppt=ppts[0];
      selectOptions(get('Ppt'),ppts,n=>`${n} years`);get('Ppt').value=profile.ppt;
      const terms=model.validTerms(profile.age,profile.ppt);
      if(!terms.includes(profile.term)) profile.term=terms.reduce((best,n)=>Math.abs(n-profile.term)<Math.abs(best-profile.term)?n:best,terms[0]);
      selectOptions(get('Term'),terms,n=>`${n} years`);get('Term').value=profile.term;
    }
    function update() {
      profile.bsa=Number(get('Bsa').value);
      try {
        result=model.calculate(profile);
        host.querySelector('#policyProfileError').textContent='';
        get('Bsa').setAttribute('aria-invalid','false');
        host.querySelector('#policyPremiumPreview').textContent=`Premium ${model.money(result.installment)} / ${result.period}`;
      } catch(error) {
        result=null;
        host.querySelector('#policyProfileError').textContent=error.message;
        get('Bsa').setAttribute('aria-invalid','true');
        host.querySelector('#policyPremiumPreview').textContent='';
      }
      onChange(result);
    }
    for(const [key,type] of [['Age','change'],['Bsa','input'],['Ppt','change'],['Term','change'],['Mode','change'],['Channel','change'],['Existing','change']]) {
      get(key).addEventListener(type,()=>{
        profile[key.toLowerCase()]=key==='Existing'?get(key).checked:['Age','Bsa','Ppt','Term'].includes(key)?Number(get(key).value):get(key).value;
        if(key==='Age'||key==='Ppt')dependencies();
        update();
      });
    }
    dependencies();update();
    return {getResult:()=>result,url:path=>{
      if(!result)return path;
      const url=new URL(path,root.location.href);
      for(const [k,v] of Object.entries(profile))url.searchParams.set(k,String(v));
      return url.href;
    }};
  };
})(globalThis);
