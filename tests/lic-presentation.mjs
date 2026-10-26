import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../lic/bima-platinum/presentation.js', import.meta.url), 'utf8');
function setup(play) {
  const elements = new Map();
  function el(id) {
    if (!elements.has(id)) elements.set(id, {
      id, textContent:'', inert:false, hidden:false, disabled:false, events:{}, attrs:{}, children:[], dataset:{},
      style: { values:{}, setProperty(k,v) { this.values[k]=v; } },
      classList: { values:new Set(), add(...v) { v.forEach(x=>this.values.add(x)); }, remove(...v) { v.forEach(x=>this.values.delete(x)); }, contains(v) { return this.values.has(v); }, toggle(v,on) { if(on ?? !this.values.has(v)) this.values.add(v); else this.values.delete(v); } },
      appendChild(child) { if(child.parentElement) child.parentElement.children=child.parentElement.children.filter(x=>x!==child); this.children.push(child); child.parentElement=this; },
      addEventListener(k,fn) { this.events[k]=fn; }, setAttribute(k,v) { this.attrs[k]=v; }, getAttribute(k) { return this.attrs[k] ?? null; },
      focus() {}, querySelectorAll() { return []; }
    });
    return elements.get(id);
  }
  const ageButtons = [15,25,35,45].map(age => { const b=el('sampleAge'+age); b.dataset={age:String(age)}; return b; });
  const pptButtons = [7,10,12,15,18].map(ppt => { const b=el('samplePpt'+ppt); b.dataset={ppt:String(ppt)}; return b; });
  const journeyButtons = [0,1,2,3,4].map(index => { const b=el('journey'+index); b.dataset={journeyStep:String(index)}; return b; });
  const audios=[]; const windowEvents={};
  const doc={events:{}, hidden:false, getElementById:el, querySelectorAll:selector=>selector==='#incomeAgeOptions button'?ageButtons:selector==='#incomePptOptions button'?pptButtons:selector==='[data-journey-step]'?journeyButtons:[], querySelector:s=>s==='.layer-stage-3d'?el('firstScene'):s==='.scene-two-nav'?el('sceneNav'):s==='.scene-two-footer'?el('sceneFooter'):null,
    body:el('body'), addEventListener(k,fn) { this.events[k]=fn; }};
  class Audio {
    constructor(src) { this.src=src; this.events={}; this.currentTime=0; this.ended=false; this.paused=true; audios.push(this); }
    addEventListener(k,fn) { this.events[k]=fn; }
    async play() { if(play) await play(); this.paused=false; this.events.playing?.(); }
    pause() { this.paused=true; this.events.pause?.(); }
  }
  const context={document:doc, Audio, URLSearchParams, setTimeout, clearTimeout,
    window:{location:{search:'',hash:''},addEventListener(k,fn) { windowEvents[k]=fn; }}};
  vm.runInNewContext(source,context);
  doc.events.DOMContentLoaded();
  return {el,doc,audios,windowEvents,premium:context.getLicSamplePremium,click:id=>el(id).events.click({stopPropagation(){}})};
}
const flush=()=>new Promise(resolve=>setImmediate(resolve));
const focus=s=>s.el('storyChart').attrs['data-focus'];

test('one original chart moves through pages 1 → 2 → 3 and back without cloning',()=>{
  const s=setup(); const chart=s.el('storyChart');
  assert.equal(chart.parentElement,s.el('sceneOneChartHost'));
  assert.equal(chart.attrs['data-step'],'1');
  assert.equal(s.audios.length,0);
  s.click('ctaForwardBtn');
  assert.equal(chart.parentElement,s.el('presenterChartHost'));
  assert.equal(s.el('sceneOneChartHost').children.length,0);
  assert.equal(chart.attrs['data-step'],'2');
  assert.equal(s.el('firstScene').inert,true);
  assert.equal(s.el('stagePreviewModal').inert,false);
  s.click('sceneTwoNextBtn');
  assert.equal(chart.attrs['data-step'],'3');
  assert.equal(s.el('storyStageCounter').textContent,'3 / 10');
  assert.equal(s.el('sceneTwoNextBtn').hidden,false);
  assert.equal(s.el('presenterChartHost').children.length,1);
  s.click('previewDismissBtn');
  assert.equal(chart.attrs['data-step'],'2');
  assert.equal(s.el('sceneTwoNextBtn').hidden,false);
  s.click('previewDismissBtn');
  assert.equal(chart.parentElement,s.el('sceneOneChartHost'));
  assert.equal(s.el('presenterChartHost').children.length,0);
  assert.equal(s.el('firstScene').inert,false);
  assert.equal(s.el('stagePreviewModal').inert,true);
});

