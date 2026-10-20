import { useState } from "react";
import { hostedOperation } from "./hosted";
import { type StoryProfile, parseProfile } from "./library";

export function StoryLibraryControls({
  profiles,
  current,
  onSelect,
  onNew,
  onRename,
  onImport,
  status,
}: {
  profiles: StoryProfile[];
  current: StoryProfile;
  onSelect: (id: string) => void;
  onNew: () => void;
  onRename: (name: string) => void;
  onImport: (profile: StoryProfile) => void;
  status: string;
}) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function cloud(action: "load-story" | "save-story") {
    setBusy(true);
    setMessage("");
    try {
      const data = await hostedOperation(
        action,
        action === "save-story" ? current : { id: current.id },
      );
      if (action === "load-story") {
        const result = data as { profiles: unknown[] };
        if (!Array.isArray(result.profiles) || !result.profiles.length)
          throw new Error(
            "No cloud story yet. Save this story to private cloud first.",
          );
        const choices = result.profiles.map(parseProfile);
        for (const profile of choices.reverse()) onImport(profile);
        setMessage("Cloud stories loaded. Choose one above to continue.");
      } else
        setMessage(
          "Saved to private cloud. Load it on your other computer with the same ChatGPT sign-in.",
        );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Couldn't connect to story storage.",
      );
    } finally {
      setBusy(false);
    }
  }
  function download() {
    const blob = new Blob(
      [JSON.stringify({ version: 1, ...current }, null, 2)],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "common-thread-story.json";
    link.click();
    URL.revokeObjectURL(url);
  }
  return (
    <details className="creator-panel story-library">
      <summary>Saved stories &amp; backups</summary>
      <section aria-label="Saved stories">
        <h2>Your living stories</h2>
        <p>
          Keep your answers, add new memories, and make another puzzle without
          starting over.
        </p>
        <label>
          Saved story
          <select
            value={current.id}
            onChange={(event) => onSelect(event.target.value)}
          >
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Story name
          <input
            value={current.name}
            maxLength={80}
            onChange={(event) => onRename(event.target.value)}
          />
        </label>
        <output className="field-help">{status}</output>
        <div className="creator-actions">
          <button
            type="button"
            className="secondary-button"
            disabled={busy}
            onClick={() => void cloud("load-story")}
          >
            Load private cloud stories
          </button>
          <button
            type="button"
            className="secondary-button"
            disabled={busy}
            onClick={() => void cloud("save-story")}
          >
            Save to private cloud
          </button>
          <button type="button" className="text-button" onClick={onNew}>
            Start another story
          </button>
          <button type="button" className="text-button" onClick={download}>
            Download story backup
          </button>
        </div>
        <label>
          Import story backup
          <input
            type="file"
            accept="application/json,.json"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              try {
                if (file.size > 300000)
                  throw new Error("That backup is too large.");
                onImport(parseProfile(JSON.parse(await file.text())));
                setMessage("Story imported. Your answers are ready.");
              } catch (error) {
                setMessage(
                  error instanceof Error
                    ? error.message
                    : "Couldn't import that story.",
                );
              }
              event.target.value = "";
            }}
          />
        </label>
        <p className="field-help">
          Browser saving stays on this device and site address. Private cloud
          saving works across computers. Backups contain your personal answers;
          keep them private.
        </p>
        {message && <output className="field-help">{message}</output>}
      </section>
    </details>
  );
}
