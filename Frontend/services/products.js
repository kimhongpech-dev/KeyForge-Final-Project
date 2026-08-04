import { apiFetch } from "./http";

let cachedProducts = null;
let cachedCategories = null;

export async function fetchProducts() {
  if (cachedProducts) return cachedProducts;
  cachedProducts = await apiFetch("/products");
  return cachedProducts;
}

export async function fetchProductById(id) {
  const found = cachedProducts?.find((p) => p.id === Number(id));
  if (found) return found;
  try {
    return await apiFetch(`/products/${id}`);
  } catch {
    return null;
  }
}

export async function searchProducts(query) {
  return apiFetch(`/products?search=${encodeURIComponent(query)}`);
}

export async function fetchCategories() {
  if (cachedCategories) return cachedCategories;
  cachedCategories = await apiFetch("/products/categories");
  return cachedCategories;
}

export async function fetchProductsByCategory(category) {
  return apiFetch(`/products?category=${encodeURIComponent(category)}`);
}

export function clearCache() {
  cachedProducts = null;
  cachedCategories = null;
}
