import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { createTikTokMcpServer } from "./server.js";

// stdout is reserved for JSON-RPC; do not use console.log in this entrypoint.
if (String(process.env.MCP_ENABLED || "false").toLowerCase() !== "true") {
  process.stderr.write("ShopinistaMeta TikTok MCP is disabled. Set MCP_ENABLED=true to run it.\n");
  process.exitCode = 1;
} else {
  process.stderr.write("ShopinistaMeta TikTok MCP: readonly catalog tools ready.\n");
  serveStdio(() => createTikTokMcpServer());
}
