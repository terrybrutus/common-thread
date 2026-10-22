import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { knowledgeBoard } from "../../../../services/claude/shared/knowledge.js";
import App from "../App";
import { readPackHistory } from "../knowledge/KnowledgePacks";
afterEach(() => vi.unstubAllGlobals());

describe("clear learning and play routes", () => {
  it("offers three clear starts without duplicate puzzle pickers or footer branding", () => {
    render(<App />);
    for (const name of [
      "Play now",
      "Create a personal puzzle",
      "Choose a topic",
    ])
      expect(screen.getByRole("button", { name })).toBeVisible();
    expect(screen.getAllByText("Common Thread")).toHaveLength(1);
    expect(screen.getByText("Created by Terry Brutus")).toBeVisible();
    expect(
      screen.queryByText("Choose a puzzle or challenge mode"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Explore knowledge packs"),
    ).not.toBeInTheDocument();
  });
  it("keeps ready-made subjects secondary and remembers uncovered connections, with reading links after discovery", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Choose a topic" }));
    expect(screen.getByLabelText("Your subject")).toBeVisible();
    expect(
      screen.queryByText("Read more about this subject"),
    ).not.toBeInTheDocument();
    await user.click(screen.getByText("Or play a ready-made puzzle"));
    await user.click(
      screen.getByRole("button", { name: /General Knowledge A little/ }),
    );
    expect(
      within(
        screen.getByRole("group", { name: "Words to connect" }),
      ).getAllByRole("button"),
    ).toHaveLength(16);
    expect(readPackHistory("general").groups).toEqual([]);
    for (const word of knowledgeBoard("general").groups[3].words)
      await user.click(screen.getByRole("button", { name: word }));
    await user.click(screen.getByRole("button", { name: "Check group" }));
    expect(
      screen.getByRole("heading", {
        name: "Animals, minus their first letter",
      }),
    ).toBeVisible();
    expect(readPackHistory("general").groups).toEqual(["animals-drop"]);
    expect(readPackHistory("world").groups).toEqual([]);
    expect(screen.getByText("Read more about this subject")).toBeVisible();
  });
  it("generates from an arbitrary subject, keeps inputs on failure, never sends a personal story, and hides answers", async () => {
    const user = userEvent.setup();
    const mock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Draft did not pass its check." }),
    });
    vi.stubGlobal("fetch", mock);
    localStorage.setItem("unrelated-personal-story", "PRIVATE STORY");
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Choose a topic" }));
    await user.type(screen.getByLabelText("Your subject"), "Shakespeare");
    await user.click(screen.getByRole("button", { name: "Make my puzzle" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Draft did not pass",
    );
    expect(screen.getByLabelText("Your subject")).toHaveValue("Shakespeare");
    const sent = JSON.parse(mock.mock.calls[0][1].body);
    expect(sent.learningMode).toBe("topic");
    expect(sent.topic).toBe("Shakespeare");
    expect(sent.notes).toBe("");
    expect(sent.knowledgePack).toBeUndefined();
    expect(JSON.stringify(sent)).not.toContain("PRIVATE STORY");
    mock.mockResolvedValue({
      ok: true,
      json: async () => ({ text: JSON.stringify(knowledgeBoard("world")) }),
    });
    await user.click(screen.getByRole("button", { name: "Make my puzzle" }));
    expect(
      await screen.findByRole("group", { name: "Words to connect" }),
    ).toBeVisible();
    expect(
      screen.queryByRole("heading", {
        name: "Country names ending in ___LAND",
      }),
    ).not.toBeInTheDocument();
  });
  it("accepts a long transcript, preserves it after an insufficient-material response, and restores the draft on return", async () => {
    const user = userEvent.setup();
    const mock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({
        code: "needs_story",
        question: "Could you include the next section about currents?",
      }),
    });
    vi.stubGlobal("fetch", mock);
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Choose a topic" }));
    await user.click(
      screen.getByRole("radio", { name: "My notes or a transcript" }),
    );
    const material = "A lecture about oceans and rivers. ".repeat(1500);
    fireEvent.change(screen.getByLabelText("Paste your notes or transcript"), {
      target: { value: material },
    });
    await user.click(
      screen.getByRole("checkbox", {
        name: "Limit me to four mistakes, with no hints",
      }),
    );
    await user.click(screen.getByRole("button", { name: "Make my puzzle" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "next section about currents",
    );
    expect(JSON.parse(mock.mock.calls[0][1].body).notes).toBe(material.trim());
    expect(screen.getByLabelText("Paste your notes or transcript")).toHaveValue(
      material,
    );
    await user.click(screen.getByRole("button", { name: "Home" }));
    await user.click(screen.getByRole("button", { name: "Choose a topic" }));
    expect(screen.getByLabelText("Paste your notes or transcript")).toHaveValue(
      material,
    );
  });
  it("does not silently truncate a transcript above the supported generation limit", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Choose a topic" }));
    await user.click(
      screen.getByRole("radio", { name: "My notes or a transcript" }),
    );
    const text = "a".repeat(100001);
    fireEvent.change(screen.getByLabelText("Paste your notes or transcript"), {
      target: { value: text },
    });
    expect(screen.getByLabelText("Paste your notes or transcript")).toHaveValue(
      text,
    );
    expect(
      screen.getByRole("button", { name: "Make my puzzle" }),
    ).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Home" }));
    await user.click(screen.getByRole("button", { name: "Choose a topic" }));
    expect(screen.getByLabelText("Paste your notes or transcript")).toHaveValue(
      text,
    );
  });
});
