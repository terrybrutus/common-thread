import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "../App";
import { lessons, puzzles } from "../game/puzzles";

async function selectWords(
  user: ReturnType<typeof userEvent.setup>,
  words: string[],
) {
  for (const word of words)
    await user.click(screen.getByRole("button", { name: word }));
}
async function solve(
  user: ReturnType<typeof userEvent.setup>,
  words: string[],
) {
  await selectWords(user, words);
  await user.click(screen.getByRole("button", { name: "Check group" }));
}

describe("playable experience", () => {
  it("lets keyboard players select and clear words, skip practice, and reopen it", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Show me how" }));
    const apple = screen.getByRole("button", { name: "APPLE" });
    apple.focus();
    await user.keyboard(" ");
    expect(apple).toHaveAttribute("aria-pressed", "true");
    await user.keyboard(" ");
    expect(apple).toHaveAttribute("aria-pressed", "false");
    await user.click(
      screen.getByRole("button", { name: "Skip practice and play Relaxed" }),
    );
    expect(
      screen.getByRole("heading", { name: puzzles[0].title }),
    ).toBeVisible();
    await user.click(screen.getByRole("button", { name: "How to play" }));
    expect(
      screen.getByRole("heading", { name: lessons[0].title }),
    ).toHaveFocus();
  });
  it("teaches two small puzzles and takes the player into a full Relaxed board", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Show me how" }));
    expect(
      screen.getByRole("heading", { name: lessons[0].title }),
    ).toHaveFocus();
    expect(
      within(
        screen.getByRole("group", { name: "Words to connect" }),
      ).getAllByRole("button"),
    ).toHaveLength(8);
    expect(screen.getByRole("button", { name: "Check group" })).toBeDisabled();
    for (const group of lessons[0].groups) await solve(user, group.words);
    expect(screen.getByText(lessons[0].groups[0].explanation)).toBeVisible();
    await user.click(
      screen.getByRole("button", { name: "Try the next practice" }),
    );
    expect(
      screen.getByRole("heading", { name: lessons[1].title }),
    ).toBeVisible();
    for (const group of lessons[1].groups) await solve(user, group.words);
    await user.click(screen.getByRole("button", { name: "Start Relaxed" }));
    expect(
      screen.getByRole("heading", { name: puzzles[0].title }),
    ).toBeVisible();
    expect(
      within(
        screen.getByRole("group", { name: "Words to connect" }),
      ).getAllByRole("button"),
    ).toHaveLength(16);
  });

  it("preserves selected words through shuffle, gives hints, and labels guided reveals", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Play Relaxed" }));
    await selectWords(user, ["ROBIN"]);
    await user.click(screen.getByRole("button", { name: "Shuffle" }));
    expect(screen.getByRole("button", { name: "ROBIN" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await user.click(screen.getByRole("button", { name: "I'd like a hint" }));
    expect(screen.getByText(puzzles[0].groups[0].clue)).toBeVisible();
    await user.click(
      screen.getByRole("button", { name: "A little more help" }),
    );
    expect(screen.getByRole("button", { name: "MAPLE" })).toHaveAttribute(
      "aria-describedby",
      "hint-message",
    );
    await user.click(
      screen.getByRole("button", { name: "Reveal and explain this group" }),
    );
    expect(screen.getByText("GUIDED REVEAL")).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "MAPLE" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("0 of 4 selected")).toBeVisible();
  });

  it("ends Challenge after four mistakes, reveals answers, and resets on replay", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Play Challenge" }));
    expect(
      screen.queryByRole("button", { name: "I'd like a hint" }),
    ).not.toBeInTheDocument();
    for (const word of ["ROBIN", "FINCH", "WREN", "SPARROW"]) {
      if (screen.queryByRole("button", { name: "Clear selection" }))
        await user.click(
          screen.getByRole("button", { name: "Clear selection" }),
        );
      await solve(user, ["MAPLE", "BIRCH", "WILLOW", word]);
    }
    expect(screen.getByText("There's a discovery in every try.")).toBeVisible();
    expect(
      screen.getByRole("heading", { name: "The remaining threads" }),
    ).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "Check group" }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Replay puzzle" }));
    expect(screen.getByLabelText("4 mistakes remaining")).toBeVisible();
    expect(screen.getByRole("button", { name: "Check group" })).toBeDisabled();
  });

  it("supports a selected study puzzle, a win, and a fresh next puzzle", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Choose a puzzle" }),
      "1",
    );
    await user.click(screen.getByRole("button", { name: "Play Challenge" }));
    for (const group of puzzles[1].groups) await solve(user, group.words);
    expect(
      screen.getByRole("heading", { name: "All connected." }),
    ).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Next puzzle" }));
    expect(
      screen.getByRole("heading", { name: puzzles[2].title }),
    ).toBeVisible();
    expect(screen.getByLabelText("4 mistakes remaining")).toBeVisible();
    expect(screen.queryByText("All connected.")).not.toBeInTheDocument();
  });
});
