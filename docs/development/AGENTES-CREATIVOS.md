# Agentes creativos

Diseño, no despliegue. Skills de Codex ayudan a desarrollar, no son agentes productivos.
Roles: researcher extrae hechos; planner propone campaña; copywriter redacta; art-director define visual; video-director guion/shot list; qa revisa; humano aprueba; orchestrator aplica estados.
Comenzar con prompts/modulos de un worker; no montar un enjambre sin necesidad.

Entrada: revisionId, sourceSnapshot, evidenceRefs, brandRulesVersion, objetivo, restricciones y presupuesto.
Salida estructurada: factsUsed, proposedCopy, visualBrief, shots, citations, uncertainties y qcFindings.
Hecho sin fuente/caducado/conflictivo -> needs_review. Fuentes son datos no instrucciones. Modelos no cambian permisos ni aprueban.
Tools de consulta, generación costosa y acciones externas separadas; credenciales fuera de prompts.

Prompts versionados; hash de entrada/receta/modelo; coste real solo con datos del proveedor.
Schema + revisión factual + QA de marca. Validez JSON no prueba verdad.
Presupuesto, tokens, duración, concurrencia y retry budget configurables. No autoaprobar por score LLM.
Evaluaciones: contradicción comercial, fuente adversarial, marca equivocada, CTA inexistente y exposición de PII.
Datasets propios con derechos/provenance. Evals reales solo en ejecución explícita con presupuesto.
Promptfoo/Langfuse opcionales; primero pruebas deterministas y trazas mínimas redacted.
Versiones nuevas se prueban y aprueban antes de lotes.

## Incremento implementado — 2026-10-05

Plantilla factual determinista en src/review-ui/public/brief-model.mjs, consumida por brief.html/brief.js y probada directamente en Node. Genera factsUsed, citations, uncertainties, copy, narración y tomas; estado needs_human_review. No orquestador AI ni herramientas remotas. Ver ../runbooks/brief-local.md.
