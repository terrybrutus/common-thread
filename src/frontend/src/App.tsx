import {
  ArrowRight,
  BookOpen,
  Check,
  CircleHelp,
  Sprout,
  Target,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Game } from "./game/Game";
import type { Mode } from "./game/engine";
import { lessons, puzzles } from "./game/puzzles";

export default function App() {
  const [mode, setMode] = useState<Mode | null>(null);
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [lessonIndex, setLessonIndex] = useState(0);
  const [session, setSession] = useState(0);
  const [topic, setTopic] = useState(0);
  const [hasPracticed, setHasPracticed] = useState(false);
  const [returned, setReturned] = useState(false);
  const homeTitle = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (!mode && returned) homeTitle.current?.focus();
  }, [mode, returned]);

  function start(nextMode: Mode, index = topic) {
    setLessonIndex(0);
    setPuzzleIndex(index);
    setSession((value) => value + 1);
    setMode(nextMode);
  }
  function goHome() {
    setMode(null);
    setReturned(true);
  }
  const puzzle = mode === "intro" ? lessons[lessonIndex] : puzzles[puzzleIndex];

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
        {mode === null ? (
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
          <Game
            key={`${mode}-${puzzle.id}-${session}`}
            puzzle={puzzle}
            mode={mode}
            onHome={goHome}
            onRestart={() => setSession((value) => value + 1)}
            onNext={() => {
              if (mode === "intro" && lessonIndex === 0) setLessonIndex(1);
              else if (mode === "intro") {
                setHasPracticed(true);
                start("relaxed");
              } else setPuzzleIndex((value) => (value + 1) % puzzles.length);
            }}
            onRelaxed={() => start("relaxed", puzzleIndex)}
          />
        )}
      </main>
      <footer className="site-footer">
        <span>Common Thread</span>
        <span>Stay curious. Keep connecting.</span>
      </footer>
    </div>
  );
}
