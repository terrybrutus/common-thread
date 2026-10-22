import { afterEach, describe, expect, it, vi } from "vitest";
import { setAccountSession } from "../account/session";
import { StoryQuestionError } from "../creator/followUp";
import {
  CLAUDE_SERVICE,
  disconnectStoryCloud,
  hostedGeneration,
  hostedOperation,
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
    const promise = hostedGeneration(brief);
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
        operation: "generate",
        requestId: expect.any(String),
      }),
      CLAUDE_SERVICE,
    );
    message(CLAUDE_SERVICE, "common-thread-result", "puzzle-json");
    await expect(promise).resolves.toBe("puzzle-json");
  });
  it("reuses one connection for repeated generation and background saving", async () => {
    const popup = { closed: false, postMessage: vi.fn() };
    const open = vi
      .spyOn(window, "open")
      .mockReturnValue(popup as unknown as Window);
    vi.spyOn(window, "focus").mockImplementation(() => {});
    const first = hostedGeneration({ notes: "One" });
    const channel = new URL(String(open.mock.calls[0][0])).searchParams.get(
      "channel",
    );
    const reply = (data: object) =>
      window.dispatchEvent(
        new MessageEvent("message", {
          origin: CLAUDE_SERVICE,
          source: popup as unknown as Window,
          data: { channel, ...data },
        }),
      );
    reply({ type: "common-thread-ready" });
    const firstId = popup.postMessage.mock.calls[0][0].requestId;
    reply({ type: "common-thread-result", requestId: firstId, text: "first" });
    await expect(first).resolves.toBe("first");
    const second = hostedGeneration({ notes: "Two" });
    const save = hostedOperation("save-story", { id: "ours" }, true);
    expect(open).toHaveBeenCalledTimes(1);
    const secondId = popup.postMessage.mock.calls[1][0].requestId;
    const saveId = popup.postMessage.mock.calls[2][0].requestId;
    reply({
      type: "common-thread-result",
      requestId: saveId,
      value: { saved: true },
    });
    reply({
      type: "common-thread-result",
      requestId: secondId,
      text: "second",
    });
    await expect(save).resolves.toEqual({ saved: true });
    await expect(second).resolves.toBe("second");
  });
  it("never opens another window for a disconnected background autosave", async () => {
    const open = vi.spyOn(window, "open");
    await expect(hostedOperation("save-story", {}, true)).rejects.toThrow(
      "Reconnect",
    );
    expect(open).not.toHaveBeenCalled();
  });
  it("explains blocked popups", async () => {
    vi.spyOn(window, "open").mockReturnValue(null);
    await expect(hostedGeneration({})).rejects.toThrow("Allow pop-ups");
  });
  it("preserves a structured story question through the trusted private window", async () => {
    const popup = { closed: false, postMessage: vi.fn() };
    const open = vi
      .spyOn(window, "open")
      .mockReturnValue(popup as unknown as Window);
    vi.spyOn(window, "focus").mockImplementation(() => {});
    const promise = hostedGeneration({});
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
