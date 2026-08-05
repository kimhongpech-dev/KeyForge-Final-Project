import { useEffect, useMemo, useRef } from "react";
import useChat from "../../hooks/useChat";
import ChatHeader from "./ChatHeader";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import QuickQuestions from "./QuickQuestions";
import GuestChatForm from "./GuestChatForm";

export default function ChatWindow() {
  const {
    identity,
    myConversations,
    activeConversation,
    activeConversationId,
    isMinimized,
    isOpen,
    adminTyping,
    ensureConversationForGuest,
    sendMessage,
    setCustomerTyping,
    selectConversation,
    closeChat,
    minimizeChat,
    setActiveConversationId,
    reopenConversation,
    isConversationClosed,
  } = useChat();

  const scrollRef = useRef(null);

  const conversationMessages = useMemo(
    () => activeConversation?.messages || [],
    [activeConversation]
  );
  const conversationCount = myConversations.length;
  const showQuickQuestions =
    !activeConversation || conversationMessages.length === 0;

  useEffect(() => {
    if (isOpen && identity && !activeConversationId && conversationCount > 0) {
      selectConversation(myConversations[0].id);
    }
  }, [isOpen, identity, activeConversationId, conversationCount, myConversations, selectConversation]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [conversationMessages, adminTyping, isOpen, isMinimized]);

  if (!isOpen || isMinimized) return null;

  function handleGuestSubmit(profile) {
    ensureConversationForGuest(profile);
  }

  function handleSend(content, image) {
    if (isConversationClosed) return;
    sendMessage(content, image);
  }

  function handleQuickSelect(question) {
    handleSend(question);
  }

  function startNewChat() {
    setActiveConversationId(null);
  }

  return (
    <div className="chat-window" role="dialog" aria-label="Customer support chat">
      <ChatHeader
        onMinimize={minimizeChat}
        onClose={closeChat}
        onNewChat={startNewChat}
        showNewChat={conversationCount > 0}
      />

      <div className="chat-body">
        {!identity ? (
          <GuestChatForm onSubmit={handleGuestSubmit} />
        ) : (
          <>
            {showQuickQuestions && <QuickQuestions onSelect={handleQuickSelect} />}
            <div className="chat-messages" ref={scrollRef}>
              {conversationMessages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  mine={message.senderType === "customer"}
                />
              ))}
              {conversationMessages.length === 0 && !showQuickQuestions && (
                <p className="chat-empty">
                  No messages yet. Ask us anything below.
                </p>
              )}
              {adminTyping && (
                <div className="chat-msg theirs">
                  <div className="chat-msg-bubble chat-typing-bubble" aria-label="Support is typing">
                    <span className="chat-typing-dot" />
                    <span className="chat-typing-dot" />
                    <span className="chat-typing-dot" />
                  </div>
                </div>
              )}
            </div>
            {isConversationClosed && (
              <div className="chat-closed-banner">
                <p>This conversation is closed.</p>
                <button
                  type="button"
                  className="chat-reopen-btn"
                  onClick={() => reopenConversation(activeConversation.id)}
                >
                  Reopen conversation
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {identity && (
        <ChatInput
          onSend={handleSend}
          onTyping={setCustomerTyping}
          disabled={isConversationClosed}
        />
      )}
    </div>
  );
}
