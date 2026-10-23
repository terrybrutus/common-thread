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
        <label className="challenge-choice">
          <input
            type="checkbox"
            checked={brief.mode === "challenge"}
            onChange={(e) =>
              update("mode", e.target.checked ? "challenge" : "relaxed")
            }
          />{" "}
          Limit me to four mistakes, with no hints
        </label>
        <details className="story-followup">
          <summary>More puzzle settings</summary>
          <label>
            Puzzle difficulty
            <select
              value={brief.difficulty}
              onChange={(e) =>
                update(
                  "difficulty",
                  e.target.value as CreatorBrief["difficulty"],
                )
              }
            >
              <option value="easy">Gentle start</option>
              <option value="balanced">A little twist</option>
              <option value="tricky">A bigger challenge</option>
            </select>
          </label>
        </details>
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
              {brief.storyScope !== "self" && (
                <label>
                  {brief.storyScope === "group"
                    ? "Group name"
                    : "Person's name"}{" "}
                  <span>(optional)</span>
                  <input
                    value={brief.recipient || brief.people?.partner || ""}
                    maxLength={40}
                    onChange={(e) => name("partner", e.target.value)}
                  />
                </label>
              )}
            </div>
            <p className="field-help">
              Names help with wording. Describe other people and how they fit
              into your story in your answers; no extra name fields needed.
            </p>
            <label>
              Answer visibility
              <select
                value={brief.style}
                onChange={(e) =>
                  update("style", e.target.value as CreatorBrief["style"])
                }
              >
                <option value="together">
                  Keep answers hidden so I can play
                </option>
                <option value="gift">Let me review the answers first</option>
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
                      All four groups from this story
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
