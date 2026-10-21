import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { knowledgeBoard } from "../../../../services/claude/shared/knowledge.js";
import App from "../App";
import {
  generateKnowledgeBoard,
  readPackHistory,
} from "../knowledge/KnowledgePacks";

describe("knowledge packs", () => {
  it("offers six packs behind one entry, plays without AI, explains a letter-removal group and remembers only uncovered groups", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(
      screen.getByRole("button", { name: /Explore knowledge packs/ }),
    );
    const packs = screen.getByRole("group", { name: "Knowledge packs" });
    expect(within(packs).getAllByRole("button")).toHaveLength(6);
    await user.click(
      screen.getByRole("button", { name: /General Knowledge A little/ }),
    );
    await user.click(
      screen.getByRole("button", { name: /Play starter board/ }),
    );
    const board = knowledgeBoard("general");
    expect(
      within(
        screen.getByRole("group", { name: "Words to connect" }),
      ).getAllByRole("button"),
    ).toHaveLength(16);
    expect(readPackHistory("general").groups).toEqual([]);
    for (const word of board.groups[3].words)
      await user.click(screen.getByRole("button", { name: word }));
    await user.click(screen.getByRole("button", { name: "Check group" }));
    expect(
      screen.getByRole("heading", {
        name: "Animals, minus their first letter",
      }),
    ).toBeVisible();
    expect(screen.getByText(/Restore the first letters: BEAR/)).toBeVisible();
    expect(readPackHistory("general").groups).toEqual(["animals-drop"]);
    expect(readPackHistory("world").groups).toEqual([]);
    await user.click(screen.getByRole("button", { name: "All modes" }));
    expect(
      screen.getByRole("heading", { name: /Find a thread. Learn something/ }),
    ).toBeVisible();
  });
  it("sends only pack preferences and pack history to AI, keeps answers hidden until play, and shows failures without a fallback", async () => {
    const user = userEvent.setup();
    const mock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Draft did not pass its check." }),
    });
    vi.stubGlobal("fetch", mock);
    localStorage.setItem(
      "common-thread-stories",
      "PRIVATE STORY THAT MUST NOT BE SENT",
    );
    render(<App />);
    await user.click(
      screen.getByRole("button", { name: /Explore knowledge packs/ }),
    );
    await user.click(screen.getByRole("button", { name: "Make an AI remix" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Draft did not pass",
    );
    expect(
      screen.queryByRole("group", { name: "Words to connect" }),
    ).not.toBeInTheDocument();
    const sent = JSON.parse(mock.mock.calls[0][1].body);
    expect(sent.knowledgePack).toBe("world");
    expect(sent.notes).toBe("");
    expect(JSON.stringify(sent)).not.toContain("PRIVATE STORY");
    mock.mockResolvedValue({
      ok: true,
      json: async () => ({ text: JSON.stringify(knowledgeBoard("world")) }),
    });
    await user.click(screen.getByRole("button", { name: "Make an AI remix" }));
    expect(
      await screen.findByRole("group", { name: "Words to connect" }),
    ).toBeVisible();
    expect(
      screen.queryByText("Country names ending in ___LAND"),
    ).not.toBeInTheDocument();
    vi.unstubAllGlobals();
  });
  it("never accepts an unreviewed connection returned by a malformed endpoint response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          text: JSON.stringify({ groups: [{ id: "world:invented" }] }),
        }),
      }),
    );
    await expect(
      generateKnowledgeBoard("world", "balanced", ""),
    ).rejects.toThrow();
    vi.unstubAllGlobals();
  });
});
