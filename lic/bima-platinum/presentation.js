/** LIC Bima Platinum: existing chart story and a focused product reveal. */
// New recordings use new paths so the older scripts are never played by mistake.
// Add the supplied recordings here, then tune cue times to their spoken phrases.
const STORY_SCENES = {
  1: {
    src: 'assets/audio/advisor-story-1-hindi.mp3',
    script: 'आपका business ही आपका main growth engine है। यहीं से आपकी income और wealth grow होती है।',
    cues: [{ start: 0, focus: 'business' }]
  },
  2: {
    src: 'assets/audio/advisor-story-2-hindi.mp3',
    script: 'Business में पैसा लगाइए growth के लिए। लेकिन अगर आपकी बाकी savings भी Share Market में जाएँ, तो overall volatility और बढ़ जाती है।',
    // Provisional boundary: replace 3.2 with the start of “लेकिन” in the new MP3.
    cues: [{ start: 0, focus: 'business' }, { start: 3.2, focus: 'market' }]
  },
  3: {
    src: 'assets/audio/advisor-story-3-hindi.mp3',
    script: 'इसलिए अपनी personal savings का एक हिस्सा stability के लिए अलग रखिए। एक stable या guaranteed structure आपके overall finances में predictability जोड़ता है।',
    cues: [{ start: 0, focus: 'platinum' }]
  },
  4: {
    src: 'assets/audio/page4-advisor.mp3',
    script: 'यहीं Bima Platinum आपकी financial journey में stability जोड़ता है। यह आपके portfolio के एक हिस्से को guaranteed और predictable structure देने के लिए बनाया गया है।',
    cues: []
  },
  5: { src: 'assets/audio/page5-advisor.mp3', script: 'इस उदाहरण में Basic Sum Assured तीन लाख रुपये है। इसका दस प्रतिशत, यानी तीस हज़ार रुपये, हर साल Regular Income के रूप में मिलता है। पहला भुगतान चुने हुए Premium Paying Term के अंत में शुरू होता है, policy की शर्तों के अनुसार।', cues: [] },
  // Existing detailed examples remain available after the compact income page.
  6: { src: null, script: '', cues: [] }
};

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
    document.getElementById('incomePayoutStart').textContent = `From end of Year ${selectedSamplePpt}`;
    document.getElementById('incomeFirstPayment').textContent = `First payment: end of Year ${selectedSamplePpt}`;
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
  let audioElement = null;
  let audioAttempt = 0;
  let playbackWanted = false;
  let playbackState = 'idle';

  function syncChart() {
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

  function updateAudioUI(state) {
    playbackState = state;
    const label = state === 'playing' ? 'Pause audio' : state === 'paused' ? 'Resume audio' : state === 'loading' ? 'Loading audio…' : currentPage === 5 ? 'Hear Advisor' : 'Advisor की बात सुनें';
    for (const [button, text] of [[advisorAudioBtn, advisorAudioLabel], [sceneTwoDialogueBtn, sceneTwoAudioLabel]]) {
      text.textContent = label;
      button.setAttribute('aria-busy', String(state === 'loading'));
      button.setAttribute('aria-label', `${state === 'playing' ? 'Pause' : state === 'paused' ? 'Resume' : 'Hear'} Scene ${currentPage} advisor recording`);
      button.classList.remove('is-playing', 'is-paused');
      if (state === 'playing') button.classList.add('is-playing');
      if (state === 'paused') button.classList.add('is-paused');
    }
    advisorAudioIcon.textContent = state === 'playing' ? '⏸' : '▶';
    syncChart();
  }

  function stopAllAudio() {
    audioAttempt++;
    playbackWanted = false;
    const previous = audioElement;
    audioElement = null; // Ignore late media events from the departing page.
    if (previous) { previous.pause(); previous.currentTime = 0; }
    updateAudioUI('idle');
    audioStatus.textContent = '';
    sceneTwoAudioStatus.textContent = '';
  }

  async function toggleAudioPlayback() {
    if (!STORY_SCENES[currentPage].src || playbackState === 'loading') return;
    if (playbackState === 'playing') { audioElement.pause(); return; }
    const attempt = ++audioAttempt;
    const page = currentPage;
    const status = page === 1 ? audioStatus : sceneTwoAudioStatus;
    status.textContent = '';
    playbackWanted = true;
    if (!audioElement) {
      const audio = new Audio(STORY_SCENES[page].src);
      audioElement = audio;
      audio.preload = 'none';
      const isCurrent = () => audioElement === audio && currentPage === page && playbackWanted;
      audio.addEventListener('playing', () => { if (isCurrent()) updateAudioUI('playing'); });
      audio.addEventListener('pause', () => { if (isCurrent() && !audio.ended) updateAudioUI('paused'); });
      audio.addEventListener('ended', () => {
        if (!isCurrent()) return;
        playbackWanted = false;
        audio.currentTime = 0;
        updateAudioUI('idle');
      });
      for (const event of ['timeupdate', 'seeked']) audio.addEventListener(event, () => { if (isCurrent()) syncChart(); });
      audio.addEventListener('error', () => {
        if (!isCurrent()) return;
        playbackWanted = false;
        updateAudioUI('idle');
        status.textContent = 'इस scene की नई recording अभी जोड़नी है।';
      });
    }
    const audio = audioElement;
    updateAudioUI('loading');
    try {
      await audio.play();
      if (attempt !== audioAttempt) { audio.pause(); audio.currentTime = 0; }
    } catch (error) {
      if (attempt !== audioAttempt) return;
      playbackWanted = false;
      updateAudioUI('idle');
      status.textContent = error.name === 'NotAllowedError' ? 'Audio के लिए दोबारा tap करें।' : 'इस scene की नई recording अभी जोड़नी है।';
    }
  }

  function showPage(page, focus = true) {
    if (!STORY_SCENES[page]) return;
    stopAllAudio();
    currentPage = page;
    stageContainer.setAttribute('data-story-step', String(page));
    const isReveal = page === 4;
    const isDetails = page === 5;
    const isMoreBenefits = page === 6;
    document.getElementById('productReveal').hidden = !isReveal;
    document.getElementById('planDetailsPage').hidden = !isDetails;
    document.getElementById('moreBenefitsPage').hidden = !isMoreBenefits;
    document.getElementById('incomeNavBrand').hidden = !isDetails;
    document.getElementById('presenterChartHost').hidden = page >= 4;
    storyChart.hidden = page >= 4;
    document.getElementById('revealCtaIntro').hidden = !isReveal;
    document.querySelector('.scene-two-footer').hidden = isMoreBenefits;
    if (isMoreBenefits) {
      const frame = document.getElementById('planDetailsFrame');
      if (!frame.getAttribute('src')) frame.setAttribute('src', 'calculator.html#optionDetail');
    }

    storyChart.setAttribute('data-step', String(page));
    const host = document.getElementById(page === 1 ? 'sceneOneChartHost' : 'presenterChartHost');
    host.appendChild(storyChart); // Move the actual original figure; never clone paths.
    document.getElementById('balanceChartTitle').textContent = page === 1 ? 'Business · Growth engine' : page === 2 ? 'Business + Share Market' : 'Business + Stability';
    document.getElementById('balancePlotTitle').textContent = page === 1 ? 'Business growth engine' : page === 2 ? 'Business with added Share Market volatility' : 'Business growth with a stability bucket';
    document.getElementById('balancePlotDesc').textContent = page === 1
      ? 'The blue Business line is the growth engine. Other paths are not introduced yet. Illustrative concept, not projected returns.'
      : page === 2
        ? 'The blue Business line stays visible. The red Business plus Share Market path has sharp peaks and dips below the business baseline. Illustrative concept, not projected returns.'
        : 'The blue Business line stays visible alongside a smoother green Business plus Stability path. Illustrative concept, not projected returns.';
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
      document.getElementById('storyEyebrow').textContent = page === 2 ? 'GROWTH + VOLATILITY' : page === 3 ? 'GROWTH + STABILITY' : page === 4 ? 'THE STABILITY LAYER' : page === 5 ? 'REGULAR INCOME' : 'DETAILED EXAMPLES';
      const title = document.getElementById('stagePreviewTitle');
      title.textContent = page === 2 ? 'Savings भी risk में?' : page === 3 ? 'Business से growth, savings से stability' : page === 4 ? 'अब Growth के साथ Stability' : page === 5 ? 'How Bima Platinum Works' : 'More Benefits';
      previewDismissBtn.setAttribute('aria-label', `Back to Scene ${page - 1}`);
      document.getElementById('sceneTwoNextBtn').hidden = isMoreBenefits;
      document.getElementById('storyNextLabel').textContent = page === 2 ? 'अब Stability कैसे मिलेगी?' : page === 3 ? 'Stability का अगला कदम' : page === 4 ? 'Plan समझें' : 'See More Benefits';
      sceneThreeStatus.hidden = true;
      stagePreviewModal.scrollTop = 0;
      if (focus) previewDismissBtn.focus();
    }
    advisorAudioBtn.title = STORY_SCENES[1].script;
    sceneTwoDialogueBtn.title = STORY_SCENES[page].script;
    updateAudioUI('idle');
  }

  advisorAudioBtn.addEventListener('click', toggleAudioPlayback);
  sceneTwoDialogueBtn.addEventListener('click', toggleAudioPlayback);
  ctaForwardBtn.addEventListener('click', () => showPage(2));
  previewDismissBtn.addEventListener('click', () => showPage(currentPage - 1));
  document.getElementById('sceneTwoNextBtn').addEventListener('click', () => { if (currentPage >= 2 && currentPage < 6) showPage(currentPage + 1); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopAllAudio(); });
  window.addEventListener('pagehide', stopAllAudio);
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
