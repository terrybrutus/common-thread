import { useEffect, useRef, useState } from "react";
import { Dictation } from "./Dictation";
import { storyHints, storyQuestions } from "./story";

export function StoryQuestions({
  answers,
  onChange,
}: {
  answers: string[];
  onChange: (answers: string[]) => void;
}) {
  const [question, setQuestion] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);
  // biome-ignore lint/correctness/useExhaustiveDependencies: Focus the prompt only when navigating questions, never while typing.
  useEffect(() => {
    if (moved.current) heading.current?.focus();
    moved.current = true;
  }, [question]);

  function answer(value: string) {
    onChange(
      storyQuestions.map((_, index) =>
        index === question ? value : answers[index] || "",
      ),
    );
  }

  return (
    <section className="story-questions" aria-label="Your shared story">
      <h3 ref={heading} tabIndex={-1}>
        {question < 4
          ? `A little about you two · ${question + 1} of 4`
          : "Your story so far"}
      </h3>
      {question < 4 ? (
        <>
          <p className="field-help">
            Short answers are perfect. Every question is optional.
          </p>
          <label htmlFor="story-answer">{storyQuestions[question]}</label>
          <p id="story-answer-help" className="field-help">
            {storyHints[question]}
          </p>
          <textarea
            id="story-answer"
            aria-describedby="story-answer-help"
            value={answers[question] || ""}
            maxLength={3000}
            rows={5}
            onChange={(event) => answer(event.target.value)}
          />
          <p className="field-help">
            {(answers[question] || "").length}/3,000 characters
          </p>
          <Dictation
            key={question}
            value={answers[question] || ""}
            onChange={answer}
            maxLength={3000}
          />
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
              {question === 3 ? "Review my answers" : "Next question"}
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
          <dl className="story-review">
            {storyQuestions.map((prompt, index) => (
              <div key={prompt}>
                <dt>{prompt}</dt>
                <dd>{answers[index]?.trim() || "Skipped"}</dd>
              </div>
            ))}
          </dl>
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
        </>
      )}
      <p className="field-help">
        A few specific details help: name the place and why it matters, or list
        foods, games, shows, and routines you share. Personal mix can fill gaps
        with related themes, without inventing memories. These answers aren't
        included in the invitation.
      </p>
    </section>
  );
}
