import { useEffect, useRef, useState } from "react";
import { Dictation } from "./Dictation";
import { storyHints, storyQuestions } from "./story";

export function StoryQuestions({
  answers,
  onChange,
  extraAnswers = [],
  onExtraChange,
}: {
  answers: string[];
  onChange: (answers: string[]) => void;
  extraAnswers?: { question: string; answer: string }[];
  onExtraChange?: (answers: { question: string; answer: string }[]) => void;
}) {
  const prompts = [
    ...storyQuestions,
    ...extraAnswers.map((item) => item.question),
  ];
  const values = [
    ...storyQuestions.map((_, index) => answers[index] || ""),
    ...extraAnswers.map((item) => item.answer),
  ];
  const [question, setQuestion] = useState(() =>
    answers.some((value) => value.trim()) ? prompts.length : 0,
  );
  const [customQuestion, setCustomQuestion] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);
  // biome-ignore lint/correctness/useExhaustiveDependencies: Focus the prompt only when navigating questions, never while typing.
  useEffect(() => {
    if (moved.current) heading.current?.focus();
    moved.current = true;
  }, [question]);

  function answer(value: string) {
    if (question >= 4) {
      onExtraChange?.(
        extraAnswers.map((item, index) =>
          index === question - 4 ? { ...item, answer: value } : item,
        ),
      );
      return;
    }
    onChange(
      storyQuestions.map((_, index) =>
        index === question ? value : answers[index] || "",
      ),
    );
  }

  return (
    <section className="story-questions" aria-label="Your shared story">
      <h3 ref={heading} tabIndex={-1}>
        {question < prompts.length
          ? `A little about you two · ${question + 1} of ${prompts.length}`
          : "Your story so far"}
      </h3>
      {question < prompts.length ? (
        <>
          <p className="field-help">
            Tap the mic and tell it naturally. Every question is optional.
          </p>
          <label htmlFor="story-answer">{prompts[question]}</label>
          <p id="story-answer-help" className="field-help">
            {storyHints[question] ||
              "Add names or details you both recognize. You can skip this or return later."}
          </p>
          <Dictation
            key={question}
            primary
            value={values[question] || ""}
            onChange={answer}
            maxLength={3000}
          />
          <textarea
            id="story-answer"
            aria-describedby="story-answer-help"
            value={values[question] || ""}
            maxLength={3000}
            rows={3}
            placeholder="Your words appear here. You can also type or edit."
            onChange={(event) => answer(event.target.value)}
          />
          <p className="field-help">
            {(values[question] || "").length}/3,000 characters
          </p>
          <div className="creator-actions">
            {question > 0 && (
              <button
                type="button"
                className="text-button"
                onClick={() => setQuestion(question - 1)}
              >
                Previous question
              </button>
            )}
            <button
              type="button"
              className="secondary-button"
              onClick={() => setQuestion(question + 1)}
            >
              {question === prompts.length - 1
                ? "Review my answers"
                : "Next question"}
            </button>
            <button
              type="button"
              className="text-button"
              onClick={() => {
                answer("");
                setQuestion(question + 1);
              }}
            >
              Skip this question
            </button>
          </div>
        </>
      ) : (
        <>
          <details className="story-review-details">
            <summary>
              Review saved answers (
              {values.filter((value) => value.trim()).length})
            </summary>
            <dl className="story-review">
              {prompts.map((prompt, index) => (
                <div key={prompt}>
                  <dt>{prompt}</dt>
                  <dd>{values[index]?.trim() || "Skipped"}</dd>
                </div>
              ))}
            </dl>
          </details>
          <button
            type="button"
            className="text-button"
            onClick={() => setQuestion(0)}
          >
            Edit my story answers
          </button>
          {!answers.some((value) => value.trim()) && (
            <p className="field-help">
              No memories added. We'll use your shared interests for a themed
              puzzle.
            </p>
          )}
          {onExtraChange && extraAnswers.length < 8 && (
            <details className="story-followup">
              <summary>Add a new memory</summary>
              <p>
                Add a detail when you feel like it. Your earlier answers stay
                saved.
              </p>
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  const options = [
                    "Which restaurants or foods are part of your story? Name a few favorites.",
                    "Who are the family members or friends you both know, and how are they connected?",
                    "Which shows, films, or games have you enjoyed together?",
                    "What places have you lived in or visited, and what happened there?",
                    "What nicknames, sayings, or inside jokes do you share?",
                    "What new memory would you like to add today?",
                    "What traditions or celebrations do you share?",
                    "What hobbies or plans are you looking forward to together?",
                  ];
                  const next = options.find(
                    (prompt) => !prompts.includes(prompt),
                  );
                  if (next) {
                    onExtraChange([
                      ...extraAnswers,
                      { question: next, answer: "" },
                    ]);
                    setQuestion(prompts.length);
                  }
                }}
              >
                Ask me another question
              </button>
              <label>
                Or add your own question
                <input
                  value={customQuestion}
                  maxLength={180}
                  onChange={(event) => setCustomQuestion(event.target.value)}
                />
              </label>
              <button
                type="button"
                className="text-button"
                disabled={
                  !customQuestion.trim() ||
                  prompts.includes(customQuestion.trim())
                }
                onClick={() => {
                  onExtraChange([
                    ...extraAnswers,
                    { question: customQuestion.trim(), answer: "" },
                  ]);
                  setQuestion(prompts.length);
                  setCustomQuestion("");
                }}
              >
                Add my question
              </button>
            </details>
          )}
        </>
      )}
      <p className="field-help">
        People, places, favorites—short lists work. You can add more later.
      </p>
    </section>
  );
}
