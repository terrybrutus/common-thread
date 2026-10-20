import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import App from "../App";
import { StoryQuestions } from "../creator/StoryQuestions";
import { STORY_KEY, parseProfile, readLibrary } from "../creator/library";
import { defaultBrief } from "../creator/schema";
import { storyNotes, storyQuestions } from "../creator/story";

describe("living story persistence", () => {
  it("automatically restores answers and play preferences after remounting", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);
    await user.click(
      screen.getByRole("button", { name: "Create a personal puzzle" }),
    );
    await user.click(
      screen.getByText("Saved stories & backups", { exact: true }),
    );
    await user.click(screen.getByText("Puzzle options", { exact: true }));
    expect(screen.getByRole("radio", { name: /Solve together/ })).toBeChecked();
    fireEvent.change(screen.getByRole("textbox", { name: "Story name" }), {
      target: { value: "Our saved adventures" },
    });
    fireEvent.change(
      screen.getByRole("textbox", { name: "Your nickname (optional)" }),
      { target: { value: "Player" } },
    );
    fireEvent.change(screen.getByRole("textbox", { name: storyQuestions[0] }), {
      target: { value: "We met at the pier." },
    });
    await waitFor(() =>
      expect(
        JSON.parse(localStorage.getItem(STORY_KEY)!).profiles[0].brief
          .storyAnswers[0],
      ).toBe("We met at the pier."),
    );
    unmount();
    render(<App />);
    await user.click(
      screen.getByRole("button", { name: "Create a personal puzzle" }),
    );
    await user.click(
      screen.getByText("Saved stories & backups", { exact: true }),
    );
    await user.click(screen.getByText("Puzzle options", { exact: true }));
    expect(screen.getByRole("textbox", { name: "Story name" })).toHaveValue(
      "Our saved adventures",
    );
    expect(
      screen.getByRole("textbox", { name: "Your nickname (optional)" }),
    ).toHaveValue("Player");
    expect(readLibrary().profiles[0].brief.storyAnswers?.[0]).toBe(
      "We met at the pier.",
    );
  });
  it("keeps backups validated without importing unrelated secrets", () => {
    const profile = parseProfile({
      id: "sample",
      name: "Sample story",
      brief: {
        ...defaultBrief,
        storyAnswers: ["At the pier"],
        extraAnswers: [
          { question: "What happened next?", answer: "A rainy walk" },
        ],
        apiKey: "not-a-real-key",
      },
    });
    expect(JSON.stringify(profile)).not.toContain("not-a-real-key");
    expect(profile.brief.extraAnswers?.[0].answer).toBe("A rainy walk");
    expect(() =>
      parseProfile({ brief: { storyAnswers: ["x".repeat(3001)] } }),
    ).toThrow();
  });
  it("adds follow-up questions without losing the original story", async () => {
    function Harness() {
      const [answers, setAnswers] = useState<string[]>([]);
      const [extra, setExtra] = useState<
        { question: string; answer: string }[]
      >([]);
      return (
        <StoryQuestions
          answers={answers}
          onChange={setAnswers}
          extraAnswers={extra}
          onExtraChange={setExtra}
        />
      );
    }
    const user = userEvent.setup();
    render(<Harness />);
    fireEvent.change(screen.getByRole("textbox", { name: storyQuestions[0] }), {
      target: { value: "At the pier" },
    });
    await user.click(screen.getByRole("button", { name: "Next question" }));
    for (let i = 0; i < 3; i++)
      await user.click(
        screen.getByRole("button", { name: "Skip this question" }),
      );
    await user.click(screen.getByText("Add a new memory", { exact: true }));
    await user.click(
      screen.getByRole("button", { name: "Ask me another question" }),
    );
    fireEvent.change(
      screen.getByRole("textbox", { name: /Which restaurants or foods/ }),
      { target: { value: "The cafe by the pier" } },
    );
    await user.click(screen.getByRole("button", { name: "Review my answers" }));
    await user.click(screen.getByText(/Review saved answers/));
    expect(screen.getByText("At the pier")).toBeVisible();
    expect(screen.getByText("The cafe by the pier")).toBeVisible();
    expect(
      storyNotes(["At the pier"], [{ question: "Later?", answer: "The cafe" }]),
    ).toContain("Later?\nThe cafe");
  });
});
