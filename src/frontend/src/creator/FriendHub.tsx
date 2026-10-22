import { ArrowRight } from "lucide-react";
import { useState } from "react";
import type { FriendChallenge } from "./schema";
import { decodeChallenge } from "./sharing";

export function FriendHub({
  onOpen,
}: { onOpen: (challenge: FriendChallenge) => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  return (
    <section
      className="friend-hub compact-friends"
      aria-label="Open a friend’s puzzle"
    >
      <details className="join-challenge">
        <summary>Open a friend’s puzzle</summary>
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
          <label htmlFor="friend-code">
            Paste the puzzle link your friend sent
          </label>
          <textarea
            id="friend-code"
            value={code}
            maxLength={22000}
            onChange={(event) => setCode(event.target.value)}
            rows={3}
            required
          />
          <button className="secondary-button" type="submit">
            Open puzzle
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
