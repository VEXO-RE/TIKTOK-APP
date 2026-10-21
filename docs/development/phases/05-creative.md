# Fase 5 — Creative Agents

Estado: parcial. Render/editor local implementados; Creative Agents y generación AI pendientes. Consultar ../../runbooks/editor-local.md.

## Entrada

Dependencias: Fase 4; derechos/briefs; catálogo real si se hacen afirmaciones comerciales.
Insumos: ContentRevision, sourceSnapshot, voice/visual rules y presupuesto.

## Implementación prevista

Salida estructurada con hechos/citas/incertidumbre; generación con costo aislada; render receta/versionada y QC. Humanos aprueban hash final. No logos/watermarks de app añadidos por defecto.

Archivos previstos (render.service.js ya implementado; los demás requieren verificar evidencia antes de afirmar implementación):

- src/agents/orchestrator.service.js
- src/agents/prompt.registry.js
- src/media/asset.service.js
- src/media/render.service.js
- src/media/preflight.service.js

## Gate de aceptación

Brief factual, presupuesto, derechos, asset reproducible/preview correcto y QA móvil; sin claims inventados ni autoaprobación.
Registrar checks, fuente de evidencia, fecha, fallos y limitaciones. No usar mocks como resultado externo.

## Fuentes y reglas

Consultar AGENTES-CREATIVOS.md, MEDIA.md, DISENO.md en docs/development y el índice FUENTES.md. Versionar cambios y preservar la base.

## Brief local — 2026-10-05

Plantilla factual y pantalla sin token implementadas; seis pruebas nuevas y regresión 74/74. No acredita Creative Agents completos. Ver ../../runbooks/brief-local.md. TikTok en revisión según usuario: pruebas operativas pendientes.
