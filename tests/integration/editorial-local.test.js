import test from "node:test";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";
import express from "express";
import { request as httpRequest } from "node:http";
import { createLocalEditorialRouter } from "../../src/content/editorial/local.routes.js";
import { errorHandler } from "../../src/core/errors.js";
import { createTokenStore } from "../../src/tiktok/developer/tokens/token.store.js";

async function setup(options, run) {
  const tokens = createTokenStore();
  tokens.set({ accessToken: "synthetic-secret", openId: "synthetic-account-a", scope: "video.upload", expiresIn: 3600 });
  let sends = 0;
  const app = express(); app.use(express.json());
  app.use("/api/editorial", createLocalEditorialRouter({ tokens, enabled: () => true,
    initialize: async () => { sends++; return { publishId: "synthetic-publish-id", uploadUrl: "https://synthetic.test/secret" }; },
    transfer: async () => {}, fetchStatus: async () => ({ status: "SEND_TO_USER_INBOX" }), ...options }));
  app.use(errorHandler);
  const server = app.listen(0, "127.0.0.1");
  await new Promise(resolve => server.once("listening", resolve));
  const base = "http://127.0.0.1:" + server.address().port;
  const sessionResponse = await fetch(base + "/api/editorial/session");
  const session = await sessionResponse.json();
  const cookie = (sessionResponse.headers.get("set-cookie") || "").split(";")[0];
  async function request(path, body, overrides = {}) {
    const response = await fetch(base + "/api/editorial" + path, {
      ...(body ? { method: "POST", body: JSON.stringify(body) } : {}),
      ...overrides, headers: { cookie, Origin: base, "X-Editorial-CSRF": session.csrf,
        ...(body ? { "Content-Type": "application/json" } : {}), ...overrides.headers }
    });
    return { status: response.status, data: await response.json() };
  }
  async function draft() {
    const created = await request("/drafts", { title: "Synthetic test brief", copy: "Test only", sourceRefs: ["synthetic:source"] });
    assert.equal(created.status, 201);
    const form = new FormData(); form.set("video", new Blob(["synthetic-video"], { type: "video/mp4" }), "test.mp4");
    const staged = await request("/drafts/" + created.data.content.id + "/video", null,
      { method: "POST", body: form, headers: { "X-Content-Revision": String(created.data.content.revision) } });
    assert.equal(staged.status, 200);
    return staged.data;
  }
  async function approved() {
    const staged = await draft();
    const result = await request("/drafts/" + staged.content.id + "/approve", {
      confirmed: true, expectedRevision: staged.content.revision,
      assetSha256: staged.assetSha256, contentSha256: staged.content.contentSha256
    });
    assert.equal(result.status, 200);
    return result.data.content;
  }
  try { await run({ request, draft, approved, tokens, base, cookie, session, sends: () => sends }); }
  finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
}
test("local editorial stages exact bytes, binds approval and sends once through Inbox", async () => {
  let bytes;
  await setup({ transfer: async ({ buffer }) => { bytes = buffer.toString(); } }, async s => {
    const content = await s.approved();
    const sent = await s.request("/drafts/" + content.id + "/send", { expectedRevision: content.revision });
    assert.equal(sent.status, 200); assert.equal(bytes, "synthetic-video");
    assert.equal(sent.data.attempt.state, "awaiting_inbox");
    const status = await s.request("/drafts/" + content.id + "/status", {});
    assert.equal(status.data.attempt.state, "awaiting_manual_publish");
    assert.equal(status.data.attempt.providerStatus, "SEND_TO_USER_INBOX");
    assert.equal((await s.request("/drafts/" + content.id + "/send", { expectedRevision: content.revision })).status, 409);
    assert.equal(s.sends(), 1);
    assert.doesNotMatch(JSON.stringify(sent.data), /synthetic-secret|synthetic.test/);
  });
});
test("origin, session, forged ownership and remote Host are rejected", async () => {
  await setup({}, async s => {
    assert.equal((await s.request("/drafts", {}, { headers: { Origin: "https://attacker.test" } })).status, 403);
    assert.equal((await s.request("/drafts", {}, { headers: { "X-Editorial-CSRF": "forged" } })).status, 403);
    assert.equal((await s.request("/drafts", {}, { headers: { cookie: "" } })).status, 401);
    const remoteHost = await new Promise((resolve, reject) => {
      const req = httpRequest(s.base + "/api/editorial/session", { headers: { Host: "public.example" } }, response => {
        response.resume(); response.on("end", () => resolve(response.statusCode));
      });
      req.on("error", reject); req.end();
    });
    assert.equal(remoteHost, 403);
    assert.equal((await s.request("/drafts", { title: "Test", sourceRefs: ["synthetic:source"], tenantRef: "spoof" })).status, 400);
    const created = await s.draft();
    assert.equal((await s.request("/drafts/" + created.content.id, null, { headers: { cookie: "" } })).status, 401);
  });
});
test("unapproved and stale video cannot send; replacing video revokes approval", async () => {
  await setup({}, async s => {
    const staged = await s.draft();
    assert.equal((await s.request("/drafts/" + staged.content.id + "/send", { expectedRevision: staged.content.revision })).status, 409);
    assert.equal((await s.request("/drafts/" + staged.content.id + "/approve", {
      confirmed: true, expectedRevision: staged.content.revision, contentSha256: staged.content.contentSha256, assetSha256: "a".repeat(64)
    })).status, 409);
    const approved = await s.approved();
    const form = new FormData(); form.set("video", new Blob(["changed-video"], { type: "video/mp4" }), "changed.mp4");
    const result = await s.request("/drafts/" + approved.id + "/video", null,
      { method: "POST", body: form, headers: { "X-Content-Revision": String(approved.revision) } });
    assert.equal(result.data.content.state, "draft");
    assert.equal(result.data.content.approval, null);
    assert.equal(s.sends(), 0);
  });
});
test("changed TikTok account and disabled upload fail closed", async () => {
  await setup({}, async s => {
    const content = await s.approved();
    s.tokens.set({ accessToken: "synthetic-other", openId: "synthetic-account-b", scope: "video.upload", expiresIn: 3600 });
    assert.equal((await s.request("/drafts/" + content.id + "/send", { expectedRevision: content.revision })).status, 409);
    assert.equal(s.sends(), 0);
  });
  await setup({ enabled: () => false }, async s => {
    assert.equal((await s.request("/drafts", { title: "Test", sourceRefs: ["synthetic:source"] })).status, 404);
  });
});
test("uncertain transfer stores publishId, blocks duplicates including another draft, allows reconciliation", async () => {
  await setup({ transfer: async () => { throw Error("synthetic failure"); } }, async s => {
    const content = await s.approved();
    const sent = await s.request("/drafts/" + content.id + "/send", { expectedRevision: content.revision });
    assert.equal(sent.status, 502);
    assert.equal(sent.data.attempt.state, "unknown_requires_reconciliation");
    const another = await s.approved();
    assert.equal((await s.request("/drafts/" + another.id + "/send", { expectedRevision: another.revision })).status, 409);
    assert.equal((await s.request("/drafts/" + content.id + "/status", {})).data.attempt.state, "awaiting_manual_publish");
    assert.equal(s.sends(), 1);
  });
});
test("parallel sends reserve attempt before asynchronous provider call", async () => {
  let release;
  const barrier = new Promise(resolve => { release = resolve; });
  let initializations = 0;
  await setup({ initialize: async () => { initializations++; await barrier; return { publishId: "synthetic-id", uploadUrl: "https://synthetic.test" }; } }, async s => {
    const content = await s.approved();
    const first = s.request("/drafts/" + content.id + "/send", { expectedRevision: content.revision });
    while (!initializations) await new Promise(resolve => setTimeout(resolve, 10));
    const duplicate = await s.request("/drafts/" + content.id + "/send", { expectedRevision: content.revision });
    release();
    assert.equal(duplicate.status, 409); assert.equal((await first).status, 200);
    assert.equal(initializations, 1);
  });
});
test("planner HTTP uses the approved revision and rejects account/time collisions", async () => {
  await setup({}, async s => {
    const content = await s.approved();
    const scheduled = new Date(Date.now() + 86400000).toISOString();
    const expires = new Date(Date.now() + 172800000).toISOString();
    const body = { expectedRevision: content.revision, scheduledAt: scheduled, expiresAt: expires, timeZone: "America/Mexico_City" };
    assert.equal((await s.request("/drafts/" + content.id + "/plan", body)).status, 200);
    assert.equal((await s.request("/drafts/" + content.id + "/plan", body)).status, 409);
    assert.equal((await s.request("/plans")).data.plans.length, 1);
  });
});

