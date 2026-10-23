import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App";
import { generatePuzzle, generationRequest } from "../creator/ai";
import { parseProfile, readLibrary } from "../creator/library";
import { defaultBrief, makeChallenge } from "../creator/schema";
import { puzzles } from "../game/puzzles";

vi.mock("../creator/ai", async (original) => ({
  ...(await original<typeof import("../creator/ai")>()),
  generatePuzzle: vi.fn(),
}));
beforeEach(() => {
  localStorage.clear();
  vi.mocked(generatePuzzle).mockResolvedValue(puzzles[0]);
});
describe("personal stories for any audience", () => {
  it.each([
    ["My life", "self", /early memory or milestone/],
    ["Someone I know", "someone", /Who is this about/],
    ["A group", "group", /Who's in this group/],
  ] as const)(
    "keeps %s context through saving, generation and direct play",
    async (label, scope, prompt) => {
      const user = userEvent.setup();
      render(<App />);
      await user.click(
        screen.getByRole("button", { name: "Create a personal puzzle" }),
      );
      await user.click(screen.getByRole("radio", { name: label }));
      await user.type(
        screen.getByRole("textbox", { name: prompt }),
        "Camping at Lake Cedar with my family",
      );
      expect(
        screen.queryByText(/A little about you two/),
      ).not.toBeInTheDocument();
      expect(readLibrary().profiles[0].brief.storyScope).toBe(scope);
      await user.click(screen.getByRole("button", { name: "Make my puzzle" }));
      await screen.findByText("Four connections. No spoilers.");
      expect(generatePuzzle).toHaveBeenCalledWith(
        expect.objectContaining({ storyScope: scope, mode: "relaxed" }),
        expect.anything(),
      );
      await user.click(screen.getByRole("button", { name: "Play now" }));
      expect(
        screen.getByRole("heading", { name: puzzles[0].title }),
      ).toBeVisible();
      expect(
        screen.queryByRole("textbox", { name: "Challenge link" }),
      ).not.toBeInTheDocument();
    },
  );
  it("keeps legacy answers and preferences without reassigning them to a solo story", () => {
    const old = parseProfile({
      id: "old",
      name: "Terry and Jessica",
      updatedAt: 1,
      brief: {
        ...defaultBrief,
        mode: "challenge",
        storyAnswers: [
          "Met at an arcade",
          "Alexandria",
          "Jeopardy",
          "Bloopshark",
        ],
      },
    });
    expect(old.brief.storyScope).toBeUndefined();
    expect(old.brief.mode).toBe("challenge");
    expect(generationRequest(old.brief).notes).toContain(
      "How did you meet, or what's an early memory you share?\nMet at an arcade",
    );
    const solo = {
      ...old.brief,
      storyScope: "self" as const,
      recipient: "Jessica",
    };
    expect(generationRequest(solo)).not.toHaveProperty("people");
    expect(makeChallenge(solo, puzzles[0], "ai").recipient).toBe("");
    expect(solo.storyAnswers).toEqual(old.brief.storyAnswers);
  });
  it("retains scope in backups and keeps it out of learning requests", () => {
    const profile = parseProfile({
      id: "group",
      name: "My team",
      brief: {
        ...defaultBrief,
        storyScope: "group",
        storyAnswers: ["Team formed in 2020"],
      },
    });
    expect(
      parseProfile(JSON.parse(JSON.stringify(profile))).brief.storyScope,
    ).toBe("group");
    expect(
      generationRequest({
        ...profile.brief,
        purpose: "study",
        notes: "Biology",
      }),
    ).not.toHaveProperty("storyScope");
  });
});
