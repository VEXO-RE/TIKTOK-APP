# Desarrollo de Creative agents

Estado: brief factual determinista implementado en Review UI, sin orquestador AI. Ver docs/runbooks/brief-local.md; generación y agentes productivos pendientes.

## Responsabilidad

Propuestas de copy/visual/guion y QA.

## Límites e invariantes

Tools acotadas; fuentes como datos; budgets; schemas/citas/incertidumbre; sin autopublicar. API/tools/UI pasan por el mismo servicio autorizado cuando se implemente. No retornar éxito sintético para completar estructura.

## Archivos y dependencias

Consultar docs/development/structure.json y guía de fase en docs/development/phases/. Crear código previsto junto con incremento vertical y pruebas, no scaffolds vacíos.

## Criterio de aceptación

Corpus adversarial y precisión factual; humano aprueba. Guardar evidencia con scope/fecha; pruebas con mocks no acreditan proveedor real.

## Referencia

Reglas detalladas en docs/development/AGENTES-CREATIVOS.md; contrato/fuentes de proveedor en el índice principal. Este módulo no instala plugins, dependencias ni cambia flags.
