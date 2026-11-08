import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../lic/bima-platinum/presentation.js', import.meta.url), 'utf8');
function setup(play, {automatic=false, selection=false, clock=null}={}) {
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
    constructor(src) { this.src=src; this.events={}; this.currentTime=0; this.duration=10; this.ended=false; this.paused=true; audios.push(this); }
    addEventListener(k,fn) { this.events[k]=fn; }
    async play() { if(play) await play(); this.ended=false; this.paused=false; this.events.playing?.(); }
    pause() { this.paused=true; this.events.pause?.(); }
  }
  const context={document:doc, Audio, AbortController, URLSearchParams, setTimeout:clock?.setTimeout || setTimeout, clearTimeout:clock?.clearTimeout || clearTimeout,
    window:{location:{search:'',hash:''},addEventListener(k,fn) { windowEvents[k]=fn; }}};
  vm.runInNewContext(source,context);
  doc.events.DOMContentLoaded();
  if(!automatic) el('storyModeToggleOne').events.click();
  const click = id => {
    el(id).events.click({stopPropagation(){}});

  };
  return {el,doc,audios,windowEvents,premium:context.getLicSamplePremium,click,change:(id,value)=>el(id).events.change({target:{value}})};
}
const flush=()=>new Promise(resolve=>setImmediate(resolve));
const focus=s=>s.el('storyChart').attrs['data-focus'];

test('Auto continues through reveal to Page 5 using one audio element',async()=>{
  const s=setup(undefined,{automatic:true});
  await flush();
  const audio=s.audios[0],oldEnded=audio.events.ended;
  for(let page=1;page<=3;page++) {
    audio.currentTime=audio.duration;audio.ended=true;audio.events.ended();await flush();
    assert.equal(s.el('stageContainer').attrs['data-story-step'],String(page+1));
    assert.equal(s.audios.length,1,'Reuse the unlocked player for continuous mobile playback');
    assert.match(audio.src,new RegExp(page===3?'page4.mp3$':`newpage${page+1}.mp3$`));
    oldEnded();
    assert.equal(s.el('stageContainer').attrs['data-story-step'],String(page+1),'Ignore a stale ended callback');
  }
  audio.ended=true;audio.events.ended();await flush();
  assert.equal(s.el('stageContainer').attrs['data-story-step'],'5','Reveal continues to the example');
  assert.equal(s.el('planJourneyPage').hidden,false);
  assert.match(audio.src,/page6-step1.mp3$/);
  assert.equal(s.audios.length,1,'Journey reuses the unlocked player');
  s.windowEvents.pagehide();
});

test('Manual holds the final graph; switching Auto on continues without another Next tap',async()=>{
  const s=setup();await flush();const audio=s.audios[0];
  audio.ended=true;audio.events.ended();await flush();
  assert.equal(s.el('stageContainer').attrs['data-story-step'],'1');
  s.click('storyModeToggleOne');await flush();
  assert.equal(s.el('stageContainer').attrs['data-story-step'],'2');
  assert.equal(s.el('storyModeToggle').textContent,'Auto');
  s.click('storyModeToggle');
  assert.equal(s.el('storyModeToggleOne').textContent,'Manual');
});

