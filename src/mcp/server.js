import { McpServer } from "@modelcontextprotocol/server";
import { createTiendanubeCatalogService } from "../integrations/tiendanube/catalog.service.js";
import { registerCatalogTools } from "./tools/catalog.tools.js";
import { registerMediaTools } from "./tools/media.tools.js";

export function createTikTokMcpServer({ catalog = createTiendanubeCatalogService(), env = process.env, inspect, readVideo } = {}) {
  const server = new McpServer({ name: "shopinistameta-tiktok", version: "0.1.0" });
  registerCatalogTools(server, { catalog });
  registerMediaTools(server, { env, ...(inspect ? { inspect } : {}), ...(readVideo ? { readVideo } : {}) });
  return server;
}
