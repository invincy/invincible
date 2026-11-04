/** LIC Bima Platinum: existing chart story and a focused product reveal. */
// Pages 1–3 use the supplied filenames and media-duration progress in syncChart.
// Page 4 continues to the example after narration; Page 5 waits for selection.
const STORY_SCENES = {
  1: {
    src: 'assets/audio/newpage1.mp3',
    script: 'आपका business ही आपका main growth engine है। यहीं से आपकी income और wealth grow होती है।',
    cues: [{ start: 0, focus: 'business' }]
  },
  2: {
    src: 'assets/audio/newpage2.mp3',
    script: 'Business में पैसा लगाइए growth के लिए। लेकिन अगर आपकी बाकी savings भी Share Market में जाएँ, तो overall volatility और बढ़ जाती है।',
    cues: []
  },
  3: {
    src: 'assets/audio/newpage3.mp3',
    script: 'इसलिए अपनी personal savings का एक हिस्सा stability के लिए अलग रखिए। एक stable या guaranteed structure आपके overall finances में predictability जोड़ता है।',
    cues: [{ start: 0, focus: 'platinum' }]
  },
  4: {
    src: 'assets/audio/page4.mp3',
    script: 'यहीं Bima Platinum आपकी financial journey में stability जोड़ता है। यह आपके portfolio के एक हिस्से को guaranteed और predictable structure देने के लिए बनाया गया है।',
    cues: []
  },
  5: { src: 'assets/audio/page5.mp3', script: 'इस उदाहरण में Basic Sum Assured तीन लाख रुपये है। इसका दस प्रतिशत, यानी तीस हज़ार रुपये, हर साल Regular Income के रूप में मिलता है। पहला भुगतान चुने हुए Premium Paying Term के अंत में शुरू होता है, policy की शर्तों के अनुसार।', cues: [] },
  6: { src: null, script: '', cues: [] }
};

// Original supplied portraits: concern for volatility, reassurance for stability.
const STORY_ADVISORS = { 2: 'assets/advisor-concerned-19292.jpg', 3: 'assets/advisor-reassuring-19294.jpg' };

const JOURNEY_STEPS = [
  { id:'ppt', title:'Choose Your PPT', visual:'pay', audio:'assets/audio/page6-step1.mp3', fallbackDuration:3600, script:'सबसे पहले आप चुनते हैं कि premium कितने साल pay करना है।' },
  { id:'additions', title:'Guaranteed Additions', visual:'build', audio:'assets/audio/page6-step2.mp3', fallbackDuration:3600, script:'Premium paying period के दौरान Guaranteed Additions जुड़ते रहते हैं।' },
  { id:'income', title:'Regular Income', visual:'income', audio:'assets/audio/page6-step3.mp3', fallbackDuration:4300, script:'Premium period पूरा होने के बाद हर साल Basic Sum Assured का 10% Regular Income मिलता है।' },
  { id:'booster', title:'70% Booster', visual:'booster', audio:'assets/audio/page6-step4.mp3', fallbackDuration:3600, script:'इसके अलावा plan में 70% का Booster Income Benefit भी मिलता है।' },
  { id:'maturity', title:'Maturity', visual:'maturity', audio:'assets/audio/page6-step5.mp3', fallbackDuration:3900, script:'और policy के अंत में Basic Sum Assured के साथ accrued Guaranteed Additions मिलते हैं।' }
];
const BOOSTER_YEAR_BY_PPT = Object.freeze({7:12,10:15,12:17,15:20,18:23});

// LIC sales brochure, Sample Illustrative Premium (printed pp.15–16).
// BSA ₹3,00,000, policy term 30 years, offline, standard lives; taxes excluded.
// Fixed examples only: never interpolate, scale or extrapolate premiums.
const LIC_SAMPLE_PREMIUMS = Object.freeze({
  15: Object.freeze({ 7:81810, 10:54735, 12:43020, 15:32145, 18:24990 }),
  25: Object.freeze({ 7:83145, 10:55275, 12:43290, 15:32220, 18:25005 }),
  35: Object.freeze({ 7:87495, 10:57015, 12:44160, 15:32445, 18:25005 }),
  45: Object.freeze({ 7:100365, 10:62025, 12:46770, 15:33465, 18:25425 })
});
function getLicSamplePremium(age, ppt) {
  return LIC_SAMPLE_PREMIUMS[age]?.[ppt] ?? null;
}

