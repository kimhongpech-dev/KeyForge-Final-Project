const CONVERSATIONS_KEY = "supportConversations";
const QUICK_REPLIES_KEY = "supportQuickReplies";
const GUEST_PROFILE_KEY = "supportGuestProfile";
const TYPING_KEY = "supportTyping";

export const CHAT_UPDATED_EVENT = "keyforge-chat-updated";
export const CHAT_TYPING_EVENT = "keyforge-chat-typing";

export const DEFAULT_QUICK_REPLIES = [
  "Yes, this product is currently available.",
  "Sorry, this product is currently out of stock.",
  "Your order is being processed.",
  "Your order has been shipped.",
  "Delivery usually takes 1–3 business days.",
  "Thank you for contacting our support team.",
];

export const SUPPORT_STATUSES = ["new", "open", "waiting", "resolved", "closed"];

export function generateId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function safeParse(raw, fallback) {
  if (raw == null) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function storageAvailable() {
  try {
    const probe = "__keyforge_probe__";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

const hasStorage = storageAvailable();

export function notifyChatChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CHAT_UPDATED_EVENT));
}

export function loadConversations() {
  if (!hasStorage) return [];
  const list = safeParse(localStorage.getItem(CONVERSATIONS_KEY), []);
  return Array.isArray(list) ? list : [];
}

export function saveConversations(conversations) {
  if (!hasStorage) return;
  localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
  notifyChatChanged();
}

export function loadQuickReplies() {
  if (!hasStorage) return DEFAULT_QUICK_REPLIES.map((text) => ({ id: generateId(), text }));
  const list = safeParse(localStorage.getItem(QUICK_REPLIES_KEY), null);
  if (!Array.isArray(list) || list.length === 0) {
    const seeded = DEFAULT_QUICK_REPLIES.map((text) => ({ id: generateId(), text }));
    saveQuickReplies(seeded);
    return seeded;
  }
  return list.filter((item) => item && typeof item.text === "string");
}

export function saveQuickReplies(replies) {
  if (!hasStorage) return;
  localStorage.setItem(QUICK_REPLIES_KEY, JSON.stringify(replies));
  notifyChatChanged();
}

export function loadGuestProfile() {
  if (!hasStorage) return null;
  return safeParse(localStorage.getItem(GUEST_PROFILE_KEY), null);
}

export function saveGuestProfile(profile) {
  if (!hasStorage) return;
  localStorage.setItem(GUEST_PROFILE_KEY, JSON.stringify(profile));
}

export function clearGuestProfile() {
  if (!hasStorage) return;
  localStorage.removeItem(GUEST_PROFILE_KEY);
}

export function setTypingState(conversationId, senderType, isTyping) {
  if (!hasStorage) return;
  if (isTyping) {
    localStorage.setItem(
      TYPING_KEY,
      JSON.stringify({ conversationId, senderType, at: Date.now() })
    );
  } else {
    const current = safeParse(localStorage.getItem(TYPING_KEY), null);
    if (current && current.conversationId === conversationId && current.senderType === senderType) {
      localStorage.removeItem(TYPING_KEY);
    }
  }
  window.dispatchEvent(new CustomEvent(CHAT_TYPING_EVENT));
}

export function getTypingState() {
  if (!hasStorage) return null;
  const state = safeParse(localStorage.getItem(TYPING_KEY), null);
  if (!state || typeof state.at !== "number") return null;
  if (Date.now() - state.at > 5000) return null;
  return state;
}

export function createMessage(senderType, content, image) {
  return {
    id: generateId(),
    senderId: senderType === "admin" ? "admin" : "customer",
    senderType,
    content,
    createdAt: new Date().toISOString(),
    status: "sent",
    ...(image ? { image } : {}),
  };
}

export function createConversationData(identity, message) {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    customerId: identity.customerId,
    customerName: identity.customerName,
    customerEmail: identity.customerEmail,
    customerPhone: identity.customerPhone || "",
    status: "new",
    createdAt: now,
    updatedAt: now,
    unreadForAdmin: 1,
    unreadForCustomer: 0,
    messages: [message],
  };
}
