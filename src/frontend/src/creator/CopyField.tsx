import { Check, Copy } from "lucide-react";
import { useId, useState } from "react";

export function CopyField({ value, label }: { value: string; label: string }) {
  const id = useId();
  const [status, setStatus] = useState("");
  const [copiedValue, setCopiedValue] = useState("");
  return (
    <div className="copy-field">
      <label htmlFor={id}>{label}</label>
      <div className="copy-row">
        <input
          id={id}
          value={value}
          readOnly
          onFocus={(event) => event.currentTarget.select()}
        />
        <button
          className="secondary-button"
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(value);
              setCopiedValue(value);
              setStatus("Copied. Ready to share.");
            } catch {
              setStatus(
                "Copy wasn't available. Select the text and copy it manually.",
              );
            }
          }}
        >
          {copiedValue === value ? <Check size={15} /> : <Copy size={15} />}{" "}
          Copy
        </button>
      </div>
      <output aria-live="polite">{status}</output>
    </div>
  );
}
