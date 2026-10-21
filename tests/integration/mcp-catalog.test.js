import test from "node:test";
import assert from "node:assert/strict";
import { registerCatalogTools } from "../../src/mcp/tools/catalog.tools.js";

function fakeServer() {
  const tools = new Map();
  return { tools, registerTool(name, config, handler) { tools.set(name, { config, handler }); } };
}

test("MCP registers only readonly Tiendanube catalog tools", () => {
  const server = fakeServer();
  registerCatalogTools(server, { catalog: { listCategories: async () => ({}), listProducts: async () => ({}) } });
  assert.deepEqual([...server.tools.keys()], ["tiendanube_list_categories", "tiendanube_list_products"]);
  for (const { config } of server.tools.values()) assert.equal(config.annotations.readOnlyHint, true);
});

test("MCP catalog tool preserves structured readonly results and hides unexpected errors", async () => {
  const server = fakeServer();
  registerCatalogTools(server, { catalog: {
    listCategories: async () => ({ items: [{ id: "4", name: "Hogar" }], snapshot: { cached: false } }),
    listProducts: async () => { throw Object.assign(new Error("token must stay private"), { code: "TIENDANUBE_AUTH_FAILED" }); }
  } });
  const categories = await server.tools.get("tiendanube_list_categories").handler({});
  assert.equal(categories.structuredContent.items[0].name, "Hogar");
  const products = await server.tools.get("tiendanube_list_products").handler({});
  assert.equal(products.isError, true);
  assert.match(products.content[0].text, /TIENDANUBE_AUTH_FAILED/);
  assert.doesNotMatch(products.content[0].text, /token/);
});
