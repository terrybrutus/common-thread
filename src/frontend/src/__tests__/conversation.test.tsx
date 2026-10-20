import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import App from "../App";
import {
  ConversationImport,
  mapConversation,
} from "../creator/ConversationImport";
import { generationRequest } from "../creator/ai";
import { parseProfile, readLibrary } from "../creator/library";
import { defaultBrief } from "../creator/schema";

describe("personal voice and conversation input", () => {
  it("maps explicit sender labels and requires preview before adding the excerpt", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<ConversationImport onAdd={onAdd} />);
    await user.click(screen.getByText("Import a conversation excerpt"));
    fireEvent.change(screen.getByRole("textbox", { name: "Your name" }), {
      target: { value: "Alex" },
    });
    fireEvent.change(
      screen.getByRole("textbox", { name: "Other person's name" }),
      { target: { value: "Casey" } },
    );
    fireEvent.change(
      screen.getByRole("textbox", { name: "Conversation text" }),
      { target: { value: "Me: Remember the pier?\nThem: And the cafe!" } },
    );
    expect(onAdd).not.toHaveBeenCalled();
    await user.click(
      screen.getByRole("button", { name: "Preview who's speaking" }),
    );
    expect(screen.getByText(/Alex: Remember the pier/)).toBeVisible();
    expect(onAdd).not.toHaveBeenCalled();
    await user.click(
      screen.getByRole("button", {
        name: "Add reviewed conversation to story",
      }),
    );
    expect(onAdd).toHaveBeenCalledWith(
      "Alex: Remember the pier?\nCasey: And the cafe!",
      { you: "Alex", partner: "Casey" },
    );
    expect(
      mapConversation(
        "Green: A\nGray: B\nUnknown: C",
        "Alex",
        "Casey",
        "Green",
        "Gray",
      ),
    ).toBe("Alex: A\nCasey: B\nUnknown: C");
  });
  it("keeps guided answers and freeform text together after switching input styles", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(
      screen.getByRole("button", { name: "Create a personal puzzle" }),
    );
    fireEvent.change(screen.getByRole("textbox", { name: /early memory/ }), {
      target: { value: "We met at the pier" },
    });
    await user.click(
      screen.getByRole("button", { name: "Paste or speak freely" }),
    );
    fireEvent.change(screen.getByRole("textbox", { name: "Tell your story" }), {
      target: { value: "Our favorite cafe is nearby" },
    });
    await user.click(
      screen.getByRole("button", { name: "Guide me with questions" }),
    );
    await waitFor(() =>
      expect(readLibrary().profiles[0].brief.freeStory).toBe(
        "Our favorite cafe is nearby",
      ),
    );
    const request = generationRequest(readLibrary().profiles[0].brief);
    expect(request.notes).toContain("We met at the pier");
    expect(request.notes).toContain("Our favorite cafe is nearby");
  });
  it("preserves freeform stories and explicit identity in backups and defaults new personal games to Challenge", () => {
    const profile = parseProfile({
      id: "voice",
      name: "Our story",
      brief: {
        ...defaultBrief,
        freeStory: "At the cafe",
        conversation: "Alex: I remember",
        people: { you: "Alex", partner: "Casey" },
        inputMode: "free",
      },
    });
    expect(profile.brief.people?.partner).toBe("Casey");
    expect(generationRequest(profile.brief).people?.you).toBe("Alex");
    expect(profile.brief.conversation).toBe("Alex: I remember");
    expect(defaultBrief.mode).toBe("challenge");
    expect(defaultBrief.difficulty).toBe("balanced");
  });
});
