import ConversationItem from "./ConversationItem";

export default function ConversationList({ conversations, selectedId, onSelect }) {
  return (
    <div className="admin-chat-list-items">
      {conversations.length > 0 ? (
        conversations.map((conversation) => (
          <ConversationItem
            key={conversation.id}
            conversation={conversation}
            isActive={conversation.id === selectedId}
            onClick={() => onSelect(conversation.id)}
          />
        ))
      ) : (
        <div className="admin-chat-empty-list">
          No conversations match your filters.
        </div>
      )}
    </div>
  );
}