import type { CreatorBrief } from "./schema";

export function CreatorOptions({
  brief,
  update,
}: {
  brief: CreatorBrief;
  update: <K extends keyof CreatorBrief>(
    key: K,
    value: CreatorBrief[K],
  ) => void;
}) {
  return (
    <details className="creator-options">
      <summary>Puzzle options</summary>
      <div className="editor-fields">
        <fieldset className="choice-grid">
          <legend>Who sees the answers?</legend>
          <label className="choice">
            <input
              type="radio"
              name="style"
              checked={brief.style === "together"}
              onChange={() => update("style", "together")}
            />
            <strong>Solve together · surprise us</strong>
            <span>Keep the answers hidden for both of you.</span>
          </label>
          <label className="choice">
            <input
              type="radio"
              name="style"
              checked={brief.style === "gift"}
              onChange={() => update("style", "gift")}
            />
            <strong>Make a challenge</strong>
            <span>Review the answers before sharing.</span>
          </label>
        </fieldset>
        <label>
          Puzzle type
          <select
            value={brief.purpose}
            onChange={(event) =>
              update("purpose", event.target.value as CreatorBrief["purpose"])
            }
          >
            <option value="fun">Personal story</option>
            <option value="study">Learning puzzle</option>
          </select>
        </label>
        {brief.purpose === "fun" && (
          <>
            <label>
              Extra interests <span>(optional)</span>
              <textarea
                value={brief.interests}
                maxLength={2000}
                rows={2}
                onChange={(event) => update("interests", event.target.value)}
              />
            </label>
            <label>
              A theme to weave in <span>(optional)</span>
              <input
                value={brief.topic}
                maxLength={500}
                onChange={(event) => update("topic", event.target.value)}
              />
            </label>
            <label>
              Personal connections
              <select
                value={brief.personalization || "memories-only"}
                onChange={(event) =>
                  update(
                    "personalization",
                    event.target.value as "mix" | "memories-only",
                  )
                }
              >
                <option value="memories-only">
                  All four groups from our story
                </option>
                <option value="mix">Allow one related theme</option>
              </select>
            </label>
          </>
        )}
        <label>
          Puzzle difficulty
          <select
            value={brief.difficulty}
            onChange={(event) =>
              update(
                "difficulty",
                event.target.value as CreatorBrief["difficulty"],
              )
            }
          >
            <option value="easy">Gentle start</option>
            <option value="balanced">A little twist</option>
            <option value="tricky">Make us think</option>
          </select>
        </label>
        <p className="field-help">
          Difficulty changes the connections and wordplay. Play mode below
          controls mistakes and hints.
        </p>
        {brief.purpose === "study" && (
          <label>
            Topic familiarity
            <select
              value={brief.familiarity}
              onChange={(event) =>
                update(
                  "familiarity",
                  event.target.value as CreatorBrief["familiarity"],
                )
              }
            >
              <option value="new">New to it</option>
              <option value="familiar">Know it already</option>
            </select>
          </label>
        )}
        <label>
          Starting play mode
          <select
            value={brief.mode}
            onChange={(event) =>
              update("mode", event.target.value as CreatorBrief["mode"])
            }
          >
            <option value="relaxed">Relaxed · hints available</option>
            <option value="challenge">Challenge · four mistakes</option>
          </select>
        </label>
        <div className="field-row">
          <label>
            Your name in the puzzle
            <input
              value={brief.people?.you || ""}
              maxLength={40}
              onChange={(event) =>
                update("people", {
                  you: event.target.value,
                  partner: brief.people?.partner || "",
                })
              }
            />
          </label>
          <label>
            Other person's name in the puzzle
            <input
              value={brief.people?.partner || ""}
              maxLength={40}
              onChange={(event) =>
                update("people", {
                  you: brief.people?.you || "",
                  partner: event.target.value,
                })
              }
            />
          </label>
        </div>
        <p className="field-help">
          These optional names go to Claude to make the wording personal. The
          invitation nicknames below stay out of the model request.
        </p>
        <div className="field-row">
          <label>
            Your nickname <span>(optional)</span>
            <input
              value={brief.creator}
              maxLength={40}
              onChange={(event) => update("creator", event.target.value)}
              placeholder="e.g. Terry"
            />
          </label>
          <label>
            Friend's nickname <span>(optional)</span>
            <input
              value={brief.recipient}
              maxLength={40}
              onChange={(event) => update("recipient", event.target.value)}
              placeholder="e.g. Jessica"
            />
          </label>
        </div>
        <label>
          A personal note <span>(optional)</span>
          <input
            value={brief.note}
            maxLength={180}
            onChange={(event) => update("note", event.target.value)}
          />
        </label>
      </div>
    </details>
  );
}
