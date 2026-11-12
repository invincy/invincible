// Invincible release 2026.11.12.21
self.addEventListener("install",event=>event.waitUntil(self.skipWaiting()));
self.addEventListener("activate",event=>event.waitUntil(self.clients.claim()));
self.addEventListener("fetch",event=>{if(event.request.mode!=="navigate")return;event.respondWith(fetch(event.request).catch(()=>caches.match("/invincible/")))});
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting()});
