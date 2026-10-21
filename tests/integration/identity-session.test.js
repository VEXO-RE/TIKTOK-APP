import test from "node:test";
import assert from "node:assert/strict";
import { createSessionService } from "../../src/identity/session.service.js";

test("local sessions are isolated and rotate when the bound account changes",()=>{
  let sequence=0;
  const sessions=createSessionService({idFactory:()=>"session-"+(++sequence),csrfFactory:()=>"csrf-"+sequence,
    createContext:({id})=>({auth:{tenantRef:"local:"+id},drafts:new Set()})});
  const first=sessions.open({accountRef:"tiktok:a"});
  first.session.drafts.add("draft-a");
  const reused=sessions.open({id:first.id,accountRef:"tiktok:a"});
  assert.equal(reused.created,false);assert.equal(reused.session.drafts.has("draft-a"),true);
  const rotated=sessions.open({id:first.id,accountRef:"tiktok:b"});
  assert.equal(rotated.created,true);assert.notEqual(rotated.id,first.id);
  assert.equal(rotated.session.drafts.has("draft-a"),false);
  assert.equal(rotated.session.auth.tenantRef,"local:"+rotated.id);
});

test("expired sessions are removed before lookup and capacity checks",()=>{
  let clock=1000,sequence=0;
  const sessions=createSessionService({now:()=>clock,ttl:10,maxSessions:1,idFactory:()=>"id-"+(++sequence),csrfFactory:()=>"csrf"});
  const first=sessions.open({accountRef:null});
  assert.throws(()=>sessions.open({accountRef:null}),error=>error.code==="EDITORIAL_SESSION_LIMIT");
  clock=1010;
  assert.equal(sessions.get(first.id),undefined);
  assert.equal(sessions.open({accountRef:null}).created,true);
});
