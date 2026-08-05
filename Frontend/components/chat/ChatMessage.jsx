import { MdDone, MdDoneAll } from "react-icons/md";
import { formatTime } from "../../utils/chatUtils";

const STATUS_ICONS = {
  sent: <MdDone className="chat-msg-status-icon" aria-label="Sent" />,
  delivered: <MdDoneAll className="chat-msg-status-icon" aria-label="Delivered" />,
  read: <MdDoneAll className="chat-msg-status-icon read" aria-label="Read" />,
};

export default function ChatMessage({ message, mine }) {
  const statusIcon = mine ? STATUS_ICONS[message.status] || STATUS_ICONS.sent : null;

  return (
    <div className={`chat-msg ${mine ? "mine" : "theirs"}`}>
      <div className="chat-msg-bubble">
        {message.image && (
          <img
            src={message.image}
            alt="Attached image"
            className="chat-msg-image"
            loading="lazy"
          />
        )}
        {message.content && <span className="chat-msg-text">{message.content}</span>}
        <span className="chat-msg-meta">
          {formatTime(message.createdAt)}
          {statusIcon}
        </span>
      </div>
    </div>
  );
}