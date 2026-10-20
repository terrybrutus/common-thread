import { Dictation } from "./Dictation";
import type { FreshnessPrompt } from "./history";

export function FreshnessQuestion({
  prompt,
  pending,
  onAnswer,
  onSave,
  onSkip,
}: {
  prompt: FreshnessPrompt;
  pending: boolean;
  onAnswer: (value: string) => void;
  onSave: () => void;
  onSkip: () => void;
}) {
  return (
    <aside className="story-followup" aria-label="One optional memory">
      <h3>Want something fresher?</h3>
      <p className="field-help">
        This story is starting to revisit familiar connections. One little
        memory could open up more. This is optional.
      </p>
      <label htmlFor="fresh-memory">{prompt.question}</label>
      <textarea
        id="fresh-memory"
        rows={2}
        maxLength={3000}
        value={prompt.answer}
        onChange={(event) => onAnswer(event.target.value)}
        disabled={pending}
      />
      {!pending && (
        <Dictation value={prompt.answer} onChange={onAnswer} maxLength={3000} />
      )}
      <div className="creator-actions">
        <button
          type="button"
          className="secondary-button"
          disabled={pending || !prompt.answer.trim()}
          onClick={onSave}
        >
          Save &amp; make another
        </button>
        <button
          type="button"
          className="text-button"
          disabled={pending}
          onClick={onSkip}
        >
          Not now
        </button>
      </div>
    </aside>
  );
}
