import { AnonymousIdentity } from "@icp-sdk/core/agent";
import { Ed25519KeyIdentity } from "@icp-sdk/core/identity";
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

it("disables the old Caffeine inference endpoint before any paid call", async () => {
  await expect(actor.generatePersonalPuzzle({ purpose: "fun", interests: "Nature", topic: "", notes: "", difficulty: "easy", familiarity: "new" })).rejects.toThrow(/not used/i);
});

it("isolates service capabilities, rejects anonymous registration and expires sessions", async () => {
  actor.setIdentity(new AnonymousIdentity());
  await expect(actor.openServiceSession("a".repeat(64))).rejects.toThrow(/sign in/i);
  const alice = Ed25519KeyIdentity.generate(), bob = Ed25519KeyIdentity.generate();
  actor.setIdentity(alice);
  await actor.openServiceSession("a".repeat(64));
  expect((await actor.checkServiceSession("a".repeat(64)))[0]?.toText()).toBe(alice.getPrincipal().toText());
  actor.setIdentity(bob);
  await expect(actor.openServiceSession("a".repeat(64))).rejects.toThrow();
  await actor.closeServiceSession("a".repeat(64));
  expect((await actor.checkServiceSession("a".repeat(64)))[0]?.toText()).toBe(alice.getPrincipal().toText());
  await pic!.advanceTime(31 * 60 * 1000); await pic!.tick();
  expect(await actor.checkServiceSession("a".repeat(64))).toEqual([]);
  actor.setIdentity(new AnonymousIdentity());
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
