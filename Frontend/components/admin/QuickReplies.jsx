import { useState } from "react";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";

export default function QuickReplies({ replies, onInsert, onAdd, onEdit, onDelete }) {
  const [modal, setModal] = useState(null);
  const [draft, setDraft] = useState("");

  function openAdd() {
    setDraft("");
    setModal({ mode: "add" });
  }

  function openEdit(reply) {
    setDraft(reply.text);
    setModal({ mode: "edit", reply });
  }

  function save(e) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    if (modal.mode === "add") onAdd(text);
    else onEdit(modal.reply.id, text);
    setModal(null);
    setDraft("");
  }

  return (
    <div className="admin-quick-replies">
      <div className="admin-quick-replies-top">
        <span>Quick replies</span>
        <button type="button" className="admin-quick-add" onClick={openAdd}>
          <FiPlus /> Add custom
        </button>
      </div>
      <div className="admin-quick-list">
        {replies.map((reply) => (
          <span key={reply.id} className="admin-quick-chip" title={reply.text}>
            <span className="admin-quick-text" onClick={() => onInsert(reply.text)}>
              {reply.text}
            </span>
            <span className="admin-quick-edit-actions">
              <button
                type="button"
                onClick={() => openEdit(reply)}
                aria-label="Edit quick reply"
              >
                <FiEdit2 />
              </button>
              <button
                type="button"
                className="danger"
                onClick={() => onDelete(reply.id)}
                aria-label="Delete quick reply"
              >
                <FiTrash2 />
              </button>
            </span>
          </span>
        ))}
      </div>

      {modal && (
        <div className="chat-modal-overlay" onClick={() => setModal(null)}>
          <form
            className="chat-modal"
            onClick={(e) => e.stopPropagation()}
            onSubmit={save}
          >
            <h3>{modal.mode === "add" ? "Add quick reply" : "Edit quick reply"}</h3>
            <fieldset>
              <label htmlFor="quick-reply-text">Reply text</label>
              <textarea
                id="quick-reply-text"
                rows="3"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type a quick reply…"
                autoFocus
              />
            </fieldset>
            <div className="chat-modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setModal(null)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={!draft.trim()}>
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}