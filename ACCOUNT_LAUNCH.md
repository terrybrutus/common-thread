# Account release

Normal story saving/loading uses the signed-in Google-linked game account only; signed-out requests never fall back to ChatGPT/Sites login. Local preview stories remain device-only. Saved stories & backups provides paired Download story (.json) and Import story (.json) buttons for manual transfer or recovery. The legacy native login is reserved for the explicit original-owner beta restore/visitor tools, not ordinary saving. Automated storage tests cover account save/load without popups, valid backup import and remount persistence, and invalid-file preservation.

## Personal story contexts (2026-10-23)

Personal creation now supports My life, Someone I know, and A group. The selected storyScope is saved in backups/cloud records and passed to both Claude generation and the independent audit. Existing stories keep their answers, original generation-question context and play preferences; new stories start with hints and no guess limit. Optional subject/group labels are not a two-person membership list. Solo requests exclude stale recipient names. Play now opens the board directly; Share puzzle creates the optional link/code. Learning keeps its separate entry point, and connected story tools no longer show duplicate manual cloud-save buttons.

Validation: 99 frontend tests passed, with the changed question/persistence/context tests rerun after final copy edits; 58 service tests passed. Three real Claude generations using fictional solo, coworker and four-friend stories each returned four personal groups and passed the independent audit. The coworker's dogs, solo trip and favorites remained attributed to that coworker; no couple was invented. These deliberately clear fixtures test context handling, not challenging wordplay or arbitrary-story success rates. The local 375px layout had no horizontal overflow. Production build and TypeScript checks passed. Service version 20 deploys independently; import the matching game revision into Caffeine to expose the new choices.

Import this GitHub revision into Caffeine, including the new Motoko migration and generated frontend. Do not import only the frontend: openServiceSession, checkServiceSession and closeServiceSession must exist in the deployed canister. Keep the current published Caffeine address; a different address may produce a different Internet Identity principal and requires explicit service-origin/backend configuration. The AI service is deployed independently from Caffeine.

## Before LinkedIn

1. Import and publish through Caffeine. Open the published site, use Google sign-in, create a test story and learning topic, reload, and confirm they return. Repeat on another device using the same Google identity.
2. Sign out and sign in with a second real account. Confirm no first-account story, topic, history or draft appears. Save a separate story using the same title and verify both remain separate. Test signed-out daily play.
3. Connect two learning topics using “Use this topic with my other learning topics.” Check both switches are required. Confirm personal memories never appear in learning requests. Disable one switch on another device and verify subsequent requests exclude it.
4. Export and delete a disposable account’s data. Confirm other accounts remain intact; an older device must show deletion/reset handling rather than uploading its old cache. Start fresh and verify the new account is empty.
5. Check optional email is off initially, visible only to the owner after an explicit save, and disappears on withdrawal/deletion. This is user-supplied contact information, not Google-verified identity or marketing consent. Anonymous visitors do not have an email list.

## Private beta stories

Older unscoped browser backups are preserved and never automatically attached to a signed-in account. On the original browser, My account → Export, restore or delete my data → Restore my private-beta stories requires the original native Sites owner account. It can merge old browser-only answers with the owner’s existing cloud story. Text that exists only on another computer still needs that computer to restore/export it.

## Architecture and privacy limits

Google authentication is provided by Internet Identity with no automatic email attributes. The Motoko canister stores capability hashes/principals/expiry; the browser stores raw capabilities only in memory. The service uses the official IC agent with query-signature verification and a fixed server-configured canister. D1 stories/topics are owner-scoped. Both learning topics must opt in; personal stories never join learning context. Ordinary saves cannot re-enable a topic’s consent.

Daily play uses 365 distinct combinations of reviewed catalog groups, with the player’s local daily date and recent-date archive. Groups repeat across combinations; this is not 365 manually authored boards. AI facts and grouping still need beta quality review.

The service receives content needed for requested generation and sends it to Anthropic. Account data stays until deleted; a minimal account-ID deletion marker prevents stale devices restoring it. Hosting/identity/AI providers may have separate logs, backups and international processing. Browser dictation may use a remote speech service. Sharing a challenge link intentionally shares that puzzle’s answers, not the full story.

The in-app privacy notice provides purposes, provider categories, deletion/export, optional contact consent and Terry’s portfolio contact. It is not a legal compliance certification. Operator access to storage is not end-to-end encryption. Jurisdiction-specific retention, processor terms, legal basis and rights handling should be reviewed before a broader commercial release.

Automated tests cover storage isolation, consent withdrawal, deletion, invalid authentication and account switches. Compilation and stable-upgrade checks do not replace the real two-account published sign-in tests above.

## Login branding

One-click Google sign-in uses the built-in provider configuration and does not require an app-owned OAuth client ID. Keep `login({ provider: "google" })` in both the account menu and reusable sign-in component so neither opens the generic authentication-method chooser. Microsoft is also supported by the SDK, but is not currently offered in Common Thread. Internet Identity still signs the session; its domain can appear during the provider callback.

Live check on 2026-10-23: the awakened draft opened Google directly, returned an authenticated identity and successfully opened My account after updating the service's fixed `ICP_BACKEND_CANISTER_ID` to the canister advertised by that draft's public env.json. A sleeping draft may be reassigned a canister; verify the actual deployment before updating this value. Never accept an arbitrary browser-supplied backend ID. This check does not replace the two-account and cross-device tests above, or verify the new branding metadata before import.

The current Google button still uses Internet Identity. App metadata at /.well-known/ii-app-metadata supplies Common Thread’s own name and raster logo. Verify its JSON Content-Type and public CORS header, and the logo’s public CORS header, after Caffeine import; header recipes for both supported ICP asset formats are included, but Caffeine’s uploader must actually apply them. The provider intentionally still displays the verified app origin. This does not replace Internet Identity or prove the flow is free of provider branding.

A custom domain must be configured in Caffeine for the live app. Keep the existing identity derivation origin until an explicit account-preserving domain migration is planned. Update exact service origins/backend configuration for the actual published app; do not guess expired draft addresses. Direct Google OAuth additionally needs the owner’s configured web client ID and approved domains/origins, server-side token verification and a verified migration path for existing account IDs. Do not relabel the old flow as direct Google OAuth or remove provider disclosures while it still uses Internet Identity.

Link-preview images and favicons use Common Thread assets. The share image URL is origin-relative so it never points to an expired Caffeine draft; check actual link-preview rendering after the final domain is known. Production bundles are minified with source maps disabled. This reduces readable source delivery, but cannot hide frontend code, hosting fingerprints or previously published repository copies. A private GitHub repository can still be imported by Caffeine when its GitHub App has access and the account has the required paid plan.
