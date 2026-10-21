# Desarrollo de Analytics

Estado: especificación documental; revisar AUDITORIA.md para qué ya existe.

## Responsabilidad

Evidencia y atribución.

## Límites e invariantes

Source/window/account; visita!=lead!=pedido; missing nunca 0 o KPI estimado; no nuevos scopes implícitos. API/tools/UI pasan por el mismo servicio autorizado cuando se implemente. No retornar éxito sintético para completar estructura.

## Archivos y dependencias

Consultar docs/development/structure.json y guía de fase en docs/development/phases/. Crear código previsto junto con incremento vertical y pruebas, no scaffolds vacíos.

## Criterio de aceptación

Fórmulas y denominadores verificables; import/source real. Guardar evidencia con scope/fecha; pruebas con mocks no acreditan proveedor real.

## Referencia

Reglas detalladas en docs/development/MARKETING.md; contrato/fuentes de proveedor en el índice principal. Este módulo no instala plugins, dependencias ni cambia flags.
