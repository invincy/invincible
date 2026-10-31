import {APP_VERSION} from './app-release.js';
export async function checkForUpdate() {
  const response = await fetch('/invincible/app-version.json', {cache:'no-store', signal:AbortSignal.timeout(15000)});
  if (!response.ok) throw new Error('Could not check for updates. Try again when online.');
  const release = await response.json();
  if (typeof release.version !== 'string' || !release.version) throw new Error('Update information is unavailable. Try again later.');
  return {...release, available:release.version !== APP_VERSION};
}
export async function prepareUpdate() {
  // Refresh only our registration. Never clear account data, drafts or other apps' caches.
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration('/invincible/');
    if (registration) {
      let timer;
      try {await Promise.race([registration.update(), new Promise((_, reject) => {timer=setTimeout(() => reject(new Error('Update timed out. Please try again.')), 15000);})]);}
      finally {clearTimeout(timer);}
      registration.waiting?.postMessage({type:'SKIP_WAITING'});
    }
  }
}
