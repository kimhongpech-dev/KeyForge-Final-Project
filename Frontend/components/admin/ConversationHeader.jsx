import { FiChevronLeft, FiTrash2, FiMail, FiPhone } from "react-icons/fi";
import ConversationStatus from "./ConversationStatus";
import { SUPPORT_STATUSES } from "../../services/chatStorageService";
import { formatDateTime } from "../../utils/chatUtils";

export default function ConversationHeader({
  conversation,
  onBack,
  onStatusChange,
  onResolve,
  onReopen,
  onClose,
  onDelete,
}) {
  const canResolve = !["resolved", "closed"].includes(conversation.status);
  const canReopen = ["resolved", "closed", "new"].includes(conversation.status);

  return (
    <div className="admin-conversation-header">
      <button
        type="button"
        className="admin-conv-back"
        onClick={onBack}
        aria-label="Back to conversations"
      >
        <FiChevronLeft />
      </button>
      <span className="admin-avatar">{conversation.customerName.charAt(0).toUpperCase()}</span>
      <div className="admin-conv-info">
        <div className="admin-conv-name">{conversation.customerName}</div>
        <div className="admin-conv-meta">
          <FiMail /> {conversation.customerEmail}
          {conversation.customerPhone && (
            <>
              {" · "}
              <FiPhone /> {conversation.customerPhone}
            </>
          )}
          {" · started "}
          {formatDateTime(conversation.createdAt)}
        </div>
      </div>
      <div className="admin-conv-actions">
        <select
          className="admin-conv-status-select"
          value={conversation.status}
          onChange={(e) => onStatusChange(e.target.value)}
          aria-label="Conversation status"
        >
          {SUPPORT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        {canResolve && (
          <button type="button" className="admin-conv-btn resolved" onClick={onResolve}>
            Mark resolved
          </button>
        )}
        {canReopen && (
          <button type="button" className="admin-conv-btn" onClick={onReopen}>
            Reopen
          </button>
        )}
        {conversation.status !== "closed" && (
          <button type="button" className="admin-conv-btn" onClick={onClose}>
            Close
          </button>
        )}
        <button type="button" className="admin-conv-btn danger" onClick={onDelete}>
          <FiTrash2 />
          Delete
        </button>
        <span className="admin-conv-live-status">
          <ConversationStatus status={conversation.status} />
        </span>
      </div>
    </div>
  );
}