test("editing approved copy revokes approval and stale edits do not mutate the revision", async () => {
  await setup({}, async s => {
    const content = await s.approved();
    const updated = await s.request("/drafts/" + content.id + "/edit", {
      expectedRevision: content.revision, title: content.title, copy: "Changed synthetic text", sourceRefs: content.sourceRefs
    });
    assert.equal(updated.data.content.state, "draft");
    assert.equal(updated.data.content.approval, null);
    assert.equal(updated.data.content.assetRefs[0], content.assetRefs[0]);
    assert.equal((await s.request("/drafts/" + content.id + "/edit", {
      expectedRevision: content.revision, title: content.title, copy: "Stale", sourceRefs: content.sourceRefs
    })).status, 409);
    assert.equal((await s.request("/drafts/" + content.id + "/send", { expectedRevision: updated.data.content.revision })).status, 409);
    assert.equal(s.sends(), 0);
  });
});
test("unknown initialization does not fabricate publishId and blocks another attempt", async () => {
  let calls = 0;
  await setup({ initialize: async () => { calls++; throw Error("synthetic initialization timeout"); } }, async s => {
    const content = await s.approved();
    const sent = await s.request("/drafts/" + content.id + "/send", { expectedRevision: content.revision });
    assert.equal(sent.data.attempt.publishId, null);
    assert.equal(sent.data.attempt.state, "unknown_requires_reconciliation");
    assert.equal((await s.request("/drafts/" + content.id + "/status", {})).status, 409);
    assert.equal((await s.request("/drafts/" + content.id + "/send", { expectedRevision: content.revision })).status, 409);
    assert.equal(calls, 1);
  });
});

