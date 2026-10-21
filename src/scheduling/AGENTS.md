# Reglas de Scheduling

Aplican con AGENTS.md de raíz; instrucciones actuales del usuario prevalecen.

- Propósito: Jobs/outbox/leases/conciliación.
- Reglas obligatorias locales: Job único/version/hash/cuenta; retry budget; unknown no resend; Upload mantiene humano.
- Gate: Crash/recovery/duplicado/revocación/hora ambigua.
- Consultar docs/development/PIPELINE.md y DEVELOPMENT.md de esta sección antes de implementar.
- Documento/carpeta no acredita backend operativo; preservar cambios actuales y scopes de tarea.
