import { useMemo } from "react";
import ChatMessage from "../chat/ChatMessage";
import { useChat } from "../../context/ChatContext";

function dayLabel(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ConversationMessages({ conversation }) {
  const { typing } = useChat();

  const groups = useMemo(() => {
    const result = [];
    for (const message of conversation.messages || []) {
      const label = dayLabel(message.createdAt);
      const last = result[result.length - 1];
      if (last && last.label === label) {
        last.items.push(message);
      } else {
        result.push({ label, items: [message] });
      }
    }
    return result;
  }, [conversation.messages]);

  const isTyping =
    typing && typing.conversationId === conversation.id && typing.senderType === "customer";

  return (
    <div className="admin-conv-messages">
      {groups.length === 0 && (
        <div className="admin-chat-empty-list">No messages in this conversation yet.</div>
      )}
      {groups.map((group) => (
        <div key={group.label}>
          <div className="admin-conv-day">{group.label}</div>
          {group.items.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              mine={message.senderType === "admin"}
            />
          ))}
        </div>
      ))}
      {isTyping && (
        <div className="chat-msg theirs">
          <div className="chat-msg-bubble chat-typing-bubble" aria-label="Customer is typing">
            <span className="chat-typing-dot" />
            <span className="chat-typing-dot" />
            <span className="chat-typing-dot" />
          </div>
        </div>
      )}
    </div>
  );
}