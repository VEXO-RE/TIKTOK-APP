# Resultado de transferencia desconocido

Ámbito: Upload Inbox actual/futuro scheduler. Timeout/conexión perdida no demuestra que TikTok no recibió el video.
Conservar publishId si se obtuvo, hash/revisión/cuenta y último checkpoint sin upload_url/secrets.
Consultar el status del mismo publishId con autorización de esa cuenta y revisar Inbox. No reinicializar/republicar automáticamente.
Resultado publicado/Inbox -> registrar estado correspondiente y evidencia; rechazo confirmado -> nuevo intento solo si aprobación vigente/política lo permite.
Sin publishId recuperable -> marcar unknown_requires_reconciliation, inspección humana; no afirmar exactly-once.
El retry de PUT actual está acotado a 5xx; no ampliar a mutaciones/operaciones no idempotentes por este runbook.
