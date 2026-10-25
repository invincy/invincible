import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../lic/bima-platinum/presentation.js', import.meta.url), 'utf8');
function setup(play) {
  const elements = new Map();
  function el(id) {
    if (!elements.has(id)) elements.set(id, {
      textContent: '', inert: true, hidden: true, events: {}, attrs: {},
      classList: { values: new Set(), add(...v) { v.forEach(x => this.values.add(x)); }, remove(...v) { v.forEach(x => this.values.delete(x)); }, contains(v) { return this.values.has(v); } },
      addEventListener(k, fn) { this.events[k] = fn; },
      setAttribute(k, v) { this.attrs[k] = v; }, focus() {},
    });
    return elements.get(id);
  }
  const audios = [];
  let speechCalls = 0;
  const doc = { events: {}, hidden: false, getElementById: el, querySelectorAll: () => [], querySelector: selector => selector === '.layer-stage-3d' ? el('firstScene') : null,
    body: el('body'), addEventListener(k, fn) { this.events[k] = fn; } };
  class Audio {
    constructor(src) { this.src = src; this.events = {}; this.currentTime = 0; this.ended = false; audios.push(this); }
    addEventListener(k, fn) { this.events[k] = fn; }
    async play() { if (play) await play(); this.events.playing(); }
    pause() { this.events.pause(); }
  }
  vm.runInNewContext(source, { document: doc, Audio, URLSearchParams, setTimeout,
    window: { location: { search: '', hash: '' }, addEventListener() {}, speechSynthesis: { cancel() {}, speak() { speechCalls++; } } } });
  doc.events.DOMContentLoaded();
  return { el, doc, audios, speechCalls: () => speechCalls,
    click: id => el(id).events.click({ stopPropagation() {} }) };
}
const flush = () => new Promise(resolve => setImmediate(resolve));

test('advisor recording loads only on tap, pauses, resumes and resets on end', async () => {
  const s = setup();
  assert.equal(s.audios.length, 0);
  s.click('advisorAudioBtn'); await flush();
  assert.equal(s.el('advisorAudioLabel').textContent, 'Pause Audio');
  s.audios[0].currentTime = 2;
  s.click('advisorAudioBtn');
  assert.equal(s.el('advisorAudioLabel').textContent, 'Resume Audio');
  s.click('advisorAudioBtn'); await flush();
  assert.equal(s.audios[0].currentTime, 2);
  s.audios[0].events.ended();
  assert.equal(s.audios[0].currentTime, 0);
  assert.equal(s.el('advisorAudioLabel').textContent, 'Hear Advisor');
});
test('missing MP3 gives status without silently speaking a different voice', async () => {
  const s = setup(() => Promise.reject(new Error('Missing recording')));
  s.click('advisorAudioBtn'); await flush();
  assert.match(s.el('audioStatus').textContent, /recording coming soon/);
  assert.equal(s.speechCalls(), 0);
  assert.equal(s.el('advisorAudioBtn').attrs['aria-busy'], 'false');
});
test('opening Stage 2 cancels pending audio without late speech fallback', async () => {
  let reject;
  const s = setup(() => new Promise((_, fail) => { reject = fail; }));
  s.click('advisorAudioBtn'); s.click('ctaForwardBtn');
  reject(new Error('load failed')); await flush();
  assert.equal(s.el('stagePreviewModal').inert, false);
  assert.equal(s.el('advisorAudioLabel').textContent, 'Hear Advisor');
  assert.equal(s.el('audioStatus').textContent, '');
  assert.equal(s.speechCalls(), 0);
  s.click('previewDismissBtn');
  assert.equal(s.el('stagePreviewModal').inert, true);
});
test('leaving the page stops and rewinds narration', async () => {
  const s = setup(); s.click('advisorAudioBtn'); await flush();
  s.audios[0].currentTime = 10;
  s.doc.hidden = true; s.doc.events.visibilitychange();
  assert.equal(s.audios[0].currentTime, 0);
  assert.equal(s.el('advisorAudioLabel').textContent, 'Hear Advisor');
});

test('page and narration use Hindi-English with no Gujarati remnants', () => {
  const html = readFileSync(new URL('../lic/bima-platinum/index.html', import.meta.url), 'utf8');
  assert.match(html, /lang="hi"/);
  assert.match(html, /आपका/);
  assert.doesNotMatch(html + source, /[\u0A80-\u0AFF]/);
  assert.match(source, /advisor-scene-1-hindi\.mp3/);
});

test('Scene 2 recording pauses, resumes and rewinds on return', async () => {
  const s = setup(); s.click('ctaForwardBtn');
  assert.equal(s.el('firstScene').inert, true);
  s.click('sceneTwoDialogueBtn'); await flush();
  assert.match(s.audios[0].src, /advisor-scene-2-hindi\.mp3/);
  assert.equal(s.el('sceneTwoAudioLabel').textContent, 'Pause audio');
  s.audios[0].currentTime = 3;
  s.click('sceneTwoDialogueBtn'); await flush();
  assert.equal(s.el('sceneTwoAudioLabel').textContent, 'Resume audio');
  s.click('sceneTwoDialogueBtn'); await flush();
  assert.equal(s.audios[0].currentTime, 3);
  s.click('previewDismissBtn');
  assert.equal(s.audios[0].currentTime, 0);
  assert.equal(s.el('firstScene').inert, false);
  assert.equal(s.el('stagePreviewModal').inert, true);
});
test('Scene 2 pending playback is cancelled when moving on', async () => {
  let resolve;
  const s = setup(() => new Promise(done => { resolve = done; }));
  s.click('ctaForwardBtn'); s.click('sceneTwoDialogueBtn');
  s.click('sceneTwoNextBtn');
  resolve(); await flush();
  assert.equal(s.audios[0].currentTime, 0);
  assert.equal(s.el('sceneTwoAudioLabel').textContent, 'Advisor की बात सुनें');
  assert.equal(s.el('sceneThreeStatus').hidden, false);
});
test('Scene 2 audio resets at the end and stops when the tab is hidden', async () => {
  const s = setup(); s.click('ctaForwardBtn'); s.click('sceneTwoDialogueBtn'); await flush();
  s.audios[0].events.ended();
  assert.equal(s.el('sceneTwoAudioLabel').textContent, 'Advisor की बात सुनें');
  s.click('sceneTwoDialogueBtn'); await flush(); s.audios[0].currentTime=4;
  s.doc.hidden=true; s.doc.events.visibilitychange();
  assert.equal(s.audios[0].currentTime,0);
  assert.equal(s.el('sceneTwoAudioLabel').textContent,'Advisor की बात सुनें');
});
