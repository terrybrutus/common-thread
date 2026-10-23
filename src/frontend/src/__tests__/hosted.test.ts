import { afterEach, describe, expect, it, vi } from "vitest";
import { setAccountSession } from "../account/session";
import { StoryQuestionError } from "../creator/followUp";
import {
  CLAUDE_SERVICE,
  disconnectStoryCloud,
  hostedGeneration,
  hostedOperation,
  legacyOwnerOperation,
} from "../creator/hosted";

describe("private hosted connection", () => {
  afterEach(() => {
    setAccountSession("guest");
    vi.unstubAllGlobals();
    disconnectStoryCloud();
    vi.restoreAllMocks();
  });
  it("keeps the optional memory question on the authenticated direct path without opening a popup", async () => {
    setAccountSession("alice", async () => "ab".repeat(32));
    const open = vi.spyOn(window, "open");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json(
          {
            code: "needs_story",
            question: "What did you enjoy on your first trip?",
            error: "One memory could help",
          },
          { status: 422 },
        ),
      ),
    );
    await expect(hostedGeneration({ purpose: "fun" })).rejects.toBeInstanceOf(
      StoryQuestionError,
    );
    expect(open).not.toHaveBeenCalled();
  });
  it("accepts only the expected popup, origin, and channel", async () => {
    const popup = { closed: false, postMessage: vi.fn() };
    const open = vi
      .spyOn(window, "open")
      .mockReturnValue(popup as unknown as Window);
    vi.spyOn(window, "focus").mockImplementation(() => {});
    const brief = { notes: "Private memories" };
    const promise = legacyOwnerOperation("restore-beta", brief);
    const target = new URL(String(open.mock.calls[0][0]));
    const channel = target.searchParams.get("channel");
    expect(target.search).not.toContain("Private");
    function message(origin: string, type: string, text = "") {
      window.dispatchEvent(
        new MessageEvent("message", {
          origin,
          source: popup as unknown as Window,
          data: { channel, type, text },
        }),
      );
    }
    message("https://evil.example", "common-thread-ready");
    expect(popup.postMessage).not.toHaveBeenCalled();
    message(CLAUDE_SERVICE, "common-thread-ready");
    expect(popup.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "common-thread-brief",
        channel,
        brief,
        operation: "restore-beta",
        requestId: expect.any(String),
      }),
      CLAUDE_SERVICE,
    );
    message(CLAUDE_SERVICE, "common-thread-result", "puzzle-json");
    await expect(promise).resolves.toBe("puzzle-json");
  });
  it("never opens ChatGPT storage when saving or loading without Google sign-in", async () => {
    const open = vi.spyOn(window, "open");
    for (const operation of ["save-story", "load-story", "generate"] as const) {
      await expect(hostedOperation(operation, {})).rejects.toThrow(
        "Sign in with Google",
      );
      await expect(hostedOperation(operation, {}, true)).rejects.toThrow(
        "Sign in with Google",
      );
    }
    expect(open).not.toHaveBeenCalled();
  });
  it("uses the Google-linked game session for saved stories without another login", async () => {
    setAccountSession("alice", async () => "ab".repeat(32));
    const open = vi.spyOn(window, "open");
    const fetcher = vi.fn(async (_url: string, _options?: RequestInit) =>
      Response.json({ saved: true }),
    );
    vi.stubGlobal("fetch", fetcher);
    await hostedOperation("save-story", { id: "mine" });
    await hostedOperation("load-story", {});
    expect(fetcher.mock.calls[0][0]).toBe(`${CLAUDE_SERVICE}/api/story/save`);
    expect(fetcher.mock.calls[1][0]).toBe(`${CLAUDE_SERVICE}/api/story/load`);
    expect(open).not.toHaveBeenCalled();
  });
  it("preserves a structured story question through the trusted private window", async () => {
    const popup = { closed: false, postMessage: vi.fn() };
    const open = vi
      .spyOn(window, "open")
      .mockReturnValue(popup as unknown as Window);
    vi.spyOn(window, "focus").mockImplementation(() => {});
    const promise = hostedOperation("generate", {}, false, true);
    const question = "Which places do you remember from that trip?";
    const channel = new URL(String(open.mock.calls[0][0])).searchParams.get(
      "channel",
    );
    window.dispatchEvent(
      new MessageEvent("message", {
        origin: CLAUDE_SERVICE,
        source: popup as unknown as Window,
        data: {
          channel,
          type: "common-thread-error",
          code: "needs_story",
          question,
          error: "A memory would help",
        },
      }),
    );
    await expect(promise).rejects.toEqual(new StoryQuestionError(question));
  });
});
