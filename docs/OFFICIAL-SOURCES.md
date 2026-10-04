# Official Sources

Rule:

Only official TikTok properties may define TikTok behavior implemented
by this project.

## TikTok for Developers

Login Kit Web
https://developers.tiktok.com/docs/en/login-kit-web

Login Kit Overview
https://developers.tiktok.com/docs/en/login-kit-overview

User Access Token Management
https://developers.tiktok.com/docs/en/oauth-user-access-token-management

Verified: 2026-10-04

- Feature: Login Kit OAuth Web.
- Scope: `user.info.basic`.
- Authorization endpoint: `https://www.tiktok.com/v2/auth/authorize/`.
- Token endpoint: `POST https://open.tiktokapis.com/v2/oauth/token/`.
- Token request content type: `application/x-www-form-urlencoded`.
- Implementation: `src/tiktok/developer/auth/`.
- Status: sandbox/configured; OAuth validated end-to-end.

Content Posting API - Upload
https://developers.tiktok.com/docs/en/content-posting-api-reference-upload-video

Content Posting - Get Started Upload
https://developers.tiktok.com/docs/en/content-posting-api-get-started-upload-content

Content Posting API - Media Transfer Guide
https://developers.tiktok.com/docs/en/content-posting-api-media-transfer-guide

Content Posting API - Get Post Status
https://developers.tiktok.com/docs/en/content-posting-api-reference-get-video-status

Verified: 2026-10-04

- Feature: upload a video draft with `source=FILE_UPLOAD`.
- Scope: `video.upload` only; `video.publish` is not requested.
- Initialize: `POST https://open.tiktokapis.com/v2/post/publish/inbox/video/init/`.
- Transfer: `PUT` to the complete TikTok-provided `upload_url`.
- Status: `POST https://open.tiktokapis.com/v2/post/publish/status/fetch/`.
- Implementation: `src/tiktok/developer/content/`.
- Environment: Sandbox.
- Implementation status: implemented.
- Operational status: pending a real video upload.

App Review Guidelines
https://developers.tiktok.com/docs/en/app-review-guidelines

Developer Guidelines
https://developers.tiktok.com/docs/en/our-guidelines-developer-guidelines

## Official TikTok GitHub

Organization
https://github.com/tiktok

Business API SDK
https://github.com/tiktok/tiktok-business-api-sdk

## TikTok Shop

Not implemented.

Documentation review will be performed in its own future phase.

## ShopinistaMeta public URLs

Website:
https://shopinistameta.com/

Privacy — ShopinistApp:
https://shopinistameta.com/politica-de-privacidad-shopinistapp/

Privacy:
https://shopinistameta.com/politica-de-privacidad/

Terms:
https://shopinistameta.com/terminos-y-condiciones/

Data deletion:
https://shopinistameta.com/eliminacion-de-datos/

## Verification rule

For every TikTok implementation add:

- official source;
- verification date;
- feature;
- confirmed behavior;
- scope if applicable;
- implementation file;
- status.

Never treat memory or previous project code as authoritative TikTok
documentation.
