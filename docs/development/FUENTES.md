# Registro de fuentes

Consultadas el 2026-10-04. Fuentes de TikTok oficiales definen comportamiento; repos primarios definen bibliotecas. La arquitectura/orden/policies de esta guía son decisiones locales propuestas.

| Fuente | Qué sustenta |
|---|---|
| [Upload](https://developers.tiktok.com/docs/en/content-posting-api-reference-upload-video) | Flujo Inbox, source_info, transferencia |
| [Status](https://developers.tiktok.com/docs/en/content-posting-api-reference-get-video-status) | Estados, polling/webhooks y relación publicación |
| [Sharing guidelines](https://developers.tiktok.com/docs/en/content-sharing-guidelines) | Distinguir UX Direct Post, transferencia y branding añadido por integraciones |
| [Display](https://developers.tiktok.com/docs/en/display-api-overview) | API/permisos de perfiles y videos; no concedidos aquí |
| [App Review](https://developers.tiktok.com/docs/en/app-review-guidelines) | Demostración/portal y restricciones de producto |
| [Business SDK](https://github.com/tiktok/tiktok-business-api-sdk) | Familia Business, no Developers Upload |
| [Nuvemshop actual](https://nuvemshop.dev/api/getting-started) | Entrada oficial API Tiendanube/Nuvemshop |
| [MCP SDK](https://github.com/modelcontextprotocol/typescript-sdk) | SDK de servidores/clientes |
| [BullMQ connections](https://docs.bullmq.io/guide/connections) | Requisitos de conexiones del modo documentado |
| [Remotion license](https://www.remotion.dev/docs/license) | Revisar condiciones antes de adopción |
| [Catálogo primario](REPOSITORIOS.md) | 22 repos y papel específico |

## Procedencia local

docs/PHASES.md, ARCHITECTURE.md, SECURITY.md, PROJECT-VALIDATION.md, SCOPES.md, OFFICIAL-SOURCES.md;
package.json; token.store; rutas servidor/review; calendar schema; stubs integraciones; mcp policy.
Evidencia Sandbox del usuario ya registrada en documentación. Estado del portal no se leyó en vivo.

## Regla de consulta

Antes de implementar nuevas llamadas leer endpoint/schema/scopes/error/limit actual; registrar URL, fecha, capability y autorización separadas.
Si falta evidencia: especificar pendiente/TODO y bloquear esa operación; no fabricar documentación.
Un enlace que falla no se convierte en fuente verificada. Lo consultado no garantiza mantenimiento futuro ni licencia de una versión sin revisar.
