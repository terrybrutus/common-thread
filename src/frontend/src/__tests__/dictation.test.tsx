import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Dictation } from "../creator/Dictation";
import { StoryQuestions } from "../creator/StoryQuestions";

describe("browser dictation", () => {
  afterEach(() => vi.unstubAllGlobals());
  it("appends final speech segments, stops, and cleans up without generating a puzzle", () => {
    let recognition: any;
    class MockRecognition {
      start = vi.fn();
      stop = vi.fn();
      abort = vi.fn();
      constructor() {
        recognition = this;
      }
    }
    vi.stubGlobal("webkitSpeechRecognition", MockRecognition);
    const onChange = vi.fn();
    const { unmount } = render(
      <Dictation value="We met" onChange={onChange} maxLength={3000} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Speak your answer" }));
    expect(recognition.start).toHaveBeenCalledOnce();
    act(() => {
      recognition.onresult({
        resultIndex: 0,
        results: [{ isFinal: true, 0: { transcript: "in February" } }],
      });
      recognition.onresult({
        resultIndex: 0,
        results: [{ isFinal: true, 0: { transcript: "in Alexandria" } }],
      });
    });
    expect(onChange).toHaveBeenLastCalledWith(
      "We met in February in Alexandria",
    );
    fireEvent.click(screen.getByRole("button", { name: "Stop dictation" }));
    expect(recognition.stop).toHaveBeenCalledOnce();
    unmount();
    expect(recognition.abort).toHaveBeenCalledOnce();
    expect(recognition.onresult).toBeNull();
  });
  it("explains missing browser support", () => {
    vi.stubGlobal("SpeechRecognition", undefined);
    vi.stubGlobal("webkitSpeechRecognition", undefined);
    render(<Dictation value="" onChange={vi.fn()} maxLength={3000} />);
    expect(screen.getByText(/isn't available in this browser/)).toBeVisible();
  });
  it("puts the mic before the answer and stops listening when moving to the next question", () => {
    let recognition: any;
    class MockRecognition {
      start = vi.fn();
      stop = vi.fn();
      abort = vi.fn();
      constructor() {
        recognition = this;
      }
    }
    vi.stubGlobal("webkitSpeechRecognition", MockRecognition);
    const onChange = vi.fn();
    render(<StoryQuestions answers={[]} onChange={onChange} />);
    const mic = screen.getByRole("button", { name: "Speak your answer" });
    const transcript = screen.getByRole("textbox");
    expect(mic).toHaveClass("primary-button");
    expect(
      mic.compareDocumentPosition(transcript) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    fireEvent.click(mic);
    act(() =>
      recognition.onresult({
        resultIndex: 0,
        results: [{ isFinal: true, 0: { transcript: "We met at the cafe" } }],
      }),
    );
    expect(onChange).toHaveBeenCalledWith(["We met at the cafe", "", "", ""]);
    fireEvent.click(screen.getByRole("button", { name: "Next question" }));
    expect(recognition.abort).toHaveBeenCalledOnce();
    expect(screen.getByRole("heading", { name: /2 of 4/ })).toBeVisible();
  });
  it("offers quiet typing without losing the answer and stops an active microphone", () => {
    let recognition: any;
    class MockRecognition {
      start = vi.fn();
      stop = vi.fn();
      abort = vi.fn();
      constructor() {
        recognition = this;
      }
    }
    vi.stubGlobal("webkitSpeechRecognition", MockRecognition);
    const onChange = vi.fn();
    render(<StoryQuestions answers={["At the cafe"]} onChange={onChange} />);
    fireEvent.click(
      screen.getByRole("button", { name: "Edit my story answers" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Speak your answer" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Type quietly instead" }),
    );
    expect(recognition.abort).toHaveBeenCalledOnce();
    expect(
      screen.queryByRole("button", { name: "Speak your answer" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("textbox")).toHaveValue("At the cafe");
    expect(screen.getByRole("textbox")).toHaveFocus();
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Cafe, spring, rain" },
    });
    expect(onChange).toHaveBeenCalledWith(["Cafe, spring, rain", "", "", ""]);
  });
});
