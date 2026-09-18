(() => {
  const BASE = '/invincible/';
  const pages = [
    { id: 'dashboard', label: 'Dashboard', short: 'Home', href: BASE, icon: 'home', primary: true },
    { id: 'journal', label: 'Journal', short: 'Journal', href: BASE + 'journal/', icon: 'journal', primary: true },
    { id: 'finance', label: 'Finance', href: BASE + 'journal/finance.html', icon: 'finance' },
    { id: 'garage', label: 'Garage', href: BASE + 'garage/', icon: 'garage' },
    { id: 'creator', label: 'Creator Studio', href: BASE + 'creator/', icon: 'creator' },
    { id: 'workday', label: 'Workday', short: 'Workday', href: BASE + 'workday/', icon: 'workday', primary: true },
    { id: 'lic', label: 'LIC', href: BASE + 'lic/', icon: 'lic' },
    { id: 'reminders', label: 'Reminders', short: 'Reminders', href: BASE + 'reminders/', icon: 'reminders', primary: true },
    {
      id: 'portfolio',
      label: 'Portfolio',
      href: 'https://script.google.com/macros/s/AKfycbxbdgQqTwHIYw_dS9ko_tTieVM1PAQKNAHsTqy7bFPlVNg2P-9FNoccrZwHgbeXALoY/exec',
      icon: 'portfolio',
      external: true
    }
  ];

  const icons = {
    home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 10.5 12 3l8.5 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-4.5v-6h-5v6H5a1.5 1.5 0 0 1-1.5-1.5z"/></svg>',
    journal: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3.5h12.5A1.5 1.5 0 0 1 19 5v15.5H6.5A2.5 2.5 0 0 1 4 18V5a1.5 1.5 0 0 1 1-1.42M7 8h8M7 12h8M7 16h5"/></svg>',
    finance: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V10m5 10V4m6 16v-7m5 7V7M2.5 20.5h19"/></svg>',
    garage: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 10 9-6 9 6v10H3zm4 10v-7h10v7M8 16h8"/></svg>',
    creator: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6.5h16v11H4zM9.5 9l6 3-6 3zM8 3.5h8"/></svg>',
    workday: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7.5h16v12H4zM8 7.5V5h8v2.5M4 12h16M10 12v2h4v-2"/></svg>',
    lic: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5 20 7v5c0 5-3.2 8-8 9-4.8-1-8-4-8-9V7zm-3 8.5 2 2 4-5"/></svg>',
    reminders: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 17.5h11l-1.5-2V10a4 4 0 0 0-8 0v5.5zm3.5 2a2.2 2.2 0 0 0 4 0M12 3V2"/></svg>',
    portfolio: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6.5h16v13H4zM8 6.5v-2h8v2M4 11h16M10 11v2h4v-2"/></svg>',
    more: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>'
  };

  const path = location.pathname.replace(/index\.html$/, '');
  const MOBILE_TABS_KEY = 'invincible.mobileTabs.v1';
  const defaultMobileTabs = ['workday', 'reminders', 'journal'];
  const selectableMobilePages = pages.filter(page => !page.external && page.id !== 'dashboard');

  function readMobileTabs() {
    try {
      const saved = JSON.parse(localStorage.getItem(MOBILE_TABS_KEY));
      const validIds = new Set(selectableMobilePages.map(page => page.id));
      if (Array.isArray(saved) && saved.length === 3 && new Set(saved).size === 3 && saved.every(id => validIds.has(id))) return saved;
    } catch (_) {}
    return [...defaultMobileTabs];
  }

  let selectedMobileIds = readMobileTabs();
  const activePage = pages.find(page => {
    if (page.external) return false;
    const target = page.href.replace(/index\.html$/, '');
    if (page.id === 'dashboard') return path === BASE;
    if (page.id === 'journal') return path === target;
    return path.startsWith(target);
  }) || pages[0];

  const attrs = page => [
    'class="app-nav-link"',
    'href="' + page.href + '"',
    page.external ? 'target="_blank" rel="noopener"' : '',
    page.id === activePage.id ? 'aria-current="page"' : ''
  ].filter(Boolean).join(' ');

  const linkMarkup = (page, compact = false) => {
    const label = compact && page.short ? page.short : page.label;
    return '<a ' + attrs(page) + ' data-page="' + page.id + '">' +
      '<span class="app-nav-icon">' + icons[page.icon] + '</span>' +
      '<span class="app-nav-label">' + label + '</span>' +
      (page.external ? '<span class="app-nav-external">↗</span>' : '') +
    '</a>';
  };

  const globalNav = document.querySelector('.global-nav');
  if (!globalNav) return;

  globalNav.innerHTML =
    '<div class="nav-head">' +
      '<a class="nav-brand" href="' + BASE + '" aria-label="Invincible dashboard">' +
        '<span class="nav-mark">I</span><strong>INVINCIBLE</strong>' +
      '</a>' +
      '<span class="mobile-page-name">' + activePage.label + '</span>' +
    '</div>' +
    '<div class="desktop-nav" aria-label="Primary navigation">' +
      pages.map(page => linkMarkup(page)).join('') +
    '</div>';
  globalNav.setAttribute('aria-label', 'App navigation');

  document.querySelector('.nav-backdrop')?.remove();

  const mobileTabs = document.createElement('nav');
  mobileTabs.className = 'mobile-tabbar';
  mobileTabs.setAttribute('aria-label', 'Primary navigation');
  document.body.appendChild(mobileTabs);

  const moreSheet = document.createElement('dialog');
  moreSheet.id = 'appMoreSheet';
  moreSheet.className = 'app-more-sheet';
  moreSheet.setAttribute('aria-labelledby', 'appMoreTitle');
  moreSheet.innerHTML =
    '<div class="more-sheet-grip" aria-hidden="true"></div>' +
    '<div class="more-sheet-head"><div><span>INVINCIBLE</span><h2 id="appMoreTitle">More</h2></div>' +
      '<button class="more-sheet-close" type="button" aria-label="Close">×</button></div>' +
    '<div class="more-sheet-grid">' + pages.filter(page => page.id !== 'dashboard').map(page => linkMarkup(page)).join('') + '</div>' +
    '<button class="customize-tabs-trigger" type="button"><span>' + icons.more + '</span><span><strong>Edit bottom tabs</strong><small>Choose the three pages kept one tap away</small></span></button>' +
    '<section class="tab-customizer" hidden aria-labelledby="tabCustomizerTitle">' +
      '<div class="tab-customizer-copy"><h3 id="tabCustomizerTitle">Bottom tabs</h3><p>Choose exactly three. Home and More stay fixed.</p></div>' +
      '<div class="tab-choice-grid"></div>' +
      '<div class="tab-customizer-actions"><span class="tab-choice-count"></span><button class="tab-customizer-cancel" type="button">Cancel</button><button class="tab-customizer-save" type="button">Save</button></div>' +
    '</section>';
  document.body.appendChild(moreSheet);

  const mobileViewport = window.matchMedia('(max-width: 1024px)');
  const allTriggers = () => [mobileTabs.querySelector('.mobile-more-trigger')].filter(Boolean);

  function renderMobileTabs() {
    const mobileOrder = ['dashboard', ...selectedMobileIds];
    const selectedIsActive = selectedMobileIds.includes(activePage.id) || activePage.id === 'dashboard';
    mobileTabs.innerHTML = mobileOrder
      .map(id => linkMarkup(pages.find(page => page.id === id), true))
      .join('') +
      '<button class="mobile-more-trigger' + (selectedIsActive ? '' : ' is-current') + '" type="button" aria-expanded="false" aria-controls="appMoreSheet">' +
        '<span class="app-nav-icon">' + icons.more + '</span><span class="app-nav-label">More</span>' +
      '</button>';
    mobileTabs.querySelector('.mobile-more-trigger')?.addEventListener('click', openMore);
  }

  function openMore() {
    if (!mobileViewport.matches) return;
    if (typeof moreSheet.showModal === 'function') moreSheet.showModal();
    else moreSheet.setAttribute('open', '');
    document.body.classList.add('app-more-open');
    allTriggers().forEach(trigger => trigger.setAttribute('aria-expanded', 'true'));
  }

  function closeMore() {
    if (moreSheet.open && typeof moreSheet.close === 'function') moreSheet.close();
    else moreSheet.removeAttribute('open');
    document.body.classList.remove('app-more-open');
    allTriggers().forEach(trigger => trigger.setAttribute('aria-expanded', 'false'));
  }

  mobileViewport.addEventListener('change', event => {
    if (!event.matches) { closeMore(); hideCustomizer(); }
  });
  renderMobileTabs();

  const customizeTrigger = moreSheet.querySelector('.customize-tabs-trigger');
  const customizer = moreSheet.querySelector('.tab-customizer');
  const choiceGrid = moreSheet.querySelector('.tab-choice-grid');
  const choiceCount = moreSheet.querySelector('.tab-choice-count');
  const saveTabs = moreSheet.querySelector('.tab-customizer-save');
  let draftMobileIds = [...selectedMobileIds];

  function renderTabChoices() {
    choiceGrid.innerHTML = selectableMobilePages.map(page => {
      const selected = draftMobileIds.includes(page.id);
      return '<button type="button" class="tab-choice' + (selected ? ' is-selected' : '') + '" data-page-id="' + page.id + '" aria-pressed="' + selected + '">' +
        '<span class="app-nav-icon">' + icons[page.icon] + '</span><span>' + page.label + '</span><b>' + (selected ? '✓' : '+') + '</b>' +
      '</button>';
    }).join('');
    choiceCount.textContent = draftMobileIds.length + ' of 3 selected';
    saveTabs.disabled = draftMobileIds.length !== 3;
    choiceGrid.querySelectorAll('.tab-choice').forEach(button => button.addEventListener('click', () => {
      const id = button.dataset.pageId;
      if (draftMobileIds.includes(id)) draftMobileIds = draftMobileIds.filter(item => item !== id);
      else if (draftMobileIds.length < 3) draftMobileIds.push(id);
      renderTabChoices();
    }));
  }

  function hideCustomizer() {
    customizer.hidden = true;
    customizeTrigger.hidden = false;
  }

  customizeTrigger.addEventListener('click', () => {
    draftMobileIds = [...selectedMobileIds];
    renderTabChoices();
    customizeTrigger.hidden = true;
    customizer.hidden = false;
  });
  moreSheet.querySelector('.tab-customizer-cancel')?.addEventListener('click', hideCustomizer);
  saveTabs.addEventListener('click', () => {
    if (draftMobileIds.length !== 3) return;
    selectedMobileIds = [...draftMobileIds];
    localStorage.setItem(MOBILE_TABS_KEY, JSON.stringify(selectedMobileIds));
    renderMobileTabs();
    hideCustomizer();
    closeMore();
  });
  moreSheet.querySelector('.more-sheet-close')?.addEventListener('click', closeMore);
  moreSheet.addEventListener('click', event => {
    if (event.target === moreSheet) closeMore();
  });
  moreSheet.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMore));
  moreSheet.addEventListener('cancel', event => {
    event.preventDefault();
    closeMore();
  });
})();
