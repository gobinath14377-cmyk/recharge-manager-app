const CACHE = "recharge-manager-v31";
const APP_SHELL = ["/", "/index.html", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith((async () => {
    try {
      const response = await fetch(event.request, { cache: "no-cache" });
      if (response && response.ok) {
        const copy = response.clone();
        caches.open(CACHE).then(c => c.put(event.request, copy)).catch(() => {});
      }
      return response;
    } catch (e) {
      const cached = await caches.match(event.request);
      return cached || caches.match("/index.html");
    }
  })());
});

self.addEventListener("push", event => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) {}
  const title = data.title || "🔔 Recharge Reminder";
  const options = {
    body: data.body || "Recharge reminder",
    tag: data.tag || "recharge-reminder",
    renotify: true,
    vibrate: [300,150,300],
    data: { url: data.url || "/" }
  };
  event.waitUntil((async () => {
    await self.registration.showNotification(title, options);
    const list = await self.clients.matchAll({type:"window", includeUncontrolled:true});
    for (const client of list) client.postMessage({type:"recharge-alarm", payload:data});
  })());
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(clients.matchAll({type:"window", includeUncontrolled:true}).then(list => {
    for (const client of list) if ("focus" in client) return client.focus();
    return clients.openWindow(url);
  }));
});
