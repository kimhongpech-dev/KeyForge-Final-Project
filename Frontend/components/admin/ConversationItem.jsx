import ConversationStatus from "./ConversationStatus";
import { initials, timeAgo } from "../../utils/chatUtils";
import { useChat } from "../../context/ChatContext";

function lastMessagePreview(conversation) {
  const last = conversation.messages[conversation.messages.length - 1];
  if (!last) return "No messages yet";
  if (last.image) return "📷 " + (last.content ? last.content : "Image");
  return last.content || "…";
}

export default function ConversationItem({ conversation, isActive, onClick }) {
  const { typing } = useChat();
  const isTyping =
    typing && typing.conversationId === conversation.id && typing.senderType === "customer";

  return (
    <button
      type="button"
      className={`admin-conversation-item ${isActive ? "active" : ""}`}
      onClick={onClick}
      aria-current={isActive ? "true" : undefined}
    >
      <span className="admin-avatar">{initials(conversation.customerName)}</span>
      <span className="admin-conversation-main">
        <span className="admin-conversation-top">
          <span className="admin-conversation-name">{conversation.customerName}</span>
          <span className="admin-conversation-time">
            {timeAgo(conversation.updatedAt)}
          </span>
        </span>
        <span className="admin-conversation-preview">
          {isTyping ? "typing…" : lastMessagePreview(conversation)}
        </span>
        <span className="admin-conversation-bottom">
          <ConversationStatus status={conversation.status} />
          {(conversation.unreadForAdmin || 0) > 0 && (
            <span className="admin-unread-pill">{conversation.unreadForAdmin}</span>
          )}
        </span>
      </span>
    </button>
  );
}