# Project Guidance

## User Preferences

- Keep the code clean, minimal, and ready to export to GitHub for continued development in Codex.
- No elaborate styling.

## Accepted Requirements

The initial scaffold requirements below describe the export baseline. The user has now authorized the first playable milestone: a two-step beginner introduction, Relaxed mode with unlimited guesses and graduated hints, and solo Challenge mode with four mistakes and no hints. Use original local puzzles, explanations, accessible controls, and mobile layouts. AI generation, multiplayer, and saved vocabulary are later milestones. Keep the existing Caffeine backend/configuration intact while the initial solo rules run locally in the frontend.

- Minimal valid Motoko backend.
- Single page displaying the project name "Common Thread".
- Standard Caffeine configuration, dependencies, and build setup for run and deploy.
- No features, authentication, sample data, extra pages, or elaborate styling.

## Verified Commands

- **typecheck**: `pnpm typecheck`
- **fix**: `pnpm fix`
- **build**: `pnpm build`

## Learnings

- Solo gameplay uses local puzzle data and a pure reducer; it does not depend on backend queries or sign-in. Keep the initial route usable without configured canister IDs.
- Empty OQL entity list in src/backend/main.mo is correct when the actor persists no state; no entity, sample or selector rows are required.
- main.tsx provides QueryClientProvider. InternetIdentityProvider is intentionally not mounted for anonymous solo play: the exported placeholder canister IDs otherwise cause configuration errors locally. Reintroduce it when adding actual authentication/backend features.
- index.html ships social meta tags that must never be removed; keep og:title identical to the title and og:description identical to the description.
