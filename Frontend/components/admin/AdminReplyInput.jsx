import { FiSend } from "react-icons/fi";

export default function AdminReplyInput({
  value,
  onChange,
  onSend,
  onTyping,
  disabled = false,
}) {
  const trimmed = String(value || "").trim();

  function submit() {
    if (!trimmed || disabled) return;
    onSend(trimmed);
    onChange("");
    onTyping?.(false);
  }

  return (
    <div className="admin-reply-area">
      <div className="admin-reply-row">
        <textarea
          className="admin-reply-textarea"
          rows="1"
          placeholder={disabled ? "Select a conversation to reply" : "Type a reply…"}
          value={value}
          disabled={disabled}
          onChange={(e) => {
            onChange(e.target.value);
            if (e.target.value.trim()) onTyping?.(true);
            else onTyping?.(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          onBlur={() => onTyping?.(false)}
        />
        <button
          type="button"
          className="admin-reply-send"
          disabled={!trimmed || disabled}
          onClick={submit}
          title="Send reply"
          aria-label="Send reply"
        >
          <FiSend />
        </button>
      </div>
    </div>
  );
}