import type { Group, Puzzle } from "../game/puzzles";
import type { CreatorBrief } from "./schema";

export type ConnectionRule =
  | "literal"
  | "reverse"
  | "fill-blank"
  | "first-word"
  | "last-word";
export interface PlayedConnection {
  category: string;
  words: string[];
  rule: ConnectionRule;
  playedAt: number;
  sourceWords?: string[];
}
export interface FreshnessPrompt {
  question: string;
  forStory: string;
  dismissed: boolean;
  answer: string;
}
const normalize = (text: string) =>
  text
    .normalize("NFC")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['’]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
export function connectionRule(group: Group): ConnectionRule {
  return (
    group.rule ||
    (/backward|revers/i.test(`${group.category} ${group.clue}`)
      ? "reverse"
      : "literal")
  );
}
export function underlyingWords(
  connection: Pick<PlayedConnection, "words" | "rule" | "sourceWords">,
): string[] {
  if (connection.sourceWords?.length === 4)
    return connection.sourceWords.map(normalize);
  return connection.words.map((word) =>
    normalize(
      connection.rule === "reverse"
        ? Array.from(word.normalize("NFC")).reverse().join("")
        : word,
    ),
  );
}
export function familiarCount(
  puzzle: Puzzle,
  history: PlayedConnection[] = [],
): number {
  return puzzle.groups.filter((group) => {
    const words = new Set(
      underlyingWords({
        words: group.words,
        rule: connectionRule(group),
        sourceWords: group.sourceWords,
      }),
    );
    return history.some(
      (old) =>
        underlyingWords(old).filter((word) => words.has(word)).length >= 3,
    );
  }).length;
}
export function rememberConnections(
  history: PlayedConnection[],
  groups: Group[],
  now = Date.now(),
): PlayedConnection[] {
  const result = [...history];
  for (const group of groups) {
    const words = group.words.map((word) =>
      word.normalize("NFC").toUpperCase(),
    );
    const variant = underlyingWords({
      words,
      rule: connectionRule(group),
      sourceWords: group.sourceWords,
    })
      .sort()
      .join("|");
    if (
      result.some(
        (old) =>
          connectionRule(group) === old.rule &&
          underlyingWords(old).sort().join("|") === variant,
      )
    )
      continue;
    result.push({
      category: group.category,
      words,
      rule: connectionRule(group),
      playedAt: now,
      ...(group.sourceWords ? { sourceWords: [...group.sourceWords] } : {}),
    });
  }
  return result.slice(-80);
}
export function parseHistory(value: unknown): PlayedConnection[] {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > 80)
    throw new Error("This story's connection history is invalid.");
  return value.map((item) => {
    if (
      !item ||
      typeof item.category !== "string" ||
      item.category.length > 60 ||
      !Array.isArray(item.words) ||
      item.words.length !== 4 ||
      item.words.some(
        (w: unknown) => typeof w !== "string" || !w.trim() || w.length > 24,
      ) ||
      new Set(item.words.map(normalize)).size !== 4 ||
      !["literal", "reverse", "fill-blank", "first-word", "last-word"].includes(
        item.rule,
      ) ||
      (item.sourceWords !== undefined &&
        (!Array.isArray(item.sourceWords) ||
          item.sourceWords.length !== 4 ||
          item.sourceWords.some(
            (w: unknown) => typeof w !== "string" || !w.trim() || w.length > 60,
          ))) ||
      !Number.isFinite(item.playedAt)
    )
      throw new Error("This story's connection history is invalid.");
    return {
      category: item.category,
      words: [...item.words],
      rule: item.rule,
      playedAt: item.playedAt,
      ...(item.sourceWords ? { sourceWords: [...item.sourceWords] } : {}),
    };
  });
}
export function parseFreshnessPrompt(
  value: unknown,
): FreshnessPrompt | undefined {
  if (value === undefined) return;
  const prompt = value as FreshnessPrompt;
  if (
    !prompt ||
    typeof prompt.question !== "string" ||
    !prompt.question.trim() ||
    prompt.question.length > 180 ||
    typeof prompt.forStory !== "string" ||
    prompt.forStory.length > 32 ||
    typeof prompt.dismissed !== "boolean" ||
    typeof prompt.answer !== "string" ||
    prompt.answer.length > 3000
  )
    throw new Error("This story's optional question is invalid.");
  return {
    question: prompt.question,
    forStory: prompt.forStory,
    dismissed: prompt.dismissed,
    answer: prompt.answer,
  };
}
export function storyKey(brief: CreatorBrief): string {
  const text = JSON.stringify([
    brief.purpose,
    brief.storyAnswers,
    brief.extraAnswers,
    brief.memories,
    brief.freeStory,
    brief.conversation,
    brief.notes,
    brief.topic,
    brief.interests,
  ]);
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++)
    hash = Math.imul(hash ^ text.charCodeAt(i), 16777619);
  return `${text.length.toString(16)}-${(hash >>> 0).toString(16)}`;
}
export function nextFreshQuestion(brief: CreatorBrief): string {
  const categories = (brief.playedConnections || [])
    .map((item) => item.category)
    .join(" ");
  const facts = [
    brief.storyAnswers?.join(" "),
    ...(brief.extraAnswers || []).map((item) => item.answer),
    brief.memories,
    brief.freeStory,
    brief.conversation,
  ]
    .filter(Boolean)
    .join(" ");
  const asked = (brief.extraAnswers || [])
    .map((item) => item.question)
    .join(" ");
  const choices = [
    {
      from: /trip|vacation|travel|beach/i,
      asked: /favorite stops|remember from that trip/i,
      question:
        "You mentioned trips together. What are a few favorite stops or places you remember?",
    },
    {
      from: /show|game|tv/i,
      asked: /film|series/i,
      question: "What are a few films or series you've enjoyed together?",
    },
    {
      from: /place|home|trip|travel/i,
      asked: /favorite trip|visited on/i,
      question: "What are a few places you visited on a favorite trip?",
    },
    {
      from: /restaurant|food|eat/i,
      asked: /foods or drinks/i,
      question: "Which foods or drinks do you both have strong opinions about?",
    },
    {
      from: /parent|family|name/i,
      asked: /friends or pets/i,
      question: "Who are a few friends or pets who are part of your story?",
    },
    {
      from: /./,
      asked: /sayings or inside jokes/i,
      question: "What are a few sayings or inside jokes you both recognize?",
    },
  ];
  return (
    choices.find(
      (choice) =>
        choice.from.test(`${facts} ${categories}`) && !choice.asked.test(asked),
    )?.question ||
    "What's one new memory you'd like to add since your last puzzle?"
  );
}
export function addFreshMemory(
  brief: CreatorBrief,
  question: string,
  answer: string,
): CreatorBrief {
  const value = answer.trim();
  if (!value || value.length > 3000)
    throw new Error("Add a short answer, up to 3,000 characters.");
  const extra = [...(brief.extraAnswers || [])];
  const index = extra.findIndex((item) => item.question === question);
  if (index >= 0 && extra[index].answer.length + value.length + 1 <= 3000)
    extra[index] = { question, answer: `${extra[index].answer}\n${value}` };
  else if (index < 0 && extra.length < 8)
    extra.push({ question, answer: value });
  else {
    const freeStory = [brief.freeStory || "", `${question}\n${value}`]
      .filter(Boolean)
      .join("\n\n");
    if (freeStory.length > 12000)
      throw new Error(
        "This story's answer space is full. Download a backup and start another story; your existing answers stay saved.",
      );
    return { ...brief, freeStory, freshnessPrompt: undefined };
  }
  return { ...brief, extraAnswers: extra, freshnessPrompt: undefined };
}
