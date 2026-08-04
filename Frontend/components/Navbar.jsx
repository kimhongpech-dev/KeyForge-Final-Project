import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const { cartItems } = useCart();
  const { theme, toggleTheme } = useTheme();
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
          <svg
            className="navbar-logo"
            viewBox="0 0 64 64"
            width="28"
            height="28"
            aria-hidden="true"
          >
            <rect x="1.5" y="1.5" width="61" height="61" rx="13" fill="currentColor" />
            <circle cx="23" cy="25" r="10.5" fill="none" stroke="#3D94FF" strokeWidth="5.5" />
            <circle cx="23" cy="22.5" r="2.4" fill="currentColor" />
            <line x1="32" y1="34" x2="46" y2="48" stroke="#3D94FF" strokeWidth="5.5" strokeLinecap="round" />
            <line x1="39.7" y1="41.7" x2="42.9" y2="38.5" stroke="#3D94FF" strokeWidth="4.5" strokeLinecap="round" />
            <line x1="41.8" y1="43.8" x2="45" y2="40.6" stroke="#3D94FF" strokeWidth="4.5" strokeLinecap="round" />
            <line x1="43.9" y1="45.9" x2="47.1" y2="42.7" stroke="#3D94FF" strokeWidth="4.5" strokeLinecap="round" />
          </svg>
          KeyForge
        </Link>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
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
