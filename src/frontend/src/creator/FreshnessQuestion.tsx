import { type RefObject, useEffect, useRef } from "react";
import { Dictation } from "./Dictation";
import type { FreshnessPrompt } from "./history";

export function FreshnessQuestion({
  prompt,
  pending,
  error,
  returnFocus,
  onAnswer,
  onSave,
  onSkip,
}: {
  prompt: FreshnessPrompt;
  pending: boolean;
  error?: string;
  returnFocus: RefObject<HTMLButtonElement | null>;
  onAnswer: (value: string) => void;
  onSave: () => void;
  onSkip: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const answer = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const element = dialog.current;
    element?.showModal();
    answer.current?.focus({ preventScroll: true });
    return () => {
      element?.close();
      (returnFocus.current || previous)?.focus({ preventScroll: true });
    };
  }, [returnFocus]);
  return (
    <dialog
      ref={dialog}
      className="memory-dialog"
      aria-labelledby="memory-title"
      aria-describedby="memory-help"
      onCancel={(event) => {
        event.preventDefault();
        if (!pending) onSkip();
      }}
    >
      <span className="eyebrow">YOUR STORY KEEPS GROWING</span>
      <h2 id="memory-title">One quick question</h2>
      <p id="memory-help" className="field-help">
        A little more about you could open up new connections. A short answer or
        list is plenty.
      </p>
      <label htmlFor="fresh-memory">{prompt.question}</label>
      <textarea
        ref={answer}
        id="fresh-memory"
        rows={3}
        maxLength={3000}
        value={prompt.answer}
        onChange={(event) => onAnswer(event.target.value)}
        disabled={pending}
      />
      {!pending && (
        <Dictation value={prompt.answer} onChange={onAnswer} maxLength={3000} />
      )}
      <p className="field-help">
        Your answer joins your saved story, ready for future puzzles too.
      </p>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="creator-actions">
        <button
          type="button"
          className="primary-button"
          disabled={pending || !prompt.answer.trim()}
          onClick={onSave}
        >
          Add to story &amp; make puzzle
        </button>
        <button
          type="button"
          className="text-button"
          disabled={pending}
          onClick={onSkip}
        >
          Skip for now
        </button>
      </div>
    </dialog>
  );
}
