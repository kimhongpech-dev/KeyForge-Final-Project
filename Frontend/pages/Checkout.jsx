import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { clearCache } from "../data/products";

function shortId(id) {
  return String(id).slice(-6).toUpperCase();
}

export default function Checkout() {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    getCartTotal,
    clearCart,
  } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [placedOrder, setPlacedOrder] = useState(null);

  const total = getCartTotal();

  async function placeOrder() {
    if (!user) {
      navigate("/auth");
      return;
    }

    const items = cartItems.map((item) => ({
      productId: item.product.id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      image: item.product.image,
    }));

    setPlacing(true);
    setOrderError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ items, total }),
      });

      if (!res.ok) {
        let message = "Failed to place order.";
        try {
          const data = await res.json();
          if (data.error) message = data.error;
        } catch {
          // keep default message
        }
        throw new Error(message);
      }

      const data = await res.json();
      setPlacedOrder(data);
      clearCart();
      clearCache();
    } catch (err) {
      setOrderError(err.message || "Failed to place order. Please try again.");
    } finally {
      setPlacing(false);
    }
  }

  if (placedOrder) {
    return (
      <div className="page">
        <div className="container">
          <div className="order-success">
            <div className="order-success-icon">
              <svg
                viewBox="0 0 24 24"
                width="34"
                height="34"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="order-success-title">Order confirmed!</h1>
            <p className="order-success-sub">
              Thanks for shopping with KeyForge. We&rsquo;ve received your order
              and are getting it ready.
            </p>

            <div className="order-success-meta">
              <span>
                Order <strong>#{shortId(placedOrder.id)}</strong>
              </span>
              <span>{new Date(placedOrder.createdAt).toLocaleString()}</span>
              <span className={`order-badge status-${placedOrder.status}`}>
                {placedOrder.status}
              </span>
            </div>

            <div className="order-success-summary">
              {placedOrder.items.map((item, index) => (
                <div className="order-success-item" key={`${item.productId}-${index}`}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="order-success-item-image"
                  />
                  <div className="order-success-item-details">
                    <p className="order-success-item-name">{item.name}</p>
                    <p className="order-success-item-qty">
                      {item.quantity} × ${Number(item.price).toFixed(2)}
                    </p>
                  </div>
                  <p className="order-success-item-total">
                    ${(item.quantity * item.price).toFixed(2)}
                  </p>
                </div>
              ))}
              <div className="order-success-total">
                <span>Total</span>
                <strong>${Number(placedOrder.total).toFixed(2)}</strong>
              </div>
            </div>

            <div className="order-success-actions">
              <button
                className="btn btn-secondary btn-large"
                onClick={() => {
                  setPlacedOrder(null);
                  navigate("/orders");
                }}
              >
                Track your order
              </button>
              <button
                className="btn btn-primary btn-large"
                onClick={() => {
                  setPlacedOrder(null);
                  navigate("/");
                }}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title">Checkout</h1>
        <div className="checkout-container">
          <div className="checkout-items">
            <h2 className="checkout-section-title">Order Summary</h2>
            {cartItems.length === 0 ? (
              <p style={{ color: "var(--text-muted)", padding: "1rem 0" }}>Your cart is empty</p>
            ) : (
              cartItems.map((item) => (
                <div className="checkout-item" key={item.product.id}>
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="checkout-item-image"
                  />
                  <div className="checkout-item-details">
                    <h3 className="checkout-item-name">{item.product.name}</h3>
                    <p className="checkout-item-price">
                      ${item.product.price} each
                    </p>
                  </div>
                  <div className="checkout-item-controls">
                    <div className="quantity-controls">
                      <button
                        className="quantity-btn"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      >
                        −
                      </button>
                      <span className="quantity-value">{item.quantity}</span>
                      <button
                        className="quantity-btn"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>

                    <p className="checkout-item-total">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </p>
                    <button
                      className="btn btn-secondary btn-small"
                      onClick={() => removeFromCart(item.product.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="checkout-summary">
            <h2 className="checkout-section-title">Total</h2>
            <div className="checkout-total">
              <p className="checkout-total-label">Subtotal:</p>
              <p className="checkout-total-value">${total.toFixed(2)}</p>
            </div>
            <div className="checkout-total">
              <p className="checkout-total-label">Total:</p>
              <p className="checkout-total-value checkout-total-final">
                ${total.toFixed(2)}
              </p>
            </div>
            {orderError && <p className="checkout-error">{orderError}</p>}
            <button
              className="btn btn-primary btn-large btn-block checkout-summary-btn"
              onClick={placeOrder}
              disabled={cartItems.length === 0 || placing}
            >
              {placing ? "Placing order…" : user ? "Place Order" : "Login to Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
