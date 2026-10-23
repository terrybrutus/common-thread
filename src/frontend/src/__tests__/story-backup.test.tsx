import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import App from "../App";
import { readLibrary } from "../creator/library";
import { defaultBrief } from "../creator/schema";

describe("story backup restore", () => {
  it("offers import beside download, restores a JSON story, and preserves it after reopening", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);
    const open = vi.spyOn(window, "open");
    await user.click(
      screen.getByRole("button", { name: "Create a personal puzzle" }),
    );
    await user.click(screen.getByText("Saved stories & backups"));
    expect(
      screen.queryByRole("button", { name: "Save to private cloud" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Download story (.json)" }),
    ).toBeVisible();
    const input = screen.getByLabelText(
      "Import story backup",
    ) as HTMLInputElement;
    const picker = vi.spyOn(input, "click");
    await user.click(
      screen.getByRole("button", { name: "Import story (.json)" }),
    );
    expect(picker).toHaveBeenCalledOnce();
    const backup = {
      version: 1,
      id: "restored-story",
      name: "My family",
      updatedAt: 1,
      brief: {
        ...defaultBrief,
        storyScope: "group",
        storyAnswers: ["Our annual beach trip"],
        extraAnswers: [
          { question: "Which pets joined?", answer: "Luna and Pip" },
        ],
      },
    };
    const file = new File(
      [JSON.stringify(backup)],
      "common-thread-story.json",
      { type: "application/json" },
    );
    Object.defineProperty(file, "text", {
      value: async () => JSON.stringify(backup),
    });
    await user.upload(input, file);
    expect(
      await screen.findByText("Story imported. Your answers are ready."),
    ).toBeVisible();
    expect(
      readLibrary().profiles.find((p) => p.id === backup.id)?.brief
        .extraAnswers?.[0].answer,
    ).toBe("Luna and Pip");
    expect(open).not.toHaveBeenCalled();
    unmount();
    render(<App />);
    await user.click(
      screen.getByRole("button", { name: "Create a personal puzzle" }),
    );
    await user.click(screen.getByText(/Review saved answers/));
    expect(screen.getByText("Our annual beach trip")).toBeVisible();
    expect(screen.getByText("Luna and Pip")).toBeVisible();
    vi.restoreAllMocks();
  });
  it("rejects an invalid file without replacing any saved story", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(
      screen.getByRole("button", { name: "Create a personal puzzle" }),
    );
    await user.click(screen.getByText("Saved stories & backups"));
    const before = JSON.stringify(readLibrary());
    const file = new File(["{}"], "invalid.json", { type: "application/json" });
    Object.defineProperty(file, "text", { value: async () => "{}" });
    await user.upload(screen.getByLabelText("Import story backup"), file);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "missing its answers",
    );
    expect(JSON.stringify(readLibrary())).toBe(before);
  });
});
