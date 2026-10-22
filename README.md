# Common Thread

A word-association game for casual play, personal memories and learning. React/TypeScript frontend, Motoko backend, Caffeine deployment, and a separately hosted Claude service.

## Play

- **Just play:** a shared daily puzzle, with recent daily boards available afterward. No account or AI generation needed. The 365-day schedule mixes reviewed catalog groups; groups repeat across different combinations.
- **Make it personal:** optional spoken or typed questions build an editable, saved story. Four personal connections are the default. Solve together hides the answers; maker preview allows review and casual challenge sharing.
- **Learn through play:** enter any subject or paste notes/transcripts. Six ready-made subject packs remain available offline. Saved topics retain material and played connections; changing a subject keeps a separate topic.
- Play with hints and unlimited guesses, or choose four mistakes and no hints. The beginner introduction teaches two small puzzles. Shared links are casual puzzles containing answers, not live/ranked multiplayer.

## Accounts and privacy

Published builds offer Google sign-in through Internet Identity, without automatically requesting email attributes. Each verified account has separate cloud stories, learning topics/history and browser caches. A short-lived browser capability is registered by the authenticated Motoko caller; the Claude service verifies its hash through a signature-verified mainnet query against the configured backend.

Personal stories never enter learning requests. **Use this topic with my other learning topics** is off unless selected; both topics must opt in. Notes/transcript puzzles still use their current material as factual authority. Account tools allow export and deletion, with safeguards against stale-device restoration. Older unscoped private-beta stories are never automatically copied into another account.

**Let Terry know I tried the game** is a separate optional email preference. Owner reports show aggregate signed-in account counts and opted-in, self-reported emails; they do not identify anonymous visitors or include story contents. This is not marketing consent. The footer privacy notice explains providers, processing, retention and contact options. This is a beta, not a legal compliance certification or end-to-end encrypted storage.

Before public sharing, complete the published two-account checks in [ACCOUNT_LAUNCH.md](ACCOUNT_LAUNCH.md). Import the new Motoko backend together with the frontend; an old backend cannot verify Google game sessions.

## AI generation

Claude selects connections and writes player-facing explanations. Code enforces structure, source grounding and exact wordplay mechanics; a separate model audit checks the board. Personal groups require story evidence. Subject mode uses stable general knowledge; pasted material uses a bounded concept-inventory call, generation and audit. AI quality is still a beta limitation, not guaranteed by structural validation. There are no automatic paid retries or silent example fallbacks.

The API key stays in hosted secret storage. No browser API key or service bypass token is shipped. Caffeine Inference is disabled; Caffeine still hosts the game and account-verification canister. The beta has no app-side generation quotas; provider billing controls are external and not verified by this app. Subscriptions and crypto payments are not implemented.

Service deployment/configuration: [services/claude/README.md](services/claude/README.md). Sanitized generation reports: [personal](services/claude/REAL_EVAL.md), [learning](services/claude/LEARNING_EVAL.md), [packs](services/claude/KNOWLEDGE_EVAL.md). Private stories, quotations and test outputs stay untracked.

## Local development and checks

```sh
pnpm install --store-dir .pnpm-store
pnpm dev
pnpm fix
pnpm typecheck
pnpm --dir src/frontend test
pnpm build
pnpm test:backend
```

Local placeholder env.json keeps anonymous play usable and leaves Google sign-in disabled. Account sign-in needs the published Caffeine configuration. Dictation requires browser support and a user microphone action; typing remains available. Round progress is in memory; saved stories, topics and revealed-connection history are separate.

The frontend build uses Node for environment copying on Windows and Caffeine. Motoko compilation/bindgen follows the canister manifests; Windows compilation uses the installed WSL Motoko toolchain. The PocketIC lane only runs with the platform sidecar; a skipped lane is not a backend test pass. The standalone service has its own dependencies, migrations and tests.

Commit and push verified changes to origin/main, then import that revision into the existing Caffeine project. GitHub pushes do not publish the game. The service deploys independently; API key secrets and private data never belong in GitHub.
