import { AppError } from "../../core/errors.js";
import { assertContentRevision } from "./content-revision.validator.js";

function clone(value) {
  return structuredClone(value);
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }

  for (const child of Object.values(value)) {
    deepFreeze(child);
  }

  return Object.freeze(value);
}

function key(ownerTenantRef, id) {
  return `${ownerTenantRef}\u0000${id}`;
}

export function createRevisionRepository() {
  const records = new Map();

  return {
    append(record) {
      assertContentRevision(record);
      const recordKey = key(record.ownerTenantRef, record.id);
      const revisions = records.get(recordKey) || [];
      const expectedRevision = revisions.length + 1;

      if (record.revision !== expectedRevision) {
        throw new AppError(
          "Content revision sequence conflict.",
          409,
          "CONTENT_REVISION_CONFLICT"
        );
      }

      const snapshot = deepFreeze(clone(record));
      records.set(recordKey, [...revisions, snapshot]);
      return deepFreeze(clone(snapshot));
    },

    findLatest(ownerTenantRef, id) {
      const revisions = records.get(key(ownerTenantRef, id));
      if(!revisions?.length)return null;
      const latest=clone(revisions[revisions.length-1]);
      assertContentRevision(latest);
      return deepFreeze(latest);
    },

    list(ownerTenantRef, id) {
      const revisions = clone(records.get(key(ownerTenantRef, id)) || []);
      for(const revision of revisions)assertContentRevision(revision);
      return deepFreeze(revisions);
    }
  };
}
