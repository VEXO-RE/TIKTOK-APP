# Desarrollo de Identity

Estado: servicio de ciclo de vida de sesión local implementado; autenticación productiva, roles y conexión por cuenta pendientes.

## Responsabilidad

Identidad de aplicación, roles y ownership antes de multiusuario.

## Límites e invariantes

Autorización service/server-side, contexto de sesión/tenant, referencias de conexión; secrets fuera de docs. API/tools/UI pasan por el mismo servicio autorizado cuando se implemente. No retornar éxito sintético para completar estructura.

## Archivos y dependencias

Consultar docs/development/structure.json y guía de fase en docs/development/phases/. Crear código previsto junto con incremento vertical y pruebas, no scaffolds vacíos.

## Criterio de aceptación

Cuenta cruzada rechazada; conexión no compartida por token store global. Guardar evidencia con scope/fecha; pruebas con mocks no acreditan proveedor real.

## Referencia

Reglas detalladas en docs/development/OPERACION.md; contrato/fuentes de proveedor en el índice principal. Este módulo no instala plugins, dependencias ni cambia flags.

## Incremento local — 2026-10-09

`session.service.js` crea contextos aislados, rota la sesión cuando cambia la referencia de cuenta, elimina sesiones vencidas y aplica un límite. `local.routes.js` lo usa sin aceptar tenant/actor desde HTTP. Esto endurece solamente el modo local de un operador: el token store continúa global y no acredita aislamiento multiusuario ni cierra el ítem 1 del backlog.
