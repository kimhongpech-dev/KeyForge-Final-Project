import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiFetch, authHeaders } from "../services/http";
import { shortId } from "../utils/id";
import { ORDER_STATUS_STEPS } from "../constants";

function OrderProgress({ status }) {
  const currentIndex = ORDER_STATUS_STEPS.findIndex((s) => s.key === status);

  return (
    <div className="order-progress">
      {ORDER_STATUS_STEPS.map((step, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <div
            key={step.key}
            className={`order-step ${done ? "done" : ""} ${active ? "active" : ""}`}
          >
            <span className="order-step-dot">{done ? "✓" : ""}</span>
            <span className="order-step-label">{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function MyOrders() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/auth");
      return;
    }
    apiFetch("/orders", { headers: authHeaders() })
      .then(setOrders)
      .catch((err) => setError(err.message));
  }, [loading, user, navigate]);

  async function cancelOrder(order) {
    if (!window.confirm(`Cancel order #${shortId(order.id)}?`)) return;
    setActionError("");
    setActionMessage("");
    try {
      await apiFetch(`/orders/${order.id}/cancel`, {
        method: "POST",
        headers: authHeaders(),
      });
      setOrders((prev) => prev.filter((o) => o.id !== order.id));
      setActionMessage(`Order #${shortId(order.id)} was cancelled.`);
    } catch (err) {
      setActionError(err.message);
    }
  }

  if (loading || orders === null) {
    return (
      <div className="page">
        <div className="container" style={{ textAlign: "center", paddingTop: "4rem" }}>
          <p style={{ color: "var(--text-muted)" }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="container" style={{ textAlign: "center", paddingTop: "4rem" }}>
          <h1 className="page-title">My Orders</h1>
          <p style={{ color: "var(--danger)" }}>{error}</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="page">
        <div className="container">
          <h1 className="page-title">My Orders</h1>
          <div className="my-orders-empty">
            <h2>No orders yet</h2>
            <p>When you place an order, you&rsquo;ll be able to track it here.</p>
            <Link to="/" className="btn btn-primary">
              Browse products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title">My Orders</h1>
        {actionError && <p className="admin-error">{actionError}</p>}
        {actionMessage && <p className="order-action-success">{actionMessage}</p>}
        {orders.map((order) => (
          <div className="order-card" key={order.id}>
            <div className="order-card-header">
              <div>
                <p className="order-card-number">Order #{shortId(order.id)}</p>
                <p className="order-card-date">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              <span className={`order-badge status-${order.status}`}>
                {order.status}
              </span>
            </div>

            {order.status === "cancelled" ? (
              <p className="order-cancelled">
                This order was cancelled. If you paid, contact support for a refund.
              </p>
            ) : (
              <OrderProgress status={order.status} />
            )}

            <div className="order-card-items">
              {order.items.map((item, index) => (
                <div
                  className="order-card-item"
                  key={`${item.productId}-${index}`}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="order-card-item-image"
                  />
                  <div className="order-card-item-details">
                    <p className="order-card-item-name">{item.name}</p>
                    <p className="order-card-item-qty">
                      {item.quantity} × ${Number(item.price).toFixed(2)}
                    </p>
                  </div>
                  <p className="order-card-item-total">
                    ${(item.quantity * item.price).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="order-card-footer">
              <span>
                {order.items.length} item{order.items.length === 1 ? "" : "s"}
              </span>
              <div className="order-card-footer-right">
                <strong>Total: ${Number(order.total).toFixed(2)}</strong>
                {(order.status === "pending" || order.status === "confirmed") && (
                  <button
                    className="btn btn-small btn-danger"
                    onClick={() => cancelOrder(order)}
                  >
                    Cancel order
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
