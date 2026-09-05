// Existing registrations also check this URL without a successfully hydrated client.
export const developmentWorker = String.raw`
self.addEventListener("install", event => event.waitUntil(self.skipWaiting()));
self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    await self.clients.claim();
    await self.registration.unregister();
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => /^khalvat-(static|offline)-/.test(key))
      .map(key => caches.delete(key)));
  })());
});

`;

export const productionWorker = String.raw`
const STATIC_CACHE = "khalvat-static-__BUILD_VERSION__";
const OFFLINE_CACHE = "khalvat-offline-__BUILD_VERSION__";
const OFFLINE_URL = "/offline";
const PUBLIC_ASSETS = [
  "/manifest.webmanifest", "/favicon.png", "/apple-touch-icon.png",
  "/icons/icon-192.png", "/icons/icon-512.png",
  "/icons/icon-maskable-192.png", "/icons/icon-maskable-512.png",
];

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(OFFLINE_CACHE);
    await cache.addAll([OFFLINE_URL, ...PUBLIC_ASSETS]);
    // Cache the offline document's dependencies before declaring installation complete.
    const html = await (await cache.match(OFFLINE_URL)).text();
    const assets = [...new Set(html.match(/\/_next\/static\/[^"'<>\s\\]+/g) || [])];
    await cache.addAll(assets);
    for (const asset of assets.filter(url => url.endsWith(".css"))) {
      const css = await (await cache.match(asset)).text();
      const fonts = [...css.matchAll(/url\(["']?([^\s)"']+)["']?\)/g)]
        .map(match => new URL(match[1], new URL(asset, self.location.origin)))
        .filter(url => url.origin === self.location.origin && url.pathname.startsWith("/_next/static/"))
        .map(url => url.href);
      await cache.addAll([...new Set(fonts)]);
    }
  })());
  // Updates wait for existing tabs to close: no forced takeover or document reload.
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => /^khalvat-(static|offline)-/.test(key)
      && ![STATIC_CACHE, OFFLINE_CACHE].includes(key)).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("push", event => {
  const payload = event.data ? event.data.json() : {};
  event.waitUntil(self.registration.showNotification(payload.title || "خلوت", { body: payload.body || "", icon: payload.icon || "/icons/icon-192.png", badge: payload.badge || "/icons/icon-192.png", tag: payload.tag, data: { targetUrl: payload.targetUrl || "/today" }, dir: "rtl", lang: "fa" }));
});
self.addEventListener("notificationclick", event => {
  event.notification.close(); const target = new URL(event.notification.data?.targetUrl || "/today", self.location.origin).href;
  event.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(clients => { const open = clients.find(client => client.url.startsWith(self.location.origin)); return open ? open.focus().then(() => open.navigate(target)) : self.clients.openWindow(target); }));
});

self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  if (url.pathname.includes("hot-update") || url.pathname.includes("webpack-hmr")
    || url.pathname.includes("turbopack") || request.headers.get("RSC") === "1"
    || url.searchParams.has("_rsc")) return;

  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(async () =>
      (await (await caches.open(OFFLINE_CACHE)).match(OFFLINE_URL)) || Response.error()));
    return;
  }
  // Only production build assets and explicitly public files belong in this cache.
  if (!url.pathname.startsWith("/_next/static/") && !PUBLIC_ASSETS.includes(url.pathname)) return;
  event.respondWith((async () => {
    const offline = await caches.open(OFFLINE_CACHE);
    const precached = await offline.match(request);
    if (precached) return precached;
    const cache = await caches.open(STATIC_CACHE);
    try {
      const response = await fetch(request);
      if (response.ok) await cache.put(request, response.clone());
      return response;
    } catch {
      return (await cache.match(request)) || Response.error();
    }
  })());
});
`;
