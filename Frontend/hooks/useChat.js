import { useCallback, useMemo } from "react";
import { useChat as useChatContext } from "../context/ChatContext";

export function useChat() {
  const chat = useChatContext();

  const canStartConversation = useMemo(
    () => Boolean(chat.identity),
    [chat.identity]
  );

  const isConversationClosed = useMemo(
    () => chat.activeConversation?.status === "closed",
    [chat.activeConversation]
  );

  const adminTyping = useMemo(
    () =>
      chat.typing &&
      chat.typing.conversationId === chat.activeConversationId &&
      chat.typing.senderType === "admin",
    [chat.typing, chat.activeConversationId]
  );

  const sendMessage = useCallback(
    (content, image) => chat.sendCustomerMessage(content, image),
    [chat]
  );

  return {
    ...chat,
    canStartConversation,
    isConversationClosed,
    adminTyping,
    sendMessage,
  };
}

export default useChat;
