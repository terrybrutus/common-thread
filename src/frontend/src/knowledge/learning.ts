import {
  accountRequest,
  hasAccountSession,
  storageKey,
} from "../account/session";
import { hostedGeneration } from "../creator/hosted";
import { parseGeneratedPuzzle } from "../creator/schema";
import type { Group } from "../game/puzzles";

export interface LearningInput {
  id?: string;
  connect?: boolean;
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
      localStorage.getItem(storageKey("common-thread-learning-draft")) || "{}",
    );
    return {
      id: typeof raw.id === "string" ? raw.id : undefined,
      connect: raw.connect === true,
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
    localStorage.setItem(
      storageKey("common-thread-learning-draft"),
      JSON.stringify(input),
    );
  } catch {
    /* Keep editing and play available without storage. */
  }
}
function historyKey(input: LearningInput) {
  if (input.id) return storageKey(`learning-history-id-${input.id}`);
  let hash = 2166136261;
  for (const c of `${input.kind}|${input.topic.trim().toLowerCase()}|${input.kind === "material" ? input.material.trim() : ""}`)
    hash = Math.imul(hash ^ c.charCodeAt(0), 16777619);
  return storageKey(`common-thread-learning-history-${hash >>> 0}`);
}
function history(input: LearningInput): (Group & { playedAt: number })[] {
  try {
    const items = JSON.parse(
      localStorage.getItem(historyKey(input)) ||
        JSON.stringify(
          input.id
            ? savedTopics().find((t) => t.id === input.id)?.history || []
            : [],
        ),
    );
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
export interface SavedTopic extends LearningInput {
  id: string;
  updatedAt: number;
  history: (Group & { playedAt: number })[];
}
export function savedTopics(): SavedTopic[] {
  try {
    const rows = JSON.parse(
      localStorage.getItem(storageKey("learning-library")) || "[]",
    );
    return Array.isArray(rows)
      ? rows.filter(
          (t) =>
            t &&
            typeof t.id === "string" &&
            typeof t.topic === "string" &&
            typeof t.material === "string",
        )
      : [];
  } catch {
    return [];
  }
}
export async function saveTopic(
  input: LearningInput,
  played = history(input),
): Promise<SavedTopic> {
  const topics = savedTopics();
  const existing = topics.find((t) => t.id === input.id);
  const reuse =
    existing &&
    (input.kind === "material" ||
      existing.topic.trim().toLowerCase() === input.topic.trim().toLowerCase());
  let topic: SavedTopic = {
    ...input,
    material: input.kind === "material" ? input.material : "",
    id: reuse
      ? existing.id
      : input.id && !existing
        ? input.id
        : crypto.randomUUID(),
    history: played,
    updatedAt: Date.now(),
  };
  if (topics.length >= 80 && !topics.some((t) => t.id === topic.id))
    throw new Error(
      "Your topic library is full. Export or remove an old topic first. This draft is kept.",
    );
  const next = [topic, ...topics.filter((t) => t.id !== topic.id)];
  try {
    localStorage.setItem(storageKey("learning-library"), JSON.stringify(next));
  } catch {
    /* The draft stays on screen; cloud saving can still succeed. */
  }
  if (hasAccountSession()) {
    topic = (await accountRequest("/api/topic/save", topic))
      .topic as SavedTopic;
    try {
      localStorage.setItem(
        storageKey("learning-library"),
        JSON.stringify([
          topic,
          ...savedTopics().filter((t) => t.id !== topic.id),
        ]),
      );
    } catch {
      /* The cloud copy is saved. */
    }
  }
  return topic;
}
export async function listTopics(): Promise<{ id: string; title: string }[]> {
  const local = savedTopics().map((t) => ({
    id: t.id,
    title: t.topic || "My notes",
  }));
  if (!hasAccountSession()) return local;
  const data = await accountRequest("/api/topic/list");
  return data.topics;
}
export async function openTopic(id: string): Promise<SavedTopic> {
  const topic = hasAccountSession()
    ? ((await accountRequest("/api/topic/load", { id })).topic as SavedTopic)
    : savedTopics().find((t) => t.id === id);
  if (!topic) throw new Error("That topic couldn't be opened.");
  try {
    localStorage.setItem(
      storageKey("learning-library"),
      JSON.stringify([
        topic,
        ...savedTopics().filter((t) => t.id !== topic.id),
      ]),
    );
  } catch {
    /* Keep the cloud copy. */
  }
  try {
    localStorage.setItem(
      historyKey(topic),
      JSON.stringify(topic.history || []),
    );
  } catch {
    /* Keep editing available. */
  }
  return topic;
}
export async function deleteTopic(id: string) {
  if (hasAccountSession()) await accountRequest("/api/topic/delete", { id });
  localStorage.setItem(
    storageKey("learning-library"),
    JSON.stringify(savedTopics().filter((t) => t.id !== id)),
  );
}
export async function connectTopic(id: string, connect: boolean) {
  if (hasAccountSession())
    await accountRequest("/api/topic/connect", { id, connect });
  try {
    localStorage.setItem(
      storageKey("learning-library"),
      JSON.stringify(
        savedTopics().map((t) => (t.id === id ? { ...t, connect } : t)),
      ),
    );
  } catch {
    /* The server preference is still saved. */
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
  if (input.id)
    void saveTopic(input, [...next.values()].slice(-40)).catch(() => {
      /* Local progress remains available. */
    });
}
export async function generateLearning(input: LearningInput) {
  const brief = {
    purpose: "study",
    learningMode: input.kind,
    topicId: input.id,
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
