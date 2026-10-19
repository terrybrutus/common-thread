import { PocketIc } from "@dfinity/pic";
import type { Actor, CanisterFixture } from "@dfinity/pic";
import { afterAll, beforeAll, expect, it } from "vitest";

import { idlFactory } from "../../src/frontend/src/declarations/backend.did.js";
import type { _SERVICE } from "../../src/frontend/src/declarations/backend.did";

const PIC_URL = process.env.POCKET_IC_URL ?? "";
const BACKEND_WASM = process.env.BACKEND_WASM ?? "";

let pic: PocketIc | undefined;
let actor: Actor<_SERVICE>;
let canisterId: CanisterFixture<_SERVICE>["canisterId"];

beforeAll(async () => {
  pic = await PocketIc.create(PIC_URL);
  ({ actor, canisterId } = await pic.setupCanister<_SERVICE>({
    idlFactory,
    wasm: BACKEND_WASM,
  }));
});

afterAll(async () => {
  await pic?.tearDown();
});

it("answers the API doc query instead of trapping", async () => {
  const doc = await actor.getApiDoc();
  expect(typeof doc).toBe("string");
  expect(doc).toContain("Common Thread");
});

it("answers the schema query instead of trapping", async () => {
  const schema = await actor.schema();
  expect(typeof schema).toBe("string");
});

it("rejects an oversized creator brief before making an inference call", async () => {
  await expect(actor.generatePersonalPuzzle({ purpose: "fun", interests: "x".repeat(241), topic: "", notes: "", difficulty: "easy", familiarity: "new" })).rejects.toThrow(/shorten/i);
});

it("rejects unsupported difficulty before making an inference call", async () => {
  await expect(actor.generatePersonalPuzzle({ purpose: "fun", interests: "Nature", topic: "", notes: "", difficulty: "unknown", familiarity: "new" })).rejects.toThrow(/difficulty/i);
});

it("reports the caller role through the real canister", async () => {
  const role = await actor.getCallerUserRole();
  expect(role).toBeDefined();
  expect(await actor.isCallerAdmin()).toBe(false);
});

it("registers a caller through the public access-control flow without trapping", async () => {
  await expect(actor._initialize_access_control()).resolves.toBeNull();
  const role = await actor.getCallerUserRole();
  expect(role).toBeDefined();
});
