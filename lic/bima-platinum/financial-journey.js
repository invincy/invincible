/* A progressively revealed symbolic timeline, using fixed LIC brochure samples, base GA,
 * yearly premiums and no income deferral. The path is not an account value. */
(function () {
  'use strict';
  const money = n => '₹' + Math.round(n).toLocaleString('en-IN');
  const text = (x,y,value,size=18) => `<text x="${x}" y="${y}" text-anchor="middle" font-size="${size}">${value}</text>`;
  const stack = (x,y,n=3) => `<g transform="translate(${x} ${y})">${Array.from({length:n},(_,i)=>`<path d="M-14 ${-i*7}v5a14 5 0 0 0 28 0v-5" fill="url(#journeyCoin)" stroke="#f6c348"/><ellipse cy="${-i*7}" rx="14" ry="5" fill="#ffe698" stroke="#e8af30"/>`).join('')}</g>`;
  const arrow = (x,fromY,toY,kind) => {
    const head=toY>fromY?-7:7;
    return `<path class="journey-cash-arrow ${kind}" data-from-y="${fromY}" data-to-y="${toY}" d="M${x} ${fromY}V${toY}m-6 ${head} 6 ${-head} 6 ${head}" fill="none" stroke="${kind==='premium-in'?'#55c8f0':'#ffe39a'}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
  };
  const bag = `<g transform="translate(548 192)"><path d="M-9-29l-7-13 16 4 16-4-7 13q27 26 21 45-30 15-60 0-6-19 21-45" fill="url(#journeyCoin)" stroke="#ffdc75"/><path d="M-11-28h22" stroke="#8b5816" stroke-width="4"/><text y="10" text-anchor="middle" fill="#70450e" font-size="29">₹</text></g>`;
  window.renderBimaFinancialJourney = function(root,data) {
    if (!root || !data) return;
    const {step,ppt,premium,age,boosterYear,baseSA=300000,term=30}=data;
    if (![step,ppt,premium,age,boosterYear,baseSA,term].every(Number.isFinite) || premium<=0) { root.textContent='Premium illustration unavailable'; return; }
    const ga=premium*.07*ppt*(ppt+1)/2;
    const stage=Math.max(0,Math.min(4,Math.trunc(step)));
    const phase=[0,0,1,2,3][stage];
    const endPoints=[[185,142],[370,142],[425,93],[570,45]];
    const revealWidths=[205,205,392,490,600];
    const [endX]=endPoints[phase];
    const areaTop='M24 205 '+endPoints.slice(0,phase+1).map(([x,y])=>`L${x} ${y}`).join(' ');
    // Narrative milestones are evenly spaced for legibility, with exact years.
    const bars=Array.from({length:ppt},(_,i)=>{
      const h=18+58*(i+1)/ppt, x=25+i*165/ppt;
      return `<rect x="${x}" y="${218-h}" width="${Math.max(4,150/ppt)}" height="${h}" rx="2" fill="url(#journeyBlue)"/>`;
    }).join('');
    const paths=['M24 205L185 142','M185 142H370','M370 142L425 93','M425 93L570 45'];
    const icons=[stack(50,212,1)+stack(98,212,2),stack(130,212,3)+stack(162,212,4),stack(206,212,2)+stack(246,212,2)+[286,327,368].map(x=>stack(x,212,2)+arrow(x,187,101,'income-out')).join(''),stack(425,212,7),stack(504,212,9)+bag];
    const labels=['Premium','Additions','Income','Booster','Maturity'];
    const amounts=[money(premium)+'/yr',money(ga),money(baseSA*.1)+'/yr',money(baseSA*.7),money(baseSA+ga)];
    const descriptions=[`Pay ${money(premium)} yearly for ${ppt} years.`, `Base Guaranteed Additions ${money(ga)}.`, `Income ${money(baseSA*.1)} at each year-end from year ${ppt} through ${term-1}.`, `Booster ${money(baseSA*.7)} at year ${boosterYear}.`, `Maturity ${money(baseSA+ga)} at year ${term}.`];
    root.dataset.stage=String(stage);
    root.dataset.age=String(age);
    root.dataset.ppt=String(ppt);
    root.innerHTML=`<svg class="financial-journey-svg" viewBox="0 -14 600 259" role="img" aria-labelledby="journeyPlotTitle journeyPlotDesc">
        <title id="journeyPlotTitle">Your five-stage benefit journey</title>
        <desc id="journeyPlotDesc">${descriptions.slice(0,stage+1).join(' ')} Premium arrows point down into the plan; income arrows point up toward the policyholder. Additions accrue within the premium-paying period. In-force yearly offline sample; base additions only, taxes, incentives and deferral excluded. Symbolic path, not an account balance or investment return.</desc>
        <defs><clipPath id="journeyReveal"><rect class="journey-reveal" x="0" y="-14" height="259" width="${revealWidths[stage]}" style="--reveal-from:${stage?revealWidths[stage-1]:0}px;--reveal-to:${revealWidths[stage]}px"/></clipPath><linearGradient id="journeyBlue" x2="0" y2="1"><stop stop-color="#24b8ef"/><stop offset="1" stop-color="#07517e"/></linearGradient><linearGradient id="journeyCoin"><stop stop-color="#ffe596"/><stop offset=".5" stop-color="#edb22b"/><stop offset="1" stop-color="#bc7417"/></linearGradient><linearGradient id="journeyWash" x2="0" y2="1"><stop stop-color="#0c93ca" stop-opacity=".65"/><stop offset="1" stop-color="#0b5b94" stop-opacity=".08"/></linearGradient></defs>
        <g class="journey-revealed-plot" clip-path="url(#journeyReveal)">
        <path class="journey-area" d="${areaTop}L${endX} 220H24Z" fill="url(#journeyWash)"/>
        <path class="journey-axis" d="M24 220H${endX}" stroke="#477391"/>
        ${bars}
        ${[arrow(55,134,184,'premium-in'),arrow(100,125,166,'premium-in'),arrow(145,116,148,'premium-in')].join('')}
        ${stage>=1?`<g class="journey-ga-accrual" aria-hidden="true">${Array.from({length:ppt},(_,i)=>{const h=18+58*(i+1)/ppt,x=25+i*165/ppt;return `<rect x="${x}" y="${218-h}" width="${Math.max(4,150/ppt)}" height="4" rx="1" fill="#f4d477"/>`;}).join('')}</g>`:''}
        ${paths.slice(0,phase+1).map((d,i)=>`<path class="journey-path ${i===phase?'is-current':''}" d="${d}" fill="none" stroke="#f4d477" stroke-width="5" stroke-linecap="round"/>`).join('')}
        ${icons.slice(0,stage+1).map((icon,i)=>`<g class="journey-money ${i===stage?'is-current':''}">${icon}</g>`).join('')}
        <g fill="#f0e7d1" font-family="system-ui,sans-serif" font-weight="600">
          ${text(100,88,'Premiums')}${text(100,109,`Years 1–${ppt}`,16)}
          ${stage>=2?text(300,44,'Annual income')+text(300,65,`From year ${ppt} end`,16):''}
          ${stage>=3?text(431,10,'70% booster')+text(431,31,`Year ${boosterYear}`,16):''}
          ${stage>=4?text(548,8,'Maturity',17)+text(548,28,`Year ${term}`,16):''}
        </g>
        ${[[100,175],[300,142],[425,93],[570,45]].slice(0,phase+1).map(([x,y])=>`<circle cx="${x}" cy="${y}" r="6" fill="#ffe99c" stroke="#dbac3f" stroke-width="2"/>`).join('')}
        </g>
      </svg>
      <div class="benefit-journey-legend">${labels.slice(0,stage+1).map((label,i)=>`<div class="${i===stage?'is-current':''}"><b>${label}</b><strong>${amounts[i]}</strong></div>`).join('')}</div>
      `;
  };
})();
