/* Page 6 only: a single, zoomable financial-journey SVG.
 * Figures are sourced from the existing presentation sample illustration.
 * Gold illustrations are symbolic, never an account-value chart. */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const PPT_OPTIONS = [7, 10, 12, 15, 18];
  const money = n => '₹' + Math.round(n).toLocaleString('en-IN');
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const coin = (x,y,r=13) => `<g transform="translate(${x} ${y})"><ellipse rx="${r}" ry="${r*.75}" fill="#d49a35" stroke="#ffe4a0" stroke-width="2"/><ellipse rx="${r*.73}" ry="${r*.54}" fill="#f8d576"/><text text-anchor="middle" y="5" font-size="${r}" font-weight="700" fill="#81531a">₹</text></g>`;
  const stack = (x,y,n=3) => Array.from({length:n},(_,i)=>coin(x,y-i*9,13)).join('');
  const bundle = (x,y) => `<g transform="translate(${x} ${y}) rotate(-9)"><rect x="-26" y="-12" width="52" height="24" rx="4" fill="#65957e" stroke="#d2e8c2"/><path d="M-5 -12v24M5 -12v24" stroke="#e4d6a1" stroke-width="5"/><text x="-20" y="5" font-size="12" fill="#f4efc6">₹</text></g>`;
  const pile = (x,y,large=false) => `<g>${stack(x-28,y,large?5:3)}${stack(x,y+3,large?7:4)}${stack(x+27,y,large?4:2)}${bundle(x+52,y-10)}${large?bundle(x-54,y-28):''}</g>`;
  const bag = (x,y) => `<g transform="translate(${x} ${y})"><path d="M-13 -44L-21 -58Q0 -48 21 -58L13 -44Q48 -19 39 22Q30 46 0 46Q-30 46 -39 22Q-48 -19 -13 -44Z" fill="#d3a044" stroke="#ffe4a0" stroke-width="3"/><path d="M-15 -43H15" stroke="#7e531f" stroke-width="7"/><text text-anchor="middle" y="19" font-size="38" fill="#fff0bb" font-weight="700">₹</text></g>`;
  const txt = (x,y,value,size=18,color='#e8d9b4',anchor='middle') => `<text x="${x}" y="${y}" fill="${color}" font-size="${size}" font-family="system-ui,sans-serif" font-weight="600" text-anchor="${anchor}">${esc(value)}</text>`;
  const line = (x1,y1,x2,y2,color='#547a9a') => `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${color}" stroke-width="2" fill="none"/>`;
  const targets = [[0,0,580,270],[0,0,610,270],[0,0,760,270],[0,0,910,270],[0,0,1050,270]];
  let frame = 0, current = targets[0], svg = null;
  function view(target) {
    if (!svg) return;
    cancelAnimationFrame(frame);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      current = target.slice(); svg.setAttribute('viewBox', current.join(' ')); return;
    }
    const from = current.slice(), started = performance.now();
    const tick = now => {
      const t = Math.min(1,(now-started)/650), ease = 1-Math.pow(1-t,3);
      current = from.map((v,i)=>v+(target[i]-v)*ease);
      svg.setAttribute('viewBox',current.join(' '));
      if(t<1) frame=requestAnimationFrame(tick);
    };
    frame=requestAnimationFrame(tick);
  }
  function draw(root, data) {
    const {step,ppt,premium,age,boosterYear,baseSA=300000,term=30} = data;
    const ga = premium*.07*ppt*(ppt+1)/2;
    const annualIncome=baseSA*.10, booster=baseSA*.70;
    const xPpt=65+ppt/30*900, xBoost=65+boosterYear/30*900;
    const bars=Array.from({length:ppt},(_,i)=>{
      const x=65+(i+1)/30*900, h=18+55*(i+1)/ppt;
      return `<rect x="${x-5}" y="${207-h}" width="9" height="${h}" rx="2" fill="#44a9da" opacity=".78"/>`;
    }).join('');
    const curve=`<path d="M65 203 Q${(65+xPpt)/2} 185 ${xPpt} 115" fill="none" stroke="#f2cc72" stroke-width="4" stroke-linecap="round" filter="url(#goldGlow)"/>`;
    const ticks=[0,ppt,boosterYear,term].filter((n,i,a)=>a.indexOf(n)===i).map(n=>{
      const x=65+n/30*900;
      return line(x,215,x,225)+txt(x,243,`Y${n}`,13);
    }).join('');
    const pptOptions=PPT_OPTIONS.map((n,i)=>txt(85+i*63,27,`${n}Y`,16,n===ppt?'#ffe49b':'#6586a1')).join('');
    const incomeMarks=Array.from({length:Math.max(0,term-ppt)},(_,i)=>{
      const x=65+(ppt+i)/30*900;
      return `<path d="M${x} 163v16l-5 -6m5 6l5 -6" fill="none" stroke="#e6c37a" stroke-width="2" opacity=".85"/>`;
    }).join('');
    root.innerHTML=`<svg class="financial-journey-svg" viewBox="0 0 580 270" role="img" aria-label="Policy journey: premium payments, guaranteed additions during PPT, annual income, booster and maturity" xmlns="${NS}">
      <defs><filter id="goldGlow" x="-40%" y="-60%" width="180%" height="220%"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
      <path d="M65 215H965" stroke="#4e7898" stroke-width="3"/>
      ${bars}${curve}${ticks}
      ${txt(70,55,'PREMIUM PAYING PERIOD',15,'#ffe3a2','start')}
      ${pptOptions}
      ${txt(70,82,`Selected ${ppt} years · ${money(premium)}/year`,16,'#e7f3ff','start')}
      ${txt(xPpt,102,'GA during PPT · 7% base',14,'#f9d27a')}
      ${stack(xPpt-28,110,3)}
      ${step>=2?incomeMarks:""}
      ${step>=2?txt(xPpt+145,75,`${money(annualIncome)} / year`,19,'#ffe2a0')}
      ${txt(xPpt+145,96,`From end of year ${ppt}`,13,'#b7d2e8'):''}
      ${step>=3?pile(xBoost,134):''}
      ${step>=3?txt(xBoost,65,'70% BOOSTER',17,'#ffe0a0'):''}
      ${step>=3?txt(xBoost,86,`${money(booster)} · Y${boosterYear}`,16,'#fff1d0'):''}
      ${step>=4?pile(910,158,true)+bag(951,122):''}
      ${step>=4?txt(895,40,'MATURITY · Y'+term,18,'#ffe0a0'):''}
      ${step>=4?txt(895,62,money(baseSA+ga),20,'#fff1c4'):''}
      ${step>=4?txt(895,80,'Basic SA + base GA',13,'#b9d1e6'):''}
      ${txt(520,261,'Illustrative timeline · not an investment account balance',12,'#8eacc4')}
    </svg>`;
    svg=root.querySelector('svg');
    svg.setAttribute('viewBox',current.join(' '));
  }
  let previousKey='';
  window.renderBimaFinancialJourney=function(root,data) {
    if(!root || !data || !Number.isFinite(data.premium) || data.premium<=0) {
      if(root)root.textContent='Verified premium illustration unavailable';
      return;
    }
    const key=[data.step,data.ppt,data.premium,data.age,data.boosterYear].join(':');
    if(key!==previousKey || !svg || !root.contains(svg)) {
      draw(root,data); previousKey=key;
    }
    view(targets[Math.max(0,Math.min(4,data.step))]);
  };
})();
