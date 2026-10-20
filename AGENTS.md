# Project Guidance

## User Preferences

- Keep the code clean, minimal, and ready to export to GitHub for continued development in Codex.
- No elaborate styling.
- Commit and push completed revisions and iterations to `origin/main` after relevant checks pass. The user explicitly requested automatic GitHub pushes on 2026-10-19; do not ask again for routine pushes. The user will import GitHub changes into Caffeine later; do not publish to Caffeine automatically.

## Accepted Requirements

The initial scaffold requirements below describe the export baseline. The user has now authorized the first playable milestone: a two-step beginner introduction, Relaxed mode with unlimited guesses and graduated hints, and solo Challenge mode with four mistakes and no hints. Use original local puzzles, explanations, accessible controls, and mobile layouts. AI generation, multiplayer, and saved vocabulary are later milestones. Keep the existing Caffeine backend/configuration intact while the initial solo rules run locally in the frontend.

The next authorized milestone adds Caffeine Inference for personalized puzzle creation, a four-question brief, editable answer previews, a spoiler-free together option, and casual friend-challenge links/codes. Nicknames and invitation notes stay out of the AI request. Study notes stay out of share links. Share links carry answer data and are not ranked or cheat-resistant; progress is independent on each screen. Do not claim live multiplayer. Examples must be explicitly chosen and clearly labeled, never used as a hidden fallback for AI failure.

- Minimal valid Motoko backend.
- Single page displaying the project name "Common Thread".
- Standard Caffeine configuration, dependencies, and build setup for run and deploy.
- No features, authentication, sample data, extra pages, or elaborate styling.

## Verified Commands

- **typecheck**: `pnpm typecheck`
- **fix**: `pnpm fix`
- **build**: `pnpm build`

## Learnings

- Keep the entry flow focused: Play now starts a board immediately; personal creation opens directly on optional story questions. Do not restore a required interests step. Puzzle settings, saved-story tools, answer review, and extra questions use separate collapsed disclosures. Preserve saved profiles when changing the flow.
- Player-facing categories use shared language (Our parents, Our game-show nights); explanations address the players directly. Keep source/evidence terminology internal. Verify transformed tiles against their original source terms: literal, consistent reversal, or one fixed fill-in-the-blank rule. New personal profiles default to Challenge and balanced difficulty; preserve explicit saved preferences. Freeform stories and reviewed, sender-mapped text excerpts supplement guided answers without erasing them. Explicit puzzle-voice names may go to the model; invitation nicknames remain excluded.

- Production Claude generation uses the private Sites service through a sign-in popup and origin/channel-checked messages. Keep `ANTHROPIC_API_KEY` only in hosted secret storage or ignored local `.env.local`. Never push keys, personal recovery data or service bypass tokens or put them in browser variables. Do not resume Caffeine Inference. Preserve persistent hosted budget reservations (two/person/day, ten/day, 400 lifetime), local test ledger, and input/output limits. Service source is mirrored under services/claude; deploy it separately from Caffeine imports. All-personal and surprise/together are the defaults. Personal terms require source quotations; optional mix allows at most one themed group. Stories autosave locally and save/load privately in owner-scoped D1. Remove the owner-private recovery seed before expanding the service's audience.

- Solo gameplay uses local puzzle data and a pure reducer; it does not depend on backend queries or sign-in. Keep the initial route usable without configured canister IDs.
- Empty OQL entity list in src/backend/main.mo is correct when the actor persists no state; no entity, sample or selector rows are required.
- main.tsx provides QueryClientProvider. InternetIdentityProvider is intentionally not mounted for anonymous solo play: the exported placeholder canister IDs otherwise cause configuration errors locally. Reintroduce it when adding actual authentication/backend features.
- index.html ships social meta tags that must never be removed; keep og:title identical to the title and og:description identical to the description.
