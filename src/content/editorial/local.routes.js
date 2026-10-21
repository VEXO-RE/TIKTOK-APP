import express from "express";
import { createHash } from "node:crypto";
import { AppError } from "../../core/errors.js";
import { features } from "../../config/features.js";
import { tokenStore } from "../../tiktok/developer/tokens/token.store.js";
import { parseSingleVideo, validateVideoFile } from "../../tiktok/developer/content/media.js";
import { initializeVideoUpload, putVideo, getPostStatus } from "../../tiktok/developer/content/upload.service.js";
import { createRevisionService } from "./revision.service.js";
import { createApprovalService } from "../approval/approval.service.js";
import { createCalendarService } from "../calendar/calendar.service.js";
import { renderVideo, mediaCapabilities } from "../../media/render.service.js";
import { parseEditorAsset } from "../../media/uploads.js";
import { inspectVideo } from "../../media/inspect.service.js";
import { evaluateVideoPreflight } from "../../media/preflight.service.js";
import { createTiendanubeCatalogService } from "../../integrations/tiendanube/catalog.service.js";
import { createSessionService } from "../../identity/session.service.js";

const hash = value => createHash("sha256").update(value).digest("hex");
const fail = (message, status, code) => { throw new AppError(message, status, code); };

// Local, single-operator development only. Never trusts tenant/account from HTTP.
export function createLocalEditorialRouter({
  tokens = tokenStore, enabled = () => features.tiktokContentUpload,
  allowLocalDevelopment = () => process.env.NODE_ENV !== "production",
  initialize = initializeVideoUpload, transfer = putVideo, fetchStatus = getPostStatus,
  now = () => Date.now(), render = renderVideo, capabilities = mediaCapabilities,
  inspect = inspectVideo, preflight = evaluateVideoPreflight, catalog = createTiendanubeCatalogService()
} = {}) {
  const router = express.Router();
  const attempts = new Map();
  const ttl = 2 * 60 * 60 * 1000;
  const sessions = createSessionService({now,ttl,createContext:({id,accountRef})=>{
    const revisions=createRevisionService();
    return { assets:new Map(),drafts:new Set(),auth:{tenantRef:"local:"+id,actorRef:"local-operator"},revisions,
      approvals:createApprovalService({revisionService:revisions}),calendar:createCalendarService({revisionService:revisions}) };
  }});
  function account(token) { return token ? "tiktok:" + hash(token.openId) : null; }
  function tokenFor(session) {
    if (!enabled()) fail("Content Upload está deshabilitado.", 404, "TIKTOK_CONTENT_UPLOAD_DISABLED");
    const token = tokens.get();
    if (!token || !token.scope.split(",").map(s => s.trim()).includes("video.upload")) {
      fail("Conecta TikTok con permiso video.upload.", 401, "TIKTOK_CONNECTION_REQUIRED");
    }
    if (account(token) !== session.accountRef) fail("La cuenta cambió. Recarga y revisa nuevamente.", 409, "EDITORIAL_ACCOUNT_CHANGED");
    return token;
  }
  router.use((req, res, next) => {
    try {
      if (!allowLocalDevelopment()) fail("Flujo editorial local deshabilitado en producción.", 403, "EDITORIAL_LOCAL_ONLY");
      const address = req.socket.remoteAddress;
      const hosts = ["localhost", "127.0.0.1", "[::1]"].map(host => host + ":" + req.socket.localPort);
      if (!["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(address) ||
          !hosts.includes(req.headers.host)) fail("Este flujo solo permite acceso local.", 403, "EDITORIAL_LOCAL_ONLY");
      const origin = "http://" + req.headers.host;
      if (req.headers["sec-fetch-site"] === "cross-site" ||
          (req.headers.origin && req.headers.origin !== origin) ||
          (req.method !== "GET" && req.headers.origin !== origin)) {
        fail("Origen de solicitud no permitido.", 403, "EDITORIAL_ORIGIN_REQUIRED");
      }
      res.set("Cache-Control", "no-store");
      next();
    } catch (error) { next(error); }
  });
  function sessionCookie(req) {
    return (req.headers.cookie || "").split(";").map(x => x.trim())
      .find(x => x.startsWith("editorial_session="))?.slice("editorial_session=".length);
  }
  router.get("/session", (req, res) => {
    const token = tokens.get();
    const target = account(token);
    const opened=sessions.open({id:sessionCookie(req),accountRef:target});
    const {id,session:s}=opened;
    if(opened.created) {
      res.cookie("editorial_session", id, { httpOnly: true, sameSite: "strict", path: "/api/editorial", maxAge: ttl });
    }
    res.json({ ok: true, csrf: s.csrf, connected: Boolean(token), uploadEnabled: enabled(),
      uploadScope: Boolean(token?.scope.split(",").map(x => x.trim()).includes("video.upload")),
      accountRef: target, mode: "local-single-operator" });
  });
  router.use((req, res, next) => {
    try {
      const s = sessions.get(sessionCookie(req));
      if (!s) fail("La sesión terminó. Recarga la página.", 401, "EDITORIAL_SESSION_REQUIRED");
      if (req.method !== "GET" && req.headers["x-editorial-csrf"] !== s.csrf) {
        fail("Recarga la sesión antes de continuar.", 403, "EDITORIAL_CSRF_REQUIRED");
      }
      req.editorial = s;
      next();
    } catch (error) { next(error); }
  });
  function mediaBytes() {
    const buffers = new Set();
    for (const session of sessions.values()) for (const asset of session.assets.values()) {
      buffers.add(asset.buffer);
      if (asset.original) buffers.add(asset.original);
      for (const track of Object.values(asset.tracks || {})) buffers.add(track.buffer);
      if (asset.image) buffers.add(asset.image.buffer);
    }
    return [...buffers].reduce((sum,b)=>sum+b.length,0);
  }
  function mutableAsset(req) {
    const content=latest(req), asset=req.editorial.assets.get(content.id);
    if (!asset) fail("Selecciona un video.",404,"EDITORIAL_VIDEO_REQUIRED");
    if (asset.attempt || asset.rendering) fail("Espera la exportación o consulta el envío existente.",409,"EDITORIAL_MEDIA_LOCKED");
    return {content,asset};
  }
  function latest(req) {
    return req.editorial.revisions.getLatest({ auth: req.editorial.auth, id: req.params.id });
  }
  const wrap = fn => (req, res, next) => Promise.resolve().then(() => fn(req, res)).catch(next);
  router.post("/drafts", wrap((req, res) => {
    const s = req.editorial;
    tokenFor(s);
    if (s.drafts.size >= 10) fail("Límite de diez borradores por sesión local.", 409, "EDITORIAL_DRAFT_LIMIT");
    if (!req.body || Object.keys(req.body).some(k => !["title", "copy", "sourceRefs"].includes(k))) {
      fail("Campos editoriales inválidos.", 400, "CONTENT_INPUT_INVALID");
    }
    const content = s.revisions.createDraft({ auth: s.auth, input: {
      ...req.body, targetAccountRef: s.accountRef, assetRefs: []
    } });
    s.drafts.add(content.id);
    res.status(201).json({ content });
  }));
  router.post("/drafts/:id/edit", wrap((req, res) => {
    const s = req.editorial; tokenFor(s); const content = latest(req);
    if ((s.assets.get(content.id)?.attempt || s.assets.get(content.id)?.rendering)) fail("Consulta el intento antes de crear otra versión.", 409, "EDITORIAL_ATTEMPT_EXISTS");
    if (!req.body || Object.keys(req.body).some(k => !["title", "copy", "sourceRefs", "expectedRevision"].includes(k))) {
      fail("Campos editoriales inválidos.", 400, "CONTENT_INPUT_INVALID");
    }
    const revised = s.revisions.revise({ auth: s.auth, id: content.id, expectedRevision: req.body.expectedRevision,
      input: { title: req.body.title, copy: req.body.copy, sourceRefs: req.body.sourceRefs,
        targetAccountRef: content.targetAccountRef, assetRefs: content.assetRefs } });
    res.json({ content: revised });
  }));
  router.get("/drafts", wrap((req, res) => {
    const s = req.editorial;
    res.json({ contents: [...s.drafts].map(id => s.revisions.getLatest({ auth: s.auth, id })) });
  }));
  router.get("/drafts/:id", wrap((req, res) => {
    const content = latest(req);
    const asset = req.editorial.assets.get(content.id);
    res.json({ content, assetSha256: asset?.hash, attempt: asset?.attempt || null,
      editor: asset ? { sourceSha256: hash(asset.original || asset.buffer), recipe: asset.recipe || null,
        recipeSha256:asset.recipeSha256 || null,sources:asset.sources || null,qc: asset.qc || null, needsRender: Boolean(asset.needsRender), tracks: Object.fromEntries(Object.entries(asset.tracks || {}).map(([name,t])=>[name,{hash:t.hash,rights:t.rights}])),
        image: asset.image ? {hash:asset.image.hash,rights:asset.image.rights} : null,
        analysis: asset.analysis || null, preflight: asset.preflight || null } : null });
  }));
  router.post("/drafts/:id/video", (req, res, next) => {
    try {
      tokenFor(req.editorial);
      const content = latest(req);
      if ((req.editorial.assets.get(content.id)?.attempt || req.editorial.assets.get(content.id)?.rendering)) fail("El envío ya tiene un intento; consulta su estado.", 409, "EDITORIAL_ATTEMPT_EXISTS");
      if (Number(req.headers["x-content-revision"]) !== content.revision) fail("La revisión cambió.", 409, "CONTENT_REVISION_CONFLICT");
      next();
    } catch (error) { next(error); }
  }, parseSingleVideo, wrap((req, res) => {
    const s = req.editorial;
    const content = latest(req);
    if (Number(req.headers["x-content-revision"]) !== content.revision) fail("La revisión cambió.", 409, "CONTENT_REVISION_CONFLICT");
    if ((s.assets.get(content.id)?.attempt || s.assets.get(content.id)?.rendering)) fail("Consulta el intento existente.", 409, "EDITORIAL_ATTEMPT_EXISTS");
    const video = validateVideoFile(req.file);
    const oldAsset = s.assets.get(content.id);
    const oldBuffers = oldAsset ? new Set([oldAsset.buffer,oldAsset.original,...Object.values(oldAsset.tracks || {}).map(t=>t.buffer),oldAsset.image?.buffer].filter(Boolean)) : new Set();
    const total = mediaBytes() - [...oldBuffers].reduce((sum,b)=>sum+b.length,0);
    if (total + video.buffer.length > 64 * 1024 * 1024) fail("La sesión excede 64 MiB de videos.", 413, "EDITORIAL_MEDIA_LIMIT");
    const assetHash = hash(video.buffer);
    const revised = s.revisions.revise({ auth: s.auth, id: content.id, expectedRevision: content.revision,
      input: { targetAccountRef: content.targetAccountRef, title: content.title, copy: content.copy,
        sourceRefs: content.sourceRefs, assetRefs: ["sha256:" + assetHash] } });
    s.assets.set(content.id, { buffer: video.buffer, original: video.buffer, originalContentType: video.contentType, contentType: video.contentType, hash: assetHash, tracks: {}, image: null, recipe: null, qc: null });
    res.json({ content: revised, assetSha256: assetHash });
  }));
  router.get("/drafts/:id/video", wrap((req, res) => {
    latest(req);
    const asset = req.editorial.assets.get(req.params.id);
    if (!asset) fail("Selecciona un video.", 404, "EDITORIAL_VIDEO_REQUIRED");
    res.set("Content-Type", asset.contentType).set("X-Content-Type-Options", "nosniff").send(asset.buffer);
  }));
  router.get("/media/capabilities", wrap(async (req,res)=>res.json(await capabilities())));
  router.get("/catalog/categories", wrap(async (req, res) => {
    res.json(await catalog.listCategories({ page: req.query.page, language: req.query.language }));
  }));
  router.get("/catalog/products", wrap(async (req, res) => {
    res.json(await catalog.listProducts({ page: req.query.page, language: req.query.language, query: req.query.q, categoryId: req.query.categoryId, published: req.query.published === "true" ? true : req.query.published === "false" ? false : undefined }));
  }));
  router.post("/drafts/:id/analyze", wrap(async (req, res) => {
    const { asset } = mutableAsset(req);
    const analysis = await inspect({ buffer: asset.buffer });
    asset.analysis = analysis;
    res.json({ analysis });
  }));
  router.post("/drafts/:id/preflight", wrap(async (req, res) => {
    const { asset } = mutableAsset(req);
    const analysis = await inspect({ buffer: asset.buffer });
    const result = preflight(analysis);
    asset.analysis = analysis;
    asset.preflight = result;
    res.json({ analysis, preflight: result });
  }));
  router.post("/drafts/:id/track/:kind", (req,res,next)=>{
    try {
      tokenFor(req.editorial);mutableAsset(req);
      if (!["music","voice","image"].includes(req.params.kind)) fail("Pista no soportada.",400,"MEDIA_ASSET_INVALID");
      next();
    } catch(error){next(error);}
  },parseEditorAsset,wrap((req,res)=>{
    const s=req.editorial;tokenFor(s);const {content,asset}=mutableAsset(req);
    if (Number(req.headers["x-content-revision"])!==content.revision) fail("La revisión cambió.",409,"CONTENT_REVISION_CONFLICT");
    const kind=req.params.kind;
    if ((kind==="image")!==req.file.mimetype.startsWith("image/")) fail("El tipo de archivo no coincide con la pista.",400,"MEDIA_ASSET_INVALID");
    const type=req.headers["x-rights-type"]; let evidence;
    try {evidence=decodeURIComponent(req.headers["x-rights-evidence"]||"");} catch {fail("Referencia de derechos inválida.",400,"MEDIA_RIGHTS_REQUIRED");}
    if (!["owned","licensed"].includes(type) || typeof evidence!=="string" || !evidence.trim() || evidence.length>500) fail("Indica origen propio/licenciado y referencia de derechos.",400,"MEDIA_RIGHTS_REQUIRED");
    const old=kind==="image"?asset.image:asset.tracks[kind];
    if (mediaBytes()-(old?.buffer.length||0)+req.file.buffer.length>64*1024*1024) fail("Los medios exceden 64 MiB por proceso.",413,"EDITORIAL_MEDIA_LIMIT");
    const track={buffer:req.file.buffer,hash:hash(req.file.buffer),rights:{type,evidence}};
    const nextRefs=[...content.assetRefs.filter(ref=>!ref.startsWith(kind+":")),kind+":"+track.hash];
    const revised=s.revisions.revise({auth:s.auth,id:content.id,expectedRevision:content.revision,
      input:{targetAccountRef:content.targetAccountRef,title:content.title,copy:content.copy,sourceRefs:content.sourceRefs,assetRefs:nextRefs}});
    if(kind==="image")asset.image=track;else asset.tracks[kind]=track;
    asset.needsRender=true;
    res.json({content:revised,assetHash:track.hash});
  }));
  router.post("/drafts/:id/track/:kind/remove",wrap((req,res)=>{
    const s=req.editorial;tokenFor(s);const {content,asset}=mutableAsset(req);
    const kind=req.params.kind;
    if(!["music","voice","image"].includes(kind))fail("Pista no soportada.",400,"MEDIA_ASSET_INVALID");
    const track=kind==="image"?asset.image:asset.tracks[kind];
    if(!track)fail("La pista no existe.",404,"MEDIA_ASSET_REQUIRED");
    const revised=s.revisions.revise({auth:s.auth,id:content.id,expectedRevision:req.body?.expectedRevision,
      input:{targetAccountRef:content.targetAccountRef,title:content.title,copy:content.copy,sourceRefs:content.sourceRefs,
        assetRefs:content.assetRefs.filter(ref=>!ref.startsWith(kind+":"))}});
    if(kind==="image")asset.image=null;else delete asset.tracks[kind];
    asset.needsRender=true;
    res.json({content:revised});
  }));
  router.post("/drafts/:id/render",wrap(async(req,res)=>{
    const s=req.editorial;tokenFor(s);const {content,asset}=mutableAsset(req);
    if(req.body?.expectedRevision!==content.revision) fail("La revisión cambió.",409,"CONTENT_REVISION_CONFLICT");
    asset.rendering=true;
    try {
      const result=await render({buffer:asset.original||asset.buffer,tracks:asset.tracks,image:asset.image,recipe:req.body.recipe});
      tokenFor(s);
      if(!sessions.has(sessionCookie(req))) fail("La sesión venció durante la exportación.",401,"EDITORIAL_SESSION_REQUIRED");
      const current=latest(req);
      if(current.revision!==content.revision) fail("La revisión cambió durante la exportación.",409,"CONTENT_REVISION_CONFLICT");
      const retained = asset.buffer===asset.original ? 0 : asset.buffer.length;
      if(mediaBytes()-retained+result.buffer.length>64*1024*1024) fail("Original y exportación exceden 64 MiB. Usa un video menor.",413,"EDITORIAL_MEDIA_LIMIT");
      const revised=s.revisions.revise({auth:s.auth,id:content.id,expectedRevision:content.revision,
        input:{targetAccountRef:content.targetAccountRef,title:content.title,copy:content.copy,sourceRefs:content.sourceRefs,assetRefs:["sha256:"+result.hash]}});
      Object.assign(asset,{buffer:result.buffer,hash:result.hash,contentType:"video/mp4",recipe:result.recipe,
        recipeSha256:result.recipeSha256,sources:result.sources,qc:result.qc,needsRender:false});
      res.json({content:revised,assetSha256:result.hash,qc:result.qc});
    } finally {asset.rendering=false;}
  }));
  router.post("/drafts/:id/restore",wrap((req,res)=>{
    const s=req.editorial;tokenFor(s);const {content,asset}=mutableAsset(req);
    const revised=s.revisions.revise({auth:s.auth,id:content.id,expectedRevision:req.body?.expectedRevision,
      input:{targetAccountRef:content.targetAccountRef,title:content.title,copy:content.copy,sourceRefs:content.sourceRefs,assetRefs:["sha256:"+hash(asset.original)]}});
    Object.assign(asset,{buffer:asset.original,contentType:asset.originalContentType,hash:hash(asset.original),recipe:null,qc:null,tracks:{},image:null,needsRender:false});
    res.json({content:revised,assetSha256:asset.hash});
  }));

  router.post("/drafts/:id/approve", wrap((req, res) => {
    const s = req.editorial;
    tokenFor(s);
    const content = latest(req);
    const asset = s.assets.get(content.id);
    if (!asset || asset.attempt || asset.rendering || asset.needsRender) fail("Selecciona un video sin envío previo.", 409, "EDITORIAL_VIDEO_REQUIRED");
    if (req.body?.confirmed !== true || req.body?.expectedRevision !== content.revision ||
        req.body?.assetSha256 !== asset.hash || req.body?.contentSha256 !== content.contentSha256) {
      fail("Revisa y aprueba el mismo contenido y video.", 409, "EDITORIAL_APPROVAL_MISMATCH");
    }
    const review = s.revisions.submitForReview({ auth: s.auth, id: content.id, expectedRevision: content.revision });
    const approved = s.approvals.approveDraftUpload({ auth: s.auth, id: content.id, expectedRevision: review.revision,
      targetAccountRef: content.targetAccountRef, contentSha256: content.contentSha256, assetSha256: asset.hash });
    res.json({ content: approved });
  }));
  router.post("/drafts/:id/archive",wrap((req,res)=>{
    const s=req.editorial;tokenFor(s);const content=latest(req);const asset=s.assets.get(content.id);
    if(asset?.attempt || asset?.rendering) fail("Consulta el intento antes de archivar.",409,"EDITORIAL_ATTEMPT_EXISTS");
    if(!req.body || Object.keys(req.body).some(key=>key!=="expectedRevision")) fail("Campos editoriales inválidos.",400,"CONTENT_INPUT_INVALID");
    const archived=s.revisions.archive({auth:s.auth,id:content.id,expectedRevision:req.body.expectedRevision});
    res.json({content:archived});
  }));
  router.post("/drafts/:id/plan", wrap((req, res) => {
    const s = req.editorial; tokenFor(s); latest(req);
    res.json({ plan: s.calendar.plan({ auth: s.auth, input: { ...req.body, contentId: req.params.id } }) });
  }));
  router.get("/plans", wrap((req, res) => res.json({ plans: req.editorial.calendar.list({ auth: req.editorial.auth }) })));
  router.post("/drafts/:id/send", wrap(async (req, res) => {
    const s = req.editorial;
    const token = tokenFor(s);
    const content = latest(req);
    const asset = s.assets.get(content.id);
    if (content.state !== "approved" || req.body?.expectedRevision !== content.revision ||
        !asset || asset.rendering || asset.needsRender || content.approval.assetSha256 !== hash(asset.buffer)) {
      fail("Se requiere aprobar la revisión y el video actuales.", 409, "EDITORIAL_APPROVAL_REQUIRED");
    }
    const fingerprint = content.targetAccountRef + ":" + asset.hash;
    if (attempts.has(fingerprint) || asset.attempt) fail("Ya existe un intento para este video y cuenta. Consulta el estado y TikTok Inbox.", 409, "EDITORIAL_ATTEMPT_EXISTS");
    if (attempts.size >= 100) fail("Límite local de intentos alcanzado. Conserva las referencias antes de reiniciar.", 409, "EDITORIAL_ATTEMPT_LIMIT");
    const attempt = { state: "sending", publishId: null, providerStatus: null };
    attempts.set(fingerprint, attempt);
    asset.attempt = attempt;
    try {
      const initialized = await initialize({ accessToken: token.accessToken, videoSize: asset.buffer.length });
      attempt.publishId = initialized.publishId;
      await transfer({ uploadUrl: initialized.uploadUrl, buffer: asset.buffer, contentType: asset.contentType });
      attempt.state = "awaiting_inbox";
      res.json({ attempt: { ...attempt } });
    } catch {
      attempt.state = "unknown_requires_reconciliation";
      res.status(502).json({ attempt: { ...attempt }, error: {
        code: "EDITORIAL_RECONCILIATION_REQUIRED",
        message: "No se confirmó el envío. Consulta el estado y revisa TikTok Inbox; no repitas el envío."
      } });
    }
  }));
  router.post("/drafts/:id/status", wrap(async (req, res) => {
    const s = req.editorial;
    const token = tokenFor(s);
    const content = latest(req);
    const attempt = s.assets.get(content.id)?.attempt;
    if (!attempt?.publishId) fail("No hay referencia de envío para consultar; revisa TikTok Inbox.", 409, "EDITORIAL_STATUS_UNAVAILABLE");
    if (attempt.lastChecked && now() - attempt.lastChecked < 5000) fail("Espera cinco segundos entre consultas.", 429, "EDITORIAL_STATUS_RATE_LIMIT");
    attempt.lastChecked = now();
    const result = await fetchStatus({ accessToken: token.accessToken, publishId: attempt.publishId });
    attempt.providerStatus = result.status;
    if (result.status === "SEND_TO_USER_INBOX" || result.status === "PUBLISH_COMPLETE") attempt.state = "awaiting_manual_publish";
    else if (result.status === "FAILED") attempt.state = "failed";
    res.json({ attempt: { ...attempt } });
  }));
  return router;
}
