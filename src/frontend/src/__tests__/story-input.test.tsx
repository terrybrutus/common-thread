import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "../App";
import { generationRequest } from "../creator/ai";
import { parseProfile, readLibrary } from "../creator/library";
import { defaultBrief } from "../creator/schema";

describe("personal voice and story input", () => {
  it("keeps guided answers and freeform text together after switching input styles", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(
      screen.getByRole("button", { name: "Create a personal puzzle" }),
    );
    expect(
      screen.queryByText("Import a conversation excerpt"),
    ).not.toBeInTheDocument();
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
