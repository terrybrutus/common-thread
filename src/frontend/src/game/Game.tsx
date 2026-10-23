import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CircleHelp,
  CircleX,
  Lightbulb,
  RotateCcw,
  Shuffle,
  Sparkles,
} from "lucide-react";
import { useEffect, useReducer, useRef, useState } from "react";
import { CopyField } from "../creator/CopyField";
import {
  MISTAKE_LIMIT,
  type Mode,
  hintFor,
  initialState,
  reduceGame,
  remainingWords,
  shuffleWords,
} from "./engine";
import { type Group, type Puzzle, lessons } from "./puzzles";

interface GameProps {
  puzzle: Puzzle;
  mode: Mode;
  onHome: () => void;
  onRestart: () => void;
  onNext: () => void;
  onRelaxed: () => void;
  personal?: boolean;
  onConnectionsSeen?: (groups: Group[]) => void;
  nextLabel?: string;
  homeLabel?: string;
}
export function Game({
  puzzle,
  mode,
  onHome,
  onRestart,
  onNext,
  onRelaxed,
  personal = false,
  onConnectionsSeen,
  nextLabel,
  homeLabel = "Home",
}: GameProps) {
  const [state, dispatch] = useReducer(
    (
      current: ReturnType<typeof initialState>,
      action: Parameters<typeof reduceGame>[1],
    ) => reduceGame(current, action, puzzle, mode),
    undefined,
    initialState,
  );
  const [order, setOrder] = useState(() =>
    shuffleWords(puzzle.groups.flatMap((group) => group.words)),
  );
  const [showRules, setShowRules] = useState(false);
  const [feedback, setFeedback] = useState<{
    kind: "wrong" | "repeat";
    words: string[];
    remaining: number;
  } | null>(null);
  const [lossPending, setLossPending] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const connectionRef = useRef<HTMLElement>(null);
  const remaining = remainingWords(puzzle, state);
  const hint = hintFor(puzzle, state);
  const ended = state.outcome !== "playing" && !lossPending;
  const tutorial = mode === "intro";
  const canHelp = mode !== "challenge";
  const reported = useRef(new Set<string>());
  useEffect(() => {
    if (!lossPending) return;
    // Let the last rejected selection finish its shake before revealing answers.
    const timer = window.setTimeout(() => setLossPending(false), 560);
    return () => window.clearTimeout(timer);
  }, [lossPending]);
  function submitGuess() {
    if (
      lossPending ||
      state.outcome !== "playing" ||
      state.selected.length !== 4
    )
      return;
    const next = reduceGame(state, { type: "submit" }, puzzle, mode);
    if (next.mistakes > state.mistakes) {
      setFeedback({
        kind: "wrong",
        words: [...state.selected],
        remaining: MISTAKE_LIMIT - next.mistakes,
      });
      const reducedMotion = window.matchMedia?.(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (next.outcome === "lost" && !reducedMotion) setLossPending(true);
      if (!reducedMotion) {
        try {
          navigator.vibrate?.([70, 45, 70]);
        } catch {
          /* Visual feedback remains available when vibration is blocked. */
        }
      }
    } else if (next.guesses.length === state.guesses.length) {
      setFeedback({
        kind: "repeat",
        words: [...state.selected],
        remaining: MISTAKE_LIMIT - state.mistakes,
      });
    } else setFeedback(null);
    dispatch({ type: "submit" });
  }
  useEffect(() => {
    if (!onConnectionsSeen) return;
    const visible = puzzle.groups.filter(
      (group) =>
        (ended || state.solved.includes(group.id)) &&
        !reported.current.has(group.id),
    );
    if (visible.length) {
      for (const group of visible) reported.current.add(group.id);
      onConnectionsSeen(visible);
    }
  }, [ended, state.solved, onConnectionsSeen, puzzle.groups]);
  useEffect(() => {
    titleRef.current?.focus();
  }, []);
  useEffect(() => {
    if (ended) resultRef.current?.focus();
  }, [ended]);
  useEffect(() => {
    if (state.solved.length > 0 && !ended) connectionRef.current?.focus();
  }, [state.solved.length, ended]);

  return (
    <section className="game" aria-labelledby="game-title">
      <div className="game-nav">
        <button className="text-button" type="button" onClick={onHome}>
          <ArrowLeft size={16} /> {homeLabel}
        </button>
        <span className={`mode-label ${mode}`}>
          {
            {
              intro: "Practice",
              relaxed: "With hints",
              challenge: "Four-mistake challenge",
            }[mode]
          }
        </span>
        <button
          className="text-button"
          type="button"
          aria-expanded={showRules}
          aria-controls="game-rules"
          onClick={() => setShowRules(!showRules)}
        >
          <CircleHelp size={16} /> Rules
        </button>
      </div>
      {showRules && (
        <div className="rules-panel" id="game-rules">
          <strong>Find groups of four related words.</strong>
          <p>
            Select four tiles, then choose “Check group.” Each word belongs to
            one intended group. Shuffle to get a fresh perspective.{" "}
            {canHelp
              ? "Guesses are unlimited. Hints are optional and become more specific."
              : "Four incorrect groups end the challenge. Repeating a guess does not count again. There are no hints or timer."}{" "}
            Progress stays here while this round is open; leaving or refreshing
            starts a fresh round.
          </p>
        </div>
      )}
      <div className="game-heading">
        <span className="eyebrow">{puzzle.topic}</span>
        <h1 id="game-title" ref={titleRef} tabIndex={-1}>
          {puzzle.title}
        </h1>
        <p>{puzzle.description}</p>
      </div>
      <div className="board-meta">
        <span>
          {state.solved.length} of {puzzle.groups.length} threads connected
        </span>
        {mode === "challenge" ? (
          <span
            className={`mistakes ${feedback?.kind === "wrong" ? "mistake-used" : ""}`}
            aria-label={`${MISTAKE_LIMIT - state.mistakes} mistakes remaining`}
          >
            Mistakes left{" "}
            <span aria-hidden="true">
              {Array.from({ length: MISTAKE_LIMIT }, (_, index) => (
                <i
                  key={`mistake-${index + 1}`}
                  className={
                    index < MISTAKE_LIMIT - state.mistakes
                      ? "available"
                      : "used"
                  }
                />
              ))}
            </span>
            <strong>{MISTAKE_LIMIT - state.mistakes}</strong>
          </span>
        ) : (
          <span>
            {tutorial ? "Practice freely" : "No rush. No guess limit."}
          </span>
        )}
      </div>
      <div className="solved-groups" aria-label="Discovered connections">
        {state.solved.map((id) => {
          const group = puzzle.groups.find((entry) => entry.id === id)!;
          return (
            <article
              key={id}
              ref={id === state.solved.at(-1) ? connectionRef : undefined}
              tabIndex={-1}
              aria-labelledby={`connection-${id}`}
              className={`solved-group group-color-${puzzle.groups.indexOf(group)}`}
            >
              <span className="solved-label">
                <Check size={16} />
                {state.revealed.includes(id) ? "GUIDED REVEAL" : "THREAD FOUND"}
              </span>
              <h2 id={`connection-${id}`}>{group.category}</h2>
              <p className="group-words">{group.words.join(" · ")}</p>
              <p className="explanation">{group.explanation}</p>
            </article>
          );
        })}
      </div>
      {!ended && (
        <>
          <fieldset className="word-board" aria-label="Words to connect">
            {order
              .filter((word) => remaining.includes(word))
              .map((word) => (
                <button
                  key={word}
                  type="button"
                  className={`word-tile ${state.selected.includes(word) ? "selected" : ""} ${hint.anchors.includes(word) ? "hint-anchor" : ""} ${feedback?.kind === "wrong" && feedback.words.includes(word) ? "rejected" : ""}`}
                  aria-invalid={
                    feedback?.kind === "wrong" && feedback.words.includes(word)
                      ? true
                      : undefined
                  }
                  aria-pressed={state.selected.includes(word)}
                  aria-describedby={
                    hint.anchors.includes(word) ? "hint-message" : undefined
                  }
                  disabled={
                    lossPending ||
                    (state.selected.length === 4 &&
                      !state.selected.includes(word))
                  }
                  onClick={() => {
                    setFeedback(null);
                    dispatch({ type: "toggle", word });
                  }}
                >
                  {word}
                  {hint.anchors.includes(word) && (
                    <span className="anchor-dot" aria-hidden="true" />
                  )}
                </button>
              ))}
          </fieldset>
          <output className="selection-count" aria-live="polite">
            {state.selected.length} of 4 selected
          </output>
        </>
      )}
      <output
        className={`game-feedback ${feedback ? `guess-feedback ${feedback.kind}` : ""}`}
        role={feedback ? "alert" : undefined}
        aria-live={feedback ? "assertive" : "polite"}
        aria-atomic="true"
      >
        {feedback ? (
          <>
            <strong className="guess-feedback-title">
              <CircleX size={20} aria-hidden="true" />
              {feedback.kind === "wrong" ? "Not a connection" : "Already tried"}
            </strong>
            <span className="guess-feedback-count">
              {feedback.kind === "repeat"
                ? "No extra mistake used. Change at least one word."
                : mode === "challenge"
                  ? `Mistake used — ${feedback.remaining} of ${MISTAKE_LIMIT} remaining.`
                  : "Try a different group — you still have unlimited guesses."}
            </span>
            {feedback.kind === "wrong" && <span>{state.message}</span>}
          </>
        ) : (
          state.message
        )}
      </output>
      {!ended && (
        <>
          <div className="board-actions">
            <button
              className="secondary-button"
              type="button"
              disabled={lossPending}
              onClick={() => setOrder(shuffleWords(order))}
            >
              <Shuffle size={16} /> Shuffle
            </button>
            <button
              className="secondary-button"
              type="button"
              disabled={lossPending || state.selected.length === 0}
              onClick={() => {
                setFeedback(null);
                dispatch({ type: "clear" });
              }}
            >
              Clear<span className="wide-label"> selection</span>
            </button>
            <button
              className="primary-button check-button"
              type="button"
              disabled={lossPending || state.selected.length !== 4}
              onClick={submitGuess}
            >
              Check group
              <ArrowRight size={16} />
            </button>
          </div>
          {canHelp && (
            <div className="hint-section">
              <button
                className="text-button"
                type="button"
                disabled={lossPending || state.hintLevel >= 3}
                onClick={() => dispatch({ type: "hint" })}
              >
                <Lightbulb size={17} />
                {state.hintLevel === 0
                  ? "I'd like a hint"
                  : state.hintLevel < 3
                    ? "A little more help"
                    : "All hints shown for this group"}
              </button>
              {state.hintLevel > 0 && (
                <div className="hint-message" id="hint-message">
                  <span className="eyebrow">
                    {["", "A NUDGE", "AN ANCHOR", "A PAIR"][state.hintLevel]}
                  </span>
                  <output className="hint-text" aria-live="polite">
                    {hint.text}
                  </output>
                  <button
                    className="text-button"
                    type="button"
                    disabled={lossPending}
                    onClick={() => {
                      setFeedback(null);
                      dispatch({ type: "reveal" });
                    }}
                  >
                    Reveal and explain this group
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
      {ended && (
        <div
          className={`round-result ${state.outcome}`}
          ref={resultRef}
          tabIndex={-1}
          aria-label="Round result"
        >
          {state.outcome === "won" ? (
            <Sparkles size={26} />
          ) : (
            <BookOpen size={26} />
          )}
          <h2>
            {state.outcome === "lost"
              ? "No mistakes left"
              : tutorial
                ? "You've got the idea."
                : "All connected."}
          </h2>
          <p>
            {state.outcome === "lost"
              ? `You found ${state.solved.length} of ${puzzle.groups.length} threads. The remaining connections are below.`
              : tutorial
                ? puzzle.id === lessons[0].id
                  ? "Now try a word that can point in more than one direction."
                  : "Ready for a full puzzle? Hints are there when you need them."
                : `${puzzle.groups.length} threads connected. ${state.assisted ? "You explored with a little help." : state.mistakes ? `${state.mistakes} incorrect ${state.mistakes === 1 ? "guess" : "guesses"} along the way.` : "Without an incorrect guess!"} Take a discovery into your next puzzle.`}
          </p>
          <div className="result-actions">
            <button className="primary-button" type="button" onClick={onNext}>
              {tutorial
                ? puzzle.id === lessons[0].id
                  ? "Try the next practice"
                  : "Play with hints"
                : personal
                  ? "Back to invitation"
                  : nextLabel || "Next puzzle"}
              <ArrowRight size={16} />
            </button>
            {!tutorial && (
              <button
                className="secondary-button"
                type="button"
                onClick={onRestart}
              >
                <RotateCcw size={16} /> Replay puzzle
              </button>
            )}
            {mode === "challenge" && state.outcome === "lost" && (
              <button className="text-button" type="button" onClick={onRelaxed}>
                Play with hints
              </button>
            )}
          </div>
          {personal && (
            <CopyField
              label="Your result · copy and send it yourself"
              value={`Common Thread — ${puzzle.title}\n${mode === "relaxed" ? "With hints" : "Four-mistake challenge"}: ${state.solved.length}/${puzzle.groups.length} threads connected.\n${state.mistakes} incorrect guesses${state.assisted ? ", with hints or guided reveals" : ""}. ${state.outcome === "won" ? "All connected!" : "A discovery in every try."}`}
            />
          )}
        </div>
      )}
      {state.outcome === "lost" && (
        <div className="answer-reveal">
          <h2>The remaining threads</h2>
          {puzzle.groups
            .filter((group) => !state.solved.includes(group.id))
            .map((group) => (
              <article
                key={group.id}
                className={`solved-group group-color-${puzzle.groups.indexOf(group)}`}
              >
                <span className="solved-label">REVEALED CONNECTION</span>
                <h3>{group.category}</h3>
                <p className="group-words">{group.words.join(" · ")}</p>
                <p className="explanation">{group.explanation}</p>
              </article>
            ))}
        </div>
      )}
      {tutorial && !ended && (
        <button
          className="text-button skip-button"
          type="button"
          onClick={onRelaxed}
        >
          Skip practice and play
          <ArrowRight size={15} />
        </button>
      )}
    </section>
  );
}
