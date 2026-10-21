# Fase 9 — MCP

Estado: Foundation only; sin servidor operativo.

## Entrada

Dependencias: Backend service real y ownership; versión SDK estable.
Insumos: Capabilities disponibles, schemas de tool, política readonly y cuenta.

## Implementación prevista

Una misma autorización para API/tools, readonly inicial, recursos acotados. Calendar/status sí si servicios existen; performance no si faltan scopes. Tool annotation no mecanismo de seguridad.

Archivos previstos (no creados por esta fase documental):

- src/mcp/server.js
- src/mcp/tools/register.js
- src/mcp/policies/authorization.js

## Gate de aceptación

Inputs/tenant/readonly/rate y prompt injection tests; lectura real mínima. Writes solo backend probado+permiso+política+consentimiento.
Registrar checks, fuente de evidencia, fecha, fallos y limitaciones. No usar mocks como resultado externo.

## Fuentes y reglas

Consultar SKILLS-PLUGINS.md, REGLAS.md en docs/development y el índice FUENTES.md. Versionar cambios y preservar la base.
