import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "./AuthContext";
import {
  CHAT_TYPING_EVENT,
  CHAT_UPDATED_EVENT,
  clearGuestProfile,
  createConversationData,
  createMessage,
  getTypingState,
  loadConversations,
  loadGuestProfile,
  saveConversations,
  saveGuestProfile,
  setTypingState,
} from "../services/chatStorageService";
import { customerDisplayName } from "../utils/chatUtils";

const ChatContext = createContext(null);

export default function ChatProvider({ children }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState(() => loadConversations());
  const [ready] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [typing, setTyping] = useState(() => getTypingState());
  const [guestProfile, setGuestProfile] = useState(() => loadGuestProfile());

  const lastSerialized = useRef("");
  const firstLoadRef = useRef(true);

  useEffect(() => {
    function refreshFromStorage() {
      const list = loadConversations();
      const serialized = JSON.stringify(list);
      if (serialized !== lastSerialized.current) {
        lastSerialized.current = serialized;
        setConversations(list);
      }
      setTyping(getTypingState());
    }
    function refreshTyping() {
      setTyping(getTypingState());
    }
    function handleStorageEvent(event) {
      if (
        event.key === "supportConversations" ||
        event.key === "supportTyping" ||
        event.key === "supportQuickReplies"
      ) {
        refreshFromStorage();
      }
    }
    window.addEventListener("storage", handleStorageEvent);
    window.addEventListener(CHAT_UPDATED_EVENT, refreshFromStorage);
    window.addEventListener(CHAT_TYPING_EVENT, refreshTyping);
    return () => {
      window.removeEventListener("storage", handleStorageEvent);
      window.removeEventListener(CHAT_UPDATED_EVENT, refreshFromStorage);
      window.removeEventListener(CHAT_TYPING_EVENT, refreshTyping);
    };
  }, []);

  useEffect(() => {
    if (!firstLoadRef.current) return;
    firstLoadRef.current = false;
    lastSerialized.current = JSON.stringify(conversations);
  }, [conversations]);

  const identity = useMemo(() => {
    if (user) {
      return {
        customerId: `user:${user.email}`,
        customerName: customerDisplayName(user.email),
        customerEmail: user.email,
        customerPhone: "",
      };
    }
    if (guestProfile) {
      return {
        customerId: guestProfile.customerId,
        customerName: guestProfile.name,
        customerEmail: guestProfile.email,
        customerPhone: guestProfile.phone || "",
      };
    }
    return null;
  }, [user, guestProfile]);

  const myConversations = useMemo(() => {
    if (!identity) return [];
    return conversations
      .filter((c) => c.customerId === identity.customerId)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }, [conversations, identity]);

  const adminConversations = useMemo(
    () =>
      [...conversations].sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      ),
    [conversations]
  );

  const customerUnread = useMemo(
    () => myConversations.reduce((sum, c) => sum + (c.unreadForCustomer || 0), 0),
    [myConversations]
  );

  const adminUnread = useMemo(
    () => conversations.reduce((sum, c) => sum + (c.unreadForAdmin || 0), 0),
    [conversations]
  );

  const activeConversation = useMemo(
    () =>
      myConversations.find((c) => c.id === activeConversationId) || null,
    [myConversations, activeConversationId]
  );

  const persist = useCallback((updater) => {
    setConversations((prev) => {
      const next = updater(prev);
      lastSerialized.current = JSON.stringify(next);
      saveConversations(next);
      return next;
    });
  }, []);

  const updateConversation = useCallback(
    (id, updater) => {
      persist((prev) =>
        prev.map((c) => (c.id === id ? updater(c) : c))
      );
    },
    [persist]
  );

  function markMessagesRead(conversation, senderType) {
    return {
      ...conversation,
      messages: conversation.messages.map((m) =>
        m.senderType === senderType && m.status !== "read"
          ? { ...m, status: "read" }
          : m
      ),
    };
  }

  const ensureConversationForGuest = useCallback(
    (profile) => {
      setGuestProfile(profile);
      saveGuestProfile(profile);
    },
    []
  );

  const createConversation = useCallback(
    (message) => {
      const conversation = createConversationData(identity, message);
      persist((prev) => [conversation, ...prev]);
      setActiveConversationId(conversation.id);
      return conversation;
    },
    [identity, persist]
  );

  const sendCustomerMessage = useCallback(
    (content, image) => {
      if (!identity) return null;
      const message = createMessage("customer", content, image);
      message.status = "delivered";
      if (activeConversation) {
        if (activeConversation.status === "closed") return null;
        updateConversation(activeConversation.id, (c) => ({
          ...c,
          status: "new",
          updatedAt: message.createdAt,
          unreadForAdmin: (c.unreadForAdmin || 0) + 1,
          messages: [...c.messages, message],
        }));
        return activeConversation;
      }
      return createConversation(message);
    },
    [identity, activeConversation, updateConversation, createConversation]
  );

  const reopenConversation = useCallback(
    (id) => {
      updateConversation(id, (c) => ({
        ...c,
        status: "open",
        updatedAt: new Date().toISOString(),
      }));
    },
    [updateConversation]
  );

  const openChat = useCallback(() => {
    setIsMinimized(false);
    setIsOpen(true);
    if (activeConversation) {
      updateConversation(activeConversation.id, (c) => {
        const withRead = markMessagesRead(c, "admin");
        return {
          ...withRead,
          unreadForCustomer: 0,
          updatedAt: withRead.updatedAt,
        };
      });
    }
  }, [activeConversation, updateConversation]);

  const closeChat = useCallback(() => {
    setIsOpen(false);
    setTypingState(activeConversation?.id, "customer", false);
  }, [activeConversation]);

  const minimizeChat = useCallback(() => {
    setIsMinimized(true);
    setTypingState(activeConversation?.id, "customer", false);
  }, [activeConversation]);

  const toggleChat = useCallback(() => {
    if (isOpen && !isMinimized) {
      setIsMinimized(true);
    } else if (isOpen && isMinimized) {
      setIsMinimized(false);
    } else {
      setIsOpen(true);
    }
    if (activeConversation) {
      updateConversation(activeConversation.id, (c) => {
        const withRead = markMessagesRead(c, "admin");
        return { ...withRead, unreadForCustomer: 0 };
      });
    }
  }, [isOpen, isMinimized, activeConversation, updateConversation]);

  const selectConversation = useCallback(
    (id) => {
      setActiveConversationId(id);
      const target = myConversations.find((c) => c.id === id);
      if (target) {
        updateConversation(id, (c) => {
          const next = markMessagesRead(c, "admin");
          return { ...next, unreadForCustomer: 0 };
        });
      }
    },
    [myConversations, updateConversation]
  );

  const setCustomerTyping = useCallback(
    (isTyping) => {
      setTypingState(activeConversation?.id, "customer", isTyping);
    },
    [activeConversation]
  );

  /* ---------- Admin actions ---------- */

  const adminOpenConversation = useCallback(
    (id) => {
      updateConversation(id, (c) => {
        const withRead = markMessagesRead(c, "customer");
        return {
          ...withRead,
          status: c.status === "new" || c.status === "closed" ? "open" : c.status,
          unreadForAdmin: 0,
        };
      });
    },
    [updateConversation]
  );

  const adminSendReply = useCallback(
    (id, content, image) => {
      const message = createMessage("admin", content, image);
      message.status = "delivered";
      updateConversation(id, (c) => ({
        ...c,
        status: "waiting",
        updatedAt: message.createdAt,
        unreadForCustomer: (c.unreadForCustomer || 0) + 1,
        messages: [...c.messages, message],
      }));
      return message;
    },
    [updateConversation]
  );

  const adminSetStatus = useCallback(
    (id, status) => {
      updateConversation(id, (c) => ({
        ...c,
        status,
        updatedAt: new Date().toISOString(),
        unreadForAdmin: 0,
      }));
    },
    [updateConversation]
  );

  const adminDeleteConversation = useCallback(
    (id) => {
      persist((prev) => prev.filter((c) => c.id !== id));
    },
    [persist]
  );

  const setAdminTyping = useCallback(
    (id, isTyping) => {
      setTypingState(id, "admin", isTyping);
    },
    []
  );

  const clearGuestIdentity = useCallback(() => {
    clearGuestProfile();
    setGuestProfile(null);
  }, []);

  const value = {
    ready,
    conversations,
    identity,
    guestProfile,
    myConversations,
    adminConversations,
    activeConversation,
    activeConversationId,
    isOpen,
    isMinimized,
    typing,
    customerUnread,
    adminUnread,
    ensureConversationForGuest,
    createConversation,
    sendCustomerMessage,
    reopenConversation,
    openChat,
    closeChat,
    minimizeChat,
    toggleChat,
    selectConversation,
    setCustomerTyping,
    clearGuestIdentity,
    adminOpenConversation,
    adminSendReply,
    adminSetStatus,
    adminDeleteConversation,
    setAdminTyping,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat must be used within ChatProvider");
  return context;
}