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
    notes: brief.purpose === "study" ? brief.notes.trim() : "",
    difficulty: brief.difficulty,
    familiarity: brief.familiarity,
  };
}

export async function generatePuzzle(brief: CreatorBrief) {
  // Load the canister client only when the player requests generation.
  // Nicknames and personal notes stay out of the AI request.
  const [{ createActorWithConfig }, { createActor }] = await Promise.all([
    import("@caffeineai/core-infrastructure"),
    import("../backend"),
  ]);
  const actor = await createActorWithConfig(createActor);
  const response = await actor.generatePersonalPuzzle(generationRequest(brief));
  return parseGeneratedPuzzle(response);
}