test('one original chart moves through pages 1 → 2 → 3 and back without cloning',()=>{
  const s=setup(); const chart=s.el('storyChart');
  assert.equal(chart.parentElement,s.el('sceneOneChartHost'));
  assert.equal(chart.attrs['data-step'],'1');
  assert.match(s.audios[0].src,/page1.mp3$/);
  s.click('ctaForwardBtn');
  assert.equal(chart.parentElement,s.el('presenterChartHost'));
  assert.equal(s.el('sceneOneChartHost').children.length,0);
  assert.equal(chart.attrs['data-step'],'2');
  assert.equal(s.el('firstScene').inert,true);
  assert.equal(s.el('stagePreviewModal').inert,false);
  s.click('sceneTwoNextBtn');
  assert.equal(chart.attrs['data-step'],'3');
  assert.equal(s.el('storyStageCounter').textContent,'3 / 5');
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
  const s=setup(); await flush();
  const audio=s.audios[0];
  assert.match(audio.src,/page1.mp3$/);
  assert.equal(focus(s),'business');
  audio.currentTime=4.65; audio.events.timeupdate();
  assert.ok(Math.abs(Number(s.el('storyChart').style.values['--narration-reveal'])-.5)<1e-9);
  s.click('advisorAudioBtn');
  assert.equal(s.el('advisorAudioLabel').textContent,'Resume audio');
  assert.equal(focus(s),'business');
  s.click('advisorAudioBtn'); await flush();
  assert.equal(audio.currentTime,4.65);
  audio.ended=true; audio.events.ended();
  assert.equal(audio.currentTime,0);
  assert.equal(s.el('storyChart').style.values['--narration-reveal'],'0');
  assert.equal(focus(s),'business');
  audio.ended=false; s.click('advisorAudioBtn'); await flush();
  assert.equal(focus(s),'business');
});

test('opening pages starts audio and a blocked first load can be started by tapping play',async()=>{
  let calls=0;
  const s=setup(()=>++calls===1 ? Promise.reject(Object.assign(new Error('blocked'),{name:'NotAllowedError'})) : Promise.resolve());
  await flush();
  assert.match(s.el('audioStatus').textContent,/play पर tap/);
  assert.equal(s.el('advisorAudioLabel').textContent,'Advisor की बात सुनें');
  s.click('advisorAudioBtn'); await flush();
  assert.equal(s.el('advisorAudioLabel').textContent,'Pause audio');
  s.click('ctaForwardBtn'); await flush();
  assert.match(s.audios.at(-1).src,/page2.mp3$/);
  assert.equal(s.el('sceneTwoAudioLabel').textContent,'Pause audio');
});

test('Page 2 draws only its new market allocation over the media duration and follows seeking',async()=>{
  const s=setup(); s.click('ctaForwardBtn'); await flush();
  const audio=s.audios.at(-1);
  assert.match(audio.src,/newpage2.mp3$/);
  assert.equal(focus(s),'market');
  audio.currentTime=1; audio.events.timeupdate();
  assert.equal(s.el('storyChart').style.values['--narration-reveal'],'1');
  audio.currentTime=5.3; audio.events.timeupdate();
  assert.ok(Math.abs(Number(s.el('storyChart').style.values['--narration-reveal'])-.5)<1e-9);
  s.click('sceneTwoDialogueBtn'); assert.equal(focus(s),'market');
  s.click('sceneTwoDialogueBtn'); await flush(); assert.equal(focus(s),'market');
  audio.currentTime=1; audio.events.seeked();
  assert.equal(s.el('storyChart').style.values['--narration-reveal'],'1');
  audio.duration=20; audio.currentTime=10.6; audio.events.durationchange();
  assert.ok(Math.abs(Number(s.el('storyChart').style.values['--narration-reveal'])-.5)<1e-9);
});

test('Page 3 introduces stability, keeping the shared chart in its third state',async()=>{
  const s=setup(); s.click('ctaForwardBtn'); s.click('sceneTwoNextBtn');
  await flush();
  assert.match(s.audios.at(-1).src,/page3.mp3$/);
  assert.equal(focus(s),'platinum');
  assert.equal(s.el('storyChart').attrs['data-step'],'3');
  s.click('previewDismissBtn');
  assert.equal(s.audios.at(-2).paused,true); assert.equal(s.audios.at(-2).currentTime,0);
  assert.equal(focus(s),'market');
});

