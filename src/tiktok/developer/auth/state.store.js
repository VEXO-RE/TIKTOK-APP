import { createHash, randomBytes } from "node:crypto";

const DEFAULT_TTL_MS = 10 * 60 * 1000;

function digest(state) {
  return createHash("sha256").update(state, "utf8").digest("hex");
}

export function createStateStore({
  ttlMs = DEFAULT_TTL_MS,
  now = () => Date.now(),
  randomBytesFn = randomBytes
} = {}) {
  const states = new Map();

  return {
    create() {
      const state = randomBytesFn(32).toString("base64url");

      states.set(digest(state), {
        expiresAt: now() + ttlMs
      });

      return state;
    },

    consume(state) {
      if (typeof state !== "string" || state.length === 0) {
        return { ok: false, reason: "missing" };
      }

      const key = digest(state);
      const record = states.get(key);

      if (!record) {
        return { ok: false, reason: "not_found" };
      }

      states.delete(key);

      if (record.expiresAt <= now()) {
        return { ok: false, reason: "expired" };
      }

      return { ok: true };
    }
  };
}

export const stateStore = createStateStore();
