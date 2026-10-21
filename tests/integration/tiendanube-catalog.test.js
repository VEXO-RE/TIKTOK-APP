import test from "node:test";
import assert from "node:assert/strict";
import { createTiendanubeCatalogService } from "../../src/integrations/tiendanube/catalog.service.js";
import { summarizeVideoProbe } from "../../src/media/inspect.service.js";

const env = {
  TIENDANUBE_ENABLED: "true",
  TIENDANUBE_STORE_ID: "123",
  TIENDANUBE_ACCESS_TOKEN: "synthetic-token",
  TIENDANUBE_USER_AGENT: "TikTok test (test@example.com)"
};

test("Tiendanube catalog maps only provider data and caches a fresh readonly snapshot", async () => {
  const calls = [];
  const catalog = createTiendanubeCatalogService({ env, fetchFn: async (url, options) => {
    calls.push({ url: String(url), options });
    return new Response(JSON.stringify([{ id: 9, name: { es: "Silla real" }, description: { es: "<p>Descripción real</p>" }, handle: { es: "silla-real" }, published: true, canonical_url: "https://shop.example/silla-real", images: [{ src: "https://cdn.example/silla.jpg" }], variants: [{ id: 11, price: "3500.00", promotional_price: null, stock: 4 }] }]), { status: 200, headers: { "content-type": "application/json" } });
  } });
  const first = await catalog.listProducts({ query: "silla", published: true });
  const second = await catalog.listProducts({ query: "silla", published: true });
  assert.equal(calls.length, 1);
  assert.match(calls[0].url, /\/2025-03\/123\/products\?/);
  assert.equal(calls[0].options.headers.Authorization, "Bearer synthetic-token");
  assert.equal(first.items[0].name, "Silla real");
  assert.equal(first.items[0].description, "<p>Descripción real</p>");
  assert.equal(first.items[0].productUrl, "https://shop.example/silla-real");
  assert.equal(first.snapshot.cached, false);
  assert.equal(second.snapshot.cached, true);
});

test("Tiendanube fails closed when readonly credentials are not configured", async () => {
  const catalog = createTiendanubeCatalogService({ env: {} });
  await assert.rejects(() => catalog.listCategories(), error => error.code === "TIENDANUBE_NOT_CONFIGURED");
});

test("Tiendanube catalog forwards bounded pagination and category filters as readonly query parameters", async () => {
  let requested;
  const catalog = createTiendanubeCatalogService({ env, fetchFn: async url => {
    requested = new URL(url);
    return new Response(JSON.stringify([]), { status: 200, headers: { "content-type": "application/json" } });
  } });
  const result = await catalog.listProducts({ page: 2, categoryId: "7", published: true });
  assert.equal(requested.searchParams.get("page"), "2");
  assert.equal(requested.searchParams.get("category_id"), "7");
  assert.equal(requested.searchParams.get("published"), "true");
  assert.equal(result.hasMore, false);
});

test("video analyzer reports technical facts and does not claim semantic recognition", () => {
  const result = summarizeVideoProbe({ format: { duration: "12.5" }, streams: [
    { codec_type: "video", width: 1920, height: 1080, codec_name: "hevc", avg_frame_rate: "30000/1001" },
    { codec_type: "audio", codec_name: "aac" }
  ] });
  assert.equal(result.video.orientation, "horizontal");
  assert.equal(result.audio.present, true);
  assert.match(result.limitation, /no identifica productos/i);
  assert.ok(result.alerts.some(message => message.includes("no es vertical")));
});
