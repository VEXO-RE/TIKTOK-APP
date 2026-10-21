# Decisiones propuestas

No instalan ni configuran software.

| ADR | Propuesta | Alternativa y criterio |
|---|---|---|
| 01 | Express/ESM modular | TypeScript gradual si mejora contratos, sin rewrite general |
| 02 | PostgreSQL/outbox + BullMQ/Redis | Temporal solo si workflows largos lo justifican; no dos motores |
| 03 | JSON Schema 2020-12 + Ajv adoptado parcialmente para ContentRevision | Zod si adopción TS; no contratos divergentes |
| 04 | Object storage + render aislado | Local dev permitido sin simular durabilidad productiva |
| 05 | FFmpeg/ffprobe y Sharp | Remotion opcional; revisar licencia y costo |
| 06 | Prompts versionados y evals | Promptfoo/Langfuse opcionales, datos redacted |
| 07 | MCP sobre servicios internos | No duplicar aprobación/autorización |
| 08 | Analítica y atribución separadas | No inferir pedidos/ROI desde vistas |

Antes de adoptar: caso real, versión exacta, Node soportado, licencia de versión, costo, volumen, secretos, rollback.
Fijar versiones en lockfile; main de SDK no equivale a release estable. No instalar todo el catálogo.

## ADR-03 — corte runtime 2026-10-09

Se adoptan `ajv@8.20.0` y `ajv-formats@3.0.1`, versiones exactas y licencia MIT, para compilar `content-revision.schema.json` como Draft 2020-12. Ajv requiere la clase específica 2020 y no incluye formatos; `ajv-formats` valida `date-time`. Node del proyecto es >=20 y la versión elegida soporta Node vigente. Instalación y `npm audit --omit=dev`: cero vulnerabilidades reportadas.

El alcance es deliberadamente parcial: el repositorio de revisiones valida snapshots al escribir y leer, con `strict`, todos los errores y formatos completos. No coerciona, no agrega defaults y no elimina campos. Ownership, expectedRevision, hashes, transición/aprobación y bloqueo de archivado permanecen en servicios; el schema no reemplaza esas reglas.

Rollback: retirar el validador del repositorio y ambas dependencias conserva la validación de negocio previa, pero elimina la garantía runtime del contrato. Pendiente: evaluar cada schema restante con su caso vertical antes de compilarlo; no se declara validación universal.

Fuentes consultadas 2026-10-09: https://ajv.js.org/json-schema.html, https://github.com/ajv-validator/ajv/releases/tag/v8.20.0, https://github.com/ajv-validator/ajv/blob/v8.20.0/LICENSE y https://github.com/ajv-validator/ajv-formats/blob/master/package.json.
