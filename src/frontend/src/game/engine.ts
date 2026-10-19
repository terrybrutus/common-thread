import type { Puzzle } from "./puzzles";

export type Mode = "intro" | "relaxed" | "challenge";
export const MISTAKE_LIMIT = 4;
export interface GameState {
  selected: string[];
  solved: string[];
  guesses: string[];
  mistakes: number;
  hintLevel: number;
  assisted: boolean;
  revealed: string[];
  message: string;
  outcome: "playing" | "won" | "lost";
}
export type Action =
  | { type: "toggle"; word: string }
  | { type: "clear" }
  | { type: "submit" }
  | { type: "hint" }
  | { type: "reveal" };
export function initialState(): GameState {
  return {
    selected: [],
    solved: [],
    guesses: [],
    mistakes: 0,
    hintLevel: 0,
    assisted: false,
    revealed: [],
    message: "Select four words to find a connection.",
    outcome: "playing",
  };
}
export function remainingWords(puzzle: Puzzle, state: GameState): string[] {
  return puzzle.groups
    .filter((group) => !state.solved.includes(group.id))
    .flatMap((group) => group.words);
}
export function shuffleWords(words: string[]): string[] {
  const result = [...words];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export function hintFor(
  puzzle: Puzzle,
  state: GameState,
): { text: string; anchors: string[] } {
  const group = puzzle.groups.find((entry) => !state.solved.includes(entry.id));
  if (!group || state.hintLevel === 0) return { text: "", anchors: [] };
  if (state.hintLevel === 1) return { text: group.clue, anchors: [] };
  if (state.hintLevel === 2)
    return {
      text: `Start with ${group.words[0]}. Find three words that share a connection with it.`,
      anchors: group.words.slice(0, 1),
    };
  return {
    text: `${group.words[0]} and ${group.words[1]} belong together. ${group.clue}`,
    anchors: group.words.slice(0, 2),
  };
}
export function reduceGame(
  state: GameState,
  action: Action,
  puzzle: Puzzle,
  mode: Mode,
): GameState {
  if (state.outcome !== "playing") return state;
  switch (action.type) {
    case "toggle": {
      if (!remainingWords(puzzle, state).includes(action.word)) return state;
      if (state.selected.includes(action.word))
        return {
          ...state,
          selected: state.selected.filter((word) => word !== action.word),
        };
      if (state.selected.length === 4) return state;
      return { ...state, selected: [...state.selected, action.word] };
    }
    case "clear":
      return { ...state, selected: [] };
    case "hint":
      return mode === "challenge"
        ? state
        : {
            ...state,
            assisted: true,
            hintLevel: Math.min(3, state.hintLevel + 1),
          };
    case "reveal": {
      if (mode === "challenge") return state;
      const group = puzzle.groups.find(
        (entry) => !state.solved.includes(entry.id),
      )!;
      const solved = [...state.solved, group.id];
      return {
        ...state,
        selected: [],
        solved,
        assisted: true,
        revealed: [...state.revealed, group.id],
        hintLevel: 0,
        outcome: solved.length === puzzle.groups.length ? "won" : "playing",
        message: `${group.category} revealed. Read the explanation${solved.length === puzzle.groups.length ? "—all threads are now connected." : ", then try the next connection."}`,
      };
    }
    case "submit": {
      if (state.selected.length !== 4) return state;
      const signature = [...state.selected].sort().join("|");
      if (state.guesses.includes(signature))
        return {
          ...state,
          message:
            "You already tried that group. Swap a word or clear your selection—no extra mistake counted.",
        };
      const guesses = [...state.guesses, signature];
      const match = puzzle.groups.find(
        (group) =>
          !state.solved.includes(group.id) &&
          state.selected.every((word) => group.words.includes(word)),
      );
      if (match) {
        const solved = [...state.solved, match.id];
        const won = solved.length === puzzle.groups.length;
        return {
          ...state,
          selected: [],
          solved,
          guesses,
          hintLevel: 0,
          outcome: won ? "won" : "playing",
          message: won
            ? "Every thread found. Nicely connected!"
            : `${match.category}—you found a thread! Read its explanation, then find another group.`,
        };
      }
      const mistakes = state.mistakes + 1;
      const lost = mode === "challenge" && mistakes >= MISTAKE_LIMIT;
      const close = puzzle.groups.some(
        (group) =>
          !state.solved.includes(group.id) &&
          state.selected.filter((word) => group.words.includes(word)).length ===
            3,
      );
      return {
        ...state,
        guesses,
        mistakes,
        outcome: lost ? "lost" : "playing",
        message: lost
          ? "This challenge is complete. Explore the connections below, then try another puzzle."
          : close && mode !== "challenge"
            ? "Almost—three of those words belong together. Try swapping one."
            : "That set doesn't share an intended connection. Try a different combination.",
      };
    }
  }
}
