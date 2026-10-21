# Desarrollo de Marketing

Estado: planificación orgánica local implementada en Review UI; ver docs/runbooks/campaign-local.md. Analítica, Ads, atribución y backend productivo pendientes.

## Responsabilidad

Estrategia, campañas, embudo y copy.

## Límites e invariantes

Hechos/destinos reales, organic vs paid, hipótesis vs resultados, no spam/bots; Ads otra integración. API/tools/UI pasan por el mismo servicio autorizado cuando se implemente. No retornar éxito sintético para completar estructura.

## Archivos y dependencias

Consultar docs/development/structure.json y guía de fase en docs/development/phases/. Crear código previsto junto con incremento vertical y pruebas, no scaffolds vacíos.

## Criterio de aceptación

Brief/evidencia/aprobación/tracking sin gasto implícito. Guardar evidencia con scope/fecha; pruebas con mocks no acreditan proveedor real.

## Referencia

Reglas detalladas en docs/development/MARKETING.md; contrato/fuentes de proveedor en el índice principal. Este módulo no instala plugins, dependencias ni cambia flags.
