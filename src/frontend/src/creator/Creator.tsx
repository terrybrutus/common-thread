import {
  ArrowLeft,
  ArrowRight,
  Check,
  HeartHandshake,
  LoaderCircle,
  Sparkles,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAccount } from "../account/Account";
import { type Group, type Puzzle, puzzles } from "../game/puzzles";
import { CopyField } from "./CopyField";
import { CreatorOptions } from "./CreatorOptions";
import { Dictation } from "./Dictation";
import { FreshnessQuestion } from "./FreshnessQuestion";
import { StoryLibraryControls } from "./StoryLibrary";
import { StoryQuestions } from "./StoryQuestions";
import { generatePuzzle, generationErrorMessage } from "./ai";
import { StoryQuestionError } from "./followUp";
import {
  addFreshMemory,
  familiarCount,
  nextFreshQuestion,
  storyKey,
} from "./history";
import {
  type StoryProfile,
  newProfile,
  readLibrary,
  storyStorageKey,
} from "./library";
import {
  type CreatorBrief,
  type FriendChallenge,
  makeChallenge,
  validatePuzzle,
} from "./schema";
import { challengeLink, encodeChallenge } from "./sharing";
import { mergeProfile } from "./sync";
import { useStorySync } from "./useStorySync";

interface CreatorProps {
  onHome: () => void;
  onPlay: (challenge: FriendChallenge, storyId?: string) => void;
}

