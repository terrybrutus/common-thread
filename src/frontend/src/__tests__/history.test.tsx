import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App";
import { Creator } from "../creator/Creator";
import { generatePuzzle, generationRequest } from "../creator/ai";
import { StoryQuestionError } from "../creator/followUp";
import {
  addFreshMemory,
  familiarCount,
  rememberConnections,
  storyKey,
} from "../creator/history";
import {
  STORY_KEY,
  parseProfile,
  readLibrary,
  recordPlayedGroups,
} from "../creator/library";
import { defaultBrief, makeChallenge, validatePuzzle } from "../creator/schema";
import { decodeChallenge, encodeChallenge } from "../creator/sharing";
import { Game } from "../game/Game";
import { type Group, puzzles } from "../game/puzzles";

vi.mock("../creator/ai", async (original) => ({
  ...(await original<typeof import("../creator/ai")>()),
  generatePuzzle: vi.fn(),
}));
const board = validatePuzzle(puzzles[0]);
function seed(played = true) {
  const brief = {
    ...defaultBrief,
    storyAnswers: ["Our garden walks", "", "", ""],
    playedConnections: played ? rememberConnections([], board.groups, 1) : [],
  };
  const profile = { id: "ours", name: "Our story", updatedAt: 1, brief };
  localStorage.setItem(
    STORY_KEY,
    JSON.stringify({ activeId: profile.id, profiles: [profile] }),
  );
  return profile;
}
async function guess(
  user: ReturnType<typeof userEvent.setup>,
  words: string[],
) {
  for (const word of words)
    await user.click(screen.getByRole("button", { name: word }));
  await user.click(screen.getByRole("button", { name: "Check group" }));
}
beforeEach(() => {
  vi.mocked(generatePuzzle).mockReset();
  window.history.replaceState(null, "", "/");
});

