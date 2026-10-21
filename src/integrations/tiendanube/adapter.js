import { createTiendanubeCatalogService } from "./catalog.service.js";

export function createTiendanubeAdapter(options) {
  const catalog = createTiendanubeCatalogService(options);
  return Object.freeze({ listProducts: catalog.listProducts, listCategories: catalog.listCategories });
}

// Importing this module never reads credentials or contacts Tiendanube.
export const tiendanubeAdapter = Object.freeze({
  listProducts: options => createTiendanubeAdapter().listProducts(options),
  listCategories: options => createTiendanubeAdapter().listCategories(options)
});
