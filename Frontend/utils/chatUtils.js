export const EMOJIS = [
  "😀", "😂", "😊", "😍", "🥰", "😎", "🤔", "😅", "🙂", "😉",
  "👍", "👎", "👋", "🙏", "💪", "👏", "🤝", "❤️", "🔥", "🎉",
  "✅", "❌", "⚠️", "🛒", "📦", "🚚", "💳", "💰", "⭐", "🙌",
];

export function initials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0] || "";
  const second = parts.length > 1 ? parts[parts.length - 1][0] || "" : "";
  return (first + second).toUpperCase();
}

export function formatTime(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function formatDateTime(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function timeAgo(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return formatDateTime(iso);
}

export function isSupportOnline() {
  const hour = new Date().getHours();
  return hour >= 9 && hour < 21;
}

export function customerDisplayName(email) {
  const raw = (email || "").trim();
  if (!raw) return "Customer";
  const firstPart = raw.split("@")[0];
  if (!firstPart) return "Customer";
  return firstPart
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function isEmailValid(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email).trim());
}

export function mergeServerConversations(local, serverList) {
  const localById = new Map(local.map((c) => [c.id, c]));
  const result = [];
  for (const server of serverList) {
    const loc = localById.get(server.id);
    if (!loc) {
      result.push(server);
      continue;
    }
    const localMessages = new Map(loc.messages.map((m) => [m.id, m]));
    const serverIds = new Set(server.messages.map((m) => m.id));
    const mergedMessages = server.messages.map((m) => localMessages.get(m.id) || m);
    const extraLocal = loc.messages.filter((m) => !serverIds.has(m.id));
    result.push({
      ...server,
      messages: [...mergedMessages, ...extraLocal],
    });
  }
  return result;
}

export function changedConversations(prevSnapshot, current) {
  return current.filter((conversation) => {
    const previous = prevSnapshot.get(conversation.id);
    return previous === undefined || previous !== JSON.stringify(conversation);
  });
}

export function clampImage(file) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error("No file selected."));
    if (!file.type || !file.type.startsWith("image/")) {
      return reject(new Error("Please choose an image file."));
    }
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const MAX = 800;
        let { width, height } = image;
        if (width > MAX || height > MAX) {
          const ratio = Math.min(MAX / width, MAX / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL("image/png"));
      };
      image.onerror = () => reject(new Error("Could not load the selected image."));
      image.src = reader.result;
    };
    reader.onerror = () => reject(new Error("Could not read the selected file."));
    reader.readAsDataURL(file);
  });
}