describe("played connections and optional fresh memories", () => {
  it("recognizes missing-word and fill-blank remixes through their full phrases across backups and share links", () => {
    const sourceWords = [
      "River Walk",
      "Silver Screen",
      "Garden Gate",
      "Harbor Light",
    ];
    const original = {
      ...board,
      groups: [
        { ...board.groups[0], words: sourceWords, rule: "literal" as const },
      ],
    };
    const history = rememberConnections([], original.groups, 1);
    const missing = {
      ...board,
      groups: [
        {
          ...board.groups[0],
          rule: "last-word" as const,
          sourceWords,
          words: ["WALK", "SCREEN", "GATE", "LIGHT"],
        },
      ],
    };
    expect(familiarCount(missing, history)).toBe(1);
    const stored = parseProfile({
      id: "halves",
      name: "Story",
      brief: {
        ...defaultBrief,
        playedConnections: rememberConnections([], missing.groups),
      },
    });
    expect(stored.brief.playedConnections?.[0].sourceWords).toEqual(
      sourceWords,
    );
    expect(
      generationRequest(stored.brief).playedConnections?.[0].words,
    ).toEqual(sourceWords.map((w) => w.toLowerCase()));
    const full = {
      ...board,
      groups: [missing.groups[0], ...board.groups.slice(1)],
    };
    const shared = decodeChallenge(
      encodeChallenge(makeChallenge(defaultBrief, full, "ai")),
    );
    expect(shared.puzzle.groups[0].sourceWords).toEqual(sourceWords);
    expect(() =>
      parseProfile({
        ...stored,
        brief: {
          ...stored.brief,
          playedConnections: [
            {
              ...stored.brief.playedConnections?.[0],
              sourceWords: ["Incomplete"],
            },
          ],
        },
      }),
    ).toThrow(/history/);
  });
  it("recognizes renamed, reordered and reversed connections without rejecting genuinely new groups", () => {
    const history = rememberConnections([], board.groups, 1);
    const reversed = {
      ...board,
      groups: board.groups.map((g) => ({
        ...g,
        category: "New label",
        rule: "reverse" as const,
        words: [...g.words]
          .reverse()
          .map((w) => Array.from(w).reverse().join("")),
      })),
    };
    expect(familiarCount(reversed, history)).toBe(4);
    const fresh = {
      ...board,
      groups: [{ ...board.groups[0], words: ["MAPLE", "OAK", "ELM", "PINE"] }],
    };
    expect(familiarCount(fresh, history)).toBe(0);
    expect(rememberConnections(history, board.groups, 2)).toEqual(history);
    expect(
      rememberConnections([], [...board.groups, ...reversed.groups], 2),
    ).toHaveLength(8);
  });
  it("preserves history and question drafts in backups but excludes them from share links", () => {
    const profile = seed();
    const prompt = {
      question: "A new memory?",
      forStory: storyKey(profile.brief),
      dismissed: false,
      answer: "Private unfinished answer",
    };
    const restored = parseProfile(
      JSON.parse(
        JSON.stringify({
          ...profile,
          brief: { ...profile.brief, freshnessPrompt: prompt },
        }),
      ),
    );
    expect(restored.brief.freshnessPrompt).toEqual(prompt);
    expect(restored.brief.playedConnections).toHaveLength(4);
    const shared = decodeChallenge(
      encodeChallenge(makeChallenge(restored.brief, board, "ai")),
    );
    expect(JSON.stringify(shared)).not.toMatch(
      /playedConnections|freshnessPrompt|Private unfinished/,
    );
    expect(
      storyKey({
        ...restored.brief,
        usedTerms: ["A"],
        freshnessPrompt: { ...prompt, dismissed: true },
      }),
    ).toBe(prompt.forStory);
    expect(() =>
      parseProfile({
        ...profile,
        brief: {
          playedConnections: Array(81).fill(profile.brief.playedConnections[0]),
        },
      }),
    ).toThrow(/history/);
  });
  it("sends canonical source terms for the last 40 connections, never the optional answer draft", () => {
    const reversed = {
      ...board.groups[0],
      rule: "reverse" as const,
      words: board.groups[0].words.map((w) => [...w].reverse().join("")),
    };
    const row = rememberConnections([], [reversed], 1)[0];
    const request = generationRequest({
      ...defaultBrief,
      playedConnections: Array(60).fill(row),
      freshnessPrompt: {
        question: "Q",
        answer: "Unsubmitted",
        dismissed: false,
        forStory: "x",
      },
    });
    expect(request.playedConnections).toHaveLength(40);
    expect(request.playedConnections?.[0].words).toEqual(
      board.groups[0].words.map((w) => w.toLowerCase()),
    );
    expect(JSON.stringify(request)).not.toContain("Unsubmitted");
  });
  it("appends an answer without replacing the existing story even when extra-answer slots are full", () => {
    const profile = seed();
    const brief = {
      ...profile.brief,
      freeStory: "Keep this",
      extraAnswers: Array.from({ length: 8 }, (_, i) => ({
        question: `Q${i}`,
        answer: `A${i}`,
      })),
    };
    const next = addFreshMemory(brief, "One new memory?", "The pier");
    expect(next.storyAnswers).toEqual(brief.storyAnswers);
    expect(next.extraAnswers).toEqual(brief.extraAnswers);
    expect(next.freeStory).toBe("Keep this\n\nOne new memory?\nThe pier");
    expect(() =>
      addFreshMemory({ ...brief, freeStory: "x".repeat(12000) }, "Q", "Answer"),
    ).toThrow(/full/);
  });
  it("records only uncovered groups, reveals the remainder after four mistakes, and keeps stories separate", async () => {
    const user = userEvent.setup();
    const profile = seed(false);
    const seen = vi.fn((groups: Group[]) =>
      recordPlayedGroups(profile.id, groups),
    );
    render(
      <Game
        puzzle={board}
        mode="challenge"
        onHome={vi.fn()}
        onRestart={vi.fn()}
        onNext={vi.fn()}
        onRelaxed={vi.fn()}
        onConnectionsSeen={seen}
      />,
    );
    expect(seen).not.toHaveBeenCalled();
    await guess(user, board.groups[0].words);
    expect(readLibrary().profiles[0].brief.playedConnections).toHaveLength(1);
    const [a, b, c] = board.groups.slice(1);
    for (let i = 0; i < 4; i++) {
      await guess(user, [a.words[0], a.words[1], b.words[0], c.words[i]]);
      if (i < 3)
        await user.click(
          screen.getByRole("button", { name: "Clear selection" }),
        );
    }
    expect(readLibrary().profiles[0].brief.playedConnections).toHaveLength(4);
    expect(seen).toHaveBeenCalledTimes(2);
    expect(recordPlayedGroups("a-different-story", board.groups)).toBe(false);
    expect(recordPlayedGroups(profile.id, board.groups)).toBe(true);
    expect(readLibrary().profiles[0].brief.playedConnections).toHaveLength(4);
  });
  it("offers one spoiler-free optional question on a full repeat; skip survives remounts and another generation", async () => {
    seed();
    const user = userEvent.setup();
    vi.mocked(generatePuzzle).mockResolvedValue(board);
    const first = render(<Creator onHome={vi.fn()} onPlay={vi.fn()} />);
    expect(
      screen.queryByRole("dialog", { name: "One quick question" }),
    ).toBeNull();
    await user.click(screen.getByRole("button", { name: "Make our puzzle" }));
    expect(await screen.findByText(/A familiar remix/)).toBeVisible();
    expect(
      screen.getByRole("dialog", { name: "One quick question" }),
    ).toBeVisible();
    expect(
      screen.queryByText(board.groups[0].category, { exact: true }),
    ).toBeNull();
    await user.click(screen.getByRole("button", { name: "Skip for now" }));
    expect(generatePuzzle).toHaveBeenCalledTimes(1);
    await user.click(
      screen.getByRole("button", { name: "Try another puzzle" }),
    );
    expect(
      await screen.findByRole("button", { name: "Try another puzzle" }),
    ).toBeEnabled();
    expect(
      screen.queryByRole("dialog", { name: "One quick question" }),
    ).toBeNull();
    first.unmount();
    render(<Creator onHome={vi.fn()} onPlay={vi.fn()} />);
    expect(
      screen.queryByRole("dialog", { name: "One quick question" }),
    ).toBeNull();
    expect(readLibrary().profiles[0].brief.freshnessPrompt?.dismissed).toBe(
      true,
    );
  });
  it("autosaves the optional answer and makes exactly one requested generation with it", async () => {
    seed();
    const user = userEvent.setup();
    vi.mocked(generatePuzzle).mockResolvedValue(board);
    render(<Creator onHome={vi.fn()} onPlay={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: "Make our puzzle" }));
    const card = await screen.findByRole("dialog", {
      name: "One quick question",
    });
    fireEvent.change(within(card).getByRole("textbox"), {
      target: { value: "We visited the pier and the lighthouse" },
    });
    expect(readLibrary().profiles[0].brief.freshnessPrompt?.answer).toContain(
      "lighthouse",
    );
    await user.click(
      within(card).getByRole("button", { name: "Add to story & make puzzle" }),
    );
    expect(generatePuzzle).toHaveBeenCalledTimes(2);
    expect(
      vi.mocked(generatePuzzle).mock.calls[1][0].extraAnswers?.[0].answer,
    ).toContain("lighthouse");
    expect(readLibrary().profiles[0].brief.storyAnswers?.[0]).toBe(
      "Our garden walks",
    );
    expect(
      screen.queryByRole("dialog", { name: "One quick question" }),
    ).toBeNull();
  });
  it("keeps a fresh generation uncluttered and associates actual play with its original story", async () => {
    seed(false);
    const user = userEvent.setup();
    vi.mocked(generatePuzzle).mockResolvedValue(board);
    render(<App />);
    await user.click(
      screen.getByRole("button", { name: "Create a personal puzzle" }),
    );
    await user.click(screen.getByRole("button", { name: "Make our puzzle" }));
    await screen.findByRole("button", { name: "Use this puzzle" });
    expect(
      screen.queryByRole("dialog", { name: "One quick question" }),
    ).toBeNull();
    expect(readLibrary().profiles[0].brief.playedConnections).toHaveLength(0);
    await user.click(screen.getByRole("button", { name: "Use this puzzle" }));
    await user.click(screen.getByRole("button", { name: "Start our puzzle" }));
    expect(readLibrary().profiles[0].brief.playedConnections).toHaveLength(0);
    await guess(user, board.groups[0].words);
    expect(
      readLibrary().profiles[0].brief.playedConnections?.[0].words,
    ).toEqual(board.groups[0].words);
  });
  it("turns Claude's specific missing-memory request into a focused modal, saves the answer and continues", async () => {
    seed(false);
    const user = userEvent.setup();
    const question = "What are a few favorite stops from your beach trips?";
    vi.mocked(generatePuzzle)
      .mockRejectedValueOnce(new StoryQuestionError(question))
      .mockResolvedValueOnce(board);
    render(<Creator onHome={vi.fn()} onPlay={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: "Make our puzzle" }));
    const modal = await screen.findByRole("dialog", {
      name: "One quick question",
    });
    const answer = within(modal).getByRole("textbox", { name: question });
    expect(answer).toHaveFocus();
    expect(screen.queryByRole("alert")).toBeNull();
    fireEvent.change(answer, {
      target: { value: "The lighthouse and the pier" },
    });
    await user.click(
      within(modal).getByRole("button", { name: "Add to story & make puzzle" }),
    );
    expect(generatePuzzle).toHaveBeenCalledTimes(2);
    expect(readLibrary().profiles[0].brief.extraAnswers?.[0]).toEqual({
      question,
      answer: "The lighthouse and the pier",
    });
    expect(
      await screen.findByRole("button", { name: "Use this puzzle" }),
    ).toBeEnabled();
    expect(screen.queryByRole("dialog")).toBeNull();
  });
  it("uses a story-based fallback for broad requests and lets Escape skip without another paid request", async () => {
    const profile = seed(false);
    profile.brief.storyAnswers[0] = "Our first vacation was at the beach";
    localStorage.setItem(
      STORY_KEY,
      JSON.stringify({ activeId: profile.id, profiles: [profile] }),
    );
    vi.mocked(generatePuzzle).mockRejectedValue(new StoryQuestionError());
    const user = userEvent.setup();
    render(<Creator onHome={vi.fn()} onPlay={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: "Make our puzzle" }));
    const modal = await screen.findByRole("dialog", {
      name: "One quick question",
    });
    expect(
      within(modal).getByRole("textbox", { name: /favorite stops/ }),
    ).toBeVisible();
    fireEvent(modal, new Event("cancel", { bubbles: true, cancelable: true }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(
      screen.getByRole("button", { name: "Make our puzzle" }),
    ).toHaveFocus();
    expect(generatePuzzle).toHaveBeenCalledTimes(1);
    expect(readLibrary().profiles[0].brief.storyAnswers?.[0]).toContain(
      "beach",
    );
  });
  it("uses Claude's branching question for an exhausted board without putting it in a friend link", async () => {
    seed();
    const question = "What other places did you stop on your trips together?";
    vi.mocked(generatePuzzle).mockResolvedValue({
      ...board,
      followUpQuestion: question,
    });
    const user = userEvent.setup();
    render(<Creator onHome={vi.fn()} onPlay={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: "Make our puzzle" }));
    const modal = await screen.findByRole("dialog", {
      name: "One quick question",
    });
    expect(
      within(modal).getByRole("textbox", { name: question }),
    ).toBeVisible();
    await user.click(
      within(modal).getByRole("button", { name: "Skip for now" }),
    );
    await user.click(screen.getByRole("button", { name: "Use this puzzle" }));
    expect(
      screen.getByRole("textbox", { name: "Challenge link" }),
    ).not.toHaveValue(expect.stringContaining("followUpQuestion"));
    expect(
      JSON.stringify(
        makeChallenge(
          defaultBrief,
          { ...board, followUpQuestion: question } as typeof board,
          "ai",
        ),
      ),
    ).not.toContain(question);
  });
});
