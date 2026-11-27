/* Optional booster deferral explanation. Device speech is separate from the
 * five supplied journey recordings. All projected values are assumptions. */
(function(global) {
  'use strict';
  const model=global.BimaPlatinumBenefits;
  global.createBimaBoosterStory=function(root,button,status) {
    let policy,projection,generation=0,timer=null,deadline=0,remaining=0,index=0,running=false,paused=false,usingVoice=false,ownsVoice=false,pendingPhaseEnd=false;
    const phases=['due','grow','finish'],durations=[2800,4600,5800];
    const money=model.money;
    function updateButton() {
      button.textContent=running?(paused?'Resume explanation':'Pause explanation'):'Replay explanation';
      button.setAttribute('aria-pressed',String(running&&!paused));
      root.dataset.paused=String(paused);
    }
    function stop() {
      generation++;clearTimeout(timer);timer=null;
      if(ownsVoice)global.speechSynthesis?.cancel();
      ownsVoice=false;running=false;paused=false;updateButton();
    }
    function render() {
      const r=policy,p=projection,rateLabel=(p.annualRate*100).toFixed(2);
      const formatDate=value=>new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(value+'T00:00:00Z'));
      const dueFrom=formatDate(model.accumulationReference.dueFrom),dueThrough=formatDate(model.accumulationReference.dueThrough);
      const points=p.points.map(point=>{
        const x=35+530*point.month/p.completedMonths;
        const y=175-125*(point.value-p.principal)/(p.value-p.principal);
        return [x,y];
      });
      const path=points.map(([x,y],i)=>`${i?'L':'M'}${x.toFixed(2)} ${y.toFixed(2)}`).join(' ');
      root.innerHTML=`<div class="booster-hero"><div><span class="booster-seal">70% Booster</span><p>Year ${r.boosterYear} के end पर</p><strong>${money(r.booster)}</strong><p>ले सकते हैं।<br>या compound होने दें।</p></div><img src="assets/advisor-anniversary.webp" alt="" width="760" height="759"></div>
        <div class="booster-options"><article><h3>Receive it</h3><strong>${money(r.booster)}</strong><p>At year ${r.boosterYear}</p></article><article class="booster-grow-option"><h3>Let it grow</h3><strong id="boosterProjectedValue">${money(p.value)}</strong><p>Illustrative · at year ${r.term}</p></article></div>
        <figure class="booster-chart"><figcaption>Booster को grow होने दें</figcaption><svg viewBox="0 0 600 245" role="img" aria-labelledby="boosterPlotTitle boosterPlotDesc"><title id="boosterPlotTitle">Illustrative booster accumulation</title><desc id="boosterPlotDesc">${money(r.booster)} due at year ${r.boosterYear}, illustrated at ${rateLabel}% annual effective interest for ${r.term-r.boosterYear} years, becomes ${money(p.value)} at year ${r.term}. The future applicable rate is unknown; this is not a guaranteed payout. Regular income and base maturity benefits are separate.</desc><defs><linearGradient id="boosterWash" x2="0" y2="1"><stop stop-color="#e5bd58" stop-opacity=".4"/><stop offset="1" stop-color="#e5bd58" stop-opacity="0"/></linearGradient><clipPath id="boosterClip"><rect class="booster-reveal" x="0" y="0" width="600" height="245"/></clipPath></defs>
        <path d="M35 195H565M35 175H565" fill="none" stroke="#59728a" stroke-dasharray="4 5"/>
        <g clip-path="url(#boosterClip)"><path d="${path}V195H35Z" fill="url(#boosterWash)"/><path d="${path}" stroke="#f5d382" stroke-width="5" fill="none" stroke-linecap="round"/>${points.filter((_,i)=>i===0||i===points.length-1||i%Math.max(1,Math.floor(points.length/4))===0).map(([x,y])=>`<circle cx="${x}" cy="${y}" r="6" fill="#ffe5a3" stroke="#ba8e31" stroke-width="2"/>`).join('')}</g>
        <g fill="#d4e0ea" font-family="system-ui,sans-serif" font-size="28"><text x="35" y="234">Year ${r.boosterYear}</text><text x="565" y="234" text-anchor="end">Year ${r.term}</text></g></svg><p>Illustration at today’s reference rate</p></figure>
        <p class="booster-explanation">Rate <strong>5-year government bond yield</strong> से linked है। Booster due होने पर applicable rate तय होगी।</p>
        <p class="booster-rate-note"><strong>Current reference: ${rateLabel}% p.a.</strong><br>Benefits due ${dueFrom}–${dueThrough}.<br>ऊपर का amount एक example है; future rate अभी तय नहीं है।</p>
        <details class="booster-conditions"><summary>How the option works</summary><p>शुरुआत में decide करना ज़रूरी नहीं। Booster due होने से कम से कम 3 महीने पहले written request दें; कोई policy loan outstanding नहीं होना चाहिए।</p><p>Compounding booster की due date से शुरू होती है। Applicable rate 5-year semi-annual G-Sec yield minus 1 percentage point है और उस deferred benefit के लिए fixed रहती है। Calculation completed months के लिए होती है।</p><p>पूरा accumulated booster maturity से पहले भी withdraw कर सकते हैं। Regular income और base maturity अलग हैं; इस example में सिर्फ booster defer किया गया है। Policy loan लेने से deferral प्रभावित हो सकती है।</p><a href="https://licindia.in/documents/20121/1860176/Final_Policy%2BDocument%2BLIC%27s%2BBima%2BPlatinum.pdf/9235a4a2-d3c7-0c4c-72e2-6c6f05c22603?t=1788330356571">LIC policy · Part D, clause 10</a></details>`;
    }
    function script() {
      const rateLabel=(projection.annualRate*100).toFixed(2);
      return [
        `आपके selected plan में, policy year ${policy.boosterYear} के end पर ${money(policy.booster)} का booster मिलता है।`,
        'आप इसे ले सकते हैं। या LIC के पास छोड़ सकते हैं, जहाँ ये compound interest के साथ grow करेगा।',
        `इसकी rate five-year government bond yield से linked है। आज की ${rateLabel} percent reference rate को example मानें, तो year ${policy.term} तक booster लगभग ${money(projection.value)} हो सकता है। Future booster पर उस समय की applicable rate लगेगी। ये guaranteed future amount नहीं है।`
      ];
    }
    function schedule(delay,token) {
      remaining=delay;deadline=Date.now()+delay;
      timer=setTimeout(()=>{timer=null;if(token===generation&&!paused)next(token);},delay);
    }
    function next(token) {
      if(token!==generation)return;
      index++;
      if(index===phases.length){running=false;ownsVoice=false;root.dataset.complete='true';updateButton();return;}
      playPhase(token);
    }
    function playPhase(token) {
      if(token!==generation)return;
      root.dataset.phase=phases[index];
      if(usingVoice) {
        const utterance=new global.SpeechSynthesisUtterance(script()[index]);
        utterance.lang='hi-IN';utterance.rate=1.05;
        const voices=global.speechSynthesis.getVoices();
        utterance.voice=voices.find(v=>v.lang==='hi-IN')||voices.find(v=>v.lang.startsWith('hi'))||voices.find(v=>v.lang==='en-IN')||null;
        utterance.onend=()=>{if(token!==generation)return;if(paused)pendingPhaseEnd=true;else next(token);};
        utterance.onerror=()=>{
          if(token!==generation)return;
          usingVoice=false;ownsVoice=false;status.textContent='Animation · device voice unavailable';
          if(!paused)schedule(durations[index],token);
        };
        ownsVoice=true;
        try {global.speechSynthesis.speak(utterance);}catch {utterance.onerror();}
      } else schedule(durations[index],token);
    }
    function replay() {
      stop();index=0;pendingPhaseEnd=false;running=true;root.dataset.complete='false';root.dataset.phase='due';
      // Force animation restart without replacing controls or selected policy.
      void root.offsetWidth;
      usingVoice=Boolean(global.speechSynthesis&&global.SpeechSynthesisUtterance&&global.speechSynthesis.getVoices().some(v=>v.lang.startsWith('hi')));
      status.textContent=usingVoice?'Device voice · Hindi + English':'Animation · device voice unavailable';
      updateButton();playPhase(generation);
    }
    function toggle() {
      if(!running){replay();return;}
      paused=!paused;
      if(usingVoice){if(paused)global.speechSynthesis.pause();else {global.speechSynthesis.resume();if(pendingPhaseEnd){pendingPhaseEnd=false;next(generation);}}}
      else if(paused){remaining=Math.max(0,deadline-Date.now());clearTimeout(timer);timer=null;}
      else schedule(remaining||durations[index],generation);
      updateButton();
    }
    button.addEventListener('click',toggle);
    return {start(result){policy=result;projection=model.boosterProjection(result,model.accumulationReference.annualRate);render();replay();},stop,replay,pause(){if(running&&!paused)toggle();}};
  };
})(globalThis);
