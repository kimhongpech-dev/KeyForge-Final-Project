export default function ChatNotificationBadge({ count = 0, className = "" }) {
  if (!count || count <= 0) return null;
  const display = count > 99 ? "99+" : String(count);
  return (
    <span className={`chat-badge ${className}`} aria-label={`${count} unread messages`}>
      {display}
    </span>
  );
}
