# Reglas de Tests

Aplican con AGENTS.md de raíz; instrucciones actuales del usuario prevalecen.

- Propósito: Evidencia controlada y regresión.
- Reglas obligatorias locales: Mocks sin red; fixtures explícitos; medios reales no son unit tests; separar operational opt-in; sin secretos ni gasto automático.
- Gate: Invariantes comportamentales, no assertions que reflejan texto.
- Consultar docs/development/VALIDACION.md y DEVELOPMENT.md de esta sección antes de implementar.
- Documento/carpeta no acredita backend operativo; preservar cambios actuales y scopes de tarea.
