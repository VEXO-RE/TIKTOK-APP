# Verificación y definición de terminado

## Documental (esta fase)

Todos los documentos y reglas enlazados existen; registry/manifest parsean; contratos consistentes; skill frontmatter válida.
Verificador no hace red, no usa credenciales, no ejecuta schema como backend ni escribe.
Una carpeta completa de especificaciones se reporta documentalmente completa; el software sigue planned.

## Funcional (siguientes fases)

Validación de entrada, ownership y transiciones probadas; escenarios duplicado/cuenta equivocada/hash cambiado/revocación.
Prueba de servicio+UI, accesibilidad y regresión del flujo TikTok.
Recovery de crash, outbox y unknown cuando aplique.
Evidencia operacional autorizada con fuente, fecha, cuenta referencia y resultado. No copiar green counts previos como actuales.

## Fuente de verdad

Código/diff: existencia e implementación. Tests mocked: comportamiento bajo escenarios controlados.
Cuenta/proveedor real: conexión/permiso/operación, scope concreto. Confirmación humana: comprobación manual, no respuesta API.
App Review: portal not-submitted/in-review/live con evidencia, nunca inferido de demo.
Para capabilities nuevas no basta el schema ni que un plugin figure en el catálogo.

## Evidencia informada — 2026-10-09

El usuario informa haber ejecutado la suite completa: 89/89 pruebas aprobadas, cero fallos y cero omitidas. Se registra como confirmación manual del usuario, no como ejecución nueva ni captura independiente de Codex. Este resultado no cierra identidad productiva: faltan autenticación, roles y conexiones TikTok por cuenta.

Antecedente posterior del mismo día: el usuario informa 91/91 pruebas aprobadas, cero fallos y cero omitidas con el incremento de archivado. Se conserva 89/89 como ejecución anterior; 91/91 tampoco se atribuye a Codex. Identidad productiva y persistencia continúan abiertas.

## Gate mínimo común

Registrar versión/rutas, checks ejecutados y fallos/bloqueos, evidencia sin secretos, limitaciones y siguiente paso.
Fixture comercio sin precio/stock real no habilita campaña.
Criterios adicionales están en cada phase guía y DEVELOPMENT de sección.
