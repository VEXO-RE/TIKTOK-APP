# Desarrollo de Design

Estado: especificación documental; revisar AUDITORIA.md para qué ya existe.

## Responsabilidad

Sistema visual y QA de interfaz.

## Límites e invariantes

Activos aprobados, tokens semánticos, accessibility, estados; evitar claims falsos y nombres técnicos en UX. API/tools/UI pasan por el mismo servicio autorizado cuando se implemente. No retornar éxito sintético para completar estructura.

## Archivos y dependencias

Consultar docs/development/structure.json y guía de fase en docs/development/phases/. Crear código previsto junto con incremento vertical y pruebas, no scaffolds vacíos.

## Criterio de aceptación

Capturas/QA móvil real, keyboard/focus y cuenta visible. Guardar evidencia con scope/fecha; pruebas con mocks no acreditan proveedor real.

## Referencia

Reglas detalladas en docs/development/DISENO.md; contrato/fuentes de proveedor en el índice principal. Este módulo no instala plugins, dependencias ni cambia flags.
