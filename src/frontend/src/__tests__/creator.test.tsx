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
  await user.click(
    screen.getByRole("radio", {
      name: together ? /Solve together/ : /Make a challenge/,
    }),
  );
  await user.type(
    screen.getByRole("textbox", { name: "Your nickname (optional)" }),
    "Terry",
  );
  await user.type(
    screen.getByRole("textbox", { name: "Friend's nickname (optional)" }),
    "Jessica",
  );
  await user.click(screen.getByRole("button", { name: "Continue" }));
  expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled();
  await user.type(
    screen.getByRole("textbox", { name: "What do you both enjoy?" }),
    "Nature and gardening",
  );
  await user.click(screen.getByRole("button", { name: "Continue" }));
  await user.type(
    screen.getByRole("textbox", { name: "A personal note (optional)" }),
    "A little study break for you!",
  );
  await user.click(screen.getByRole("button", { name: "Continue" }));
}

describe("personal creator and friend challenges", () => {
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
      new Error("Please retry in about 20 seconds."),
    );
    vi.mocked(generatePuzzle).mockResolvedValueOnce(validatePuzzle(puzzles[0]));
    render(<App />);
    await reachFinalStep(user);
    await user.click(screen.getByRole("button", { name: "Make our puzzle" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Please retry");
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
    expect(screen.getByRole("button", { name: "Play Relaxed" })).toBeVisible();
  });
});
