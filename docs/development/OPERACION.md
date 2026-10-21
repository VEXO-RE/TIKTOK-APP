# Seguridad y operación propuestas

## Identidad

Autenticación app y ownership por tenant/cuenta antes de multiusuario. Roles editor/aprobador/admin separados.
OAuth state de uso único ligado a sesión; CSRF en mutaciones; límite de carga/origen.
Store actual en memoria se conserva. Persistencia cifrada de tokens requiere diseño y autorización específicos; keys fuera de DB, rotación/revocación/refresh.
Jobs solo referencias de conexión; no secrets. No leer .env para documentos.

## Media y redes

Validar origen/URL contra SSRF además de formato. URL ownership antes de PULL_FROM_URL.
Render aislado con memory/time/cost limits; argumentos estructurados, nunca shell interpolada con prompts.
Storage con ACL y retention definida. Inspección de metadatos/derechos; no persistencia ilimitada por defecto.

## Recuperación y observabilidad

Outbox, leases, heartbeat, retry budget y DLQ. Redrive revalida revisión/cuenta/derechos.
Backups/restauración ensayados; RPO/RTO se definen por requisitos, no números garantizados.
Restart actual pierde conexión Sandbox; runbook exige reautorizar.
CorrelationId por API/job/render; logs redacted. Métricas de cola, latencia, reintentos, casos unknown y recursos.
OpenTelemetry candidato; telemetría técnica no es reporting orgánico TikTok.
Runbooks: token expirado, cuota, timeout/conciliación, rechazo media, revocación, derechos y error comercial.
No borrar drafts ni evidencia sin inventario/política; incidentes conservan referencia, no secretos.
