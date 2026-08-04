import { apiFetch, authHeaders } from "./http";

export function adminFetchProducts() {
  return apiFetch("/admin/products", { headers: authHeaders() });
}

export function adminCreateProduct(product) {
  return apiFetch("/admin/products", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(product),
  });
}

export function adminUpdateProduct(id, updates) {
  return apiFetch(`/admin/products/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(updates),
  });
}

export function adminDeleteProduct(id) {
  return apiFetch(`/admin/products/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
}

export function adminFetchOrders() {
  return apiFetch("/admin/orders", { headers: authHeaders() });
}

export function adminUpdateOrderStatus(id, status) {
  return apiFetch(`/admin/orders/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });
}

export function adminFetchStats() {
  return apiFetch("/admin/stats", { headers: authHeaders() });
}
