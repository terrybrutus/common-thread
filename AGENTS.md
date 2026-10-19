# Project Guidance

## User Preferences

- Keep the code clean, minimal, and ready to export to GitHub for continued development in Codex.
- No elaborate styling.

## Accepted Requirements

- Minimal valid Motoko backend.
- Single page displaying the project name "Common Thread".
- Standard Caffeine configuration, dependencies, and build setup for run and deploy.
- No features, authentication, sample data, extra pages, or elaborate styling.

## Verified Commands

- **typecheck**: `pnpm typecheck`
- **fix**: `pnpm fix`
- **build**: `pnpm build`

## Learnings

- Minimal scaffold: App.tsx renders static JSX with no query reads, so the default route cannot blank on first render.
- Empty OQL entity list in src/backend/main.mo is correct when the actor persists no state; no entity, sample or selector rows are required.
- main.tsx already provides QueryClientProvider and InternetIdentityProvider; a minimal page needs no provider changes.
- index.html ships social meta tags that must never be removed; keep og:title identical to the title and og:description identical to the description.
