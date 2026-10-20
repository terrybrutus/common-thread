import { afterEach, describe, expect, it, vi } from "vitest";
import { generatePuzzle, generationRequest } from "../creator/ai";
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
  it("sends the chosen personal story but excludes it after switching to study", () => {
    const brief = {
      ...defaultBrief,
      memories: " First date at the arcade ",
      notes: "Biology notes",
    };
    expect(generationRequest(brief).notes).toBe("First date at the arcade");
    expect(generationRequest({ ...brief, purpose: "study" }).notes).toBe(
      "Biology notes",
    );
  });
});

describe("local Claude transport", () => {
  afterEach(() => vi.unstubAllGlobals());
  it("rejects incomplete AI boards rather than returning a playable example", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          text: JSON.stringify({ title: "Incomplete", groups: [] }),
        }),
      }),
    );
    await expect(generatePuzzle(defaultBrief)).rejects.toThrow(
      "four complete groups",
    );
  });
  it("shows the missing-memory question and budget errors", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          text: JSON.stringify({
            error: "What else did you do on your first date?",
          }),
        }),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Daily allowance used" }),
      });
    vi.stubGlobal("fetch", fetchMock);
    await expect(generatePuzzle(defaultBrief)).rejects.toThrow(
      "What else did you do",
    );
    await expect(generatePuzzle(defaultBrief)).rejects.toThrow(
      "Daily allowance used",
    );
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
