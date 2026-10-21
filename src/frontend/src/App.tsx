import { ArrowRight, CircleHelp } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Creator } from "./creator/Creator";
import { FriendHub } from "./creator/FriendHub";
import { Invitation } from "./creator/Invitation";
import { connectStoryCloud } from "./creator/hosted";
import { recordPlayedGroups } from "./creator/library";
import type { FriendChallenge } from "./creator/schema";
import { decodeChallenge } from "./creator/sharing";
import { Game } from "./game/Game";
import type { Mode } from "./game/engine";
import type { Group } from "./game/puzzles";
import { lessons, puzzles } from "./game/puzzles";

function readInvitation() {
  if (!window.location.hash.startsWith("#thread="))
    return { challenge: null, error: "" };
  try {
    return { challenge: decodeChallenge(window.location.hash), error: "" };
  } catch {
    return {
      challenge: null,
      error:
        "That challenge link couldn't be opened. Ask your friend for a fresh copy, or paste a challenge code below.",
    };
  }
}

export default function App() {
  const [entry] = useState(readInvitation);
  const [personal, setPersonal] = useState<FriendChallenge | null>(
    entry.challenge,
  );
  const [page, setPage] = useState<"home" | "creator" | "invitation">(
    entry.challenge ? "invitation" : "home",
  );
  const [linkError, setLinkError] = useState(entry.error);
  const [mode, setMode] = useState<Mode | null>(null);
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [lessonIndex, setLessonIndex] = useState(0);
  const [session, setSession] = useState(0);
  const [topic, setTopic] = useState(0);
  const [returned, setReturned] = useState(false);
  const [personalStoryId, setPersonalStoryId] = useState<string | null>(null);
  const rememberSeen = useCallback(
    (groups: Group[]) => {
      if (personalStoryId) recordPlayedGroups(personalStoryId, groups);
    },
    [personalStoryId],
  );
  const homeTitle = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (!mode && page === "home" && returned) homeTitle.current?.focus();
  }, [mode, returned, page]);
  useEffect(() => {
    function openHash() {
      const incoming = readInvitation();
      setLinkError(incoming.error);
      if (incoming.challenge) {
        setPersonalStoryId(null);
        setPersonal(incoming.challenge);
        setMode(null);
        setPage("invitation");
      } else if (incoming.error) {
        setPersonal(null);
        setMode(null);
        setPage("home");
        setReturned(true);
      }
    }
    window.addEventListener("hashchange", openHash);
    return () => window.removeEventListener("hashchange", openHash);
  }, []);

  function start(nextMode: Mode, index = topic) {
    setPersonalStoryId(null);
    setPersonal(null);
    setPage("home");
    setLessonIndex(0);
    setPuzzleIndex(index);
    setSession((value) => value + 1);
    setMode(nextMode);
  }
  function goHome() {
    setPersonalStoryId(null);
    setMode(null);
    setPage("home");
    setPersonal(null);
    setLinkError("");
    if (window.location.hash.startsWith("#thread="))
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
    setReturned(true);
  }
  function playPersonal(
    challenge: FriendChallenge,
    selectedMode = challenge.mode,
  ) {
    setPersonal(challenge);
    setMode(selectedMode);
    setPage("home");
    setSession((value) => value + 1);
  }
  function openChallenge(challenge: FriendChallenge) {
    setPersonalStoryId(null);
    setPersonal(challenge);
    setMode(null);
    setPage("invitation");
    setLinkError("");
  }
  const puzzle =
    personal && mode !== "intro"
      ? personal.puzzle
      : mode === "intro"
        ? lessons[lessonIndex]
        : puzzles[puzzleIndex];

  return (
    <div className="app-shell" data-ocid="page">
      <header className="site-header">
        <button
          className="brand"
          type="button"
          onClick={goHome}
          aria-label="Common Thread home"
        >
          <span className="thread-mark" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span>Common Thread</span>
        </button>
        <span className="header-note">A little curiosity goes a long way.</span>
        <button
          className="text-button"
          type="button"
          onClick={() => start("intro")}
        >
          <CircleHelp size={16} /> How to play
        </button>
      </header>
      <main>
        {page === "creator" ? (
          <Creator
            onHome={goHome}
            onPlay={(challenge, storyId) => {
              setPersonalStoryId(storyId || null);
              playPersonal(challenge);
            }}
          />
        ) : page === "invitation" && personal ? (
          <Invitation
            challenge={personal}
            onHome={goHome}
            onPlay={(selectedMode) => playPersonal(personal, selectedMode)}
          />
        ) : mode === null ? (
          <>
            <section className="welcome quick-start">
              <span className="eyebrow">FIND FOUR GROUPS OF FOUR</span>
              <h1 ref={homeTitle} tabIndex={-1} data-ocid="page.title">
                Find the <em>common thread.</em>
              </h1>
              <p>Sixteen words. Four connections. Ready to play?</p>
              <div className="quick-start-actions">
                <button
                  className="primary-button"
                  type="button"
                  onClick={() => start("relaxed")}
                >
                  Play now <ArrowRight size={17} />
                </button>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => {
                    setPersonal(null);
                    setMode(null);
                    setPage("creator");
                  }}
                >
                  Create a personal puzzle
                </button>
              </div>
              <p className="field-help">
                Play now starts a relaxed puzzle. Personal puzzles use your
                shared memories.
              </p>
            </section>
            <details className="play-options">
              <summary>Choose a puzzle or challenge mode</summary>
              <label className="topic-picker">
                Choose a puzzle
                <select
                  value={topic}
                  onChange={(event) => setTopic(Number(event.target.value))}
                >
                  {puzzles.map((entry, index) => (
                    <option key={entry.id} value={index}>
                      {entry.topic} · {entry.title}
                    </option>
                  ))}
                </select>
              </label>
              <div className="creator-actions">
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => start("relaxed")}
                >
                  Play Relaxed
                </button>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => start("challenge")}
                >
                  Play Challenge
                </button>
              </div>
              <p className="field-help">
                Relaxed has hints. Challenge gives you four mistakes.
              </p>
            </details>
            {linkError && (
              <p className="form-error" role="alert">
                {linkError}
              </p>
            )}
            <FriendHub onOpen={openChallenge} />
          </>
        ) : (
          <>
            <div className="personal-round-note">
              {personal && (
                <p>
                  Made{" "}
                  {personal.recipient ? `for ${personal.recipient}` : "for you"}{" "}
                  by {personal.creator || "a friend"}
                  {personal.source === "example" ? " · Example puzzle" : ""}
                  {personal.note && <span>{personal.note}</span>}
                </p>
              )}
            </div>
            <Game
              key={`${mode}-${puzzle.id}-${session}`}
              puzzle={puzzle}
              mode={mode}
              onHome={goHome}
              onRestart={() => setSession((value) => value + 1)}
              onNext={() => {
                if (personal) {
                  setMode(null);
                  setPage("invitation");
                } else if (mode === "intro" && lessonIndex === 0)
                  setLessonIndex(1);
                else if (mode === "intro") {
                  start("relaxed");
                } else setPuzzleIndex((value) => (value + 1) % puzzles.length);
              }}
              onRelaxed={() =>
                personal
                  ? playPersonal(personal, "relaxed")
                  : start("relaxed", puzzleIndex)
              }
              personal={personal !== null}
              onConnectionsSeen={
                personalStoryId && personal?.source !== "example"
                  ? rememberSeen
                  : undefined
              }
            />
          </>
        )}
      </main>
      <footer className="site-footer">
        <span>Common Thread</span>
        <span>Created by Terry Brutus</span>
      </footer>
    </div>
  );
}
