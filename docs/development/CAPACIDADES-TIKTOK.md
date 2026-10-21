# TikTok: capacidades y límites

Consulta: 2026-10-04. Autorización real en docs/SCOPES.md; estado operacional en docs/PROJECT-VALIDATION.md.

| Familia | Estado aquí | Plan |
|---|---|---|
| Login Kit/user.info.basic | Sandbox implementado | Preservar |
| video.upload | Inbox/publicación manual confirmados | Preparar/subir aprobado |
| video.publish/Direct Post | Diferido/deshabilitado | Gate específico de fase 3 |
| Display/video.list | Sin permiso solicitado | Analítica futura |
| Business | No configurado | Campañas/Ads por integración separada |
| Shop | Diferido | Fuera del desarrollo actual |

Upload crea borrador; publicación permanece manual. [Referencia Upload](https://developers.tiktok.com/docs/en/content-posting-api-reference-upload-video).
Status distingue entrega Inbox y PUBLISH_COMPLETE; un publish_id puede tener varias publicaciones. Conciliación por polling/webhook solo cuando configurado. [Referencia status](https://developers.tiktok.com/docs/en/content-posting-api-reference-get-video-status).
Display y scopes adicionales no se obtienen con video.upload. [Display](https://developers.tiktok.com/docs/en/display-api-overview).
SDK Business no otorga autorización ni reemplaza Login Kit. [SDK oficial](https://github.com/tiktok/tiktok-business-api-sdk).
Media del servidor y modalidad de transferencia se revisan antes de PULL_FROM_URL/ownership. [Guías](https://developers.tiktok.com/docs/en/content-sharing-guidelines).
No asumir permisos, cuotas o campos de anuncio sin fase propia de documentación.
