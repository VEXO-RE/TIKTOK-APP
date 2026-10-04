export function assertMcpWriteAllowed() {
  const readonly =
    String(process.env.MCP_READONLY || "true").toLowerCase() === "true";

  if (readonly) {
    const error = new Error(
      "MCP write operation blocked because MCP_READONLY=true."
    );

    error.code = "MCP_READONLY";
    throw error;
  }
}
