import { hostedGeneration } from "./hosted";
import type { StoryProfile } from "./library";
import { type CreatorBrief, parseGeneratedPuzzle } from "./schema";
import { storyNotes } from "./story";

export function generationErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) return "Please try again in a moment.";
  if (error.message.includes("CANISTER_ID_BACKEND"))
    return "This local preview isn't connected to the Caffeine backend. You can try the example below and test live generation after importing into Caffeine.";
  return error.message.length < 1000
    ? error.message
    : "Please try again in a moment.";
}

export function generationRequest(brief: CreatorBrief) {
  return {
    purpose: brief.purpose,
    interests: brief.interests.trim(),
    topic: brief.topic.trim(),
    notes:
      brief.purpose === "study"
        ? brief.notes.trim()
        : brief.storyAnswers
          ? [
              storyNotes(brief.storyAnswers, brief.extraAnswers),
              brief.freeStory || "",
              brief.conversation
                ? `Reviewed conversation:\n${brief.conversation}`
                : "",
            ]
              .filter(Boolean)
              .join("\n\n")
              .trim()
          : [
              brief.memories || "",
              brief.freeStory || "",
              brief.conversation
                ? `Reviewed conversation:\n${brief.conversation}`
                : "",
            ]
              .filter(Boolean)
              .join("\n\n")
              .trim(),
    difficulty: brief.difficulty,
    familiarity: brief.familiarity,
    personalization: brief.personalization || "memories-only",
    usedTerms: brief.usedTerms || [],
    ...(brief.people ? { people: brief.people } : {}),
  };
}

export async function generatePuzzle(
  brief: CreatorBrief,
  story?: StoryProfile,
) {
  if (import.meta.env.DEV) {
    const response = await fetch("/__local-ai/puzzle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(generationRequest(brief)),
    });
    const data = await response.json();
    if (!response.ok)
      throw new Error(data.error || "Claude couldn't generate a puzzle.");
    return parseGeneratedPuzzle(data.text);
  }
  return parseGeneratedPuzzle(
    await hostedGeneration({ ...generationRequest(brief), story }),
  );
}
