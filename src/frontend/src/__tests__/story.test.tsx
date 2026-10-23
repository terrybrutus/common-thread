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
    expect(screen.getByText(/A few names/)).toBeVisible();
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
    expect(
      screen.getByText(/Review saved answers/).closest("details"),
    ).toHaveAttribute("open");
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

  it("skips an added question straight to the next useful prompt and opens answers on review", async () => {
    function MoreQuestions() {
      const [extra, setExtra] = useState([
        {
          question:
            "Which restaurants or foods are part of your story? Name a few favorites.",
          answer: "The pier cafe",
        },
        {
          question:
            "Who are the family members, friends, or pets in this story, and how are they connected?",
          answer: "Sam is my brother",
        },
        {
          question: "Which shows, films, or games belong in this story?",
          answer: "Jeopardy",
        },
        {
          question:
            "What places have you lived in or visited, and what happened there?",
          answer: "Boston for school",
        },
        {
          question:
            "What nicknames, sayings, or inside jokes belong in this story?",
          answer: "Captain Pancake",
        },
      ]);
      return (
        <StoryQuestions
          answers={["At the pier"]}
          onChange={() => {}}
          extraAnswers={extra}
          onExtraChange={setExtra}
        />
      );
    }
    const user = userEvent.setup();
    render(<MoreQuestions />);
    await user.click(screen.getByText("Add a new memory"));
    await user.click(
      screen.getByRole("button", { name: "Ask me another question" }),
    );
    expect(
      screen.getByRole("textbox", { name: /What traditions or celebrations/ }),
    ).toBeVisible();
    await user.click(
      screen.getByRole("button", { name: "Skip this question" }),
    );
    expect(
      screen.getByRole("textbox", { name: /Which songs or artists/ }),
    ).toBeVisible();
    expect(screen.getByRole("heading", { name: /11 of 11/ })).toBeVisible();
    await user.type(
      screen.getByRole("textbox", { name: /Which songs or artists/ }),
      "Dancing Queen at graduation",
    );
    await user.click(screen.getByRole("button", { name: "Review my answers" }));
    expect(
      screen.getByText(/Review saved answers/).closest("details"),
    ).toHaveAttribute("open");
    expect(screen.getByText("Dancing Queen at graduation")).toBeVisible();
    expect(screen.getByText("At the pier")).toBeVisible();
    expect(
      screen.queryByText("What new memory would you like to add today?"),
    ).not.toBeInTheDocument();
    await user.click(screen.getByText("Add a new memory"));
    await user.click(
      screen.getByRole("button", { name: "Ask me another question" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Skip this question" }),
    );
    expect(
      screen.getByRole("textbox", { name: /What hobbies or plans/ }),
    ).toBeVisible();
    expect(
      screen.getByText(/reached the last suggested question/),
    ).toBeVisible();
  });
});
