import { ArrowLeft, ArrowRight, HeartHandshake } from "lucide-react";
import type { FriendChallenge } from "./schema";

export function Invitation({
  challenge,
  onPlay,
  onHome,
}: {
  challenge: FriendChallenge;
  onPlay: (mode: "relaxed" | "challenge") => void;
  onHome: () => void;
}) {
  return (
    <section
      className="creator-page invitation"
      aria-labelledby="invitation-title"
    >
      <button className="text-button" type="button" onClick={onHome}>
        <ArrowLeft size={16} /> Home
      </button>
      <div className="invitation-card">
        <HeartHandshake size={35} />
        <span className="eyebrow">
          {challenge.source === "example"
            ? "EXAMPLE FRIEND CHALLENGE"
            : "A PERSONAL PUZZLE"}
        </span>
        <h1 id="invitation-title">
          {challenge.recipient
            ? `A thread for ${challenge.recipient}.`
            : "Someone thought of you."}
        </h1>
        <p>From {challenge.creator || "a friend"}, with a little curiosity.</p>
        {challenge.note && <blockquote>{challenge.note}</blockquote>}
        <h2>{challenge.puzzle.title}</h2>
        <p>{challenge.puzzle.description}</p>
        <span className="mode-label">
          {challenge.mode === "relaxed"
            ? "Hints available · no guess limit"
            : "Four mistakes · no hints"}
        </span>
        <button
          className="primary-button"
          type="button"
          onClick={() => onPlay(challenge.mode)}
        >
          {challenge.style === "together"
            ? "Let's solve it together"
            : "Accept the challenge"}
          <ArrowRight size={17} />
        </button>
        {challenge.mode === "challenge" && (
          <button
            className="text-button"
            type="button"
            onClick={() => onPlay("relaxed")}
          >
            Play with hints instead
          </button>
        )}
        <p className="invitation-footnote">
          A friendly puzzle, with no rankings. Solve side by side, or open the
          same puzzle on separate screens and compare notes. Progress isn't
          synced between screens.
        </p>
      </div>
    </section>
  );
}
