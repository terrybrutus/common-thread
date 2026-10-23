import { useEffect, useRef, useState } from "react";
import { Dictation } from "./Dictation";
import { type StoryScope, questionsFor, storyHints } from "./story";

export function StoryQuestions({
  answers,
  onChange,
  extraAnswers = [],
  onExtraChange,
  scope,
}: {
  answers: string[];
  onChange: (answers: string[]) => void;
  extraAnswers?: { question: string; answer: string }[];
  onExtraChange?: (answers: { question: string; answer: string }[]) => void;
  scope?: StoryScope;
}) {
  const storyQuestions = questionsFor(scope);
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
  const [quiet, setQuiet] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [questionNotice, setQuestionNotice] = useState("");
  const suggestions = [
    "Which restaurants or foods are part of your story? Name a few favorites.",
    "Who are the family members, friends, or pets in this story, and how are they connected?",
    "Which shows, films, or games belong in this story?",
    "What places have you lived in or visited, and what happened there?",
    "What nicknames, sayings, or inside jokes belong in this story?",
    "What traditions or celebrations belong in this story?",
    "Which songs or artists bring back a particular time or event, and why?",
    "What hobbies or plans would you like to add to this story?",
  ];
  const nextSuggestion = suggestions.find(
    (prompt) => !prompts.includes(prompt),
  );
  const transcript = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (quiet) transcript.current?.focus();
  }, [quiet]);
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
  function review() {
    setReviewOpen(true);
    setQuestion(prompts.length);
    setQuestionNotice("");
  }
  function skip() {
    setQuestionNotice("");
    if (question >= 4 && question === prompts.length - 1 && onExtraChange) {
      const next = extraAnswers.map((item, index) =>
        index === question - 4 ? { ...item, answer: "" } : item,
      );
      if (nextSuggestion && extraAnswers.length < 8) {
        onExtraChange([...next, { question: nextSuggestion, answer: "" }]);
        setQuestion(prompts.length);
      } else {
        onExtraChange(next);
        setQuestionNotice(
          "You've reached the last suggested question. Review your answers when you're ready.",
        );
      }
      return;
    }
    answer("");
    if (question === prompts.length - 1) review();
    else setQuestion(question + 1);
  }

  return (
    <section className="story-questions" aria-label="Your story">
      <h3 ref={heading} tabIndex={-1}>
        {question < prompts.length
          ? `Your story · ${question + 1} of ${prompts.length}`
          : "Your story so far"}
      </h3>
      {question < prompts.length ? (
        <>
          <p className="field-help">
            A few words or a short list is enough. Every question is optional.
          </p>
          <label htmlFor="story-answer">{prompts[question]}</label>
          <p id="story-answer-help" className="field-help">
            {storyHints[question] ||
              "Add recognizable names or details. You can skip this or return later."}
          </p>
          {!quiet && (
            <Dictation
              key={question}
              primary
              value={values[question] || ""}
              onChange={answer}
              maxLength={3000}
            />
          )}
          <button
            type="button"
            className="text-button"
            onClick={() => setQuiet(!quiet)}
          >
            {quiet ? "Use microphone instead" : "Type quietly instead"}
          </button>
          {quiet && (
            <p className="field-help">
              Keeping it a surprise? Names and short lists work—no full
              sentences needed. Your answers save as you go.
            </p>
          )}
          <textarea
            ref={transcript}
            id="story-answer"
            aria-describedby="story-answer-help"
            value={values[question] || ""}
            maxLength={3000}
            rows={3}
            placeholder={
              quiet
                ? "Just the details you remember…"
                : "Your words appear here. You can also type or edit."
            }
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
              onClick={() =>
                question === prompts.length - 1
                  ? review()
                  : setQuestion(question + 1)
              }
            >
              {question === prompts.length - 1
                ? "Review my answers"
                : "Next question"}
            </button>
            <button type="button" className="text-button" onClick={skip}>
              Skip this question
            </button>
          </div>
          {questionNotice && (
            <output className="field-help">{questionNotice}</output>
          )}
        </>
      ) : (
        <>
          <details
            className="story-review-details"
            open={reviewOpen}
            onToggle={(event) => setReviewOpen(event.currentTarget.open)}
          >
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
              No memories added yet. Add a few details, or try the example
              below.
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
                disabled={!nextSuggestion}
                onClick={() => {
                  const next = nextSuggestion;
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
