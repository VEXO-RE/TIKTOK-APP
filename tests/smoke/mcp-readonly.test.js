import test from "node:test";
import assert from "node:assert/strict";

import { assertMcpWriteAllowed } from "../../src/mcp/policies/readonly.js";

test("MCP write is blocked when readonly is true", () => {
  const previous = process.env.MCP_READONLY;

  process.env.MCP_READONLY = "true";

  assert.throws(
    () => assertMcpWriteAllowed(),
    /MCP_READONLY=true/
  );

  if (previous === undefined) {
    delete process.env.MCP_READONLY;
  } else {
    process.env.MCP_READONLY = previous;
  }
});
