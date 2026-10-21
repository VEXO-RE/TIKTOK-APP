# Desarrollo de Scripts

Estado: especificación documental; revisar AUDITORIA.md para qué ya existe.

## Responsabilidad

Verificaciones y tareas explícitas.

## Límites e invariantes

Cwd/destinos verificados; scripts docs readonly; no retry externo ciego; no deploy/post ocultos. API/tools/UI pasan por el mismo servicio autorizado cuando se implemente. No retornar éxito sintético para completar estructura.

## Archivos y dependencias

Consultar docs/development/structure.json y guía de fase en docs/development/phases/. Crear código previsto junto con incremento vertical y pruebas, no scaffolds vacíos.

## Criterio de aceptación

Salida/exit code honesta y casos de error. Guardar evidencia con scope/fecha; pruebas con mocks no acreditan proveedor real.

## Referencia

Reglas detalladas en docs/development/PIPELINE.md; contrato/fuentes de proveedor en el índice principal. Este módulo no instala plugins, dependencias ni cambia flags.

## Instalador explícito de medios

setup-media.mjs instala únicamente FFmpeg/ffprobe portátiles fijados y verificados por SHA-256, con licencia/manifiesto, en tools/ffmpeg excluido de Git. Es una excepción concreta a los scripts de verificación de solo lectura; no cambia dependencias Node, OAuth, .env ni flags. Ver docs/runbooks/editor-local.md.
