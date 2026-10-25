/**
 * LIC Bima Platinum · Phase 1 Mobile Presentation App
 * Client State & Interactive Layer Management
 * Focus: Make the prospect agree that his business is his growth engine.
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const stageContainer = document.getElementById('stageContainer');
  const deviceFrame = document.getElementById('deviceFrame');
  const bottomSheetBackdrop = document.getElementById('bottomSheetBackdrop');
  const bottomSheetPanel = document.getElementById('bottomSheetPanel');
  const sheetCloseBtn = document.getElementById('sheetCloseBtn');
  const stagePreviewModal = document.getElementById('stagePreviewModal');
  const previewDismissBtn = document.getElementById('previewDismissBtn');

  // Pill Buttons
  const pillGrowth = document.getElementById('pillGrowth');
  const pillOpportunity = document.getElementById('pillOpportunity');
  const pillControl = document.getElementById('pillControl');
  const pills = [pillGrowth, pillOpportunity, pillControl];

  // Advisor Interaction & Audio (Advisor speaks; Businessman visually present but silent)
  const advisorAudioTrigger = document.getElementById('advisorAudioTrigger');
  const bubbleAdvisor = document.getElementById('bubbleAdvisor');
  const closeBubbleAdvisor = document.getElementById('closeBubbleAdvisor');
  const audioBtnAdvisor = document.getElementById('audioBtnAdvisor');

  // Inspector Elements (Developer Tooling)
  const inspectorFab = document.getElementById('inspectorFab');
  const inspectorPanel = document.getElementById('inspectorPanel');
  const toggle3DExploded = document.getElementById('toggle3DExploded');
  const toggleDeviceFrame = document.getElementById('toggleDeviceFrame');
  const layerCheckboxes = document.querySelectorAll('.layer-toggle-input');

  // Forward Action CTA
  const ctaForwardBtn = document.getElementById('ctaForwardBtn');
  const calloutCard = document.getElementById('calloutCard');

  // Content Data for Bottom Sheet (Focus purely on Business Strength & Ownership)
  const topicData = {
    growth: {
      badge: '🌱 BUSINESS PILLAR · GROWTH',
      title: 'Growth',
      shortLine: 'વધુ earning potential',
      expanded: 'Scale કરો, expand કરો અને profits grow કરો.',
      secondary: 'તમારા business માં earning potential ઘણું મોટું હોઈ શકે છે.',
      quote: '“Business scale કરો, expand કરો અને profits grow કરો — earning potential તમારા હાથમાં છે.”'
    },
    opportunity: {
      badge: '💡 BUSINESS PILLAR · OPPORTUNITY',
      title: 'Opportunity',
      shortLine: 'Value create કરવાની freedom',
      expanded: 'New customers, products અને markets.',
      secondary: 'Business તમને નવી value અને opportunities create કરવાની પૂરી freedom આપે છે.',
      quote: '“નવા ગ્રાહકો, પ્રોડક્ટ્સ અને બજારો નવી તકોનું નિર્માણ કરે છે.”'
    },
    control: {
      badge: '🎛️ BUSINESS PILLAR · CONTROL',
      title: 'Control',
      shortLine: 'Decision તમારા હાથમાં',
      expanded: 'Pricing, stock, expansion અને direction તમે decide કરો છો.',
      secondary: 'તમારા બિઝનેસના દરેક મહત્વપૂર્ણ નિર્ણય પર તમારો પૂર્ણ કંટ્રોલ છે.',
      quote: '“કિંમત, સ્ટોક અને બિઝનેસની દિશા — દરેક મહત્વનો નિર્ણય તમારો પોતાનો છે.”'
    }
  };

  // State
  let currentTopic = 'growth';

  // --- Bottom Sheet Controls ---
  function openBottomSheet(topicKey) {
    currentTopic = topicKey || 'growth';
    renderSheetContent(currentTopic);

    // Update active pill styling
    pills.forEach(pill => pill.classList.remove('active'));
    if (topicKey === 'growth') pillGrowth.classList.add('active');
    if (topicKey === 'opportunity') pillOpportunity.classList.add('active');
    if (topicKey === 'control') pillControl.classList.add('active');

    // Update sheet tab styling
    document.querySelectorAll('.sheet-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === currentTopic);
    });

    bottomSheetBackdrop.classList.add('active');
    bottomSheetPanel.classList.add('active');
  }

  function closeBottomSheet() {
    bottomSheetBackdrop.classList.remove('active');
    bottomSheetPanel.classList.remove('active');
    pills.forEach(pill => pill.classList.remove('active'));
  }

  function renderSheetContent(topicKey) {
    const data = topicData[topicKey] || topicData.growth;
    document.getElementById('sheetBadge').textContent = data.badge;
    document.getElementById('sheetTitle').textContent = data.title;
    document.getElementById('sheetShortLine').textContent = data.shortLine;
    document.getElementById('sheetExpanded').textContent = data.expanded;
    document.getElementById('sheetSecondary').textContent = data.secondary;
    document.getElementById('sheetQuoteText').textContent = data.quote;
  }

  // Pill click listeners
  pillGrowth.addEventListener('click', () => openBottomSheet('growth'));
  pillOpportunity.addEventListener('click', () => openBottomSheet('opportunity'));
  pillControl.addEventListener('click', () => openBottomSheet('control'));

  // Sheet Tabs
  document.querySelectorAll('.sheet-tab-btn').forEach(tabBtn => {
    tabBtn.addEventListener('click', () => {
      const tab = tabBtn.dataset.tab;
      openBottomSheet(tab);
    });
  });

  // Sheet close listeners
  sheetCloseBtn.addEventListener('click', closeBottomSheet);
  bottomSheetBackdrop.addEventListener('click', closeBottomSheet);

  // Callout Card tap opens Stage 2 transition modal
  calloutCard.addEventListener('click', () => {
    stagePreviewModal.classList.add('active');
  });

  // Web Speech API Audio Narration
  function speakText(text, lang = 'gu-IN') {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  }

  // --- Advisor Audio & Dialogue (Female LIC agent speaks) ---
  const advisorSpeechText = "તમારો business already growth potential આપે છે. Customers વધે, sales વધે, expansion થાય — તો returns પણ મોટા થઈ શકે. પણ જ્યાં growth હોય ત્યાં risk પણ હોય. એટલે તમારી personal savings નો દરેક રૂપિયા ફરી risk માં જવાની જરૂર નથી.";

  function speakAdvisor() {
    speakText(advisorSpeechText, 'gu-IN');
  }

  if (advisorAudioTrigger && bubbleAdvisor) {
    advisorAudioTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      bubbleAdvisor.classList.toggle('active');
      if (bubbleAdvisor.classList.contains('active')) {
        speakAdvisor();
      } else {
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      }
    });

    if (closeBubbleAdvisor) {
      closeBubbleAdvisor.addEventListener('click', (e) => {
        e.stopPropagation();
        bubbleAdvisor.classList.remove('active');
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      });
    }

    if (audioBtnAdvisor) {
      audioBtnAdvisor.addEventListener('click', (e) => {
        e.stopPropagation();
        speakAdvisor();
      });
    }

    // Dismiss bubble when clicking anywhere outside
    document.addEventListener('click', (e) => {
      if (!bubbleAdvisor.contains(e.target) && !advisorAudioTrigger.contains(e.target)) {
        if (bubbleAdvisor.classList.contains('active')) {
          bubbleAdvisor.classList.remove('active');
          if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        }
      }
    });
  }

  // --- Forward CTA & Stage 2 Conceptual Transition ---
  ctaForwardBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    stagePreviewModal.classList.add('active');
  });

  previewDismissBtn.addEventListener('click', () => {
    stagePreviewModal.classList.remove('active');
  });

  stagePreviewModal.addEventListener('click', (e) => {
    if (e.target === stagePreviewModal) {
      stagePreviewModal.classList.remove('active');
    }
  });

  // --- Developer Tooling: Layer Inspector (Hidden by default for customer) ---
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

  // Toggle Mobile Frame vs Fullscreen
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
      closeBottomSheet();
      if (bubbleAdvisor) {
        bubbleAdvisor.classList.remove('active');
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      }
      if (inspectorPanel) inspectorPanel.classList.remove('active');
      stagePreviewModal.classList.remove('active');
    } else if (e.key === '1') {
      openBottomSheet('growth');
    } else if (e.key === '2') {
      openBottomSheet('opportunity');
    } else if (e.key === '3') {
      openBottomSheet('control');
    } else if (e.key === 'd' || e.key === 'D') {
      // Toggle developer mode
      if (!['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        document.body.classList.toggle('dev-mode');
        if (inspectorPanel) inspectorPanel.classList.toggle('active');
      }
    }
  });
});