test('navigation cancels pending play and ignores stale events on a different page',async()=>{
  const resolves=[]; const s=setup(()=>new Promise(done=>{resolves.push(done);}));
  s.click('ctaForwardBtn');
  const old=s.audios.at(-1); s.click('sceneTwoNextBtn');
  resolves[1](); await flush();
  old.events.timeupdate(); old.events.ended();
  assert.equal(old.paused,true); assert.equal(old.currentTime,0);
  assert.equal(s.el('storyChart').attrs['data-step'],'3');
  assert.equal(focus(s),'platinum');
  assert.equal(s.el('sceneTwoAudioLabel').textContent,'Loading audio…');
});

test('a rejected old load cannot put an error on the next page',async()=>{
  const rejects=[]; const s=setup(()=>new Promise((_,fail)=>{rejects.push(fail);}));
  s.click('ctaForwardBtn');
  rejects[0](new Error('missing')); await flush();
  assert.equal(s.el('audioStatus').textContent,'');
  assert.equal(s.el('sceneTwoAudioStatus').textContent,'');
  assert.equal(focus(s),'market');
});

test('missing new recordings show a truthful status and never play the old script',async()=>{
  const s=setup(()=>Promise.reject(new Error('missing')));
  s.click('advisorAudioBtn'); await flush();
  assert.match(s.el('audioStatus').textContent,/नई recording/);
  assert.equal(s.el('advisorAudioBtn').attrs['aria-busy'],'false');
  assert.equal(focus(s),'business');
  assert.doesNotMatch(s.audios[0].src,/advisor-scene-/);
});

test('tab hiding, pagehide and Escape stop narration and clear its highlight',async()=>{
  for(const action of ['hidden','pagehide','escape']) {
    const s=setup(); s.click('ctaForwardBtn'); s.click('sceneTwoNextBtn'); await flush();
    const audio=s.audios.at(-1); audio.currentTime=4;
    if(action==='hidden') {s.doc.hidden=true;s.doc.events.visibilitychange();}
    if(action==='pagehide') s.windowEvents.pagehide();
    if(action==='escape') s.doc.events.keydown({key:'Escape'});
    assert.equal(audio.paused,true); assert.equal(audio.currentTime,0);
    assert.equal(focus(s),action==='escape'?'market':'platinum');
  }
});

