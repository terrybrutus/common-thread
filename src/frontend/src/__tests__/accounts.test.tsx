import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { packVariants } from "../../../../services/claude/shared/knowledge.js";
import {
  ACCOUNT_RELOAD_EVENT,
  accountRequest,
  clearAccountCache,
  setAccountGeneration,
  setAccountSession,
  storageKey,
} from "../account/session";
import { STORY_KEY, readLibrary, storyStorageKey } from "../creator/library";
import { dailyPuzzle } from "../game/daily";
import {
  deleteTopic,
  loadLearningDraft,
  openTopic,
  saveLearningDraft,
  saveTopic,
  savedTopics,
} from "../knowledge/learning";
beforeEach(() => {
  localStorage.clear();
  setAccountSession("guest");
});
afterEach(() => {
  setAccountSession("guest");
  vi.unstubAllGlobals();
});
describe("private saved accounts", () => {
  it("never imports the old beta story into a guest or newly signed-in account", () => {
    localStorage.setItem(
      STORY_KEY,
      JSON.stringify({
        profiles: [{ brief: { storyAnswers: ["TERRY PRIVATE STORY"] } }],
      }),
    );
    setAccountSession("alice");
    const library = readLibrary();
    library.profiles[0].brief.storyAnswers = ["ALICE PRIVATE"];
    localStorage.setItem(storyStorageKey(), JSON.stringify(library));
    saveLearningDraft({
      kind: "material",
      topic: "Biology",
      material: "ALICE STUDY NOTES",
    });
    setAccountSession("bob");
    expect(JSON.stringify(readLibrary())).not.toContain("ALICE PRIVATE");
    expect(JSON.stringify(readLibrary())).not.toContain("TERRY PRIVATE");
    expect(loadLearningDraft().material).toBe("");
    setAccountSession("alice");
    expect(readLibrary().profiles[0].brief.storyAnswers).toEqual([
      "ALICE PRIVATE",
    ]);
    expect(loadLearningDraft().material).toBe("ALICE STUDY NOTES");
    clearAccountCache();
    expect(localStorage.getItem(STORY_KEY)).toContain("TERRY PRIVATE");
  });
  it("discards an in-flight private response after account switching", async () => {
    let release: (r: Response) => void = () => {};
    const fetcher = vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          release = resolve;
        }),
    );
    vi.stubGlobal("fetch", fetcher);
    setAccountSession("alice", async () => "ab".repeat(32));
    const pending = accountRequest("/api/story/load");
    await vi.waitFor(() => expect(fetcher).toHaveBeenCalled());
    setAccountSession("bob", async () => "cd".repeat(32));
    release(Response.json({ profiles: ["ALICE PRIVATE"] }));
    await expect(pending).rejects.toThrow("account changed");
  });
  it("rejects an old response even when the same account reopens after a reset", async () => {
    let release: (r: Response) => void = () => {};
    const fetcher = vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          release = resolve;
        }),
    );
    vi.stubGlobal("fetch", fetcher);
    setAccountSession("alice", async () => "ab".repeat(32));
    setAccountGeneration("123");
    const pending = accountRequest("/api/story/load");
    await vi.waitFor(() => expect(fetcher).toHaveBeenCalled());
    setAccountGeneration("456");
    release(Response.json({ profiles: ["OLD DATA"] }));
    await expect(pending).rejects.toThrow("account changed");
  });
  it("clears only the active account cache when deleted and does not keep a bearer token in storage", async () => {
    setAccountSession("alice", async () => "ab".repeat(32));
    localStorage.setItem(storageKey("stories"), "ALICE");
    setAccountSession("bob");
    localStorage.setItem(storageKey("stories"), "BOB");
    setAccountSession("alice", async () => "ab".repeat(32));
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json(
          { code: "account_deleted", error: "Deleted" },
          { status: 410 },
        ),
      ),
    );
    await expect(accountRequest("/api/story/load")).rejects.toThrow("Deleted");
    expect(localStorage.getItem(storageKey("stories"))).toBeNull();
    setAccountSession("bob");
    expect(localStorage.getItem(storageKey("stories"))).toBe("BOB");
    expect(JSON.stringify(localStorage)).not.toContain("ab".repeat(32));
  });
  it("sends the account version and discards stale device caches after a reset", async () => {
    setAccountSession("alice", async () => "ab".repeat(32));
    setAccountGeneration("123");
    localStorage.setItem(storageKey("stories"), "STALE");
    const changed = vi.fn();
    window.addEventListener(ACCOUNT_RELOAD_EVENT, changed);
    const fetcher = vi.fn(async (_url: string, _init: RequestInit) =>
      Response.json(
        { code: "account_changed", error: "Account reset" },
        { status: 409 },
      ),
    );
    vi.stubGlobal("fetch", fetcher);
    await expect(accountRequest("/api/story/save")).rejects.toThrow(
      "Account reset",
    );
    expect(
      (fetcher.mock.calls[0]?.[1]?.headers as Record<string, string>)[
        "X-Account-Version"
      ],
    ).toBe("123");
    expect(localStorage.getItem(storageKey("stories"))).toBeNull();
    expect(changed).toHaveBeenCalledOnce();
    window.removeEventListener(ACCOUNT_RELOAD_EVENT, changed);
  });
  it("keeps a saved topic editable, records a changed subject separately, and isolates topic libraries", async () => {
    setAccountSession("alice");
    const knicks = await saveTopic({
      kind: "topic",
      topic: "New York Knicks",
      material: "hidden unused draft",
      connect: true,
    });
    expect(knicks.material).toBe("");
    const city = await saveTopic({ ...knicks, topic: "New York City" });
    expect(city.id).not.toBe(knicks.id);
    expect(savedTopics()).toHaveLength(2);
    expect((await openTopic(knicks.id)).topic).toBe("New York Knicks");
    setAccountSession("bob");
    expect(savedTopics()).toEqual([]);
    await expect(openTopic(knicks.id)).rejects.toThrow("couldn");
    setAccountSession("alice");
    await deleteTopic(city.id);
    expect(savedTopics()).toHaveLength(1);
  });
});
describe("daily puzzle collection", () => {
  it("has 365 distinct four-group boards with sixteen distinct tiles and two factual/two wordplay connections", () => {
    const combinations = new Set<string>();
    for (let day = 0; day < 365; day++) {
      const p = dailyPuzzle(new Date(Date.UTC(2026, 0, 1 + day)));
      expect(p.groups).toHaveLength(4);
      expect(new Set(p.groups.flatMap((g) => g.words))).toHaveProperty(
        "size",
        16,
      );
      expect(p.groups.filter((g) => g.rule === "literal")).toHaveLength(2);
      expect(new Set(p.groups.map((g) => g.id.split(":")[0])).size).toBe(4);
      combinations.add(p.groups.map((g) => g.id).join("|"));
      for (const g of p.groups) {
        const [pack, id] = g.id.split(":");
        expect(packVariants(pack).find((v) => v.id === id)?.words).toEqual(
          g.words,
        );
      }
    }
    expect(combinations.size).toBe(365);
  });
  it("changes at local midnight and uses the same board throughout a local calendar date", () => {
    expect(dailyPuzzle(new Date(2026, 9, 22, 0, 1)).id).toBe(
      "daily-2026-10-22",
    );
    expect(dailyPuzzle(new Date(2026, 9, 22, 23, 59, 59)).id).toBe(
      "daily-2026-10-22",
    );
    expect(dailyPuzzle(new Date(2026, 9, 23, 0, 0)).id).toBe(
      "daily-2026-10-23",
    );
    expect(dailyPuzzle(new Date(2026, 9, 23, 0, 0)).groups).not.toEqual(
      dailyPuzzle(new Date(2026, 9, 22, 23, 59, 59)).groups,
    );
  });
  it("uses calendar dates for archives across daylight-saving changes, leap days and year boundaries", () => {
    expect(dailyPuzzle(new Date(2026, 2, 9, 0, 30), 1).id).toBe(
      "daily-2026-03-08",
    );
    expect(dailyPuzzle(new Date(2026, 10, 1, 23, 30), 1).id).toBe(
      "daily-2026-10-31",
    );
    expect(dailyPuzzle(new Date(2028, 2, 1, 0, 30), 1).id).toBe(
      "daily-2028-02-29",
    );
    expect(dailyPuzzle(new Date(2027, 0, 1, 0, 30), 1).id).toBe(
      "daily-2026-12-31",
    );
  });
});
