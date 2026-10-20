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
import { ConversationImport } from "./ConversationImport";
import { CopyField } from "./CopyField";
import { CreatorOptions } from "./CreatorOptions";
import { Dictation } from "./Dictation";
import { StoryLibraryControls } from "./StoryLibrary";
import { StoryQuestions } from "./StoryQuestions";
import { generatePuzzle, generationErrorMessage } from "./ai";
import {
  STORY_KEY,
  type StoryProfile,
  newProfile,
  readLibrary,
} from "./library";
import {
  type CreatorBrief,
  type FriendChallenge,
  makeChallenge,
  validatePuzzle,
} from "./schema";
import { challengeLink, encodeChallenge } from "./sharing";

interface CreatorProps {
  onHome: () => void;
  onPlay: (challenge: FriendChallenge) => void;
}

export function Creator({ onHome, onPlay }: CreatorProps) {
  const [library, setLibrary] = useState(readLibrary);
  const currentStory =
    library.profiles.find((profile) => profile.id === library.activeId) ||
    library.profiles[0];
  const brief = currentStory.brief;
  const [saveStatus, setSaveStatus] = useState("Saving on this device…");
  function setBrief(
    update: CreatorBrief | ((current: CreatorBrief) => CreatorBrief),
  ) {
    setLibrary((current) => ({
      ...current,
      profiles: current.profiles.map((profile) =>
        profile.id === current.activeId
          ? {
              ...profile,
              brief:
                typeof update === "function" ? update(profile.brief) : update,
              updatedAt: Date.now(),
            }
          : profile,
      ),
    }));
  }
  useEffect(() => {
    try {
      localStorage.setItem(STORY_KEY, JSON.stringify(library));
      setSaveStatus("Saved automatically on this device.");
    } catch {
      setSaveStatus(
        "Browser saving is unavailable. Download a backup or save to private cloud to keep these answers.",
      );
    }
  }, [library]);
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
  }, [hasDraft, hasShared]);
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
      const puzzle = await generatePuzzle(brief, currentStory);
      setDraft(puzzle);
      setBrief((current) => ({
        ...current,
        usedTerms: [
          ...new Set([
            ...(current.usedTerms || []),
            ...puzzle.groups.flatMap((group) => group.words),
          ]),
        ].slice(-320),
      }));
      setSource("ai");
    } catch (error) {
      setError(generationErrorMessage(error));
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
  const hasStory = Boolean(
    brief.storyAnswers?.some((answer) => answer.trim()) ||
      brief.extraAnswers?.some((item) => item.answer.trim()) ||
      brief.memories?.trim() ||
      brief.freeStory?.trim() ||
      brief.conversation?.trim(),
  );
  const canGenerate =
    (brief.interests.trim().length > 0 ||
      brief.topic.trim().length > 0 ||
      hasStory) &&
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
              : "Make it personal."}
        </h1>
        <p>
          {shared
            ? "Send the link yourself, or copy a challenge code. No account needed to solve it."
            : draft
              ? brief.style === "together"
                ? "The connections are hidden so you can discover them together."
                : "AI does the heavy lifting. You get the final say."
              : "A little about you. Then a puzzle to play."}
        </p>
      </div>
      {!draft && !shared && (
        <p className="field-help" aria-live="polite">
          {saveStatus}
        </p>
      )}
      {!draft && !shared && (
        <StoryLibraryControls
          profiles={library.profiles}
          current={currentStory}
          status={saveStatus}
          onSelect={(id) => {
            setLibrary((current) => ({ ...current, activeId: id }));
            setError("");
          }}
          onNew={() => {
            const profile = newProfile();
            setLibrary((current) => ({
              activeId: profile.id,
              profiles: [...current.profiles, profile].slice(-20),
            }));
            setError("");
          }}
          onRename={(name) =>
            setLibrary((current) => ({
              ...current,
              profiles: current.profiles.map((profile) =>
                profile.id === current.activeId
                  ? { ...profile, name, updatedAt: Date.now() }
                  : profile,
              ),
            }))
          }
          onImport={(profile: StoryProfile) => {
            setLibrary((current) => {
              const local = current.profiles.find(
                (item) => item.id === profile.id,
              );
              return {
                activeId: profile.id,
                profiles: [
                  ...current.profiles.filter((item) => item.id !== profile.id),
                  local && local.updatedAt > profile.updatedAt
                    ? local
                    : profile,
                ].slice(-20),
              };
            });
            setError("");
          }}
        />
      )}
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
            <h2>
              {brief.style === "together"
                ? "Your personal puzzle is ready."
                : draft.title}
            </h2>
            {brief.style === "gift" && <p>{draft.description}</p>}
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
        <form
          className="creator-panel"
          onSubmit={(event) => {
            event.preventDefault();
            if (canGenerate) void generate();
          }}
        >
          {brief.purpose === "fun" ? (
            <>
              <button
                type="button"
                className="text-button"
                onClick={() =>
                  update(
                    "inputMode",
                    brief.inputMode === "free" ? "guided" : "free",
                  )
                }
              >
                {brief.inputMode === "free"
                  ? "Guide me with questions"
                  : "Paste or speak freely"}
              </button>
              {brief.inputMode === "free" ? (
                <>
                  <label>
                    Tell your story
                    <textarea
                      value={brief.freeStory || ""}
                      maxLength={12000}
                      rows={9}
                      onChange={(event) =>
                        update("freeStory", event.target.value)
                      }
                    />
                  </label>
                  <p className="field-help">
                    Paste everything you've already written or just talk. Up to
                    12,000 characters. Your guided answers stay saved and are
                    used too.
                  </p>
                  <Dictation
                    value={brief.freeStory || ""}
                    maxLength={12000}
                    onChange={(value) => update("freeStory", value)}
                  />
                  {brief.conversation && (
                    <details className="creator-options">
                      <summary>Review imported conversation</summary>
                      <label>
                        Saved conversation
                        <textarea
                          rows={8}
                          value={brief.conversation}
                          maxLength={12000}
                          onChange={(event) =>
                            update("conversation", event.target.value)
                          }
                        />
                      </label>
                    </details>
                  )}
                </>
              ) : (
                <StoryQuestions
                  key={currentStory.id}
                  answers={brief.storyAnswers || []}
                  onChange={(answers) => update("storyAnswers", answers)}
                  extraAnswers={brief.extraAnswers || []}
                  onExtraChange={(answers) => update("extraAnswers", answers)}
                />
              )}
              <ConversationImport
                key={`conversation-${currentStory.id}`}
                people={brief.people}
                onAdd={(text, people) => {
                  const conversation = [brief.conversation || "", text]
                    .filter(Boolean)
                    .join("\n\n");
                  if (conversation.length > 12000)
                    throw new Error(
                      "Your existing conversation stays saved. Edit it in Paste or speak freely before adding another excerpt; the combined limit is 12,000 characters.",
                    );
                  setBrief((current) => ({ ...current, conversation, people }));
                }}
              />
            </>
          ) : (
            <>
              <label>
                What are they learning?
                <input
                  value={brief.topic}
                  maxLength={500}
                  onChange={(event) => update("topic", event.target.value)}
                  required
                />
              </label>
              <label>
                Study notes <span>(optional, up to 12,000 characters)</span>
                <textarea
                  value={brief.notes}
                  maxLength={12000}
                  rows={5}
                  onChange={(event) => update("notes", event.target.value)}
                />
              </label>
              <Dictation
                value={brief.notes}
                onChange={(value) => update("notes", value)}
                maxLength={12000}
              />
            </>
          )}
          <CreatorOptions brief={brief} update={update} />
          <p className="field-help">
            {brief.style === "together"
              ? "Answers stay hidden so you can play together."
              : "You'll review the answers before sharing."}{" "}
            {brief.mode === "challenge"
              ? "Four mistakes, no hints."
              : "Relaxed play with hints."}
          </p>
          <button
            className="primary-button"
            type="submit"
            disabled={pending || !canGenerate}
          >
            {pending ? (
              <>
                <LoaderCircle size={17} className="loading-icon" /> Finding your
                threads…
              </>
            ) : (
              <>
                <Sparkles size={17} /> Make our puzzle
              </>
            )}
          </button>
          {!canGenerate && (
            <p className="field-help">
              Add a memory to start, or choose a theme in Puzzle options.
            </p>
          )}
          {!import.meta.env.DEV && (
            <p className="field-help">
              Your private Claude window will open to make the puzzle.
            </p>
          )}
          <details className="creator-example">
            <summary>Try an example instead</summary>
            <button
              className="text-button"
              type="button"
              disabled={pending}
              onClick={useExample}
            >
              Explore the creator with an example puzzle
            </button>
          </details>
        </form>
      )}
      {pending && (
        <output className="creator-status" aria-live="polite">
          {import.meta.env.DEV
            ? "Claude is finding your threads. Please keep this page open."
            : "Finish in the private Claude window: sign in if asked, then press Make my puzzle. Your board will arrive here."}
        </output>
      )}
      {error && (
        <div className="form-error" role="alert">
          <p>{error}</p>
          {!draft && (
            <button
              type="button"
              className="text-button"
              onClick={() => {
                setError("");
              }}
            >
              Edit my answers
            </button>
          )}
        </div>
      )}
    </section>
  );
}
