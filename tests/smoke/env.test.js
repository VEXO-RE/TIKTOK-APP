import test from "node:test";
import assert from "node:assert/strict";

import { validateEnvironment } from "../../src/config/env.js";

test("valid environment accepts fixed valid port", () => {
  assert.doesNotThrow(() => {
    validateEnvironment({
      PORT: "4100"
    });
  });
});

test("invalid port fails closed", () => {
  assert.throws(() => {
    validateEnvironment({
      PORT: "99999"
    });
  });
});
