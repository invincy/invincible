const PLAN_DATA={
 customer:{name:'Mr. 29',age:29,occupation:'Business / Shop Owner',investibleAmount:65280,period:'annual'},
 product:{name:'LIC Bima Platinum',planNo:770,uin:'512N397V01',term:25,ppt:15,regularStart:15,regularEnd:24,boosterYear:20,maturityYear:25},
 options:[
  {id:'starter',label:'Easy Start',title:'Starter Guaranteed Bucket',structure:'1 × ₹3 lakh policy',bsa:300000,annual:32640,halfYearly:16614,quarterly:8382,monthly:2810,totalPremium:489600,ga:274176,regular:30000,regularCount:10,regularTotal:300000,booster:210000,survival:510000,maturity:574176,total:1084176,cover:'₹3,61,325 – ₹6,33,216'},
  {id:'balanced',label:'Balanced',title:'Balanced',structure:'1 × ₹5 lakh policy',bsa:500000,annual:54400,halfYearly:27690,quarterly:13970,monthly:4684,totalPremium:816000,ga:496128,regular:50000,regularCount:10,regularTotal:500000,booster:350000,survival:850000,maturity:996128,total:1846128,cover:'₹6,02,534 – ₹10,94,528'},
  {id:'dual',label:'Flexible Build',title:'Dual Policy / Flexibility',structure:'2 independent ₹3 lakh policies',bsa:600000,annual:65280,monthly:5440,totalPremium:979200,ga:548352,regular:60000,regularCount:10,regularTotal:600000,booster:420000,survival:1020000,maturity:1148352,total:2168352,cover:'Two independent policy covers',flex:true}
 ]
};
let selected='dual',chartView='annual';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const money=n=>'₹'+Math.round(n).toLocaleString('en-IN');
const current=()=>PLAN_DATA.options.find(o=>o.id===selected);

$('.hero').insertAdjacentHTML('afterbegin','<div class="hero-art" aria-hidden="true"><span class="art-business">🏭</span><span class="art-market">📈</span><span class="art-shield">🛡️</span><i class="orbit orbit-one"></i><i class="orbit orbit-two"></i></div>');
$('.hero-copy p').insertAdjacentHTML('afterend','<div class="mini-flow" aria-label="Business and market growth balanced by a guaranteed bucket"><span>🏭 Business</span><b>+</b><span>📈 Market</span><b>→</b><span>🛡️ Stability</span></div>');
$('#bucketGrid').insertAdjacentHTML('beforebegin','<div class="money-flow" aria-hidden="true"><div><i>₹</i><span>Personal surplus</span></div><b>➜</b><div><i>🏭</i><span>Growth engine</span></div><b>➜</b><div><i>🛡️</i><span>Predictable bucket</span></div></div>');
const bucketIcons={business:'🏭',market:'📈',guaranteed:'🛡️'};
$$('[data-bucket]').forEach(card=>card.querySelector('i').textContent=bucketIcons[card.dataset.bucket]);

