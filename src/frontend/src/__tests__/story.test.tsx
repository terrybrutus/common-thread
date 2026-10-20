import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { StoryQuestions } from "../creator/StoryQuestions";
import { generationRequest } from "../creator/ai";
import { defaultBrief, makeChallenge } from "../creator/schema";
import { storyNotes, storyQuestions } from "../creator/story";
import { puzzles } from "../game/puzzles";

function Story() {
  const [answers, setAnswers] = useState<string[]>([]);
  return <StoryQuestions answers={answers} onChange={setAnswers} />;
}

describe("guided shared story", () => {
  it("keeps questions and hints visible while typing, skips, reviews, and preserves edits", async () => {
    const user = userEvent.setup();
    render(<Story />);
    const first = screen.getByRole("textbox", { name: storyQuestions[0] });
    await user.type(first, "First date at the arcade");
    expect(screen.getByText(storyQuestions[0])).toBeVisible();
    expect(screen.getByText(/A first hangout/)).toBeVisible();
    expect(first).toHaveFocus();
    await user.click(screen.getByRole("button", { name: "Next question" }));
    expect(screen.getByRole("heading", { name: /2 of 4/ })).toHaveFocus();
    fireEvent.change(screen.getByRole("textbox", { name: storyQuestions[1] }), {
      target: { value: "Remove this answer" },
    });
    await user.click(
      screen.getByRole("button", { name: "Skip this question" }),
    );
    fireEvent.change(screen.getByRole("textbox", { name: storyQuestions[2] }), {
      target: { value: "Pickleball" },
    });
    await user.click(screen.getByRole("button", { name: "Next question" }));
    await user.click(
      screen.getByRole("button", { name: "Skip this question" }),
    );
    expect(screen.getByText("First date at the arcade")).toBeVisible();
    expect(screen.getByText("Pickleball")).toBeVisible();
    expect(screen.getAllByText("Skipped")).toHaveLength(2);
    expect(screen.queryByText("Remove this answer")).not.toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Edit my story answers" }),
    );
    expect(
      screen.getByRole("textbox", { name: storyQuestions[0] }),
    ).toHaveValue("First date at the arcade");
  });

  it("allows all questions to be skipped without calling AI", async () => {
    const user = userEvent.setup();
    render(<Story />);
    for (let index = 0; index < 4; index++)
      await user.click(
        screen.getByRole("button", { name: "Skip this question" }),
      );
    expect(screen.getAllByText("Skipped")).toHaveLength(4);
    expect(screen.getByText(/No memories added/)).toBeVisible();
  });

  it("sends only answered prompts, fits the backend limit, and keeps stories out of links", () => {
    const storyAnswers = ["Arcade", "", "Pickleball", ""];
    const brief = { ...defaultBrief, storyAnswers };
    const notes = generationRequest(brief).notes;
    expect(notes).toContain("Arcade");
    expect(notes).not.toContain(storyQuestions[1]);
    expect(notes).not.toContain("first hangout");
    expect(
      storyNotes(Array(4).fill("x".repeat(3000))).length,
    ).toBeLessThanOrEqual(13000);
    expect(
      generationRequest({ ...brief, purpose: "study", notes: "Course notes" })
        .notes,
    ).toBe("Course notes");
    expect(
      generationRequest({ ...brief, storyAnswers: ["", "", "", ""] }).notes,
    ).toBe("");
    expect(
      JSON.stringify(makeChallenge(brief, puzzles[0], "example")),
    ).not.toContain("Arcade");
  });
});
