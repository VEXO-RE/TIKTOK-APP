# Campañas orgánicas locales

Implementado 2026-10-05. Abre http://localhost:4100/review/campaign.html. No requiere token TikTok. No programa envíos ni anuncios; no llama a catálogo o proveedores.

## Uso

1. Prepara y guarda briefs reales en [la biblioteca](brief-local.md).
2. Define nombre, objetivo (descubrimiento, consideración o consultas), audiencia propuesta y fuente de investigación.
3. Registra hipótesis y métrica propuesta. Son planificación, no resultados medidos.
4. Define rango de fechas UTC y zona de referencia. Selecciona briefs, etapa del embudo y fecha/hora UTC de cada pieza.
5. Puedes declarar destino HTTPS real sin credenciales. No se verifica el enlace ni se afirma que el caption sea clicable.
6. Prepara y revisa el plan. Guarda en este navegador o descarga JSON. Ver plan guardado recupera su copia de datos y fuentes.
7. Cambiar campos invalida el resultado mostrado. Las piezas siguen needs_human_review; la campaña sigue draft, not_measured y not_verified. No hay aprobación, scheduler ni publicación en esta pantalla.

Cada pieza conserva snapshot independiente de nombre/cantidad/color/estilo, copy derivado, fuentes y fecha de consulta. Que el snapshot exista no demuestra vigencia; confirmar catálogo, derechos y datos antes de usar medios y aprobar en el flujo conectado.

## Límites

Hasta veinte piezas por campaña y diez campañas por navegador. Identificador de brief único por campaña y no dos piezas en el mismo instante UTC dentro del plan. No valida conflictos entre campañas ni inventa frecuencia mínima TikTok.
Horas UTC ISO canónicas; zona válida por Intl, solo referencia, sin conversión implícita. Rango fecha UTC inclusivo; permite planes históricos como borradores, sin ejecutar acciones.
Persistencia en localStorage del origen: cambiar localhost por otra dirección, navegador o borrar datos no comparte/conserva biblioteca. Descarga copias. No es DB productiva, multiusuario ni outbox.
Biblioteca corrupta, exceso de tamaño o cuota se rechazan sin reemplazar datos automáticamente. Lectura regenera campaña desde inputs; estados, métricas o copy manipulados no se toman como aprobaciones.
Campañas guardadas se consultan/descargan; no edición in situ, importación de campañas ni analítica real en este incremento.

## Evidencia

85/85 tests aprobados, cero fallos y omitidos; siete pruebas nuevas de campañas sobre snapshots, estados, UTC/rango/zona/conflictos, destinos, datos adversariales y almacenamiento.
Playwright/Chrome: brief guardado -> campaña -> plan -> guardar -> recargar -> recuperar -> descarga JSON real; escritorio y móvil 390 px sin desbordamiento, solicitudes externas ni errores JS. Datos explícitamente sintéticos.
TikTok en App Review según usuario; envío del editor e Inbox/publicación reales siguen pendientes. La planificación local no modifica OAuth, .env, flags ni Direct Post.
