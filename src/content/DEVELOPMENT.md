# Desarrollo de Content

Estado: revisiones, aprobación, calendario y flujo API/UI local implementados; auth productiva y persistencia pendientes.

## Responsabilidad

Briefs, revisiones, calendario y aprobación.

## Límites e invariantes

Snapshot inmutable, sources/fecha/expiry, UTC/zona y approval/hash; conservar schema inicial hasta migración versionada. API/tools/UI pasan por el mismo servicio autorizado cuando se implemente. No retornar éxito sintético para completar estructura.

## Archivos y dependencias

Consultar docs/development/structure.json y guía de fase en docs/development/phases/. Crear código previsto junto con incremento vertical y pruebas, no scaffolds vacíos.

## Criterio de aceptación

Cambio de cuenta/CTA/asset invalida; transición y calendario probados. Guardar evidencia con scope/fecha; pruebas con mocks no acreditan proveedor real.

## Referencia

Reglas detalladas en docs/development/CONTRATOS.md; contrato/fuentes de proveedor en el índice principal. Este módulo no instala plugins, dependencias ni cambia flags.