test('Page 1 narration draws business only, holds on pause, replays after completion',async()=>{
  const s=setup(); s.click('advisorAudioBtn'); await flush();
  const audio=s.audios[0];
  assert.match(audio.src,/advisor-story-1-hindi.mp3$/);
  assert.equal(focus(s),'business');
  audio.currentTime=.7; audio.events.timeupdate();
  assert.equal(s.el('storyChart').style.values['--narration-reveal'],'0.5');
  s.click('advisorAudioBtn');
  assert.equal(s.el('advisorAudioLabel').textContent,'Resume audio');
  assert.equal(focus(s),'business');
  s.click('advisorAudioBtn'); await flush();
  assert.equal(audio.currentTime,.7);
  audio.ended=true; audio.events.ended();
  assert.equal(audio.currentTime,0);
  assert.equal(focus(s),'');
  audio.ended=false; s.click('advisorAudioBtn'); await flush();
  assert.equal(focus(s),'business');
});

test('Page 2 switches from business to market using media time and handles seeking',async()=>{
  const s=setup(); s.click('ctaForwardBtn'); s.click('sceneTwoDialogueBtn'); await flush();
  const audio=s.audios[0];
  assert.match(audio.src,/advisor-story-2-hindi.mp3$/);
  assert.equal(focus(s),'business');
  audio.currentTime=3.19; audio.events.timeupdate(); assert.equal(focus(s),'business');
  audio.currentTime=3.2; audio.events.timeupdate(); assert.equal(focus(s),'market');
  audio.currentTime=4.6; audio.events.timeupdate();
  assert.ok(Number(s.el('storyChart').style.values['--narration-reveal'])<.001);
  s.click('sceneTwoDialogueBtn'); assert.equal(focus(s),'market');
  s.click('sceneTwoDialogueBtn'); await flush(); assert.equal(focus(s),'market');
  audio.currentTime=1; audio.events.seeked(); assert.equal(focus(s),'business');
});

test('Page 3 introduces stability, keeping the shared chart in its third state',async()=>{
  const s=setup(); s.click('ctaForwardBtn'); s.click('sceneTwoNextBtn');
  s.click('sceneTwoDialogueBtn'); await flush();
  assert.match(s.audios[0].src,/advisor-story-3-hindi.mp3$/);
  assert.equal(focus(s),'platinum');
  assert.equal(s.el('storyChart').attrs['data-step'],'3');
  s.click('previewDismissBtn');
  assert.equal(s.audios[0].paused,true); assert.equal(s.audios[0].currentTime,0);
  assert.equal(focus(s),'');
});

test('navigation cancels pending play and ignores stale events on a different page',async()=>{
  let resolve; const s=setup(()=>new Promise(done=>{resolve=done;}));
  s.click('ctaForwardBtn'); s.click('sceneTwoDialogueBtn');
  const old=s.audios[0]; s.click('sceneTwoNextBtn');
  resolve(); await flush();
  old.events.timeupdate(); old.events.ended();
  assert.equal(old.paused,true); assert.equal(old.currentTime,0);
  assert.equal(s.el('storyChart').attrs['data-step'],'3');
  assert.equal(focus(s),'');
  assert.equal(s.el('sceneTwoAudioLabel').textContent,'Advisor की बात सुनें');
});

test('a rejected old load cannot put an error on the next page',async()=>{
  let reject; const s=setup(()=>new Promise((_,fail)=>{reject=fail;}));
  s.click('advisorAudioBtn'); s.click('ctaForwardBtn');
  reject(new Error('missing')); await flush();
  assert.equal(s.el('audioStatus').textContent,'');
  assert.equal(s.el('sceneTwoAudioStatus').textContent,'');
  assert.equal(focus(s),'');
});

test('missing new recordings show a truthful status and never play the old script',async()=>{
  const s=setup(()=>Promise.reject(new Error('missing')));
  s.click('advisorAudioBtn'); await flush();
  assert.match(s.el('audioStatus').textContent,/नई recording/);
  assert.equal(s.el('advisorAudioBtn').attrs['aria-busy'],'false');
  assert.equal(focus(s),'');
  assert.doesNotMatch(s.audios[0].src,/advisor-scene-/);
});

