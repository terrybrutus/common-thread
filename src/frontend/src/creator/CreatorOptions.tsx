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
  function name(which: "you" | "partner", value: string) {
    update(which === "you" ? "creator" : "recipient", value);
    update("people", {
      you: which === "you" ? value : brief.creator || brief.people?.you || "",
      partner:
        which === "partner"
          ? value
          : brief.recipient || brief.people?.partner || "",
    });
  }
  return (
    <details className="creator-options">
      <summary>Puzzle options</summary>
      <div className="editor-fields">
        <label>
          Puzzle type
          <select
            value={brief.purpose}
            onChange={(e) =>
              update("purpose", e.target.value as CreatorBrief["purpose"])
            }
          >
            <option value="fun">Personal story</option>
            <option value="study">Learning puzzle</option>
          </select>
        </label>
        <label>
          Puzzle difficulty
          <select
            value={brief.difficulty}
            onChange={(e) =>
              update("difficulty", e.target.value as CreatorBrief["difficulty"])
            }
          >
            <option value="easy">Gentle start</option>
            <option value="balanced">A little twist</option>
            <option value="tricky">Make us think</option>
          </select>
        </label>
        <label>
          Play mode
          <select
            value={brief.mode}
            onChange={(e) =>
              update("mode", e.target.value as CreatorBrief["mode"])
            }
          >
            <option value="relaxed">Relaxed · hints available</option>
            <option value="challenge">Challenge · four mistakes</option>
          </select>
        </label>
        <details className="story-followup">
          <summary>Names & sharing (optional)</summary>
          <div className="editor-fields">
            <div className="field-row">
              <label>
                Your name <span>(optional)</span>
                <input
                  value={brief.creator || brief.people?.you || ""}
                  maxLength={40}
                  onChange={(e) => name("you", e.target.value)}
                />
              </label>
              <label>
                Playing with <span>(optional)</span>
                <input
                  value={brief.recipient || brief.people?.partner || ""}
                  maxLength={40}
                  onChange={(e) => name("partner", e.target.value)}
                />
              </label>
            </div>
            <p className="field-help">
              One pair of names for the puzzle and invitation. For personal
              puzzles, Claude uses these to understand who's who. You can leave
              them blank.
            </p>
            <label>
              Answer visibility
              <select
                value={brief.style}
                onChange={(e) =>
                  update("style", e.target.value as CreatorBrief["style"])
                }
              >
                <option value="together">Solve together · surprise us</option>
                <option value="gift">Review answers before sharing</option>
              </select>
            </label>
            <label>
              A personal note <span>(optional)</span>
              <input
                value={brief.note}
                maxLength={180}
                onChange={(e) => update("note", e.target.value)}
              />
            </label>
          </div>
        </details>
        <details className="story-followup">
          <summary>
            {brief.purpose === "fun"
              ? "Themes & extra interests (optional)"
              : "Learning preferences"}
          </summary>
          <div className="editor-fields">
            {brief.purpose === "fun" ? (
              <>
                <label>
                  Extra interests <span>(optional)</span>
                  <textarea
                    value={brief.interests}
                    maxLength={2000}
                    rows={2}
                    onChange={(e) => update("interests", e.target.value)}
                  />
                </label>
                <label>
                  A theme to weave in <span>(optional)</span>
                  <input
                    value={brief.topic}
                    maxLength={500}
                    onChange={(e) => update("topic", e.target.value)}
                  />
                </label>
                <label>
                  Personal connections
                  <select
                    value={brief.personalization || "memories-only"}
                    onChange={(e) =>
                      update(
                        "personalization",
                        e.target.value as "mix" | "memories-only",
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
            ) : (
              <label>
                Topic familiarity
                <select
                  value={brief.familiarity}
                  onChange={(e) =>
                    update(
                      "familiarity",
                      e.target.value as CreatorBrief["familiarity"],
                    )
                  }
                >
                  <option value="new">New to it</option>
                  <option value="familiar">Know it already</option>
                </select>
              </label>
            )}
          </div>
        </details>
      </div>
    </details>
  );
}