document.addEventListener('DOMContentLoaded', () => {
  const stageContainer = document.getElementById('stageContainer');
  const deviceFrame = document.getElementById('deviceFrame');
  const viewportWrapper = document.querySelector('.app-viewport-wrapper');
  if (viewportWrapper) {
    // Embedded phone browsers can report a layout viewport taller than the
    // visible screen. Clamp the scene to the visible viewport, not vh/dvh alone.
    const fitVisibleViewport = () => {
      const viewport = window.visualViewport;
      const unzoomed = !viewport || Math.abs(viewport.scale - 1) < .01;
      const top = unzoomed && viewport ? Math.max(0, viewport.offsetTop) : 0;
      const heights = [window.innerHeight - top, document.documentElement.clientHeight - top];
      if (viewport && unzoomed) heights.push(viewport.height);
      const height = Math.floor(Math.min(...heights.filter(value => Number.isFinite(value) && value > 0)));
      if (!Number.isFinite(height)) return;
      viewportWrapper.style.setProperty('--presentation-height', `${height}px`);
      viewportWrapper.style.setProperty('--presentation-top', `${top}px`);
    };
    fitVisibleViewport();
    window.addEventListener('resize', fitVisibleViewport);
    window.addEventListener('orientationchange', fitVisibleViewport);
    window.visualViewport?.addEventListener('resize', fitVisibleViewport);
    window.visualViewport?.addEventListener('scroll', fitVisibleViewport);
    window.addEventListener('pageshow', fitVisibleViewport);
  }

  const stagePreviewModal = document.getElementById('stagePreviewModal');
  const previewDismissBtn = document.getElementById('previewDismissBtn');
  const ctaForwardBtn = document.getElementById('ctaForwardBtn');
  const advisorAudioBtn = document.getElementById('advisorAudioBtn');
  const advisorAudioIcon = document.getElementById('advisorAudioIcon');
  const advisorAudioLabel = document.getElementById('advisorAudioLabel');
  const sceneTwoDialogueBtn = document.getElementById('sceneTwoDialogueBtn');
  const sceneTwoAudioLabel = document.getElementById('sceneTwoAudioLabel');
  const audioStatus = document.getElementById('audioStatus');
  const sceneTwoAudioStatus = document.getElementById('sceneTwoAudioStatus');
  const storyChart = document.getElementById('storyChart');
  const businessEvents = [...document.querySelectorAll('#storyChart .business-event')];
  const businessPath = document.querySelector('#storyChart .scenario-business');
  // Find each event on the actual, unmodified curve. The same arc-length fraction
  // controls the drawing and the label reveal, including pause, seek and replay.
  businessEvents.forEach(event => {
    const length = businessPath.getTotalLength();
    const x = Number(event.dataset.graphX);
    let low = 0, high = length;
    for (let i = 0; i < 24; i++) {
      const mid = (low + high) / 2;
      if (businessPath.getPointAtLength(mid).x < x) low = mid;
      else high = mid;
    }
    const distance = (low + high) / 2;
    const point = businessPath.getPointAtLength(distance);
    event.dataset.reveal = String(distance / length);
    const dot = event.querySelector('circle');
    dot.setAttribute('cx', point.x);
    dot.setAttribute('cy', point.y);
    event.querySelector('.event-connector').setAttribute('d',
      `M${point.x} ${point.y} L${event.dataset.labelX} ${event.dataset.labelY}`);
  });
  // Keep annotations readable in CSS pixels without enlarging or moving the graph.
  if (businessEvents.length && typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(() => {
      const matrix = businessPath.getScreenCTM();
      if (matrix?.a > 0) storyChart.style.setProperty('--event-font-size', `${9 / matrix.a}px`);
    }).observe(storyChart);
  }
  const firstScene = document.querySelector('.layer-stage-3d');
  const sceneThreeStatus = document.getElementById('sceneThreeStatus');
  const inspectorFab = document.getElementById('inspectorFab');
  const inspectorPanel = document.getElementById('inspectorPanel');
  const toggle3DExploded = document.getElementById('toggle3DExploded');
  const toggleDeviceFrame = document.getElementById('toggleDeviceFrame');
  const layerCheckboxes = document.querySelectorAll('.layer-toggle-input');
  let selectedSampleAge = 25;
  let selectedSamplePpt = 15;
  const ageOptions = document.querySelectorAll('#incomeAgeOptions button');
  const pptOptions = document.querySelectorAll('#incomePptOptions button');
  function updateIncomeExample() {
    const premium = getLicSamplePremium(selectedSampleAge, selectedSamplePpt);
    document.getElementById('incomeAnnualPremium').textContent = '₹' + premium.toLocaleString('en-IN');
    document.getElementById('incomePptEnd').textContent = `Year ${selectedSamplePpt}`;
    document.getElementById('incomePayoutStart').textContent = `End of Year ${selectedSamplePpt}`;
    document.getElementById('incomeLaterYears').textContent = `Years ${selectedSamplePpt + 5} / 30`;
    ageOptions.forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.age) === selectedSampleAge)));
    pptOptions.forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.ppt) === selectedSamplePpt)));
  }
  ageOptions.forEach(button => button.addEventListener('click', () => {
    const age = Number(button.dataset.age);
    if (getLicSamplePremium(age, selectedSamplePpt) === null) return;
    selectedSampleAge = age;
    updateIncomeExample();
  }));
  pptOptions.forEach(button => button.addEventListener('click', () => {
    const ppt = Number(button.dataset.ppt);
    if (getLicSamplePremium(selectedSampleAge, ppt) === null) return;
    selectedSamplePpt = ppt;
    updateIncomeExample();
  }));
  updateIncomeExample();
  let currentPage = 1;
  let automaticStory = true;
  let audioEvents = null;
  const storyModeButtons = [document.getElementById('storyModeToggleOne'), document.getElementById('storyModeToggle')];
  let audioElement = null;
  let audioAttempt = 0;
  let playbackWanted = false;
  let playbackState = 'idle';
  let chartComplete = false;
  let narrationComplete = false;
  let chartFrame = null;
  const journeyPage = document.getElementById('planJourneyPage');
  const journeyControls = document.getElementById('journeyControls');
  const journeyNodes = [...document.querySelectorAll('[data-journey-step]')];
  const journeyToggle = document.getElementById('journeyPlayPause');
  const journeyReplay = document.getElementById('journeyReplay');
  const journeyNext = document.getElementById('sceneTwoNextBtn');
  let journeyStep = -1;
  let journeyAutoplay = false;
  let journeyComplete = false;
  let journeyAudio = null;
  let journeyTimer = null;
  let journeyLoadTimer = null;
  let journeyDeadline = 0;
  let journeyRemaining = 0;
  let journeyMode = 'fallback';
  let journeyGeneration = 0;

  function clearJourneyRun() {
    journeyGeneration++;
    clearTimeout(journeyTimer);
    clearTimeout(journeyLoadTimer);
    journeyTimer = journeyLoadTimer = null;
    if (journeyAudio) { journeyAudio.pause(); journeyAudio.currentTime = 0; journeyAudio = null; }
  }
  function stopJourney() {
    clearJourneyRun();
    journeyAutoplay = false;
    journeyStep = -1;
    journeyComplete = false;
  }
  function updateJourneyControls() {
    journeyPage.dataset.paused = String(!journeyAutoplay || journeyComplete);
    journeyPage.dataset.complete = String(journeyComplete);
    journeyToggle.innerHTML = journeyAutoplay ? '<span class="advisor-audio-icon" aria-hidden="true">⏸</span><span>Pause Story</span>' : '<span class="advisor-audio-icon" aria-hidden="true">▶</span><span>Auto Play Story</span>';
    journeyToggle.setAttribute('aria-label', journeyAutoplay ? 'Pause story' : 'Resume story');
    journeyToggle.setAttribute('aria-pressed', String(journeyAutoplay));
    journeyToggle.title = journeyAutoplay ? 'Pause story' : 'Resume story';
    journeyReplay.hidden = !journeyComplete;
    document.getElementById('journeyProgress').textContent = journeyStep < 0 ? '0 of 5' : `${journeyStep + 1} of 5`;
    if (currentPage === 6) document.getElementById('storyNextLabel').textContent = journeyComplete ? 'अब protection भी देखें' : 'Tap to reveal next benefit';
    journeyNext.disabled = false;
  }
  function renderJourneyStep() {
    const step = JOURNEY_STEPS[journeyStep];
    const detail = document.getElementById('journeyDetail');
    document.getElementById('journeyPptLabel').textContent = `${selectedSamplePpt} years`;
    journeyNodes.forEach((node, index) => {
      node.classList.toggle('is-active', index === journeyStep && !journeyComplete);
      node.classList.toggle('is-complete', journeyComplete || index < journeyStep);
      node.setAttribute('aria-current', index === journeyStep ? 'step' : 'false');
    });
    journeyPage.style.setProperty('--journey-progress', `${Math.max(0, journeyStep) * 25}%`);
    journeyPage.dataset.visual = step?.visual || 'intro';
    journeyPage.dataset.advisor = journeyStep >= 3 ? 'celebrate' : 'explain';
    renderJourneyIllustration();
    if (!step) { detail.innerHTML = '<p class="journey-detail-prompt">Your plan, in five clear steps.</p>'; updateJourneyControls(); return; }
    const ppt = selectedSamplePpt;
    const detailHtml = [
      `<span class="journey-detail-title">Choose Your PPT</span><strong>${ppt} years of premium payments</strong><small>Age ${selectedSampleAge} · ₹3,00,000 Sum Assured · 30-year term</small>`,
      `<span class="journey-detail-title">Guaranteed Additions Build</span><strong>Added during the ${ppt}-year PPT</strong><span class="journey-addition-bars" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>`,
      '<span class="journey-detail-title">Regular Income</span><strong class="journey-big-number">10% <em>of Basic Sum Assured</em></strong><b>₹30,000 / year</b><small>Starts at the end of PPT</small>',
      `<span class="journey-detail-title">70% Booster</span><strong>₹2,10,000</strong><small>Policy Year ${BOOSTER_YEAR_BY_PPT[ppt]} · Can be deferred under plan terms</small>`,
      '<span class="journey-detail-title">Maturity Benefit</span><strong>Basic Sum Assured +</strong><b>Accrued Guaranteed Additions</b><small>At the end of the 30-year policy term</small>'
    ];
    detail.innerHTML = detailHtml[journeyStep];
    updateJourneyControls();
  }
  // Brochure pp.6–7: base GA rate is ₹70 per ₹1,000 of cumulative
  // annualized premiums paid. ₹3 lakh BSA has no high-SA incentive (p.17).
  // These examples exclude additional eligibility-based incentives.
  function renderJourneyIllustration() {
    const visual = document.getElementById('journeyIllustration');
    const ppt = selectedSamplePpt;
    const premium = getLicSamplePremium(selectedSampleAge, ppt);
    const money = value => '₹' + Math.round(value).toLocaleString('en-IN');
    const additions = premium * .07 * ppt * (ppt + 1) / 2;
    const part = (content, index) => `<div class="journey-visual-part" style="--part:${index}">${content}</div>`;
    const visuals = [
      `<span class="journey-visual-label">Premium कितने साल?</span><div class="journey-ppt-comparison">${[7,10,12,15,18].map((years, i) => part(`<span class="journey-ppt-row ${years === ppt ? 'is-selected' : ''}"><b>${years}</b><i style="--term:${years / 18}"></i><small>years</small></span>`, i)).join('')}</div><strong>${money(premium)}<small> / year</small></strong><span class="journey-visual-note">Selected: ${ppt} years</span>`,
      `<span class="journey-visual-label">Guaranteed Additions</span><strong>7% <small>base rate</small></strong><span class="journey-visual-note">Cumulative premiums paid पर<br>हर साल, PPT तक</span><div class="journey-ga-chart" aria-label="Accrued additions grow during premium payments">${[1,2,3,4,5].map((n, i) => part(`<i style="--bar:${n * (n + 1) / 30}"></i>`, i)).join('')}</div><span class="journey-visual-note">Year 1 → Year ${ppt} · फिर accrual बंद</span>`,
      `<span class="journey-visual-label">हर साल Regular Income</span><strong>${money(30000)}</strong><span class="journey-visual-note">10% of ₹3,00,000</span><div class="journey-income-payments">${[ppt, ppt + 1, 29].map((year, i) => part(`<span>Year ${year}</span><b>↓ ${money(30000)}</b>`, i)).join('')}</div><span class="journey-visual-note">Year ${ppt} से Year 29 तक<br>बीच के हर साल भी</span>`,
      `<span class="journey-visual-label">एक अतिरिक्त Booster</span>${part('<strong class="journey-booster-number">70%</strong>', 0)}${part(`<strong>${money(210000)}</strong>`, 1)}${part(`<span class="journey-booster-year">Policy Year ${BOOSTER_YEAR_BY_PPT[ppt]}</span>`, 2)}<span class="journey-visual-note">₹3,00,000 का 70%<br>Defer कर सकते हैं, plan terms अनुसार</span>`,
      `<span class="journey-visual-label">Year 30 · Maturity</span>${part('<span class="journey-maturity-part">Basic SA <b>₹3,00,000</b></span>', 0)}${part(`<span class="journey-maturity-part">+ Accrued GA <b>${money(additions)}</b></span>`, 1)}${part(`<strong class="journey-maturity-total">${money(300000 + additions)}</strong>`, 2)}<span class="journey-visual-note">7% base GA · All premiums paid<br>Income / Booster अलग</span>`
    ];
    visual.innerHTML = journeyStep < 0 ? '' : visuals[journeyStep];
    visual.hidden = journeyStep < 0;
    journeyPage.dataset.paused = String(!journeyAutoplay || journeyComplete);
  }
  function completeJourney() {
    clearJourneyRun();
    journeyAutoplay = false;
    journeyComplete = true;
    renderJourneyStep();
  }
  function scheduleJourneyFallback(delay, generation) {
    if (!journeyAutoplay || currentPage !== 6) return;
    journeyMode = 'fallback';
    journeyRemaining = delay;
    journeyDeadline = Date.now() + delay;
    journeyTimer = setTimeout(() => {
      if (generation === journeyGeneration && currentPage === 6) advanceJourney();
    }, delay);
  }
  function advanceJourney() {
    if (journeyStep === JOURNEY_STEPS.length - 1) completeJourney();
    else startJourneyStep(journeyStep + 1);
  }
  function startJourneyStep(index, manual = false) {
    clearJourneyRun();
    journeyStep = index;
    journeyPage.dataset.manual = String(manual);
    journeyComplete = false;
    renderJourneyStep();
    if (currentPage !== 6) return;
    const generation = journeyGeneration;
    const step = JOURNEY_STEPS[index];
    const fallback = () => {
      if (generation !== journeyGeneration || currentPage !== 6 || journeyMode === 'fallback') return;
      clearTimeout(journeyLoadTimer);
      if (journeyAudio) { journeyAudio.pause(); journeyAudio = null; }
      journeyMode = 'fallback';
      scheduleJourneyFallback(step.fallbackDuration, generation);
    };
    journeyMode = 'loading';
    const audio = new Audio(step.audio);
    journeyAudio = audio;
    audio.addEventListener('ended', () => { if (generation === journeyGeneration && journeyAutoplay) advanceJourney(); });
    audio.addEventListener('error', fallback);
    journeyLoadTimer = setTimeout(fallback, 2200);
    audio.play().then(() => {
      if (generation !== journeyGeneration) { audio.pause(); return; }
      clearTimeout(journeyLoadTimer);
      journeyMode = 'audio';
      if (!journeyAutoplay && !manual) audio.pause();
    }).catch(fallback);
  }
  function pauseJourney() {
    journeyAutoplay = false;
    if (journeyAudio) journeyAudio.pause();
    if (journeyTimer) {
      journeyRemaining = Math.max(0, journeyDeadline - Date.now());
      clearTimeout(journeyTimer);
      journeyTimer = null;
    }
    updateJourneyControls();
  }
  function resumeJourney() {
    if (journeyComplete) { journeyAutoplay = true; startJourneyStep(0); return; }
    journeyAutoplay = true;
    if (journeyStep < 0) startJourneyStep(0);
    else if (journeyMode === 'audio' && journeyAudio) journeyAudio.play().catch(() => scheduleJourneyFallback(JOURNEY_STEPS[journeyStep].fallbackDuration, journeyGeneration));
    else if (journeyMode === 'fallback') scheduleJourneyFallback(journeyRemaining || JOURNEY_STEPS[journeyStep].fallbackDuration, journeyGeneration);
    updateJourneyControls();
  }

  function syncChart() {
    if (currentPage <= 3) {
      const duration = audioElement?.duration;
      const progress = chartComplete ? 1 : Number.isFinite(duration) && duration > 0
        ? Math.min(audioElement.currentTime / duration, 1) : 0;
      // Keep the completed earlier lines. Only the new allocation draws.
      const start = currentPage === 1 ? .03 : currentPage === 2 ? .16 : .1;
      const end = .9;
      const reveal = Math.max(0, Math.min((progress - start) / (end - start), 1));
      const focus = currentPage === 1 ? 'business' : currentPage === 2 ? 'market' : 'platinum';
      storyChart.setAttribute('data-focus', focus);
      storyChart.setAttribute('data-playback', playbackState);
      storyChart.style.setProperty('--narration-reveal', String(1 - reveal));
      storyChart.style.setProperty('--volatility-opacity', String(currentPage === 2 ? Math.sin(Math.PI * reveal) * .65 : 0));
      storyChart.setAttribute('data-settled', String(reveal === 1));
      businessEvents.forEach(event => {
        event.classList.toggle('is-visible', currentPage === 1 && reveal >= Number(event.dataset.reveal));
      });
      return;
    }
    let cue = null;
    if (audioElement && ['playing', 'paused'].includes(playbackState)) {
      for (const candidate of STORY_SCENES[currentPage].cues) {
        if (audioElement.currentTime >= candidate.start) cue = candidate;
      }
    }
    storyChart.setAttribute('data-focus', cue ? cue.focus : '');
    storyChart.setAttribute('data-playback', playbackState);
    // pathLength=1 already exists on all three original paths. Draw once per
    // spoken cue; pausing/seek/resume follows media time rather than a timer.
    const remaining = cue ? 1 - Math.min(Math.max(audioElement.currentTime - cue.start, 0) / 1.4, 1) : 0;
    storyChart.style.setProperty('--narration-reveal', String(remaining));
  }

  function followChartAudio() {
    if (chartFrame !== null) window.cancelAnimationFrame?.(chartFrame);
    chartFrame = null;
    syncChart();
    if (currentPage <= 3 && playbackState === 'playing') {
      chartFrame = window.requestAnimationFrame?.(followChartAudio) ?? null;
    }
  }

  function updateAudioUI(state) {
    playbackState = state;
    const label = state === 'playing' ? 'Pause audio' : state === 'paused' ? 'Resume audio' : state === 'loading' ? 'Loading audio…' : currentPage === 5 ? 'Hear Advisor' : 'Advisor की बात सुनें';
    for (const [button, text] of [[advisorAudioBtn, advisorAudioLabel], [sceneTwoDialogueBtn, sceneTwoAudioLabel]]) {
      text.textContent = label;
      button.setAttribute('aria-busy', String(state === 'loading'));
      button.setAttribute('aria-pressed', String(state === 'playing'));
      button.setAttribute('aria-label', `${state === 'playing' ? 'Pause' : state === 'paused' ? 'Resume' : 'Hear'} Scene ${currentPage} advisor recording`);
      button.classList.remove('is-playing', 'is-paused');
      if (state === 'playing') button.classList.add('is-playing');
      if (state === 'paused') button.classList.add('is-paused');
    }
    const icon = state === 'playing' ? '⏸' : state === 'loading' ? '…' : '▶';
    advisorAudioIcon.textContent = icon;
    document.getElementById('sceneTwoAudioIcon').textContent = icon;
    followChartAudio();
  }

  function stopAllAudio() {
    audioAttempt++;
    audioEvents?.abort();
    audioEvents = null;
    chartComplete = false;
    narrationComplete = false;
    playbackWanted = false;
    const previous = audioElement;
    audioElement = null; // Ignore late media events from the departing page.
    if (previous) { previous.pause(); previous.currentTime = 0; }
    updateAudioUI('idle');
    audioStatus.textContent = '';
    sceneTwoAudioStatus.textContent = '';
  }

  async function toggleAudioPlayback(continuation = null) {
    if (!STORY_SCENES[currentPage].src || playbackState === 'loading') return;
    if (playbackState === 'playing') { audioElement.pause(); return; }
    const attempt = ++audioAttempt;
    const page = currentPage;
    const status = page === 1 ? audioStatus : sceneTwoAudioStatus;
    status.textContent = '';
    playbackWanted = true;
    if (!audioElement) {
      const audio = continuation || new Audio(STORY_SCENES[page].src);
      if (continuation) audio.src = STORY_SCENES[page].src;
      audioElement = audio;
      const events = new AbortController();
      audioEvents = events;
      const listen = (event, handler) => audio.addEventListener(event, handler, {signal:events.signal});
      audio.preload = 'none';
      const isCurrent = () => audioElement === audio && audioEvents === events && currentPage === page && playbackWanted;
      listen('playing', () => { if (isCurrent()) updateAudioUI('playing'); });
      listen('pause', () => { if (isCurrent() && !audio.ended) updateAudioUI('paused'); });
      listen('ended', () => {
        if (!isCurrent()) return;
        playbackWanted = false;
        narrationComplete = true;
        if (page <= 3) chartComplete = true;
        audio.currentTime = 0;
        updateAudioUI('idle');
        if (automaticStory && page <= 4) showPage(page + 1, false, audio);
      });
      for (const event of ['timeupdate', 'seeked', 'loadedmetadata', 'durationchange']) listen(event, () => { if (isCurrent()) syncChart(); });
      listen('error', () => {
        if (!isCurrent()) return;
        playbackWanted = false;
        updateAudioUI('idle');
        status.textContent = 'इस scene की नई recording अभी जोड़नी है।';
      });
    }
    const audio = audioElement;
    narrationComplete = false;
    if (currentPage <= 3 && chartComplete) { chartComplete = false; audio.currentTime = 0; }
    updateAudioUI('loading');
    try {
      await audio.play();
      if (attempt !== audioAttempt && audioElement !== audio) { audio.pause(); audio.currentTime = 0; }
    } catch (error) {
      if (attempt !== audioAttempt) return;
      playbackWanted = false;
      updateAudioUI('idle');
      status.textContent = error.name === 'NotAllowedError' ? 'Audio सुनने के लिए play पर tap करें।' : 'इस scene की नई recording अभी जोड़नी है।';
    }
  }

  function showPage(page, focus = true, continuation = null) {
    if (!STORY_SCENES[page]) return;
    stopJourney();
    stopAllAudio();
    currentPage = page;
    if (STORY_ADVISORS[page]) {
      const presenter = document.getElementById('storyPresenter');
      presenter.src = STORY_ADVISORS[page];
      presenter.alt = page === 2 ? 'Advisor explaining fluctuations with a concerned expression' : 'Advisor introducing stability with a reassuring expression';
    }
    stageContainer.setAttribute('data-story-step', String(page));
    const isReveal = page === 4;
    const isDetails = page === 5;
    const isJourney = page === 6;
    document.getElementById('productReveal').hidden = !isReveal;
    document.getElementById('planDetailsPage').hidden = !isDetails;
    journeyPage.hidden = !isJourney;
    journeyControls.hidden = !isJourney;
    sceneTwoDialogueBtn.hidden = isJourney;
    document.getElementById('incomeNavBrand').hidden = !(isDetails || isJourney);
    document.getElementById('presenterChartHost').hidden = page >= 4;
    storyChart.hidden = page >= 4;
    document.getElementById('revealCtaIntro').hidden = !isReveal;

    storyChart.setAttribute('data-step', String(page));
    const host = document.getElementById(page === 1 ? 'sceneOneChartHost' : 'presenterChartHost');
    host.appendChild(storyChart); // Move the actual original figure; never clone paths.
    document.getElementById('balanceChartTitle').textContent = page === 1 ? 'Profit potential. Natural fluctuations.' : page === 2 ? 'Growth allocations' : 'Different roles for your savings';
    document.getElementById('balancePlotTitle').textContent = page === 1 ? 'Business growth engine' : page === 2 ? 'Business with added Share Market volatility' : 'Business growth with a stability bucket';
    document.getElementById('balancePlotDesc').textContent = page === 1
      ? 'Illustrative business income fluctuations. Expansion and economic growth may support income; competition, recession and war may reduce it. These are possible influences, not historical data or guaranteed outcomes.'
      : page === 2
        ? 'Business stays visible as a separate Share Market allocation adds another source of fluctuation. Neither asset is described as bad. Illustrative concept, not projected returns.'
        : 'Business and Share Market stay visible. A gently rising gold Stable Allocation adds stability to part of personal savings. Independent illustrative paths, not combined portfolio returns or projected performance.';
    document.getElementById('balanceChartCaption').textContent = page === 1
      ? 'Illustrative only · Possible influences, not guaranteed outcomes. Not historical data.'
      : 'Illustrative concept — not projected returns';
    firstScene.inert = page !== 1;
    stagePreviewModal.inert = page === 1;
    if (page === 1) {
      stagePreviewModal.classList.remove('active');
      stageContainer.classList.remove('scene-two-open');
      if (focus) ctaForwardBtn.focus();
    } else {
      stagePreviewModal.classList.add('active');
      stageContainer.classList.add('scene-two-open');
      document.getElementById('storyStageBadge').setAttribute('aria-label', `Scene ${page} of 10`);
      document.getElementById('storyStageCounter').textContent = `${page} / 10`;
      document.querySelector('.scene-two-nav').setAttribute('aria-label', `Scene ${page} navigation`);
      document.getElementById('storyProgress').style.width = `${page * 10}%`;
      document.getElementById('storyEyebrow').textContent = page === 2 ? 'GROWTH + VOLATILITY' : page === 3 ? 'GROWTH + STABILITY' : page === 4 ? 'THE STABILITY LAYER' : page === 5 ? 'REGULAR INCOME' : 'THE FIVE-STEP JOURNEY';
      const title = document.getElementById('stagePreviewTitle');
      title.textContent = page === 2 ? 'When everything fluctuates…' : page === 3 ? 'Add Stability' : page === 4 ? 'अब Growth के साथ Stability' : page === 5 ? 'How Bima Platinum Works' : 'How Bima Platinum Works';
      previewDismissBtn.setAttribute('aria-label', `Back to Scene ${page - 1}`);
      journeyNext.hidden = false;
      document.getElementById('storyNextLabel').textContent = page === 2 ? 'अब Stability कैसे मिलेगी?' : page === 3 ? 'Stability का अगला कदम' : page === 4 ? 'Plan समझें' : page === 5 ? 'See How It Works' : 'अब protection भी देखें';
      sceneThreeStatus.hidden = true;
      stagePreviewModal.scrollTop = 0;
      if (focus) previewDismissBtn.focus();
      if (isJourney) {
        journeyAutoplay = true;
        renderJourneyStep();
        const generation = journeyGeneration;
        journeyTimer = setTimeout(() => { if (generation === journeyGeneration && currentPage === 6) startJourneyStep(0); }, 700);
      } else journeyNext.disabled = false;
    }
    advisorAudioBtn.title = STORY_SCENES[1].script;
    sceneTwoDialogueBtn.title = STORY_SCENES[page].script;
    updateAudioUI('idle');
    if (!isJourney) toggleAudioPlayback(continuation);
  }

  function updateStoryMode() {
    storyModeButtons.forEach(button => {
      button.textContent = automaticStory ? 'Auto' : 'Manual';
      button.setAttribute('aria-pressed', String(automaticStory));
      button.setAttribute('aria-label', automaticStory ? 'Automatic scene progression enabled. Switch to manual.' : 'Manual scene progression enabled. Switch to automatic.');
    });
  }
  storyModeButtons.forEach(button => button.addEventListener('click', () => {
    automaticStory = !automaticStory;
    updateStoryMode();
    if (automaticStory && currentPage <= 4 && narrationComplete) showPage(currentPage + 1, false, audioElement);
  }));
  updateStoryMode();
  advisorAudioBtn.addEventListener('click', () => toggleAudioPlayback());
  sceneTwoDialogueBtn.addEventListener('click', () => toggleAudioPlayback());
  journeyNodes.forEach(node => node.addEventListener('click', () => startJourneyStep(Number(node.dataset.journeyStep), true)));
  journeyToggle.addEventListener('click', () => journeyAutoplay ? pauseJourney() : resumeJourney());
  journeyReplay.addEventListener('click', () => { journeyAutoplay = true; startJourneyStep(0); });
  ctaForwardBtn.addEventListener('click', () => showPage(2));
  previewDismissBtn.addEventListener('click', () => showPage(currentPage - 1));
  journeyNext.addEventListener('click', () => {
    if (currentPage >= 2 && currentPage < 6) showPage(currentPage + 1);
    else if (currentPage === 6 && !journeyComplete) advanceJourney();
    else if (currentPage === 6) { sceneThreeStatus.textContent = 'Protection page is coming next.'; sceneThreeStatus.hidden = false; }
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { stopAllAudio(); if (currentPage === 6) pauseJourney(); } });
  window.addEventListener('pagehide', () => { stopAllAudio(); stopJourney(); });
  showPage(1, false);

  // Developer Tooling: Layer Inspector
  const urlParams = new URLSearchParams(window.location.search);
  const isDevMode = urlParams.has('dev') || window.location.hash === '#dev';
  if (isDevMode) {
    document.body.classList.add('dev-mode');
  }

  if (inspectorFab && inspectorPanel) {
    inspectorFab.addEventListener('click', () => {
      inspectorPanel.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
      if (!inspectorPanel.contains(e.target) && !inspectorFab.contains(e.target)) {
        inspectorPanel.classList.remove('active');
      }
    });
  }

  // Toggle individual layers live
  layerCheckboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      const targetLayerId = cb.dataset.target;
      const layerEl = document.getElementById(targetLayerId);
      if (layerEl) {
        layerEl.classList.toggle('layer-hidden', !cb.checked);
      }
    });
  });

  // Toggle 3D Exploded Layer Mode
  if (toggle3DExploded) {
    toggle3DExploded.addEventListener('click', () => {
      stageContainer.classList.toggle('exploded-view');
      const isExploded = stageContainer.classList.contains('exploded-view');
      toggle3DExploded.textContent = isExploded ? '📐 Normal View' : '✨ 3D Exploded Layers';
    });
  }

  // Toggle Mobile Frame vs Fullscreen Edge-to-Edge
  if (toggleDeviceFrame) {
    toggleDeviceFrame.addEventListener('click', () => {
      deviceFrame.classList.toggle('mode-fullscreen');
      const isFull = deviceFrame.classList.contains('mode-fullscreen');
      toggleDeviceFrame.textContent = isFull ? '📱 Mobile Frame Mode' : '🖥️ Fullscreen Edge-to-Edge';
    });
  }

  // Secret triple-click on stage indicator (1 / 10) to toggle dev mode
  let clickCount = 0;
  const stageBadge = document.querySelector('.nav-stage-badge');
  if (stageBadge) {
    stageBadge.addEventListener('click', () => {
      clickCount++;
      if (clickCount >= 3) {
        document.body.classList.toggle('dev-mode');
        if (inspectorPanel) inspectorPanel.classList.toggle('active');
        clickCount = 0;
      }
      setTimeout(() => { clickCount = 0; }, 1000);
    });
  }

  // Keyboard navigation & accessibility
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab' && stagePreviewModal.classList.contains('active')) {
      const focusable = Array.from(stagePreviewModal.querySelectorAll('button, a[href], iframe')).filter(el => !el.hidden && !el.closest('[hidden]'));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    } else if (e.key === 'Escape') {
      stopAllAudio();
      if (inspectorPanel) inspectorPanel.classList.remove('active');
      if (currentPage > 1) showPage(currentPage - 1);
    } else if (e.key === ' ' && document.activeElement === document.body && !stagePreviewModal.classList.contains('active')) {
      // Spacebar toggles audio
      e.preventDefault();
      toggleAudioPlayback();
    } else if (e.key === 'd' || e.key === 'D') {
      // Toggle developer mode
      if (!['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        document.body.classList.toggle('dev-mode');
        if (inspectorPanel) inspectorPanel.classList.toggle('active');
      }
    }
  });
});
