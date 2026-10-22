# Common Thread

A word association game for casual play and learning, built on Caffeine's React/TypeScript frontend and Motoko backend. Includes a two-step introduction, Relaxed and solo Challenge modes, and a personal puzzle creator with casual friend challenges.

## Local development

From this repository directory:

```sh
pnpm install --store-dir .pnpm-store
pnpm dev
```

Open the local URL printed by Vite. The game currently runs locally in the frontend without a local Internet Computer replica. Backend features will need a configured canister environment when introduced; the exported `env.json` currently contains placeholders. Round progress is held in memory and resets when you leave a round or refresh.

The environment-copy build step uses Node so it works on Windows and in Caffeine's build environment.

Solo play does not mount InternetIdentityProvider or call backend services. The creator lazily connects an anonymous actor only when generation is requested. The exported identity utilities remain available for future account features.

## Checks

```sh
pnpm typecheck
pnpm check
pnpm --dir src/frontend test
pnpm build
```

`pnpm build` builds the frontend, not the Motoko canister. The Caffeine canister manifests define the backend compilation and binding-generation steps. `pnpm test:backend` is the exported PocketIC test lane; it can skip when the compiled backend or platform sidecar is absent. A skipped lane does not verify the backend.

## Playable features

1. Beginner introduction: two eight-word puzzles, gentle feedback, explanations, and options to skip or replay. The second puzzle introduces overlapping meanings using PALM.
2. Relaxed: unlimited guesses, no timer, graduated hints (nudge, anchor, pair), guided reveals, and explanations after each group.
3. Challenge: four mistakes, no hints or timer, win/loss results, answer review, replay, and next-puzzle controls. Repeating a guess never costs another mistake.
4. Three original full puzzles cover everyday nature, biology, and food. Choose one before starting either mode.
5. Native keyboard-operable buttons, selection announcements, focus management, visible focus indicators, and mobile layouts.
6. Unit and interaction tests cover both tutorials, selection limits, duplicate guesses, hints, guided reveals, mistakes, wins/losses, replay, and next-puzzle resets.

## Personal puzzles and friend challenges

The home screen offers **Play now** for an immediate Relaxed board and **Create a personal puzzle** for story-based play. Puzzle selection and Challenge mode sit under **Choose a puzzle or challenge mode**; the header retains **How to play**. The personal creator opens directly on optional story questions with a prominent microphone above each editable transcript, with no required interest selection or four-stage setup wizard. **Puzzle options** holds type, difficulty and play mode, with optional names/sharing and themes folded away; **Saved stories & backups** holds storage tools. Existing saved profiles and answers are preserved. The single optional name pair supports personal wording and invitations; invitation notes stay out of the model request, and study notes remain outside challenge links.

- **Make a challenge** shows the creator the groups and allows editing words, categories, hints, and explanations before sharing.
- **Solve together** hides the groups so both players can discover them. Switching to maker preview reveals them explicitly.
- **Use this puzzle** creates a share link and a portable challenge code. The recipient can open the link, or paste it/code under **Have a challenge from a friend?**.
- The local preview can open codes, but localhost links only work on the same computer. Published Caffeine links use the app's actual domain.
- Results can be copied manually after a personal round. Nothing sends messages to friends automatically.

### Private hosted Claude

Published Caffeine builds now connect to the deployed owner-private Claude service at https://common-thread-claude-service.terrbrutus.chatgpt.site. Press **Make our puzzle**, allow the private window, sign in with the ChatGPT account that owns the service if asked, then press **Make my puzzle** there. The board returns to Common Thread for review and sharing. If sign-in severs the popup connection, return to the game and open it again after signing in. Only the creator needs that sign-in; friends solve the shared puzzle without accessing the AI service. See services/claude/README.md for deployment and budget details.

The API key lives in hosted secret storage. The production frontend carries only the public service URL, never an API key or service bypass credential. For the owner-private beta, there is no app-side spending cap, daily/lifetime generation quota, or timed cooldown. Anthropic account billing controls apply separately; this app does not read or verify those settings. Sign-in, same-origin validation, input/output bounds and no automatic retries remain in place. Historical generation ledger rows are preserved but are no longer consulted.

