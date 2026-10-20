import { type CreatorBrief, parseGeneratedPuzzle } from "./schema";

export function generationErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) return "Please try again in a moment.";
  if (error.message.includes("CANISTER_ID_BACKEND"))
    return "This local preview isn't connected to the Caffeine backend. You can try the example below and test live generation after importing into Caffeine.";
  return error.message.length < 350
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
        : (brief.memories || "").trim(),
    difficulty: brief.difficulty,
    familiarity: brief.familiarity,
  };
}

export async function generatePuzzle(brief: CreatorBrief) {
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
  throw new Error(
    "Claude generation is available in the local tester. A hosted private endpoint must be connected before public AI generation can be enabled.",
  );
}
