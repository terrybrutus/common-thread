import { describe, expect, it } from "vitest";
import {
  type GameState,
  type Mode,
  hintFor,
  initialState,
  reduceGame,
  remainingWords,
  shuffleWords,
} from "../game/engine";
import { type Puzzle, lessons, puzzles } from "../game/puzzles";

function guess(
  state: GameState,
  words: string[],
  mode: Mode = "challenge",
  puzzle = puzzles[0],
) {
  let next = reduceGame(state, { type: "clear" }, puzzle, mode);
  for (const word of words)
    next = reduceGame(next, { type: "toggle", word }, puzzle, mode);
  return reduceGame(next, { type: "submit" }, puzzle, mode);
}
const wrongGroups = [
  ["MAPLE", "BIRCH", "WILLOW", "ROBIN"],
  ["MAPLE", "BIRCH", "WILLOW", "FINCH"],
  ["MAPLE", "BIRCH", "WILLOW", "WREN"],
  ["MAPLE", "BIRCH", "WILLOW", "SPARROW"],
  ["MAPLE", "BIRCH", "WILLOW", "DAISY"],
];

describe("puzzle content", () => {
  it.each([...lessons, ...puzzles])(
    "$id has distinct words and complete connections",
    (puzzle: Puzzle) => {
      const words = puzzle.groups.flatMap((group) => group.words);
      expect(new Set(words).size).toBe(words.length);
      expect(new Set(puzzle.groups.map((group) => group.id)).size).toBe(
        puzzle.groups.length,
      );
      for (const group of puzzle.groups) {
        expect(group.words).toHaveLength(4);
        expect(group.explanation.length).toBeGreaterThan(20);
        expect(group.clue.length).toBeGreaterThan(10);
      }
    },
  );
});

describe("game rules", () => {
  it("requires four distinct available words and caps selection at four", () => {
    let state = initialState();
    state = reduceGame(
      state,
      { type: "toggle", word: "UNKNOWN" },
      puzzles[0],
      "relaxed",
    );
    expect(state.selected).toEqual([]);
    state = reduceGame(
      state,
      { type: "toggle", word: "MAPLE" },
      puzzles[0],
      "relaxed",
    );
    expect(
      reduceGame(state, { type: "submit" }, puzzles[0], "relaxed").mistakes,
    ).toBe(0);
    for (const word of ["BIRCH", "WILLOW", "CEDAR", "ROBIN"])
      state = reduceGame(
        state,
        { type: "toggle", word },
        puzzles[0],
        "relaxed",
      );
    expect(state.selected).toEqual(puzzles[0].groups[0].words);
    state = reduceGame(
      state,
      { type: "toggle", word: "MAPLE" },
      puzzles[0],
      "relaxed",
    );
    expect(state.selected).toHaveLength(3);
  });

  it("removes solved words and wins only after every group is found", () => {
    let state = initialState();
    for (const [index, group] of puzzles[0].groups.entries()) {
      state = guess(state, [...group.words].reverse());
      expect(state.solved).toHaveLength(index + 1);
      expect(state.outcome).toBe(index === 3 ? "won" : "playing");
      expect(remainingWords(puzzles[0], state)).not.toContain(group.words[0]);
      expect(state.selected).toEqual([]);
    }
    expect(state.mistakes).toBe(0);
    expect(
      reduceGame(
        state,
        { type: "toggle", word: "MAPLE" },
        puzzles[0],
        "challenge",
      ),
    ).toBe(state);
  });

  it("does not penalize reordered duplicate guesses", () => {
    const first = guess(initialState(), wrongGroups[0]);
    const repeated = guess(first, [...wrongGroups[0]].reverse());
    expect(repeated.mistakes).toBe(1);
    expect(repeated.message).toContain("already tried");
  });

  it("ends Challenge after four different mistakes and freezes the round", () => {
    let state = initialState();
    for (const words of wrongGroups.slice(0, 4)) state = guess(state, words);
    expect(state.outcome).toBe("lost");
    expect(state.mistakes).toBe(4);
    expect(guess(state, puzzles[0].groups[0].words)).toEqual(state);
  });

  it("keeps Relaxed playing beyond four mistakes and offers near-match feedback", () => {
    let state = initialState();
    for (const words of wrongGroups) state = guess(state, words, "relaxed");
    expect(state.outcome).toBe("playing");
    expect(state.mistakes).toBe(5);
    expect(state.message).toContain("three of those words");
  });

  it("offers graduated hints and guided reveals only outside Challenge", () => {
    let state = initialState();
    for (const expectedAnchors of [0, 1, 2]) {
      state = reduceGame(state, { type: "hint" }, puzzles[0], "relaxed");
      expect(hintFor(puzzles[0], state).anchors).toHaveLength(expectedAnchors);
    }
    expect(state.assisted).toBe(true);
    state = reduceGame(state, { type: "reveal" }, puzzles[0], "relaxed");
    expect(state.revealed).toEqual(["trees"]);
    expect(state.hintLevel).toBe(0);
    state = reduceGame(state, { type: "hint" }, puzzles[0], "relaxed");
    expect(hintFor(puzzles[0], state).text).toBe(puzzles[0].groups[1].clue);
    const challenge = initialState();
    expect(
      reduceGame(challenge, { type: "hint" }, puzzles[0], "challenge"),
    ).toBe(challenge);
    expect(
      reduceGame(challenge, { type: "reveal" }, puzzles[0], "challenge"),
    ).toBe(challenge);
  });

  it("shuffles without losing, duplicating, or mutating words", () => {
    const words = remainingWords(puzzles[0], initialState());
    const original = [...words];
    expect(shuffleWords(words).sort()).toEqual([...original].sort());
    expect(words).toEqual(original);
  });
});
