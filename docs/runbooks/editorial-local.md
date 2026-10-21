# Flujo editorial local de prueba

Implementado 2026-10-05. Acceso: http://localhost:4100/review/editorial.html.
Solo loopback, operador local único; deshabilitado con NODE_ENV=production. No acceder por ngrok: el nuevo router
rechaza Host externo, socket remoto y Origin distinto. No es autenticación
productiva multiusuario. La cuenta deriva del openId del token actual; no se
acepta account/tenant/actor enviados por el navegador. OAuth existente se conserva.

## Arranque y primer envío

Si el servidor ya estaba activo al editar server.js, en su terminal pulsa Ctrl+C
y ejecuta npm start desde la raíz del proyecto. El reinicio pierde tokens,
borradores, calendario, videos e intentos: primero conserva cualquier publishId
y concilia envíos inciertos; no reinicies para desbloquear un duplicado.
Vuelve a conectar TikTok usando el Login Kit existente; callback y flags no cambian.

1. Abre la pantalla local y conecta TikTok; actualiza conexión.
2. Escribe título interno, texto y fuentes reales. Guarda el borrador.
3. Selecciona video compatible. La carga inicial va solo a memoria local,
   no a TikTok; la vista previa lee esos mismos bytes desde servidor.
4. Reproduce y revisa el video para la cuenta indicada; marca el checkbox.
   Aprobar fija revisión, actor local, cuenta, hash de contenido y bytes reales.
5. Puedes guardar cambios: revocan aprobación. Los cambios sin guardar bloquean
   aprobación/envío. Reemplazar video exige aprobación nueva.
6. Enviar a TikTok Inbox inicializa FILE_UPLOAD y transfiere los bytes aprobados.
   Texto/copy es referencia para copiar en TikTok: no se manda como descripción.
7. Consulta estado (mínimo cinco segundos entre consultas). SEND_TO_USER_INBOX
   se presenta como pendiente de publicación manual, nunca como publicación final.
8. Abre notificación de Inbox en TikTok; edita y publica allí. Verifica el
   resultado final por separado. No se afirma publicación desde un timeout.
9. Calendario reserva fecha UTC/expiry y muestra la zona del navegador.
   No dispara envíos. Mantener vigente aprobación/fuentes sigue siendo requerido.
10. Un contenido aprobado sin intento puede archivarse. El archivado crea otra
    revisión, conserva el snapshot de aprobación como auditoría y bloquea edición,
    exportación, planificación y envío. No elimina el historial ni los bytes en memoria.

## Resultado desconocido y límites

Antes de contactar TikTok se registra el intento en memoria. Inicialización o
transferencia inciertas bloquean otro envío del mismo hash/cuenta incluso desde
otro borrador. Se conserva publishId si TikTok lo devolvió. Consultar estado e
Inbox; no retry ciego. Consultas fallidas no desbloquean el intento. Fallos
confirmados tampoco se reenvían automáticamente en este corte conservador.

Sesiones: cookie HttpOnly/SameSite Strict, CSRF por sesión, TTL dos horas,
máximo veinte sesiones y diez borradores por sesión. Videos: tope agregado
64 MiB en memoria y límites previos del parser. Cien intentos por proceso.
Sesiones vencidas liberan videos al siguiente acceso; referencias de intentos
persisten solo en el proceso. No almacenamiento durable ni locks distribuidos.

El router previo /api/tiktok/content permanece como implementación Sandbox
existente; este incremento no asegura aprobación/idempotencia en ese endpoint.
Las garantías nuevas corresponden a /api/editorial y la nueva pantalla.
El token store global sigue siendo de operador único, no tenencia productiva.
El editor exporta MP4 con inspección ffprobe y declaración de derechos; preflight completo y certificación de derechos siguen pendientes. Ver [editor local](editor-local.md).

## Evidencia y siguientes gates

Evidencia anterior al editor: node --test, 62/62 aprobadas; diez pruebas nuevas de API/servicio con TikTok
simulado, sin llamadas al proveedor. Smoke: /health del servidor local existente,
no acredita el router nuevo en un proceso que aún no se reinició.
Pruebas cubren bytes, aprobación, edición/revocación, cuenta cambiada, scope/flag,
Origin/cookie/CSRF/Host, duplicados, paralelismo, incertidumbre y calendario.

Evidencia anterior: navegador automatizado con dos timeouts. Verificación actual: 68/68 tests, exportaciones FFmpeg reales y Playwright escritorio/móvil aprobados con TikTok simulado. Ver guía del editor.
Harness visual separado con banner PROVEEDOR SIMULADO, token sintético y puerto
efímero; sus respuestas no prueban Inbox ni publicación reales.
Para primer envío real elegir video/texto propios y verificar Inbox/manual.
Pendientes: sesión OAuth por usuario, roles/auth productiva, DB/transacciones,
persistencia de intentos/outbox, idempotencia durable, preflight completo y comprobación real del MP4 editado.

Evidencia informada por el usuario el 2026-10-09: suite completa 89/89,
cero fallos y cero omitidas. No fue una ejecución nueva de Codex. Para el
incremento de archivado, Codex ejecutó después 30/30 pruebas dirigidas con datos
y proveedor sintéticos; no hubo llamada a TikTok ni verificación visual nueva.

Fuentes oficiales verificadas 2026-10-05:
- https://developers.tiktok.com/docs/en/content-posting-api-get-started-upload-content
- https://developers.tiktok.com/docs/en/content-posting-api-reference-get-video-status

Direct Post sigue diferido. No se cambian OAuth/.env/flags/dependencias.
