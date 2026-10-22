import { hostedGeneration } from "../creator/hosted";
import { parseGeneratedPuzzle } from "../creator/schema";
import type { Group } from "../game/puzzles";

export interface LearningInput {
  kind: "topic" | "material";
  topic: string;
  material: string;
}
export const emptyLearning: LearningInput = {
  kind: "topic",
  topic: "",
  material: "",
};
export function loadLearningDraft(): LearningInput {
  try {
    const raw = JSON.parse(
      localStorage.getItem("common-thread-learning-draft") || "{}",
    );
    return {
      kind: raw.kind === "material" ? "material" : "topic",
      topic: typeof raw.topic === "string" ? raw.topic.slice(0, 500) : "",
      material: typeof raw.material === "string" ? raw.material : "",
    };
  } catch {
    return emptyLearning;
  }
}
export function saveLearningDraft(input: LearningInput) {
  try {
    localStorage.setItem("common-thread-learning-draft", JSON.stringify(input));
  } catch {
    /* Keep editing and play available without storage. */
  }
}
function historyKey(input: LearningInput) {
  let hash = 2166136261;
  for (const c of `${input.kind}|${input.topic.trim().toLowerCase()}|${input.kind === "material" ? input.material.trim() : ""}`)
    hash = Math.imul(hash ^ c.charCodeAt(0), 16777619);
  return `common-thread-learning-history-${hash >>> 0}`;
}
function history(input: LearningInput): (Group & { playedAt: number })[] {
  try {
    const items = JSON.parse(localStorage.getItem(historyKey(input)) || "[]");
    return Array.isArray(items)
      ? items
          .filter(
            (g) =>
              typeof g.category === "string" &&
              Array.isArray(g.words) &&
              g.words.length === 4 &&
              g.words.every((w: unknown) => typeof w === "string"),
          )
          .slice(-40)
      : [];
  } catch {
    return [];
  }
}
export function rememberLearning(input: LearningInput, groups: Group[]) {
  const key = (g: Group) => `${g.rule}|${g.words.slice().sort().join("|")}`;
  const next = new Map(history(input).map((g) => [key(g), g]));
  for (const g of groups) next.set(key(g), { ...g, playedAt: Date.now() });
  try {
    localStorage.setItem(
      historyKey(input),
      JSON.stringify([...next.values()].slice(-40)),
    );
  } catch {
    /* History is optional. */
  }
}
export async function generateLearning(input: LearningInput) {
  const brief = {
    purpose: "study",
    learningMode: input.kind,
    topic: input.topic.trim(),
    notes: input.kind === "material" ? input.material.trim() : "",
    playedConnections: history(input).map(
      ({ category, words, rule, sourceWords, playedAt }) => ({
        category,
        words,
        rule: rule || "literal",
        sourceWords,
        playedAt,
      }),
    ),
  };
  if (new TextEncoder().encode(JSON.stringify(brief)).length > 185000)
    throw new Error(
      "This text is too large for one puzzle. Use a shorter section; your full draft is kept.",
    );
  let text: string;
  if (import.meta.env.DEV) {
    const response = await fetch("/__local-ai/puzzle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(brief),
    });
    const data = await response.json();
    if (!response.ok)
      throw new Error(
        data.code === "needs_story" && data.question
          ? data.question
          : data.error || "Could not make this puzzle. Your text is kept.",
      );
    text = data.text;
  } else text = await hostedGeneration(brief);
  return {
    ...parseGeneratedPuzzle(text),
    id: `learning-${crypto.randomUUID()}`,
  };
}
