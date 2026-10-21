# Imagen, audio y video

Renderer local y editor implementados: [guía](../runbooks/editor-local.md). Generación AI pendiente. El resto del pipeline es especificación salvo evidencia indicada.
Cada asset tiene owner, origen propio/licenciado/generado, evidencia de derechos, hash SHA-256, MIME detectado, bytes, dimensiones, metadata y receta/versiones.
Guardar original inmutable, derivados y QC. Revocar derechos bloquea derivados aún no publicados. Cache cambia si cambian fuentes, modelo, prompt o renderer.

Brief con evidencia -> derechos -> guion -> storyboard/shot list -> imagen/audio -> render -> preflight -> revisión -> asset aprobado.
FFmpeg/ffprobe 9.0.2 portátiles implementados para inspección/transcode; Sharp para derivados; Remotion opcional para composiciones, revisar licencia. Ver REPOSITORIOS.md.
QC: contenedor/codec/duración/fps/audio, frames negros, texto legible, corrupción, tamaño y visualización real en móvil.
64 MiB/un chunk es el límite local actual, no el máximo universal TikTok.
Preset editorial inicial 9:16 recomendado; requisitos exactos por fuente vigente y soporte del renderer. No exigir 1080x1920 universalmente.
Preview y final pueden diferir en compresión; la aprobación liga el hash final con una vista reproducible del mismo contenido.
Texto/subtítulos editables; audio con derechos comerciales adecuados al uso, no presunción por biblioteca disponible.

No insertar automáticamente marca de agua/promoción de la aplicación en contenidos compartidos; revisar guías y origen de branding del usuario.
Fotos generadas de producto no acreditan características físicas, medidas o material no documentados.
No clonar rostro/voz ni reutilizar medios ajenos sin evidencia de derechos. Máximos tiempo/costo/cuota por job antes de habilitar proveedores.
Fuentes: [FFmpeg](https://github.com/FFmpeg/FFmpeg), [Sharp](https://github.com/lovell/sharp), [guías de contenido](https://developers.tiktok.com/docs/en/content-sharing-guidelines).
