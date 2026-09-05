// Inline in the server HTML so recovery still runs when stale chunks cannot hydrate.
export const developmentPwaCleanup = String.raw`
(() => {
  if (!("serviceWorker" in navigator) || window.__khalvatPwaCleanup) return;
  window.__khalvatPwaCleanup = true;
  const owned = (worker) => worker && new URL(worker.scriptURL).origin === location.origin
    && new URL(worker.scriptURL).pathname === "/sw.js";
  const clearCaches = async () => {
    if (!("caches" in window)) return;
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => /^khalvat-(static|offline)-/.test(key))
      .map(key => caches.delete(key)));
  };
  (async () => {
    const controlled = owned(navigator.serviceWorker.controller);
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.filter(registration =>
      [registration.active, registration.waiting, registration.installing].some(owned)
    ).map(registration => registration.unregister()));
    await clearCaches();
    if (!controlled) return;
    // Unregister does not release an already controlled document. Recover once per tab.
    const key = "khalvat:pwa-dev-recovery-v1";
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // Without a persistent guard, leave recovery to the next manual navigation.
      return;
    }
    location.reload();
  })().catch(error => console.warn("PWA development cleanup failed", error));
})();
`;
