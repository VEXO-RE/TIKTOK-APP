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
- App Review: not submitted / not asserted as approved.

## Content Posting validation

- Product: Content Posting API — Upload.
- Scope: `video.upload`.
- Environment: Sandbox.
- Transfer method: `FILE_UPLOAD`.
- Implementation status: implemented.
- Operational status: pending a real upload and Inbox confirmation.
- User action: open the TikTok Inbox notification, review/edit, and publish.
- Direct Post and `video.publish`: disabled and not implemented.
- App Review and Production approval: not asserted.

## Future platforms

The creative engine and publishing scheduler should become a reusable
multi-network component.

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
