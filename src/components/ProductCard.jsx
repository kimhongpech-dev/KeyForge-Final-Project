import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function ProductCard({ product }) {
  const { addToCart, cartItems } = useCart();
  const productInCart = cartItems.find((item) => item.product.id === product.id);

  const outOfStock = product.stock === 0;
  const atMaxStock = productInCart && productInCart.quantity >= product.stock;
  const cantAdd = outOfStock || atMaxStock;

  const productQuantityLabel = productInCart
    ? `(${productInCart.quantity})`
    : "";
  return (
    <div className="product-card">
      <img
        src={product.image}
        alt={product.name}
        className="product-card-image"
      />
      <div className="product-card-content">
        <h3 className="product-card-name">{product.name}</h3>
        <p className="product-card-price">${product.price}</p>
        <p className={`product-card-stock ${outOfStock ? "out" : ""}`}>
          {outOfStock ? "Out of stock" : `${product.stock} in stock`}
        </p>
        <div className="product-card-actions">
          <Link className="btn btn-secondary" to={`/products/${product.id}`}>
            Details
          </Link>
          <button
            className="btn btn-primary"
            onClick={() => addToCart(product)}
            disabled={cantAdd}
          >
            {outOfStock ? "Out of Stock" : `Add to Cart ${productQuantityLabel}`}
          </button>
        </div>
      </div>
    </div>
  );
}
