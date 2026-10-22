import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App";
import { generatePuzzle } from "../creator/ai";
import { defaultBrief, makeChallenge, validatePuzzle } from "../creator/schema";
import { decodeChallenge, encodeChallenge } from "../creator/sharing";
import { puzzles } from "../game/puzzles";

vi.mock("../creator/ai", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../creator/ai")>()),
  generatePuzzle: vi.fn(),
}));
beforeEach(() => {
  vi.mocked(generatePuzzle).mockReset();
  window.history.replaceState(null, "", "/");
});
afterEach(() => {
  window.history.replaceState(null, "", "/");
});

async function reachFinalStep(
  user: ReturnType<typeof userEvent.setup>,
  together = false,
) {
  await user.click(
    screen.getByRole("button", { name: "Create a personal puzzle" }),
  );
  await user.type(
    screen.getByRole("textbox", { name: /early memory/ }),
    "We enjoy the garden together",
  );
  await user.click(screen.getByText("Puzzle options", { exact: true }));
  await user.click(screen.getByText("Names & sharing (optional)"));
  await user.selectOptions(
    screen.getByRole("combobox", { name: "Answer visibility" }),
    together ? "together" : "gift",
  );
  await user.type(
    screen.getByRole("textbox", { name: "Your name (optional)" }),
    "Terry",
  );
  await user.type(
    screen.getByRole("textbox", { name: "Playing with (optional)" }),
    "Jessica",
  );
  await user.type(
    screen.getByRole("textbox", { name: "A personal note (optional)" }),
    "A little study break for you!",
  );
  await user.click(screen.getByText("Themes & extra interests (optional)"));
  await user.type(
    screen.getByRole("textbox", { name: "Extra interests (optional)" }),
    "Nature and gardening",
  );
}

