import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchProductById } from "../services/products";
import { useCart } from "../context/CartContext";

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();

  useEffect(() => {
    fetchProductById(id)
      .then((data) => {
        if (!data) {
          navigate("/");
          return;
        }
        setProduct(data);
      })
      .catch(() => navigate("/"))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="page">
        <div className="container" style={{ textAlign: "center", paddingTop: "4rem" }}>
          <p style={{ color: "var(--text-muted)" }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const productInCart = cartItems.find((item) => item.product.id === product.id);
  const productQuantityLabel = productInCart ? `(${productInCart.quantity})` : "";

  const outOfStock = product.stock === 0;
  const atMaxStock = productInCart && productInCart.quantity >= product.stock;
  const cantAdd = outOfStock || atMaxStock;

  return (
    <div className="page">
      <div className="container">
        <div className="product-detail">
          <div className="product-detail-image">
            <img src={product.image} alt={product.name} />
          </div>
          <div className="product-detail-content">
            <h1 className="product-detail-name">{product.name}</h1>
            <p className="product-detail-price">${product.price}</p>
            <p className={`product-card-stock ${outOfStock ? "out" : ""}`}>
              {outOfStock ? "Out of stock" : `${product.stock} in stock`}
            </p>
            <p className="product-detail-description">{product.description}</p>
            <button
              className="btn btn-primary btn-large"
              onClick={() => addToCart(product)}
              disabled={cantAdd}
            >
              {outOfStock ? "Out of Stock" : `Add to Cart ${productQuantityLabel}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
