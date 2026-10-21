# Fase 2 — Content Posting Upload

Estado: Flujo semiautomático validado por usuario.

## Entrada

Dependencias: Fase 1; contenido aprobado y autorización video.upload.
Insumos: FILE_UPLOAD, media.js, upload.service, Review UI y pruebas.

## Implementación prevista

Conservar Upload, publishId y separación Inbox/publicación. Retries PUT actuales acotados no son idempotencia global. No alterar flags por documento.

Archivos previstos (no creados por esta fase documental):

- docs/evidence/content-upload.md

## Gate de aceptación

No regresión de flujo y evidencias distintas por intento; errores históricos permanecen históricos.
Registrar checks, fuente de evidencia, fecha, fallos y limitaciones. No usar mocks como resultado externo.

## Fuentes y reglas

Consultar CAPACIDADES-TIKTOK.md, REGLAS.md en docs/development y el índice FUENTES.md. Versionar cambios y preservar la base.
