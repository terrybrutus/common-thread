import {
  ArrowLeft,
  ArrowRight,
  Check,
  HeartHandshake,
  LoaderCircle,
  Sparkles,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { type Group, type Puzzle, puzzles } from "../game/puzzles";
import { CopyField } from "./CopyField";
import { StoryQuestions } from "./StoryQuestions";
import { generatePuzzle, generationErrorMessage } from "./ai";
import {
  type CreatorBrief,
  type FriendChallenge,
  defaultBrief,
  makeChallenge,
  validatePuzzle,
} from "./schema";
import { challengeLink, encodeChallenge } from "./sharing";

interface CreatorProps {
  onHome: () => void;
  onPlay: (challenge: FriendChallenge) => void;
}
const stepTitles = [
  "Who are we making this for?",
  "What brings you together?",
  "A little fun, or something to learn?",
  "How should this puzzle feel?",
];

export function Creator({ onHome, onPlay }: CreatorProps) {
  const [brief, setBrief] = useState<CreatorBrief>({ ...defaultBrief });
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Puzzle | null>(null);
  const [source, setSource] = useState<FriendChallenge["source"]>("ai");
  const [pending, setPending] = useState(false);
  const pendingRef = useRef(false);
  const [error, setError] = useState("");
  const [shared, setShared] = useState<FriendChallenge | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const hasDraft = draft !== null;
  const hasShared = shared !== null;
  // biome-ignore lint/correctness/useExhaustiveDependencies: Move focus only when navigating steps or preview screens, never while editing a field.
  useEffect(() => {
    heading.current?.focus();
  }, [step, hasDraft, hasShared]);
  function update<K extends keyof CreatorBrief>(
    key: K,
    value: CreatorBrief[K],
  ) {
    setBrief((current) => ({ ...current, [key]: value }));
  }
  async function generate() {
    if (pendingRef.current) return;
    pendingRef.current = true;
    setPending(true);
    setError("");
    try {
      setDraft(await generatePuzzle(brief));
      setSource("ai");
    } catch (error) {
      setError(
        `We couldn't make this puzzle. ${generationErrorMessage(error)}`,
      );
    } finally {
      pendingRef.current = false;
      setPending(false);
    }
  }
  function useExample() {
    const original = puzzles[brief.purpose === "study" ? 1 : 0];
    setDraft(
      validatePuzzle({
        ...original,
        title: `Example: ${original.title}`,
        description:
          "An example puzzle to explore the creator. This board wasn't generated from your answers.",
      }),
    );
    setSource("example");
    setError("");
  }
  function editGroup(index: number, next: Group) {
    setDraft(
      (current) =>
        current && {
          ...current,
          groups: current.groups.map((group, i) =>
            i === index ? next : group,
          ),
        },
    );
    setSource((current) => (current === "example" ? "example" : "edited"));
  }
  function finish() {
    setError("");
    try {
      if (draft) setShared(makeChallenge(brief, draft, source));
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Check this puzzle before sharing.",
      );
    }
  }
  const canContinue = step !== 1 || brief.interests.trim().length > 0;
  const canGenerate =
    brief.interests.trim().length > 0 &&
    (brief.purpose !== "study" || brief.topic.trim().length > 0);

  return (
    <section className="creator-page" aria-labelledby="creator-title">
      <button className="text-button" type="button" onClick={onHome}>
        <ArrowLeft size={16} /> All modes
      </button>
      <div className="creator-heading">
        <span className="eyebrow">
          <Sparkles size={14} /> MADE PERSONAL
        </span>
        <h1 id="creator-title" ref={heading} tabIndex={-1}>
          {shared
            ? "A little challenge, ready to send."
            : draft
              ? brief.style === "together"
                ? "Keep a little mystery."
                : "Your puzzle. Your finishing touch."
              : stepTitles[step]}
        </h1>
        <p>
          {shared
            ? "Send the link yourself, or copy a challenge code. No account needed to solve it."
            : draft
              ? brief.style === "together"
                ? "The connections are hidden so you can discover them together."
                : "AI does the heavy lifting. You get the final say."
              : "A few quick steps. A puzzle with your people in mind."}
        </p>
      </div>
      {shared ? (
        <div className="creator-panel share-panel">
          <HeartHandshake size={28} />
          <h2>{shared.puzzle.title}</h2>
          <p>
            For {shared.recipient || "your friend"}
            {shared.creator ? `, from ${shared.creator}` : ""}.
          </p>
          {shared.source === "example" && (
            <p className="example-label">Example puzzle · not AI-generated</p>
          )}
          <CopyField label="Challenge link" value={challengeLink(shared)} />
          {["localhost", "127.0.0.1", "::1"].includes(
            window.location.hostname,
          ) && (
            <p className="local-share-note">
              This preview link opens on this computer. Once Common Thread is
              published, its links will work for friends too. You can use a
              challenge code in another copy of the app now.
            </p>
          )}
          <details>
            <summary>Copy a challenge code instead</summary>
            <CopyField label="Challenge code" value={encodeChallenge(shared)} />
          </details>
          <div className="result-actions">
            <button
              className="primary-button"
              type="button"
              onClick={() => onPlay(shared)}
            >
              {shared.style === "together"
                ? "Start our puzzle"
                : "Test the puzzle"}
              <ArrowRight size={16} />
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={() => setShared(null)}
            >
              Back to preview
            </button>
          </div>
        </div>
      ) : draft ? (
        <>
          <div className="creator-panel">
            <span className={`source-label ${source}`}>
              {source === "example"
                ? "EXAMPLE PUZZLE · NOT AI-GENERATED"
                : source === "edited"
                  ? "AI DRAFT · EDITED BY YOU"
                  : "AI-GENERATED DRAFT"}
            </span>
            <h2>{draft.title}</h2>
            <p>{draft.description}</p>
            {brief.style === "gift" ? (
              <>
                <p className="review-note">
                  You're the puzzle maker, so you'll see the answers. Check that
                  each group makes sense, especially for study topics.
                  Structural checks can't verify every fact or possible
                  connection.
                </p>
                {draft.groups.map((group, index) => (
                  <details
                    className={`group-editor group-color-${index}`}
                    key={group.id}
                  >
                    <summary>
                      <Check size={15} />
                      <strong>{group.category}</strong>
                      <span>Edit connection</span>
                      <span className="preview-words">
                        {group.words.join(" · ")}
                      </span>
                    </summary>
                    <div className="editor-fields">
                      <label>
                        Category
                        <input
                          value={group.category}
                          maxLength={60}
                          onChange={(event) =>
                            editGroup(index, {
                              ...group,
                              category: event.target.value,
                            })
                          }
                        />
                      </label>
                      <label>
                        Four words, separated by commas
                        <input
                          value={group.words.join(", ")}
                          maxLength={110}
                          onChange={(event) =>
                            editGroup(index, {
                              ...group,
                              words: event.target.value
                                .split(",")
                                .map((word) => word.trim().toUpperCase()),
                            })
                          }
                        />
                      </label>
                      <label>
                        Hint
                        <input
                          value={group.clue}
                          maxLength={180}
                          onChange={(event) =>
                            editGroup(index, {
                              ...group,
                              clue: event.target.value,
                            })
                          }
                        />
                      </label>
                      <label>
                        Why they connect
                        <textarea
                          value={group.explanation}
                          maxLength={350}
                          rows={3}
                          onChange={(event) =>
                            editGroup(index, {
                              ...group,
                              explanation: event.target.value,
                            })
                          }
                        />
                      </label>
                    </div>
                  </details>
                ))}
              </>
            ) : (
              <div className="surprise-panel">
                <Sparkles size={24} />
                <h3>Four connections. No spoilers.</h3>
                <p>
                  Play side by side on one screen, or share the same board and
                  compare notes. Each screen keeps its own progress.
                </p>
                <p>Want to inspect or edit the answers first?</p>
                <button
                  className="text-button"
                  type="button"
                  onClick={() => update("style", "gift")}
                >
                  Switch to puzzle-maker preview
                </button>
              </div>
            )}
            <div className="creator-actions">
              <button
                className="primary-button"
                type="button"
                onClick={finish}
                disabled={pending}
              >
                Use this puzzle
                <ArrowRight size={16} />
              </button>
              <button
                className="secondary-button"
                type="button"
                onClick={generate}
                disabled={pending}
              >
                {pending
                  ? "Making another…"
                  : source === "example"
                    ? "Generate from my answers"
                    : "Try another puzzle"}
              </button>
              <button
                className="text-button"
                type="button"
                disabled={pending}
                onClick={() => {
                  setDraft(null);
                  setError("");
                }}
              >
                Change my answers
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          <ol className="creator-steps" aria-label="Puzzle creation steps">
            {stepTitles.map((title, index) => (
              <li
                key={title}
                aria-current={index === step ? "step" : undefined}
              >
                <span>{index < step ? <Check size={14} /> : index + 1}</span>
                <span>
                  {
                    [
                      "Your people",
                      "Shared interests",
                      "The occasion",
                      "The feel",
                    ][index]
                  }
                </span>
              </li>
            ))}
          </ol>
          <form
            className="creator-panel"
            onSubmit={(event) => {
              event.preventDefault();
              if (step < 3 && canContinue) {
                setError("");
                setStep(step + 1);
              } else if (step === 3 && canGenerate) void generate();
            }}
          >
            {step === 0 && (
              <>
                <fieldset className="choice-grid">
                  <legend>How will you play?</legend>
                  <label
                    className={
                      brief.style === "gift"
                        ? "choice selected-choice"
                        : "choice"
                    }
                  >
                    <input
                      type="radio"
                      name="style"
                      value="gift"
                      checked={brief.style === "gift"}
                      onChange={() => update("style", "gift")}
                    />
                    <strong>Make a challenge</strong>
                    <span>You create and review. Your friend solves.</span>
                  </label>
                  <label
                    className={
                      brief.style === "together"
                        ? "choice selected-choice"
                        : "choice"
                    }
                  >
                    <input
                      type="radio"
                      name="style"
                      value="together"
                      checked={brief.style === "together"}
                      onChange={() => update("style", "together")}
                    />
                    <strong>Solve together</strong>
                    <span>Keep the answers a surprise for both of you.</span>
                  </label>
                </fieldset>
                <div className="field-row">
                  <label>
                    Your nickname <span>(optional)</span>
                    <input
                      value={brief.creator}
                      maxLength={40}
                      onChange={(event) =>
                        update("creator", event.target.value)
                      }
                      placeholder="e.g. Terry"
                      autoComplete="off"
                    />
                  </label>
                  <label>
                    Friend's nickname <span>(optional)</span>
                    <input
                      value={brief.recipient}
                      maxLength={40}
                      onChange={(event) =>
                        update("recipient", event.target.value)
                      }
                      placeholder="e.g. Jessica"
                      autoComplete="off"
                    />
                  </label>
                </div>
                <p className="field-help">
                  Nicknames are just for the invitation. They aren't sent to AI.
                </p>
              </>
            )}
            {step === 1 && (
              <>
                <label>
                  What do you both enjoy?
                  <textarea
                    value={brief.interests}
                    maxLength={240}
                    onChange={(event) =>
                      update("interests", event.target.value)
                    }
                    placeholder="Basketball, baking, '90s music… whatever feels like you two."
                    rows={3}
                    required
                  />
                </label>
                <div className="interest-chips">
                  {[
                    "Music",
                    "Food",
                    "Nature",
                    "Sports",
                    "Movies",
                    "Science",
                  ].map((interest) => (
                    <button
                      key={interest}
                      className="secondary-button"
                      type="button"
                      onClick={() =>
                        update(
                          "interests",
                          (brief.interests
                            ? `${brief.interests}, ${interest}`
                            : interest
                          ).slice(0, 240),
                        )
                      }
                    >
                      {interest} +
                    </button>
                  ))}
                </div>
                <p className="field-help">
                  A couple of interests is plenty. AI will find the connections.
                </p>
              </>
            )}
            {step === 2 && (
              <>
                <fieldset className="choice-grid">
                  <legend>What's the occasion?</legend>
                  <label
                    className={
                      brief.purpose === "fun"
                        ? "choice selected-choice"
                        : "choice"
                    }
                  >
                    <input
                      type="radio"
                      name="purpose"
                      checked={brief.purpose === "fun"}
                      onChange={() => update("purpose", "fun")}
                    />
                    <strong>Just for fun</strong>
                    <span>A little challenge made around your interests.</span>
                  </label>
                  <label
                    className={
                      brief.purpose === "study"
                        ? "choice selected-choice"
                        : "choice"
                    }
                  >
                    <input
                      type="radio"
                      name="purpose"
                      checked={brief.purpose === "study"}
                      onChange={() => update("purpose", "study")}
                    />
                    <strong>Learn something</strong>
                    <span>
                      Practice vocabulary and relationships in a subject.
                    </span>
                  </label>
                </fieldset>
                <label>
                  {brief.purpose === "study"
                    ? "What are they learning?"
                    : "A theme to weave in (optional)"}
                  <input
                    value={brief.topic}
                    maxLength={120}
                    onChange={(event) => update("topic", event.target.value)}
                    required={brief.purpose === "study"}
                    placeholder={
                      brief.purpose === "study"
                        ? "e.g. Introductory biology: the human body"
                        : "e.g. Our next camping trip"
                    }
                  />
                </label>
                {brief.purpose === "fun" && (
                  <StoryQuestions
                    answers={brief.storyAnswers || []}
                    onChange={(answers) => update("storyAnswers", answers)}
                  />
                )}
                {brief.purpose === "study" && (
                  <label>
                    Study notes <span>(optional, up to 1,200 characters)</span>
                    <textarea
                      value={brief.notes}
                      maxLength={1200}
                      onChange={(event) => update("notes", event.target.value)}
                      rows={5}
                      placeholder="Paste a short vocabulary list or course excerpt to ground the puzzle."
                    />
                    <span className="field-help">
                      Notes go to AI to create the puzzle. They aren't included
                      in the invitation.
                    </span>
                  </label>
                )}
                <label>
                  A personal note <span>(optional)</span>
                  <input
                    value={brief.note}
                    maxLength={180}
                    onChange={(event) => update("note", event.target.value)}
                    placeholder="Made this for your study break. You've got this!"
                  />
                </label>
              </>
            )}
            {step === 3 && (
              <>
                <label>
                  Puzzle difficulty
                  <select
                    value={brief.difficulty}
                    onChange={(event) =>
                      update(
                        "difficulty",
                        event.target.value as CreatorBrief["difficulty"],
                      )
                    }
                  >
                    <option value="easy">
                      Gentle start · clear categories
                    </option>
                    <option value="balanced">
                      A little twist · some overlapping meanings
                    </option>
                    <option value="tricky">
                      Make us think · clever but fair
                    </option>
                  </select>
                </label>
                <label>
                  How familiar is the topic?
                  <select
                    value={brief.familiarity}
                    onChange={(event) =>
                      update(
                        "familiarity",
                        event.target.value as CreatorBrief["familiarity"],
                      )
                    }
                  >
                    <option value="new">
                      New to it · explain unfamiliar ideas
                    </option>
                    <option value="familiar">
                      Know it already · build on what we know
                    </option>
                  </select>
                </label>
                <label>
                  Starting play mode
                  <select
                    value={brief.mode}
                    onChange={(event) =>
                      update("mode", event.target.value as CreatorBrief["mode"])
                    }
                  >
                    <option value="relaxed">
                      Relaxed · unlimited guesses and hints
                    </option>
                    <option value="challenge">
                      Challenge · four mistakes, no hints
                    </option>
                  </select>
                </label>
                <div className="brief-summary">
                  <strong>Your thread</strong>
                  <p>
                    {brief.interests}
                    {brief.topic ? ` · ${brief.topic}` : ""}
                  </p>
                  <p>
                    {brief.style === "together"
                      ? "Answers stay hidden for you both."
                      : "You'll review the connections before sharing."}
                  </p>
                </div>
                <p className="field-help">
                  Generation can take a little while. We'll check the board's
                  structure; review factual study content before sharing.
                </p>
              </>
            )}
            <div className="creator-actions">
              {step > 0 && (
                <button
                  className="secondary-button"
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    setStep(step - 1);
                    setError("");
                  }}
                >
                  Back
                </button>
              )}
              <button
                className="primary-button"
                type="submit"
                disabled={
                  pending || !canContinue || (step === 3 && !canGenerate)
                }
              >
                {pending ? (
                  <>
                    <LoaderCircle size={17} className="loading-icon" /> Finding
                    your threads…
                  </>
                ) : step === 3 ? (
                  <>
                    <Sparkles size={17} /> Make our puzzle
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </div>
            {step === 3 && (
              <button
                className="text-button example-button"
                type="button"
                disabled={pending}
                onClick={useExample}
              >
                Explore the creator with an example puzzle
              </button>
            )}
          </form>
        </>
      )}
      {pending && (
        <output className="creator-status" aria-live="polite">
          AI is weaving your interests into a puzzle. Please keep this page
          open.
        </output>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
