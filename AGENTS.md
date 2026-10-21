# Reglas del proyecto ShopinistaMeta

Leer docs/development/README.md y la guía de fase pertinente. Las instrucciones actuales del usuario y los permisos efectivos prevalecen sobre estas reglas locales.

## Evidencia y alcance

- Clasificar capacidades: comprobada, implementada sin prueba operacional, propuesta o pendiente.
- Endpoints, scopes, límites y estados de TikTok solo de fuentes oficiales actuales; registrar URL y fecha. Un SDK no prueba autorización.
- No inventar catálogo, precios, stock, conversiones, métricas, publicación ni aprobación del portal.
- Developers, Business y Shop tienen credenciales y permisos separados. Direct Post sigue diferido.
- Esta entrega es documental: schemas, carpetas y especificaciones no equivalen a implementación.

## Cambios y seguridad

- Inspeccionar estado/diff, preservar trabajo; no reset, restore, limpieza o staging global.
- Sin commit/push, envío, publicación o gasto externos salvo autorización específica.
- Tareas documentales no cambian OAuth, .env, flags, lockfile ni dependencias.
- Tokens de desarrollo en memoria; no secretos, códigos OAuth, URLs firmadas ni PII en Git, logs, fixtures o prompts.
- La sesión en memoria actual no ofrece aislamiento multiusuario. Antes de producción diseñar autenticación y autorización por cuenta.
- Skills y plugins de Codex no son servicios ya integrados en el runtime.

## Lógica y validación

- Aprobación del servidor ligada a versión, hash, destino y cuenta; cambios relevantes la invalidan.
- No reintentar ciegamente un resultado desconocido: reconciliar primero.
- Inbox no es publicación. Mantener evidencia manual, API y webhook separadas.
- Pruebas de negocio sin llamadas reales ni gasto por defecto. Datos de test explícitamente sintéticos.
- Seguir gates de docs/development/FASES.md. Existencia de archivos no certifica funcionamiento.
- Consultar AGENTS.md de la sección y .agents/skills/tiktok-development/SKILL.md cuando proceda.
