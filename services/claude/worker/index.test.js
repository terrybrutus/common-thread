import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync, readdirSync } from "node:fs";
import worker, { parseOutput, validateBrief, saveStory } from "./index.js";

function database() {
  const sqlite = new DatabaseSync(":memory:");
  const dir = new URL("../drizzle/", import.meta.url);
  for (const file of readdirSync(dir).filter(v => v.endsWith(".sql")).sort()) sqlite.exec(readFileSync(new URL(file, dir), "utf8"));
  return { sqlite, prepare(sql) { return { bind(...args) { return { async run() { return { meta: sqlite.prepare(sql).run(...args) }; }, async all() { return { results: sqlite.prepare(sql).all(...args) }; } }; } }; } };
}
test("private beta ignores exhausted historical quotas and keeps request authentication", async () => {
  const db = database();
  const insert = db.sqlite.prepare("INSERT INTO generations VALUES (?, ?, ?, ?)");
  for (let i = 0; i < 400; i++) insert.run('old' + i, new Date().toISOString().slice(0, 10), "owner", Date.now());
  const original = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    return Response.json({ stop_reason: "end_turn", content: [{ type: "text", text: JSON.stringify({ puzzle: null, question: "Which four foods do you both enjoy?" }) }] });
  };
  try {
    for (let i = 0; i < 12; i++) {
      const request = new Request("https://service.example/api/puzzle", { method: "POST", headers: { "oai-authenticated-user-id": "owner", Origin: "https://service.example", "Content-Type": "application/json" }, body: JSON.stringify({ purpose: "fun", interests: "games", notes: "", topic: "", difficulty: "balanced", familiarity: "new" }) });
      assert.equal((await worker.fetch(request, { DB: db, ANTHROPIC_API_KEY: "test-secret" })).status, 422);
    }
    assert.equal(calls, 12);
    assert.equal(db.sqlite.prepare("SELECT COUNT(*) AS n FROM generations").get().n, 400);
  } finally { globalThis.fetch = original; }
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
  assert.throws(() => validateBrief({ ...brief, notes: "x".repeat(40001) }));
  assert.throws(() => parseOutput('{"puzzle":null,"question":"Name four favorite foods"}'), /four favorite foods/);
  const group = { category: "Category", a: "A", b: "B", c: "C", d: "D", clue: "Clue", explanation: "Explanation" };
  const puzzle = { title: "Title", topic: "Topic", description: "Description", group1: group, group2: group, group3: group, group4: group };
  assert.throws(() => parseOutput(JSON.stringify({ puzzle })), /repeated/);
});

