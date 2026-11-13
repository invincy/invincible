const circuit = 'M0 142H142l32 30h156l38 37h90M0 460h196l39-38h114l32-33h59M1000 245H872l-35 34H716l-32 32h-66M1000 512H848l-42-42H676l-28-28h-32';

export function mountPageChrome(base) {
  const root = document.documentElement;
  const body = document.body;
  if (body.classList.contains('journal-page') || root.matches('.ai-voiceover-embed,.project-voiceover-embed')) return;
  const syncTheme = () => {
    try {
      const theme = localStorage.getItem('invincible-visual-theme');
      root.dataset.visualTheme = theme === 'two' || theme === 'three' ? theme : 'one';
      root.dataset.backdropMotion = localStorage.getItem('invincible-electric-motion') || 'subtle';
    } catch { root.dataset.visualTheme = 'one'; }
  };
  syncTheme();
  window.addEventListener('storage', syncTheme);
  window.addEventListener('pageshow', syncTheme);
  for (const href of ['shared/dashboard-backdrop.css?v=4','shared/page-chrome.css?v=1']) {
    if (!document.querySelector('link[href$="'+href+'"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = base + href;
      document.head.append(link);
    }
  }
  if (!body.querySelector(':scope > .dashboard-backdrop')) {
    const backdrop = document.createElement('div');
    backdrop.className = 'dashboard-backdrop';
    backdrop.style.position = 'fixed';
    backdrop.style.pointerEvents = 'none';
    backdrop.style.zIndex = '-1';
    backdrop.setAttribute('aria-hidden', 'true');
    backdrop.innerHTML = '<svg viewBox="0 0 1000 600" preserveAspectRatio="none"><path d="'+circuit+'"/><path class="circuit-particles" d="'+circuit+'"/></svg>';
    body.prepend(backdrop);
  }
  root.classList.add('invincible-page-chrome');
  return () => {
    window.removeEventListener('storage', syncTheme);
    window.removeEventListener('pageshow', syncTheme);
  };
}
