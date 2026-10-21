import { randomUUID } from "node:crypto";
import { AppError } from "../../core/errors.js";

const FIELDS = new Set(["contentId", "expectedRevision", "scheduledAt", "timeZone", "expiresAt"]);
const ISO_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

function invalid(message) {
  throw new AppError(message, 400, "CALENDAR_INPUT_INVALID");
}
function utc(value, field) {
  if (typeof value !== "string" || !ISO_UTC.test(value) ||
      !Number.isFinite(Date.parse(value)) || new Date(value).toISOString() !== value) {
    invalid(`${field} must be a canonical UTC timestamp.`);
  }
  return Date.parse(value);
}
function identity(auth) {
  if (!auth || typeof auth.tenantRef !== "string" || !auth.tenantRef.trim() ||
      typeof auth.actorRef !== "string" || !auth.actorRef.trim()) {
    throw new AppError("Authenticated identity is required.", 401, "CALENDAR_IDENTITY_REQUIRED");
  }
  return { tenantRef: auth.tenantRef.trim(), actorRef: auth.actorRef.trim() };
}
function snapshot(record) { return Object.freeze(structuredClone(record)); }

// Development-only planner: no timers, provider calls or publication status.
export function createCalendarService({ revisionService, now = () => new Date(), idFactory = randomUUID } = {}) {
  if (!revisionService) throw new TypeError("revisionService is required.");
  const records = new Map();
  const key = (tenant, id) => JSON.stringify([tenant, id]);
  function clock() {
    const date = now();
    if (!(date instanceof Date) || !Number.isFinite(date.valueOf())) {
      throw new TypeError("Calendar clock returned an invalid date.");
    }
    return date.valueOf();
  }
  function currentStatus(record, auth, instant) {
    if (record.status === "cancelled") return "cancelled";
    const current = revisionService.getLatest({ auth, id: record.contentId });
    if (current.revision !== record.contentRevision || current.state !== "approved" ||
        current.contentSha256 !== record.contentSha256 ||
        current.targetAccountRef !== record.targetAccountRef ||
        current.approval?.assetSha256 !== record.assetSha256 ||
        current.approval?.scope !== "draft_upload") return "needs_review";
    if (Date.parse(record.expiresAt) <= instant) return "expired";
    return "planned";
  }
  function owned(auth, id) {
    const actor = identity(auth);
    if (typeof id !== "string" || !id.trim()) invalid("Plan id is required.");
    const record = records.get(key(actor.tenantRef, id.trim()));
    if (!record) throw new AppError("Calendar plan not found.", 404, "CALENDAR_NOT_FOUND");
    return { actor, record };
  }
  return {
    plan({ auth, input }) {
      const actor = identity(auth);
      if (!input || typeof input !== "object" || Array.isArray(input) ||
          Object.keys(input).some(field => !FIELDS.has(field))) invalid("Invalid calendar fields.");
      const scheduled = utc(input.scheduledAt, "scheduledAt");
      const expiry = utc(input.expiresAt, "expiresAt");
      const instant = clock();
      if (scheduled <= instant || expiry <= scheduled) invalid("Plan must be future and expire after its scheduled time.");
      if (typeof input.timeZone !== "string" || !input.timeZone.trim() || /^[+-]/.test(input.timeZone)) {
        invalid("A named time zone is required.");
      }
      let timeZone;
      try {
        timeZone = new Intl.DateTimeFormat("en", { timeZone: input.timeZone }).resolvedOptions().timeZone;
      } catch { invalid("Time zone is not supported."); }
      const current = revisionService.getLatest({ auth, id: input.contentId });
      if (!Number.isInteger(input.expectedRevision) || input.expectedRevision !== current.revision) {
        throw new AppError("Content revision is stale.", 409, "CONTENT_REVISION_CONFLICT");
      }
      if (current.state !== "approved" || current.approval?.scope !== "draft_upload") {
        throw new AppError("An approved draft-upload revision is required.", 409, "CALENDAR_APPROVAL_REQUIRED");
      }
      for (const record of records.values()) {
        if (record.ownerTenantRef !== actor.tenantRef ||
            currentStatus(record, auth, instant) !== "planned") continue;
        if (record.contentId === current.id ||
            (record.targetAccountRef === current.targetAccountRef && record.scheduledAt === input.scheduledAt)) {
          throw new AppError("An active calendar reservation conflicts.", 409, "CALENDAR_CONFLICT");
        }
      }
      const id = idFactory();
      if (typeof id !== "string" || !id.trim() || records.has(key(actor.tenantRef, id))) {
        throw new AppError("Calendar id is invalid or duplicated.", 409, "CALENDAR_ID_CONFLICT");
      }
      const record = {
        schemaVersion: "1.0.0", id, ownerTenantRef: actor.tenantRef, version: 1,
        contentId: current.id, contentRevision: current.revision,
        contentSha256: current.contentSha256, assetSha256: current.approval.assetSha256,
        targetAccountRef: current.targetAccountRef, scope: "draft_upload",
        scheduledAt: input.scheduledAt, timeZone, expiresAt: input.expiresAt,
        plannedBy: actor.actorRef, status: "planned"
      };
      records.set(key(actor.tenantRef, id), snapshot(record));
      return snapshot(record);
    },
    get({ auth, id }) {
      const { record } = owned(auth, id);
      return snapshot({ ...record, status: currentStatus(record, auth, clock()) });
    },
    list({ auth }) {
      const actor = identity(auth);
      const instant = clock();
      return Object.freeze([...records.values()]
        .filter(record => record.ownerTenantRef === actor.tenantRef)
        .map(record => snapshot({ ...record, status: currentStatus(record, auth, instant) })));
    },
    cancel({ auth, id, expectedVersion }) {
      const { actor, record } = owned(auth, id);
      if (expectedVersion !== record.version || !Number.isInteger(expectedVersion)) {
        throw new AppError("Calendar version is stale.", 409, "CALENDAR_VERSION_CONFLICT");
      }
      if (record.status === "cancelled") {
        throw new AppError("Plan is already cancelled.", 409, "CALENDAR_STATE_INVALID");
      }
      const cancelled = snapshot({ ...record, version: record.version + 1, status: "cancelled", cancelledBy: actor.actorRef });
      records.set(key(actor.tenantRef, record.id), cancelled);
      return cancelled;
    }
  };
}
