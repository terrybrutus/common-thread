import { ArrowRight, Sparkles, Users } from "lucide-react";
import { useState } from "react";
import type { FriendChallenge } from "./schema";
import { decodeChallenge } from "./sharing";

export function FriendHub({
  onCreate,
  onOpen,
}: { onCreate: () => void; onOpen: (challenge: FriendChallenge) => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  return (
    <section className="friend-hub" aria-labelledby="friends-title">
      <div className="section-heading">
        <div>
          <span className="eyebrow">BETTER WITH A LITTLE YOU IN IT</span>
          <h2 id="friends-title">Make a thread for someone.</h2>
        </div>
        <Users size={26} />
      </div>
      <p>
        Shared interests. A subject they're studying. A little friendly
        challenge. Give AI a few clues and make a puzzle that feels like you.
      </p>
      <button className="primary-button" type="button" onClick={onCreate}>
        <Sparkles size={17} /> Create a personal puzzle
        <ArrowRight size={17} />
      </button>
      <details className="join-challenge">
        <summary>Have a challenge from a friend?</summary>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setError("");
            try {
              onOpen(decodeChallenge(code));
            } catch (error) {
              setError(
                error instanceof Error
                  ? error.message
                  : "That challenge couldn't be opened.",
              );
            }
          }}
        >
          <label htmlFor="friend-code">Paste a challenge link or code</label>
          <textarea
            id="friend-code"
            value={code}
            maxLength={22000}
            onChange={(event) => setCode(event.target.value)}
            rows={3}
            required
          />
          <button className="secondary-button" type="submit">
            Open challenge
            <ArrowRight size={15} />
          </button>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
        </form>
      </details>
    </section>
  );
}
