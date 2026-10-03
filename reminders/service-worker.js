// Retirement endpoint for browsers that still have the pre-React Reminders worker.
// Keep this URL: deleting it would leave an old worker and stale cached app installed.
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 const keys=await caches.keys();
 await Promise.all(keys.filter(key=>key.startsWith('invincible-reminders-')).map(key=>caches.delete(key)));
 await self.registration.unregister();
})()));
