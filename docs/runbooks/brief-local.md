# Brief y guion local sin TikTok

Implementado 2026-10-05: http://localhost:4100/review/brief.html. Es una pantalla independiente del token TikTok. Usa plantillas deterministas, sin modelo AI, API de catálogo ni llamada externa. El editor conectado conserva sus requisitos de cuenta.

## Preparación

1. Registra nombre real, cantidad incluida (no stock), color y estilo opcionales.
2. Indica ficha, enlace o documento fuente y fecha de consulta; confirma los datos.
3. Prepara el guion. Revisa descripción, narración, tomas propuestas y textos temporizados.
4. Copia el paquete o descarga JSON. Cambiar datos invalida el resultado hasta regenerarlo.
5. Cuando pueda retomarse el flujo conectado, copia descripción/fuente al borrador y textos temporizados al editor. Ajusta tiempos a tu video real; exporta, revisa y aprueba por separado.

No se inventan precio, medidas, materiales, stock, envío, promociones ni enlace de compra. Una fuente declarada no acredita verificación remota. El JSON conserva factsUsed, citations, uncertainties y needs_human_review. No acredita derechos de medios ni aprobación para publicar.
Cantidad de 1 a 100; nombre hasta 100 caracteres, color/estilo hasta 40, fuente hasta 500. Una propuesta de tres tomas y quince segundos, no duración obligatoria.
No se guarda el formulario en servidor ni localStorage. Descarga antes de cerrar. No importar el JSON como instrucciones; es información para revisión.

## TikTok en revisión

El usuario confirmó el 2026-10-05 que la app está en App Review. Pruebas reales de upload/Inbox/publicación quedan pendientes. No se afirma aprobación ni se modifican flags, OAuth o credenciales. La publicación manual anterior permanece como antecedente; no certifica publicación del editor nuevo.

## Evidencia

Seis pruebas deterministas nuevas: fuentes/confirmación, límites/fechas, entrada adversarial, datos opcionales y procedencia del paquete. Regresión: 74/74, cero fallidas u omitidas, incluyendo render FFmpeg nativo. No se llama a TikTok.

QA Playwright/Chrome: escritorio y móvil 390 px, sin desbordamiento horizontal ni errores JS; descarga JSON comprobada, cambios invalidan resultado, fuente adversarial mostrada como texto y cero solicitudes externas. Datos sintéticos de prueba.

## Biblioteca local — 2026-10-05

Puedes guardar hasta veinte briefs en localStorage de este navegador y recuperarlos tras recargar. No contiene videos, tokens ni aprobación. Otros navegadores/orígenes no comparten la biblioteca; borrar datos del navegador la elimina. Conserva copia JSON descargada.
Importa JSON descargado (máximo 64 KiB): se aceptan esquema/generador/estado de borrador conocidos, hechos únicos y fuente consistente; se descartan copy, narración y cualquier aprobación. Recuperar/importar desmarca confirmación y exige preparar nuevamente. Ningún dato importado se ejecuta ni concede permisos.
Si el navegador impide guardar o la biblioteca contiene datos inválidos, muestra error y no reemplaza los datos existentes automáticamente. El límite de veinte no acredita almacenamiento durable de servidor.
Diez pruebas del módulo aprobadas, incluyendo recuperación, rechazo de aprobación, fuente inconsistente, límites y fallos de almacenamiento. No prueba proveedor real.

QA adicional de navegador: guardar, recargar y recuperar datos comprobado en escritorio/móvil; confirmación desmarcada y descarga bloqueada hasta nueva revisión. Sin errores JS ni llamadas externas.

Puedes organizar briefs guardados en [campañas locales](campaign-local.md), sin conectar TikTok. Cada campaña conserva snapshot y requiere revisión; las fechas son propuestas sin scheduler.
