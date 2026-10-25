import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../lic/bima-platinum/presentation.js', import.meta.url), 'utf8');
function setup(play) {
  const elements = new Map();
  function el(id) {
    if (!elements.has(id)) elements.set(id, {
      id, textContent:'', inert:false, hidden:false, events:{}, attrs:{}, children:[],
      style: { values:{}, setProperty(k,v) { this.values[k]=v; } },
      classList: { values:new Set(), add(...v) { v.forEach(x=>this.values.add(x)); }, remove(...v) { v.forEach(x=>this.values.delete(x)); }, contains(v) { return this.values.has(v); } },
      appendChild(child) { if(child.parentElement) child.parentElement.children=child.parentElement.children.filter(x=>x!==child); this.children.push(child); child.parentElement=this; },
      addEventListener(k,fn) { this.events[k]=fn; }, setAttribute(k,v) { this.attrs[k]=v; },
      focus() {}, querySelectorAll() { return []; }
    });
    return elements.get(id);
  }
  const audios=[]; const windowEvents={};
  const doc={events:{}, hidden:false, getElementById:el, querySelectorAll:()=>[], querySelector:s=>s==='.layer-stage-3d'?el('firstScene'):s==='.scene-two-nav'?el('sceneNav'):null,
    body:el('body'), addEventListener(k,fn) { this.events[k]=fn; }};
  class Audio {
    constructor(src) { this.src=src; this.events={}; this.currentTime=0; this.ended=false; this.paused=true; audios.push(this); }
    addEventListener(k,fn) { this.events[k]=fn; }
    async play() { if(play) await play(); this.paused=false; this.events.playing(); }
    pause() { this.paused=true; this.events.pause(); }
  }
  vm.runInNewContext(source,{document:doc, Audio, URLSearchParams, setTimeout,
    window:{location:{search:'',hash:''},addEventListener(k,fn) { windowEvents[k]=fn; }}});
  doc.events.DOMContentLoaded();
  return {el,doc,audios,windowEvents,click:id=>el(id).events.click({stopPropagation(){}})};
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
  assert.equal(s.el('sceneTwoNextBtn').hidden,true);
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
