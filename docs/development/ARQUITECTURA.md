# Arquitectura propuesta

No se ha migrado el servidor. Conservar Express/ESM, monolito modular, workers y renderer separados cuando existan requisitos.

~~~mermaid
flowchart LR
  Sources[Catálogo y calendario] --> Brief[Brief con fuentes]
  Brief --> Agents[Agentes creativos]
  Agents --> Media[Activos y QC]
  Media --> Approval[Revisión aprobada]
  Approval --> Outbox[Outbox durable]
  Outbox --> Worker[Cola y worker]
  Worker --> Gate[Autorización y capacidad]
  Gate --> Upload[TikTok Upload]
  Upload --> Human[Inbox y publicación manual]
  Human --> Evidence[Evidencia y atribución]
~~~

## Límites y persistencia

domain: reglas puras; services: coordinación; adapters: I/O; API/MCP: mismo servicio autorizado.
Separar ContentRevision de PublicationAttempt; evidencia de cada ejecución independiente.
PostgreSQL candidato como fuente de verdad; BullMQ/Redis para cola candidata. Elegir modalidad/versiones en ADR antes de instalar.
Object storage para originales y derivados inmutables; DB guarda metadata/hash/referencia, no MP4 ni URL firmada permanente.

## Outbox e idempotencia

Transacción local persiste aprobación+outbox. Dispatcher encola con unique key; worker toma lease por cuenta/revisión.
Worker comprueba hash/aprobación/conexión/scope/capability. Checkpoints tras init/transfer/status.
Caída después del efecto externo y antes del checkpoint produce unknown_requires_reconciliation. No prometer exactly-once en TikTok.
Cola no es verdad única; reconstruir desde outbox sin repetir efecto ya confirmado.

## Seguridad y evolución

Autenticación app/tenant y ownership antes de multiusuario/MCP. No compartir el token único actual entre cuentas.
Migraciones/versionado compatibles; comparar costo/latencia/volumen antes de microservicios.
Agentes generan propuestas, no manejan credenciales ni elevan permisos.
Nueva red declara capabilities/scopes; no hereda TikTok estados.
