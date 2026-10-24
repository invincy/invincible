/**
 * LIC Bima Platinum · Phase 1 Mobile Presentation App
 * Client State & Interactive Layer Management
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

  // Character Hotspots & Speech Bubbles
  const hotspotBusinessman = document.getElementById('hotspotBusinessman');
  const hotspotPresenter = document.getElementById('hotspotPresenter');
  const bubbleBusinessman = document.getElementById('bubbleBusinessman');
  const bubblePresenter = document.getElementById('bubblePresenter');
  const closeBubbleBusinessman = document.getElementById('closeBubbleBusinessman');
  const closeBubblePresenter = document.getElementById('closeBubblePresenter');

  // Inspector Elements
  const inspectorFab = document.getElementById('inspectorFab');
  const inspectorPanel = document.getElementById('inspectorPanel');
  const toggle3DExploded = document.getElementById('toggle3DExploded');
  const toggleDeviceFrame = document.getElementById('toggleDeviceFrame');
  const layerCheckboxes = document.querySelectorAll('.layer-toggle-input');

  // Forward Action CTA
  const ctaForwardBtn = document.getElementById('ctaForwardBtn');
  const calloutCard = document.getElementById('calloutCard');

  // Content Data for Bottom Sheet (Bilingual Gujarati - English)
  const topicData = {
    growth: {
      badge: '🌱 PILLAR 01 · GROWTH',
      title: 'Business Reinvestment vs Guaranteed Stability',
      gujaratiTitle: 'વૃદ્ધિ: બિઝનેસમાં મૂડીનું પુનઃરોકાણ અને ગેરેન્ટેડ બેઝલાઇન',
      gujaratiLead: 'તમારો બિઝનેસ તમારો મુખ્ય સંપત્તિ સર્જક છે. દરેક રૂપિયો બિઝનેસમાં વધુ રિટર્ન આપે છે, પણ શું બધો નફો અસુરક્ષિત રાખવો યોગ્ય છે?',
      englishLead: 'Your business is your primary wealth creation engine. But reinvesting 100% of profits leaves your household wealth exposed to business volatility.',
      engineA: {
        title: 'Business Growth Engine',
        desc: 'ઉચ્ચ વળતર, પણ બજાર પરિબળો, સપ્લાય ચેઇન અને તમારી દૈનિક હાજરી પર સંપૂર્ણ નિર્ભર.'
      },
      engineB: {
        title: 'Guaranteed Reserve',
        desc: 'સોવરિન ગેરેંટી સાથે કરમુક્ત કેશફ્લો, જે બિઝનેસના ઉતાર-ચઢાવથી ૧૦૦% અલગ રહે છે.'
      },
      quote: '“મારો બિઝનેસ મને ગ્રોથ આપે છે, પણ Bima Platinum મારા પરિવારને નિર્ભય બનાવે છે.”'
    },
    opportunity: {
      badge: '💡 PILLAR 02 · OPPORTUNITY',
      title: 'Seizing Market Opportunities Without Liquidating Core Assets',
      gujaratiTitle: 'તક: બિઝનેસ તકો ઝડપવા માટે સક્ષમ લિક્વિડિટી',
      gujaratiLead: 'જ્યારે બજારમાં નવી વિસ્તરણ તકો આવે છે, ત્યારે સ્માર્ટ બિઝનેસમેન પોતાના મૂળ રોકાણો નુકસાનમાં વેચતા નથી.',
      englishLead: 'When lucrative expansion opportunities or supply discounts appear, liquid capital is king. A guaranteed asset preserves borrowing power.',
      engineA: {
        title: 'Traditional Distress Sale',
        desc: 'કટોકટીમાં માર્કેટ કરેક્શન સમયે મ્યુચ્યુઅલ ફંડ કે પ્રોપર્ટી ડિસ્કાઉન્ટ પર વેચવી પડે છે.'
      },
      engineB: {
        title: 'Sovereign Liquidity',
        desc: 'પોલિસી વેલ્યુ સામે તાત્કાલિક લોન અથવા પ્રી-ડિટરમાઇન્ડ પે-આઉટ્સ દ્વારા સહેલી તરલતા.'
      },
      quote: '“તક એને જ મળે છે જેની પાસે સમયસર લિક્વિડિટી ઉપલબ્ધ હોય.”'
    },
    control: {
      badge: '🎛️ PILLAR 03 · CONTROL',
      title: 'Ring-Fencing Personal Net Worth from Commercial Risk',
      gujaratiTitle: 'નિયંત્રણ: બિઝનેસ રિસ્ક અને પરિવારની સ્થિરતા વચ્ચે લક્ષ્મણરેખા',
      gujaratiLead: 'સાચું નિયંત્રણ એટલે બિઝનેસનું ટર્નઓવર ઘટવા છતાં તમારા પરિવારનું જીવનધોરણ અને બાળકોનું ભવિષ્ય અકબંધ રહે.',
      englishLead: 'True financial autonomy means personal family milestones remain unconditional and insulated from commercial trade cycles.',
      engineA: {
        title: 'Co-mingled Risk',
        desc: 'બિઝનેસની લોન, લેણદારો અને ટેક્સના જોખમો અંગત પારિવારિક સંપત્તિને અસર કરે છે.'
      },
      engineB: {
        title: 'Protected Allocation',
        desc: 'સેક્શન 6 MWP Act હેઠળ કાનૂની સંરક્ષણ અને બજારના જોખમથી મુક્ત નિશ્ચિત રકમ.'
      },
      quote: '“જ્યાં સુધી અંગત સુરક્ષા લોક ન હોય, ત્યાં સુધી બિઝનેસમાં મોટો રિસ્ક ના લઈ શકાય.”'
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
    document.getElementById('sheetGujTitle').textContent = data.gujaratiTitle;
    document.getElementById('sheetGujLead').textContent = data.gujaratiLead;
    document.getElementById('sheetEngLead').textContent = data.englishLead;
    document.getElementById('sheetEngineATitle').textContent = data.engineA.title;
    document.getElementById('sheetEngineADesc').textContent = data.engineA.desc;
    document.getElementById('sheetEngineBTitle').textContent = data.engineB.title;
    document.getElementById('sheetEngineBDesc').textContent = data.engineB.desc;
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

  // Callout Card tap opens control topic
  calloutCard.addEventListener('click', (e) => {
    if (e.target.closest('#ctaForwardBtn')) return;
    openBottomSheet('control');
  });

  // --- Character Interaction & Speech Bubbles ---
  hotspotBusinessman.addEventListener('click', () => {
    bubblePresenter.classList.remove('active');
    bubbleBusinessman.classList.toggle('active');
  });

  hotspotPresenter.addEventListener('click', () => {
    bubbleBusinessman.classList.remove('active');
    bubblePresenter.classList.toggle('active');
  });

  closeBubbleBusinessman.addEventListener('click', (e) => {
    e.stopPropagation();
    bubbleBusinessman.classList.remove('active');
  });

  closeBubblePresenter.addEventListener('click', (e) => {
    e.stopPropagation();
    bubblePresenter.classList.remove('active');
  });

  // Web Speech API Audio Narration
  function speakText(text, lang = 'gu-IN') {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this device.');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  }

  document.getElementById('audioBtnBusinessman').addEventListener('click', (e) => {
    e.stopPropagation();
    const gujText = "મારો આખો કેશ ફ્લો બિઝનેસમાં રિઇન્વેસ્ટ થાય છે. એવરી યર રિટર્ન હાઈ છે, પણ અનસર્ટિન્ટી પણ એટલી જ છે.";
    speakText(gujText, 'gu-IN');
  });

  document.getElementById('audioBtnPresenter').addEventListener('click', (e) => {
    e.stopPropagation();
    const gujText = "બિઝનેસ સંપત્તિ બનાવે છે, પણ શું તમારી ફેમિલીની ફાઇનાન્શિયલ સિક્યોરિટી માર્કેટ કે બિઝનેસ સાઇકલ પર નિર્ભર રહેવી જોઈએ?";
    speakText(gujText, 'gu-IN');
  });

  // --- Forward CTA & Next Stage Preview ---
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

  // --- Layer Inspector Controls ---
  inspectorFab.addEventListener('click', () => {
    inspectorPanel.classList.toggle('active');
  });

  // Close inspector when clicking outside
  document.addEventListener('click', (e) => {
    if (!inspectorPanel.contains(e.target) && !inspectorFab.contains(e.target)) {
      inspectorPanel.classList.remove('active');
    }
  });

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
  toggle3DExploded.addEventListener('click', () => {
    stageContainer.classList.toggle('exploded-view');
    const isExploded = stageContainer.classList.contains('exploded-view');
    toggle3DExploded.textContent = isExploded ? '📐 Normal View' : '✨ 3D Exploded Layers';
  });

  // Toggle Mobile Frame vs Fullscreen
  toggleDeviceFrame.addEventListener('click', () => {
    deviceFrame.classList.toggle('mode-fullscreen');
    const isFull = deviceFrame.classList.contains('mode-fullscreen');
    toggleDeviceFrame.textContent = isFull ? '📱 Mobile Frame Mode' : '🖥️ Fullscreen Edge-to-Edge';
  });

  // Keyboard navigation & accessibility
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeBottomSheet();
      bubbleBusinessman.classList.remove('active');
      bubblePresenter.classList.remove('active');
      inspectorPanel.classList.remove('active');
      stagePreviewModal.classList.remove('active');
    } else if (e.key === '1') {
      openBottomSheet('growth');
    } else if (e.key === '2') {
      openBottomSheet('opportunity');
    } else if (e.key === '3') {
      openBottomSheet('control');
    }
  });
});
