# Project Phases

## Phase 0 — Foundation

- repository;
- Node/Express;
- configuration;
- feature flags;
- logging;
- error handling;
- smoke tests;
- documentation.

## Phase 1 — TikTok Developer App

- app registration;
- website;
- verified domain;
- Login Kit: sandbox/configured;
- minimal scope: `user.info.basic` configured;
- redirect URI: configured in Sandbox;
- OAuth Web implementation: complete locally;
- real end-to-end OAuth validation: complete in Sandbox.

## Phase 2 — Content Posting Upload

- Content Posting product: Sandbox;
- scope: `video.upload`;
- local `FILE_UPLOAD` draft flow: implemented;
- publish status polling: implemented;
- minimal Review UI: implemented;
- user completion through TikTok Inbox: documented;
- real transfer result: successful; TikTok status `SEND_TO_USER_INBOX`;
- previous transfer attempt: TikTok HTTP 500 x3; historical evidence;
- Inbox confirmation: receipt manually confirmed by the user;
- final publication: manually confirmed by the user;
- semiautomatic upload through final publication: validated end-to-end; see `PROJECT-VALIDATION.md`;
- App Review: in review (user-confirmed 2026-10-05); real tests deferred;
- Direct Post and `video.publish`: disabled and not implemented.

## Phase 3 — Direct Post

Deferred. No `video.publish` implementation or scope request.

## Phase 4 — Editorial Engine

- first increment implemented locally: immutable in-memory revisions and tenant ownership;
- states implemented: `draft`, `review`, `approved`;
- server-side approval bound to actor, timestamp, content hash, asset hash, target account and `draft_upload` scope;
- editing approved content creates a new unapproved draft revision;
- automated tests cover validation, ownership, immutability, stale revisions and approval invalidation;
- durable persistence, exposed CRUD, calendar, launches, important dates and product triggers: pending;
- Phase 4 acceptance gate: not complete.

## Phase 5 — Creative Agents

- creative rules;
- scripts;
- shot lists;
- captions;
- image briefs;
- video briefs;
- brand validation.

## Phase 6 — Scheduling

- approved content;
- platform capability checks;
- scheduled execution;
- retry policy;
- audit log.

## Phase 7 — Tiendanube

- catalog adapter;
- product changes;
- launches;
- landing/category references;
- conversion destinations.

## Phase 8 — WhatsApp

- contact destinations;
- campaign attribution;
- controlled CTA integration.

## Phase 9 — MCP

Read-only first.

No tool is exposed without a working provider implementation.

## Phase 10 — Other Networks

Extract the shared:

- content engine;
- creative engine;
- calendar;
- scheduling;
- policy engine.

Add network-specific adapters.

## Deferred

TikTok Shop.

## Guía documental de desarrollo

La preparación documental de las siguientes fases se describe en [development/README.md](development/README.md) y [development/FASES.md](development/FASES.md). Mantiene la numeración 0–10 y los gates de cada fase. El cierre de Sandbox no equivale a aprobación de App Review o producción; los módulos nuevos siguen pendientes de implementación.
