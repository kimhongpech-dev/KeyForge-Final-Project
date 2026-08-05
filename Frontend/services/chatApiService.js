import { API_BASE, authHeaders } from "./http";

const BASE = `${API_BASE}/support`;

export async function upsertConversationOnServer(conversation) {
  const res = await fetch(`${BASE}/conversations/upsert`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(conversation),
  });
  if (!res.ok) throw new Error("Failed to sync conversation");
  return res.json();
}

export async function fetchMyConversationsFromServer(customerId) {
  const res = await fetch(
    `${BASE}/conversations/mine?customerId=${encodeURIComponent(customerId)}`
  );
  if (!res.ok) throw new Error("Failed to fetch conversations");
  const data = await res.json();
  return Array.isArray(data.conversations) ? data.conversations : [];
}

export async function fetchAllConversationsFromServer() {
  const res = await fetch(`${BASE}/conversations`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch conversations");
  const data = await res.json();
  return Array.isArray(data.conversations) ? data.conversations : [];
}

export async function markConversationReadOnServer(conversationId, who) {
  const res = await fetch(
    `${BASE}/conversations/${encodeURIComponent(conversationId)}/mark-read?who=${who}`,
    { method: "POST" }
  );
  if (!res.ok) throw new Error("Failed to mark conversation read");
  return res.json();
}

export async function deleteConversationOnServer(conversationId) {
  await fetch(`${BASE}/conversations/${encodeURIComponent(conversationId)}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
}