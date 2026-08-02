const API_BASE = "/api";
let cachedProducts = null;
let cachedCategories = null;

export async function fetchProducts() {
  if (cachedProducts) return cachedProducts;
  const res = await fetch(`${API_BASE}/products`);
  if (!res.ok) throw new Error("Failed to fetch products");
  cachedProducts = await res.json();
  return cachedProducts;
}

export async function fetchProductById(id) {
  const products = cachedProducts;
  if (products) {
    const found = products.find((p) => p.id === Number(id));
    if (found) return found;
  }
  const res = await fetch(`${API_BASE}/products/${id}`);
  if (!res.ok) return null;
  return res.json();
}

export async function searchProducts(query) {
  const res = await fetch(`${API_BASE}/products?search=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Failed to search products");
  return res.json();
}

export async function fetchCategories() {
  if (cachedCategories) return cachedCategories;
  const res = await fetch(`${API_BASE}/products/categories`);
  if (!res.ok) throw new Error("Failed to fetch categories");
  cachedCategories = await res.json();
  return cachedCategories;
}

export async function fetchProductsByCategory(category) {
  const res = await fetch(`${API_BASE}/products?category=${encodeURIComponent(category)}`);
  if (!res.ok) throw new Error("Failed to fetch products by category");
  return res.json();
}

export function clearCache() {
  cachedProducts = null;
  cachedCategories = null;
}
