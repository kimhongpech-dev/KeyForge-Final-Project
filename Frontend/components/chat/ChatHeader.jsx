import { FaHeadset } from "react-icons/fa";
import { FiMinus, FiX, FiPlus } from "react-icons/fi";
import { isSupportOnline } from "../../utils/chatUtils";

export default function ChatHeader({ onMinimize, onClose, onNewChat, showNewChat }) {
  const online = isSupportOnline();

  return (
    <div className="chat-header">
      <div className="chat-header-avatar">
        <FaHeadset />
      </div>
      <div className="chat-header-info">
        <span className="chat-header-title">Customer Support</span>
        <span className={`chat-header-status ${online ? "online" : "offline"}`}>
          <span className="chat-status-dot" />
          {online ? "Online" : "Offline"}
        </span>
      </div>
      <div className="chat-header-actions">
        {showNewChat && (
          <button
            type="button"
            className="chat-header-btn"
            onClick={onNewChat}
            title="Start a new conversation"
            aria-label="Start a new conversation"
          >
            <FiPlus />
          </button>
        )}
        <button
          type="button"
          className="chat-header-btn"
          onClick={onMinimize}
          title="Minimize"
          aria-label="Minimize chat"
        >
          <FiMinus />
        </button>
        <button
          type="button"
          className="chat-header-btn"
          onClick={onClose}
          title="Close"
          aria-label="Close chat"
        >
          <FiX />
        </button>
      </div>
    </div>
  );
}