test("local editorial is unavailable outside development", async () => {
  await setup({ allowLocalDevelopment: () => false }, async s => {
    assert.equal((await s.request("/session")).status, 403);
    assert.equal(s.sends(), 0);
  });
});

test("editor audio requires rights, revokes approval and blocks approval until rendering", async () => {
  let captured;
  const output=Buffer.from("synthetic-rendered-mp4");
  const outputHash=createHash("sha256").update(output).digest("hex");
  await setup({render:async args=>{captured=args;return {buffer:output,hash:outputHash,recipe:args.recipe,recipeSha256:"a".repeat(64),qc:{codec:"h264",width:720,height:1280,duration:1,audio:true,bytes:output.length}};}},async s=>{
    const content=await s.approved();
    const form=()=>{const f=new FormData();f.set("asset",new Blob(["synthetic-music"],{type:"audio/mpeg"}),"test.mp3");return f;};
    const path="/drafts/"+content.id;
    assert.equal((await s.request(path+"/track/music",null,{method:"POST",body:form(),headers:{"X-Content-Revision":String(content.revision)}})).status,400);
    const track=await s.request(path+"/track/music",null,{method:"POST",body:form(),headers:{"X-Content-Revision":String(content.revision),"X-Rights-Type":"owned","X-Rights-Evidence":"synthetic-test"}});
    assert.equal(track.data.content.state,"draft");assert.equal(track.data.content.approval,null);
    const current=(await s.request(path)).data;
    assert.equal(current.editor.needsRender,true);
    assert.equal((await s.request(path+"/approve",{confirmed:true,expectedRevision:current.content.revision,
      contentSha256:current.content.contentSha256,assetSha256:current.assetSha256})).status,409);
    const result=await s.request(path+"/render",{expectedRevision:current.content.revision,recipe:{rights:{type:"owned",evidence:"synthetic-test"}}});
    assert.equal(result.status,200);assert.equal(result.data.content.approval,null);
    assert.equal(captured.buffer.toString(),"synthetic-video");assert.equal(captured.tracks.music.buffer.toString(),"synthetic-music");
    const rendered=(await s.request(path)).data;
    assert.equal(rendered.assetSha256,outputHash);assert.equal(rendered.editor.needsRender,false);
    assert.equal((await s.request(path+"/approve",{confirmed:true,expectedRevision:rendered.content.revision,
      contentSha256:rendered.content.contentSha256,assetSha256:rendered.assetSha256})).status,200);
    const approved=(await s.request(path)).data.content;
    const restored=await s.request(path+"/restore",{expectedRevision:approved.revision});
    assert.equal(restored.data.content.approval,null);
    assert.equal((await s.request(path)).data.editor.recipe,null);
    assert.equal((await s.request(path)).data.editor.tracks.music,undefined);
  });
});
test("export locks concurrent send, edits and media replacement",async()=>{
  let release, started=false;
  const barrier=new Promise(resolve=>{release=resolve;});
  await setup({render:async args=>{started=true;await barrier;const buffer=Buffer.from("synthetic-render");return {buffer,hash:createHash("sha256").update(buffer).digest("hex"),recipe:args.recipe,qc:{codec:"h264"}};}},async s=>{
    const content=await s.approved(),path="/drafts/"+content.id;
    const pending=s.request(path+"/render",{expectedRevision:content.revision,recipe:{rights:{type:"owned",evidence:"synthetic"}}});
    while(!started)await new Promise(resolve=>setTimeout(resolve,10));
    const send=await s.request(path+"/send",{expectedRevision:content.revision});
    const edit=await s.request(path+"/edit",{expectedRevision:content.revision,title:content.title,copy:"Changed",sourceRefs:content.sourceRefs});
    release();
    assert.equal(send.status,409);assert.equal(edit.status,409);assert.equal((await pending).status,200);
    assert.equal(s.sends(),0);
  });
});
test("failed export leaves approved bytes and revision intact, without any provider call",async()=>{
  await setup({render:async()=>{throw Error("synthetic rendering failure");}},async s=>{
    const content=await s.approved(),path="/drafts/"+content.id;
    assert.equal((await s.request(path+"/render",{expectedRevision:content.revision,recipe:{}})).status,500);
    const current=(await s.request(path)).data;
    assert.equal(current.content.revision,content.revision);assert.equal(current.content.state,"approved");
    assert.equal(current.assetSha256,content.approval.assetSha256);assert.equal(s.sends(),0);
  });
});

