/**
 * LIC Bima Platinum · Phase 1 Mobile Presentation App
 * Client State & Interactive Layer Management
 * 
 * Phase 1 Purpose:
 * "The customer's business already gives him growth potential, but business also carries risk.
 * Therefore his personal money does not need to chase risk everywhere."
 * 
 * The female LIC advisor is the only speaker in Phase 1.
 * Businessman is visually present in the boutique background, but does NOT speak.
 */

// Audio Configuration (Easily replaceable for local professional MP3 with Web Speech fallback)
const AUDIO_CONFIG = {
  // Local audio path (when placed)
  src: 'assets/audio/advisor-scene-1-hindi.mp3',
  // Spoken Hindi dialogue script
  script: 'आपके business में पहले से ही काफी growth potential है। Customers बढ़ें, sales बढ़ें और expansion हो — तो returns भी बड़े हो सकते हैं। लेकिन business में growth के साथ risk भी रहता है। इसलिए आपकी personal savings का हर रुपया दोबारा risk में डालना ज़रूरी नहीं है।',
  // Fallback Web Speech settings
  enableBrowserSpeech: false, // Enable only after verifying the device's Hindi voice.
  fallbackLang: 'hi-IN',
  fallbackRate: 0.95
};

document.addEventListener('DOMContentLoaded', () => {
  // Core DOM Elements
  const stageContainer = document.getElementById('stageContainer');
  const deviceFrame = document.getElementById('deviceFrame');
  const stagePreviewModal = document.getElementById('stagePreviewModal');
  const previewDismissBtn = document.getElementById('previewDismissBtn');
  const ctaForwardBtn = document.getElementById('ctaForwardBtn');

  // Advisor Audio Interaction Control
  const advisorAudioBtn = document.getElementById('advisorAudioBtn');
  const advisorAudioIcon = document.getElementById('advisorAudioIcon');
  const advisorAudioLabel = document.getElementById('advisorAudioLabel');

  // Developer Tooling: Layer Inspector
  const inspectorFab = document.getElementById('inspectorFab');
  const inspectorPanel = document.getElementById('inspectorPanel');
  const toggle3DExploded = document.getElementById('toggle3DExploded');
  const toggleDeviceFrame = document.getElementById('toggleDeviceFrame');
  const layerCheckboxes = document.querySelectorAll('.layer-toggle-input');

  // Audio Playback Engine State
  let sceneTwoAudio = null;
  let sceneTwoAttempt = 0;
  let sceneTwoState = 'idle';
  const sceneTwoAudioLabel = document.getElementById('sceneTwoAudioLabel');
  const sceneTwoAudioStatus = document.getElementById('sceneTwoAudioStatus');
  const sceneTwoDialogueBtn = document.getElementById('sceneTwoDialogueBtn');
  function updateSceneTwoAudio(state) {
    sceneTwoState = state;
    if (sceneTwoAudioLabel) sceneTwoAudioLabel.textContent = state === 'playing' ? 'Pause audio' : state === 'paused' ? 'Resume audio' : state === 'loading' ? 'Loading audio…' : 'Advisor की बात सुनें';
    if (sceneTwoDialogueBtn) {
      sceneTwoDialogueBtn.setAttribute('aria-busy', String(state === 'loading'));
      sceneTwoDialogueBtn.setAttribute('aria-label', state === 'playing' ? 'Pause Scene 2 advisor recording' : state === 'paused' ? 'Resume Scene 2 advisor recording' : 'Hear Scene 2 advisor recording');
    }
  }
  function stopSceneTwoAudio() {
    sceneTwoAttempt++;
    if (sceneTwoAudio) { sceneTwoAudio.pause(); sceneTwoAudio.currentTime = 0; }
    updateSceneTwoAudio('idle');
  }
  let audioElement = null;
  let useSpeechFallback = false;
  let audioAttempt = 0;
  const audioStatus = document.getElementById('audioStatus');
  let playbackState = 'idle'; // 'idle' | 'playing' | 'paused'

  function updateAudioUI(state) {
    playbackState = state;
    if (!advisorAudioBtn) return;

    advisorAudioBtn.classList.remove('is-playing', 'is-paused');

    advisorAudioBtn.setAttribute('aria-busy', String(state === 'loading'));
    if (state === 'loading') {
      advisorAudioLabel.textContent = 'Loading audio…';
    } else if (state === 'playing') {
      advisorAudioBtn.classList.add('is-playing');
      if (advisorAudioIcon) advisorAudioIcon.textContent = '⏸️';
      if (advisorAudioLabel) advisorAudioLabel.textContent = 'Pause Audio';
      advisorAudioBtn.setAttribute('aria-label', 'Pause Advisor Audio');
    } else if (state === 'paused') {
      advisorAudioBtn.classList.add('is-paused');
      if (advisorAudioIcon) advisorAudioIcon.textContent = '▶️';
      if (advisorAudioLabel) advisorAudioLabel.textContent = 'Resume Audio';
      advisorAudioBtn.setAttribute('aria-label', 'Resume Advisor Audio');
    } else {
      // idle state
      if (advisorAudioIcon) advisorAudioIcon.textContent = '🔊';
      if (advisorAudioLabel) advisorAudioLabel.textContent = 'Hear Advisor';
      advisorAudioBtn.setAttribute('aria-label', 'Hear Advisor Perspective');
    }
  }

  function stopAllAudio() {
    stopSceneTwoAudio();
    audioAttempt++;
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    updateAudioUI('idle');
  }

  function playSpeechFallback() {
    if (!AUDIO_CONFIG.enableBrowserSpeech || !('speechSynthesis' in window)) {
      if (audioStatus) audioStatus.textContent = 'Hindi advisor recording coming soon.';
      updateAudioUI('idle');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(AUDIO_CONFIG.script);
    utterance.lang = AUDIO_CONFIG.fallbackLang;
    utterance.rate = AUDIO_CONFIG.fallbackRate;

    utterance.onstart = () => updateAudioUI('playing');
    utterance.onend = () => updateAudioUI('idle');
    utterance.onerror = () => updateAudioUI('idle');

    window.speechSynthesis.speak(utterance);
  }

  function initAudioElement() {
    if (audioElement) return audioElement;

    audioElement = new Audio(AUDIO_CONFIG.src);
    audioElement.preload = 'none';

    audioElement.addEventListener('playing', () => {
      useSpeechFallback = false;
      updateAudioUI('playing');
    });

    audioElement.addEventListener('pause', () => {
      if (audioElement.currentTime > 0 && !audioElement.ended) {
        updateAudioUI('paused');
      }
    });

    audioElement.addEventListener('ended', () => {
      updateAudioUI('idle');
      audioElement.currentTime = 0;
    });

    return audioElement;
  }

  async function toggleAudioPlayback() {
    if (playbackState === 'loading') return;
    if (playbackState === 'playing') {
      if (useSpeechFallback) {
        window.speechSynthesis.pause();
        updateAudioUI('paused');
      } else {
        audioElement.pause();
      }
      return;
    }
    if (useSpeechFallback) {
      if (playbackState === 'paused') {
        window.speechSynthesis.resume();
        updateAudioUI('playing');
      } else {
        playSpeechFallback();
      }
      return;
    }
    const attempt = ++audioAttempt;
    if (audioStatus) audioStatus.textContent = '';
    updateAudioUI('loading');
    try {
      await initAudioElement().play();
      if (attempt !== audioAttempt) audioElement.pause();
    } catch (error) {
      if (attempt !== audioAttempt) return;
      updateAudioUI('idle');
      if (error.name === 'NotAllowedError') {
        if (audioStatus) audioStatus.textContent = 'Tap again to allow audio playback.';
      } else if (AUDIO_CONFIG.enableBrowserSpeech) {
        useSpeechFallback = true;
        playSpeechFallback();
      } else if (audioStatus) {
        audioStatus.textContent = 'Hindi advisor recording coming soon.';
      }
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAllAudio();
  });
  window.addEventListener('pagehide', stopAllAudio);

  if (advisorAudioBtn) {
    advisorAudioBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleAudioPlayback();
    });
  }

  // Forward CTA & Stage 2 Transition Action
  if (ctaForwardBtn) {
    ctaForwardBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      stopAllAudio();
      const firstScene = document.querySelector('.layer-stage-3d');
      if (firstScene) firstScene.inert = true;
      stagePreviewModal.inert = false;
      stagePreviewModal.classList.add('active');
      stageContainer.classList.add('scene-two-open');
      previewDismissBtn.focus();
    });
  }

  function dismissPreview() {
    stopSceneTwoAudio();
    stageContainer.classList.remove('scene-two-open');
    stagePreviewModal.classList.remove('active');
    stagePreviewModal.inert = true;
    const firstScene = document.querySelector('.layer-stage-3d');
    if (firstScene) firstScene.inert = false;
    ctaForwardBtn.focus();
  }

  if (previewDismissBtn) {
    previewDismissBtn.addEventListener('click', () => {
      dismissPreview();
    });
  }

  if (stagePreviewModal) {
    stagePreviewModal.addEventListener('click', (e) => {
      if (e.target === stagePreviewModal) {
        dismissPreview();
      }
    });
  }

  if (sceneTwoDialogueBtn) {
    sceneTwoDialogueBtn.addEventListener('click', async () => {
      if (sceneTwoState === 'loading') return;
      if (sceneTwoState === 'playing') { sceneTwoAudio.pause(); return; }
      const attempt = ++sceneTwoAttempt;
      if (sceneTwoAudioStatus) sceneTwoAudioStatus.textContent = '';
      if (!sceneTwoAudio) {
        sceneTwoAudio = new Audio('assets/audio/advisor-scene-2-hindi.mp3');
        sceneTwoAudio.preload = 'none';
        sceneTwoAudio.addEventListener('playing', () => updateSceneTwoAudio('playing'));
        sceneTwoAudio.addEventListener('pause', () => {
          if (sceneTwoAudio.currentTime > 0 && !sceneTwoAudio.ended) updateSceneTwoAudio('paused');
        });
        sceneTwoAudio.addEventListener('ended', () => { sceneTwoAudio.currentTime = 0; updateSceneTwoAudio('idle'); });
      }
      updateSceneTwoAudio('loading');
      try {
        await sceneTwoAudio.play();
        if (attempt !== sceneTwoAttempt) { sceneTwoAudio.pause(); sceneTwoAudio.currentTime = 0; updateSceneTwoAudio('idle'); }
      } catch (error) {
        if (attempt !== sceneTwoAttempt) return;
        updateSceneTwoAudio('idle');
        if (sceneTwoAudioStatus) sceneTwoAudioStatus.textContent = error.name === 'NotAllowedError' ? 'Tap again to allow audio playback.' : 'Audio load नहीं हुआ। फिर tap करें।';
      }
    });
  }
  const sceneTwoNextBtn = document.getElementById('sceneTwoNextBtn');
  const sceneThreeStatus = document.getElementById('sceneThreeStatus');
  if (sceneTwoNextBtn && sceneThreeStatus) {
    sceneTwoNextBtn.addEventListener('click', () => { stopSceneTwoAudio(); sceneThreeStatus.hidden = false; });
  }

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
      const focusable = Array.from(stagePreviewModal.querySelectorAll('button, a[href]'));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    } else if (e.key === 'Escape') {
      stopAllAudio();
      if (inspectorPanel) inspectorPanel.classList.remove('active');
      dismissPreview();
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
