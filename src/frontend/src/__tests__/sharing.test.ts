import { describe, expect, it } from "vitest";
import {
  defaultBrief,
  makeChallenge,
  parseGeneratedPuzzle,
  validatePuzzle,
} from "../creator/schema";
import {
  challengeLink,
  decodeChallenge,
  encodeChallenge,
} from "../creator/sharing";
import { puzzles } from "../game/puzzles";

describe("personal puzzle validation and sharing", () => {
  it("round-trips Unicode nicknames and personal notes without sharing study notes", () => {
    const challenge = makeChallenge(
      {
        ...defaultBrief,
        creator: "Zoë",
        recipient: "明",
        note: "You’ve got this 🧠",
        notes: "Private study excerpt",
        interests: "Biology",
      },
      puzzles[1],
      "ai",
    );
    const code = encodeChallenge(challenge);
    expect(decodeChallenge(code)).toEqual(challenge);
    expect(JSON.stringify(decodeChallenge(code))).not.toContain(
      "Private study excerpt",
    );
    const link = challengeLink(challenge, "https://common-thread.example/");
    expect(link.startsWith("https://common-thread.example/#thread=")).toBe(
      true,
    );
    expect(decodeChallenge(link)).toEqual(challenge);
  });
  it("accepts a fenced AI JSON response but rejects incomplete or unstructured output", () => {
    expect(
      parseGeneratedPuzzle(`\`\`\`json\n${JSON.stringify(puzzles[0])}\n\`\`\``)
        .groups,
    ).toHaveLength(4);
    expect(() => parseGeneratedPuzzle("Here's a puzzle!")).toThrow(
      "complete puzzle",
    );
    expect(() =>
      parseGeneratedPuzzle(JSON.stringify({ ...puzzles[0], groups: [] })),
    ).toThrow("four complete groups");
    expect(() =>
      parseGeneratedPuzzle(
        JSON.stringify({ error: "Please add more vocabulary." }),
      ),
    ).toThrow("Please add more vocabulary.");
  });
  it("rejects duplicates after case normalization and incomplete groups", () => {
    const puzzle = structuredClone(puzzles[0]);
    puzzle.groups[1].words[0] = " maple ";
    expect(() => validatePuzzle(puzzle)).toThrow("appears more than once");
    puzzle.groups[1].words = ["A", "B", "C"];
    expect(() => validatePuzzle(puzzle)).toThrow("exactly four words");
  });
  it("rejects malformed, oversized, unsupported, and incomplete challenge codes", () => {
    for (const code of ["", "%broken", "x".repeat(20001), "not-a-puzzle"])
      expect(() => decodeChallenge(code)).toThrow();
    const challenge = makeChallenge(defaultBrief, puzzles[0], "example");
    const wrongVersion = btoa(
      Array.from(
        new TextEncoder().encode(JSON.stringify({ ...challenge, version: 99 })),
        (byte) => String.fromCharCode(byte),
      ).join(""),
    );
    expect(() => decodeChallenge(wrongVersion.replace(/=+$/, ""))).toThrow(
      "format",
    );
  });
  it("caps fields and discards untrusted properties and group identifiers", () => {
    expect(() =>
      makeChallenge(
        { ...defaultBrief, creator: "x".repeat(41) },
        puzzles[0],
        "ai",
      ),
    ).toThrow("creator name");
    const puzzle = validatePuzzle({
      ...puzzles[0],
      script: "untrusted",
      groups: puzzles[0].groups.map((group) => ({ ...group, id: "arbitrary" })),
    });
    expect(puzzle.groups.map((group) => group.id)).toEqual([
      "group-1",
      "group-2",
      "group-3",
      "group-4",
    ]);
    expect(puzzle).not.toHaveProperty("script");
  });
});
