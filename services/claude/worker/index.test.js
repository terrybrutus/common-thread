import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import worker, { reserve, parseOutput, validateBrief } from "./index.js";

function database() {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(readFileSync(new URL("../drizzle/0000_lonely_jackal.sql", import.meta.url), "utf8"));
  return { sqlite, prepare(sql) { return { bind(...args) { return { async run() { return { meta: sqlite.prepare(sql).run(...args) }; } }; } }; } };
}
test("atomic reservations cap each person, daily total, cooldown and lifetime across calls", async () => {
  const db = database(), start = Date.parse("2026-10-20T00:00:00Z");
  assert.equal(await reserve(db, "one", start), true);
  assert.equal(await reserve(db, "two", start + 1), false);
  assert.equal(await reserve(db, "one", start + 21000), true);
  assert.equal(await reserve(db, "one", start + 42000), false);
  for (let i = 0; i < 8; i++) assert.equal(await reserve(db, `user${i}`, start + 63000 + i * 21000), true);
  assert.equal(await reserve(db, "extra", start + 400000), false);
  assert.equal(await reserve(db, "one", start + 86400000), true);
  const insert = db.sqlite.prepare("INSERT INTO generations VALUES (?, ?, ?, ?)");
  for (let i = 11; i < 400; i++) insert.run(`seed${i}`, "old", "old", 0);
  assert.equal(await reserve(db, "other", start + 86450000), false);
});
test("rejects unauthorized/cross-site requests before spending", async () => {
  const make = (headers) => new Request("https://service.example/api/puzzle", { method: "POST", headers, body: "{}" });
  assert.equal((await worker.fetch(make({}), {})).status, 401);
  assert.equal((await worker.fetch(make({ "oai-authenticated-user-id": "owner", Origin: "https://evil.example" }), {})).status, 403);
});
test("accepts longer factual context, strips metadata, and rejects duplicates or vague empty output", () => {
  const brief = { purpose: "fun", interests: "games", topic: "", notes: "x".repeat(12000), familiarity: "new", difficulty: "balanced", creator: "private" };
  assert.equal(validateBrief(brief).notes.length, 12000);
  assert.equal(validateBrief(brief).creator, undefined);
  assert.throws(() => validateBrief({ ...brief, notes: "x".repeat(13001) }));
  assert.throws(() => parseOutput('{"puzzle":null,"question":"Name four favorite foods"}'), /four favorite foods/);
  const group = { category: "Category", a: "A", b: "B", c: "C", d: "D", clue: "Clue", explanation: "Explanation" };
  const puzzle = { title: "Title", topic: "Topic", description: "Description", group1: group, group2: group, group3: group, group4: group };
  assert.throws(() => parseOutput(JSON.stringify({ puzzle })), /repeated/);
});