export function Creator({ onHome, onPlay }: CreatorProps) {
  const [library, setLibrary] = useState(readLibrary);
  const account = useAccount();
  const sync = useStorySync(library, setLibrary, Boolean(account.owner));
  const currentStory =
    library.profiles.find((profile) => profile.id === library.activeId) ||
    library.profiles[0];
  const brief = currentStory.brief;
  const activeStory = useRef(currentStory.id);
  activeStory.current = currentStory.id;
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
              updatedAt: Math.max(Date.now(), profile.updatedAt + 1),
            }
          : profile,
      ),
    }));
  }
  useEffect(() => {
    try {
      localStorage.setItem(storyStorageKey(), JSON.stringify(library));
      setSaveStatus("Saved automatically on this device.");
    } catch {
      setSaveStatus(
        "Browser saving is unavailable. Download a story backup to keep these answers.",
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
  const generateButton = useRef<HTMLButtonElement>(null);
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
  async function generateWith(
    requestBrief: CreatorBrief,
    story: StoryProfile,
    offerQuestion = true,
  ) {
    if (pendingRef.current) return;
    pendingRef.current = true;
    setPending(true);
    setError("");
    try {
      const puzzle = await generatePuzzle(requestBrief, {
        ...story,
        brief: requestBrief,
      });
      const allFamiliar =
        requestBrief.purpose === "fun" &&
        familiarCount(puzzle, requestBrief.playedConnections) ===
          puzzle.groups.length;
      const forStory = storyKey(requestBrief);
      setLibrary((current) => ({
        ...current,
        profiles: current.profiles.map((profile) =>
          profile.id !== story.id
            ? profile
            : {
                ...profile,
                updatedAt: Math.max(Date.now(), profile.updatedAt + 1),
                brief: {
                  ...profile.brief,
                  usedTerms: [
                    ...new Set([
                      ...(profile.brief.usedTerms || []),
                      ...puzzle.groups.flatMap((group) => group.words),
                    ]),
                  ].slice(-320),
                  freshnessPrompt:
                    allFamiliar && offerQuestion
                      ? profile.brief.freshnessPrompt?.forStory === forStory
                        ? profile.brief.freshnessPrompt
                        : {
                            question:
                              puzzle.followUpQuestion ||
                              nextFreshQuestion(requestBrief),
                            forStory,
                            dismissed: false,
                            answer: "",
                          }
                      : profile.brief.freshnessPrompt?.forStory === forStory &&
                          profile.brief.freshnessPrompt.dismissed
                        ? profile.brief.freshnessPrompt
                        : undefined,
                },
              },
        ),
      }));
      if (activeStory.current === story.id) {
        setDraft(puzzle);
        setSource("ai");
      }
    } catch (error) {
      if (
        error instanceof StoryQuestionError &&
        requestBrief.purpose === "fun"
      ) {
        const forStory = storyKey(requestBrief);
        const question = error.question || nextFreshQuestion(requestBrief);
        setLibrary((current) => ({
          ...current,
          profiles: current.profiles.map((profile) =>
            profile.id !== story.id
              ? profile
              : {
                  ...profile,
                  updatedAt: Math.max(Date.now(), profile.updatedAt + 1),
                  brief: {
                    ...profile.brief,
                    freshnessPrompt: {
                      question,
                      forStory,
                      dismissed: false,
                      answer:
                        profile.brief.freshnessPrompt?.forStory === forStory &&
                        profile.brief.freshnessPrompt.question === question
                          ? profile.brief.freshnessPrompt.answer
                          : "",
                    },
                  },
                },
          ),
        }));
      } else if (activeStory.current === story.id)
        setError(generationErrorMessage(error));
    } finally {
      pendingRef.current = false;
      setPending(false);
    }
  }
  function generate() {
    return generateWith(brief, currentStory);
  }
  const freshnessPrompt =
    brief.purpose === "fun" &&
    brief.freshnessPrompt?.forStory === storyKey(brief) &&
    !brief.freshnessPrompt.dismissed
      ? brief.freshnessPrompt
      : undefined;
  function saveFreshMemory() {
    if (!freshnessPrompt || pendingRef.current) return;
    try {
      const next = addFreshMemory(
        brief,
        freshnessPrompt.question,
        freshnessPrompt.answer,
      );
      setBrief(next);
      void generateWith(
        next,
        {
          ...currentStory,
          brief: next,
          updatedAt: Math.max(Date.now(), currentStory.updatedAt + 1),
        },
        false,
      );
    } catch (error) {
      setError(generationErrorMessage(error));
    }
  }
  const freshQuestion = freshnessPrompt && (
    <FreshnessQuestion
      prompt={freshnessPrompt}
      pending={pending}
      error={error}
      returnFocus={generateButton}
      onAnswer={(answer) => {
        setError("");
        update("freshnessPrompt", { ...freshnessPrompt, answer });
      }}
      onSave={saveFreshMemory}
      onSkip={() => {
        setError("");
        update("freshnessPrompt", { ...freshnessPrompt, dismissed: true });
      }}
    />
  );
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
            i === index
              ? group.words.join("|") !== next.words.join("|")
                ? { ...next, rule: "literal", sourceWords: undefined }
                : next
              : group,
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
  function playDraft() {
    setError("");
    try {
      if (draft)
        onPlay(
          makeChallenge(brief, draft, source),
          source !== "example" && brief.purpose === "fun"
            ? currentStory.id
            : undefined,
        );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Check this puzzle before playing.",
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
        <ArrowLeft size={16} /> Home
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
                ? "The answers are hidden so you can play without spoilers."
                : "AI does the heavy lifting. You get the final say."
              : "Make a puzzle from memories and favorites. Play it yourself or share it."}
        </p>
      </div>
      {!draft && !shared && (
        <p className="field-help" aria-live="polite">
          {account.owner
            ? sync.message || saveStatus
            : `${saveStatus} Sign in with Google in the published game to save across devices.`}
          {account.owner && !sync.connected && (
            <button
              className="text-button"
              type="button"
              onClick={sync.connect}
            >
              Retry account sync
            </button>
          )}
        </p>
      )}
      {!draft && !shared && (
        <StoryLibraryControls
          profiles={library.profiles}
          current={currentStory}
          status={sync.message || saveStatus}
          connected={sync.connected}
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
                  ? {
                      ...profile,
                      name,
                      updatedAt: Math.max(Date.now(), profile.updatedAt + 1),
                    }
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
                  local ? mergeProfile(local, profile) : profile,
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
              onClick={() =>
                onPlay(
                  shared,
                  brief.purpose === "fun" && shared.source !== "example"
                    ? currentStory.id
                    : undefined,
                )
              }
            >
              {shared.style === "together" ? "Play now" : "Test the puzzle"}
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
            {source !== "example" &&
              familiarCount(draft, brief.playedConnections) >= 3 && (
                <p className="field-help">
                  A familiar remix · some connections revisit your earlier
                  games.
                </p>
              )}
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
                  Play on your own, gather around one screen, or share a link.
                  Separate screens keep their own progress.
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
                onClick={playDraft}
                disabled={pending}
              >
                Play now
                <ArrowRight size={16} />
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={finish}
                disabled={pending}
              >
                Share puzzle
              </button>
              <button
                className="secondary-button"
                type="button"
                onClick={generate}
                ref={generateButton}
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
              <fieldset className="story-scope">
                <legend>What would you like this puzzle to be about?</legend>
                <div className="story-scope-choices">
                  {(
                    [
                      ["self", "My life"],
                      ["someone", "Someone I know"],
                      ["group", "A group"],
                    ] as const
                  ).map(([value, label]) => (
                    <label key={value}>
                      <input
                        type="radio"
                        name="story-scope"
                        value={value}
                        checked={(brief.storyScope || "someone") === value}
                        onChange={() => update("storyScope", value)}
                      />
                      {label}
                    </label>
                  ))}
                </div>
                <p className="field-help">
                  {brief.storyScope === "self"
                    ? "Your memories, people, places, and favorites."
                    : brief.storyScope === "group"
                      ? "Family, friends, a team, or any group. Mention who's involved in your answers."
                      : "A friend, relative, partner, or anyone you know. Mention who they are in your answers."}
                </p>
              </fieldset>
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
                  scope={brief.storyScope}
                  answers={brief.storyAnswers || []}
                  onChange={(answers) => update("storyAnswers", answers)}
                  extraAnswers={brief.extraAnswers || []}
                  onExtraChange={(answers) => update("extraAnswers", answers)}
                />
              )}
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
              ? "Answers stay hidden so you can play."
              : "You'll review the answers before playing or sharing."}{" "}
            {brief.mode === "challenge"
              ? "Four mistakes, no hints."
              : "Hints available, with no guess limit."}
          </p>
          <button
            className="primary-button"
            type="submit"
            ref={generateButton}
            disabled={pending || !canGenerate}
          >
            {pending ? (
              <>
                <LoaderCircle size={17} className="loading-icon" /> Finding your
                threads…
              </>
            ) : (
              <>
                <Sparkles size={17} /> Make my puzzle
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
              Your puzzle will arrive here automatically.
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
            : "Making your puzzle and checking its connections. You can stay here."}
        </output>
      )}
      {error && !freshnessPrompt && (
        <div className="form-error" role="alert">
          <p>{error}</p>
        </div>
      )}
      {!shared && (!draft || source !== "example") && freshQuestion}
    </section>
  );
}
