import { useRef, useState } from "react";
import { FiSend, FiSmile, FiPaperclip } from "react-icons/fi";
import { EMOJIS, clampImage } from "../../utils/chatUtils";

export default function ChatInput({ onSend, onTyping, disabled = false }) {
  const [text, setText] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [attachError, setAttachError] = useState("");
  const fileRef = useRef(null);
  const textRef = useRef(null);

  const trimmed = text.trim();

  function handleSubmit(e) {
    e.preventDefault();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
    setEmojiOpen(false);
    setAttachError("");
    onTyping?.(false);
  }

  function handleChange(value) {
    setText(value);
    setAttachError("");
    if (value.trim()) {
      onTyping?.(true);
    } else {
      onTyping?.(false);
    }
  }

  function insertEmoji(emoji) {
    const el = textRef.current;
    const start = el?.selectionStart ?? text.length;
    const end = el?.selectionEnd ?? text.length;
    const next = text.slice(0, start) + emoji + text.slice(end);
    setText(next);
    requestAnimationFrame(() => {
      if (el) {
        el.focus();
        const pos = start + emoji.length;
        el.setSelectionRange(pos, pos);
      }
    });
  }

  async function handleFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const dataUrl = await clampImage(file);
      onSend(null, dataUrl);
    } catch (err) {
      setAttachError(err.message);
    }
  }

  return (
    <div className="chat-input-area">
      {attachError && <p className="chat-attach-error">{attachError}</p>}
      <div className="chat-input-row">
        <button
          type="button"
          className={`chat-tool-btn ${emojiOpen ? "active" : ""}`}
          onClick={() => setEmojiOpen((open) => !open)}
          title="Add emoji"
          aria-label="Add emoji"
        >
          <FiSmile />
        </button>
        <button
          type="button"
          className="chat-tool-btn"
          onClick={() => fileRef.current?.click()}
          title="Attach image"
          aria-label="Attach image"
        >
          <FiPaperclip />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleFile}
        />
        <form className="chat-send-form" onSubmit={handleSubmit}>
          <textarea
            ref={textRef}
            className="chat-textarea"
            rows="1"
            placeholder={disabled ? "Conversation closed" : "Type a message…"}
            value={text}
            disabled={disabled}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            onBlur={() => {
              onTyping?.(false);
            }}
          />
          <button
            type="submit"
            className="chat-send-btn"
            disabled={!trimmed || disabled}
            title="Send message"
            aria-label="Send message"
          >
            <FiSend />
          </button>
        </form>
      </div>
      {emojiOpen && (
        <div className="chat-emoji-picker">
          {EMOJIS.map((emoji) => (
            <button
              type="button"
              key={emoji}
              className="chat-emoji"
              onClick={() => insertEmoji(emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
