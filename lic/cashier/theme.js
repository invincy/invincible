// Apply before styles load; this page preference is independent of account data.
(() => {
  const key = 'invincible.cashier.theme.v1';
  const system = matchMedia('(prefers-color-scheme: dark)');
  let preference;
  try { preference = localStorage.getItem(key); } catch {}
  if (!['light', 'dark'].includes(preference)) preference = null;
  function apply() {
    const theme = preference || (system.matches ? 'dark' : 'light');
    document.documentElement.dataset.cashierTheme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#071820' : '#f2f8fa');
    document.querySelectorAll('[data-theme-choice]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.themeChoice === theme)));
  }
  apply();
  system.addEventListener('change', () => { if (!preference) apply(); });
  window.addEventListener('storage', event => {
    if (event.key !== key && event.key !== null) return;
    preference = ['light', 'dark'].includes(event.newValue) ? event.newValue : null;
    apply();
  });
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-theme-choice]').forEach(button => button.addEventListener('click', () => {
      preference = button.dataset.themeChoice;
      try { localStorage.setItem(key, preference); } catch {}
      apply();
    }));
    apply();
  });
})();
