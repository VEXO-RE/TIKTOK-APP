# Desarrollo de Media

Estado: renderer FFmpeg/ffprobe y cargas de pistas implementados. Ver docs/runbooks/editor-local.md. Generación AI y preflight completo pendientes.

## Responsabilidad

Assets/rights/render/preflight.

## Límites e invariantes

Originales inmutables, hash/receta/QC/derechos, workers aislados y costo explícito. API/tools/UI pasan por el mismo servicio autorizado cuando se implemente. No retornar éxito sintético para completar estructura.

## Archivos y dependencias

Consultar docs/development/structure.json y guía de fase en docs/development/phases/. Crear código previsto junto con incremento vertical y pruebas, no scaffolds vacíos.

## Criterio de aceptación

Output reproducible y mismo hash aprobado; MP4 reproducible. Guardar evidencia con scope/fecha; pruebas con mocks no acreditan proveedor real.

## Referencia

Reglas detalladas en docs/development/MEDIA.md; contrato/fuentes de proveedor en el índice principal. Este módulo no instala plugins, dependencias ni cambia flags.
