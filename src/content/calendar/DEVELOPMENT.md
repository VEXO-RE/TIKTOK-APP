# Calendario editorial en memoria

Estado: servicio local implementado; API/UI, persistencia y scheduler pendientes.

calendar.service.js ofrece plan/get/list/cancel usando la identidad confiable del
llamador, sin rutas HTTP ni llamadas externas. Solo acepta revisiones approved con
scope draft_upload; fija revisión, cuenta y hashes. Los planes son inmutables y
la cancelación exige versión. El cambio editorial vuelve el plan needs_review
al consultarlo, y deja de bloquear otras reservas.

scheduledAt/expiresAt usan UTC ISO canónico con milisegundos; timeZone es una zona
nombrada aceptada por Intl. La hora local no se convierte: se exige un instante UTC
explícito para evitar ambigüedades de DST. Fecha futura y expiry posterior son
obligatorias. El conflicto es la misma cuenta y el mismo instante, o contenido
ya reservado, dentro del tenant. No se asume una separación mínima entre posts.

El esquema calendar-item.schema.json se conserva como contrato inicial. Este
servicio usa un modelo separado de plan (schemaVersion 1.0.0) con estados planned,
needs_review, expired, cancelled. No registra scheduled/published ni ejecuta
uploads. La expiración es del plan editorial, no certifica vigencia comercial
de fuentes/activos. La detección de cambios es dinámica al consultar, no un evento.

Limitaciones: memoria de un proceso; reinicio pierde planes; contexto auth todavía
no conectado a autenticación HTTP; hash del activo proviene de la revisión.
Antes de scheduler: DB, transacciones de reserva, outbox, idempotencia, validación
de bytes/fuentes y autorización real por cuenta. Consultar docs/development/phases/04-editorial.md.