test('tab hiding, pagehide and Escape stop narration and clear its highlight',async()=>{
  for(const action of ['hidden','pagehide','escape']) {
    const s=setup(); s.click('ctaForwardBtn'); s.click('sceneTwoNextBtn'); s.click('sceneTwoDialogueBtn'); await flush();
    s.audios[0].currentTime=4;
    if(action==='hidden') {s.doc.hidden=true;s.doc.events.visibilitychange();}
    if(action==='pagehide') s.windowEvents.pagehide();
    if(action==='escape') s.doc.events.keydown({key:'Escape'});
    assert.equal(s.audios[0].paused,true); assert.equal(s.audios[0].currentTime,0); assert.equal(focus(s),'');
  }
});

test('page has one chart, original three paths and Hindi-English scripts without Gujarati',()=>{
  const html=readFileSync(new URL('../lic/bima-platinum/index.html',import.meta.url),'utf8');
  assert.equal((html.match(/class="balance-plot"/g)||[]).length,1);
  assert.equal((html.match(/class="scenario-line /g)||[]).length,3);
  assert.match(html,/आपका business ही आपका/);
  assert.doesNotMatch(html+source,/[\u0A80-\u0AFF]/);
});


test('Page 3 opens the reveal, Page 5 leads to the journey, and Back restores the chart',()=>{
  const s=setup(); s.click('ctaForwardBtn'); s.click('sceneTwoNextBtn');
  assert.equal(s.el('storyNextLabel').textContent,'Stability का अगला कदम');
  s.click('sceneTwoNextBtn');
  assert.equal(s.el('stageContainer').attrs['data-story-step'],'4');
  assert.equal(s.el('productReveal').hidden,false);
  assert.equal(s.el('storyChart').hidden,true);
  assert.equal(s.el('revealCtaIntro').hidden,false);
  assert.equal(s.el('storyNextLabel').textContent,'Plan समझें');
  assert.equal(s.el('storyStageCounter').textContent,'4 / 10');
  s.click('sceneTwoNextBtn');
  assert.equal(s.el('storyStageCounter').textContent,'5 / 10');
  assert.equal(s.el('planDetailsPage').hidden,false);
  assert.equal(s.el('sceneTwoNextBtn').hidden,false);
  s.click('sceneTwoNextBtn');
  assert.equal(s.el('storyStageCounter').textContent,'6 / 10');
  assert.equal(s.el('planJourneyPage').hidden,false);
  assert.equal(s.el('storyNextLabel').textContent,'Tap to reveal next benefit');
  const html=readFileSync(new URL('../lic/bima-platinum/index.html',import.meta.url),'utf8');
  assert.doesNotMatch(html,/LIC sample • Offline|Income during payout period|moreBenefitsPage|planDetailsFrame/);
  s.click('previewDismissBtn');
  assert.equal(s.el('planDetailsPage').hidden,false);
  s.click('previewDismissBtn');
  assert.equal(s.el('productReveal').hidden,false);
  s.click('previewDismissBtn');
  assert.equal(s.el('storyChart').hidden,false);
  assert.equal(s.el('productReveal').hidden,true);
  assert.equal(s.el('storyChart').attrs['data-step'],'3');
});

test('Page 4 shares recording controls, exact script and missing-file handling',async()=>{
  const s=setup(); s.click('ctaForwardBtn'); s.click('sceneTwoNextBtn'); s.click('sceneTwoNextBtn');
  s.click('sceneTwoDialogueBtn'); await flush();
  const audio=s.audios[0];
  assert.equal(audio.src,'assets/audio/page4-advisor.mp3');
  assert.equal(s.el('sceneTwoAudioLabel').textContent,'Pause audio');
  assert.equal(focus(s),'');
  audio.currentTime=2; s.click('sceneTwoDialogueBtn');
  assert.equal(s.el('sceneTwoAudioLabel').textContent,'Resume audio');
  s.click('sceneTwoDialogueBtn'); await flush();
  s.click('sceneTwoNextBtn');
  assert.equal(audio.paused,true); assert.equal(audio.currentTime,0);
  audio.events.playing();
  assert.equal(s.el('sceneTwoAudioLabel').textContent,'Hear Advisor');
  assert.match(source,/यहीं Bima Platinum आपकी financial journey में stability जोड़ता है। यह आपके portfolio के एक हिस्से को guaranteed और predictable structure देने के लिए बनाया गया है।/);
  const missing=setup(()=>Promise.reject(new Error('missing')));
  missing.click('ctaForwardBtn'); missing.click('sceneTwoNextBtn'); missing.click('sceneTwoNextBtn');
  missing.click('sceneTwoDialogueBtn'); await flush();
  assert.match(missing.el('sceneTwoAudioStatus').textContent,/नई recording/);
});


test('all 20 official samples use fixed lookup premiums and update timing',()=>{
  const s=setup(); s.click('ctaForwardBtn'); for(let i=0;i<3;i++) s.click('sceneTwoNextBtn');
  const fixtures={15:[81810,54735,43020,32145,24990],25:[83145,55275,43290,32220,25005],35:[87495,57015,44160,32445,25005],45:[100365,62025,46770,33465,25425]};
  const ppts=[7,10,12,15,18];
  for(const [age,premiums] of Object.entries(fixtures)) {
    s.click('sampleAge'+age);
    for(let i=0;i<ppts.length;i++) {
      const ppt=ppts[i]; s.click('samplePpt'+ppt);
      assert.equal(s.premium(age,ppt),premiums[i]);
      assert.equal(s.el('incomeAnnualPremium').textContent,'₹'+premiums[i].toLocaleString('en-IN'));
      assert.equal(s.el('incomePptEnd').textContent,'Year '+ppt);
      assert.equal(s.el('incomePayoutStart').textContent,'End of Year '+ppt);
      assert.equal(s.el('incomeLaterYears').textContent,'Years '+(ppt+5)+' / 30');
      assert.equal(s.el('sampleAge'+age).attrs['aria-pressed'],'true');
      assert.equal(s.el('samplePpt'+ppt).attrs['aria-pressed'],'true');
    }
  }
  for(const [age,ppt] of [[34,7],[25,8],[60,15],[null,15]]) assert.equal(s.premium(age,ppt),null);
});

test('income defaults and selections persist when navigating back to Page 4',()=>{
  const s=setup();
  assert.equal(s.el('incomeAnnualPremium').textContent,'₹32,220');
  s.click('ctaForwardBtn'); for(let i=0;i<3;i++) s.click('sceneTwoNextBtn');
  s.click('sampleAge35'); s.click('samplePpt7');
  assert.equal(s.el('incomeAnnualPremium').textContent,'₹87,495');
  s.click('previewDismissBtn'); s.click('sceneTwoNextBtn');
  assert.equal(s.el('incomeAnnualPremium').textContent,'₹87,495');
  assert.equal(s.el('samplePpt7').attrs['aria-pressed'],'true');
  const html=readFileSync(new URL('../lic/bima-platinum/index.html',import.meta.url),'utf8');
  assert.match(html,/Sum Assured<\/dt><dd>₹3,00,000/);
  assert.match(html,/Policy Term<\/dt><dd>30 years/);
  assert.match(html,/income-amount">₹30,000/);
  assert.doesNotMatch(html,/Choose an official LIC example/);
});

test('Page 5 advisor control uses shared audio lifecycle and stops on Back',async()=>{
  const s=setup(); s.click('ctaForwardBtn'); for(let i=0;i<3;i++) s.click('sceneTwoNextBtn');
  s.click('sceneTwoDialogueBtn'); await flush();
  assert.equal(s.audios[0].src,'assets/audio/page5-advisor.mp3');
  s.audios[0].currentTime=2;
  s.click('sceneTwoDialogueBtn'); assert.equal(s.el('sceneTwoAudioLabel').textContent,'Resume audio');
  s.click('sceneTwoDialogueBtn'); await flush();
  s.click('previewDismissBtn'); assert.equal(s.audios[0].paused,true); assert.equal(s.audios[0].currentTime,0);
});

test('Page 6 carries selected PPT, maps booster year, and finishes with a replayable story',()=>{
  const s=setup(); s.click('ctaForwardBtn'); for(let i=0;i<3;i++) s.click('sceneTwoNextBtn');
  s.click('samplePpt7'); s.click('sceneTwoNextBtn');
  s.click('journey3');
  assert.match(s.el('journeyDetail').innerHTML,/Policy Year 12/);
  assert.match(s.audios.at(-1).src,/page6-step4\.mp3$/);
  s.click('journey4'); s.click('sceneTwoNextBtn');
  assert.equal(s.el('journeyReplay').hidden,false);
  assert.equal(s.el('storyNextLabel').textContent,'अब protection भी देखें');
  assert.equal(s.el('journey0').classList.contains('is-complete'),true);
  s.click('journeyReplay');
  assert.equal(s.el('journeyProgress').textContent,'1 of 5');
  assert.equal(s.el('journeyReplay').hidden,true);
  s.click('previewDismissBtn');
  assert.equal(s.el('storyStageCounter').textContent,'5 / 10');
  assert.equal(s.audios.at(-1).paused,true);
});
