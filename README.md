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

The home screen offers **Play now** for an immediate Relaxed board and **Create a personal puzzle** for story-based play. Puzzle selection and Challenge mode sit under **Choose a puzzle or challenge mode**; the header retains **How to play**. The personal creator opens directly on optional story questions, with no required interest selection or four-stage setup wizard. **Puzzle options** holds nicknames, interests, study mode and difficulty; **Saved stories & backups** holds storage tools. Existing saved profiles and answers are preserved. Nicknames and invitation notes stay out of the model request, and study notes remain outside challenge links.

- **Make a challenge** shows the creator the groups and allows editing words, categories, hints, and explanations before sharing.
- **Solve together** hides the groups so both players can discover them. Switching to maker preview reveals them explicitly.
- **Use this puzzle** creates a share link and a portable challenge code. The recipient can open the link, or paste it/code under **Have a challenge from a friend?**.
- The local preview can open codes, but localhost links only work on the same computer. Published Caffeine links use the app's actual domain.
- Results can be copied manually after a personal round. Nothing sends messages to friends automatically.

### Private hosted Claude

Published Caffeine builds now connect to the deployed owner-private Claude service at https://common-thread-claude-service.terrbrutus.chatgpt.site. Press **Make our puzzle**, allow the private window, sign in with the ChatGPT account that owns the service if asked, then press **Make my puzzle** there. The board returns to Common Thread for review and sharing. If sign-in severs the popup connection, return to the game and open it again after signing in. Only the creator needs that sign-in; friends solve the shared puzzle without accessing the AI service. See services/claude/README.md for deployment and budget details.

The API key lives in hosted secret storage. The production frontend carries only the public service URL, never an API key or service bypass credential. The persistent server-side ledger reserves at most $0.10 per UTC day and $4 over the test lifetime, with two attempts per signed-in person per day. Input and output are bounded; failed attempts count, and no automatic retries occur. These are service-specific conservative allowances, not account-wide billing readings.

Four optional story questions now allow **3,000 characters each**, with persistent questions/help, skip/back/review controls and a microphone button where browser SpeechRecognition is available. Dictation appends editable text; the browser may use its own speech provider. No paid transcription API is used. Unsupported browsers show instructions for keyboard dictation. Shared interests allow 2,000 characters, topic 500 and study notes 12,000. Skipped answers and help examples are not treated as personal facts. Story answers and study notes remain outside friend links.

**Paste or speak freely** offers a 12,000-character freeform story alongside the guided answers. Switching input styles preserves both, and both feed generation. **Import a conversation excerpt** accepts pasted sender-labeled text or a bounded `.txt` export. Map two sender labels to names, preview attribution, then explicitly add the excerpt to the saved story. Unrecognized lines remain unchanged for review. This supports excerpts, not full iMessage databases, screenshots, media or automatic date-range extraction. The optional **Your name in the puzzle** and **Other person's name in the puzzle** fields are explicitly passed to Claude for attribution; invitation nicknames still are not. Conversation text can include jokes and plans, so the prompt forbids treating those as confirmed events.

New personal stories default to **Challenge** with **A little twist**. Saved choices are preserved. Play mode controls mistakes/hints; difficulty controls associations and wordplay. Player-facing labels use shared language and explanations address the players directly. The service verifies literal terms, reversed single-word sources and fixed-phrase fill-in-the-blank transformations against internal source quotations. It also rejects mixed date granularities and several report-like phrases. These checks do not prove semantic fairness. This revision passed deterministic checks; another paid live-model check was blocked by the local daily test allowance.

**Our story** (four personal groups) and **Solve together · surprise us** are now the defaults for new stories. The generator inventories the whole story before choosing categories; unrelated interest chips cannot justify filler. Personal terms require supporting source excerpts, and optional mix permits at most one related theme. Titles, descriptions, categories and terms stay hidden in the surprise preview until the player explicitly switches to maker mode. A live regression test with substantial personal context and a deliberately unrelated interest produced four provenance-checked personal groups.

**Your living stories** saves named profiles automatically in this browser. **Save to private cloud** stores them behind the owning ChatGPT account; **Load private cloud stories** restores them on another computer or site origin. Generation saves the current profile before the paid call. Saving/loading stories never uses an AI generation. Local autosave is device/origin-specific, so use cloud save or a downloaded JSON backup before moving devices. Newer saved cloud versions are protected against older uploads. Add suggested or custom follow-up questions from the story review; earlier answers stay intact. Used-term history encourages new combinations from the expanding story. Story records, recovery data, and source quotations are not embedded in puzzle links.

The hosted service has been upgraded independently of the Caffeine frontend. Its new stories table and private recovery seed are deployed; importing GitHub updates the game UI, not the service. Recovery data is held as a private runtime secret and imported only behind the existing owner-private access boundary. No real story text is committed to this repository.

Local development can still call Claude through Vite middleware, using the same prompt/schema/parser. Configure ANTHROPIC_API_KEY only in ignored src/frontend/.env.local, never a VITE_ variable. The local tester keeps its own conservative $0.10/day ledger and accepts loopback same-origin JSON requests only. The prior Motoko Caffeine Inference endpoint remains in the export but is not called by the creator, so the game does not use Caffeine's AI allowance.

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
