import { Mic, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Recognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult:
    | ((event: {
        resultIndex: number;
        results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
      }) => void)
    | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}
type SpeechWindow = Window & {
  SpeechRecognition?: new () => Recognition;
  webkitSpeechRecognition?: new () => Recognition;
};

export function Dictation({
  value,
  onChange,
  maxLength,
}: { value: string; onChange: (value: string) => void; maxLength: number }) {
  const [listening, setListening] = useState(false);
  const [message, setMessage] = useState("");
  const active = useRef<Recognition | null>(null);
  const latest = useRef({ value, onChange });
  latest.current = { value, onChange };
  const Speech =
    (window as SpeechWindow).SpeechRecognition ||
    (window as SpeechWindow).webkitSpeechRecognition;
  useEffect(
    () => () => {
      if (active.current) {
        active.current.onresult = null;
        active.current.onerror = null;
        active.current.onend = null;
        active.current.abort();
      }
    },
    [],
  );
  if (!Speech)
    return (
      <p className="field-help">
        Microphone dictation isn't available in this browser. Try Chrome or
        Edge, or use your keyboard's dictation.
      </p>
    );
  function start() {
    if (active.current) {
      active.current.stop();
      return;
    }
    const recognition = new Speech!();
    active.current = recognition;
    recognition.lang = navigator.language || "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      let words = "";
      for (let i = event.resultIndex; i < event.results.length; i++)
        if (event.results[i].isFinal)
          words += ` ${event.results[i][0].transcript}`;
      if (!words.trim()) return;
      const next = `${latest.current.value.trimEnd()}${words}`.trimStart();
      latest.current.value = next.slice(0, maxLength);
      latest.current.onChange(next.slice(0, maxLength));
      if (next.length >= maxLength) {
        recognition.stop();
        setMessage(
          "This answer is full. You can continue in another question or shorten the transcript.",
        );
      }
    };
    recognition.onerror = (event) => {
      setMessage(
        event.error === "not-allowed"
          ? "Microphone permission was denied. Allow it in your browser or type your answer."
          : "Dictation stopped. Check your microphone and connection, then try again.",
      );
    };
    recognition.onend = () => {
      active.current = null;
      setListening(false);
    };
    try {
      recognition.start();
      setListening(true);
      setMessage("");
    } catch {
      active.current = null;
      setListening(false);
      setMessage("Couldn't start the microphone. Please try again.");
    }
  }
  return (
    <div className="dictation-control">
      <button
        type="button"
        className="secondary-button"
        aria-pressed={listening}
        onClick={start}
      >
        {listening ? <Square size={16} /> : <Mic size={16} />}
        {listening ? "Stop dictation" : "Speak your answer"}
      </button>
      <output className="field-help">
        {message ||
          (listening
            ? "Listening… speak naturally. You can edit the transcript."
            : "Your browser handles speech recognition and may send audio to its speech service. Only the text goes to Claude when you generate.")}
      </output>
    </div>
  );
}
