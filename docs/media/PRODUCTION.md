# Contrato de producción audiovisual

Estado: especificación; no renderer/generador instalado.
Entrada: brief/revision, assets propios/licenciados, receta/versiones, límites de tiempo/costo y formato del destino vigente.
Salida: final inmutable + SHA256 + reporte QC + preview. Orden: rights -> storyboard -> render -> preflight -> human approval.
Guardar referencias, no secrets/provider URLs. Fallar cerrado en derechos inciertos/media corrupta.
Metadatos exactos y criterios en docs/development/MEDIA.md y contracts/asset.schema.json.
Las recetas ejecutables se crean en fase 5 con herramientas fijadas y prueba real; no comandos ficticios para completar carpetas.
