import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  knowledgeBoard,
  knowledgePacks,
  packById,
} from "../../../../services/claude/shared/knowledge.js";
import { Game } from "../game/Game";
import type { Group, Puzzle } from "../game/puzzles";
import {
  generateLearning,
  loadLearningDraft,
  rememberLearning,
  saveLearningDraft,
} from "./learning";

type History = { groups: string[]; boards: string[][] };
const emptyHistory = (): History => ({ groups: [], boards: [] });
export function readPackHistory(id: string): History {
  try {
    const data = JSON.parse(
      localStorage.getItem(`common-thread-pack-${id}`) || "{}",
    );
    const ids = new Set(packById(id).groups.map((g) => g.id));
    return {
      groups: Array.isArray(data.groups)
        ? data.groups
            .filter((v: unknown) => typeof v === "string" && ids.has(v))
            .slice(-40)
        : [],
      boards: Array.isArray(data.boards)
        ? data.boards
            .filter(
              (v: unknown) =>
                Array.isArray(v) &&
                v.length === 4 &&
                v.every((item) => ids.has(item)),
            )
            .slice(-40)
        : [],
    };
  } catch {
    return emptyHistory();
  }
}
export function KnowledgePacks({ onHome }: { onHome: () => void }) {
  const [input, setInput] = useState(loadLearningDraft);
  const [mode, setMode] = useState<"relaxed" | "challenge">("relaxed");
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [readyId, setReadyId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [session, setSession] = useState(0);
  const [discovered, setDiscovered] = useState(false);
  const active = useRef(true);
  const inFlight = useRef(false);
  const title = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  useEffect(() => {
    if (!puzzle) title.current?.focus();
  }, [puzzle]);
  useEffect(() => {
    saveLearningDraft(input);
  }, [input]);
  function play(next: Puzzle, id: string | null) {
    setReadyId(id);
    setPuzzle(next);
    setDiscovered(false);
    setSession((s) => s + 1);
    setError("");
  }
  function remember(groups: Group[]) {
    setDiscovered(true);
    if (!readyId) {
      rememberLearning(input, groups);
      return;
    }
    const h = readPackHistory(readyId);
    h.groups = [
      ...new Set([...h.groups, ...groups.map((g) => g.id.split(":")[1])]),
    ].slice(-40);
    const board = puzzle?.groups.map((g) => g.id.split(":")[1]).sort();
    if (
      board &&
      !h.boards.some((b) => b.slice().sort().join("|") === board.join("|"))
    )
      h.boards.push(board);
    try {
      localStorage.setItem(
        `common-thread-pack-${readyId}`,
        JSON.stringify({ ...h, boards: h.boards.slice(-40) }),
      );
    } catch {
      /* Play doesn't require browser storage. */
    }
  }
  async function makePuzzle(event: React.FormEvent) {
    event.preventDefault();
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError("");
    try {
      const next = await generateLearning(input);
      if (active.current) play(next, null);
    } catch (e) {
      if (active.current)
        setError(
          e instanceof Error
            ? e.message
            : "Could not make this puzzle. Your text is kept.",
        );
    } finally {
      inFlight.current = false;
      if (active.current) setBusy(false);
    }
  }
  const displayName = (id: string, name: string) =>
    id === "presidents" ? "Presidents & government" : name;
  if (puzzle)
    return (
      <>
        <p className="pack-round-note">
          {readyId
            ? "Ready to play"
            : input.kind === "material"
              ? "Made from your material"
              : "Made for your topic"}
        </p>
        <Game
          key={`${puzzle.id}-${session}`}
          puzzle={puzzle}
          mode={mode}
          onHome={() => setPuzzle(null)}
          onRestart={() => setSession((s) => s + 1)}
          onNext={() => setPuzzle(null)}
          onRelaxed={() => {
            setMode("relaxed");
            setSession((s) => s + 1);
          }}
          onConnectionsSeen={remember}
          nextLabel="Choose another topic"
          homeLabel="Change topic"
        />
        {readyId && discovered && (
          <details className="reading-links">
            <summary>Read more about this subject</summary>
            <ul>
              {packById(readyId).sources.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noreferrer">
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </details>
        )}
      </>
    );
  return (
    <section className="learning-page" aria-labelledby="packs-title">
      <button className="text-button" type="button" onClick={onHome}>
        <ArrowLeft size={16} /> Home
      </button>
      <h1 id="packs-title" ref={title} tabIndex={-1}>
        What do you want to learn?
      </h1>
      <p>Turn a subject, your notes, or a transcript into a puzzle.</p>
      <form className="learning-form" onSubmit={makePuzzle}>
        <fieldset className="learning-input-choice" disabled={busy}>
          <legend>Start with</legend>
          <label>
            <input
              type="radio"
              name="learning-input"
              checked={input.kind === "topic"}
              onChange={() => {
                setInput((v) => ({ ...v, kind: "topic" }));
                setError("");
              }}
            />{" "}
            A subject
          </label>
          <label>
            <input
              type="radio"
              name="learning-input"
              checked={input.kind === "material"}
              onChange={() => {
                setInput((v) => ({ ...v, kind: "material" }));
                setError("");
              }}
            />{" "}
            My notes or a transcript
          </label>
        </fieldset>
        <label htmlFor="learning-topic">
          {input.kind === "topic"
            ? "Your subject"
            : "Focus on a subject (optional)"}
        </label>
        <input
          id="learning-topic"
          value={input.topic}
          onChange={(e) => setInput((v) => ({ ...v, topic: e.target.value }))}
          maxLength={500}
          required={input.kind === "topic"}
          disabled={busy}
          aria-describedby="topic-examples"
        />
        <p id="topic-examples" className="field-help">
          For example: oceans, the New York Knicks, Shakespeare, or the 1970s.
        </p>
        {input.kind === "material" && (
          <>
            <label htmlFor="learning-material">
              Paste your notes or transcript
            </label>
            <textarea
              id="learning-material"
              rows={9}
              value={input.material}
              onChange={(e) =>
                setInput((v) => ({ ...v, material: e.target.value }))
              }
              minLength={80}
              required
              disabled={busy}
              aria-describedby="material-help"
            />
            <p id="material-help" className="field-help">
              The puzzle will use what you paste.{" "}
              {input.material.length.toLocaleString()} / 100,000 characters.
            </p>
            {input.material.length > 100000 && (
              <p className="form-error" role="alert">
                This text is longer than one puzzle can use. Choose a section
                under 100,000 characters; your full draft is kept here.
              </p>
            )}
          </>
        )}
        <label className="challenge-choice">
          <input
            type="checkbox"
            checked={mode === "challenge"}
            onChange={(e) =>
              setMode(e.target.checked ? "challenge" : "relaxed")
            }
            disabled={busy}
          />{" "}
          Limit me to four mistakes, with no hints
        </label>
        <p className="field-help">
          Leave this off to play with hints and no guess limit.
        </p>
        <button
          className="primary-button"
          type="submit"
          disabled={
            busy ||
            (input.kind === "topic"
              ? !input.topic.trim()
              : input.material.trim().length < 80 ||
                input.material.length > 100000)
          }
        >
          <Sparkles size={16} />
          {busy ? "Making your puzzle…" : "Make my puzzle"}
        </button>
        <output className="generation-status">
          {busy
            ? input.kind === "material"
              ? "Reading your material and checking a puzzle. This may take a couple of minutes."
              : "Finding connections and checking the answers. This can take a minute."
            : ""}
        </output>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
      </form>
      <details className="ready-puzzles">
        <summary>Or play a ready-made puzzle</summary>
        <div className="pack-grid" aria-label="Ready-made subjects">
          {knowledgePacks.map((p) => (
            <button
              className="pack-card"
              type="button"
              key={p.id}
              disabled={busy}
              onClick={() => play(knowledgeBoard(p.id), p.id)}
            >
              <strong>{displayName(p.id, p.name)}</strong>
              <span>{p.summary}</span>
              <span className="ready-cta">
                Play <ArrowRight size={15} />
              </span>
            </button>
          ))}
        </div>
      </details>
    </section>
  );
}
