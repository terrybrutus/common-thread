import { ArrowRight, CircleHelp } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { AccountMenu, useAccount } from "./account/Account";
import { Privacy } from "./account/Privacy";
import { Creator } from "./creator/Creator";
import { FriendHub } from "./creator/FriendHub";
import { Invitation } from "./creator/Invitation";
import { recordPlayedGroups } from "./creator/library";
import type { FriendChallenge } from "./creator/schema";
import { decodeChallenge } from "./creator/sharing";
import { Game } from "./game/Game";
import { dailyPuzzle } from "./game/daily";
import type { Mode } from "./game/engine";
import type { Group } from "./game/puzzles";
import { lessons } from "./game/puzzles";
import { KnowledgePacks } from "./knowledge/KnowledgePacks";

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
  const account = useAccount();
  const [entry] = useState(readInvitation);
  const [personal, setPersonal] = useState<FriendChallenge | null>(
    entry.challenge,
  );
  const [page, setPage] = useState<"home" | "creator" | "invitation" | "packs">(
    entry.challenge ? "invitation" : "home",
  );
  const [linkError, setLinkError] = useState(entry.error);
  const [mode, setMode] = useState<Mode | null>(null);
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [roundDate, setRoundDate] = useState(() => new Date());
  const [lessonIndex, setLessonIndex] = useState(0);
  const [session, setSession] = useState(0);
  const topic = 0;
  const [quickChallenge, setQuickChallenge] = useState(false);
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
    setRoundDate(new Date());
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
        : dailyPuzzle(roundDate, puzzleIndex);

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
        <AccountMenu />
      </header>
      <main>
        {page === "packs" ? (
          <KnowledgePacks onHome={goHome} />
        ) : page === "creator" && account.configured && !account.owner ? (
          <section className="welcome">
            <h1>Your memories. Your puzzle.</h1>
            <p>
              Sign in to save your own stories and open them on another device.
            </p>
            <button
              type="button"
              className="primary-button"
              onClick={account.login}
            >
              Sign in with Google
            </button>
            <button type="button" className="text-button" onClick={goHome}>
              Back to the game
            </button>
          </section>
        ) : page === "creator" ? (
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
            <section className="welcome home-intro">
              <h1 ref={homeTitle} tabIndex={-1} data-ocid="page.title">
                What will you connect?
              </h1>
              <p>Find four groups of four. Follow the connections.</p>
            </section>
            <div className="home-choices">
              <article className="home-choice">
                <span className="eyebrow">JUST PLAY</span>
                <h2>A new puzzle each day</h2>
                <p>
                  A daily mix of subjects and wordplay. A new puzzle arrives at
                  midnight in your time zone.
                </p>
                <label className="challenge-choice">
                  <input
                    type="checkbox"
                    checked={quickChallenge}
                    onChange={(e) => setQuickChallenge(e.target.checked)}
                  />{" "}
                  Four mistakes, no hints
                </label>
                <button
                  className="primary-button"
                  type="button"
                  onClick={() =>
                    start(quickChallenge ? "challenge" : "relaxed")
                  }
                >
                  Play now <ArrowRight size={17} />
                </button>
              </article>
              <article className="home-choice">
                <span className="eyebrow">MAKE IT PERSONAL</span>
                <h2>Your memories. Your puzzle.</h2>
                <p>
                  Turn memories and favorites into a puzzle about yourself,
                  someone you know, or a group.
                </p>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => {
                    setPersonal(null);
                    setMode(null);
                    setPage("creator");
                  }}
                >
                  Create a personal puzzle <ArrowRight size={17} />
                </button>
              </article>
              <article className="home-choice">
                <span className="eyebrow">LEARN THROUGH PLAY</span>
                <h2>Something you’re curious about</h2>
                <p>
                  Choose any subject, or use your notes or a transcript to make
                  a learning puzzle.
                </p>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => {
                    setPersonalStoryId(null);
                    setMode(null);
                    setPage("packs");
                  }}
                >
                  Choose a topic <ArrowRight size={17} />
                </button>
              </article>
            </div>
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
                  {personal.creator
                    ? `by ${personal.creator}`
                    : personalStoryId
                      ? "from your story"
                      : "by a friend"}
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
                  setPage(personalStoryId ? "creator" : "invitation");
                } else if (mode === "intro" && lessonIndex === 0)
                  setLessonIndex(1);
                else if (mode === "intro") {
                  start("relaxed");
                } else setPuzzleIndex((value) => (value + 1) % 30);
              }}
              onRelaxed={() =>
                personal
                  ? playPersonal(personal, "relaxed")
                  : start("relaxed", puzzleIndex)
              }
              personal={personal !== null}
              nextLabel={personalStoryId ? "Back to my story" : undefined}
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
        <span>Created by Terry Brutus</span>
        <Privacy />
      </footer>
    </div>
  );
}
