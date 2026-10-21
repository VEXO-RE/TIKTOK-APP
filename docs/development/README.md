# Guía de desarrollo de ShopinistaMeta

Revisión: 2026-10-04. Alcance documental: todas las fases listadas en docs/PHASES.md.

Login Kit y Upload Sandbox existen; usuario confirmó Inbox y publicación manual. HTTP 500 x3 es histórico. Direct Post permanece diferido. App Review en revisión, confirmado por el usuario el 2026-10-05; aprobación no confirmada y pruebas reales pendientes.

El proyecto contiene Express/ESM, OAuth, token store en memoria, transferencia, Review UI y tests. Calendario: servicio en memoria con reservas y API/UI local; persistencia y auth productiva pendientes. Flujo local: [runbook editorial](../runbooks/editorial-local.md). Tiendanube/WhatsApp: adaptadores no configurados. MCP: política sin servidor operativo. Business/Shop: documentos, no integración.

## Navegación

| Decisión | Documento |
|---|---|
| Inventario real | [AUDITORIA.md](AUDITORIA.md) |
| Fases y gates | [FASES.md](FASES.md) y [BACKLOG.md](BACKLOG.md) |
| Arquitectura y decisiones | [ARQUITECTURA.md](ARQUITECTURA.md) y [ADR.md](ADR.md) |
| Reglas exigibles | [REGLAS.md](REGLAS.md) |
| Pipeline y pruebas | [PIPELINE.md](PIPELINE.md) y [VALIDACION.md](VALIDACION.md) |
| Contratos y estados | [CONTRATOS.md](CONTRATOS.md) |
| Diseño y accesibilidad | [DISENO.md](DISENO.md) |
| Imagen/audio/video | [MEDIA.md](MEDIA.md) |
| Agentes creativos | [AGENTES-CREATIVOS.md](AGENTES-CREATIVOS.md) |
| Marketing, embudos, campañas | [MARKETING.md](MARKETING.md) |
| Preparación sin TikTok | [Briefs](../runbooks/brief-local.md), [campañas locales](../runbooks/campaign-local.md) |
| Seguridad/operación | [OPERACION.md](OPERACION.md) |
| TikTok y fuentes | [CAPACIDADES-TIKTOK.md](CAPACIDADES-TIKTOK.md), [FUENTES.md](FUENTES.md) |
| GitHub y herramientas | [REPOSITORIOS.md](REPOSITORIOS.md), [SKILLS-PLUGINS.md](SKILLS-PLUGINS.md) |
| Carpetas y archivos futuros | [ESTRUCTURA.md](ESTRUCTURA.md) y structure.json |

## Uso y siguiente incremento

Las carpetas de módulos tienen AGENTS.md y DEVELOPMENT.md con reglas, contratos, entregables y gates. No se generan endpoints vacíos ni servicios con éxitos simulados.
Los archivos de negocio futuros se crean con implementación y pruebas de su fase; no es posible dejar un producto completo solo mediante documentación.

Desde raíz: node scripts/verify-documentation.mjs. Verifica estructura, contratos y enlaces, sin red ni gasto. No certifica backend.
Empezar fase 4 con revisión versionada, identidad/ownership y aprobación del servidor. Después fase 5 con fuentes y activos reales.
No activar scheduler hasta tener persistencia e idempotencia; no cambiar Direct Post para avanzar en editorial/media.