test("removing an audio track revokes approval and requires new render",async()=>{
  await setup({},async s=>{
    const staged=await s.draft(),path="/drafts/"+staged.content.id;
    const form=new FormData();form.set("asset",new Blob(["synthetic-voice"],{type:"audio/webm"}),"voice.webm");
    const uploaded=await s.request(path+"/track/voice",null,{method:"POST",body:form,headers:{
      "X-Content-Revision":String(staged.content.revision),"X-Rights-Type":"owned","X-Rights-Evidence":"synthetic"}});
    const removed=await s.request(path+"/track/voice/remove",{expectedRevision:uploaded.data.content.revision});
    assert.equal(removed.status,200);assert.equal(removed.data.content.approval,null);
    const current=(await s.request(path)).data;
    assert.equal(current.editor.tracks.voice,undefined);assert.equal(current.editor.needsRender,true);
    assert.equal((await s.request(path+"/track/voice/remove",{expectedRevision:current.content.revision})).status,404);
  });
});

test("archiving is versioned, preserves approval and blocks operational reuse",async()=>{
  await setup({},async s=>{
    const approved=await s.approved(),path="/drafts/"+approved.id;
    const result=await s.request(path+"/archive",{expectedRevision:approved.revision});
    assert.equal(result.status,200);assert.equal(result.data.content.state,"archived");
    assert.deepEqual(result.data.content.approval,approved.approval);
    assert.equal((await s.request(path+"/send",{expectedRevision:result.data.content.revision})).status,409);
    assert.equal((await s.request(path+"/archive",{expectedRevision:result.data.content.revision})).status,409);
    assert.equal(s.sends(),0);
  });
});

test("local technical preflight is advisory, retained with the draft and never sends", async () => {
  const analysis = { video: { width: 1920, height: 1080, duration: 20, orientation: "horizontal", codec: "hevc" }, audio: { present: false }, alerts: ["synthetic alert"] };
  await setup({ inspect: async () => analysis }, async s => {
    const staged = await s.draft();
    const response = await s.request("/drafts/" + staged.content.id + "/preflight", {});
    assert.equal(response.status, 200);
    assert.equal(response.data.preflight.status, "review_required");
    assert.deepEqual(response.data.analysis, analysis);
    const loaded = await s.request("/drafts/" + staged.content.id);
    assert.equal(loaded.data.editor.preflight.status, "review_required");
    assert.equal(s.sends(), 0);
  });
});
