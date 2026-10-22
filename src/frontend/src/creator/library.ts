import { storageKey } from "../account/session";
import type { Group } from "../game/puzzles";
import {
  parseFreshnessPrompt,
  parseHistory,
  rememberConnections,
} from "./history";
import { type CreatorBrief, defaultBrief } from "./schema";

export const STORY_KEY = "common-thread-stories-v1";
export function storyStorageKey() {
  return storageKey(STORY_KEY);
}
export interface StoryProfile {
  id: string;
  name: string;
  brief: CreatorBrief;
  updatedAt: number;
}
export interface StoryLibrary {
  activeId: string;
  profiles: StoryProfile[];
}
export function newProfile(): StoryProfile {
  return {
    id: crypto.randomUUID(),
    name: "Our story",
    brief: { ...defaultBrief },
    updatedAt: Date.now(),
  };
}
export function parseProfile(value: unknown): StoryProfile {
  if (!value || typeof value !== "object")
    throw new Error("Choose a Common Thread story backup.");
  const raw = value as Record<string, unknown>;
  const input = raw.brief as Record<string, unknown>;
  if (!input || typeof input !== "object")
    throw new Error("This story backup is missing its answers.");
  const brief = { ...defaultBrief };
  if (input.playedConnections !== undefined)
    brief.playedConnections = parseHistory(input.playedConnections);
  brief.freshnessPrompt = parseFreshnessPrompt(input.freshnessPrompt);
  for (const [key, limit] of Object.entries({
    creator: 40,
    recipient: 40,
    note: 180,
    interests: 2000,
    topic: 500,
    notes: 12000,
    memories: 30000,
    freeStory: 12000,
    conversation: 12000,
  })) {
    if (input[key] !== undefined) {
      if (typeof input[key] !== "string" || input[key].length > limit)
        throw new Error("A story field is too long or invalid.");
      Object.assign(brief, { [key]: input[key] });
    }
  }
  for (const [key, choices] of Object.entries({
    style: ["gift", "together"],
    purpose: ["fun", "study"],
    personalization: ["mix", "memories-only"],
    difficulty: ["easy", "balanced", "tricky"],
    familiarity: ["new", "familiar"],
    mode: ["relaxed", "challenge"],
    inputMode: ["guided", "free"],
  })) {
    if (choices.includes(String(input[key])))
      Object.assign(brief, { [key]: input[key] });
  }
  if (input.people !== undefined) {
    const people = input.people as Record<string, unknown>;
    if (
      !people ||
      typeof people.you !== "string" ||
      people.you.length > 40 ||
      typeof people.partner !== "string" ||
      people.partner.length > 40
    )
      throw new Error("Check the conversation participants' names.");
    brief.people = { you: people.you, partner: people.partner };
  }
  if (input.storyAnswers !== undefined) {
    if (
      !Array.isArray(input.storyAnswers) ||
      input.storyAnswers.length > 4 ||
      input.storyAnswers.some((v) => typeof v !== "string" || v.length > 3000)
    )
      throw new Error("This story has invalid answers.");
    brief.storyAnswers = input.storyAnswers;
  }
  if (input.extraAnswers !== undefined) {
    if (
      !Array.isArray(input.extraAnswers) ||
      input.extraAnswers.length > 8 ||
      input.extraAnswers.some(
        (v) =>
          !v ||
          typeof v.question !== "string" ||
          v.question.length > 180 ||
          typeof v.answer !== "string" ||
          v.answer.length > 3000,
      )
    )
      throw new Error("This story has invalid follow-up answers.");
    brief.extraAnswers = input.extraAnswers.map((v) => ({
      question: v.question,
      answer: v.answer,
    }));
  }
  if (Array.isArray(input.usedTerms))
    brief.usedTerms = input.usedTerms
      .filter((v): v is string => typeof v === "string" && v.length <= 24)
      .slice(-320);
  return {
    id:
      typeof raw.id === "string" && raw.id.length <= 80
        ? raw.id
        : crypto.randomUUID(),
    name: typeof raw.name === "string" ? raw.name.slice(0, 80) : "Our story",
    brief,
    updatedAt:
      typeof raw.updatedAt === "number" && Number.isFinite(raw.updatedAt)
        ? raw.updatedAt
        : Date.now(),
  };
}
export function readLibrary(): StoryLibrary {
  try {
    const text = localStorage.getItem(storyStorageKey());
    if (text && text.length < 3000000) {
      const raw = JSON.parse(text);
      const profiles = raw.profiles.slice(0, 20).map(parseProfile);
      if (profiles.length)
        return {
          activeId: profiles.some((p: StoryProfile) => p.id === raw.activeId)
            ? raw.activeId
            : profiles[0].id,
          profiles,
        };
    }
  } catch {
    /* A broken backup must not prevent opening the app. */
  }
  const profile = newProfile();
  return { activeId: profile.id, profiles: [profile] };
}

export function recordPlayedGroups(storyId: string, groups: Group[]): boolean {
  const library = readLibrary();
  const profile = library.profiles.find((item) => item.id === storyId);
  if (!profile) return false;
  const history = profile.brief.playedConnections || [];
  const next = rememberConnections(history, groups);
  if (JSON.stringify(next) === JSON.stringify(history)) return true;
  profile.brief.playedConnections = next;
  profile.updatedAt = Math.max(Date.now(), profile.updatedAt + 1);
  try {
    localStorage.setItem(storyStorageKey(), JSON.stringify(library));
    return true;
  } catch {
    return false;
  }
}
