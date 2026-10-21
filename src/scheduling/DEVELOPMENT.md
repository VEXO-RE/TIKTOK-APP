# Desarrollo de Scheduling

Estado: especificación documental; revisar AUDITORIA.md para qué ya existe.

## Responsabilidad

Jobs/outbox/leases/conciliación.

## Límites e invariantes

Job único/version/hash/cuenta; retry budget; unknown no resend; Upload mantiene humano. API/tools/UI pasan por el mismo servicio autorizado cuando se implemente. No retornar éxito sintético para completar estructura.

## Archivos y dependencias

Consultar docs/development/structure.json y guía de fase en docs/development/phases/. Crear código previsto junto con incremento vertical y pruebas, no scaffolds vacíos.

## Criterio de aceptación

Crash/recovery/duplicado/revocación/hora ambigua. Guardar evidencia con scope/fecha; pruebas con mocks no acreditan proveedor real.

## Referencia

Reglas detalladas en docs/development/PIPELINE.md; contrato/fuentes de proveedor en el índice principal. Este módulo no instala plugins, dependencias ni cambia flags.
