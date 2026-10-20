# Private Common Thread Claude service

Live owner-private service: https://common-thread-claude-service.terrbrutus.chatgpt.site

This directory mirrors the Worker source and D1 schema of the separately deployed Sites service. Importing the main game into Caffeine does not rebuild this service. The service has already been deployed independently; the frontend connects to it through `creator/hosted.ts`.

The game opens a top-level private window; sign in with the owning ChatGPT account if asked. Press **Make my puzzle** in that window to send the brief to Anthropic. A nonce plus exact origin and source-window checks bind the exchange. Personal facts are not placed in URLs. The service allows only same-origin POST requests carrying the Sites-authenticated identity header. It provides no anonymous generation API or browser API key. Only the owner can currently generate; recipients can play a shared puzzle in Caffeine without signing into this service.

The API key is configured as a Sites runtime secret, not in source. No service-access bypass credential is shipped. The D1 `generations` table stores only random request IDs, dates, user IDs and timestamps. A single conditional SQL INSERT reserves a cent before every attempted model call; it atomically caps two calls/person/UTC day, ten calls/UTC day, and 400 lifetime calls. A global 20-second cooldown also applies. Failed or interrupted calls still count, preventing uncertain charges from reopening the allowance. Maximum input is 64 KB and output is 4,000 tokens. At verified short-context Haiku 5.5 prices ($0.10/M input, $0.50/M output), the one-cent reservation is conservative. This bounds this service, not unrelated spending elsewhere on the Anthropic account. No automatic retries or repair calls.

The Worker uses structured JSON output and validates all four groups, 16 unique terms, and field lengths before returning. Personal mix explicitly permits themed general-knowledge groups while forbidding invented memories. Memories-only asks a concrete missing-information question if necessary. Structural checks cannot guarantee semantic fairness; creators still review drafts.

Budget/parser checks (Node 24): `node --test services/claude/worker/index.test.js` from the game repository. Hosted migrations are generated with Drizzle and applied by Sites during deployment. Do not recreate the budget table or reset its rows to bypass limits. Later schema changes need new migrations.
