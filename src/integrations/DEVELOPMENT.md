# Desarrollo de Integrations

Estado: especificación documental; revisar AUDITORIA.md para qué ya existe.

## Responsabilidad

Adapters autorizados de catálogo/contacto.

## Límites e invariantes

Una interfaz por proveedor; readonly primero; stubs fallan cerrado; credenciales independientes. API/tools/UI pasan por el mismo servicio autorizado cuando se implemente. No retornar éxito sintético para completar estructura.

## Archivos y dependencias

Consultar docs/development/structure.json y guía de fase en docs/development/phases/. Crear código previsto junto con incremento vertical y pruebas, no scaffolds vacíos.

## Criterio de aceptación

Pruebas contrato/error y lectura real por cuenta autorizada. Guardar evidencia con scope/fecha; pruebas con mocks no acreditan proveedor real.

## Referencia

Reglas detalladas en docs/development/CAPACIDADES-TIKTOK.md; contrato/fuentes de proveedor en el índice principal. Este módulo no instala plugins, dependencias ni cambia flags.
