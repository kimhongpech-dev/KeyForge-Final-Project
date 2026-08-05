import { FaCommentDots, FaTimes } from "react-icons/fa";
import useChat from "../../hooks/useChat";
import ChatNotificationBadge from "./ChatNotificationBadge";

export default function FloatingChatButton() {
  const { isOpen, isMinimized, toggleChat, customerUnread } = useChat();

  const showClose = isOpen && !isMinimized;

  return (
    <button
      type="button"
      className="chat-fab"
      onClick={toggleChat}
      aria-label={showClose ? "Close support chat" : "Open support chat"}
      title="Customer Support"
    >
      {showClose ? <FaTimes /> : <FaCommentDots />}
      {!showClose && <ChatNotificationBadge count={customerUnread} />}
    </button>
  );
}
