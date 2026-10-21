# Fase 8 — WhatsApp

Estado: Adapter no configurado.

## Entrada

Dependencias: Número/destino real y permiso de contacto; fase 7 si atribuye pedidos.
Insumos: CTA, campaña, link/contacto autorizados y esquema de eventos.

## Implementación prevista

Contact link != mensaje enviado. Normalizar número permitido, escape texto y minimizar PII. Visita/click/conversación/pedido separados; mensajes necesitan integración autorizada distinta.

Archivos previstos (no creados por esta fase documental):

- src/integrations/whatsapp/contact-link.service.js
- src/analytics/attribution.service.js

## Gate de aceptación

Destino real, encoding/privacidad y tracking test controlado; no llamadas Meta ni mensajes sin autorización; no pedidos inferidos.
Registrar checks, fuente de evidencia, fecha, fallos y limitaciones. No usar mocks como resultado externo.

## Fuentes y reglas

Consultar MARKETING.md, OPERACION.md en docs/development y el índice FUENTES.md. Versionar cambios y preservar la base.
