# Desarrollo de Editorial

Estado: revisiones/aprobación y calendario en memoria, API local y UI implementadas. Auth productiva y persistencia durable pendientes. Consultar docs/runbooks/editorial-local.md.

## Responsabilidad

Revisiones y fuentes comerciales.

## Límites e invariantes

Insumos reales con evidencia; separar idea sin claims de brief factual; repository/service sin red directa. API/tools/UI pasan por el mismo servicio autorizado cuando se implemente. No retornar éxito sintético para completar estructura.

## Archivos y dependencias

Consultar docs/development/structure.json y guía de fase en docs/development/phases/. Crear código previsto junto con incremento vertical y pruebas, no scaffolds vacíos.

## Criterio de aceptación

Ownership y revisions probados; ninguna oferta inventada. Guardar evidencia con scope/fecha; pruebas con mocks no acreditan proveedor real.

## Referencia

Reglas detalladas en docs/development/FASES.md; contrato/fuentes de proveedor en el índice principal. Este módulo no instala plugins, dependencias ni cambia flags.
