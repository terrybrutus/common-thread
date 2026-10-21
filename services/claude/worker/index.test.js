import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync, readdirSync } from "node:fs";
import worker, { parseOutput, validateBrief, saveStory, outputSchema, claudeError, identitySource, claudeRequest, parseClaudeResponse, prepareDraft, CLAUDE_TIMEOUT_MS, reviewRequest, parseReview, reviewPersonalPuzzle, groundExcerpt } from "./index.js";

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
  assert.throws(() => parseOutput('{"puzzle":null,"question":"Name four favorite foods"}'), /One more memory/);
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

test("compact schema/parser keeps exact group and entry counts and strips internal provenance", () => {
  assert.equal(outputSchema.properties.puzzle.anyOf[1].properties.groups.type, "array");
  assert.ok(JSON.stringify(outputSchema).length < 2200);
  const groups = ["A", "B", "C", "D"].map(prefix => ({
    category: "Our favorites", clue: "Think of your favorites", explanation: "These are things you both enjoy.", kind: "personal", operation: "literal", fixedText: "",
    entries: [1, 2, 3, 4].map(i => ({ tile: prefix + i, source: prefix + i, evidence: prefix + i })),
  }));
  const puzzle = { title: "Our puzzle", topic: "Our story", description: "A puzzle for you both", groups };
  const brief = { purpose: "fun", personalization: "memories-only", notes: groups.flatMap(g => g.entries.map(e => e.source)).join(" ") };
  const parsed = JSON.parse(parseOutput(JSON.stringify({ question: "", puzzle }), brief));
  assert.equal(parsed.groups.length, 4);
  assert.ok(!JSON.stringify(parsed).includes('"evidence"'));
  groups[0].entries.pop();
  assert.throws(() => parseOutput(JSON.stringify({ puzzle }), brief), /exactly four/);
  groups.pop();
  assert.throws(() => parseOutput(JSON.stringify({ puzzle }), brief), /incomplete/);
});

test("provider failures distinguish request format, account access and billing without exposing raw details", async () => {
  assert.match(await claudeError(Response.json({ error: { message: "The compiled grammar is too large" } }, { status: 400 })), /puzzle format/);
  assert.match(await claudeError(Response.json({ error: { message: "credit balance is low" } }, { status: 400 })), /billing or credit/);
  assert.match(await claudeError(Response.json({ error: { message: "private test-secret" } }, { status: 401 })), /authenticate/);
  assert.doesNotMatch(await claudeError(Response.json({ error: { message: "private test-secret" } }, { status: 500 })), /test-secret/);
  assert.match(await claudeError(new Response("Unavailable", { status: 429 })), /limiting requests/);
});

test("small name typos resolve only to a unique confirmed participant", () => {
  const names = { you: "Alice", partner: "Robin" };
  assert.equal(identitySource("Alce", names), "Alice");
  assert.equal(identitySource("Alixe", names), "Alice");
  assert.equal(identitySource("Alice", names), "Alice");
  assert.equal(identitySource("Unrelated", names), "Unrelated");
  assert.equal(identitySource("Mark", { you: "Marc", partner: "Mary" }), "Mark");
  assert.equal(identitySource("Alce", undefined), "Alce");
  assert.equal(identitySource("Al", { you: "Ali", partner: "Bo" }), "Al");
});

