import test from "node:test";
import assert from "node:assert/strict";
import { evaluateVideoPreflight } from "../../src/media/preflight.service.js";

const vertical = { video: { width: 1080, height: 1920, duration: 20, codec: "h264" }, audio: { present: true } };

test("local preflight is ready for a valid vertical technical analysis", () => {
  const result = evaluateVideoPreflight(vertical, { now: () => new Date("2026-10-20T12:00:00.000Z") });
  assert.equal(result.status, "ready");
  assert.equal(result.checkedAt, "2026-10-20T12:00:00.000Z");
  assert.ok(result.checks.every(check => check.status === "pass"));
});

test("local preflight keeps framing and audio as advisory warnings", () => {
  const result = evaluateVideoPreflight({ video: { width: 1920, height: 1080, duration: 20, codec: "hevc" }, audio: { present: false } });
  assert.equal(result.status, "review_required");
  assert.ok(result.checks.some(check => check.id === "vertical-framing" && check.status === "warning"));
  assert.ok(result.checks.some(check => check.id === "audio-track" && check.status === "warning"));
  assert.match(result.limitation, /no confirma/i);
});

test("local preflight blocks only when the local editor cannot export the duration", () => {
  const result = evaluateVideoPreflight({ ...vertical, video: { ...vertical.video, duration: 181 } });
  assert.equal(result.status, "blocked");
  assert.ok(result.checks.some(check => check.id === "editor-duration" && check.status === "blocked"));
});
