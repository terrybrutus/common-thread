import { describe, expect, it } from "vitest";
import { generationRequest } from "../creator/ai";
import { defaultBrief } from "../creator/schema";

describe("AI request privacy and subject context", () => {
  it("sends study context without nicknames, invitation notes, or play metadata", () => {
    const request = generationRequest({
      ...defaultBrief,
      purpose: "study",
      interests: " Sports ",
      topic: " Biology ",
      notes: " Course excerpt ",
      creator: "Terry",
      recipient: "Jessica",
      note: "Private invitation",
      difficulty: "balanced",
      familiarity: "familiar",
    });
    expect(request).toEqual({
      purpose: "study",
      interests: "Sports",
      topic: "Biology",
      notes: "Course excerpt",
      difficulty: "balanced",
      familiarity: "familiar",
    });
    expect(JSON.stringify(request)).not.toContain("Terry");
    expect(request).not.toHaveProperty("note");
  });
  it("doesn't send study notes hidden by switching back to Just for fun", () => {
    expect(
      generationRequest({
        ...defaultBrief,
        purpose: "fun",
        notes: "Previous study notes",
      }).notes,
    ).toBe("");
  });
});
