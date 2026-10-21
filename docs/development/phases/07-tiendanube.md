# Fase 7 — Tiendanube

Estado: Adapter no configurado.

## Entrada

Dependencias: Cuenta/tienda app auth y documentación oficiales; revisar proyectos existentes antes de reutilizar.
Insumos: Productos/categorías/URLs/imágenes/precio/stock leídos con autorización.

## Implementación prevista

Readonly primero, pagination/retry limit según API vigente, normalizar moneda/locales/IDs y conservar source/fecha. Snapshots expirados bloquean claims. Webhooks solo si documentados/autorizados.

Archivos previstos (no creados por esta fase documental):

- src/integrations/tiendanube/catalog.service.js
- src/integrations/tiendanube/snapshot.repository.js
- src/integrations/tiendanube/catalog.mapper.js

## Gate de aceptación

Lectura real y reconexión, origen correcto de tienda, pagination/error y caducidad; stubs no éxito simulado.
Registrar checks, fuente de evidencia, fecha, fallos y limitaciones. No usar mocks como resultado externo.

## Fuentes y reglas

Consultar FUENTES.md, MARKETING.md en docs/development y el índice FUENTES.md. Versionar cambios y preservar la base.
