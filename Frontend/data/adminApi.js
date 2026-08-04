const API_BASE = "/api";

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };
}

async function handle(res) {
  if (!res.ok) {
    let message = "Request failed";
    try {
      const data = await res.json();
      message = data.error || data.detail || message;
    } catch {
      // keep default message
    }
    throw new Error(message);
  }
  return res.status === 204 ? null : res.json();
}

export async function adminFetchProducts() {
  const res = await fetch(`${API_BASE}/admin/products`, {
    headers: authHeaders(),
  });
  return handle(res);
}

export async function adminCreateProduct(product) {
  const res = await fetch(`${API_BASE}/admin/products`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(product),
  });
  return handle(res);
}

export async function adminUpdateProduct(id, updates) {
  const res = await fetch(`${API_BASE}/admin/products/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(updates),
  });
  return handle(res);
}

export async function adminDeleteProduct(id) {
  const res = await fetch(`${API_BASE}/admin/products/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handle(res);
}

export async function adminFetchOrders() {
  const res = await fetch(`${API_BASE}/admin/orders`, {
    headers: authHeaders(),
  });
  return handle(res);
}

export async function adminUpdateOrderStatus(id, status) {
  const res = await fetch(`${API_BASE}/admin/orders/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });
  return handle(res);
}

export async function adminFetchStats() {
  const res = await fetch(`${API_BASE}/admin/stats`, {
    headers: authHeaders(),
  });
  return handle(res);
}
