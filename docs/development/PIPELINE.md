# Pipeline de desarrollo y producción de contenidos

Diseño documental; no workflow CI activado ni servicios implementados.

## Pipeline de una fase

1. Inspeccionar estado, reglas y capability/source vigente.
2. Especificar contrato, casos reales, riesgo y gate en phases/.
3. Resolver ADR de stack/versions y auth necesarios.
4. Implementar un incremento vertical: input -> regla -> storage/service -> UI -> evidencia.
5. Pruebas significativas con proveedores mocked; checks locales y de seguridad.
6. Prueba operacional explícita con cuenta/contenido autorizados, sin secretos.
7. Registrar evidencias diferenciadas; actualizar estado/fase después de demostración.
8. Revisar diff y exclusiones antes de cualquier commit/push autorizado.

## Contenido

Fuentes reales -> brief -> assets/rights -> render/QC -> snapshot aprobado -> agenda -> job -> gate -> Upload -> Inbox -> usuario publica -> evidencia -> medición.
Modo actual solo Upload; scheduler no es publicación directa.
Cancelación/cambio relevante revoca; retry budget y unknown reconciliation en servicios, no solo UI.

## Gate CI propuesto

En PR: instalación reproducible desde lockfile, node scripts/verify-documentation.mjs, npm test, npm run verify y git diff --check.
Scanner de secretos y auditoría de dependencias solo cuando herramientas/licencias/versiones estén adoptadas.
Pruebas de IA/media reales con cuota separada, opt-in y fixtures propias.
No llamadas TikTok ni gasto en CI de pull requests.
Fijar actions por SHA verificado al crear workflow; no hash inventado en plantilla.
Sin deploy automático, secrets productivos ni publicación programada por este documento.
Logs de evidencia omitidos de artifacts si contienen PII/secrets.

## Carpeta completa por sección

AGENTS.md + DEVELOPMENT.md explican propósito/reglas/archivos/gate.
structure.json enumera documentos reales y proposedCodeFiles futuros con status planned.
El verificador documental no aprueba propuesta como runtime. Código se agrega cuando el incremento cumple su gate.
