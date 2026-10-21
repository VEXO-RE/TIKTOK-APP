import { randomBytes } from "node:crypto";
import { AppError } from "../core/errors.js";

const opaque = () => randomBytes(24).toString("hex");

export function createSessionService({
  now = () => Date.now(), ttl = 2 * 60 * 60 * 1000, maxSessions = 20,
  idFactory = opaque, csrfFactory = opaque, createContext = () => ({})
} = {}) {
  if (!Number.isSafeInteger(ttl) || ttl <= 0 || !Number.isSafeInteger(maxSessions) || maxSessions <= 0) {
    throw new TypeError("Invalid session limits.");
  }
  const sessions = new Map();
  function prune() {
    const current = now();
    for (const [id, session] of sessions) if (session.expiresAt <= current) sessions.delete(id);
  }
  function get(id) {
    prune();
    return typeof id === "string" && id ? sessions.get(id) : undefined;
  }
  function open({ id, accountRef }) {
    prune();
    const existing = get(id);
    if (existing && existing.accountRef === accountRef) return { id, session: existing, created: false };
    if (sessions.size >= maxSessions) {
      throw new AppError("Demasiadas sesiones locales. Espera a su expiración.",429,"EDITORIAL_SESSION_LIMIT");
    }
    const nextId = idFactory();
    if (typeof nextId !== "string" || !nextId || sessions.has(nextId)) throw new Error("Session id factory returned an invalid id.");
    const expiresAt = now() + ttl;
    const session = { ...createContext({ id: nextId, accountRef }), accountRef, csrf: csrfFactory(), expiresAt };
    sessions.set(nextId, session);
    return { id: nextId, session, created: true };
  }
  return Object.freeze({ open, get, has:id=>Boolean(get(id)), values(){prune();return [...sessions.values()];} });
}
