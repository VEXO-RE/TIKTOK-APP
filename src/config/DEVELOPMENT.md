# Desarrollo de Config

Estado: especificación documental; revisar AUDITORIA.md para qué ya existe.

## Responsabilidad

Defaults y referencias seguras.

## Límites e invariantes

Cambios solo en fase autorizada; secrets no versionados; defaults cierran mutaciones; flags no equivalen a permiso. API/tools/UI pasan por el mismo servicio autorizado cuando se implemente. No retornar éxito sintético para completar estructura.

## Archivos y dependencias

Consultar docs/development/structure.json y guía de fase en docs/development/phases/. Crear código previsto junto con incremento vertical y pruebas, no scaffolds vacíos.

## Criterio de aceptación

Schema config/env tests; sin valores reales en docs. Guardar evidencia con scope/fecha; pruebas con mocks no acreditan proveedor real.

## Referencia

Reglas detalladas en docs/development/OPERACION.md; contrato/fuentes de proveedor en el índice principal. Este módulo no instala plugins, dependencias ni cambia flags.
