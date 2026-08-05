export default function ConversationStatus({ status = "new" }) {
  return <span className={`chat-status ${status}`}>{status}</span>;
}