# Skills y plugins

Fecha: 2026-10-04. Integración documental/router, no instalación de servicios externos.

## Skill del proyecto

.agents/skills/tiktok-development/SKILL.md coordina documentación/fases y preserva invariantes.
Invocación sugerida: $tiktok-development. Ubicación repo para entornos que descubran .agents/skills; recargar/iniciar sesión y comprobar catálogo, no afirmar que esta sesión ya la cargó automáticamente.
No autoriza publicaciones, gasto, conexión o deploy por el hecho de activarse.

## Skills existentes verificadas por ruta

| Capacidad | Archivo de consulta | Uso |
|---|---|---|
| Imagen | C:/Users/HP-Home/.codex/skills/.system/imagegen/SKILL.md | Generar/editar visuales autorizados |
| Motion | C:/Users/HP-Home/.agents/skills/motion-design/SKILL.md | Transiciones/animación |
| Stitch router | C:/Users/HP-Home/.codex/plugins/cache/openai-curated-remote/engineering-suite-stitch-design/2.0.0/skills/entry-stitch-design/SKILL.md | Entrada del plugin y workflow |
| Stitch generación | C:/Users/HP-Home/.codex/plugins/cache/stitch-skills/stitch-design/1.0.0/skills/generate-design/SKILL.md | Pantallas/variantes |
| Ipanema | C:/Users/HP-Home/.codex/skills/ipanema-tiendanube/SKILL.md | Solo cambios del tema Shopinista, no API catálogo |

También disponibles en el catálogo: documentos, PDF, spreadsheets y presentaciones para artifacts cuando se requieran; no son dependencias de runtime.
Leer la skill elegida en su tarea específica. Rutas de cache pueden cambiar; buscar en catálogo antes de declarar ausencia.
No todas se aplican automáticamente por mencionar diseño o marketing.

## Plugins encontrados

Figma, Google Drive y Linear: encontrados disponibles pero no instalados en la consulta. Propuestos para diseño, activos y backlog.
Supermetrics y Metricool: encontrados disponibles pero no instalados; opciones para fase analítica, sin presumir acceso a cuentas/métricas ni capacidades particulares autorizadas.
Stitch: skills y herramientas presentes; autenticación no comprobada aquí. No hubo resultados nuevos en búsqueda del directorio, lo que no niega el plugin local.
GitHub: herramientas disponibles y fuentes públicas consultadas; no hubo escritura/PR/push.

Catálogo obtenido por Plugin Management, no por suposición desde package.json.
[Directorio](https://chatgpt.com/plugins). Conectar cada proveedor y hacer una lectura real mínima antes de marcar conectado.

## Reglas de integración

Definir dueño, datos mínimos, permisos readonly/write, credenciales por referencia, prueba de conexión, errores y revocación.
Figma/Drive/Linear no añaden automáticamente usuarios/roles a nuestra app.
Un plugin de Codex no se instala como npm ni resuelve la API TikTok en producción.
Solo introducir librería/MCP productivo en su fase, con autorización/schema/backend real y política server-side.
