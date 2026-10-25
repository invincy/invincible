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
  src: 'assets/audio/advisor-scene-1-gujarati.mp3',
  // Spoken Gujarati dialogue script
  script: 'તમારો business already growth potential આપે છે. Customers વધે, sales વધે, expansion થાય — તો returns પણ મોટા થઈ શકે. પણ જ્યાં growth હોય ત્યાં risk પણ હોય. એટલે તમારી personal savings નો દરેક રૂપિયા ફરી risk માં જવાની જરૂર નથી.',
  // Fallback Web Speech settings
  fallbackLang: 'gu-IN',
  fallbackRate: 0.95
};

document.addEventListener('DOMContentLoaded', () => {
  // Core DOM Elements
  const stageContainer = document.getElementById('stageContainer');
  const deviceFrame = document.getElementById('deviceFrame');
  const stagePreviewModal = document.getElementById('stagePreviewModal');
  const previewDismissBtn = document.getElementById('previewDismissBtn');
  const ctaForwardBtn = document.getElementById('ctaForwardBtn');
  const calloutCard = document.getElementById('calloutCard');

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
  let audioElement = null;
  let useSpeechFallback = false;
  let playbackState = 'idle'; // 'idle' | 'playing' | 'paused'

  function updateAudioUI(state) {
    playbackState = state;
    if (!advisorAudioBtn) return;

    advisorAudioBtn.classList.remove('is-playing', 'is-paused');

    if (state === 'playing') {
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
    if (!('speechSynthesis' in window)) {
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
    audioElement.preload = 'auto';

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

    audioElement.addEventListener('error', () => {
      // Local MP3 not placed yet or load error -> transparently use Web Speech API
      useSpeechFallback = true;
      audioElement = null;
      playSpeechFallback();
    });

    return audioElement;
  }

  function toggleAudioPlayback() {
    if (playbackState === 'playing') {
      // Currently playing -> Pause
      if (audioElement && !useSpeechFallback) {
        audioElement.pause();
      } else if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        updateAudioUI('paused');
      }
    } else if (playbackState === 'paused') {
      // Currently paused -> Resume
      if (audioElement && !useSpeechFallback) {
        audioElement.play().catch(() => {
          useSpeechFallback = true;
          playSpeechFallback();
        });
      } else if ('speechSynthesis' in window) {
        playSpeechFallback();
      }
    } else {
      // Currently idle -> Start from beginning
      if (useSpeechFallback) {
        playSpeechFallback();
      } else {
        const audio = initAudioElement();
        const promise = audio.play();
        if (promise !== undefined) {
          promise.catch(() => {
            useSpeechFallback = true;
            playSpeechFallback();
          });
        }
      }
    }
  }

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
      stagePreviewModal.classList.add('active');
    });
  }

  if (calloutCard) {
    calloutCard.addEventListener('click', () => {
      stopAllAudio();
      stagePreviewModal.classList.add('active');
    });
  }

  if (previewDismissBtn) {
    previewDismissBtn.addEventListener('click', () => {
      stagePreviewModal.classList.remove('active');
    });
  }

  if (stagePreviewModal) {
    stagePreviewModal.addEventListener('click', (e) => {
      if (e.target === stagePreviewModal) {
        stagePreviewModal.classList.remove('active');
      }
    });
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
    if (e.key === 'Escape') {
      stopAllAudio();
      if (inspectorPanel) inspectorPanel.classList.remove('active');
      stagePreviewModal.classList.remove('active');
    } else if (e.key === ' ' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
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
