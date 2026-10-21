# Backlog ejecutable

Estimaciones/fechas no fijadas sin prioridades del usuario; orden por dependencias.

| Orden | Trabajo | Entrada | Criterio de salida |
|---|---|---|---|
| 1 | Identidad/ownership app | Diseño de cuentas y revisión de riesgos | Sesiones aisladas, backend rechaza acceso cruzado |
| 2 | Contratos y revisiones | schemas y ADR-03 | Input validado y estados seguros |
| 3 | Persistencia/approval | ADR-02 y snapshot | Cambiar hash/cuenta invalida; auditoría durable |
| 4 | Catálogo readonly | Auth tienda y fase 7 | Lectura real, fuente/fecha, pagination y expiry |
| 5 | Sistema visual y brief | Datos reales/brand | Pantallas con estados; copy con fuentes |
| 6 | Imagen/video/QC | Derechos y receta | Asset final reproducible, apto y aprobado |
| 7 | Outbox/scheduler | Approval durable | Crash/recovery no repite efectos; unknown conciliado |
| 8 | Funnel/contacto | CTA real/medición | Link/visita/conversación/pedido diferenciados |
| 9 | MCP | Servicios anteriores probados | Scope/tenant/readonly enforce en backend |
| 10 | Segunda red | Contrato/capabilities | Consent y pruebas propias, sin regresión TikTok |

No ejecutar todos a la vez ni reservar cuentas/infraestructura por una plantilla.
Discovery de versiones/licencias y gates tiene que suceder antes de instalar cada dependencia.

## Revisión actual — 2026-10-09

El orden permanece vigente. En el ítem 1 se implementó solo el ciclo de vida aislado de la sesión editorial local y se extrajo del router a `src/identity/session.service.js`. El backend local ya rota contexto al cambiar la referencia de cuenta y rechaza cookie/CSRF/ownership ajenos, con pruebas sintéticas.

El ítem 1 no está cerrado: faltan el diseño y la implementación de autenticación, roles y conexiones TikTok segregadas; el token store actual continúa global.

El corte anterior del ítem 2 implementó `approved -> archived`. El corte runtime actual adoptó Ajv solo para `ContentRevision`: cada snapshot se valida contra el schema 2020-12 al escribir y leer, sin sustituir ownership, conflicto optimista, hashes, aprobación ni bloqueo de archivado. Pruebas dirigidas: 33/33; auditoría npm productiva sin vulnerabilidades reportadas.

El ítem 2 sigue parcial: los schemas Asset/Campaign/PublicationJob continúan documentales y no hay CRUD productivo completo. El ítem 3 tampoco se promueve: no existe auditoría/persistencia durable. Identidad productiva sigue abierta. No se inició catálogo, scheduler o integraciones externas.