function renderOptions(){
 $('#optionCards').innerHTML=PLAN_DATA.options.map(o=>`<button class="option-card ${o.id===selected?'active':''}" data-option="${o.id}"><small>${o.label}</small><h3>${o.title}</h3><div class="bsa">${o.id==='dual'?'2 × ₹3L':money(o.bsa)}</div><dl><div><dt>Annual commitment</dt><dd>${money(o.annual)}</dd></div><div><dt>Regular income</dt><dd>${money(o.regular)} × 10</dd></div><div><dt>Booster</dt><dd>${money(o.booster)}</dd></div><div><dt>Maturity</dt><dd>${money(o.maturity)}</dd></div><div><dt>Total benefits</dt><dd>${money(o.total)}</dd></div></dl>${o.flex?'<div class="flex-note">Maximum flexibility · independent policy structure</div>':''}</button>`).join('');
 $$('#optionCards [data-option]').forEach(b=>b.onclick=()=>selectOption(b.dataset.option));
 const o=current();
 const paymentModes=o.id==='dual'?'Two policies using Starter payment modes':`Annual ${money(o.annual)} · Half-yearly ${money(o.halfYearly)} · Quarterly ${money(o.quarterly)} · Monthly ${money(o.monthly)}`;
 $('#optionDetail').innerHTML=`<div class="wide"><span>Premium modes</span><b>${paymentModes}</b></div><div><span>Total premiums paid</span><b>${money(o.totalPremium)}</b></div><div><span>Guaranteed Additions</span><b>${money(o.ga)}</b></div><div><span>Regular Income total</span><b>${money(o.regularTotal)}</b></div><div><span>Total Survival Benefits</span><b>${money(o.survival)}</b></div><div><span>Life cover range</span><b>${o.cover}</b></div><div><span>Policy term / PPT</span><b>25 years / 15 years</b></div>${o.flex?'<p>Two independent policies provide policy-level structural flexibility. Any future decision remains subject to the conditions applicable to each LIC policy.</p>':''}`;
}
function eventsFor(o){return Array.from({length:25},(_,i)=>{const year=i+1;return{year,premium:year<=15?o.annual:0,regular:year>=15&&year<=24?o.regular:0,booster:year===20?o.booster:0,maturity:year===25?o.maturity:0}})}
function renderChart(){
 const o=current(),events=eventsFor(o),scale=chartView==='monthly'?1/12:1;
 const values=events.map(e=>(e.regular+e.booster+e.maturity-e.premium)*scale),max=Math.max(...events.map(e=>Math.max(e.premium,e.regular+e.booster+e.maturity)*scale));
 let cumulative=0;const cumulatives=values.map(v=>cumulative+=v),minCum=Math.min(...cumulatives),maxCum=Math.max(...cumulatives),range=maxCum-minCum||1;
 $('#timelineTitle').textContent=o.title;
 $('#cashflowChart').innerHTML='<div class="axis"></div>'+events.map((e,i)=>{const inflow=(e.regular+e.booster+e.maturity)*scale,out=e.premium*scale;const regShare=inflow?e.regular/(e.regular+e.booster+e.maturity)*100:0;const boosterShare=inflow?(e.regular+e.booster)/(e.regular+e.booster+e.maturity)*100:0;const cum=((cumulatives[i]-minCum)/range*76+10);return `<div class="year-col" data-year="${e.year}">${out?`<i class="bar out" style="--h:${out/max*43}%"></i>`:''}${inflow?`<i class="bar in" style="--h:${inflow/max*43}%;--regular-share:${regShare}%;--booster-share:${boosterShare}%"></i>`:''}<i class="cum-point" style="--cum:${cum}%;--angle:0deg"></i><span class="year-label">${e.year}</span></div>`}).join('');
 const pts=$$('.cum-point');pts.slice(0,-1).forEach((p,i)=>{const y1=parseFloat(p.style.getPropertyValue('--cum')),y2=parseFloat(pts[i+1].style.getPropertyValue('--cum'));p.style.setProperty('--angle',`${Math.atan2(y2-y1,100/25)*-12}deg`)});
 $$('.year-col').forEach(col=>col.onclick=()=>showYear(events[+col.dataset.year-1],scale));
 showYear(events.find(e=>e.year===20),scale);
}
function showYear(e,scale){const parts=[];if(e.premium)parts.push(`Premium out: ${money(e.premium*scale)}`);if(e.regular)parts.push(`Regular Income: ${money(e.regular*scale)}`);if(e.booster)parts.push(`Booster Income: ${money(e.booster*scale)}`);if(e.maturity)parts.push(`Maturity: ${money(e.maturity*scale)}`);const inflow=(e.regular+e.booster+e.maturity)*scale;$('#chartDetail').innerHTML=`<b>Year ${e.year}</b> · ${parts.join(' · ')||'No scheduled cash flow'}${inflow?` · <strong>Total inflow: ${money(inflow)}</strong>`:''}`}
function renderTable(){const rows=[['Annual commitment',o=>money(o.annual)],['Monthly equivalent',o=>money(o.monthly)],['Premium paying period',()=> '15 years'],['Total premiums paid',o=>money(o.totalPremium)],['Regular annual income',o=>money(o.regular)],['Booster',o=>money(o.booster)],['Maturity',o=>money(o.maturity)],['Total guaranteed benefits',o=>money(o.total)],['Policy structure',o=>o.structure]];$('#comparisonTable').innerHTML=`<thead><tr><th>Configuration</th>${PLAN_DATA.options.map(o=>`<th>${o.label}<br>${o.id==='dual'?'2 × ₹3L':money(o.bsa)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr><td>${r[0]}</td>${PLAN_DATA.options.map(o=>`<td>${r[1](o)}</td>`).join('')}</tr>`).join('')}</tbody>`}
function renderSummary(){const o=current();$('#summaryName').textContent=$('#customerName').value.trim()||'Customer';$('#summaryOption').textContent=o.id==='dual'?'2 × ₹3,00,000 Bima Platinum':`${money(o.bsa)} Bima Platinum`;const items=[['Annual commitment',money(o.annual)],['Premium commitment','15 years'],['Future regular income',`${money(o.regular)} annually × 10`],['Booster',money(o.booster)],['Maturity',money(o.maturity)],['Total stated benefits',money(o.total)]];$('#summaryGrid').innerHTML=items.map(x=>`<div><span>${x[0]}</span><b>${x[1]}</b></div>`).join('')}
function selectOption(id){selected=id;renderOptions();renderChart();renderSummary();$$('[data-option]').forEach(b=>b.classList.toggle('active',b.dataset.option===id))}
function nearestOption(amount){return PLAN_DATA.options.reduce((a,b)=>Math.abs(b.annual-amount)<Math.abs(a.annual-amount)?b:a)}
function setAfford(amount){const o=nearestOption(amount);$('#affordResult').textContent=`Nearest structure: ${o.label} — ${money(o.annual)} per year.`;selectOption(o.id)}
const allocations=[{key:'business',label:'Business reinvestment',color:'#51a8e8',value:25},{key:'market',label:'Market / growth',color:'#a88af4',value:25},{key:'guaranteed',label:'Guaranteed bucket',color:'#55d19d',value:25},{key:'liquid',label:'Emergency / liquid',color:'#e8bd6d',value:25}];
function renderAllocation(){const total=allocations.reduce((s,a)=>s+a.value,0)||1;$('#allocationBar').innerHTML=allocations.map(a=>`<i style="width:${a.value/total*100}%;background:${a.color}" title="${a.label}: ${Math.round(a.value/total*100)}%"></i>`).join('');$('#allocationControls').className='allocation-controls';$('#allocationControls').innerHTML=allocations.map(a=>`<label>${a.label} · <b>${Math.round(a.value/total*100)}%</b><input type="range" min="0" max="100" value="${a.value}" data-allocation="${a.key}" style="accent-color:${a.color}"></label>`).join('');$$('[data-allocation]').forEach(input=>input.oninput=()=>{allocations.find(a=>a.key===input.dataset.allocation).value=+input.value;renderAllocation()})}
function setScenario(type){const states={normal:[78,72,'Normal','Normal'],weak:[30,65,'Revenue down','Normal'],market:[70,24,'Normal','Correction']}[type];$('#businessMeter').style.width=states[0]+'%';$('#marketMeter').style.width=states[1]+'%';$('#businessState').textContent=states[2];$('#marketState').textContent=states[3];$$('[data-scenario]').forEach(b=>b.classList.toggle('active',b.dataset.scenario===type))}

renderOptions();renderChart();renderTable();renderAllocation();renderSummary();
$$('.bucket-grid article').forEach(a=>a.onclick=()=>{$$('.bucket-grid article').forEach(x=>x.classList.remove('active'));a.classList.add('active')});
$$('[data-view]').forEach(b=>b.onclick=()=>{chartView=b.dataset.view;$$('[data-view]').forEach(x=>x.classList.toggle('active',x===b));renderChart()});
$$('[data-amount]').forEach(b=>b.onclick=()=>{const custom=b.dataset.amount==='custom';$('#customAfford').hidden=!custom;$$('[data-amount]').forEach(x=>x.classList.toggle('active',x===b));if(!custom)setAfford(+b.dataset.amount)});
$('#customAfford').oninput=e=>e.target.value&&setAfford(+e.target.value);
$$('[data-scenario]').forEach(b=>b.onclick=()=>setScenario(b.dataset.scenario));
['customerName','customerAge','customerOccupation'].forEach(id=>$('#'+id).addEventListener('input',renderSummary));
$('#investibleAmount').oninput=e=>e.target.value&&setAfford($('#investiblePeriod').value==='monthly'?+e.target.value*12:+e.target.value);
$('#investiblePeriod').onchange=()=>$('#investibleAmount').dispatchEvent(new Event('input'));
setAfford(65000);setScenario('normal');
if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
 document.body.classList.add('reveal-ready');
 const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('revealed');revealObserver.unobserve(entry.target)}}),{threshold:.1,rootMargin:'0px 0px -8%'});
 $$('main>section').forEach(section=>revealObserver.observe(section));
}
