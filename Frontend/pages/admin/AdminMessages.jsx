import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiInbox } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import AdminNav from "../../components/admin/AdminNav";
import ConversationList from "../../components/admin/ConversationList";
import ConversationHeader from "../../components/admin/ConversationHeader";
import ConversationMessages from "../../components/admin/ConversationMessages";
import AdminReplyInput from "../../components/admin/AdminReplyInput";
import QuickReplies from "../../components/admin/QuickReplies";
import {
  generateId,
  loadQuickReplies,
  saveQuickReplies,
} from "../../services/chatStorageService";

const FILTERS = ["all", "new", "open", "waiting", "resolved", "closed"];

const SORTS = [
  { key: "newest", label: "Newest" },
  { key: "oldest", label: "Oldest" },
  { key: "unread", label: "Unread" },
];

export default function AdminMessages() {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const {
    adminConversations,
    adminOpenConversation,
    adminSendReply,
    adminSetStatus,
    adminDeleteConversation,
    setAdminTyping,
  } = useChat();

  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [replies, setReplies] = useState(() => loadQuickReplies());
  const [deleteTarget, setDeleteTarget] = useState(null);

  const checkAccess = useCallback(() => {
    if (loading) return;
    if (!user) {
      navigate("/auth");
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    checkAccess();
  }, [checkAccess]);

  const selected = useMemo(
    () => adminConversations.find((c) => c.id === selectedId) || null,
    [adminConversations, selectedId]
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    let list = adminConversations.filter((c) => {
      const inStatus = filter === "all" || c.status === filter;
      if (!inStatus) return false;
      if (!query) return true;
      const inName =
        c.customerName.toLowerCase().includes(query) ||
        c.customerEmail.toLowerCase().includes(query);
      const inMessage = c.messages.some((m) =>
        String(m.content || "").toLowerCase().includes(query)
      );
      return inName || inMessage;
    });

    if (sortBy === "oldest") {
      list = [...list].sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt));
    } else if (sortBy === "unread") {
      list = [...list].sort((a, b) => {
        const diff = (b.unreadForAdmin || 0) - (a.unreadForAdmin || 0);
        if (diff !== 0) return diff;
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      });
    }
    return list;
  }, [adminConversations, filter, search, sortBy]);

  function handleSelect(id) {
    setSelectedId(id);
    setReplyDraft("");
    adminOpenConversation(id);
  }

  function handleSendReply(content) {
    if (!selected) return;
    adminSendReply(selected.id, content);
    setReplyDraft("");
  }

  function insertQuickReply(text) {
    setReplyDraft((current) => {
      const next = current.trim() ? `${current} ${text}` : text;
      return next;
    });
  }

  function addQuickReply(text) {
    const next = [...replies, { id: generateId(), text }];
    setReplies(next);
    saveQuickReplies(next);
  }

  function editQuickReply(id, text) {
    const next = replies.map((r) => (r.id === id ? { ...r, text } : r));
    setReplies(next);
    saveQuickReplies(next);
  }

  function deleteQuickReply(id) {
    const next = replies.filter((r) => r.id !== id);
    setReplies(next);
    saveQuickReplies(next);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    adminDeleteConversation(deleteTarget.id);
    if (selectedId === deleteTarget.id) setSelectedId(null);
    setDeleteTarget(null);
  }

  if (loading || !user) {
    return (
      <div className="page">
        <div className="container">
          <p style={{ color: "var(--text-muted)" }}>Loading…</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="page">
        <div className="container">
          <h1 className="page-title">Admin Messages</h1>
          <p style={{ color: "var(--danger)" }}>
            You need an admin account to access messages.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div className="admin-header">
          <h1 className="page-title">Customer Support</h1>
        </div>
        <AdminNav />

        <div className="admin-chat-layout">
          <div className={`admin-chat-list ${selected ? "admin-chat-list-hidden-mobile" : ""}`}>
            <div className="admin-chat-tools">
              <div className="admin-chat-search">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  type="search"
                  placeholder="Search customers or messages…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Search conversations"
                />
              </div>
              <div className="admin-chat-tool-row">
                <select
                  className="admin-chat-filter"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  aria-label="Filter conversations"
                >
                  {FILTERS.map((f) => (
                    <option key={f} value={f}>
                      {f === "all" ? "All" : f}
                    </option>
                  ))}
                </select>
                <select
                  className="admin-chat-sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  aria-label="Sort conversations"
                >
                  {SORTS.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <ConversationList
              conversations={filtered}
              selectedId={selectedId}
              onSelect={handleSelect}
            />
          </div>

          {selected ? (
            <div className="admin-chat-detail">
              <ConversationHeader
                conversation={selected}
                onBack={() => setSelectedId(null)}
                onStatusChange={(status) => adminSetStatus(selected.id, status)}
                onResolve={() => adminSetStatus(selected.id, "resolved")}
                onReopen={() => adminSetStatus(selected.id, "open")}
                onClose={() => adminSetStatus(selected.id, "closed")}
                onDelete={() => setDeleteTarget(selected)}
              />
              <ConversationMessages conversation={selected} />
              <QuickReplies
                replies={replies}
                onInsert={insertQuickReply}
                onAdd={addQuickReply}
                onEdit={editQuickReply}
                onDelete={deleteQuickReply}
              />
              <AdminReplyInput
                value={replyDraft}
                onChange={setReplyDraft}
                onSend={handleSendReply}
                onTyping={(isTyping) => setAdminTyping(selected.id, isTyping)}
              />
            </div>
          ) : (
            <div className="admin-chat-detail">
              <div className="admin-chat-empty-detail">
                <FiInbox />
                <h3>No conversation selected</h3>
                <p>Choose a conversation from the list to view messages and reply.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {deleteTarget && (
        <div className="chat-modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="chat-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete conversation?</h3>
            <p>
              This will permanently delete the conversation with{" "}
              <strong>{deleteTarget.customerName}</strong> and all of its messages.
              This action cannot be undone.
            </p>
            <div className="chat-modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button type="button" className="btn btn-danger" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}