test('page has one chart, original three paths and Hindi-English scripts without Gujarati',()=>{
  const html=readFileSync(new URL('../lic/bima-platinum/index.html',import.meta.url),'utf8');
  assert.equal((html.match(/class="balance-plot"/g)||[]).length,1);
  assert.equal((html.match(/class="scenario-line /g)||[]).length,3);
  assert.match(html,/आपका business ही आपका/);
  assert.doesNotMatch(html+source,/[\u0A80-\u0AFF]/);
});

test('all supplied page and journey voice recordings are installed',()=>{
  const names=[...Array.from({length:3},(_,index)=>`newpage${index+1}.mp3`),...Array.from({length:5},(_,index)=>`page${index+1}.mp3`),...Array.from({length:5},(_,index)=>`page6-step${index+1}.mp3`)];
  for(const name of names) assert.equal(existsSync(new URL(`../lic/bima-platinum/assets/audio/${name}`,import.meta.url)),true,name);
});



function enterJourney(s) {s.click('ctaForwardBtn');s.click('sceneTwoNextBtn');s.click('sceneTwoNextBtn');s.click('sceneTwoNextBtn');}
test('Page 4 offers the only selectors; Page 5 opens its chart and Back preserves choices',()=>{
  const s=setup();s.click('ctaForwardBtn');s.click('sceneTwoNextBtn');s.click('sceneTwoNextBtn');
  assert.equal(s.el('policyExampleSelection').hidden,false);
  s.change('policyExampleAge','35');s.change('policyExamplePpt','7');s.click('sceneTwoNextBtn');
  assert.equal(s.el('policyExampleSelection').hidden,true);
  assert.equal(s.el('planJourneyPage').hidden,false);
  assert.match(s.el('journeyStageBody0').textContent,/7 years.*87,495/);
  s.click('journey3');assert.match(s.el('journeyStageBody3').textContent,/2,10,000.*12/);
  s.click('previewDismissBtn');s.click('sceneTwoNextBtn');
  assert.match(s.el('journeyStageBody0').textContent,/7 years.*87,495/);
  s.windowEvents.pagehide();
});
test('all 20 fixed premiums remain exact and unsupported samples return null',()=>{
  const s=setup();const fixtures={15:[81810,54735,43020,32145,24990],25:[83145,55275,43290,32220,25005],35:[87495,57015,44160,32445,25005],45:[100365,62025,46770,33465,25425]};
  for(const [age,premiums] of Object.entries(fixtures)) [7,10,12,15,18].forEach((ppt,i)=>assert.equal(s.premium(age,ppt),premiums[i]));
  assert.equal(s.premium(34,7),null);assert.equal(s.premium(25,8),null);s.windowEvents.pagehide();
});
test('narration advances one expanded accordion stage, completes and replays on Page 5',async()=>{
  const s=setup();enterJourney(s);await flush();const audio=s.audios.at(-1);
  for(let stage=0;stage<5;stage++) {
    assert.match(audio.src,new RegExp(`page6-step${stage+1}.mp3$`));
    for(let i=0;i<5;i++)assert.equal(s.el('journey'+i).attrs['aria-expanded'],String(stage===i));
    audio.events.ended();await flush();
  }
  assert.equal(s.el('planJourneyPage').dataset.complete,'true');
  assert.equal(s.el('storyNextLabel').textContent,'Replay journey');
  s.click('sceneTwoNextBtn');assert.equal(s.el('journey0').attrs['aria-expanded'],'true');s.windowEvents.pagehide();
});
test('pause, resume, manual stage selection and Back cancel stale journey audio',async()=>{
  const s=setup();enterJourney(s);await flush();const audio=s.audios.at(-1),oldEnded=audio.events.ended;
  s.click('journeyPlayPause');assert.equal(audio.paused,true);assert.equal(s.el('planJourneyPage').dataset.paused,'true');
  s.click('journeyPlayPause');await flush();assert.equal(audio.paused,false);
  s.click('journey3');await flush();oldEnded();assert.equal(s.el('journey3').attrs['aria-expanded'],'true');
  const ended=audio.events.ended;s.click('previewDismissBtn');ended();
  assert.equal(s.el('stageContainer').attrs['data-story-step'],'4');assert.equal(audio.paused,true);s.windowEvents.pagehide();
});
test('every stage renders the complete chart with base GA and correct payout years',()=>{
  const ctx={window:{}};vm.runInNewContext(readFileSync(new URL('../lic/bima-platinum/financial-journey.js',import.meta.url),'utf8'),ctx);
  const root={dataset:{}};
  for(let step=0;step<5;step++) {
    ctx.window.renderBimaFinancialJourney(root,{step,ppt:7,premium:87495,age:35,boosterYear:12,term:30,baseSA:300000});
    assert.match(root.innerHTML,/₹1,71,490/);assert.match(root.innerHTML,/₹4,71,490/);
    assert.match(root.innerHTML,/Years 7–29/);assert.match(root.innerHTML,/Year 12/);assert.match(root.innerHTML,/Year 30/);
    assert.match(root.innerHTML,/Maturity/);assert.doesNotMatch(root.innerHTML,/<button|7% base|7Y|10Y/);
    assert.equal(root.dataset.stage,String(step));
  }
});

test('hiding the journey pauses at its current media position',async()=>{
  const s=setup();enterJourney(s);await flush();const audio=s.audios.at(-1);audio.currentTime=2;
  s.doc.hidden=true;s.doc.events.visibilitychange();assert.equal(audio.paused,true);assert.equal(audio.currentTime,2);
  s.doc.hidden=false;s.click('journeyPlayPause');await flush();assert.equal(audio.paused,false);assert.equal(audio.currentTime,2);s.windowEvents.pagehide();
});
