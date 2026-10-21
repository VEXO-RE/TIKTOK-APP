# Fase 4 — Editorial Engine

Estado: Revisiones, aprobación, calendario y flujo API/UI local implementados; gate productivo pendiente.

## Entrada

Dependencias: Identity/ownership y ADR persistencia/contratos.
Insumos: Fuentes/snapshots, objetivo, calendario UTC/zona y reglas de marca.

## Primer incremento implementado

El corte inicial incorpora un repositorio de desarrollo en memoria, revisiones
inmutables, ownership derivado de la identidad autenticada y transiciones
`draft` -> `review` -> `approved`. La aprobación se ejecuta en servidor y queda
ligada al actor, fecha, hash del contenido, hash del activo, cuenta destino y
scope `draft_upload`. Una edición crea otra revisión `draft` y deja la nueva
revisión sin aprobación.

Archivos implementados:

- src/content/editorial/revision.service.js
- src/content/editorial/revision.repository.js
- src/content/approval/approval.service.js

Evidencia local (2026-10-04):

- `npm test`: 41/41 pruebas aprobadas con el servidor local activo para el smoke test;
- `npm run verify`: aprobado;
- `node scripts/verify-documentation.mjs`: aprobado;
- `git diff --check`: aprobado.

Limitaciones abiertas: el repositorio se pierde al reiniciar el proceso, no hay
API/UI productiva. Flujo local implementado en el cuarto incremento;
comparación visual, vigencia de fuentes/activos y persistencia durable siguen pendientes.

## Gate de aceptación

CRUD autorizado, input inválido rechazado, edición/cambio activo revoca, ownership y conflictos calendario probados.
Registrar checks, fuente de evidencia, fecha, fallos y limitaciones. No usar mocks como resultado externo.

El gate no se considera cerrado: este incremento cubre revisions, ownership,
validación de entradas, aprobación, revocación y API/UI local; faltan autenticación
productiva, CRUD completo y persistencia durable.

## Fuentes y reglas

Consultar CONTRATOS.md, REGLAS.md, DISENO.md en docs/development y el índice FUENTES.md. Versionar cambios y preservar la base.

## Segundo incremento: validación de aprobaciones (2026-10-04)

El servicio de revisiones valida también las llamadas directas a appendApproval:
actor autenticado normalizado, cuenta, hash de contenido, formato del hash del
activo, fecha ISO canónica y alcance draft_upload. Rechaza campos adicionales y
no agrega revisiones cuando la aprobación es inválida. El texto copy con tipo
incorrecto se rechaza; la consulta de historial normaliza el identificador.

