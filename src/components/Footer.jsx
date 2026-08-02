import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3 className="footer-brand">KeyForge</h3>
          <p className="footer-desc">Premium mechanical keyboards for every typist.</p>
        </div>
        <div className="footer-section">
          <h4 className="footer-heading">Links</h4>
          <Link to="/" className="footer-link">Home</Link>
          <Link to="/about" className="footer-link">About</Link>
          <Link to="/contact" className="footer-link">Contact</Link>
          <Link to="/checkout" className="footer-link">Cart</Link>
        </div>
        <div className="footer-section">
          <h4 className="footer-heading">Support</h4>
          <Link to="/contact" className="footer-link">Contact Us</Link>
          <span className="footer-link">FAQ</span>
          <span className="footer-link">Shipping</span>
          <span className="footer-link">Returns</span>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} KeyForge. All rights reserved.</p>
      </div>
    </footer>
  );
}
