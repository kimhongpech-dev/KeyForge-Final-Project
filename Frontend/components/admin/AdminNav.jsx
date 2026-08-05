import { Link, useLocation } from "react-router-dom";
import { FiLayout, FiMail } from "react-icons/fi";
import { useChat } from "../../context/ChatContext";

export default function AdminNav() {
  const { pathname } = useLocation();
  const { adminUnread } = useChat();

  return (
    <nav className="admin-nav" aria-label="Admin sections">
      <Link
        to="/admin"
        className={`admin-nav-link ${pathname === "/admin" ? "active" : ""}`}
      >
        <FiLayout />
        Dashboard
      </Link>
      <Link
        to="/admin/messages"
        className={`admin-nav-link ${pathname.startsWith("/admin/messages") ? "active" : ""}`}
      >
        <FiMail />
        Messages
        {adminUnread > 0 && (
          <span className="admin-nav-badge">{adminUnread > 99 ? "99+" : adminUnread}</span>
        )}
      </Link>
    </nav>
  );
}