const firstLocalized = (value, locale) => {
  if (typeof value === "string") return value.trim() || null;
  if (!value || typeof value !== "object") return null;
  return [locale, "es", "pt", "en"].map(key => value[key]).find(item => typeof item === "string" && item.trim())?.trim() || null;
};

const publicUrl = value => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch { return null; }
};

export function mapTiendanubeProduct(product, { locale = "es" } = {}) {
  if (!product || typeof product !== "object" || product.id === undefined || product.id === null) return null;
  const images = Array.isArray(product.images) ? product.images.map(image => publicUrl(image?.src || image?.url)).filter(Boolean).slice(0, 10) : [];
  const variants = Array.isArray(product.variants) ? product.variants.map(variant => ({ id: String(variant.id), price: typeof variant.price === "string" ? variant.price : null, promotionalPrice: typeof variant.promotional_price === "string" ? variant.promotional_price : null, stock: Number.isFinite(Number(variant.stock)) ? Number(variant.stock) : null })).filter(variant => variant.id !== "undefined") : [];
  return {
    id: String(product.id), name: firstLocalized(product.name, locale), description: firstLocalized(product.description, locale), handle: firstLocalized(product.handle, locale), published: product.published === true,
    productUrl: publicUrl(product.canonical_url || product.url), images, variants,
    sourceUpdatedAt: typeof product.updated_at === "string" ? product.updated_at : null
  };
}

export function mapTiendanubeCategory(category, { locale = "es" } = {}) {
  if (!category || typeof category !== "object" || category.id === undefined || category.id === null) return null;
  return { id: String(category.id), name: firstLocalized(category.name, locale), handle: firstLocalized(category.handle, locale), parentId: category.parent === null || category.parent === undefined ? null : String(category.parent), sourceUpdatedAt: typeof category.updated_at === "string" ? category.updated_at : null };
}