Four optional story questions now allow **3,000 characters each**, with persistent questions/help, skip/back/review controls and a microphone button where browser SpeechRecognition is available. Dictation appends editable text; the browser may use its own speech provider. No paid transcription API is used. Unsupported browsers show instructions for keyboard dictation. Shared interests allow 2,000 characters, topic 500 and study notes 12,000. Skipped answers and help examples are not treated as personal facts. Story answers and study notes remain outside friend links.

**Speak your answer** is the primary control for each optional question. Speech is appended to an editable transcript; moving to another question stops recognition. Unsupported browsers show a keyboard-dictation/typing fallback. Microphone access starts only after a tap. **Paste or speak freely** remains a secondary 12,000-character option; switching preserves both styles. The conversation importer has been removed. Previously saved conversation text and participant names remain compatible with backups and generation, and existing text can still be reviewed in freeform mode. Explicit puzzle-voice names may go to Claude; invitation notes remain excluded.

New personal stories default to **Challenge** with **A little twist**. Saved choices are preserved. Play mode controls mistakes/hints; difficulty controls associations and wordplay. Player-facing labels use shared language and explanations address the players directly. The service verifies literal terms, reversed single-word sources and fixed-phrase fill-in-the-blank transformations against internal source quotations. It also rejects mixed date granularities and several report-like phrases. These checks do not prove semantic fairness. Deterministic tests cover the transformation and wording gates; they do not verify every model-generated category.

**Our story** (four personal groups) and **Solve together · surprise us** are now the defaults for new stories. The generator inventories the whole story before choosing categories; unrelated interest chips cannot justify filler. Personal terms require supporting source excerpts, and optional mix permits at most one related theme. Titles, descriptions, categories and terms stay hidden in the surprise preview until the player explicitly switches to maker mode. A live regression test with substantial personal context and a deliberately unrelated interest produced four provenance-checked personal groups.

**Your living stories** saves named profiles automatically in this browser. **Save to private cloud** stores them behind the owning ChatGPT account; **Load private cloud stories** restores them on another computer or site origin. Generation saves the current profile before the paid call. Saving/loading stories never uses an AI generation. Local autosave is device/origin-specific, so use cloud save or a downloaded JSON backup before moving devices. Newer saved cloud versions are protected against older uploads. Add suggested or custom follow-up questions from the story review; earlier answers stay intact. Used-term history encourages new combinations from the expanding story. Story records, recovery data, and source quotations are not embedded in puzzle links.

The hosted service has been upgraded independently of the Caffeine frontend. Its new stories table and private recovery seed are deployed; importing GitHub updates the game UI, not the service. Recovery data is held as a private runtime secret and imported only behind the existing owner-private access boundary. No real story text is committed to this repository.

Local development can still call Claude through Vite middleware, using the same prompt/schema/parser. Configure ANTHROPIC_API_KEY only in ignored src/frontend/.env.local, never a VITE_ variable. The local tester accepts loopback same-origin JSON requests only and prevents overlapping requests, with no spending ledger, generation quota or timed cooldown. The prior Motoko Caffeine Inference endpoint remains in the export but is not called by the creator, so the game does not use Caffeine's AI allowance.

**Explore the creator with an example puzzle** remains explicit and labeled. AI failure never silently returns an example.

Additional middleware checks: `node --test src/frontend/claude-dev.test.mjs`.

AI output is checked for schema, lengths, four groups of four, and unique normalized words. These checks do not prove factual accuracy or exclude every alternative grouping. Study content should be reviewed by the creator. Friend links carry the complete answer data in their fragment: this is casual, unranked sharing, not cheat-resistant competitive multiplayer. Progress is independent on each screen; there are no live rooms, synced boards, or shared leaderboards yet. Saved vocabulary and shared Worduel accounts remain later milestones.

## Backend development

On Linux or in Caffeine:

```sh
pnpm exec mops check --fix
pnpm exec mops build
pnpm bindgen
```

