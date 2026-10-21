# Fase 1 — Developer App

Estado: OAuth Sandbox validado; producción independiente.

## Entrada

Dependencias: Cuenta, callback registrado y permisos efectivos.
Insumos: Login Kit, user.info.basic, auth/state/token store.

## Implementación prevista

Preservar state de uso único, scopes reales y conexión. Los tokens siguen en memoria. Demo y portal se verifican antes de afirmar live.

Archivos previstos (no creados por esta fase documental):

- docs/evidence/login-kit.md

## Gate de aceptación

Evidencia autorización/callback/exchange separada del estado del portal. No reabrir fase para activar otros productos.
Registrar checks, fuente de evidencia, fecha, fallos y limitaciones. No usar mocks como resultado externo.

## Fuentes y reglas

Consultar CAPACIDADES-TIKTOK.md, OPERACION.md en docs/development y el índice FUENTES.md. Versionar cambios y preservar la base.
