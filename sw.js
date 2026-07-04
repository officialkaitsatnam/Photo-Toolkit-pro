// Smart Photo Toolkit Pro v42.7 service worker
const CACHE_NAME='spt-v42-7-real-development-foundation';
const ASSETS=['./','./index.html','./main.css','./main.js','./manifest.webmanifest','./icon-192.png','./icon-512.png','./aadhaar.jpg','./pan.jpg','./voter.jpg','./dl.jpg','./abha.jpg','./ayushman.jpg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{e.respondWith(fetch(e.request).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))))});
