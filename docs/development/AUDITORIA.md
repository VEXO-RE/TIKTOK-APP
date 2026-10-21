# Auditoría de partida

Fecha: 2026-10-04. Sin leer .env, secretos ni tokens.

| Sección | Evidencia | Estado |
|---|---|---|
| Base | package.json, src/server.js, core y scripts | Base de desarrollo implementada |
| Login Kit | developer/auth, tokens | Implementado; Sandbox validado por usuario |
| Upload | developer/content | Implementado; publicación manual confirmada |
| Review UI | review-ui/public/index.html | Preview, aprobación local, guard concurrente |
| Calendario | calendar-item.schema.json | Contrato inicial; sin motor persistente |
| Tiendanube/WhatsApp | adapter.js de cada sección | Lanzan not configured |
| MCP | README y readonly.js | Sin servidor/herramientas operativas |
| Business/Shop | README y DISABLED | No configurado/diferido |
| Tests | integración OAuth/upload y smoke | Existen; no se vuelven a certificar en tarea documental |

Dependencias declaradas: dotenv ^16.4.7, express ^5.1.0, multer ^2.4.0. Node >=20. Sin migración de runtime.
verify-project.js comprueba existencia de archivos, no integración.

## Brechas antes de producción

Token store y rutas observados no ofrecen aislamiento tenant/usuario. Bloqueo en UI no es aprobación del servidor ni idempotencia durable.
No hay calendario persistente, autenticación de usuarios de la app, snapshots aprobados, outbox, cola/worker durable ni lease por cuenta.
MIME/tamaño no prueban codec/duración; falta preflight de media y validación real de contratos.

Al inicio había cinco documentos modificados, Review UI, upload.service.js, su test y tres MP4 sin seguimiento.
Conservarlos. No incluir medios en Git sin revisión de derechos/secrets y decisión explícita.
No se copiaron otros proyectos: App_Meta, OpenWA y Tiendanube requieren inspección propia antes de reutilizar código.

## Actualización funcional — 2026-10-05

La tabla anterior conserva la auditoría de partida. Ahora existen revisiones y
snapshots de aprobación en memoria, y calendar.service.js implementa reservas
editoriales con ownership, fechas, zona y conflictos. No hay persistencia,
API/UI editorial ni scheduler activo. Suite completa: 52/52 con smoke local.
Consultar phases/04-editorial.md para el alcance y evidencia de los incrementos.

Actualización posterior 2026-10-05: flujo editorial API/UI local integrado, 62/62
pruebas aprobadas; revisión visual y envío real nuevo pendientes. Consultar
../runbooks/editorial-local.md. No acredita autenticación/persistencia productivas.

## Incremento de edición local — 2026-10-05

Renderer FFmpeg/ffprobe portátil, editor y aprobación del MP4 final implementados. 68/68 tests, cero omitidos; exportación nativa y QA Playwright escritorio/móvil aprobados. TikTok simulado en pruebas de envío. Generación AI, timeline multiclips, micrófono real y publicación real del nuevo MP4 pendientes. Ver ../runbooks/editor-local.md. No se cambian OAuth, .env ni flags; no commit/push.

## Continuidad durante App Review — 2026-10-05

Usuario confirma app en revisión. Pruebas reales pendientes, sin cambio de flags. Brief local independiente de conexión implementado: datos declarados, procedencia, copy/narración/tomas y export JSON; plantilla determinista, no AI. 74/74 tests. Ver ../runbooks/brief-local.md.

## Biblioteca de briefs — 2026-10-05

Persistencia local de veinte briefs e importación JSON implementadas en brief-library.mjs y pantalla brief.html. Recuperación requiere confirmar hechos otra vez; no recuperación de aprobación, cuenta ni envío. Diez pruebas del módulo aprobadas. Es localStorage, no DB productiva ni scheduler. Ver ../runbooks/brief-local.md.

## Campañas locales — 2026-10-05

Planificación orgánica sin token integrada con biblioteca de briefs: snapshots, estrategia/hipótesis/fuentes, calendario UTC y descarga. Estados draft/not_measured/not_verified, revisión humana pendiente. localStorage, no servicio productivo/scheduler/analítica. 85/85 pruebas y recorrido Playwright escritorio/móvil aprobados con datos sintéticos. Ver ../runbooks/campaign-local.md.
