import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readApprovedVideo, registerMediaTools } from "../../src/mcp/tools/media.tools.js";

function fakeServer() { const tools = new Map(); return { tools, registerTool(name, config, handler) { tools.set(name, { config, handler }); } }; }

test("MCP local video tool only accepts a bounded local media reference", async () => {
  const root = await mkdtemp(join(tmpdir(), "mcp-media-"));
  await mkdir(join(root, "videos")); await writeFile(join(root, "videos", "sample.mp4"), "synthetic");
  const server = fakeServer();
  registerMediaTools(server, { env: { TIKTOK_MCP_MEDIA_DIR: root }, readVideo: async input => ({ buffer: Buffer.from("video"), relativePath: input.relativePath }), inspect: async () => ({ video: { width: 720, height: 1280, duration: 1 }, audio: { present: false }, alerts: [] }) });
  const output = await server.tools.get("video_inspect_local").handler({ relativePath: "videos/sample.mp4" });
  assert.equal(output.structuredContent.relativePath, "videos/sample.mp4");
  assert.equal(server.tools.get("video_inspect_local").config.annotations.readOnlyHint, true);
});

test("approved-video reader rejects traversal outside the configured directory", async () => {
  const root = await mkdtemp(join(tmpdir(), "mcp-media-"));
  await mkdir(join(root, "videos"));
  await writeFile(join(root, "videos", "sample.mp4"), "synthetic");
  const file = await readApprovedVideo({ mediaRoot: root, relativePath: "videos/sample.mp4" });
  assert.equal(file.relativePath, "videos/sample.mp4");
  await assert.rejects(
    () => readApprovedVideo({ mediaRoot: root, relativePath: "../outside.mp4" }),
    error => error.code === "MCP_VIDEO_REFERENCE_INVALID"
  );
});

test("MCP video tool returns a safe error instead of reading an invalid reference", async () => {
  const server = fakeServer();
  registerMediaTools(server, { env: { TIKTOK_MCP_MEDIA_DIR: "data/mcp-media" }, readVideo: async () => { const error = new Error("secret path"); error.code = "MCP_VIDEO_REFERENCE_INVALID"; throw error; } });
  const output = await server.tools.get("video_inspect_local").handler({ relativePath: "../private.mp4" });
  assert.equal(output.isError, true);
  assert.match(output.content[0].text, /MCP_VIDEO_REFERENCE_INVALID/);
  assert.doesNotMatch(output.content[0].text, /secret path/);
});
