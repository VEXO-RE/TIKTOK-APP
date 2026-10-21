# MCP

STATUS: LOCAL READ-ONLY SERVER

Initial policy:

MCP_READONLY=true

Run the local stdio server only from an MCP host that you control:

```bash
MCP_ENABLED=true npm run mcp
```

It registers only these read-only capabilities backed by local application
services:

- Tiendanube catalog categories and products, when its read-only integration is
  explicitly configured;
- technical inspection of a video stored below `TIKTOK_MCP_MEDIA_DIR` (defaults
  to `data/mcp-media`). It reports container, dimensions, duration, audio and
  edit alerts. It does not recognize people, products or brands.

The server fails closed when `MCP_ENABLED` is not exactly `true`. It never
publishes to TikTok, changes a catalog, sends messages, or accesses files
outside the configured media folder.

MCP tools must not be registered unless their actual backend capability exists
and has been tested.

Future TikTok tools may include read operations for:

- account information;
- publishing status;
- editorial calendar;
- content performance.

Write tools require:

1. official capability exists;
2. account authorization exists;
3. application permissions exist;
4. backend adapter exists;
5. tests pass;
6. MCP_READONLY=false;
7. operation policy permits the action.
