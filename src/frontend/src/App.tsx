import {
  ArrowRight,
  BookOpen,
  Check,
  CircleHelp,
  Sprout,
  Target,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Creator } from "./creator/Creator";
import { FriendHub } from "./creator/FriendHub";
import { Invitation } from "./creator/Invitation";
import type { FriendChallenge } from "./creator/schema";
import { decodeChallenge } from "./creator/sharing";
import { Game } from "./game/Game";
import type { Mode } from "./game/engine";
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
  const [hasPracticed, setHasPracticed] = useState(false);
  const [returned, setReturned] = useState(false);
  const homeTitle = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (!mode && page === "home" && returned) homeTitle.current?.focus();
  }, [mode, returned, page]);
  useEffect(() => {
    function openHash() {
      const incoming = readInvitation();
      setLinkError(incoming.error);
      if (incoming.challenge) {
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
    setPersonal(null);
    setPage("home");
    setLessonIndex(0);
    setPuzzleIndex(index);
    setSession((value) => value + 1);
    setMode(nextMode);
  }
  function goHome() {
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
          <Creator onHome={goHome} onPlay={playPersonal} />
        ) : page === "invitation" && personal ? (
          <Invitation
            challenge={personal}
            onHome={goHome}
            onPlay={(selectedMode) => playPersonal(personal, selectedMode)}
          />
        ) : mode === null ? (
          <>
            <section className="welcome">
              <span className="eyebrow">
                <span className="tiny-dot" /> WORDS. IDEAS. LITTLE DISCOVERIES.
              </span>
              <h1 ref={homeTitle} tabIndex={-1} data-ocid="page.title">
                Find the <em>common thread.</em>
              </h1>
              <p>
                Some things just belong together. Discover their connections,
                follow your curiosity, and learn a little along the way.
              </p>
              <button
                className="text-button"
                type="button"
                onClick={() => {
                  setPersonal(null);
                  setMode(null);
                  setPage("creator");
                }}
              >
                Make something for a friend
                <ArrowRight size={15} />
              </button>
            </section>
            <section className="intro-banner" aria-labelledby="intro-title">
              <span className="banner-icon">
                <Sprout size={27} />
              </span>
              <div>
                <span className="eyebrow">A SMALL START</span>
                <h2 id="intro-title">
                  {hasPracticed
                    ? "A fresh look, whenever you need it."
                    : "New here? Let's find your first thread."}
                </h2>
                <p>
                  Two tiny practice puzzles. Helpful nudges. All the time you
                  need.
                </p>
              </div>
              <button
                className="primary-button"
                type="button"
                onClick={() => start("intro")}
              >
                {hasPracticed ? "Practice again" : "Show me how"}
                <ArrowRight size={17} />
              </button>
            </section>
            <section className="play-section" aria-labelledby="play-title">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">MAKE A LITTLE ROOM FOR PLAY</span>
                  <h2 id="play-title">What's your pace?</h2>
                </div>
                <span className="section-note">
                  Solo play · No sign-in needed
                </span>
              </div>
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
              <div className="mode-grid">
                <article className="mode-card relaxed-card">
                  <div className="mode-top">
                    <span className="mode-icon">
                      <Sprout size={25} />
                    </span>
                    <span className="pill">ROOM TO EXPLORE</span>
                  </div>
                  <h3>Relaxed</h3>
                  <p>
                    Follow a hunch. Change your mind. Find the connections at
                    your own pace.
                  </p>
                  <ul>
                    <li>
                      <Check size={15} /> Unlimited guesses
                    </li>
                    <li>
                      <Check size={15} /> Hints when you want them
                    </li>
                    <li>
                      <Check size={15} /> No clock to race
                    </li>
                  </ul>
                  <button
                    className="primary-button"
                    type="button"
                    onClick={() => start("relaxed")}
                  >
                    Play Relaxed
                    <ArrowRight size={17} />
                  </button>
                </article>
                <article className="mode-card challenge-card">
                  <div className="mode-top">
                    <span className="mode-icon">
                      <Target size={25} />
                    </span>
                    <span className="pill">A LITTLE MORE FOCUS</span>
                  </div>
                  <h3>Challenge</h3>
                  <p>
                    Trust your instincts and make each guess count. How many
                    threads can you find?
                  </p>
                  <ul>
                    <li>
                      <Check size={15} /> Four mistakes allowed
                    </li>
                    <li>
                      <Check size={15} /> Solve without hints
                    </li>
                    <li>
                      <Check size={15} /> Take your time—no timer
                    </li>
                  </ul>
                  <button
                    className="primary-button dark-button"
                    type="button"
                    onClick={() => start("challenge")}
                  >
                    Play Challenge
                    <ArrowRight size={17} />
                  </button>
                </article>
              </div>
            </section>
            {linkError && (
              <p className="form-error" role="alert">
                {linkError}
              </p>
            )}
            <FriendHub
              onCreate={() => {
                setPersonal(null);
                setMode(null);
                setPage("creator");
              }}
              onOpen={openChallenge}
            />
            <aside className="home-note">
              <BookOpen size={19} />
              <p>
                <strong>
                  Know the topic? New to puzzles? Both are welcome.
                </strong>
                <br />
                Start with familiar words or explore biology. Every solved group
                comes with a little explanation.
              </p>
            </aside>
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
                  setHasPracticed(true);
                  start("relaxed");
                } else setPuzzleIndex((value) => (value + 1) % puzzles.length);
              }}
              onRelaxed={() =>
                personal
                  ? playPersonal(personal, "relaxed")
                  : start("relaxed", puzzleIndex)
              }
              personal={personal !== null}
            />
          </>
        )}
      </main>
      <footer className="site-footer">
        <span>Common Thread</span>
        <span>Stay curious. Keep connecting.</span>
      </footer>
    </div>
  );
}
