import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  knowledgeBoard,
  knowledgePacks,
  packById,
} from "../../../../services/claude/shared/knowledge.js";
import { hostedGeneration } from "../creator/hosted";
import { Game } from "../game/Game";
import type { Group, Puzzle } from "../game/puzzles";

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
export async function generateKnowledgeBoard(
  id: string,
  difficulty: string,
  interest: string,
) {
  const history = readPackHistory(id);
  const brief = {
    purpose: "study",
    topic: packById(id).name,
    notes: "",
    interests: interest,
    familiarity: "new",
    difficulty,
    knowledgePack: id,
    knowledgeHistory: history.groups,
    knowledgeBoards: history.boards,
  };
  let text: string;
  if (import.meta.env.DEV) {
    const response = await fetch("/__local-ai/puzzle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(brief),
    });
    const data = await response.json();
    if (!response.ok)
      throw new Error(
        data.error ||
          "This knowledge board could not be made. Please try again.",
      );
    text = data.text;
  } else text = await hostedGeneration(brief);
  const data = JSON.parse(text);
  if (!Array.isArray(data.groups))
    throw new Error("The knowledge board was incomplete. Please try again.");
  return knowledgeBoard(
    id,
    data.groups.map((g: { id: string }) => {
      if (typeof g.id !== "string" || !g.id.startsWith(`${id}:`))
        throw new Error("This board did not match your pack.");
      return g.id.slice(id.length + 1);
    }),
  );
}

export function KnowledgePacks({ onHome }: { onHome: () => void }) {
  const [id, setId] = useState("world");
  const [mode, setMode] = useState<"relaxed" | "challenge">("relaxed");
  const [difficulty, setDifficulty] = useState("balanced");
  const [interest, setInterest] = useState("");
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [source, setSource] = useState<"starter" | "ai">("starter");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [familiar, setFamiliar] = useState(false);
  const [session, setSession] = useState(0);
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
  const pack = packById(id);
  function play(next: Puzzle, origin: "starter" | "ai") {
    const history = readPackHistory(id);
    setFamiliar(
      next.groups.filter((g) => history.groups.includes(g.id.split(":")[1]))
        .length >= 3,
    );
    setSource(origin);
    setPuzzle(next);
    setSession((s) => s + 1);
    setError("");
  }
  function remember(groups: Group[]) {
    const history = readPackHistory(id);
    history.groups = [
      ...new Set([...history.groups, ...groups.map((g) => g.id.split(":")[1])]),
    ].slice(-40);
    const board = puzzle?.groups.map((g) => g.id.split(":")[1]).sort();
    if (
      board &&
      !history.boards.some(
        (b) => b.slice().sort().join("|") === board.join("|"),
      )
    )
      history.boards.push(board);
    try {
      localStorage.setItem(
        `common-thread-pack-${id}`,
        JSON.stringify({ ...history, boards: history.boards.slice(-40) }),
      );
    } catch {
      /* Play remains available if browser storage is unavailable. */
    }
  }
  async function remix() {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError("");
    try {
      const next = await generateKnowledgeBoard(
        id,
        difficulty,
        interest.trim(),
      );
      if (active.current) play(next, "ai");
    } catch (e) {
      if (active.current)
        setError(
          e instanceof Error
            ? e.message
            : "Could not connect. Try again when ready.",
        );
    } finally {
      inFlight.current = false;
      if (active.current) setBusy(false);
    }
  }
  if (puzzle)
    return (
      <>
        <p className="pack-round-note">
          {source === "ai"
            ? "AI remix · reviewed pack facts"
            : "Starter board · no AI needed"}
          {familiar ? " · Familiar connections, remixed" : ""}
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
          nextLabel="Explore this pack"
        />
      </>
    );
  return (
    <section className="knowledge-packs" aria-labelledby="packs-title">
      <button className="text-button" type="button" onClick={onHome}>
        <ArrowLeft size={16} /> All modes
      </button>
      <span className="eyebrow">FOLLOW YOUR CURIOSITY</span>
      <h1 id="packs-title" ref={title} tabIndex={-1}>
        Find a thread. Learn something.
      </h1>
      <p>
        Pick a pack and play. Discover facts, missing words, and unexpected
        connections.
      </p>
      <fieldset className="pack-grid" aria-label="Knowledge packs">
        {knowledgePacks.map((p) => (
          <button
            type="button"
            className={`pack-card ${id === p.id ? "selected" : ""}`}
            aria-pressed={id === p.id}
            key={p.id}
            disabled={busy}
            onClick={() => {
              setId(p.id);
              setInterest("");
              setError("");
            }}
          >
            <strong>{p.name}</strong>
            <span>{p.summary}</span>
          </button>
        ))}
      </fieldset>
      <section className="pack-launch" aria-label={`${pack.name} play options`}>
        <h2>{pack.name}</h2>
        <div className="creator-actions">
          <button
            className="primary-button"
            type="button"
            disabled={busy}
            onClick={() => play(knowledgeBoard(id), "starter")}
          >
            Play starter board <ArrowRight size={16} />
          </button>
          <button
            className="secondary-button"
            type="button"
            disabled={busy}
            onClick={remix}
          >
            <Sparkles size={16} />
            {busy ? "Making and checking your board…" : "Make an AI remix"}
          </button>
        </div>
        <output className="field-help pack-status">
          {busy
            ? "Choosing connections and checking the whole board. Answers stay hidden."
            : "Starters play instantly. AI remixes combine reviewed facts and wordplay; some connections may return as you explore."}
        </output>
        {error && (
          <p className="form-error" role="alert">
            {error} No replacement board was substituted.
          </p>
        )}
        <details className="pack-options">
          <summary>Play options & interests</summary>
          <label>
            Play mode
            <select
              value={mode}
              disabled={busy}
              onChange={(e) => setMode(e.target.value as typeof mode)}
            >
              <option value="relaxed">Relaxed · hints and room to learn</option>
              <option value="challenge">
                Challenge · four mistakes, no hints
              </option>
            </select>
          </label>
          <label>
            Connection difficulty
            <select
              value={difficulty}
              disabled={busy}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="easy">Easy</option>
              <option value="balanced">Balanced</option>
              <option value="tricky">Tricky</option>
            </select>
          </label>
          <label>
            Curious about something in this pack? (optional)
            <input
              value={interest}
              disabled={busy}
              maxLength={160}
              onChange={(e) => setInterest(e.target.value)}
            />
          </label>
          <p className="field-help">
            AI uses your interest where the pack supports it. These test packs
            have a finite set of reviewed connections; new facts aren’t invented
            to fill a board. Played connections are remembered on this device.
          </p>
        </details>
        <details className="pack-options">
          <summary>Learning references</summary>
          <p>
            Background reading for the pack. AI checks are an additional review,
            not live web fact-checking.
          </p>
          <ul>
            {pack.sources.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noreferrer">
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </details>
      </section>
    </section>
  );
}
