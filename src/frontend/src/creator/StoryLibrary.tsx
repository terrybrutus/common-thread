import { useRef, useState } from "react";
import { type StoryProfile, parseProfile } from "./library";

export function StoryLibraryControls({
  profiles,
  current,
  onSelect,
  onNew,
  onRename,
  onImport,
  status,
  connected = false,
}: {
  profiles: StoryProfile[];
  current: StoryProfile;
  onSelect: (id: string) => void;
  onNew: () => void;
  onRename: (name: string) => void;
  onImport: (profile: StoryProfile) => void;
  status: string;
  connected?: boolean;
}) {
  const [message, setMessage] = useState("");
  const [importFailed, setImportFailed] = useState(false);
  const backupInput = useRef<HTMLInputElement>(null);
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
          <button type="button" className="text-button" onClick={onNew}>
            Start another story
          </button>
          <button type="button" className="text-button" onClick={download}>
            Download story (.json)
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={() => backupInput.current?.click()}
          >
            Import story (.json)
          </button>
        </div>
        <input
          hidden
          aria-label="Import story backup"
          ref={backupInput}
          type="file"
          accept="application/json,.json"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            setImportFailed(false);
            try {
              if (file.size > 300000)
                throw new Error("That backup is too large.");
              onImport(parseProfile(JSON.parse(await file.text())));
              setMessage("Story imported. Your answers are ready.");
            } catch (error) {
              setImportFailed(true);
              setMessage(
                error instanceof Error
                  ? error.message
                  : "Couldn't import that story.",
              );
            }
            event.target.value = "";
          }}
        />
        <p className="field-help">
          {connected
            ? "Your Google-linked game account syncs your stories across devices."
            : "Stories stay on this device until you sign in with Google in the published game."}{" "}
          Download a file for a backup; import it to restore a story. Backups
          contain your personal answers.
        </p>
        {message &&
          (importFailed ? (
            <p role="alert" className="form-error">
              {message}
            </p>
          ) : (
            <output className="field-help">{message}</output>
          ))}
      </section>
    </details>
  );
}
