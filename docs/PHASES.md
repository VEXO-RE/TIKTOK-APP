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
- real upload validation: pending;
- Direct Post and `video.publish`: not implemented.

## Phase 3 — Direct Post

Deferred. No `video.publish` implementation or scope request.

## Phase 4 — Editorial Engine

- calendar;
- launches;
- important dates;
- product triggers;
- content briefs;
- approval workflow.

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
