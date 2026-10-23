import type { Group, Puzzle } from "../game/puzzles";
import { cleanStoryQuestion } from "./followUp";
import type { FreshnessPrompt, PlayedConnection } from "./history";

export interface CreatorBrief {
  storyScope?: "self" | "someone" | "group";
  creator: string;
  recipient: string;
  note: string;
  style: "gift" | "together";
  purpose: "fun" | "study";
  interests: string;
  topic: string;
  notes: string;
  memories?: string;
  freeStory?: string;
  conversation?: string;
  inputMode?: "guided" | "free";
  people?: { you: string; partner: string };
  storyAnswers?: string[];
  personalization?: "mix" | "memories-only";
  extraAnswers?: { question: string; answer: string }[];
  usedTerms?: string[];
  playedConnections?: PlayedConnection[];
  freshnessPrompt?: FreshnessPrompt;
  difficulty: "easy" | "balanced" | "tricky";
  familiarity: "new" | "familiar";
  mode: "relaxed" | "challenge";
}
export const defaultBrief: CreatorBrief = {
  creator: "",
  recipient: "",
  note: "",
  style: "together",
  personalization: "memories-only",
  purpose: "fun",
  interests: "",
  topic: "",
  notes: "",
  difficulty: "balanced",
  familiarity: "new",
  mode: "challenge",
};
export interface FriendChallenge {
  version: 1;
  puzzle: Puzzle;
  creator: string;
  recipient: string;
  note: string;
  style: "gift" | "together";
  mode: "relaxed" | "challenge";
  source: "ai" | "example" | "edited";
}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("This puzzle has an invalid format.");
  return value as Record<string, unknown>;
}
function text(
  value: unknown,
  field: string,
  max: number,
  optional = false,
): string {
  if (typeof value !== "string")
    throw new Error(`Check ${field}: use plain text.`);
  const result = value.trim();
  if (
    [...result].some(
      (char) => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127,
    )
  )
    throw new Error(`Check ${field}: use plain text.`);
  if ((!optional && result.length === 0) || result.length > max)
    throw new Error(
      `Check ${field}: ${optional ? "up to" : "1–"} ${max} characters allowed.`,
    );
  return result;
}
export function validatePuzzle(value: unknown): Puzzle {
  const raw = record(value);
  if (typeof raw.error === "string") throw new Error(raw.error.slice(0, 250));
  if (!Array.isArray(raw.groups) || raw.groups.length !== 4)
    throw new Error("A shared puzzle needs four complete groups.");
  const words = new Set<string>();
  const groups: Group[] = raw.groups.map((value, index) => {
    const group = record(value);
    if (!Array.isArray(group.words) || group.words.length !== 4)
      throw new Error(`Group ${index + 1} needs exactly four words.`);
    const terms = group.words.map((word) => {
      const term = text(word, `group ${index + 1} word`, 24)
        .normalize("NFC")
        .toUpperCase();
      if (term.length > 24)
        throw new Error("Keep each word or phrase under 25 characters.");
      if (words.has(term))
        throw new Error(
          `“${term}” appears more than once. Each word needs its own place.`,
        );
      words.add(term);
      return term;
    });
    return {
      id: `group-${index + 1}`,
      category: text(group.category, "category", 60),
      words: terms,
      clue: text(group.clue, "hint", 180),
      explanation: text(group.explanation, "explanation", 350),
      ...([
        "literal",
        "reverse",
        "fill-blank",
        "first-word",
        "last-word",
        "drop-first",
        "anagram",
      ].includes(String(group.rule))
        ? { rule: group.rule as Group["rule"] }
        : {}),
      ...(group.sourceWords !== undefined
        ? {
            sourceWords: (() => {
              if (
                !Array.isArray(group.sourceWords) ||
                group.sourceWords.length !== 4
              )
                throw new Error(
                  "A wordplay group needs four complete phrases.",
                );
              return group.sourceWords.map((value) =>
                text(value, "wordplay phrase", 60),
              );
            })(),
          }
        : {}),
    };
  });
  return {
    id: "personal-puzzle",
    title: text(raw.title, "title", 80),
    topic: text(raw.topic, "topic", 80),
    description: text(raw.description, "description", 240),
    groups,
  };
}
export function parseGeneratedPuzzle(
  response: string,
): Puzzle & { followUpQuestion?: string } {
  if (response.length > 16000)
    throw new Error("That response was too long. Try generating again.");
  const plain = response
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  let data: unknown;
  try {
    data = JSON.parse(plain);
  } catch {
    throw new Error("AI didn't return a complete puzzle. Please try again.");
  }
  const puzzle = validatePuzzle(data);
  const followUpQuestion = cleanStoryQuestion(record(data).followUpQuestion);
  return { ...puzzle, ...(followUpQuestion ? { followUpQuestion } : {}) };
}
export function validateChallenge(value: unknown): FriendChallenge {
  const raw = record(value);
  if (raw.version !== 1)
    throw new Error(
      "This challenge format isn't supported. Ask for a new link.",
    );
  if (raw.mode !== "relaxed" && raw.mode !== "challenge")
    throw new Error("This challenge has an invalid play mode.");
  if (raw.style !== "gift" && raw.style !== "together")
    throw new Error("This challenge has an invalid play style.");
  if (!["ai", "example", "edited"].includes(String(raw.source)))
    throw new Error("This challenge has an invalid source.");
  return {
    version: 1,
    puzzle: validatePuzzle(raw.puzzle),
    creator: text(raw.creator, "creator name", 40, true),
    recipient: text(raw.recipient, "friend's name", 40, true),
    note: text(raw.note, "personal note", 180, true),
    mode: raw.mode,
    style: raw.style,
    source: raw.source as FriendChallenge["source"],
  };
}
export function makeChallenge(
  brief: CreatorBrief,
  puzzle: Puzzle,
  source: FriendChallenge["source"],
): FriendChallenge {
  return validateChallenge({
    version: 1,
    puzzle,
    creator: brief.creator || brief.people?.you || "",
    recipient:
      brief.storyScope === "self"
        ? ""
        : brief.recipient || brief.people?.partner || "",
    note: brief.note,
    mode: brief.mode,
    style: brief.style,
    source,
  });
}
