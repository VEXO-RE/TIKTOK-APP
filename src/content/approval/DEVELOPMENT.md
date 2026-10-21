# Desarrollo de Approval

Estado: aprobación server-side del primer incremento implementada; integración con API/tools/UI pendiente.

## Responsabilidad

Revisión humana exigible en servidor.

## Límites e invariantes

Actor/fecha/hash/destino/cuenta; aprobación a snapshot no a nombre de archivo; revocación auditable. API/tools/UI pasan por el mismo servicio autorizado cuando se implemente. No retornar éxito sintético para completar estructura.

## Archivos y dependencias

Consultar docs/development/structure.json y guía de fase en docs/development/phases/. Crear código previsto junto con incremento vertical y pruebas, no scaffolds vacíos.

## Criterio de aceptación

Bypass cliente/mutación snapshot/cuenta cruzada rechazados. Guardar evidencia con scope/fecha; pruebas con mocks no acreditan proveedor real.

## Referencia

Reglas detalladas en docs/development/REGLAS.md; contrato/fuentes de proveedor en el índice principal. Este módulo no instala plugins, dependencias ni cambia flags.
