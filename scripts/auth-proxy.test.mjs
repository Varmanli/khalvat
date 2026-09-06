import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { createRequire } from "node:module";
import ts from "typescript";

const require = createRequire(import.meta.url);
const jwt = require("jsonwebtoken");
const { NextRequest } = require("next/server");
const secret = "isolated-proxy-regression-test-secret";
function load(file, imports) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText, { exports, URL, require: name => imports[name] ?? require(name), process: { env: { JWT_SECRET: secret } } });
  return exports;
}
const auth = load("lib/auth.ts", {});
const { proxy } = load("proxy.ts", { "@/lib/auth": auth });
const request = (path, token) => new NextRequest(`http://localhost:3000${path}`, {
  headers: token ? { cookie: `khalvat_token=${token}` } : {},
});

test("absent, invalid and expired sessions settle at login instead of bouncing to today", () => {
  const expired = jwt.sign({ userId: "test", email: "test@example.test" }, secret, { expiresIn: -1 });
  for (const token of [undefined, "invalid", expired]) {
    assert.equal(token ? auth.verifyToken(token) : null, null);
    const protectedResponse = proxy(request("/today", token));
    assert.equal(protectedResponse.headers.get("location"), "http://localhost:3000/login");
    const loginResponse = proxy(request("/login", token));
    assert.equal(loginResponse.headers.get("location"), null);
    if (token) {
      assert.match(protectedResponse.headers.get("set-cookie"), /Max-Age=0/);
      assert.match(loginResponse.headers.get("set-cookie"), /Max-Age=0/);
    }
  }
});

test("valid sessions retain protected access and guest-page redirect", () => {
  const token = auth.signToken({ userId: "test", email: "test@example.test" });
  assert.ok(auth.verifyToken(token));
  assert.equal(proxy(request("/today", token)).headers.get("location"), null);
  assert.equal(proxy(request("/login", token)).headers.get("location"), "http://localhost:3000/today");
  assert.equal(proxy(request("/register", token)).headers.get("location"), "http://localhost:3000/today");
  assert.equal(proxy(request("/", token)).headers.get("location"), "http://localhost:3000/dashboard");
  assert.equal(proxy(request("/")).headers.get("location"), null);
});