describe("personal creator and friend challenges", () => {
  it("shows three basic options, keeps one optional name pair tucked away, and credits the creator", async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getByText("Created by Terry Brutus")).toBeVisible();
    await user.click(
      screen.getByRole("button", { name: "Create a personal puzzle" }),
    );
    await user.click(screen.getByText("Puzzle options", { exact: true }));
    expect(
      screen.getByRole("combobox", { name: "Puzzle type" }),
    ).not.toBeVisible();
    expect(
      screen.getByRole("combobox", { name: "Puzzle difficulty" }),
    ).not.toBeVisible();
    expect(
      screen.getByRole("checkbox", { name: /Limit us to four mistakes/ }),
    ).toBeVisible();
    expect(
      screen.getByText("Names & sharing (optional)").closest("details"),
    ).not.toHaveAttribute("open");
    expect(
      screen
        .getByText("Themes & extra interests (optional)")
        .closest("details"),
    ).not.toHaveAttribute("open");
    await user.click(screen.getByText("Names & sharing (optional)"));
    expect(
      screen.getByRole("textbox", { name: "Your name (optional)" }),
    ).toBeVisible();
    expect(
      screen.getByRole("textbox", { name: "Playing with (optional)" }),
    ).toBeVisible();
    expect(screen.queryByText(/Your nickname/)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Your name in the puzzle/),
    ).not.toBeInTheDocument();
  });
  it("opens directly on the story and generates without selecting interests", async () => {
    const user = userEvent.setup();
    vi.mocked(generatePuzzle).mockResolvedValue(validatePuzzle(puzzles[0]));
    render(<App />);
    await user.click(
      screen.getByRole("button", { name: "Create a personal puzzle" }),
    );
    expect(
      screen.getByRole("textbox", { name: "Extra interests (optional)" }),
    ).not.toBeVisible();
    expect(
      screen.getByRole("textbox", { name: "Story name" }),
    ).not.toBeVisible();
    expect(
      screen.queryByRole("button", { name: "Continue" }),
    ).not.toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Skip this question" }),
    );
    await user.type(
      screen.getByRole("textbox", { name: /Which places mean/ }),
      "We both lived by the river.",
    );
    expect(
      screen.getByRole("button", { name: "Make our puzzle" }),
    ).toBeEnabled();
    await user.click(screen.getByRole("button", { name: "Make our puzzle" }));
    expect(generatePuzzle).toHaveBeenCalledWith(
      expect.objectContaining({
        interests: "",
        storyAnswers: ["", "We both lived by the river.", "", ""],
      }),
      expect.anything(),
    );
    expect(
      await screen.findByText("Four connections. No spoilers."),
    ).toBeVisible();
  });
  it("generates from the answers, previews the puzzle, and shares a playable challenge code", async () => {
    const user = userEvent.setup();
    vi.mocked(generatePuzzle).mockResolvedValue(validatePuzzle(puzzles[0]));
    render(<App />);
    await reachFinalStep(user);
    await user.click(screen.getByRole("button", { name: "Make our puzzle" }));
    expect(await screen.findByText("AI-GENERATED DRAFT")).toBeVisible();
    expect(generatePuzzle).toHaveBeenCalledWith(
      expect.objectContaining({
        interests: "Nature and gardening",
        creator: "Terry",
        recipient: "Jessica",
      }),
      expect.anything(),
    );
    expect(
      screen.getByText("MAPLE · BIRCH · WILLOW · CEDAR").closest("summary"),
    ).not.toBeNull();
    await user.click(screen.getByRole("button", { name: "Use this puzzle" }));
    await user.click(screen.getByText("Copy a challenge code instead"));
    const field = screen.getByRole("textbox", {
      name: "Challenge code",
    }) as HTMLInputElement;
    expect(decodeChallenge(field.value).recipient).toBe("Jessica");
    await user.click(screen.getByRole("button", { name: "Test the puzzle" }));
    expect(
      screen.getByRole("heading", { name: puzzles[0].title }),
    ).toBeVisible();
    expect(screen.getByText("A little study break for you!")).toBeVisible();
  });
  it("keeps together-mode answers hidden and makes examples unmistakable", async () => {
    const user = userEvent.setup();
    render(<App />);
    await reachFinalStep(user, true);
    await user.click(screen.getByText("Try an example instead"));
    await user.click(
      screen.getByRole("button", {
        name: "Explore the creator with an example puzzle",
      }),
    );
    expect(screen.getByText("EXAMPLE PUZZLE · NOT AI-GENERATED")).toBeVisible();
    expect(
      screen.queryByText("MAPLE · BIRCH · WILLOW · CEDAR"),
    ).not.toBeInTheDocument();
    expect(generatePuzzle).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Use this puzzle" }));
    await user.click(screen.getByRole("button", { name: "Start our puzzle" }));
    expect(
      screen.getByRole("heading", { name: `Example: ${puzzles[0].title}` }),
    ).toBeVisible();
  });
  it("surfaces generation failure and allows an explicit retry without pretending to generate", async () => {
    const user = userEvent.setup();
    vi.mocked(generatePuzzle).mockRejectedValueOnce(
      new Error("A displayed term didn't match its source."),
    );
    vi.mocked(generatePuzzle).mockResolvedValueOnce(validatePuzzle(puzzles[0]));
    render(<App />);
    await reachFinalStep(user);
    await user.click(screen.getByRole("button", { name: "Make our puzzle" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Your story is saved",
    );
    expect(
      screen.queryByRole("button", { name: "Edit my answers" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /early memory/ })).toHaveValue(
      "We enjoy the garden together",
    );
    expect(screen.queryByText("AI-GENERATED DRAFT")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Make our puzzle" }));
    expect(await screen.findByText("AI-GENERATED DRAFT")).toBeVisible();
    expect(generatePuzzle).toHaveBeenCalledTimes(2);
  });
  it("keeps focus in edited fields and rejects duplicate words before sharing", async () => {
    const user = userEvent.setup();
    vi.mocked(generatePuzzle).mockResolvedValue(validatePuzzle(puzzles[0]));
    render(<App />);
    await reachFinalStep(user);
    await user.click(screen.getByRole("button", { name: "Make our puzzle" }));
    const category = await screen.findByText("Trees");
    await user.click(category);
    const editor = within(category.closest("details")!);
    const categoryInput = editor.getByRole("textbox", { name: "Category" });
    await user.type(categoryInput, " we love");
    expect(categoryInput).toHaveFocus();
    const words = editor.getByRole("textbox", {
      name: "Four words, separated by commas",
    });
    fireEvent.change(words, {
      target: { value: "MAPLE, BIRCH, WILLOW, ROBIN" },
    });
    await user.click(screen.getByRole("button", { name: "Use this puzzle" }));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "appears more than once",
    );
    expect(
      screen.queryByRole("textbox", { name: "Challenge link" }),
    ).not.toBeInTheDocument();
  });
  it("opens a friend's incoming link without showing the answer key", async () => {
    const challenge = makeChallenge(
      {
        ...defaultBrief,
        creator: "Terry",
        recipient: "Jessica",
        mode: "challenge",
        style: "gift",
      },
      puzzles[1],
      "ai",
    );
    window.history.replaceState(
      null,
      "",
      `/#thread=${encodeChallenge(challenge)}`,
    );
    const user = userEvent.setup();
    render(<App />);
    expect(
      screen.getByRole("heading", { name: "A thread for Jessica." }),
    ).toBeVisible();
    expect(screen.queryByText("Blood components")).not.toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Accept the challenge" }),
    );
    expect(
      screen.getByRole("heading", { name: puzzles[1].title }),
    ).toBeVisible();
    expect(screen.getByLabelText("4 mistakes remaining")).toBeVisible();
  });
  it("shows a recoverable error for a malformed invitation", () => {
    window.history.replaceState(null, "", "/#thread=broken");
    render(<App />);
    expect(screen.getByRole("alert")).toHaveTextContent("fresh copy");
    expect(screen.getByRole("button", { name: "Play now" })).toBeVisible();
  });
});
