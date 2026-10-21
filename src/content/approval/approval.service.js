import { AppError } from "../../core/errors.js";

const SHA256_PATTERN = /^[a-f0-9]{64}$/;

function requireSha256(value, field) {
  if (typeof value !== "string" || !SHA256_PATTERN.test(value)) {
    throw new AppError(`${field} must be a SHA-256 hash.`, 400, "APPROVAL_INPUT_INVALID");
  }

  return value;
}

export function createApprovalService({
  revisionService,
  now = () => new Date()
}) {
  if (!revisionService) {
    throw new TypeError("revisionService is required.");
  }

  return {
    approveDraftUpload({
      auth,
      id,
      expectedRevision,
      targetAccountRef,
      contentSha256,
      assetSha256
    }) {
      const current = revisionService.getLatest({ auth, id });

      if (current.targetAccountRef !== targetAccountRef) {
        throw new AppError(
          "Approval target account does not match the revision.",
          409,
          "APPROVAL_TARGET_MISMATCH"
        );
      }

      if (current.contentSha256 !== requireSha256(contentSha256, "contentSha256")) {
        throw new AppError(
          "Approval content hash does not match the revision.",
          409,
          "APPROVAL_HASH_MISMATCH"
        );
      }

      const approvedAt = now();

      if (!(approvedAt instanceof Date) || Number.isNaN(approvedAt.valueOf())) {
        throw new TypeError("Approval clock returned an invalid date.");
      }

      return revisionService.appendApproval({
        auth,
        id,
        expectedRevision,
        approval: {
          actorRef: auth.actorRef.trim(),
          approvedAt: approvedAt.toISOString(),
          contentSha256: current.contentSha256,
          assetSha256: requireSha256(assetSha256, "assetSha256"),
          targetAccountRef: current.targetAccountRef,
          scope: "draft_upload"
        }
      });
    }
  };
}
