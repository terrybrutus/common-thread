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

Choose **Create a personal puzzle** (or **Make something for a friend**) and answer four short questions: who is playing, shared interests, fun/study context, and difficulty/familiarity. Nicknames and personal invitation notes stay out of the AI request. Study notes are sent only for study generation and are never put into a challenge link.

- **Make a challenge** shows the creator the groups and allows editing words, categories, hints, and explanations before sharing.
- **Solve together** hides the groups so both players can discover them. Switching to maker preview reveals them explicitly.
- **Use this puzzle** creates a share link and a portable challenge code. The recipient can open the link, or paste it/code under **Have a challenge from a friend?**.
- The local preview can open codes, but localhost links only work on the same computer. Published Caffeine links use the app's actual domain.
- Results can be copied manually after a personal round. Nothing sends messages to friends automatically.

AI generation uses `caffeineai-inference-client` in Motoko, `Config.fromEnv<system>()` per request, and model `router`. No browser API key, key settings, or external frontend AI service is used. The backend caps request sizes, output tokens, and response length and has a transient app-wide 20-second generation cooldown. It persists no generated puzzle data and adds no stable schema fields.

The local development frontend has no deployed backend configuration. **Explore the creator with an example puzzle** is an explicit, labeled demonstration; a failed AI call never falls back to an example. Real generation needs the backend running in the Caffeine platform. Compile checks and mocked frontend tests do not verify live inference credentials or output quality; smoke-test generation after importing into Caffeine.

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