test("literal labels may be shorter quoted phrases, and exact names are never forced through typo correction", () => {
  const groups = ["A", "B", "C", "D"].map(prefix => ({ category: "Our favorites", clue: "Think of your favorites", explanation: "These are favorites you both know.", kind: "personal", operation: "literal", fixedText: "", entries: [1, 2, 3, 4].map(i => ({ tile: prefix + i, source: prefix + i, evidence: prefix + i })) }));
  const puzzle = { title: "Our puzzle", topic: "Our story", description: "A puzzle for you both", groups };
  const entry = groups[0].entries[0];
  Object.assign(entry, { tile: "Maplewood", source: "Maplewood New Jersey", evidence: "We lived in Maplewood New Jersey" });
  const brief = { purpose: "fun", personalization: "memories-only", notes: groups.flatMap(g => g.entries.map(e => e.evidence)).join(" ") };
  const parse = () => JSON.parse(parseOutput(JSON.stringify({ puzzle }), brief));
  assert.equal(parse().groups[0].words[0], "MAPLEWOOD");
  entry.tile = "Maple";
  assert.throws(parse, /couldn't verify/);
  entry.tile = "MJ";
  assert.throws(parse, /couldn't verify/);
  Object.assign(entry, { tile: "Alice", source: "Alice", evidence: "Alice" });
  brief.notes += " Alice"; brief.people = { you: "Alce", partner: "Robin" };
  assert.equal(parse().groups[0].words[0], "ALICE");
  groups[0].operation = "reverse";
  groups[0].entries = ["Alice", "BETH", "CORA", "DREW"].map(source => ({ tile: Array.from(source).reverse().join(""), source, evidence: source }));
  brief.notes += " BETH CORA DREW";
  assert.equal(parse().groups[0].words[0], "ECILA");
  groups[0].entries[0].tile = "ECIL";
  assert.throws(parse, /consistent rule/);
  groups[0].operation = "literal";
  for (const item of groups[0].entries) item.tile = item.source;
  Object.assign(groups[0].entries[0], { tile: "Oakview", source: "Oakview New Jersey", evidence: "Oakview New Jersey" });
  assert.throws(parse, /wasn't supported/);
});

test("shared production request leaves room for reasoning and distinguishes truncated or refused output", () => {
  const request = claudeRequest({ purpose: "fun", notes: "A story" });
  assert.equal(request.max_tokens, 12000);
  assert.equal(request.output_config.effort, "medium");
  assert.deepEqual(request.output_config.format.schema.properties.puzzle.anyOf[1].properties.groups.items.properties.operation.enum, ["literal", "reverse", "fill-blank", "first-word", "last-word"]);
  assert.equal(claudeRequest({ purpose: "study", notes: "Course notes" }).output_config.format.schema, outputSchema);
  assert.equal(CLAUDE_TIMEOUT_MS, 90000);
  const incomplete = { stop_reason: "max_tokens", content: [{ type: "text", text: '{"puzzle":' }] };
  assert.throws(() => parseClaudeResponse(incomplete), /response limit/);
  assert.throws(() => parseClaudeResponse({ stop_reason: "refusal", content: [] }), /declined/);
  assert.throws(() => parseClaudeResponse({ stop_reason: "end_turn", content: [] }), /incomplete board/);
});

test("a supported parents-name twist is deterministic without changing facts or skipping validation", () => {
  const names = ["ALAN", "BETH", "CORA", "DREW"];
  const parentGroup = { category: "Our parents", kind: "personal", operation: "literal", fixedText: "", clue: "Think of your family", explanation: "These are your parents' names.", entries: names.map(source => ({ tile: source, source, evidence: source })) };
  const groups = [parentGroup, ...["A", "B", "C"].map(prefix => ({ category: "Our favorites", kind: "personal", operation: "literal", fixedText: "", clue: "Think of your favorites", explanation: "These are favorites you both enjoy.", entries: [1, 2, 3, 4].map(i => ({ tile: prefix + i, source: prefix + i, evidence: prefix + i })) }))];
  const data = { question: "", puzzle: { title: "Our puzzle", topic: "Our story", description: "A puzzle for you", groups } };
  const brief = { purpose: "fun", difficulty: "balanced", personalization: "memories-only", notes: groups.flatMap(g => g.entries.map(e => e.source)).join(" ") };
  const prepared = prepareDraft(data, brief);
  assert.equal(data.puzzle.groups[0].operation, "literal");
  assert.equal(prepared.puzzle.groups[3].operation, "reverse");
  assert.match(prepared.puzzle.groups[3].explanation, /your parents/);
  assert.deepEqual(prepared.puzzle.groups[3].entries.map(e => e.source), names);
  assert.deepEqual(prepared.puzzle.groups[3].entries.map(e => e.evidence), names);
  assert.equal(JSON.parse(parseClaudeResponse({ stop_reason: "end_turn", content: [{ type: "text", text: JSON.stringify(data) }] }, brief)).groups[3].words[0], "NALA");
  // A complete, valid JSON board remains usable if the budget boundary fires just after its closing brace.
  assert.equal(JSON.parse(parseClaudeResponse({ stop_reason: "max_tokens", content: [{ type: "text", text: JSON.stringify(data) }] }, brief)).groups.length, 4);
  assert.equal(prepareDraft(data, { ...brief, difficulty: "easy" }).puzzle.groups[0].operation, "literal");
  assert.equal(prepareDraft(data, { ...brief, purpose: "study" }).puzzle.groups[0].operation, "literal");
  parentGroup.category = "Our family names";
  const family = prepareDraft(data, brief).puzzle.groups[3];
  assert.equal(family.operation, "reverse");
  assert.equal(family.category, "Our family names, read backward");
  assert.match(family.explanation, /Read each name backward/);
  parentGroup.category = "Our son and our parents";
  parentGroup.explanation = "Alan is your son; Beth, Cora and Drew are your parents.";
  const mixedFamily = prepareDraft(data, brief).puzzle.groups[3];
  assert.equal(mixedFamily.category, "Our son and our parents, read backward");
  assert.match(mixedFamily.explanation, /Alan is your son/);
  parentGroup.explanation = "These are your parents' names.";
  parentGroup.category = "Our parents";
  prepared.puzzle.groups[3].entries[0].tile = "WRONG";
  assert.throws(() => parseOutput(JSON.stringify(prepared), brief), /consistent rule/);
  const fixed = JSON.parse(parseClaudeResponse({ stop_reason: "end_turn", content: [{ type: "text", text: JSON.stringify(prepared) }] }, brief));
  assert.equal(fixed.groups[3].words[0], "NALA");
  parentGroup.entries[0] = { tile: "UNKNOWN", source: "UNKNOWN", evidence: "UNKNOWN" };
  assert.throws(() => parseOutput(JSON.stringify(data), brief), /wasn't supported/);
});

test("quoting grammar words does not make a meaningful personal connection", () => {
  const words = ["live", "lived", "on", "was"];
  const group = { category: "Words from our conversations", clue: "Read these backward", explanation: "Words you have used together", kind: "personal", operation: "reverse", fixedText: "", entries: words.map(source => ({ tile: Array.from(source).reverse().join(""), source, evidence: source })) };
  const data = { puzzle: { title: "Our puzzle", topic: "Our story", description: "A puzzle for you", groups: [group, group, group, group] } };
  assert.throws(() => parseOutput(JSON.stringify(data), { purpose: "fun", personalization: "memories-only", notes: words.join(" ") }), /ordinary sentence words/);
});

test("played history is bounded generation context and never a replacement for story evidence", () => {
  const row = { category: "Our shows", words: ["ONE", "TWO", "THREE", "FOUR"], rule: "literal", playedAt: 1 };
  const brief = { purpose: "fun", interests: "", topic: "", notes: "Our memory", difficulty: "balanced", familiarity: "new", playedConnections: Array.from({ length: 60 }, (_, i) => ({ ...row, category: `Group ${i}` })) };
  const accepted = validateBrief(brief);
  assert.equal(accepted.playedConnections.length, 40);
  assert.equal(accepted.playedConnections[0].category, "Group 20");
  assert.equal(accepted.playedConnections[0].playedAt, undefined);
  assert.throws(() => validateBrief({ ...brief, playedConnections: Array(81).fill(row) }), /history/);
  assert.throws(() => validateBrief({ ...brief, playedConnections: [{ ...row, words: ["ONE", "ONE!", "THREE", "FOUR"] }] }), /history/);
  assert.throws(() => validateBrief({ ...brief, playedConnections: [{ ...row, rule: "invented" }] }), /history/);
});

test("private cloud retains history and optional drafts, merges older clients without crossing owners", async () => {
  const db = database();
  const row = { category: "Our shows", words: ["ONE", "TWO", "THREE", "FOUR"], rule: "literal", playedAt: 1 };
  const prompt = { question: "A recent memory?", forStory: "key", dismissed: true, answer: "An unfinished answer" };
  const profile = { id: "history", name: "Our story", updatedAt: 10, brief: { storyAnswers: ["An existing answer"], playedConnections: [row], freshnessPrompt: prompt } };
  const saved = await saveStory(db, "owner", profile);
  assert.deepEqual(saved.brief.freshnessPrompt, prompt);
  assert.equal(saved.brief.playedConnections.length, 1);
  const olderClient = await saveStory(db, "owner", { ...profile, updatedAt: 11, brief: { storyAnswers: ["Keep this answer too"] } });
  assert.equal(olderClient.brief.playedConnections.length, 1);
  const extra = { ...row, words: ["FIVE", "SIX", "SEVEN", "EIGHT"], playedAt: 2 };
  const merged = await saveStory(db, "owner", { ...profile, updatedAt: 12, brief: { ...profile.brief, playedConnections: [extra, { ...row, words: [...row.words].reverse() }] } });
  assert.equal(merged.brief.playedConnections.length, 2);
  assert.equal(merged.brief.storyAnswers[0], "An existing answer");
  const other = await saveStory(db, "other-owner", { ...profile, brief: { storyAnswers: ["Unrelated"] } });
  assert.equal(other.brief.playedConnections, undefined);
  await assert.rejects(saveStory(db, "owner", { ...profile, updatedAt: 9 }), /newer version/);
});

test("missing story yields one bounded branching question rather than an unstructured generation error", async () => {
  const original = globalThis.fetch;
  const question = "What are a few favorite stops from your beach trips?";
  let reply = question;
  globalThis.fetch = async () => Response.json({ stop_reason: "end_turn", content: [{ type: "text", text: JSON.stringify({ puzzle: null, question: reply }) }] });
  const make = () => new Request("https://service.example/api/puzzle", { method: "POST", headers: { "oai-authenticated-user-id": "owner", Origin: "https://service.example", "Content-Type": "application/json" }, body: JSON.stringify({ purpose: "fun", interests: "", notes: "We enjoy beach trips", topic: "", difficulty: "balanced", familiarity: "new" }) });
  try {
    const response = await worker.fetch(make(), { DB: database(), ANTHROPIC_API_KEY: "test-secret" });
    assert.equal(response.status, 422);
    const data = await response.json();
    assert.equal(data.code, "needs_story"); assert.equal(data.question, question);
    reply = "Could you share at least four new named things you've shared, such as shows, restaurants, relatives and places so I can build four fresh personal groups?";
    const broad = await (await worker.fetch(make(), { DB: database(), ANTHROPIC_API_KEY: "test-secret" })).json();
    assert.equal(broad.code, "needs_story"); assert.equal(broad.question, undefined);
  } finally { globalThis.fetch = original; }
});

test("a remix can carry an optional question without exposing source quotations", () => {
  const groups = ["A", "B", "C", "D"].map(prefix => ({ category: "Our favorites", clue: "A clue", explanation: "Favorites you enjoy", operation: "literal", kind: "personal", entries: [1,2,3,4].map(i => ({ tile: prefix+i, source: prefix+i, evidence: prefix+i })) }));
  const question = "What other places do you remember from your trips?";
  const parsed = JSON.parse(parseOutput(JSON.stringify({ question, puzzle: { title: "Our puzzle", topic: "Us", description: "A puzzle for you", groups } }), { purpose: "fun", notes: "", personalization: "memories-only" }));
  assert.equal(parsed.followUpQuestion, question);
  assert.ok(!JSON.stringify(parsed).includes('"evidence"'));
});

function wordplayFixture(operation) {
  const sources = ["River Walk", "Silver Screen", "Garden Gate", "Harbor Light"];
  const groups = ["A", "B", "C"].map(prefix => ({ category: "Our named favorites", clue: "A clue", explanation: "Names you both recognize", kind: "personal", operation: "literal", fixedText: "", entries: [1,2,3,4].map(i => ({ tile: prefix+i, source: prefix+i, evidence: prefix+i })) }));
  groups.push({ category: "Familiar names missing their first word", clue: "Put back a missing word", explanation: "Complete the names you recognize: River Walk, Silver Screen, Garden Gate and Harbor Light.", kind: "personal", operation, fixedText: "", entries: sources.map(source => ({ tile: source.split(' ')[operation === "first-word" ? 0 : 1], source, evidence: source })) });
  return { data: { question: "", puzzle: { title: "Our puzzle", topic: "Our story", description: "For you", groups } }, brief: { purpose: "fun", personalization: "memories-only", difficulty: "balanced", notes: groups.flatMap(g => g.entries.map(e => e.source)).join(" ") } };
}

test("missing-word rules preserve full personal phrases, reject inconsistent halves and keep quotes private", () => {
  for (const operation of ["first-word", "last-word"]) {
    const { data, brief } = wordplayFixture(operation);
    const parsed = JSON.parse(parseOutput(JSON.stringify(data), brief));
    assert.equal(parsed.groups[3].rule, operation);
    assert.equal(parsed.groups[3].sourceWords[0], "River Walk");
    assert.ok(!JSON.stringify(parsed).includes('"evidence"'));
    data.puzzle.groups[3].entries[0].tile = "NOPE";
    assert.throws(() => parseOutput(JSON.stringify(data), brief), /missing-word/);
    const prepared = prepareDraft(data, brief);
    assert.equal(prepared.puzzle.groups[3].entries[0].tile, operation === "first-word" ? "River" : "Walk");
    data.puzzle.groups[3].entries[0].source = "Invented Place";
    assert.throws(() => parseClaudeResponse({ stop_reason: "end_turn", content: [{ type: "text", text: JSON.stringify(data) }] }, brief), /wasn't supported/);
  }
});

test("whole-board review rejects overlap and unsupported wording without silently regenerating", async () => {
  const { data, brief } = wordplayFixture("last-word");
  const text = parseOutput(JSON.stringify(data), brief);
  const original = globalThis.fetch;
  let calls = 0;
  let fair = false;
  globalThis.fetch = async (_url, options) => {
    calls++;
    const request = JSON.parse(options.body);
    assert.equal(request.max_tokens, 4000);
    assert.equal(JSON.parse(request.messages[0].content).puzzle.groups.length, 4);
    return Response.json({ stop_reason: "end_turn", content: [{ type: "text", text: JSON.stringify({ fair, issue: fair ? "none" : "overlap", reason: "Several food shops also fit the other restaurant group" }) }] });
  };
  try {
    await assert.rejects(reviewPersonalPuzzle(text, brief, "test-secret"), /whole-board fairness/);
    assert.equal(calls, 1);
    fair = true;
    assert.equal(await reviewPersonalPuzzle(text, brief, "test-secret"), text);
    assert.equal(calls, 2);
    await reviewPersonalPuzzle(text, { ...brief, purpose: "study" }, "test-secret");
    assert.equal(calls, 2);
  } finally { globalThis.fetch = original; }
  assert.throws(() => parseReview({ stop_reason: "max_tokens", content: [] }), /didn't finish/);
  assert.throws(() => parseReview({ stop_reason: "end_turn", content: [{ type: "text", text: '{"fair":true,"issue":"unsupported"}' }] }), /fairness/);
  assert.match(reviewRequest(JSON.parse(text), brief).system, /recurring\/current visits after a move/);
});

test("cloud backups retain complete wordplay phrases for played-history comparisons", async () => {
  const db = database();
  const { data, brief } = wordplayFixture("last-word");
  const group = JSON.parse(parseOutput(JSON.stringify(data), brief)).groups[3];
  const saved = await saveStory(db, "owner", { id: "wordplay", name: "Story", updatedAt: 1, brief: { playedConnections: [{ category: group.category, words: group.words, rule: group.rule, sourceWords: group.sourceWords, playedAt: 1 }] } });
  assert.deepEqual(saved.brief.playedConnections[0].sourceWords, group.sourceWords);
});

test("production route never releases a personal board before the independent review passes", async () => {
  const { data, brief } = wordplayFixture("last-word");
  const original = globalThis.fetch;
  let calls = 0, fair = false;
  globalThis.fetch = async (_url, options) => {
    calls++;
    const isReview = JSON.parse(options.body).output_config.format.schema.properties.fair;
    return Response.json({ stop_reason: "end_turn", content: [{ type: "text", text: JSON.stringify(isReview ? { fair, issue: fair ? "none" : "overlap", reason: "An ambiguous partition" } : data) }] });
  };
  const make = () => new Request("https://service.example/api/puzzle", { method: "POST", headers: { "oai-authenticated-user-id": "owner", Origin: "https://service.example", "Content-Type": "application/json" }, body: JSON.stringify({ interests: "", topic: "", familiarity: "new", ...brief }) });
  try {
    const env = { DB: database(), ANTHROPIC_API_KEY: "test-secret" };
    const rejected = await worker.fetch(make(), env);
    assert.equal(rejected.status, 422);
    assert.match((await rejected.json()).error, /fairness/);
    assert.equal(calls, 2);
    fair = true;
    const accepted = await worker.fetch(make(), env);
    assert.equal(accepted.status, 200);
    assert.equal(JSON.parse((await accepted.json()).text).groups[3].rule, "last-word");
    assert.equal(calls, 4);
  } finally { globalThis.fetch = original; }
});

test("unquoted life-history, market and recurring-visit claims cannot enter player wording", () => {
  const { data, brief } = wordplayFixture("last-word");
  for (const narration of ["Places where you grew up", "Your favorite farmer's market", "Restaurants we keep going back to", "Places you visit often", "Restaurants you regularly visit"]) {
    data.puzzle.groups[0].explanation = narration;
    assert.throws(() => parseOutput(JSON.stringify(data), brief), /unsupported routine or life-history/);
  }
});

test("quote recovery uses a unique verbatim story span, never an invented source or ambiguous passage", () => {
  const notes = "We lived in Cedar Bay before moving to Harbor Light.";
  const entry = { source: "Harbor Light", tile: "Light", evidence: "We moved over to Harbor Light together" };
  const fixed = groundExcerpt(entry, notes);
  assert.ok(notes.includes(fixed.evidence));
  assert.equal(fixed.source, entry.source);
  assert.equal(fixed.tile, entry.tile);
  assert.deepEqual(groundExcerpt({ ...entry, source: "Unknown Town" }, notes), { ...entry, source: "Unknown Town" });
  assert.deepEqual(groundExcerpt(entry, notes + " Harbor Light"), entry);
  const valid = { ...entry, evidence: "Harbor Light" };
  assert.equal(groundExcerpt(valid, notes), valid);
  const { data, brief } = wordplayFixture("last-word");
  data.puzzle.groups[0].category = "Our parents";
  data.puzzle.groups[0].clue = "The people who raised you both";
  const prepared = prepareDraft(data, brief);
  assert.doesNotMatch(prepared.puzzle.groups[0].clue, /raised/);
  assert.equal(data.puzzle.groups[0].clue, "The people who raised you both");
});

test("cloud updates from a four-answer client cannot remove the fifth saved answer", async () => {
 const db = database();
 const fifth = { question: "What else do you remember?", answer: "A very detailed fifth answer" };
 const original = { id: "cross-device", name: "Our story", updatedAt: 100, brief: { storyAnswers: ["One", "Two", "Three", "Four"], extraAnswers: [fifth] } };
 await saveStory(db, "owner", original);
 const saved = await saveStory(db, "owner", { ...original, updatedAt: 200, brief: { storyAnswers: ["One", "Two", "Three", "Four"], extraAnswers: [] } });
 assert.deepEqual(saved.brief.extraAnswers, [fifth]);
 const loaded = JSON.parse(db.sqlite.prepare("SELECT data FROM stories WHERE owner = ? AND id = ?").get("owner", original.id).data);
 assert.deepEqual(loaded.brief.extraAnswers, [fifth]);
});

test("automatic connection runs only for the exact configured game origin and has no second generation button", async () => {
 const make = origin => new Request("https://service.example/bridge?origin=" + encodeURIComponent(origin) + "&channel=test");
 const env = { GAME_ORIGINS: "https://game.example" };
 const trusted = await (await worker.fetch(make(env.GAME_ORIGINS), env)).text();
 assert.match(trusted, /const trusted=true/);
 assert.ok(!trusted.includes('id="generate"'));
 assert.ok(!trusted.includes('Press below'));
 const untrusted = await (await worker.fetch(make("https://evil.example"), env)).text();
 assert.match(untrusted, /const trusted=false/);
 assert.match(trusted, /event.origin!==source/);
 assert.match(trusted, /event.source!==window.opener/);
});

test("the real connection script automatically handles and deduplicates requests without another button", async () => {
 const { runInNewContext } = await import("node:vm");
 const origin = "https://game.example";
 const html = await (await worker.fetch(new Request("https://service.example/bridge?origin="+encodeURIComponent(origin)+"&channel=one"), { GAME_ORIGINS: origin })).text();
 let listener; const posts = []; const calls = [];
 const opener = { postMessage(value, target) { posts.push({ value, target }); } };
 const context = { URLSearchParams, location: { search: "?origin="+encodeURIComponent(origin)+"&channel=one" }, document: { getElementById() { return { textContent: "" }; } }, window: { opener, close() {}, addEventListener(_type, fn) { listener = fn; } }, setInterval() { return 1; }, clearInterval() {}, setTimeout() { return 1; }, fetch: async (path, options) => { calls.push({ path, body: JSON.parse(options.body) }); return { ok: true, json: async () => path.endsWith("load") ? { profiles: [] } : { saved: true } }; } };
 runInNewContext(html.match(/<script>([\s\S]*)<\/script>/)[1], context);
 const message = { origin, source: opener, data: { type: "common-thread-brief", channel: "one", requestId: "load", operation: "load-story", brief: {} } };
 listener({ ...message, origin: "https://evil.example" });
 listener(message); listener(message);
 listener({ ...message, data: { ...message.data, requestId: "save", operation: "save-story", brief: { id: "our-story" } } });
 await new Promise(resolve => setImmediate(resolve));
 assert.deepEqual(calls.map(call => call.path), ["/api/story/load", "/api/story/save"]);
 assert.deepEqual(posts.filter(post => post.value.type === "common-thread-result").map(post => post.value.requestId), ["load", "save"]);
 assert.ok(posts.every(post => post.target === origin));
});

test("an older client generation receives a fifth memory already in cloud without deleting it", async () => {
 const db = database(); const story = { id: "cloud-fifth", name: "Our story", updatedAt: 100, brief: { storyAnswers: ["One", "Two", "Three", "Four"], extraAnswers: [{ question: "Another memory?", answer: "An important fifth memory" }] } };
 await saveStory(db, "owner", story);
 const original = globalThis.fetch; let calls = 0;
 globalThis.fetch = async (_url, options) => { calls++; assert.ok(JSON.parse(options.body).messages[0].content.includes("An important fifth memory")); return Response.json({ stop_reason: "end_turn", content: [{ type: "text", text: '{"puzzle":null,"question":"Which places do you remember?"}' }] }); };
 try {
  const request = new Request("https://service.example/api/puzzle", { method: "POST", headers: { "oai-authenticated-user-id": "owner", Origin: "https://service.example", "Content-Type": "application/json" }, body: JSON.stringify({ purpose: "fun", notes: "One Two Three Four", interests: "", topic: "", difficulty: "balanced", familiarity: "new", story: { ...story, updatedAt: 200, brief: { storyAnswers: story.brief.storyAnswers } } }) });
  assert.equal((await worker.fetch(request, { DB: db, ANTHROPIC_API_KEY: "test-secret" })).status, 422);
  assert.equal(calls, 1);
 } finally { globalThis.fetch = original; }
});
