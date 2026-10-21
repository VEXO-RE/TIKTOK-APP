import { z } from "zod";

const page = z.number().int().min(1).max(10000).optional();
const language = z.string().trim().min(2).max(10).optional();
const query = z.string().trim().min(1).max(120).optional();
const categoryId = z.string().trim().regex(/^\d+$/).optional();

function result(data) {
  return {
    content: [{ type: "text", text: JSON.stringify(data) }],
    structuredContent: data
  };
}

function failure(error) {
  const code = typeof error?.code === "string" ? error.code : "MCP_TOOL_FAILED";
  return { isError: true, content: [{ type: "text", text: JSON.stringify({ ok: false, code }) }] };
}

export function registerCatalogTools(server, { catalog }) {
  if (!catalog?.listCategories || !catalog?.listProducts) throw new TypeError("A Tiendanube catalog service is required.");
  server.registerTool("tiendanube_list_categories", {
    title: "Listar categorías de Tiendanube",
    description: "Consulta categorías del catálogo autorizado. Solo lectura; la respuesta conserva la fecha de snapshot.",
    inputSchema: { page, language }, annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true }
  }, async input => {
    try { return result(await catalog.listCategories(input)); }
    catch (error) { return failure(error); }
  });
  server.registerTool("tiendanube_list_products", {
    title: "Listar productos de Tiendanube",
    description: "Consulta productos publicados del catálogo autorizado por texto o categoría. Solo lectura; no inventa URL, precio ni stock.",
    inputSchema: { page, language, query, categoryId, published: z.boolean().optional() }, annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true }
  }, async input => {
    try { return result(await catalog.listProducts(input)); }
    catch (error) { return failure(error); }
  });
}
