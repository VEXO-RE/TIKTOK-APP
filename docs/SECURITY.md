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
