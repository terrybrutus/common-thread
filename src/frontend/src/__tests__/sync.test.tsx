import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { hostedOperation, isStoryConnected } from "../creator/hosted";
import {
  type StoryLibrary,
  type StoryProfile,
  parseProfile,
} from "../creator/library";
import { defaultBrief } from "../creator/schema";
import { mergeCloudLibrary, mergeProfile } from "../creator/sync";
import { useStorySync } from "../creator/useStorySync";
vi.mock("../creator/hosted", () => ({
  CONNECTION_EVENT: "common-thread-connection",
  connectStoryCloud: vi.fn(),
  hostedOperation: vi.fn(),
  isStoryConnected: vi.fn(),
}));
function profile(extra = "", time = 100): StoryProfile {
  return parseProfile({
    id: "our-story",
    name: "Our story",
    updatedAt: time,
    brief: {
      ...defaultBrief,
      storyAnswers: [
        "Our first meeting",
        "Our homes",
        "Our shows",
        "Our jokes",
      ],
      extraAnswers: extra ? [{ question: "What else?", answer: extra }] : [],
    },
  });
}
function Harness({ initial }: { initial: StoryProfile }) {
  const [library, setLibrary] = useState<StoryLibrary>({
    activeId: initial.id,
    profiles: [initial],
  });
  const sync = useStorySync(library, setLibrary, true);
  const current = library.profiles.find((p) => p.id === library.activeId)!;
  return (
    <>
      <p>{sync.message}</p>
      <textarea
        aria-label="Fifth answer"
        value={current.brief.extraAnswers?.[0]?.answer || ""}
        onChange={(event) =>
          setLibrary((value) => ({
            ...value,
            profiles: value.profiles.map((p) =>
              p.id !== current.id
                ? p
                : {
                    ...p,
                    updatedAt: Date.now(),
                    brief: {
                      ...p.brief,
                      extraAnswers: [
                        { question: "What else?", answer: event.target.value },
                      ],
                    },
                  },
            ),
          }))
        }
      />
    </>
  );
}
beforeEach(() => {
  vi.mocked(hostedOperation).mockReset();
  vi.mocked(isStoryConnected).mockReturnValue(true);
});
async function settle() {
  await act(async () => {
    await Promise.resolve();
  });
}
describe("cross-computer living stories", () => {
  it("restores a fifth cloud answer even when the Mac's four-answer copy has a newer timestamp", async () => {
    const cloud = profile("The detailed fifth memory", 100);
    vi.mocked(hostedOperation).mockResolvedValue({ profiles: [cloud] });
    render(<Harness initial={profile("", 200)} />);
    await settle();
    expect(screen.getByLabelText("Fifth answer")).toHaveValue(
      "The detailed fifth memory",
    );
    expect(hostedOperation).toHaveBeenCalledWith("load-story", {}, true);
  });
  it("reads cloud before uploading a fifth answer stranded on Windows, without an AI call", async () => {
    vi.useFakeTimers();
    let cloud = profile();
    vi.mocked(hostedOperation).mockImplementation(async (operation, value) => {
      if (operation === "load-story") return { profiles: [cloud] };
      cloud = mergeProfile(value as StoryProfile, cloud);
      return { profile: cloud };
    });
    render(
      <Harness initial={profile("My long Windows-only fifth answer", 200)} />,
    );
    await settle();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1300);
    });
    expect(cloud.brief.extraAnswers?.[0].answer).toBe(
      "My long Windows-only fifth answer",
    );
    expect(
      vi.mocked(hostedOperation).mock.calls.map((call) => call[0]),
    ).toEqual(["load-story", "save-story"]);
    expect(screen.getByText("Saved across your computers.")).toBeVisible();
  });
  it("automatically saves edits and uploads newer typing after an older save was in flight", async () => {
    vi.useFakeTimers();
    let cloud = profile("Existing memory");
    let release: ((value: unknown) => void) | undefined;
    let saves = 0;
    vi.mocked(hostedOperation).mockImplementation(async (operation, value) => {
      if (operation === "load-story") return { profiles: [cloud] };
      saves++;
      const incoming = value as StoryProfile;
      if (saves === 1)
        return new Promise((resolve) => {
          release = () => {
            cloud = mergeProfile(incoming, cloud);
            resolve({ profile: cloud });
          };
        });
      cloud = mergeProfile(incoming, cloud);
      return { profile: cloud };
    });
    render(<Harness initial={cloud} />);
    await settle();
    fireEvent.change(screen.getByLabelText("Fifth answer"), {
      target: { value: "Existing memory and more" },
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1300);
    });
    fireEvent.change(screen.getByLabelText("Fifth answer"), {
      target: { value: "Existing memory and more detail from Windows" },
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1300);
    });
    await act(async () => {
      release?.({});
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1300);
    });
    expect(cloud.brief.extraAnswers?.[0].answer).toBe(
      "Existing memory and more detail from Windows",
    );
    expect(saves).toBe(2);
  });
  it("keeps local answers and does not upload anything when initial cloud loading fails", async () => {
    vi.useFakeTimers();
    vi.mocked(hostedOperation).mockRejectedValue(
      new Error("Connection unavailable"),
    );
    render(<Harness initial={profile("Keep my fifth answer")} />);
    await settle();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1300);
    });
    expect(screen.getByLabelText("Fifth answer")).toHaveValue(
      "Keep my fifth answer",
    );
    expect(
      vi.mocked(hostedOperation).mock.calls.map((call) => call[0]),
    ).toEqual(["load-story"]);
  });
  it("selects the latest cloud story on a new computer while retaining the local placeholder", () => {
    const blank = parseProfile({
      id: "blank",
      name: "Our story",
      brief: defaultBrief,
      updatedAt: 300,
    });
    const merged = mergeCloudLibrary(
      { activeId: blank.id, profiles: [blank] },
      [profile("Fifth answer", 200)],
    );
    expect(merged.activeId).toBe("our-story");
    expect(merged.profiles).toHaveLength(2);
    expect(
      mergeProfile(
        profile("A detailed answer", 100),
        profile("A detailed answer and more", 200),
      ).brief.extraAnswers?.[0].answer,
    ).toBe("A detailed answer and more");
  });
});
