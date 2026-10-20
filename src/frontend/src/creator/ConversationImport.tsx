import { useState } from "react";

export function mapConversation(
  text: string,
  you: string,
  partner: string,
  yourLabel: string,
  partnerLabel: string,
): string {
  return text
    .split(/\r?\n/)
    .map((line) => {
      const match = line.match(/^(\s*)([^:\n]{1,60}):\s*(.*)$/);
      if (!match) return line;
      const label = match[2].trim().toLocaleLowerCase();
      if (label === yourLabel.trim().toLocaleLowerCase())
        return `${you}: ${match[3]}`;
      if (label === partnerLabel.trim().toLocaleLowerCase())
        return `${partner}: ${match[3]}`;
      return line;
    })
    .join("\n");
}

export function ConversationImport({
  people,
  onAdd,
}: {
  people?: { you: string; partner: string };
  onAdd: (text: string, people: { you: string; partner: string }) => void;
}) {
  const [you, setYou] = useState(people?.you || "");
  const [partner, setPartner] = useState(people?.partner || "");
  const [yourLabel, setYourLabel] = useState("Me");
  const [partnerLabel, setPartnerLabel] = useState("Them");
  const [text, setText] = useState("");
  const [preview, setPreview] = useState("");
  const [message, setMessage] = useState("");
  return (
    <details className="creator-options">
      <summary>Import a conversation excerpt</summary>
      <p className="field-help">
        Paste sender-labeled text or choose a .txt export. Start with a relevant
        excerpt, up to 12,000 characters. Photos, voice messages, and iMessage
        databases aren't read here.
      </p>
      <div className="field-row">
        <label>
          Your name
          <input
            value={you}
            maxLength={40}
            onChange={(event) => {
              setYou(event.target.value);
              setPreview("");
            }}
          />
        </label>
        <label>
          Other person's name
          <input
            value={partner}
            maxLength={40}
            onChange={(event) => {
              setPartner(event.target.value);
              setPreview("");
            }}
          />
        </label>
      </div>
      <div className="field-row">
        <label>
          Your sender label
          <input
            value={yourLabel}
            maxLength={40}
            onChange={(event) => {
              setYourLabel(event.target.value);
              setPreview("");
            }}
          />
        </label>
        <label>
          Their sender label
          <input
            value={partnerLabel}
            maxLength={40}
            onChange={(event) => {
              setPartnerLabel(event.target.value);
              setPreview("");
            }}
          />
        </label>
      </div>
      <p className="field-help">
        Match the labels in your export—for example Me/Them, Terry/Jessica, or
        Green/Gray. Unmatched lines stay unchanged; check who's speaking in the
        preview.
      </p>
      <label>
        Conversation text
        <textarea
          value={text}
          maxLength={12000}
          rows={6}
          onChange={(event) => {
            setText(event.target.value);
            setPreview("");
          }}
        />
      </label>
      <label>
        Or select a text export
        <input
          type="file"
          accept="text/plain,.txt"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            try {
              if (file.size > 100000)
                throw new Error("Choose a shorter conversation excerpt.");
              const content = await file.text();
              if (content.length > 12000)
                throw new Error(
                  "This export is longer than 12,000 characters. Choose a relevant date range or excerpt; nothing has been truncated.",
                );
              setText(content);
              setPreview("");
              setMessage("");
            } catch (error) {
              setMessage(
                error instanceof Error
                  ? error.message
                  : "Couldn't read that text file.",
              );
            }
            event.target.value = "";
          }}
        />
      </label>
      <button
        className="secondary-button"
        type="button"
        disabled={
          !text.trim() ||
          !you.trim() ||
          !partner.trim() ||
          !yourLabel.trim() ||
          !partnerLabel.trim() ||
          yourLabel.trim().toLowerCase() === partnerLabel.trim().toLowerCase()
        }
        onClick={() => {
          setPreview(
            mapConversation(
              text,
              you.trim(),
              partner.trim(),
              yourLabel,
              partnerLabel,
            ),
          );
          setMessage("");
        }}
      >
        Preview who's speaking
      </button>
      {preview && (
        <>
          <pre className="conversation-preview">{preview}</pre>
          <p className="field-help">
            Review the names and content before adding. Messages can contain
            jokes or plans that didn't happen; generation mustn't treat those as
            confirmed memories.
          </p>
          <button
            className="secondary-button"
            type="button"
            onClick={() => {
              if (preview.length > 12000) {
                setMessage(
                  "The mapped text exceeds 12,000 characters. Shorten the excerpt first.",
                );
                return;
              }
              try {
                onAdd(preview, { you: you.trim(), partner: partner.trim() });
                setPreview("");
                setText("");
                setMessage(
                  "Conversation added to your saved story. You can edit it under Paste or speak freely.",
                );
              } catch (error) {
                setMessage(
                  error instanceof Error
                    ? error.message
                    : "Could not add that excerpt; your earlier story is unchanged.",
                );
              }
            }}
          >
            Add reviewed conversation to story
          </button>
        </>
      )}
      {message && <output className="field-help">{message}</output>}
    </details>
  );
}
