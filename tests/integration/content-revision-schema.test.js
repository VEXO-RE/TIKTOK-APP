import test from "node:test";
import assert from "node:assert/strict";
import { assertContentRevision } from "../../src/content/editorial/content-revision.validator.js";
import { createRevisionRepository } from "../../src/content/editorial/revision.repository.js";

const approval={actorRef:"synthetic-editor",approvedAt:"2026-10-09T12:00:00.000Z",
  contentSha256:"a".repeat(64),assetSha256:"b".repeat(64),targetAccountRef:"tiktok:synthetic",scope:"draft_upload"};
const revision={schemaVersion:"1.0.0",id:"synthetic-content",ownerTenantRef:"synthetic-tenant",revision:1,
  targetAccountRef:"tiktok:synthetic",title:"Synthetic",copy:"Test only",sourceRefs:["synthetic:source"],
  assetRefs:["sha256:"+"b".repeat(64)],contentSha256:"a".repeat(64),state:"approved",approval};

test("runtime ContentRevision schema accepts approved and archived contract snapshots",()=>{
  assert.equal(assertContentRevision(revision),revision);
  assert.equal(assertContentRevision({...revision,state:"archived"}).state,"archived");
});

test("runtime ContentRevision schema rejects unknown fields and invalid approval shapes",()=>{
  for(const invalid of [
    {...revision,extra:true},
    {...revision,state:"approved",approval:null},
    {...revision,state:"unknown"},
    {...revision,approval:{...approval,approvedAt:"2026-02-30T12:00:00.000Z"}},
    {...revision,contentSha256:"invalid"}
  ]) assert.throws(()=>assertContentRevision(invalid),error=>error.code==="CONTENT_SCHEMA_INVALID" && error.status===500);
});

test("repository rejects invalid records before storing a revision",()=>{
  const repository=createRevisionRepository();
  assert.throws(()=>repository.append({...revision,approval:{...approval,scope:"direct_post"}}),
    error=>error.code==="CONTENT_SCHEMA_INVALID");
  assert.equal(repository.findLatest(revision.ownerTenantRef,revision.id),null);
});
