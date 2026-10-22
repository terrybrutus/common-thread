# Account release

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

Daily play uses 365 distinct combinations of reviewed catalog groups, with a UTC daily date and recent-date archive. Groups repeat across combinations; this is not 365 manually authored boards. AI facts and grouping still need beta quality review.

The service receives content needed for requested generation and sends it to Anthropic. Account data stays until deleted; a minimal account-ID deletion marker prevents stale devices restoring it. Hosting/identity/AI providers may have separate logs, backups and international processing. Browser dictation may use a remote speech service. Sharing a challenge link intentionally shares that puzzle’s answers, not the full story.

The in-app privacy notice provides purposes, provider categories, deletion/export, optional contact consent and Terry’s portfolio contact. It is not a legal compliance certification. Operator access to storage is not end-to-end encryption. Jurisdiction-specific retention, processor terms, legal basis and rights handling should be reviewed before a broader commercial release.

Automated tests cover storage isolation, consent withdrawal, deletion, invalid authentication and account switches. Compilation and stable-upgrade checks do not replace the real two-account published sign-in tests above.
