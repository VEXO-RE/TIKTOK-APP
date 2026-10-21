# Plan de fases y gates

Mantener la numeración de docs/PHASES.md. El usuario cierra Sandbox; la fase documental se entrega aquí. App Review/producción no se consideran aprobados.

| Fase | Situación real | Entregable/gate |
|---|---|---|
| 0 Foundation | Base implementada | Preservar; gaps multiusuario/seguridad en AUDITORIA |
| 1 Developer App | OAuth Sandbox validado | Evidencia y permisos; portal/producción separado |
| 2 Upload | Publicación manual confirmada | Preservar flow; no regresión ni cambio flags |
| 3 Direct Post | Diferido | Documentación, permisos, UX y auditoría específica antes de código |
| 4 Editorial | Schema inicial | Revisiones/ownership/aprobación persistente y transiciones probadas |
| 5 Creative | Pendiente | Brief factual, derechos, generación/render/QC y aprobación |
| 6 Scheduling | Pendiente | Outbox/jobs/idempotencia/recovery, envío aprobado con publicación manual |
| 7 Tiendanube | Stub | Lectura real autorizada, snapshots, pagination y datos no inventados |
| 8 WhatsApp | Stub | Contactos reales/consentimiento; link no equivale a envío o conversión |
| 9 MCP | Foundation | Herramientas sobre backend listo y autorización; readonly inicial |
| 10 Other Networks | Pendiente | Un adaptador probado; permisos/estados de cada red separados |

## Orden práctico

Hardening local y fase 4 -> fase 7 readonly para producto real -> fase 5 -> fase 6.
Diseño/marketing se documentan con fases 4/5. Fase 8 añade atribución real.
Fase 9 puede habilitar solo servicios ya listos; no esperar ni simular todas las integraciones.
Fase 10 necesita contrato de capabilities probado. Fase 3 y Business/Shop no desbloquean editorial y continúan opcionales/diferidos.

Cada fase tiene su guía en phases/. No marcar completa por carpetas o green tests.
