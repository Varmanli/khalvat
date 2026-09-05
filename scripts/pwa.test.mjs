import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

function load(file) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, { exports });
  return exports;
}
const { developmentWorker, productionWorker } = load("lib/pwa-worker.ts");
const { developmentPwaCleanup } = load("lib/pwa-development.ts");

function worker(source) {
  const handlers = {};
  const stores = new Map();
  const calls = { claim: 0, unregister: 0, skipWaiting: 0, fetch: [] };
  let online = true;
  const caches = {
    keys: async () => [...stores.keys()],
    delete: async key => stores.delete(key),
    open: async key => {
      if (!stores.has(key)) stores.set(key, new Map());
      const entries = stores.get(key);
      return {
        match: async request => entries.get(request.url ?? request)?.clone(),
        put: async (request, response) => entries.set(request.url ?? request, response),
        addAll: async urls => {
          for (const url of urls) entries.set(url, new Response(url === "/offline"
            ? '<html><script src="/_next/static/chunks/offline.js"></script><link href="/_next/static/css/app.css"></html>'
            : url.endsWith(".css") ? '@font-face{src:url(../media/font.woff2)}' : "asset"));
        },
      };
    },
  };
  vm.runInNewContext(source, {
    URL, Response, caches,
    fetch: async request => {
      calls.fetch.push(request.url ?? request);
      if (!online) throw new Error("offline");
      return new Response("fresh");
    },
    self: {
      location: { origin: "https://example.test" },
      addEventListener: (name, handler) => { handlers[name] = handler; },
      skipWaiting: async () => { calls.skipWaiting++; },
      clients: { claim: async () => { calls.claim++; } },
      registration: { unregister: async () => { calls.unregister++; } },
    },
  });
  return {
    calls, stores, handlers,
    offline: () => { online = false; },
    async dispatch(name, request) {
      let response;
      const work = [];
      handlers[name]?.({ request, waitUntil: promise => work.push(promise), respondWith: promise => { response = promise; } });
      await Promise.all(work);
      return response;
    },
  };
}

function request(path, options = {}) {
  return { url: `https://example.test${path}`, method: "GET", mode: "cors", headers: new Headers(), ...options };
}

test("development worker retires without fetch interception or unrelated cache deletion", async () => {
  const w = worker(developmentWorker);
  for (const name of ["khalvat-static-v1", "khalvat-offline-v1", "other-app"]) w.stores.set(name, new Map());
  await w.dispatch("install");
  await w.dispatch("activate");
  assert.equal(w.handlers.fetch, undefined);
  assert.deepEqual([...w.stores.keys()], ["other-app"]);
  assert.equal(w.calls.unregister, 1);
  assert.equal(w.calls.claim, 1);
});

test("production precaches offline HTML, scripts, CSS and fonts; updates do not force takeover", async () => {
  const w = worker(productionWorker);
  await w.dispatch("install");
  const offline = w.stores.get("khalvat-offline-__BUILD_VERSION__");
  assert.ok(offline.has("/offline"));
  assert.ok(offline.has("/_next/static/chunks/offline.js"));
  assert.ok(offline.has("https://example.test/_next/static/media/font.woff2"));
  assert.equal(w.calls.skipWaiting, 0);
  w.stores.set("unrelated-cache", new Map());
  w.stores.set("khalvat-static-v1", new Map());
  await w.dispatch("activate");
  assert.ok(w.stores.has("unrelated-cache"));
  assert.ok(!w.stores.has("khalvat-static-v1"));
  w.offline();
  const response = await w.dispatch("fetch", request("/today", { mode: "navigate" }));
  assert.match(await response.text(), /<html>/);
});

test("production bypasses HMR, APIs, private data, RSC and unrelated scripts", async () => {
  const w = worker(productionWorker);
  for (const path of ["/_next/webpack-hmr", "/_next/static/webpack/a.hot-update.js", "/_next/static/chunks/turbopack-hmr.js", "/api/tasks", "/today?_rsc=abc", "/planner", "/events", "/third-party.js"]) {
    assert.equal(await w.dispatch("fetch", request(path)), undefined, path);
  }
  assert.equal(await w.dispatch("fetch", request("/_next/static/a.js", { headers: new Headers({ RSC: "1" }) })), undefined);
});

test("production fetches current assets online and serves cached assets offline", async () => {
  const w = worker(productionWorker);
  const asset = request("/_next/static/chunks/app.js");
  assert.equal(await (await w.dispatch("fetch", asset)).text(), "fresh");
  w.offline();
  assert.equal(await (await w.dispatch("fetch", asset)).text(), "fresh");
});

async function cleanup({ storage = new Map(), controlled = true, blockedStorage = false } = {}) {
  const own = { scriptURL: "https://example.test/sw.js" };
  const unrelated = { scriptURL: "https://example.test/other/sw.js" };
  const calls = { reload: 0, own: 0, unrelated: 0, deleted: [] };
  const context = {
    URL, console,
    window: {},
    location: { origin: "https://example.test", reload: () => { calls.reload++; } },
    navigator: { serviceWorker: {
      controller: controlled ? own : null,
      getRegistrations: async () => [
        { active: own, unregister: async () => { calls.own++; } },
        { active: unrelated, unregister: async () => { calls.unrelated++; } },
      ],
    } },
    caches: {
      keys: async () => ["khalvat-static-v1", "khalvat-offline-v1", "other"],
      delete: async key => { calls.deleted.push(key); },
    },
    sessionStorage: {
      getItem: key => { if (blockedStorage) throw new Error("blocked"); return storage.get(key); },
      setItem: (key, value) => storage.set(key, value),
    },
  };
  context.window.caches = context.caches;
  vm.runInNewContext(developmentPwaCleanup, context);
  vm.runInNewContext(developmentPwaCleanup, context);
  await new Promise(resolve => setImmediate(resolve));
  return calls;
}

test("development cleanup is scoped and reloads at most once across documents and repeated execution", async () => {
  const storage = new Map();
  const first = await cleanup({ storage });
  assert.equal(first.reload, 1);
  assert.equal(first.own, 1);
  assert.equal(first.unrelated, 0);
  assert.deepEqual(first.deleted, ["khalvat-static-v1", "khalvat-offline-v1"]);
  assert.equal((await cleanup({ storage })).reload, 0);
  assert.equal((await cleanup({ controlled: false })).reload, 0);
  assert.equal((await cleanup({ blockedStorage: true })).reload, 0);
});
