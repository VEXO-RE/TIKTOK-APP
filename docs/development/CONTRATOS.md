# Contratos propuestos

contracts/ documenta esquemas futuros, no rutas actuales. JSON Schema 2020-12, schemaVersion 1.0.0, additionalProperties=false.
`ContentRevision` se valida en runtime al escribir y leer del repositorio mediante Ajv Draft 2020-12 y formatos. Los demás schemas permanecen documentales hasta su incremento vertical; el verificador documental no valida transacciones.

Editorial: idea -> draft -> review -> approved -> archived. Rechazo/edit crea nueva revisión draft.
Job: pending -> scheduled -> running -> awaiting_inbox -> awaiting_manual_publish -> published.
Ramas failed/cancelled/unknown_requires_reconciliation; jamás promover por timeout.
providerStatus externo string independiente, no confundir con enum interno.

ContentRevision referencia cuenta/hash/sources; Asset guarda origen/derechos/QC; Campaign objetivo/medición/destinos; PublicationJob aprobación/idempotency/checkpoints.
Approval, AccountConnection, SourceSnapshot, OutboxEvent y AttributionEvent requieren modelos adicionales en implementación.

Invariantes fuera de schema: approved exige actor/fecha/hash; scheduler aprobación de misma cuenta/revisión y fecha válida.
published exige confirmación final y evidenceRefs; SEND_TO_USER_INBOX no basta.
Derechos/QC bloqueados impiden envío; unique/idempotency/ownership se refuerzan en DB/servicios.
UTC/zona/moneda coherentes; formato URI no verifica destino. No conversiones int64 a Number.
Tests: dato inválido/campos desconocidos, transición ilegal, cambio hash, revocación, cuenta cruzada, duplicado y recovery.
