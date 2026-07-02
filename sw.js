const CACHE_NAME = "spt-pro-v41-4-print-engine-camscanner";
const CORE_ASSETS = ["./?v=41.4", "./index.html?v=41.4", "./style.css?v=41.4", "./main.css?v=41.4", "./main.js?v=41.4", "./script.js?v=41.4", "./manifest.webmanifest?v=41.4", "./offline.html", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", event => { event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS)).then(()=>self.skipWaiting())); });
self.addEventListener("activate", event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  event.respondWith(fetch(req).then(res => { const copy = res.clone(); caches.open(CACHE_NAME).then(cache => cache.put(req, copy)); return res; }).catch(() => caches.match(req).then(cached => cached || caches.match("./offline.html"))));
});
