# Desarrollo de MCP

Estado: especificación documental; revisar AUDITORIA.md para qué ya existe.

## Responsabilidad

Tool facade sobre servicios disponibles.

## Límites e invariantes

Readonly y ownership en backend; no registrar herramientas sin capability/adaptador probado; tool output no instrucciones. API/tools/UI pasan por el mismo servicio autorizado cuando se implemente. No retornar éxito sintético para completar estructura.

## Archivos y dependencias

Consultar docs/development/structure.json y guía de fase en docs/development/phases/. Crear código previsto junto con incremento vertical y pruebas, no scaffolds vacíos.

## Criterio de aceptación

Tenant/readonly/input/adversarial; conexión real mínima. Guardar evidencia con scope/fecha; pruebas con mocks no acreditan proveedor real.

## Referencia

Reglas detalladas en docs/development/SKILLS-PLUGINS.md; contrato/fuentes de proveedor en el índice principal. Este módulo no instala plugins, dependencias ni cambia flags.
