import test from "node:test";
import assert from "node:assert/strict";

import { createApprovalService } from "../../src/content/approval/approval.service.js";
import { createRevisionRepository } from "../../src/content/editorial/revision.repository.js";
import { createRevisionService } from "../../src/content/editorial/revision.service.js";

const owner = Object.freeze({ tenantRef: "tenant-a", actorRef: "editor-a" });
const outsider = Object.freeze({ tenantRef: "tenant-b", actorRef: "editor-b" });
const assetHash = "b".repeat(64);

function setup() {
  const repository = createRevisionRepository();
  const revisions = createRevisionService({
    repository,
    idFactory: () => "content-1"
  });
  const approvals = createApprovalService({
    revisionService: revisions,
    now: () => new Date("2026-10-04T12:00:00.000Z")
  });

  return { repository, revisions, approvals };
}

function draftInput(overrides = {}) {
  return {
    targetAccountRef: "tiktok-sandbox-account",
    title: "Synthetic editorial draft",
    copy: "Synthetic copy without commercial claims.",
    sourceRefs: ["source:test:editorial-brief"],
    assetRefs: ["asset:test:video-1"],
    ...overrides
  };
}

test("draft ownership is derived from authenticated tenant", () => {
  const { revisions } = setup();
  const draft = revisions.createDraft({ auth: owner, input: draftInput() });

  assert.equal(draft.ownerTenantRef, "tenant-a");
  assert.equal(draft.revision, 1);
  assert.equal(draft.state, "draft");
  assert.equal(draft.approval, null);
  assert.match(draft.contentSha256, /^[a-f0-9]{64}$/);
});

test("unknown fields and missing evidence sources are rejected", () => {
  const { revisions } = setup();

  assert.throws(
    () => revisions.createDraft({
      auth: owner,
      input: draftInput({ inventedPrice: "9.99" })
    }),
    error => error.code === "CONTENT_INPUT_INVALID"
  );

  assert.throws(
    () => revisions.createDraft({
      auth: owner,
      input: draftInput({ sourceRefs: [] })
    }),
    error => error.code === "CONTENT_INPUT_INVALID"
  );
});

test("cross-tenant access is rejected as not found", () => {
  const { revisions } = setup();
  revisions.createDraft({ auth: owner, input: draftInput() });

  assert.throws(
    () => revisions.getLatest({ auth: outsider, id: "content-1" }),
    error => error.code === "CONTENT_NOT_FOUND"
  );
});

test("revisions are immutable and stale updates conflict", () => {
  const { revisions } = setup();
  const first = revisions.createDraft({ auth: owner, input: draftInput() });
  const second = revisions.revise({
    auth: owner,
    id: first.id,
    expectedRevision: 1,
    input: draftInput({ title: "Second synthetic revision" })
  });

  assert.equal(second.revision, 2);
  assert.notEqual(second.contentSha256, first.contentSha256);
  assert.equal(revisions.listRevisions({ auth: owner, id: first.id })[0].title, first.title);
  assert.throws(() => {
    first.title = "mutation";
  }, TypeError);
  assert.throws(
    () => revisions.revise({
      auth: owner,
      id: first.id,
      expectedRevision: 1,
      input: draftInput()
    }),
    error => error.code === "CONTENT_REVISION_CONFLICT"
  );
});

test("approval requires review and binds actor, account, and hashes", () => {
  const { revisions, approvals } = setup();
  const draft = revisions.createDraft({ auth: owner, input: draftInput() });

  assert.throws(
    () => approvals.approveDraftUpload({
      auth: owner,
      id: draft.id,
      expectedRevision: 1,
      targetAccountRef: draft.targetAccountRef,
      contentSha256: draft.contentSha256,
      assetSha256: assetHash
    }),
    error => error.code === "CONTENT_STATE_INVALID"
  );

  const review = revisions.submitForReview({
    auth: owner,
    id: draft.id,
    expectedRevision: 1
  });
  const approved = approvals.approveDraftUpload({
    auth: owner,
    id: draft.id,
    expectedRevision: review.revision,
    targetAccountRef: review.targetAccountRef,
    contentSha256: review.contentSha256,
    assetSha256: assetHash
  });

  assert.equal(approved.state, "approved");
  assert.deepEqual(approved.approval, {
    actorRef: "editor-a",
    approvedAt: "2026-10-04T12:00:00.000Z",
    contentSha256: review.contentSha256,
    assetSha256: assetHash,
    targetAccountRef: "tiktok-sandbox-account",
    scope: "draft_upload"
  });
});

test("wrong account or changed hash cannot be approved", () => {
  const { revisions, approvals } = setup();
  const draft = revisions.createDraft({ auth: owner, input: draftInput() });
  const review = revisions.submitForReview({
    auth: owner,
    id: draft.id,
    expectedRevision: 1
  });

  assert.throws(
    () => approvals.approveDraftUpload({
      auth: owner,
      id: draft.id,
      expectedRevision: review.revision,
      targetAccountRef: "different-account",
      contentSha256: review.contentSha256,
      assetSha256: assetHash
    }),
    error => error.code === "APPROVAL_TARGET_MISMATCH"
  );

  assert.throws(
    () => approvals.approveDraftUpload({
      auth: owner,
      id: draft.id,
      expectedRevision: review.revision,
      targetAccountRef: review.targetAccountRef,
      contentSha256: "a".repeat(64),
      assetSha256: assetHash
    }),
    error => error.code === "APPROVAL_HASH_MISMATCH"
  );
});

