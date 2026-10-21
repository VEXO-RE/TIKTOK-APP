const $ = id => document.getElementById(id);
let session, content, assetHash, busy = false, ready = false, attempt;
let dirty = false;
let catalogProducts = [];
let catalogCategoryPage = 1, catalogProductPage = 1, catalogCategoriesMore = false, catalogProductsMore = false;
const states = { draft: "Borrador", review: "En revisión", approved: "Aprobado", archived: "Archivado" };
async function api(path, body, options = {}) {
  const response = await fetch("/api/editorial" + path, {
    ...options, headers: { ...(body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}), ...(session ? { "X-Editorial-CSRF": session.csrf } : {}) },
    ...(body ? { method: "POST", body: JSON.stringify(body) } : {})
  });
  const result = await response.json();
  if (!response.ok) {
    if (result.attempt) attempt = result.attempt;
    throw new Error(result.error?.message || "No se pudo completar la acción.");
  }
  return result;
}
function buttons() {
  const connected = session?.connected && session?.uploadScope && session?.uploadEnabled;
  const archived=content?.state === "archived";
  $("create").disabled = busy || archived || !connected;
  $("video").disabled = busy || !content || content.state === "archived" || Boolean(attempt) || dirty;
  for (const id of ["title", "copy", "sources"]) $(id).disabled = busy || archived;
  for (const id of ["new-draft", "refresh"]) $(id).disabled = busy;
  for (const id of ["tn-categories", "tn-products", "tn-category", "tn-search", "tn-product"]) $(id).disabled = busy;
  $("tn-categories-prev").disabled = busy || catalogCategoryPage <= 1;
  $("tn-categories-next").disabled = busy || !catalogCategoriesMore;
  $("tn-products-prev").disabled = busy || catalogProductPage <= 1;
  $("tn-products-next").disabled = busy || !catalogProductsMore;
  $("tn-use-product").disabled = busy || !catalogProducts.some(product => product.id === $("tn-product").value);
  $("create").textContent = content && !attempt ? "Guardar cambios" : "Guardar nuevo borrador";
  $("confirm").disabled = busy || !ready || content?.state !== "draft";
  $("approve").disabled = busy || dirty || !ready || !$("confirm").checked || content?.state !== "draft";
  $("send").disabled = busy || dirty || content?.state !== "approved" || Boolean(attempt) || !connected;
  $("check").disabled = busy || !attempt?.publishId;
  $("archive").disabled = busy || dirty || content?.state !== "approved" || Boolean(attempt);
  $("plan").disabled = busy || dirty || content?.state !== "approved";
  if(typeof editorButtons === "function") editorButtons();
  $("draft-state").textContent = content ? states[content.state] + " · revisión " + content.revision : "Todavía no hay un borrador seleccionado.";
}
function showAttempt() {
  if (!attempt) return;
  const messages = { sending: "Envío en curso. No repitas la acción.",
    awaiting_inbox: "Video transferido. Consulta el estado antes de confirmar recepción.",
    awaiting_manual_publish: "TikTok confirmó el procesamiento. Revisa Inbox y completa la publicación allí.",
    unknown_requires_reconciliation: "Resultado incierto. Revisa TikTok Inbox y consulta el estado; no repitas el envío.",
    failed: "TikTok informó un fallo. Revisa Inbox antes de preparar otro intento." };
  $("result").textContent = (messages[attempt.state] || "Consulta el estado.") +
    (attempt.publishId ? "\nReferencia del envío: " + attempt.publishId : "");
}
async function run(task) {
  if (busy || (typeof recording !== "undefined" && recording)) return;
  busy = true; buttons();
  try { await task(); } catch (error) { $("result").textContent = error.message; }
  finally { busy = false; buttons(); }
}
async function refresh() {
  const previous = session?.csrf;
  session = await api("/session");
  if (previous && previous !== session.csrf) {
    content = null; assetHash = null; attempt = null; ready = false;
    $("preview").removeAttribute("src"); $("preview").hidden = true; $("confirm").checked = false;
    $("result").textContent = "La sesión o cuenta cambió. Selecciona y revisa el contenido de nuevo.";
  }
  $("connection").textContent = session.connected
    ? "Cuenta conectada · referencia " + session.accountRef.slice(-12) + (session.uploadScope && session.uploadEnabled ? " · envío habilitado" : " · envío no habilitado")
    : "Conecta tu cuenta de TikTok para preparar el envío.";
  await lists(); if(typeof editorInit === "function") await editorInit(); buttons();
}
async function lists() {
  const drafts = await api("/drafts");
  $("drafts").replaceChildren();
  for (const draft of drafts.contents) {
    const li = document.createElement("li"), button = document.createElement("button");
    button.type = "button"; button.textContent = draft.title + " · " + states[draft.state];
    button.addEventListener("click", () => run(() => select(draft.id)));
    li.append(button); $("drafts").append(li);
  }
  const plans = await api("/plans");
  $("plans").replaceChildren();
  const labels = { planned: "Reservado", needs_review: "Requiere nueva revisión", expired: "Vencido", cancelled: "Cancelado" };
  for (const plan of plans.plans) {
    const li = document.createElement("li");
    li.textContent = new Date(plan.scheduledAt).toLocaleString("es-MX", { timeZone: plan.timeZone }) + " · " + plan.timeZone + " · " + labels[plan.status];
    $("plans").append(li);
  }
}
async function select(id) {
  const data = await api("/drafts/" + id);
  dirty = false; content = data.content; assetHash = data.assetSha256; attempt = data.attempt; ready = false;
  $("confirm").checked = false;
  $("title").value = content.title; $("copy").value = content.copy; $("sources").value = content.sourceRefs.join("\n");
  if(typeof editorLoad === "function") editorLoad(data);
  const video = $("preview"); video.pause(); video.removeAttribute("src"); video.load();
  video.hidden = !assetHash;
  if (assetHash) video.src = "/api/editorial/drafts/" + id + "/video?revision=" + content.revision;
  $("preview-state").textContent = assetHash ? "Cargando el video guardado en el servidor…" : "Selecciona un video.";
  $("result").textContent = ""; showAttempt(); buttons();
}
$("preview").addEventListener("loadeddata", () => {
  if (!$("preview").currentSrc.includes("/drafts/" + content?.id + "/video")) return;
  ready = true; $("preview-state").textContent = "Revisa este video guardado: son los bytes que se enviarán."; buttons();
});
$("preview").addEventListener("error", () => {
  ready = false; $("confirm").checked = false;
  $("preview-state").textContent = "No se pudo reproducir. Selecciona un video compatible."; buttons();
});
$("refresh").addEventListener("click", () => run(refresh));
function replaceOptions(id, items, label, empty) {
  const select = $(id); select.replaceChildren();
  const first = document.createElement("option"); first.value = ""; first.textContent = empty; select.append(first);
  for (const item of items) { const option = document.createElement("option"); option.value = item.id; option.textContent = label(item); select.append(option); }
}
async function loadCategories(page = 1) {
  const result = await api("/catalog/categories?page=" + page);
  catalogCategoryPage = result.page; catalogCategoriesMore = result.hasMore;
  replaceOptions("tn-category", result.items, item => item.name || `Categoría ${item.id}`, "Todas");
  $("tn-status").textContent = `${result.items.length} categorías · página ${result.page}${result.hasMore ? " · hay más resultados" : ""} · vigencia hasta ${new Date(result.snapshot.expiresAt).toLocaleTimeString("es-MX")}.`;
  buttons();
}
async function loadProducts(page = 1) {
  const query = new URLSearchParams(); const search = $("tn-search").value.trim(); const categoryId = $("tn-category").value;
  if (search) query.set("q", search); if (categoryId) query.set("categoryId", categoryId); query.set("published", "true");
  query.set("page", String(page));
  const result = await api("/catalog/products?" + query);
  catalogProductPage = result.page; catalogProductsMore = result.hasMore; catalogProducts = result.items;
  replaceOptions("tn-product", catalogProducts, item => item.name || `Producto ${item.id}`, "Selecciona un producto");
  $("tn-product-detail").textContent = "";
  $("tn-status").textContent = `${result.items.length} productos · página ${result.page}${result.hasMore ? " · hay más resultados" : ""} · vigencia hasta ${new Date(result.snapshot.expiresAt).toLocaleTimeString("es-MX")}.`;
  buttons();
}
$("tn-categories").addEventListener("click", () => run(() => loadCategories(1)));
$("tn-categories-prev").addEventListener("click", () => run(() => loadCategories(catalogCategoryPage - 1)));
$("tn-categories-next").addEventListener("click", () => run(() => loadCategories(catalogCategoryPage + 1)));
$("tn-products").addEventListener("click", () => run(() => loadProducts(1)));
$("tn-products-prev").addEventListener("click", () => run(() => loadProducts(catalogProductPage - 1)));
$("tn-products-next").addEventListener("click", () => run(() => loadProducts(catalogProductPage + 1)));
$("tn-product").addEventListener("change", buttons);
function productDescription(product) {
  if (!product?.description) return "";
  const container = document.createElement("div");
  container.innerHTML = product.description;
  return (container.textContent || "").replace(/\s+/g, " ").trim().slice(0, 500);
}
$("tn-product").addEventListener("change", () => {
  const product = catalogProducts.find(item => item.id === $("tn-product").value);
  const description = productDescription(product);
  $("tn-product-detail").textContent = description ? description : product ? "Tiendanube no devolvió una descripción para este producto." : "";
  buttons();
});
$("tn-use-product").addEventListener("click", () => {
  const product = catalogProducts.find(item => item.id === $("tn-product").value); if (!product) return;
  if (!$("title").value.trim() && product.name) $("title").value = product.name;
  const description = productDescription(product);
  if (!$("copy").value.trim() && description) $("copy").value = description;
  const reference = product.productUrl || `tiendanube:product:${product.id}`;
  const references = $("sources").value.split("\n").map(value => value.trim()).filter(Boolean);
  if (!references.includes(reference)) references.push(reference);
  $("sources").value = references.join("\n");
  dirty = Boolean(content); $("confirm").checked = false;
  $("tn-status").textContent = product.productUrl ? "Producto incorporado como referencia con su URL pública." : "Producto incorporado por su identificador; Tiendanube no devolvió URL pública verificable.";
  buttons();
});
$("confirm").addEventListener("change", buttons);
$("draft-form").addEventListener("submit", event => {
  event.preventDefault(); run(async () => {
    const body = { title: $("title").value, copy: $("copy").value,
      sourceRefs: $("sources").value.split("\n").map(s => s.trim()).filter(Boolean) };
    const editing = content && !attempt;
    if (editing) body.expectedRevision = content.revision;
    const result = await api(editing ? "/drafts/" + content.id + "/edit" : "/drafts", body);
    await select(result.content.id); await lists();
  });
});
$("video").addEventListener("change", () => run(async () => {
  const file = $("video").files[0]; if (!file || !content) return;
  ready = false; $("confirm").checked = false;
  const form = new FormData(); form.set("video", file);
  const result = await api("/drafts/" + content.id + "/video", null, {
    method: "POST", body: form, headers: { "X-Content-Revision": String(content.revision) }
  });
  await select(result.content.id); await lists();
}));
$("approve").addEventListener("click", () => run(async () => {
  if (!ready || !$("confirm").checked) return;
  const result = await api("/drafts/" + content.id + "/approve", { confirmed: true,
    expectedRevision: content.revision, contentSha256: content.contentSha256, assetSha256: assetHash });
  content = result.content; $("confirm").checked = false; $("result").textContent = "Aprobación guardada para esta revisión, video y cuenta.";
  await lists();
}));
$("send").addEventListener("click", () => run(async () => {
  // Block locally before network; a lost response must be reconciled.
  attempt = { state: "sending", publishId: null }; showAttempt(); buttons();
  try {
    const result = await api("/drafts/" + content.id + "/send", { expectedRevision: content.revision });
    attempt = result.attempt; showAttempt();
  } catch (error) {
    try { const data = await api("/drafts/" + content.id); attempt = data.attempt || { state: "unknown_requires_reconciliation", publishId: null }; }
    catch { attempt = { state: "unknown_requires_reconciliation", publishId: null }; }
    showAttempt(); throw error;
  }
}));
$("check").addEventListener("click", () => run(async () => {
  const result = await api("/drafts/" + content.id + "/status", {});
  attempt = result.attempt; showAttempt();
}));
$("archive").addEventListener("click",()=>run(async()=>{
  const result=await api("/drafts/"+content.id+"/archive",{expectedRevision:content.revision});
  await select(result.content.id);await lists();
  $("result").textContent="Contenido archivado. El historial y la aprobación quedan conservados; crea un nuevo borrador para volver a trabajar.";
}));
$("plan-form").addEventListener("submit", event => {
  event.preventDefault(); run(async () => {
    const toUtc = value => new Date(value + ":00.000Z").toISOString();
    await api("/drafts/" + content.id + "/plan", { expectedRevision: content.revision,
      scheduledAt: toUtc($("scheduled").value), expiresAt: toUtc($("expires").value),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone });
    $("result").textContent = "Fecha reservada. El envío se realiza manualmente con el botón de Inbox.";
    await lists();
  });
});
for (const id of ["title", "copy", "sources"]) $(id).addEventListener("input", () => {
  dirty = Boolean(content); $("confirm").checked = false; buttons();
});
$("new-draft").addEventListener("click", () => {
  if (busy) return;
  content = null; assetHash = null; attempt = null; ready = false; dirty = false;
  for (const id of ["title", "copy", "sources", "video"]) $(id).value = "";
  $("preview").pause(); $("preview").removeAttribute("src"); $("preview").load(); $("preview").hidden = true;
  $("confirm").checked = false; $("result").textContent = ""; buttons();
});
run(refresh);
