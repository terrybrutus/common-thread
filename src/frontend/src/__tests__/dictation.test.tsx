import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Dictation } from "../creator/Dictation";

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
});