test("editing approved content creates a draft and revokes current approval", () => {
  const { revisions, approvals } = setup();
  const draft = revisions.createDraft({ auth: owner, input: draftInput() });
  const review = revisions.submitForReview({
    auth: owner,
    id: draft.id,
    expectedRevision: 1
  });
  const approved = approvals.approveDraftUpload({
    auth: owner,
    id: draft.id,
    expectedRevision: review.revision,
    targetAccountRef: review.targetAccountRef,
    contentSha256: review.contentSha256,
    assetSha256: assetHash
  });
  const edited = revisions.revise({
    auth: owner,
    id: draft.id,
    expectedRevision: approved.revision,
    input: draftInput({ copy: "Changed synthetic copy." })
  });

  assert.equal(edited.state, "draft");
  assert.equal(edited.approval, null);
  assert.notEqual(edited.contentSha256, approved.contentSha256);
  assert.equal(
    revisions.listRevisions({ auth: owner, id: draft.id })[2].approval.actorRef,
    "editor-a"
  );
});

test("invalid copy is rejected rather than silently discarded", () => {
  const { revisions } = setup();
  for (const copy of [null, 3, {}, []]) {
    assert.throws(() => revisions.createDraft({ auth: owner, input: draftInput({ copy }) }),
      error => error.code === "CONTENT_INPUT_INVALID");
  }
});

test("direct approval cannot bypass bindings and rejection preserves history", () => {
  const { revisions } = setup();
  const draft = revisions.createDraft({ auth: owner, input: draftInput() });
  const review = revisions.submitForReview({ auth: owner, id: draft.id, expectedRevision: 1 });
  const valid = {
    actorRef: owner.actorRef, approvedAt: "2026-10-04T12:00:00.000Z",
    contentSha256: review.contentSha256, assetSha256: assetHash,
    targetAccountRef: review.targetAccountRef, scope: "draft_upload"
  };
  for (const approval of [null, {}, { ...valid, actorRef: outsider.actorRef },
    { ...valid, scope: "direct_post" }, { ...valid, assetSha256: "invalid" },
    { ...valid, approvedAt: "2026-02-30T12:00:00.000Z" },
    { ...valid, approvedAt: "invalid" }, { ...valid, extra: true },
    { ...valid, targetAccountRef: "other" }, { ...valid, contentSha256: "a".repeat(64) }]) {
    assert.throws(() => revisions.appendApproval({
      auth: owner, id: draft.id, expectedRevision: review.revision, approval
    }), error => ["APPROVAL_INPUT_INVALID", "APPROVAL_TARGET_MISMATCH", "APPROVAL_HASH_MISMATCH"].includes(error.code));
    assert.equal(revisions.getLatest({ auth: owner, id: draft.id }).state, "review");
    assert.equal(revisions.listRevisions({ auth: owner, id: draft.id }).length, 2);
  }
});

test("normalized identity and content id remain consistent", () => {
  const { revisions, approvals } = setup();
  const auth = { tenantRef: " tenant-a ", actorRef: " editor-a " };
  const draft = revisions.createDraft({ auth, input: draftInput() });
  const review = revisions.submitForReview({ auth, id: draft.id, expectedRevision: 1 });
  const approved = approvals.approveDraftUpload({
    auth, id: draft.id, expectedRevision: review.revision,
    targetAccountRef: review.targetAccountRef, contentSha256: review.contentSha256,
    assetSha256: assetHash
  });
  assert.equal(approved.approval.actorRef, "editor-a");
  assert.equal(revisions.listRevisions({ auth, id: " content-1 " }).length, 3);
});

test("only an approved current revision can be archived and its approval remains auditable",()=>{
  const {revisions,approvals}=setup();
  const draft=revisions.createDraft({auth:owner,input:draftInput()});
  assert.throws(()=>revisions.archive({auth:owner,id:draft.id,expectedRevision:draft.revision}),
    error=>error.code==="CONTENT_STATE_INVALID");
  const review=revisions.submitForReview({auth:owner,id:draft.id,expectedRevision:draft.revision});
  const approved=approvals.approveDraftUpload({auth:owner,id:draft.id,expectedRevision:review.revision,
    targetAccountRef:review.targetAccountRef,contentSha256:review.contentSha256,assetSha256:assetHash});
  assert.throws(()=>revisions.archive({auth:outsider,id:draft.id,expectedRevision:approved.revision}),
    error=>error.code==="CONTENT_NOT_FOUND");
  assert.throws(()=>revisions.archive({auth:owner,id:draft.id,expectedRevision:review.revision}),
    error=>error.code==="CONTENT_REVISION_CONFLICT");
  const archived=revisions.archive({auth:owner,id:draft.id,expectedRevision:approved.revision});
  assert.equal(archived.state,"archived");assert.equal(archived.revision,approved.revision+1);
  assert.deepEqual(archived.approval,approved.approval);
  assert.throws(()=>revisions.revise({auth:owner,id:draft.id,expectedRevision:archived.revision,input:draftInput()}),
    error=>error.code==="CONTENT_STATE_INVALID");
});
