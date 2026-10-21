# PROJECT VALIDATION

## Confirmed project direction

ShopinistaMeta wants legitimate organic social automation.

No bots.

No artificial follower growth.

No artificial engagement.

Automation is intended for:

- new Tiendanube products;
- product launches;
- editorial campaigns;
- important calendar dates;
- creative production;
- video production;
- caption preparation;
- scheduling;
- approved publication;
- performance analysis.

## Current platform

TikTok.

## Login Kit validation

- Product: Login Kit.
- Scope: `user.info.basic`.
- Environment: Sandbox.
- Configuration status: configured.
- Implementation status: OAuth Web flow implemented.
- Operational status: validated end-to-end.
- Authorization: successful.
- Callback: successful.
- Authorization code exchange: successful.
- Connected provider: TikTok.
- App Review: in review; user-confirmed 2026-10-05. Approval not asserted.

## Content Posting validation

- Product: Content Posting API — Upload.
- Scope: `video.upload`.
- Environment: Sandbox.
- Transfer method: `FILE_UPLOAD`.
- Implementation status: implemented.
- OAuth: validated.
- initialization: successful.
- upload_url: received.
- binary PUT: correctly constructed.
- retry for 5xx: validated.
- real transfer result: successful.
- publishId: `v_inbox_file~v2.7692763310013614101`.
- TikTok status: `SEND_TO_USER_INBOX`.
- Previous attempt: TikTok HTTP 500 x3; retained as historical evidence.
- Inbox confirmation: achieved; receipt manually confirmed by the user.
- Final publication inside TikTok: manually confirmed by the user.
- Operational status: semiautomatic upload through final publication validated end-to-end.
- Evidence: TikTok status response, manual Inbox confirmation, and final publication confirmation supplied by the user in this conversation (2026-10-04).
- User action: open the TikTok Inbox notification, review/edit, and publish.
- Direct Post and `video.publish`: disabled and not implemented.
- App Review: in review; user-confirmed 2026-10-05. Real provider tests deferred.
- Production approval: not asserted.

## Future platforms

The creative engine and publishing scheduler should become a reusable
multi-network component.

## Editor export incident — 2026-10-09

- Server response reported by the user: `POST /api/editorial/drafts/:id/render` rejected with `MEDIA_RECIPE_INVALID` and “Indica derechos propios o licencia y su referencia.”
- Manual confirmation reported by the user: the rights type and reference controls had been completed. This is user evidence, not a captured request payload.
- Code finding: `editorNumbers` and `editorStrings` did not overwrite `rights`; the render route passed `req.body.recipe` unchanged. Applying a saved preset did reload a recipe that intentionally excludes rights and cleared the live rights reference.
- Correction implemented: presets preserve the live rights controls, export validates those controls before the request, and a rejection replaces “Exportando MP4…” in `ed-result` while the common `finally` restores controls.
- Local verification executed: 18/18 targeted tests passed, including two UI regressions, editorial routes and the native FFmpeg renderer; `git diff --check` passed with line-ending warnings only.
- Not verified: live browser inspection failed because the browser-control process exited unexpectedly twice. No new TikTok upload, Inbox receipt or manual publication was performed for this incident.
- Approval invariant retained: a successful export creates a new revision and requires explicit approval of the resulting bytes before Inbox upload.

## Local session lifecycle increment — 2026-10-09

- Implemented: reusable in-memory session lifecycle for the local editorial router, including isolated contexts, account-reference rotation, expiry pruning and capacity enforcement.
- Server-side boundary: tenant and actor continue to be derived internally; HTTP input cannot select them.
- Local verification executed: 2/2 identity tests, 16/16 editor/router tests and 2/2 native renderer tests passed. Documentation verification passed for 82 files, 11 phase guides, 18 scoped modules and 22 primary repositories.
- Pending: productive authentication, roles, durable sessions and per-account TikTok connection storage. The current global in-memory token store remains unchanged, so multi-user/account isolation is not asserted.

## User-reported full-suite result — 2026-10-09

- The user reports executing the complete suite on 2026-10-09: 89/89 tests passed, zero failures and zero skipped tests.
- This is manual evidence supplied by the user. It was not a new suite execution performed or independently captured by Codex in this increment.
- Productive identity remains open: application authentication, roles and TikTok connections isolated per account are still pending.

## Later user-reported full-suite result — 2026-10-09

- The user subsequently reports executing the complete suite with the archive increment present: 91/91 tests passed, zero failures and zero skipped tests.
- The earlier 89/89 result remains historical evidence. Neither count is presented as a new execution by Codex.
- Productive identity and persistence remain open.

## Versioned archive increment — 2026-10-09

- Implemented: server-side `approved -> archived` transition with tenant ownership, expected-revision conflict protection and an immutable new revision that retains the approval snapshot.
- Local API/UI prevents archived content from being edited, rendered, planned or sent. This is archival state, not data deletion or durable retention.
- Verification executed by Codex: JavaScript syntax checks passed and 30/30 directed tests passed with zero failures or skips. Tests used synthetic identities and provider behavior; no TikTok request or new visual inspection occurred.
- Pending: JSON Schema runtime adoption, productive CRUD, authentication/roles, per-account TikTok connections and durable persistence/audit.

## ContentRevision runtime contract — 2026-10-09

- Decision: exact `ajv@8.20.0` plus `ajv-formats@3.0.1`, MIT-licensed, for the existing Draft 2020-12 ContentRevision schema and its `date-time` format. No coercion/default/removal options are enabled.
- Implemented: revision snapshots are schema-validated before append and after repository reads. Business services still enforce tenant ownership, expected revision, account/content/asset hashes, approval and archived-state restrictions.
- Verification executed by Codex: package installation audited 84 packages with zero vulnerabilities reported; production audit reported zero; syntax checks and 33/33 directed tests passed. The full integration directory then passed 90/90 with zero failures/skips, including native rendering and simulated TikTok behavior; it did not include smoke or a real provider call.
- Scope limitation: other schemas remain documentary; identity, productive CRUD and durable persistence/audit remain pending. No TikTok request or server restart occurred.

## TikTok Shop

Deferred.

Infrastructure placeholder only.

## Existing projects to inspect later

### App_Meta

Possible reusable patterns:

- Express / ESM service organization;
- environment management;
- health endpoint;
- persistence;
- smoke tests.

No code should be copied until the actual repository is inspected.

### OpenWA

Possible reusable patterns:

- MCP tool descriptors;
- read/write policies;
- readonly default;
- webhook reliability concepts;
- idempotency patterns.

No provider-specific WhatsApp behavior should be copied blindly.

### Tiendanube projects

Potential real integration source for:

- products;
- categories;
- product URLs;
- prices;
- inventory;
- launches;
- catalog changes.

Existing Tiendanube integration must be inspected before duplication.

## Non-negotiable rule

NO INVENTAR.

NO ALUCINAR.

NO INFERIR:

- endpoints;
- scopes;
- permissions;
- API fields;
- provider behavior;
- rate limits;
- approval state.

If official documentation does not support it:

DO NOT IMPLEMENT IT.

Create a TODO and record the missing evidence.
