import test from "node:test";
import assert from "node:assert/strict";
import { createRevisionService } from "../../src/content/editorial/revision.service.js";
import { createApprovalService } from "../../src/content/approval/approval.service.js";
import { createCalendarService } from "../../src/content/calendar/calendar.service.js";

const auth = { tenantRef: "synthetic-tenant-a", actorRef: "synthetic-editor" };
const other = { tenantRef: "synthetic-tenant-b", actorRef: "synthetic-editor-b" };
const input = { targetAccountRef: "synthetic-account-a", title: "Synthetic calendar test",
  copy: "Test only", sourceRefs: ["synthetic:brief"], assetRefs: ["synthetic:asset"] };
function setup() {
  let next = 0;
  let planId = 0;
  let date = new Date("2026-10-05T12:00:00.000Z");
  const revisions = createRevisionService({ idFactory: () => `content-${++next}` });
  const approvals = createApprovalService({ revisionService: revisions, now: () => date });
  const calendar = createCalendarService({ revisionService: revisions, now: () => date,
    idFactory: () => `plan-${++planId}` });
  function approved(actor = auth, account = input.targetAccountRef) {
    const draft = revisions.createDraft({ auth: actor, input: { ...input, targetAccountRef: account } });
    const review = revisions.submitForReview({ auth: actor, id: draft.id, expectedRevision: 1 });
    return approvals.approveDraftUpload({ auth: actor, id: draft.id, expectedRevision: review.revision,
      targetAccountRef: account, contentSha256: review.contentSha256, assetSha256: "b".repeat(64) });
  }
  const details = content => ({ contentId: content.id, expectedRevision: content.revision,
    scheduledAt: "2026-10-06T16:00:00.000Z", timeZone: "America/Mexico_City",
    expiresAt: "2026-10-07T16:00:00.000Z" });
  return { calendar, revisions, approved, details, setDate: value => { date = new Date(value); } };
}
test("calendar binds an immutable plan to approved revision, account and hashes", () => {
  const s = setup(); const content = s.approved();
  const plan = s.calendar.plan({ auth, input: s.details(content) });
  assert.equal(plan.contentRevision, content.revision);
  assert.equal(plan.contentSha256, content.contentSha256);
  assert.equal(plan.assetSha256, content.approval.assetSha256);
  assert.equal(plan.targetAccountRef, content.targetAccountRef);
  assert.equal(plan.status, "planned");
  assert.throws(() => { plan.scheduledAt = "changed"; }, TypeError);
  assert.equal(s.calendar.get({ auth, id: plan.id }).scheduledAt, plan.scheduledAt);
});
test("calendar rejects impossible, non-UTC, past and expired dates and unknown fields", () => {
  const s = setup(); const base = s.details(s.approved());
  for (const patch of [
    { scheduledAt: "2026-02-30T16:00:00.000Z" }, { scheduledAt: "2026-10-06T16:00:00" },
    { scheduledAt: "2026-10-06T10:00:00.000-06:00" },
    { scheduledAt: "2026-10-05T12:00:00.000Z" }, { expiresAt: base.scheduledAt },
    { timeZone: "Mars/Olympus" }, { timeZone: "+06:00" }, { targetAccountRef: "spoofed" }]) {
    assert.throws(() => s.calendar.plan({ auth, input: { ...base, ...patch } }),
      error => error.code === "CALENDAR_INPUT_INVALID");
  }
  assert.equal(s.calendar.list({ auth }).length, 0);
});
test("calendar rejects drafts and stale revision bindings", () => {
  const s = setup(); const draft = s.revisions.createDraft({ auth, input });
  assert.throws(() => s.calendar.plan({ auth, input: s.details(draft) }),
    error => error.code === "CALENDAR_APPROVAL_REQUIRED");
  const content = s.approved();
  assert.throws(() => s.calendar.plan({ auth, input: { ...s.details(content), expectedRevision: 1 } }),
    error => error.code === "CONTENT_REVISION_CONFLICT");
});
test("same-account same-time and repeated content conflict; another account does not", () => {
  const s = setup(); const first = s.approved();
  s.calendar.plan({ auth, input: s.details(first) });
  assert.throws(() => s.calendar.plan({ auth, input: { ...s.details(first), scheduledAt: "2026-10-06T17:00:00.000Z" } }),
    error => error.code === "CALENDAR_CONFLICT");
  assert.throws(() => s.calendar.plan({ auth, input: s.details(s.approved()) }),
    error => error.code === "CALENDAR_CONFLICT");
  assert.equal(s.calendar.plan({ auth, input: s.details(s.approved(auth, "synthetic-account-b")) }).status, "planned");
});
test("cross-tenant reads, cancellation and content references are denied", () => {
  const s = setup(); const content = s.approved();
  const plan = s.calendar.plan({ auth, input: s.details(content) });
  assert.throws(() => s.calendar.get({ auth: other, id: plan.id }), error => error.code === "CALENDAR_NOT_FOUND");
  assert.throws(() => s.calendar.cancel({ auth: other, id: plan.id, expectedVersion: 1 }), error => error.code === "CALENDAR_NOT_FOUND");
  assert.throws(() => s.calendar.plan({ auth: other, input: s.details(content) }), error => error.code === "CONTENT_NOT_FOUND");
  assert.equal(s.calendar.list({ auth: other }).length, 0);
  assert.equal(s.calendar.plan({ auth: other, input: s.details(s.approved(other)) }).status, "planned");
});
test("editing revokes calendar eligibility and releases its reservation", () => {
  const s = setup(); const content = s.approved();
  const plan = s.calendar.plan({ auth, input: s.details(content) });
  s.revisions.revise({ auth, id: content.id, expectedRevision: content.revision,
    input: { ...input, targetAccountRef: "synthetic-account-b" } });
  assert.equal(s.calendar.get({ auth, id: plan.id }).status, "needs_review");
  assert.equal(s.calendar.list({ auth })[0].status, "needs_review");
  assert.equal(s.calendar.plan({ auth, input: s.details(s.approved()) }).status, "planned");
});
test("cancellation is versioned, preserves content approval and releases reservation", () => {
  const s = setup(); const content = s.approved();
  const plan = s.calendar.plan({ auth, input: s.details(content) });
  assert.throws(() => s.calendar.cancel({ auth, id: plan.id, expectedVersion: 0 }), error => error.code === "CALENDAR_VERSION_CONFLICT");
  assert.equal(s.calendar.cancel({ auth, id: plan.id, expectedVersion: 1 }).version, 2);
  assert.equal(s.calendar.get({ auth, id: plan.id }).status, "cancelled");
  assert.equal(s.revisions.getLatest({ auth, id: content.id }).state, "approved");
  assert.throws(() => s.calendar.cancel({ auth, id: plan.id, expectedVersion: 1 }), error => error.code === "CALENDAR_VERSION_CONFLICT");
  assert.equal(s.calendar.plan({ auth, input: s.details(content) }).status, "planned");
});
test("expiry blocks eligibility; timezone never changes the explicit UTC instant", () => {
  const s = setup(); const content = s.approved();
  const details = { ...s.details(content), timeZone: "America/New_York", scheduledAt: "2026-11-01T05:30:00.000Z", expiresAt: "2026-11-02T05:30:00.000Z" };
  const plan = s.calendar.plan({ auth, input: details });
  assert.equal(plan.scheduledAt, details.scheduledAt);
  s.setDate(details.expiresAt);
  assert.equal(s.calendar.get({ auth, id: plan.id }).status, "expired");
});
