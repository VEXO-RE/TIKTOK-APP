# Security

## Secrets

Never commit:

- client secrets;
- access tokens;
- refresh tokens;
- authorization codes;
- provider signing secrets.

## OAuth

OAuth state must be cryptographically generated and validated.

Redirect URIs must be explicitly registered.

## Logs

Never log credentials or tokens.

Never log the complete TikTok `upload_url`; it can contain sensitive query
parameters.

## Development token storage

The Sandbox OAuth access token is held only in process memory. It is never
written to JSON, plaintext files, Git, responses, or logs. It expires according
to TikTok's `expires_in` response and is lost whenever the Node process restarts.

Production requires encrypted persistent storage and a separately reviewed
refresh strategy. Automatic refresh is not implemented in this phase.

## Development media upload

- Multipart input accepts one `video` field only.
- The file is held in memory and is never resolved from a client-provided path.
- Accepted transfer MIME types are `video/mp4`, `video/quicktime`, and
  `video/webm`.
- The initial implementation is limited to one chunk of at most 64 MiB.
- TikTok performs the authoritative codec, duration, frame-rate, and dimension
  validation after transfer.

## MCP

MCP_READONLY=true by default.

## Automation

Automatic publication is disabled by default.

AUTOMATION_AUTO_PUBLISH=false

Content must pass:

- brand rules;
- platform rules;
- approval policy;
- provider capability validation.
