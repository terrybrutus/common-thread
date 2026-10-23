import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Game } from "../game/Game";
import type { Mode } from "../game/engine";
import { puzzles } from "../game/puzzles";

const words = ["MAPLE", "BIRCH", "WILLOW", "ROBIN"];
const originalVibration = Object.getOwnPropertyDescriptor(navigator, "vibrate");
let vibrate = vi.fn(() => true);
beforeEach(() => {
  vibrate = vi.fn(() => true);
  Object.defineProperty(navigator, "vibrate", {
    configurable: true,
    value: vibrate,
  });
});
afterEach(() => {
  if (originalVibration)
    Object.defineProperty(navigator, "vibrate", originalVibration);
  else Reflect.deleteProperty(navigator, "vibrate");
});
function open(mode: Mode = "challenge") {
  render(
    <Game
      puzzle={puzzles[0]}
      mode={mode}
      onHome={vi.fn()}
      onRestart={vi.fn()}
      onNext={vi.fn()}
      onRelaxed={vi.fn()}
    />,
  );
  return userEvent.setup();
}
async function guess(
  user: ReturnType<typeof userEvent.setup>,
  selection = words,
) {
  for (const word of selection)
    await user.click(screen.getByRole("button", { name: word }));
  await user.click(screen.getByRole("button", { name: "Check group" }));
}

describe("clear rejected-guess feedback", () => {
  it("announces the mistake and remaining count, preserves the rejected words, and never charges or vibrates twice for a repeat", async () => {
    const user = open();
    await guess(user);
    expect(screen.getByRole("alert")).toHaveTextContent("Not a connection");
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Mistake used — 3 of 4 remaining.",
    );
    expect(screen.getByLabelText("3 mistakes remaining")).toBeVisible();
    for (const word of words) {
      const tile = screen.getByRole("button", { name: word });
      expect(tile).toHaveAttribute("aria-pressed", "true");
      expect(tile).toHaveAttribute("aria-invalid", "true");
    }
    expect(vibrate).toHaveBeenCalledExactlyOnceWith([70, 45, 70]);
    await user.click(screen.getByRole("button", { name: "Check group" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Already tried");
    expect(screen.getByRole("alert")).toHaveTextContent(
      "No extra mistake used",
    );
    expect(screen.getByLabelText("3 mistakes remaining")).toBeVisible();
    expect(vibrate).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole("button", { name: "ROBIN" }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "FINCH" }));
    await user.click(screen.getByRole("button", { name: "Check group" }));
    expect(screen.getByRole("alert")).toHaveTextContent("2 of 4 remaining");
    expect(vibrate).toHaveBeenCalledTimes(2);
  });
  it("keeps feedback visible without vibration or a delayed reveal when reduced motion is requested", async () => {
    vi.spyOn(window, "matchMedia").mockReturnValue({
      matches: true,
    } as MediaQueryList);
    const user = open();
    for (const [i, bird] of ["ROBIN", "FINCH", "WREN", "SPARROW"].entries()) {
      if (i)
        await user.click(
          screen.getByRole("button", { name: "Clear selection" }),
        );
      await guess(user, [...words.slice(0, 3), bird]);
    }
    expect(
      screen.getByRole("heading", { name: "No mistakes left" }),
    ).toBeVisible();
    expect(screen.getByRole("alert")).toHaveTextContent("0 of 4 remaining");
    expect(vibrate).not.toHaveBeenCalled();
  });
  it.each(["missing", "blocked"])(
    "still records and explains a wrong guess when vibration is %s",
    async (kind) => {
      Object.defineProperty(navigator, "vibrate", {
        configurable: true,
        value:
          kind === "missing"
            ? undefined
            : () => {
                throw Error("Vibration blocked");
              },
      });
      const user = open();
      await guess(user);
      expect(screen.getByRole("alert")).toHaveTextContent("3 of 4 remaining");
      expect(screen.getByRole("button", { name: "Check group" })).toBeEnabled();
    },
  );
  it("shows the last rejected selection before ending, blocks extra submissions during the shake, and reveals the answers afterward", async () => {
    const user = open();
    for (const [i, bird] of ["ROBIN", "FINCH", "WREN", "SPARROW"].entries()) {
      if (i)
        await user.click(
          screen.getByRole("button", { name: "Clear selection" }),
        );
      await guess(user, [...words.slice(0, 3), bird]);
    }
    expect(screen.getByRole("alert")).toHaveTextContent("0 of 4 remaining");
    expect(
      screen.getByRole("group", { name: "Words to connect" }),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "Check group" })).toBeDisabled();
    expect(vibrate).toHaveBeenCalledTimes(4);
    expect(
      await screen.findByRole("heading", { name: "No mistakes left" }),
    ).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "Check group" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "The remaining threads" }),
    ).toBeVisible();
  });
  it("makes a miss clear in learning mode without implying that a limited guess was spent", async () => {
    const user = open("relaxed");
    await guess(user);
    const notice = within(screen.getByRole("alert"));
    expect(notice.getByText("Not a connection")).toBeVisible();
    expect(screen.getByRole("alert")).toHaveTextContent("unlimited guesses");
    expect(screen.getByRole("alert")).not.toHaveTextContent("Mistake used");
  });
});
