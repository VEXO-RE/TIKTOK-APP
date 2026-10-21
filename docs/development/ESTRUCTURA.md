# Estructura documental y expansión

Las carpetas nuevas contienen reglas y especificaciones completas, no servicios vacíos. Los módulos pendientes conservan estado documented_not_runtime.
structure.json enumera archivos documentales presentes y proposedCodeFiles de cada fase.

## Secciones

identity, content/editorial/approval/calendar, agents, design, media, marketing, scheduling, analytics, integrations, tiktok, mcp, review-ui y config.
tests y scripts tienen reglas para verificación sin red/gasto. docs/design, media, marketing y runbooks tienen entregables específicos.
Skill local en .agents/skills/tiktok-development con router y UI metadata.
Contratos propuestos en docs/development/contracts; schema existente en src/content/calendar se conserva.

## Crear código después

Leer guía de fase y DEVELOPMENT.md -> implementar caso vertical con contrato/service/adaptador/UI/tests -> comprobar gate -> actualizar manifest/evidencia.
No generar .js que lancen success ni agregar bibliotecas solo porque existe una carpeta.
Nueva sección exige responsabilidad/contrato/fuente/riesgo/pruebas; si resuelve algo ya cubierto, reutilizar antes de duplicar.
Originales/drafts/render outputs van en almacenamiento/lifecycle futuro; no repo por defecto.
