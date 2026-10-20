// Shared by local HTTP and the authenticated private-window connection.
export function cleanStoryQuestion(value: unknown): string | undefined {
  if (typeof value !== "string") return;
  const question = value.trim();
  if (
    !question ||
    question.length > 180 ||
    Array.from(question).some(
      (char) => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127,
    ) ||
    (question.match(/\?/g) || []).length !== 1 ||
    !question.endsWith("?") ||
    /\b(?:four|4|at least|fresh personal groups|named things|fair groups)\b/i.test(
      question,
    )
  )
    return;
  return question;
}
export class StoryQuestionError extends Error {
  constructor(public question?: string) {
    super("One more memory could help make your puzzle.");
    this.name = "StoryQuestionError";
  }
}