test("rejects unrelated filler and unsupported personal words even in structurally valid boards", () => {
  const brief = { purpose: "fun", personalization: "memories-only", notes: "A1 A2 A3 A4 B1 B2 B3 B4 C1 C2 C3 C4 D1 D2 D3 D4" };
  const puzzle = { title: "Title", topic: "Topic", description: "Description" };
  for (const [i, prefix] of ["A", "B", "C", "D"].entries()) puzzle[`group${i + 1}`] = { category: `Group ${prefix}`, a: `${prefix}1`, b: `${prefix}2`, c: `${prefix}3`, d: `${prefix}4`, clue: "A clue", explanation: "A source-grounded group.", kind: "personal", evidenceA: `${prefix}1`, evidenceB: `${prefix}2`, evidenceC: `${prefix}3`, evidenceD: `${prefix}4` };
  assert.equal(JSON.parse(parseOutput(JSON.stringify({ puzzle }), brief)).groups.length, 4);
  puzzle.group4.kind = "themed";
  assert.throws(() => parseOutput(JSON.stringify({ puzzle }), brief), /unrelated themes/);
  assert.equal(JSON.parse(parseOutput(JSON.stringify({ puzzle }), { ...brief, personalization: "mix" })).groups.length, 4);
  puzzle.group3.kind = "themed";
  assert.throws(() => parseOutput(JSON.stringify({ puzzle }), { ...brief, personalization: "mix" }), /unrelated themes/);
  puzzle.group3.kind = "personal"; puzzle.group4.kind = "personal"; puzzle.group4.a = "VIOLIN";
  assert.throws(() => parseOutput(JSON.stringify({ puzzle }), brief), /wasn't supported/);
});

test("private stories survive loads, stay scoped to owner, and protect newer versions", async () => {
  const db = database();
  const profile = { id: "test", name: "Our story", updatedAt: 10, brief: { storyAnswers: ["A private memory"], style: "together", notes: "", interests: "Games" } };
  await saveStory(db, "owner-one", profile);
  await assert.rejects(saveStory(db, "owner-one", { ...profile, updatedAt: 9 }), /newer version/);
  const request = () => new Request("https://service.example/api/story/load", { method: "POST", headers: { "oai-authenticated-user-id": "owner-one", Origin: "https://service.example", "Content-Type": "application/json" }, body: "{}" });
  const response = await worker.fetch(request(), { DB: db });
  const saved = (await response.json()).profiles;
  assert.equal(saved[0].brief.storyAnswers[0], "A private memory");
  assert.equal(db.sqlite.prepare("SELECT COUNT(*) AS n FROM stories WHERE owner = ?").get("owner-two").n, 0);
  assert.equal(db.sqlite.prepare("SELECT COUNT(*) AS n FROM generations").get().n, 0);
  const recovered = { ...profile, id: "recovered", updatedAt: 11 };
  await worker.fetch(request(), { DB: db, RECOVERED_STORY_JSON: JSON.stringify(recovered) });
  await saveStory(db, "owner-one", { ...recovered, updatedAt: 12, name: "Edited story" });
  await worker.fetch(request(), { DB: db, RECOVERED_STORY_JSON: JSON.stringify(recovered) });
  assert.equal(db.sqlite.prepare("SELECT name FROM stories WHERE id = ?").get("recovered").name, "Edited story");
});

test("verified wordplay permits reversed names but rejects arbitrary spelling and report-like prose", () => {
  const puzzle = { title: "Personal puzzle", topic: "Us", description: "Connections for you both" };
  let notes = "";
  for (const [i, prefix] of ["A", "B", "C"].entries()) {
    const g = { category: "Our favorites", clue: "Think of your favorites", explanation: "These are favorites you share.", kind: "personal", operation: "literal", fixedText: "" };
    for (let j = 0; j < 4; j++) { const letter = "ABCD"[j], source = `${prefix}${j + 1}`; g[letter.toLowerCase()] = source; g[`source${letter}`] = source; g[`evidence${letter}`] = source; notes += `${source} `; }
    puzzle[`group${i + 1}`] = g;
  }
  const names = ["ALAN", "BETH", "CORA", "DREW"];
  notes += names.join(" ");
  const g = { category: "Our parents, in reverse", clue: "Read these another way", explanation: "Read each name backward to find a parent you both know.", kind: "personal", operation: "reverse", fixedText: "" };
  for (let j = 0; j < 4; j++) { const letter = "ABCD"[j]; g[letter.toLowerCase()] = Array.from(names[j]).reverse().join(""); g[`source${letter}`] = names[j]; g[`evidence${letter}`] = names[j]; }
  puzzle.group4 = g;
  const brief = { purpose: "fun", notes, personalization: "memories-only" };
  assert.equal(JSON.parse(parseOutput(JSON.stringify({ puzzle }), brief)).groups[3].words[0], "NALA");
  g.a = "ALA";
  assert.throws(() => parseOutput(JSON.stringify({ puzzle }), brief), /consistent rule/);
  g.a = "NALA"; g.category = "Parents named in the notes";
  assert.throws(() => parseOutput(JSON.stringify({ puzzle }), brief), /impersonal wording/);
  g.category = "Our parents, in reverse"; g.operation = "fill-blank"; g.fixedText = "___ CLUB";
  assert.throws(() => parseOutput(JSON.stringify({ puzzle }), brief), /consistent phrase/);
  const dates = ["1991", "JANUARY 3RD", "MARCH 2ND 1988", "APRIL 4TH"];
  g.operation = "literal"; g.fixedText = "";
  for (let j = 0; j < 4; j++) { const letter = "ABCD"[j]; g[letter.toLowerCase()] = dates[j]; g[`source${letter}`] = dates[j]; g[`evidence${letter}`] = dates[j]; }
  assert.throws(() => parseOutput(JSON.stringify({ puzzle }), { ...brief, notes: notes + dates.join(" ") }), /mixed years/);
  g.operation = "fill-blank"; g.fixedText = "___ PARK"; g.category = "Our ___ Park places";
  const tiles = ["ELM", "OAK", "PINE", "BIRCH"];
  for (let j = 0; j < 4; j++) { const letter = "ABCD"[j]; g[letter.toLowerCase()] = tiles[j]; g[`source${letter}`] = `${tiles[j]} PARK`; g[`evidence${letter}`] = `${tiles[j]} PARK`; }
  assert.equal(JSON.parse(parseOutput(JSON.stringify({ puzzle }), { ...brief, notes: notes + " " + tiles.map(v => `${v} PARK`).join(" ") })).groups[3].words[0], "ELM");
});
