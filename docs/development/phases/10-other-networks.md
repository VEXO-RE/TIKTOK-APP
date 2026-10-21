# Fase 10 — Other Networks

Estado: Pendiente.

## Entrada

Dependencias: Editorial/media/job/capability contracts probados.
Insumos: Una nueva plataforma elegida y su documentación/auth.

## Implementación prevista

Separar publish vs draft vs schedule vs status/metrics. IDs/auth/UX por red. No asumir stories/reels/carousels por enum genérico.

Archivos previstos (no creados por esta fase documental):

- src/providers/provider-capability.js
- src/providers/provider.registry.js

## Gate de aceptación

Un adaptador real y contratos/error tests propios; regresión TikTok; scopes/operación probados. Business/Shop no se activan por este paso.
Registrar checks, fuente de evidencia, fecha, fallos y limitaciones. No usar mocks como resultado externo.

## Fuentes y reglas

Consultar CAPACIDADES-TIKTOK.md, ARQUITECTURA.md en docs/development y el índice FUENTES.md. Versionar cambios y preservar la base.
