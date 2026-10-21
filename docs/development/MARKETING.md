# Marketing, embudos y campañas

Propuesta, sin métricas ni campañas pagadas inventadas.
Embudo: awareness -> consideración -> CTA real -> destino Tiendanube/WhatsApp -> conversión verificable -> seguimiento consentido.
Definir audiencia con investigación citada, problema, propuesta respaldada, objetivo y evidencia.
Visita no es lead; click WhatsApp no es conversación; envío Inbox no es publicación.

Campaign: objetivo, audiencia justificada, owner, rango/zona, revisiones, referencias de catálogo, CTA/destinos aprobados, hipótesis y medición.
Organic y paid separados. Paid necesita Business API, advertiser autorizado, budget/moneda, límites y aprobación independiente; video.upload no habilita Ads.
No ejecutar creación de anuncios desde un brief. Preparar campaña no es gastar.

Copy: mensaje/prueba/objeción/acción. No escasez, reviews, descuentos, garantía o KPI inventados. Revisar divulgación comercial aunque sea organic.
Fuentes comerciales vigentes y voz de marca. Variantes con hipótesis, no ganadora sin experimento.
UTM solo en destino realmente clicable; caption con URL no demuestra enlace funcional.
Tracking con IDs propios/consentimiento, deduplicación y timestamp; atribución es regla versionada, no causalidad garantizada.
CTR usa mismo alcance/ventana y datos reales; falta denominator -> no disponible.
ROAS/ROI solo con costes/ingresos verificados y fórmula documentada.
No cruzar cuentas/personas por heurísticas ni mezclar métricas de proveedores.

Experimento: hipótesis/métrica primaria/ventana y muestra según negocio; balance y cambios concurrentes. Comparación descriptiva no significa significancia estadística.
Dashboard siempre fuente, timestamp y permiso; datos sintéticos solo pruebas identificadas.
Gate: brief, destinos, derechos, copy/activos aprobados y tracking probado. Reporting/Ads requiere su propia documentación.
Fuente Business: [SDK oficial](https://github.com/tiktok/tiktok-business-api-sdk).

## Incremento local implementado — 2026-10-05

Planificador orgánico en review-ui/public/campaign.html/campaign.js/campaign-model.mjs: estrategia con fuentes, briefs snapshot, etapas del embudo, fechas UTC y biblioteca local. No Ads, métricas, conversión ni scheduler. Ver [guía](../runbooks/campaign-local.md). Regresión 85/85 y QA escritorio/móvil aprobadas sin proveedor.