The pinned Motoko compiler has no Windows binary. Use an existing WSL Ubuntu environment for mops checks/builds on Windows, then run `pnpm bindgen` in this checkout. Dependencies are managed through mops; do not hand-edit `mops.lock` or generated frontend bindings.

## Project layout

- `src/frontend/src/App.tsx`: mode selection and session navigation.
- `src/frontend/src/game/Game.tsx`: the game board and results.
- `src/frontend/src/game/engine.ts`: pure game rules and hint logic.
- `src/frontend/src/game/puzzles.ts`: original puzzles and tutorial content.
- `src/frontend/src/creator/`: guided creator, AI client, validation, invitations, and share-code format.
- `src/frontend/src/index.css`: shared styles.
- `src/backend/main.mo`: Motoko backend.
- `src/backend/mixins/puzzle-creator.mo`: anonymous, capacity-limited AI endpoint.
- `src/backend/lib/`: bounded generation prompt and Caffeine inference integration.
- `caffeine.toml`, `mops.toml`, and the canister manifests: Caffeine/ICP configuration.
- `test/pocketic`: exported backend test infrastructure.

Keep generated frontend bindings intact. Build and check changes locally, push them to GitHub, then import the chosen revision into the existing Caffeine project for platform preview and publishing. GitHub pushes alone do not deploy the app.

The user has authorized committing and pushing verified revisions to `origin/main` automatically. Caffeine import and publishing stay under the user's control.

The creator now keeps three basic controls in **Puzzle options** (type, difficulty and play mode). Optional names/sharing and themes open separately. **Type quietly instead** focuses the editable answer and stops an active microphone; short lists work for surprises. One optional name pair replaces duplicate nickname/identity inputs and remains compatible with existing saved profiles. The footer credits Terry Brutus.

Real Haiku 5.5 testing with the private saved-story copy reproduced an HTTP 400 grammar-size error from the old repeated schema. The compact groups/entries array schema completed successfully. A reviewed balanced board had four source-grounded personal groups, direct player wording and one consistent reversal group. Results and private quotations remain in ignored local files. Automated checks do not establish that every future board will be equally fair. The shared provider-error mapper distinguishes format, authentication, billing, model access and rate limits without exposing raw provider responses. Haiku remains the model, using medium effort and a bounded 12,000-token response so reasoning has space to finish.

Claude still supplies memory selection and categories; deterministic game code handles rules and exact name transformations. Caffeine remains the app deployment and ICP/Motoko scaffold. The private Claude API is separate from Caffeine Inference. No crypto payments are implemented.

Real release checks: see [the sanitized test report](services/claude/REAL_EVAL.md). The final three fresh calls passed on their first paid response; earlier diagnostic failures and sample limitations are documented. Raw stories, quotations and keys remain private.

Played connections are stored per living story only after a group is uncovered in the game, including answers revealed when a round ends. Drafts, examples and incoming friend puzzles do not count. Replays are deduplicated; the latest 80 groups are retained, and up to 40 canonical groups inform Claude's next generation. Three matching underlying terms mark a group familiar, so shuffling, relabeling or reversing the same names doesn't count as a fresh connection. This is a bounded overlap heuristic, not a semantic novelty guarantee.

When all four groups in a new board are familiar, one optional memory question appears without revealing the answers. Skip for now leaves the board playable and mutes that question for the unchanged story, even across reloads. The answer draft autosaves; Add to story & make puzzle appends it to the existing story and makes one explicitly requested generation. Earlier answers are preserved, including when the extra-answer slots are full. No additional model call is used to choose the question, and there are no automatic paid retries. History and optional-question state stay in local autosave and story backups; private cloud also receives them automatically while the story connection is active. Reveals on a friend's separate device are not synchronized.

Story follow-ups now open in a centered native dialog, with the background inert, focus on the answer, and a clear Skip for now action (Escape also skips and returns focus to generation). Speak or type directly there; Add to story & make puzzle preserves prior answers and explicitly requests one generation. No puzzle answers appear in the dialog. When no usable board exists, skipping returns to the saved story rather than fabricating a puzzle.

