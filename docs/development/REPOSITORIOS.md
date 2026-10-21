# Repositorios evaluados

Consulta: 2026-10-04. Selección por autor/mantenedor, documentación primaria, ajuste al stack y función concreta; no ranking por estrellas ni lista exhaustiva de todos los repositorios de GitHub.
No se auditó todo el código ni se certificó seguridad/licencia comercial de cada release. No se instalan/clonan por esta entrega.

| Repositorio | Decisión | Uso | Condición |
|---|---|---|---|
| [expressjs/express](https://github.com/expressjs/express) | Conservar | Servidor HTTP actual | No cambiar arquitectura por un starter |
| [expressjs/multer](https://github.com/expressjs/multer) | Conservar | Multipart actual | Preflight/durabilidad no resueltos por parser |
| [ajv-validator/ajv](https://github.com/ajv-validator/ajv) | Candidato principal | JSON Schema | Habilitar formatos y schemas 2020-12 en implementación |
| [colinhacks/zod](https://github.com/colinhacks/zod) | Alternativa | Contratos si TS | No duplicar contrato sin sincronización |
| [brianc/node-postgres](https://github.com/brianc/node-postgres) | Candidato | Persistencia PostgreSQL | Migraciones/tenancy/outbox a implementar |
| [taskforcesh/bullmq](https://github.com/taskforcesh/bullmq) | Candidato | Jobs/queue | Elegir versión/modalidad y configurar durabilidad |
| [temporalio/sdk-typescript](https://github.com/temporalio/sdk-typescript) | Reservado | Workflows largos | No junto a BullMQ sin motivo |
| [lovell/sharp](https://github.com/lovell/sharp) | Candidato | Derivados de imagen | Medios reales y receta versionada |
| [FFmpeg/FFmpeg](https://github.com/FFmpeg/FFmpeg) | Candidato | Video/preflight | Binario con decoders adecuados; build/licencias aparte |
| [remotion-dev/remotion](https://github.com/remotion-dev/remotion) | Opcional | Composición programática React | Revisar licencia/costo comercial; no es requisito |
| [microsoft/playwright](https://github.com/microsoft/playwright) | Candidato QA | Pruebas UI | Navegadores instalados no prueban red/proveedor |
| [open-telemetry/opentelemetry-js](https://github.com/open-telemetry/opentelemetry-js) | Opcional | Trazas operativas | Redactar PII y secrets |
| [promptfoo/promptfoo](https://github.com/promptfoo/promptfoo) | Opcional | Evaluaciones IA | Calls reales con presupuesto separado |
| [langfuse/langfuse](https://github.com/langfuse/langfuse) | Opcional | Prompts y observabilidad IA | Gobernanza/retención antes de enviar datos |
| [modelcontextprotocol/typescript-sdk](https://github.com/modelcontextprotocol/typescript-sdk) | Candidato | MCP oficial TS | Elegir release estable; APIs de main pueden cambiar |
| [tiktok/tiktok-business-api-sdk](https://github.com/tiktok/tiktok-business-api-sdk) | Reservado | Business API oficial | No es SDK de Upload Developers ni autorización |
| [TiendaNube/cli](https://github.com/TiendaNube/cli) | Referencia | Flujos de tema | No es SDK del catálogo ni necesario para fase 7 |
| [mermaid-js/mermaid](https://github.com/mermaid-js/mermaid) | Referencia | Diagramas/documentación | No requisito del runtime |
| [gitleaks/gitleaks](https://github.com/gitleaks/gitleaks) | Candidato QA | Detección de secrets | Versiones/allowlist revisadas; no prueba ausencia total |
| [actions/setup-node](https://github.com/actions/setup-node) | Referencia | CI Node | Fijar SHA verificado al adoptar |
| [n8n-io/n8n](https://github.com/n8n-io/n8n) | Alternativa | Orquestación visual | Evaluar licencia/operación; no segundo motor implícito |
| [w3c/wcag](https://github.com/w3c/wcag) | Referencia | Accesibilidad | Guía no es certificación de UI |

## Adopción

Elegir versión exacta y revisar release/SECURITY/engines/LICENSE antes de tocar package.json. Probar incremento y rollback. Conservar atribución/licencias; no copiar credenciales ni sample data como negocio.
Remotion: [licencia primaria](https://www.remotion.dev/docs/license). n8n: revisar licencia de su repo, sin asumir equivalencia a MIT.
Repos de Tiendanube api-docs/api-documentation no pudieron verificarse en esta revisión; no recomendarlos como base auditada. La [documentación oficial actual](https://nuvemshop.dev/api/getting-started) sí se consultó; respetar locale/región y autorización.
No usar wrappers de scraping de TikTok ni servidores MCP comunitarios como autoridad de permisos/endpoint.
