import { useEffect, useRef, useState } from "react";
export function Privacy() {
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const node = dialog.current;
    if (open && node && !node.open) {
      if (typeof node.showModal === "function") node.showModal();
      else node.setAttribute("open", "");
      node.querySelector<HTMLElement>("h2")?.focus();
    }
  }, [open]);
  return (
    <>
      <button
        type="button"
        className="text-button"
        onClick={() => setOpen(true)}
      >
        Privacy &amp; my data
      </button>
      {open && (
        <dialog
          ref={dialog}
          className="account-dialog"
          onCancel={() => setOpen(false)}
          aria-labelledby="privacy-title"
        >
          <h2 id="privacy-title" tabIndex={-1}>
            Your data in Common Thread
          </h2>
          <p>
            Common Thread is a learning-game beta created by Terry Brutus. You
            can play ready-made puzzles without an account.
          </p>
          <p>
            <strong>Signing in:</strong> Google sign-in runs through Internet
            Identity. This app uses your private account ID to keep your saved
            items separate. We do not receive your Google password or
            automatically request your email.
          </p>
          <p>
            <strong>What is saved:</strong> your stories, learning topics,
            submitted material, preferences and played connections. Signed-in
            activity records include your first and most recent account visit.
            Device copies stay in your browser, separated by account.
          </p>
          <p>
            <strong>Visitor list:</strong> an email you choose to provide is
            shown to Terry only when you turn on “Let Terry know I tried the
            game.” It is user-supplied, not Google-verified. Turn it off to
            remove it from the list. This is not marketing consent. Private
            stories and learning material are not part of that list.
          </p>
          <p>
            <strong>Making puzzles:</strong> the text you submit is sent to
            Anthropic’s Claude through the hosted AI service. Personal stories
            are kept separate from learning topics. Only learning topics you opt
            to connect can inform other learning puzzles. Do not submit private
            information about someone else without their permission.
          </p>
          <p>
            Dictation uses your browser’s speech service, which may process
            audio remotely. Shared challenge links contain puzzle answers;
            anyone you send a link to can read that puzzle. Your full saved
            story is not included.
          </p>
          <p>
            <strong>Keeping and deleting:</strong> saved account data stays
            until you delete it. My account lets you download your data or
            delete this account’s saved items. A minimal account-ID deletion
            marker is kept to prevent older devices restoring deleted items
            automatically. Your own downloaded backups and earlier private-beta
            copies are separate. Hosting, identity and AI providers may retain
            operational logs or backups under their policies. Account storage
            and hosting support the service you request; the optional
            visitor-email list uses your choice.
          </p>
          <p>
            Sign-in uses Internet Identity on the Internet Computer. The AI
            service and account storage use OpenAI Sites and Cloudflare; puzzle
            generation uses Anthropic Claude. Providers may process data in
            other countries. This beta does not add advertising trackers or sell
            your saved information. For privacy questions, corrections or
            requests, use the contact details on{" "}
            <a href="https://terrylxd.com" target="_blank" rel="noreferrer">
              Terry’s portfolio
            </a>
            . Rights and complaint routes depend on where you live, including
            your local data-protection authority.
          </p>
          <button
            type="button"
            className="secondary-button"
            onClick={() => setOpen(false)}
          >
            Close
          </button>
        </dialog>
      )}
    </>
  );
}
