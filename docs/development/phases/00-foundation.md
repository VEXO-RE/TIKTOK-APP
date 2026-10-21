# Fase 0 — Foundation

Estado: Base existente; ampliaciones de operación pendientes.

## Entrada

Dependencias: Inventario/diff; conservar runtime y scripts.
Insumos: package.json, server.js, core, config y security actuales.

## Implementación prevista

Aislar sesión/tenant antes de multiusuario. CorrelationId, errores seguros y contratos de autorización. No reemplazar conexión en memoria sin diseño explícito.

Archivos previstos (no creados por esta fase documental):

- src/identity/session.service.js
- src/identity/authorization.service.js
- src/core/request-context.js

## Gate de aceptación

Acceso cruzado rechazado; logs sin secrets; smoke existente sin regresión. No certifica producción.
Registrar checks, fuente de evidencia, fecha, fallos y limitaciones. No usar mocks como resultado externo.

## Fuentes y reglas

Consultar AUDITORIA.md, OPERACION.md en docs/development y el índice FUENTES.md. Versionar cambios y preservar la base.

## Incremento de sesión local — 2026-10-09

`src/identity/session.service.js` extrae del router editorial la creación, reutilización, expiración, límite y rotación por referencia de cuenta de las sesiones locales. Cada contexto conserva tenant, CSRF, revisiones, activos y calendario separados; tenant y actor no se aceptan desde HTTP.

Evidencia ejecutada: 2/2 pruebas nuevas de identidad, 16/16 pruebas dirigidas de UI/rutas y 2/2 pruebas del renderer nativo. `verify-documentation` aprobó 82 archivos, 11 guías de fase, 18 módulos y 22 repositorios. Las pruebas usan identidades y proveedores sintéticos; no acreditan TikTok ni aislamiento productivo.

El gate continúa abierto: no existen autenticación/roles de aplicación y el token store de TikTok sigue siendo global y en memoria. Este incremento no debe presentarse como sesión multiusuario ni conexión segregada por cuenta.
