import { afterEach, describe, expect, it, vi } from "vitest";
import { CLAUDE_SERVICE, hostedGeneration } from "../creator/hosted";

describe("private hosted connection", () => {
  afterEach(() => {
    vi.restoreAllMocks();
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
      { type: "common-thread-brief", channel, brief },
      CLAUDE_SERVICE,
    );
    message(CLAUDE_SERVICE, "common-thread-result", "puzzle-json");
    await expect(promise).resolves.toBe("puzzle-json");
  });
  it("explains blocked popups", async () => {
    vi.spyOn(window, "open").mockReturnValue(null);
    await expect(hostedGeneration({})).rejects.toThrow("Allow pop-ups");
  });
});
