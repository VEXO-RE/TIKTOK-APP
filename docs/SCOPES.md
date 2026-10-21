# TikTok Scopes Registry

Do not add a scope here until it has been verified against current
official TikTok documentation.

| Scope | Product | Purpose | Status | Official source |
|---|---|---|---|---|
| user.info.basic | Login Kit | Basic TikTok user identity authorized by the user | sandbox/configured | TikTok Login Kit Overview and Web docs |
| video.upload | Content Posting API | Upload a draft for user completion in TikTok | sandbox/configured; OAuth validated; real transfer successful; SEND_TO_USER_INBOX; Inbox receipt and final publication confirmed by user; semiautomatic flow validated end-to-end (see PROJECT-VALIDATION.md) | TikTok Content Posting Upload docs |
| video.publish | Content Posting API | Direct Post | disabled; not-requested; not-implemented | TikTok Content Posting docs |

Statuses:

- not-configured
- requested
- approved
- rejected
- deprecated
- sandbox/configured
- not-requested
