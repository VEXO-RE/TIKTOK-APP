# ShopinistaMeta TIKTOK-APP

Organic TikTok integration and social content automation foundation.

## Current scope

- TikTok organic content;
- editorial calendar;
- content preparation;
- future creative automation;
- future scheduling;
- future Tiendanube triggers;
- future WhatsApp attribution;
- MCP foundation.

## Explicitly excluded for now

- TikTok Shop;
- artificial engagement;
- follow/unfollow bots;
- spam;
- bulk messaging;
- automatic campaign spending.

## Setup

1. Install dependencies:

   npm install

2. Copy:

   .env.example
   ->
   .env

3. Start:

   npm run dev

4. Health:

   http://localhost:4100/health

5. Configuration:

   http://localhost:4100/config/status

## Project rule

TikTok implementation must be supported by current official TikTok
documentation.

See:

docs/OFFICIAL-SOURCES.md
docs/PROJECT-VALIDATION.md
docs/PHASES.md

## Desarrollo de las siguientes fases

Guía documental, reglas por sección, pipeline, contratos y repositorios: [docs/development/README.md](docs/development/README.md). No implica implementación ni habilitación de nuevas capacidades. Verificar estructura con node scripts/verify-documentation.mjs.

## Flujo editorial local

Abrir http://localhost:4100/review/editorial.html después de reiniciar el servidor
actualizado. Borrador, preview, aprobación del servidor, envío manual a Inbox y
calendario en memoria. Solo localhost, no producción/multiusuario. Ver
[guía de uso y límites](docs/runbooks/editorial-local.md).

## Editor local integrado

Guía: [edición, música, voz, subtítulos y exportación](docs/runbooks/editor-local.md). Requiere reiniciar el servidor tras actualizar código. Pruebas del proveedor simuladas no certifican publicación real.

## Preparación durante App Review

App TikTok en revisión, confirmado por el usuario el 2026-10-05; pruebas reales pendientes. [Brief y guion sin conectar TikTok](docs/runbooks/brief-local.md), en /review/brief.html. Fuente declarada y revisión humana obligatoria; no generación AI ni autopublicación.

## Campañas orgánicas locales

[Planificación de campañas](docs/runbooks/campaign-local.md) disponible en /review/campaign.html: briefs guardados, fuentes, hipótesis y fechas UTC, sin TikTok ni envíos automáticos. 85/85 tests y QA de escritorio/móvil aprobados; App Review y pruebas reales siguen pendientes.
