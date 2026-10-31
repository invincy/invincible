import {APP_VERSION} from './app-release.js';
import {checkForUpdate, prepareUpdate} from './app-update.js';

// Shared by React shells and standalone pages; the caller owns authentication.
export function mountAccountMenu(host, {user, logout, login} = {}) {
  if (!document.querySelector('link[data-account-style]')) {
    const css = document.createElement('link');
    css.rel = 'stylesheet'; css.href = '/invincible/shared/account-menu.css';
    css.dataset.accountStyle = ''; document.head.append(css);
  }
  const root = document.createElement('div'); root.className = 'inv-account';
  root.innerHTML = `<button type="button" class="inv-profile" aria-label="Profile and settings" aria-expanded="false" aria-controls="inv-account-options"><span aria-hidden="true">i</span></button>
    <div class="inv-account-options" id="inv-account-options" hidden><strong class="inv-account-name"></strong><small class="inv-account-email"></small><button type="button" class="inv-open-settings">Settings</button><button type="button" class="inv-signout">Sign out</button><p class="inv-account-status" role="status"></p></div>`;
  const dialog = document.createElement('dialog'); dialog.className = 'inv-settings';
  dialog.setAttribute('aria-labelledby','inv-settings-title');
  dialog.innerHTML = `<header><h2 id="inv-settings-title">Settings</h2><button type="button" class="inv-settings-close" aria-label="Close settings">×</button></header>
    <section><h3>App updates</h3><p>Installed version <strong class="inv-version"></strong></p><p class="inv-update-status" role="status" aria-live="polite">Check for the latest Invincible release.</p><p class="inv-release-notes"></p><div class="inv-update-actions"><button type="button" class="inv-check-update">Check for updates</button><button type="button" class="inv-apply-update" hidden>Update and reload</button></div><small>Save any open work before updating. Saved work and account data stay intact.</small></section>
    <section><h3>Home-screen icon</h3><img class="inv-icon-preview" src="/invincible/assets/branding/invincible-cyan-orb-v1-192.png" width="56" height="56" alt="Current cyan orb app icon"><p>New installations use this icon. For an existing installation, Chrome may ask you to approve the change in its app menu → Review app update. This button updates Invincible; it cannot approve a launcher icon change for you.</p></section>`;
  host.append(root); document.body.append(dialog);
  const get = selector => root.querySelector(selector), field = selector => dialog.querySelector(selector);
  const profile = get('.inv-profile'), options = get('.inv-account-options'), status = get('.inv-account-status');
  const closeMenu = () => {options.hidden = true; profile.setAttribute('aria-expanded','false');};
  profile.onclick = () => {options.hidden = !options.hidden; profile.setAttribute('aria-expanded',String(!options.hidden)); if (!options.hidden) get('.inv-open-settings').focus();};
  const outside = event => {if (!root.contains(event.target)) closeMenu();};
  const escape = event => {if (event.key === 'Escape' && !options.hidden) {closeMenu(); profile.focus();}};
  document.addEventListener('pointerdown',outside); document.addEventListener('keydown',escape);
  get('.inv-open-settings').onclick = () => {closeMenu(); dialog.showModal();};
  field('.inv-settings-close').onclick = () => dialog.close();
  dialog.addEventListener('close',() => profile.focus());
  dialog.addEventListener('click',event => {if (event.target === dialog) {const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  field('.inv-version').textContent = APP_VERSION;
  let disposed = false, currentUser = user, busy = false;
  const updateUser = next => {
    currentUser = next; closeMenu(); status.textContent = '';
    get('.inv-account-name').textContent = next?.displayName || (next ? 'Invincible account' : 'Invincible');
    get('.inv-account-email').textContent = next?.email || '';
    get('.inv-signout').textContent = next ? 'Sign out' : 'Sign in';
    profile.replaceChildren();
    if (next?.photoURL && /^https:\/\//.test(next.photoURL)) {
      const photo = document.createElement('img'); photo.src = next.photoURL; photo.alt = ''; photo.referrerPolicy = 'no-referrer';
      photo.onerror = () => {profile.textContent = (next.displayName || next.email || 'i').slice(0,1).toUpperCase();}; profile.append(photo);
    } else profile.textContent = (next?.displayName || next?.email || 'i').slice(0,1).toUpperCase();
  };
  updateUser(user);
  get('.inv-signout').onclick = async () => {
    const button = get('.inv-signout'); button.disabled = true;
    try {if (currentUser) await logout?.(); else if (login) await login(); else location.assign('/invincible/'); closeMenu();}
    catch {status.textContent = 'Sign-out did not complete. Try again.';}
    finally {button.disabled = false;}
  };
  const check = field('.inv-check-update'), apply = field('.inv-apply-update'), message = field('.inv-update-status');
  check.onclick = async () => {
    if (busy) return; busy = true; check.disabled = true; apply.hidden = true; field('.inv-release-notes').textContent = ''; message.textContent = 'Checking for updates…';
    try {const release = await checkForUpdate(); if(disposed)return; message.textContent = release.available ? `Update ${release.version} is available.` : 'You’re up to date.'; field('.inv-release-notes').textContent = release.notes || ''; apply.hidden = !release.available;}
    catch {if(!disposed)message.textContent = 'Could not check for updates. Check your connection and try again.';}
    finally {busy = false; check.disabled = false;}
  };
  apply.onclick = async () => {
    if (busy || !confirm('Save any open work first. Reload Invincible to apply the update now?')) return;
    busy = true; apply.disabled = check.disabled = true; message.textContent = 'Preparing update…';
    try {await checkForUpdate(); await prepareUpdate(); if(!disposed)location.reload();}
    catch {if(!disposed)message.textContent = 'Update could not finish. Check your connection and try again.';}
    finally {busy = false; apply.disabled = check.disabled = false;}
  };
  return {updateUser, destroy(){disposed=true; document.removeEventListener('pointerdown',outside); document.removeEventListener('keydown',escape); dialog.remove(); root.remove();}};
}
