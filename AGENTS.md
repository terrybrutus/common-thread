# Project Guidance

- The home screen has three task-based choices: instant play, personal memories, and learning. Do not restore the duplicate puzzle picker or the centered knowledge-packs link. Learning accepts arbitrary topics or pasted notes/transcripts via learningMode, independent of the finite starter catalog. Keep the six offline starters as a secondary disclosure. Material mode requires exact excerpt support for all full source terms and a whole-board audit of the claimed relationships; topic mode uses stable general knowledge, no invented current facts or citations. Both modes have bounded generation plus one audit, no automatic paid retries. Do not attach personal stories/names to learning requests. Drafts and per-subject played history stay browser-local. Preserve overlong pasted material and explain the limit rather than silently truncating. Mode labels describe hints/mistakes in plain language; game engine enum values remain unchanged.

## User Preferences

- Keep the code clean, minimal, and ready to export to GitHub for continued development in Codex.
- No elaborate styling.
- Commit and push completed revisions and iterations to `origin/main` after relevant checks pass. The user explicitly requested automatic GitHub pushes on 2026-10-19; do not ask again for routine pushes. The user will import GitHub changes into Caffeine later; do not publish to Caffeine automatically.

## Accepted Requirements

The initial scaffold requirements below describe the export baseline. The user has now authorized the first playable milestone: a two-step beginner introduction, Relaxed mode with unlimited guesses and graduated hints, and solo Challenge mode with four mistakes and no hints. Use original local puzzles, explanations, accessible controls, and mobile layouts. AI generation, multiplayer, and saved vocabulary are later milestones. Keep the existing Caffeine backend/configuration intact while the initial solo rules run locally in the frontend.

The next authorized milestone adds Caffeine Inference for personalized puzzle creation, a four-question brief, editable answer previews, a spoiler-free together option, and casual friend-challenge links/codes. Optional names support personal wording; invitation notes stay out of the AI request. Study notes stay out of share links. Share links carry answer data and are not ranked or cheat-resistant; progress is independent on each screen. Do not claim live multiplayer. Examples must be explicitly chosen and clearly labeled, never used as a hidden fallback for AI failure.

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
- Player-facing categories use shared language (Our parents, Our game-show nights); explanations address the players directly. Keep source/evidence terminology internal. Verify transformed tiles against their original source terms: literal, consistent reversal, or one fixed fill-in-the-blank rule. New personal profiles default to Challenge and balanced difficulty; preserve explicit saved preferences. Make spoken, optional questions the primary story flow. Keep freeform text secondary; do not restore the conversation importer. Preserve existing saved text and backups. Explicit puzzle-voice names may go to the model; invitation notes remain excluded.

- Production Claude generation uses the private Sites service through a sign-in popup and origin/channel-checked messages. Keep `ANTHROPIC_API_KEY` only in hosted secret storage or ignored local `.env.local`. Never push keys, personal recovery data or service bypass tokens or put them in browser variables. Do not resume Caffeine Inference. The user explicitly removed app-side spending caps, daily/per-person/lifetime generation quotas, local budget-ledger enforcement and timed cooldowns for the owner-private beta on 2026-10-20. Keep authentication, origin checks, input/output bounds, no automatic retries and local in-flight protection. Preserve historical ledger rows. Anthropic billing settings are external and not verified by this app. Service source is mirrored under services/claude; deploy it separately from Caffeine imports. All-personal and surprise/together are the defaults. Personal terms require source quotations; optional mix allows at most one themed group. Stories autosave locally and save/load privately in owner-scoped D1. Remove the owner-private recovery seed before expanding the service's audience.

- Solo gameplay uses local puzzle data and a pure reducer; it does not depend on backend queries or sign-in. Keep the initial route usable without configured canister IDs.
- Empty OQL entity list in src/backend/main.mo is correct when the actor persists no state; no entity, sample or selector rows are required.
- main.tsx provides QueryClientProvider. InternetIdentityProvider is intentionally not mounted for anonymous solo play: the exported placeholder canister IDs otherwise cause configuration errors locally. Reintroduce it when adding actual authentication/backend features.
- index.html ships social meta tags that must never be removed; keep og:title identical to the title and og:description identical to the description.

- Keep Puzzle options to type, difficulty and mode, with optional names/sharing and themes folded away. One optional participant-name pair serves both puzzle attribution and invitations; send it only for personal generation. No duplicate nickname fields. First-person story text belongs to the creator; normalize minor name typos only with unique corroboration. Never rewrite supporting quotations. Keep the quiet typing path and portfolio footer credit.
- Claude structured output uses compact groups/entries arrays, not four repeated large object schemas (the latter caused a real HTTP 400 grammar-size failure). Validate exactly four groups of four, keep provenance internal, use shared provider-error mapping and bounded Haiku medium effort.

Literal tiles may use a complete shorter phrase only when it occurs at word boundaries inside both the original source and its quoted evidence; the full source/quote must still be grounded in the story. Never permit arbitrary within-word deletions or unsupported abbreviations. Exact source spellings remain valid even if a nearby participant name suggests a possible typo. Draft-validation failures should describe a rejected AI draft, preserve saved answers, and offer the existing generation control rather than implying the user must edit their story.

- Hosted and local Claude calls must share claudeRequest and parseClaudeResponse (12,000 total output tokens including reasoning; 90-second timeout). Personal story drafts may use literal, reverse, fill-blank, first-word and last-word. First/last-word sources are complete meaningful two-word names/titles, never slices of longer names, and must share the IDENTICAL omitted word. Removing different words from unrelated titles/places is not a connection. Do not force wordplay or auto-reverse parents to meet a quota; a coherent factual personal board may pass at any difficulty. Personal boards get one bounded independent whole-board audit before release; this additional call never regenerates a draft. Compute declared reversals from source terms, then run the unchanged strict provenance validator. Do not count common grammar words as a meaningful personal group. Keep no automatic paid retries.

- Played history is per-story and records uncovered/revealed groups, never previews/examples/incoming friend links. Keep the optional freshness question spoiler-free and skippable; persist dismissal for unchanged story content and preserve existing answers. No extra model calls or automatic paid retries. History syncs on explicit cloud save or next generation, not live between friends. Preserve original relationship labels/explanations when applying deterministic wordplay.

- Missing-story responses are structured needs_story questions, not technical errors. Show one centered, skippable native modal with dictation/typing and direct append-to-story generation. Use Claude's same-call branching question or a bounded context-based fallback; never require four new categories. Preserve focus and saved drafts; exclude question metadata from friend links.

- Reject overlapping literal food/restaurant groups, disjunctive leftovers and unsupported current visits or biography. Keep source quotations verbatim; an invalid model excerpt may be replaced only by a uniquely matched verbatim story span for the unchanged full source. Unsupported decorative hints get neutral wording; unsupported claims in categories/reveals fail. Minimal full answer phrases (sourceWords) travel with missing-word mechanics and history; quotations remain private.

- Personal creation opens one reusable, automatic connection to the owner-private service. GAME_ORIGINS must contain exact owner-supplied game origins; do not auto-authorize arbitrary sites or restore a second generation button. Connected edits sync after cloud hydration, on a debounce, with polling/focus refresh. Never pop up background autosaves; preserve local copies on failure and merge missing extras/longer answers. Browser-only text requires the original browser to connect. Keep visitor identity checks; no owner-export bypass endpoints.
