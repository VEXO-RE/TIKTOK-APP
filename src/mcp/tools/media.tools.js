import { lstat, readFile, realpath } from "node:fs/promises";
import { isAbsolute, resolve, relative } from "node:path";
import { z } from "zod";
import { inspectVideo } from "../../media/inspect.service.js";

const MAX_VIDEO_BYTES = 64 * 1024 * 1024;

function toolFailure(error) {
  const code = typeof error?.code === "string" ? error.code : "MCP_VIDEO_INSPECTION_FAILED";
  return { isError: true, content: [{ type: "text", text: JSON.stringify({ ok: false, code }) }] };
}

export async function readApprovedVideo({ mediaRoot, relativePath }) {
  if (typeof relativePath !== "string" || !relativePath || relativePath.length > 240) {
    const error = new Error("Invalid local video reference."); error.code = "MCP_VIDEO_REFERENCE_INVALID"; throw error;
  }
  const root = await realpath(resolve(mediaRoot));
  const candidate = resolve(root, relativePath);
  const relativeCandidate = relative(root, candidate);
  if (!relativeCandidate || relativeCandidate.startsWith("..") || isAbsolute(relativeCandidate)) {
    const error = new Error("Video path is outside the approved media root."); error.code = "MCP_VIDEO_REFERENCE_INVALID"; throw error;
  }
  const actual = await realpath(candidate);
  const relativeActual = relative(root, actual);
  if (!relativeActual || relativeActual.startsWith("..") || isAbsolute(relativeActual)) {
    const error = new Error("Video path is outside the approved media root."); error.code = "MCP_VIDEO_REFERENCE_INVALID"; throw error;
  }
  const info = await lstat(actual);
  if (!info.isFile() || info.size <= 0 || info.size > MAX_VIDEO_BYTES) {
    const error = new Error("Video is invalid or too large."); error.code = "MCP_VIDEO_REFERENCE_INVALID"; throw error;
  }
  return { buffer: await readFile(actual), relativePath: relativeActual.replaceAll("\\", "/") };
}

export function registerMediaTools(server, { env = process.env, inspect = inspectVideo, readVideo = readApprovedVideo }) {
  const mediaRoot = env.TIKTOK_MCP_MEDIA_DIR || "data/mcp-media";
  server.registerTool("video_inspect_local", {
    title: "Inspeccionar video local",
    description: "Analiza un video dentro de la carpeta MCP aprobada. Solo detecta propiedades técnicas locales; no reconoce personas, productos ni marcas.",
    inputSchema: { relativePath: z.string().trim().min(1).max(240) },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
  }, async ({ relativePath }) => {
    try {
      const file = await readVideo({ mediaRoot, relativePath });
      const analysis = await inspect({ buffer: file.buffer });
      const data = { relativePath: file.relativePath, analysis };
      return { content: [{ type: "text", text: JSON.stringify(data) }], structuredContent: data };
    } catch (error) { return toolFailure(error); }
  });
}
