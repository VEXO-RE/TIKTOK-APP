# Fase 6 — Scheduling

Estado: Pendiente.

## Entrada

Dependencias: Approval durable, media QC y store/outbox/queue adoptados.
Insumos: Revisión aprobada, cuenta, capabilities, ventana y zona.

## Implementación prevista

Transacción+outbox, unique key, lease cuenta, checkpoints, retry budget y DLQ. Timeout->unknown/reconcile. Upload agenda envío a Inbox; humano termina publicación.

Archivos previstos (no creados por esta fase documental):

- src/scheduling/job.repository.js
- src/scheduling/outbox.dispatcher.js
- src/scheduling/scheduler.service.js
- src/scheduling/publication.worker.js
- src/scheduling/reconciliation.service.js

## Gate de aceptación

Duplicado/caída/restart/cancelación/revocación/hora ambigua probados; no repeat efecto desconocido. Ejecución real opt-in.
Registrar checks, fuente de evidencia, fecha, fallos y limitaciones. No usar mocks como resultado externo.

## Fuentes y reglas

Consultar PIPELINE.md, ARQUITECTURA.md, OPERACION.md en docs/development y el índice FUENTES.md. Versionar cambios y preservar la base.
