# Editor local de video

Implementado y verificado el 2026-10-05. Pantalla: http://localhost:4100/review/editorial.html. Solo operador local; consultar [flujo editorial](editorial-local.md) para conexión, sesión y límites de envío.

## Uso

1. Reinicia el servidor con Ctrl+C y npm start si estaba ejecutándose antes del cambio. El estado es en memoria: conserva publishId y concilia intentos pendientes antes de reiniciar. Vuelve a conectar TikTok.
2. Guarda borrador y carga el video base. El original se conserva sin modificaciones.
3. Ajusta plantilla, formato vertical/cuadrado/horizontal/original, encuadre, resolución 720/1080, recorte y velocidad. También hay giro, espejo, brillo, contraste, saturación y fundidos.
4. Añade música y voz propias o licenciadas; puedes grabar tu voz con permiso del navegador. Ajusta volumen, inicio y desplazamiento de cada pista. PNG/JPEG permite superponer una imagen o logo.
5. Añade textos temporizados y subtítulos editables o importa SRT. Los tiempos corresponden al video resultante. No hay transcripción automática.
6. Declara tipo y evidencia de derechos antes de añadir medios o exportar. Elegir una plantilla no acredita derechos. Puedes guardar hasta veinte ajustes con nombre en este navegador; los derechos se confirman para cada video.
7. Exporta MP4 y reproduce el resultado completo. Descarga disponible. Aprueba esta nueva revisión y envía los mismos bytes a Inbox.
8. Copia el texto para pegarlo en TikTok. video.upload no transporta descripción ni selecciona música de su biblioteca. Publicación final y comprobación ocurren en TikTok.

## Instalación reproducible

FFmpeg/ffprobe portátiles están en tools/ffmpeg/bin, excluidos de Git. Para otro checkout ejecuta node scripts/setup-media.mjs; requiere red. Alternativa: node scripts/setup-media.mjs --archive RUTA_ZIP.
Instalador Windows fijado en FFmpeg 9.0.2 essentials, distribución Gyan GPLv3; conserva licencia y manifiesto.
SHA-256 del ZIP: 60f467265b1e312373dbcd92200c2618a74850f98d3d078e94296bb3fa2047ba.
Fuentes: [descargas FFmpeg](https://ffmpeg.org/download.html), [distribución Windows](https://www.gyan.dev/ffmpeg/builds/), [filtros](https://ffmpeg.org/ffmpeg-filters.html).

## Garantías y límites

Render nativo mediante proceso separado sin shell; fuentes originales, receta normalizada y hashes conservados. Inspección ffprobe del resultado MP4/H.264, audio cuando procede, dimensiones, duración y tamaño. No es detección automática de frames negros ni certificación de derechos.
Un render simultáneo por proceso, timeout 180 segundos, salida máxima 180 segundos, fuentes hasta 600 segundos y resolución de fuente máxima 4096 por dimensión. Medios adicionales hasta 8 MiB cada uno; memoria agregada 64 MiB incluyendo originales y derivados. Exportación H.264, yuv420p, 30 fps, AAC cuando hay audio. Ocho textos y ochenta cues como máximo.
Render/edición de pistas bloquea aprobación y envío hasta exportar. Una exportación correcta crea revisión nueva y revoca aprobación; fallo conserva resultado anterior. Restaurar vuelve al original y elimina pistas/receta. El video aprobado está ligado al hash final y a la cuenta.
Archivos temporales propios se limpian al finalizar. Borradores, archivos, recetas e intentos no son durables; un cierre abrupto puede dejar temporales. Los presets guardan ajustes en localStorage del navegador.
Alcance: un video base, mezcla de música/voz e imagen superpuesta. No hay timeline multiclips, generador de música/voz, catálogo musical, transcripción, generación AI ni scheduler automático.

## Evidencia

68/68 tests aprobados, cero omitidos. Pruebas nativas con FFmpeg: música MP3, voz WebM/Opus, logo PNG, textos, subtítulos, recorte, velocidad y variantes de encuadre; original intacto y resultado MP4 comprobados.
Playwright con Chrome: escritorio y móvil 390 px, sin errores JS ni desbordamiento horizontal; exportación nativa y recorrido de aprobación/envío con proveedor simulado.
Esto no acredita subida ni publicación real de un video editado. La publicación manual previa informada por el usuario pertenece al flujo anterior. Grabación de micrófono real y primer envío editado requieren comprobación operativa.

### Corrección de exportación — 2026-10-09

El servidor rechazó una solicitud reportada por el usuario con `MEDIA_RECIPE_INVALID`; por separado, el usuario confirmó manualmente haber llenado tipo y referencia de derechos. No se capturó ese payload en navegador. La revisión encontró que los bucles numéricos y de texto no sobrescribían `rights`, pero aplicar una plantilla guardada limpiaba los controles porque los presets excluyen derechos deliberadamente.

Ahora las plantillas conservan la confirmación visible del video actual, `editorRecipe()` rechaza localmente tipo o referencia ausentes y el error de exportación se muestra en `ed-result`; los controles se habilitan de nuevo al finalizar. La prueba dirigida fue 18/18, incluido renderer nativo, y `git diff --check` pasó. La inspección del navegador activo no se acreditó: la herramienta terminó inesperadamente dos veces. No hubo envío nuevo a TikTok ni confirmación manual de Inbox/publicación. Una exportación correcta continúa revocando cualquier aprobación anterior.