Evidencia de este incremento:
- node --test tests/integration/*.test.js: 40/40 aprobadas.
- node --test (suite completa): 43 aprobadas, 1 fallida de 44.
  El fallo corresponde a scripts/smoke-test.js: fetch failed al conectar al
  servidor local. No se acredita el smoke ni la suite completa como aprobados.
- verify-project.js y verify-documentation.mjs: aprobados.
- git diff --check: aprobado.

Limitaciones: el hash del activo todavía lo proporciona el llamador; su
comparación contra bytes reales y la autenticación del contexto de identidad
en una futura API siguen pendientes. Esta validación no convierte el módulo
en una API autenticada ni aporta persistencia durable. El gate permanece abierto.

## Tercer incremento: calendario local (2026-10-05)

Implementado src/content/calendar/calendar.service.js con plan/get/list/cancel.
Reservas por tenant, revisión aprobada, cuenta y hashes; UTC ISO canónico y zona
nombrada; fecha futura, expiración posterior, rechazo de duplicados y coincidencia
de cuenta/instante. Cancelación con versión. Cambio editorial vuelve el plan
needs_review al leerlo y libera la reserva. El esquema inicial se conserva.

Evidencia: ocho nuevas pruebas de comportamiento aprobadas; suite completa
node --test: 52/52, incluido scripts/smoke-test.js contra servidor local en 4100.
verify-project.js y verify-documentation.mjs aprobados. No hubo llamadas a TikTok
en pruebas. El smoke acredita /health local, no una operación del proveedor.

Limitaciones: planificación en memoria, sin timers, API/UI, persistencia o
uploads automáticos. La zona no convierte horas locales ambiguas: se exige UTC
explícito. Conflicto exacto de instante, sin frecuencia mínima inventada.
expiresAt corresponde al plan, no valida vigencia de fuentes comerciales.
Identidad confiable suministrada por el llamador; autorización HTTP y por cuenta,
bytes reales del activo, DB/outbox/idempotencia siguen pendientes.
La fase y el scheduler permanecen abiertos.

## Cuarto incremento: primer flujo API/UI local (2026-10-05)

local.routes.js y review-ui/public/editorial.html/editorial.js conectan
borrador -> video en memoria -> preview de los bytes del servidor -> aprobación
de revisión/cuenta/hashes -> FILE_UPLOAD -> consulta de estado -> publicación
manual en TikTok. Edición de texto/video revoca aprobación. Calendario local
integrado sin timers. /api/editorial deriva cuenta del token y ownership de
sesión local; rechaza origen ajeno, Host externo, cookie/CSRF faltantes y producción.

Intentos en memoria se reservan antes del await; duplicados de mismo hash/cuenta
se rechazan incluso entre borradores. Resultado incierto conserva publishId si
existe y exige conciliación, sin nuevo intento automático. Ningún estado se
convierte automáticamente en publicación final. Texto se copia manualmente,
no se manda como descripción por el endpoint de video Inbox.

Evidencia: node --test 62/62, diez pruebas nuevas HTTP con proveedor simulado;
smoke /health del servidor local existente aprobado. JS de UI: node --check
aprobado. Navegador automatizado: dos timeouts, QA visual no acreditada.
No se hizo envío real nuevo ni se verificó publicación con esta pantalla.
Consultar [runbook](../../runbooks/editorial-local.md) para arranque/reinicio,
límites y prueba real.

Pendientes: DB/outbox/idempotencia durable, auth/roles por usuario, preflight
codec/derechos, vigencia de fuentes y QA visual. Token store global y endpoint
Sandbox anterior permanecen; las garantías nuevas son del router local, no de
toda la aplicación. No exponer este incremento como plataforma multiusuario.

## Quinto incremento: archivado versionado local (2026-10-09)

La transición contractual `approved -> archived` queda implementada en el servicio de revisiones y en la API/UI local. Exige tenant propietario y revisión actual, rechaza estados no aprobados, conserva el snapshot de aprobación en una nueva revisión inmutable y bloquea edición, media, calendario y envío posteriores. Archivar no borra historial ni activos en memoria.

Evidencia ejecutada por Codex para este incremento: comprobación sintáctica de cuatro archivos JavaScript y 30/30 pruebas dirigidas de revisiones, rutas, UI e identidad; cero fallos y cero omitidas. Proveedor e identidades fueron sintéticos, sin llamadas a TikTok. La suite completa 89/89 fue ejecutada e informada por el usuario el mismo día; no fue reejecutada por Codex.

Limitaciones: no hay restauración desde archivado, eliminación física, retención, DB ni auditoría durable. JSON Schema/Ajv sigue como decisión candidata. Identidad productiva permanece abierta: faltan autenticación, roles y conexiones TikTok por cuenta.

## Sexto incremento: contrato ContentRevision en runtime (2026-10-09)

ADR-03 se adopta parcialmente con `ajv@8.20.0` y `ajv-formats@3.0.1`, fijados en lockfile. El repositorio compila el schema Draft 2020-12 y valida cada revisión al escribir y leer, sin coerción, defaults ni eliminación de campos. Campos desconocidos, hashes/estados inválidos, aprobación nula en estado approved y fecha no canónica se rechazan antes de persistir en memoria.

Las invariantes transaccionales siguen en los servicios: identidad/ownership, revisión vigente, coincidencia de hashes/cuenta, aprobación server-side y bloqueo de contenido archivado. El schema no autoriza transiciones.

Evidencia ejecutada por Codex: instalación auditó 84 paquetes con cero vulnerabilidades reportadas; `npm audit --omit=dev` también reportó cero; comprobaciones sintácticas y 33/33 pruebas dirigidas aprobaron. Después, toda `tests/integration` aprobó 90/90, cero fallos u omitidas, incluido renderer nativo y proveedor TikTok simulado. No incluye smoke ni acredita proveedor real. La suite 91/91 fue ejecutada e informada antes por el usuario, no por Codex.

Limitaciones: Asset/Campaign/PublicationJob aún no tienen validación runtime; no hay persistencia durable ni identidad productiva. La validación de schema devuelve error interno seguro, sin exponer datos o detalles del validador.
