# Desarrollo de Review UI

Estado: Review Sandbox existente y pantalla editorial local implementada; QA automatizada escritorio/móvil aprobada con proveedor simulado; micrófono real y envío del nuevo MP4 pendientes. Editor integrado: docs/runbooks/editor-local.md. Consultar docs/runbooks/editorial-local.md.

Corrección 2026-10-09: las plantillas ya no limpian los derechos confirmados para el video actual; validación previa y error de render permanecen en el estado del editor. Pruebas dirigidas aprobadas; inspección visual nueva no acreditada. Ver PROJECT-VALIDATION.md y el runbook del editor.

## Responsabilidad

Preview/approval/status de la cuenta destino.

## Límites e invariantes

No JSON técnico para UX final; botón no hace promesa falsa; frontend nunca sustituye approval/idem del servidor. API/tools/UI pasan por el mismo servicio autorizado cuando se implemente. No retornar éxito sintético para completar estructura.

## Archivos y dependencias

Consultar docs/development/structure.json y guía de fase en docs/development/phases/. Crear código previsto junto con incremento vertical y pruebas, no scaffolds vacíos.

## Criterio de aceptación

Preview real, aprobación visible y guard; evidencia diferenciada. Guardar evidencia con scope/fecha; pruebas con mocks no acreditan proveedor real.

## Referencia

Reglas detalladas en docs/development/DISENO.md; contrato/fuentes de proveedor en el índice principal. Este módulo no instala plugins, dependencias ni cambia flags.

Biblioteca local de briefs e importación de datos implementadas: brief-library.mjs, brief.js y brief.html. El resultado recuperado exige nueva confirmación; no restaura approval. Ver docs/runbooks/brief-local.md. TikTok real sigue pendiente por App Review.