Claude's existing generation response supplies one short follow-up rooted in a supplied memory when information is missing or a remix is familiar. The same call carries the question; there is no separate question-generation call. A typed needs_story result survives both local HTTP and the authenticated private-window bridge. Broad requests for four new categories or oversized multi-question responses fall back to a short story-based question. Technical/auth/billing failures remain ordinary errors. Follow-up prompts and answers are excluded from friend links.

Personal generation now supports true shared-phrase fill-in-the-blank and missing-first-word/missing-last-word groups, alongside literal associations and reversals. Missing halves use complete two-word names/titles actually supplied. True blanks need four full phrases with the same fixed prefix/suffix; the app never invents phrases to force that format. Balanced/tricky favors missing-word variety over repeated reversals. Minimal full source phrases are answer data in casual share links and played history, so hiding half a name does not count as fresh facts. Raw supporting quotations stay private. Editing tiles resets transformation metadata.

Each provenance-valid personal board gets one independent Haiku whole-board audit before release (up to 4,000 output tokens including thinking, 90-second timeout). It checks competing groupings, disjunctive leftovers, unsupported wording and wordplay at balanced/tricky difficulty. Failed audits block drafts; there are no automatic paid regenerations or retries. Personal generation can therefore use two bounded API calls. Missing-story responses skip the audit; study/thematic behavior stays unchanged. The semantic review assists quality and is not proof of unique grouping or perfect factual interpretation.

Conservative narration checks reject unsupported recurring visits, upbringing and market claims in categories/reveals; unsupported decorative clues get neutral hints. If a model quotation is invalid but its unchanged full source appears exactly once at a word boundary in the story, the app selects a verbatim nearby span. It never invents or rewrites source text. Absent or ambiguous sources remain rejected. Saved memories stay unchanged.

The production game connects once when personal creation opens. The private connection automatically processes requests from exact GAME_ORIGINS addresses, with the existing owner sign-in and origin/source/channel checks. There is no second generation button. The named connection is reused for generation and storage; background saves never open another window. A new device may need one normal sign-in. Older game builds also get automatic one-request handoff and close after receiving the result.

Connected story edits debounce to private cloud without calling Claude. The creator loads cloud before uploading local edits, polls every 20 seconds and refreshes on focus. Older four-answer profiles cannot remove a fifth extra answer: shared browser/server merging preserves missing answers and longer extensions. Cloud acknowledgements return the merged profile. Existing cloud extras also reach an older client's generation request. A new computer selects a saved cloud story instead of uploading an empty placeholder. Disconnection/loading failures leave local copies intact and show unsynced status; browser-only text cannot be recovered remotely until that original browser connects or exports a backup.
## Learning and navigation

Home has three choices: Play now (instant solo puzzle), Create a personal puzzle (shared memories), and Choose a topic (learning). The duplicate puzzle picker and footer brand repetition are removed. Guest puzzle links remain a secondary disclosure; this is independent play, not a live lobby. The six curated subject boards are available under Or play a ready-made puzzle. Reading links appear after a discovery on those boards, not as unexplained setup controls.

Choose a topic accepts subjects beyond the catalog, or notes/transcripts up to 100,000 characters and the request byte limit. Material must support sixteen terms and four relationships; insufficient or unsupported drafts are rejected while the user's input is kept. Overlong pasted text is preserved rather than clipped. Topic generation uses established model knowledge, not live web retrieval. Current/specialist questions may need source material. Both paths validate exact mechanical rules and get an independent full-board audit; audit success is not a guarantee of perfect facts. No automatic paid retries or silent starter fallback. Evidence excerpts stay server-side.

Drafts and played learning connections are saved only in this browser, separately from personal cloud stories. Familiar settings are reduced to one explicit four-mistake/no-hints choice. Responsive layout checks cover 320, 390, 768 and 1440-pixel viewports; these are browser checks, not physical-device certification. Billing, shared accounts, live social lobbies and adaptive performance tracking are future work. The existing beta keeps its owner-private AI service and existing billing behavior.
