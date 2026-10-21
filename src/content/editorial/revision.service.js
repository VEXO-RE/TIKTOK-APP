import { createHash, randomUUID } from "node:crypto";

import { AppError } from "../../core/errors.js";
import { createRevisionRepository } from "./revision.repository.js";

const DRAFT_FIELDS = new Set([
  "targetAccountRef",
  "title",
  "copy",
  "sourceRefs",
  "assetRefs"
]);

function requireIdentity(auth) {
  if (!auth || typeof auth.tenantRef !== "string" || !auth.tenantRef.trim()) {
    throw new AppError("Authenticated tenant is required.", 401, "TENANT_REQUIRED");
  }

  if (typeof auth.actorRef !== "string" || !auth.actorRef.trim()) {
    throw new AppError("Authenticated actor is required.", 401, "ACTOR_REQUIRED");
  }

  return {
    tenantRef: auth.tenantRef.trim(),
    actorRef: auth.actorRef.trim()
  };
}

function requireString(value, field) {
  if (typeof value !== "string" || !value.trim()) {
    throw new AppError(`${field} is required.`, 400, "CONTENT_INPUT_INVALID");
  }

  return value.trim();
}

function requireRefs(value, field, { allowEmpty = false } = {}) {
  if (!Array.isArray(value) || (!allowEmpty && value.length === 0)) {
    throw new AppError(`${field} is invalid.`, 400, "CONTENT_INPUT_INVALID");
  }

  const refs = value.map(item => requireString(item, field));

  if (new Set(refs).size !== refs.length) {
    throw new AppError(`${field} must be unique.`, 400, "CONTENT_INPUT_INVALID");
  }

  return refs;
}

function validateDraftInput(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new AppError("Content input is required.", 400, "CONTENT_INPUT_INVALID");
  }

  const unknown = Object.keys(input).filter(field => !DRAFT_FIELDS.has(field));

  if (unknown.length > 0) {
    throw new AppError(
      `Unknown content fields: ${unknown.join(", ")}`,
      400,
      "CONTENT_INPUT_INVALID"
    );
  }

  return {
    targetAccountRef: requireString(input.targetAccountRef, "targetAccountRef"),
    title: requireString(input.title, "title"),
    copy: input.copy === undefined ? "" : requireCopy(input.copy),
    sourceRefs: requireRefs(input.sourceRefs, "sourceRefs"),
    assetRefs: requireRefs(input.assetRefs ?? [], "assetRefs", { allowEmpty: true })
  };
}

function requireCopy(value) { if (typeof value !== "string") throw new AppError("copy must be a string.", 400, "CONTENT_INPUT_INVALID"); return value; }
function contentSha256(content) {
  const canonical = JSON.stringify({
    targetAccountRef: content.targetAccountRef,
    title: content.title,
    copy: content.copy,
    sourceRefs: content.sourceRefs,
    assetRefs: content.assetRefs
  });

  return createHash("sha256").update(canonical, "utf8").digest("hex");
}

function assertExpectedRevision(record, expectedRevision) {
  if (!Number.isInteger(expectedRevision) || expectedRevision !== record.revision) {
    throw new AppError(
      "Content revision is stale.",
      409,
      "CONTENT_REVISION_CONFLICT"
    );
  }
}

export function createRevisionService({
  repository = createRevisionRepository(),
  idFactory = randomUUID
} = {}) {
  function ownedLatest(auth, id) {
    const identity = requireIdentity(auth);
    const record = repository.findLatest(identity.tenantRef, requireString(id, "id"));

    if (!record) {
      throw new AppError("Content revision was not found.", 404, "CONTENT_NOT_FOUND");
    }

    return { identity, record };
  }

  function appendState(record, state, approval = null) {
    return repository.append({
      ...record,
      revision: record.revision + 1,
      state,
      approval
    });
  }

  return {
    repository,

    createDraft({ auth, input }) {
      const identity = requireIdentity(auth);
      const content = validateDraftInput(input);

      return repository.append({
        schemaVersion: "1.0.0",
        id: idFactory(),
        ownerTenantRef: identity.tenantRef,
        revision: 1,
        ...content,
        contentSha256: contentSha256(content),
        state: "draft",
        approval: null
      });
    },

    getLatest({ auth, id }) {
      return ownedLatest(auth, id).record;
    },

    listRevisions({ auth, id }) {
      const { identity } = ownedLatest(auth, id);
      return repository.list(identity.tenantRef, requireString(id, "id"));
    },

    revise({ auth, id, expectedRevision, input }) {
      const { record } = ownedLatest(auth, id);
      assertExpectedRevision(record, expectedRevision);

      if (record.state === "archived") {
        throw new AppError("Archived content cannot be revised.", 409, "CONTENT_STATE_INVALID");
      }

      const content = validateDraftInput(input);

      return repository.append({
        ...record,
        revision: record.revision + 1,
        ...content,
        contentSha256: contentSha256(content),
        state: "draft",
        approval: null
      });
    },

    submitForReview({ auth, id, expectedRevision }) {
      const { record } = ownedLatest(auth, id);
      assertExpectedRevision(record, expectedRevision);

      if (record.state !== "draft") {
        throw new AppError("Only drafts can enter review.", 409, "CONTENT_STATE_INVALID");
      }

      return appendState(record, "review");
    },

    archive({ auth, id, expectedRevision }) {
      const { record } = ownedLatest(auth, id);
      assertExpectedRevision(record, expectedRevision);

      if (record.state !== "approved") {
        throw new AppError("Only approved content can be archived.", 409, "CONTENT_STATE_INVALID");
      }

      return appendState(record, "archived", record.approval);
    },

    appendApproval({ auth, id, expectedRevision, approval }) {
      const { record } = ownedLatest(auth, id);
      assertExpectedRevision(record, expectedRevision);

      if (record.state !== "review") {
        throw new AppError("Only reviewed content can be approved.", 409, "CONTENT_STATE_INVALID");
      }

      const actorRef = requireIdentity(auth).actorRef;
      const fields = ["actorRef", "approvedAt", "contentSha256", "assetSha256", "targetAccountRef", "scope"];
      if (!approval || typeof approval !== "object" || Array.isArray(approval) ||
          Object.keys(approval).length !== fields.length ||
          fields.some(field => !Object.hasOwn(approval, field)) ||
          approval.actorRef !== actorRef || approval.scope !== "draft_upload" ||
          typeof approval.assetSha256 !== "string" || !/^[a-f0-9]{64}$/.test(approval.assetSha256) ||
          typeof approval.approvedAt !== "string" || !Number.isFinite(Date.parse(approval.approvedAt)) ||
          new Date(approval.approvedAt).toISOString() !== approval.approvedAt) {
        throw new AppError("Approval binding is invalid.", 400, "APPROVAL_INPUT_INVALID");
      }
      if (approval.targetAccountRef !== record.targetAccountRef) {
        throw new AppError("Approval target differs.", 409, "APPROVAL_TARGET_MISMATCH");
      }
      if (approval.contentSha256 !== record.contentSha256) {
        throw new AppError("Approval content differs.", 409, "APPROVAL_HASH_MISMATCH");
      }
      return appendState(record, "approved", approval);
    }
  };
}
