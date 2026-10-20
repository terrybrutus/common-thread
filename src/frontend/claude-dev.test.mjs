import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Readable } from "node:stream";
import { claudeDevPlugin, MODEL, validateBrief } from "./claude-dev.mjs";

const brief = { purpose: "fun", interests: "games", topic: "", notes: "", difficulty: "easy", familiarity: "new" };
test("rejects oversized briefs and strips unexpected private fields", () => {
  assert.throws(() => validateBrief({ ...brief, notes: "x".repeat(1201) }));
  assert.equal(validateBrief({ ...brief, creator: "Private" }).creator, undefined);
});

test("local tester protects origin, reserves budget before requests, and blocks spent budget", async () => {
  const temp = mkdtempSync(join(tmpdir(), "common-thread-test-"));
  const root = join(temp, "src", "frontend");
  mkdirSync(root, { recursive: true });
  const ledger = join(temp, ".cache", "claude-test-budget.json");
  function handler() {
    let middleware;
    claudeDevPlugin({ ANTHROPIC_API_KEY: "test-secret" }, root).configureServer({ middlewares: { use(_path, fn) { middleware = fn; } } });
    return middleware;
  }
  async function request(fn, origin) {
    const req = Readable.from([JSON.stringify(brief)]);
    req.socket = { remoteAddress: "127.0.0.1" };
    req.method = "POST";
    req.headers = { host: "127.0.0.1:5173", origin, "content-type": "application/json" };
    let status; let data;
    await fn(req, { writeHead(code) { status = code; }, end(body) { data = JSON.parse(body); } });
    return { status, data };
  }
  const original = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async (url, options) => {
    calls++;
    assert.equal(url, "https://api.anthropic.com/v1/messages");
    assert.equal(JSON.parse(options.body).model, MODEL);
    assert.equal(JSON.parse(readFileSync(ledger, "utf8")).reserved, 0.01);
    return { ok: true, json: async () => ({ stop_reason: "end_turn", content: [{ type: "text", text: '{"error":"Tell me another memory"}' }] }) };
  };
  try {
    const fn = handler();
    assert.equal((await request(fn, "https://other.example")).status, 403);
    assert.equal(calls, 0);
    const success = await request(fn, "http://127.0.0.1:5173");
    assert.equal(success.status, 200);
    assert.ok(!JSON.stringify(success).includes("test-secret"));
    assert.equal((await request(fn, "http://127.0.0.1:5173")).status, 429);
    writeFileSync(ledger, JSON.stringify({ day: new Date().toISOString().slice(0, 10), reserved: 0.10 }));
    assert.equal((await request(handler(), "http://127.0.0.1:5173")).status, 429);
    assert.equal(calls, 1);
  } finally { globalThis.fetch = original; }
});
