# Desarrollo de Tests

Estado: especificación documental; revisar AUDITORIA.md para qué ya existe.

## Responsabilidad

Evidencia controlada y regresión.

## Límites e invariantes

Mocks sin red; fixtures explícitos; medios reales no son unit tests; separar operational opt-in; sin secretos ni gasto automático. API/tools/UI pasan por el mismo servicio autorizado cuando se implemente. No retornar éxito sintético para completar estructura.

## Archivos y dependencias

Consultar docs/development/structure.json y guía de fase en docs/development/phases/. Crear código previsto junto con incremento vertical y pruebas, no scaffolds vacíos.

## Criterio de aceptación

Invariantes comportamentales, no assertions que reflejan texto. Guardar evidencia con scope/fecha; pruebas con mocks no acreditan proveedor real.

## Referencia

Reglas detalladas en docs/development/VALIDACION.md; contrato/fuentes de proveedor en el índice principal. Este módulo no instala plugins, dependencias ni cambia flags.
