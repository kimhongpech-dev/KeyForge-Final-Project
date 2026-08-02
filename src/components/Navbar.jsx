import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const { cartItems } = useCart();
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  function closeMenu() {
    setMenuOpen(false);
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand-row">
        <Link to="/" className="navbar-brand" onClick={scrollToTop}>
          KeyForge
        </Link>
        <button className="navbar-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          <span className={`hamburger ${menuOpen ? "open" : ""}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      </div>
      <div className={`navbar-menu ${menuOpen ? "open" : ""}`}>
        <div className="navbar-container">
          <div className="navbar-links">
            <Link to="/" className="navbar-link" onClick={() => { closeMenu(); scrollToTop(); }}>
              Home
            </Link>
            <Link to="/about" className="navbar-link" onClick={closeMenu}>
              About
            </Link>
            <Link to="/contact" className="navbar-link" onClick={closeMenu}>
              Contact
            </Link>
            {user && (
              <Link to="/orders" className="navbar-link" onClick={closeMenu}>
                My Orders
              </Link>
            )}
            <Link to="/checkout" className="navbar-link" onClick={closeMenu}>
              Cart
              {cartCount > 0 && (
                <span className="cart-badge">{cartCount}</span>
              )}
            </Link>
            {isAdmin && (
              <Link to="/admin" className="navbar-link" onClick={closeMenu}>
                Admin
              </Link>
            )}
          </div>
          <div className="navbar-auth">
            {!user ? (
              <div className="navbar-auth-links">
                <Link to="/auth" className="btn btn-secondary btn-small" onClick={closeMenu}>
                  Login
                </Link>
                <Link to="/auth" className="btn btn-primary btn-small" onClick={closeMenu}>
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="navbar-user">
                <span className="navbar-greeting">{user.email}</span>
                <button className="btn btn-secondary btn-small" onClick={logout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
