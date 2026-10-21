import { AppError } from "../../core/errors.js";
import { mapTiendanubeCategory, mapTiendanubeProduct } from "./catalog.mapper.js";
import { createSnapshotRepository } from "./snapshot.repository.js";

const DEFAULT_BASE_URL = "https://api.tiendanube.com/2025-03";
const PAGE_SIZE = 30;

function config(env) {
  const storeId = String(env.TIENDANUBE_STORE_ID || "").trim();
  const accessToken = String(env.TIENDANUBE_ACCESS_TOKEN || "").trim();
  const userAgent = String(env.TIENDANUBE_USER_AGENT || "ShopinistaMeta TikTok (support@shopinistameta.com)").trim();
  const apiBaseUrl = String(env.TIENDANUBE_API_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, "");
  if (env.TIENDANUBE_ENABLED !== "true" || !storeId || !accessToken || !userAgent) throw new AppError("La lectura de Tiendanube no está configurada.", 503, "TIENDANUBE_NOT_CONFIGURED");
  if (!/^\d+$/.test(storeId)) throw new AppError("La tienda Tiendanube configurada no es válida.", 503, "TIENDANUBE_NOT_CONFIGURED");
  try { if (new URL(apiBaseUrl).protocol !== "https:") throw Error(); } catch { throw new AppError("La URL de Tiendanube no es válida.", 503, "TIENDANUBE_NOT_CONFIGURED"); }
  return { storeId, accessToken, userAgent, apiBaseUrl, locale: String(env.TIENDANUBE_LOCALE || "es").trim() || "es" };
}

function page(value) { const parsed = Number(value || 1); return Number.isInteger(parsed) && parsed > 0 && parsed <= 10000 ? parsed : 1; }
function text(value, max = 120) { return typeof value === "string" && value.trim().length <= max ? value.trim() : null; }

export function createTiendanubeCatalogService({ env = process.env, fetchFn = fetch, snapshots = createSnapshotRepository() } = {}) {
  async function request(path, parameters = {}) {
    const current = config(env);
    const url = new URL(`${current.apiBaseUrl}/${current.storeId}/${path}`);
    for (const [key, value] of Object.entries(parameters)) if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
    let response;
    try { response = await fetchFn(url, { headers: { Authorization: `Bearer ${current.accessToken}`, "User-Agent": current.userAgent, Accept: "application/json" }, signal: AbortSignal.timeout(10000) }); }
    catch { throw new AppError("No se pudo consultar Tiendanube.", 502, "TIENDANUBE_UNAVAILABLE"); }
    if (!response.ok) {
      const code = response.status === 401 || response.status === 403 ? "TIENDANUBE_AUTH_FAILED" : response.status === 402 ? "TIENDANUBE_PAYMENT_REQUIRED" : "TIENDANUBE_REQUEST_FAILED";
      throw new AppError("Tiendanube rechazó la consulta.", response.status >= 500 ? 502 : response.status, code);
    }
    const payload = await response.json();
    if (!Array.isArray(payload)) throw new AppError("La respuesta de Tiendanube no tiene el formato esperado.", 502, "TIENDANUBE_RESPONSE_INVALID");
    return { payload, current };
  }
  async function list(kind, options = {}) {
    const currentPage = page(options.page);
    const query = kind === "products" ? { page: currentPage, per_page: PAGE_SIZE, language: options.language || undefined, q: text(options.query), category_id: text(options.categoryId, 40), published: options.published === true ? "true" : options.published === false ? "false" : undefined } : { page: currentPage, per_page: PAGE_SIZE, language: options.language || undefined };
    const key = `${kind}:${JSON.stringify(query)}`;
    const cached = snapshots.getFresh(key);
    if (cached) return { ...cached.value, snapshot: { fetchedAt: cached.fetchedAt, expiresAt: cached.expiresAt, cached: true } };
    const { payload, current } = await request(kind, query);
    const mapper = kind === "products" ? mapTiendanubeProduct : mapTiendanubeCategory;
    const result = { source: "tiendanube", storeId: current.storeId, page: currentPage, perPage: PAGE_SIZE, items: payload.map(item => mapper(item, { locale: current.locale })).filter(Boolean), hasMore: payload.length === PAGE_SIZE };
    const saved = snapshots.save(key, result);
    return { ...result, snapshot: { fetchedAt: saved.fetchedAt, expiresAt: saved.expiresAt, cached: false } };
  }
  return { listProducts: options => list("products", options), listCategories: options => list("categories", options) };
}
