import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  adminCreateProduct,
  adminDeleteProduct,
  adminFetchOrders,
  adminFetchProducts,
  adminFetchStats,
  adminUpdateOrderStatus,
  adminUpdateProduct,
} from "../services/adminApi";
import { clearCache } from "../services/products";
import { shortId } from "../utils/id";
import { ORDER_STATUSES } from "../constants";
import AdminNav from "../components/admin/AdminNav";
import {
  CategoryDonut,
  RevenueChart,
  StatusBars,
  TopProductsBars,
} from "../components/AdminCharts";

const emptyForm = {
  name: "",
  price: "",
  image: "",
  description: "",
  category: "",
  stock: "",
};

export default function AdminDashboard() {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [chartStats, setChartStats] = useState({ revenue: [], ordersByStatus: [], topProducts: [], categorySplit: [] });
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!isAdmin) {
      setError("You need an admin account to access the dashboard.");
      setLoadingData(false);
      return;
    }
    loadAll();
  }, [loading, user, isAdmin, navigate]);

  async function loadAll() {
    setLoadingData(true);
    setError("");
    try {
      const [productData, orderData, statsData] = await Promise.all([
        adminFetchProducts(),
        adminFetchOrders(),
        adminFetchStats(),
      ]);
      setProducts(productData);
      setOrders(orderData);
      setChartStats(statsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingData(false);
    }
  }

  function refreshStore() {
    clearCache();
  }

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category).filter(Boolean))].sort(),
    [products]
  );

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((p) => {
      const inCategory = !category || p.category === category;
      const matches =
        !query ||
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        String(p.id).includes(query);
      return inCategory && matches;
    });
  }, [products, search, category]);

  const stats = useMemo(() => {
    const totalUnits = products.reduce((sum, p) => sum + p.stock, 0);
    const stockValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
    return {
      totalProducts: products.length,
      totalUnits,
      stockValue,
      outOfStock: products.filter((p) => p.stock === 0).length,
      lowStock: products.filter((p) => p.stock > 0 && p.stock <= 5).length,
    };
  }, [products]);

  async function updateStock(id, stock) {
    try {
      await adminUpdateProduct(id, { stock });
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, stock } : p)));
      refreshStore();
    } catch (err) {
      setError(err.message);
    }
  }

  async function changeStatus(orderId, status) {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
    try {
      await adminUpdateOrderStatus(orderId, status);
    } catch (err) {
      setError(err.message);
      loadAll();
    }
  }

  async function saveProduct(e) {
    e.preventDefault();
    setFormError("");
    const payload = {
      name: form.name,
      price: Number(form.price),
      image: form.image,
      description: form.description,
      category: form.category,
      stock: Number(form.stock),
    };
    if (!payload.name || isNaN(payload.price) || isNaN(payload.stock)) {
      setFormError("Name, price and stock are required.");
      return;
    }
    try {
      if (editing) {
        await adminUpdateProduct(editing.id, payload);
      } else {
        await adminCreateProduct(payload);
      }
      setEditing(null);
      setForm(emptyForm);
      refreshStore();
      await loadAll();
    } catch (err) {
      setFormError(err.message);
    }
  }

  async function removeProduct(product) {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    try {
      await adminDeleteProduct(product.id);
      refreshStore();
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  function startEdit(product) {
    setEditing(product);
    setFormError("");
    setForm({
      name: product.name,
      price: String(product.price),
      image: product.image,
      description: product.description,
      category: product.category,
      stock: String(product.stock),
    });
  }

  function closeModal() {
    setEditing(null);
    setForm(emptyForm);
    setFormError("");
  }

  if (loading || loadingData) {
    return (
      <div className="page">
        <div className="container" style={{ textAlign: "center", paddingTop: "4rem" }}>
          <p style={{ color: "var(--text-muted)" }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className="page">
        <div className="container" style={{ textAlign: "center", paddingTop: "4rem" }}>
          <h1 className="page-title">Admin Dashboard</h1>
          <p style={{ color: "var(--danger)" }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div className="admin-header">
          <h1 className="page-title">Admin Dashboard</h1>
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditing(null);
              setForm(emptyForm);
              setFormError("");
              document.getElementById("admin-form").scrollIntoView({ behavior: "smooth" });
            }}
          >
            + Add Product
          </button>
        </div>
        <AdminNav />
        {error && <p className="admin-error">{error}</p>}

        <div className="admin-stats">
          <div className="admin-stat">
            <span className="admin-stat-value">{stats.totalProducts}</span>
            <span className="admin-stat-label">Products</span>
          </div>
          <div className="admin-stat">
            <span className="admin-stat-value">{stats.totalUnits}</span>
            <span className="admin-stat-label">Units in stock</span>
          </div>
          <div className="admin-stat">
            <span className="admin-stat-value">${stats.stockValue.toFixed(2)}</span>
            <span className="admin-stat-label">Stock value</span>
          </div>
          <div className={`admin-stat ${stats.outOfStock > 0 ? "admin-stat-out" : ""}`}>
            <span className="admin-stat-value">{stats.outOfStock}</span>
            <span className="admin-stat-label">Out of stock</span>
          </div>
          <div className={`admin-stat ${stats.lowStock > 0 ? "admin-stat-low" : ""}`}>
            <span className="admin-stat-value">{stats.lowStock}</span>
            <span className="admin-stat-label">Low stock (≤5)</span>
          </div>
        </div>

        <h2 className="admin-section-title">Analytics</h2>
        <div className="admin-charts">
          <div className="chart-card chart-card-wide">
            <p className="chart-card-title">Revenue — last 14 days</p>
            <RevenueChart data={chartStats.revenue} />
          </div>
          <div className="chart-card">
            <p className="chart-card-title">Orders by status</p>
            <StatusBars data={chartStats.ordersByStatus} />
          </div>
          <div className="chart-card">
            <p className="chart-card-title">Products by category</p>
            <CategoryDonut data={chartStats.categorySplit} />
          </div>
          <div className="chart-card chart-card-wide">
            <p className="chart-card-title">Top products</p>
            <TopProductsBars data={chartStats.topProducts} />
          </div>
        </div>

        <h2 className="admin-section-title">Products</h2>
        <div className="admin-toolbar">
          <input
            className="admin-search"
            type="search"
            placeholder="Search by name, description or id…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="admin-filter"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>ID</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <img src={product.image} alt={product.name} className="admin-thumb" />
                  </td>
                  <td>{product.id}</td>
                  <td className="admin-name">{product.name}</td>
                  <td>{product.category || "—"}</td>
                  <td>${product.price}</td>
                  <td>
                    <div className="admin-stock">
                      <button
                        className="btn btn-small btn-secondary"
                        onClick={() => updateStock(product.id, product.stock - 1)}
                        disabled={product.stock <= 0}
                      >
                        −
                      </button>
                      <span
                        className={`admin-stock-value ${
                          product.stock === 0 ? "out" : product.stock <= 5 ? "low" : ""
                        }`}
                      >
                        {product.stock}
                      </span>
                      <button
                        className="btn btn-small btn-secondary"
                        onClick={() => updateStock(product.id, product.stock + 1)}
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td>
                    <div className="admin-actions">
                      <button className="btn btn-small btn-secondary" onClick={() => startEdit(product)}>
                        Edit
                      </button>
                      <button className="btn btn-small btn-danger" onClick={() => removeProduct(product)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="7" className="admin-empty">
                    No products match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <h2 className="admin-section-title">Orders</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="admin-order-id">#{shortId(order.id)}</td>
                  <td>{order.userEmail || "—"}</td>
                  <td>
                    {order.items.length} item{order.items.length === 1 ? "" : "s"}
                  </td>
                  <td>${Number(order.total).toFixed(2)}</td>
                  <td className="admin-order-date">
                    {new Date(order.createdAt).toLocaleString()}
                  </td>
                  <td>
                    <select
                      className={`admin-status-select status-${order.status}`}
                      value={order.status}
                      onChange={(e) => changeStatus(order.id, e.target.value)}
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="6" className="admin-empty">
                    No orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <form id="admin-form" className="admin-form" onSubmit={saveProduct}>
          <h2 className="admin-form-title">
            {editing ? `Edit: ${editing.name}` : "Add Product"}
          </h2>
          {formError && <p className="admin-error">{formError}</p>}
          <div className="admin-form-grid">
            <label>
              Name
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Product name"
              />
            </label>
            <label>
              Price
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="0.00"
              />
            </label>
            <label>
              Stock
              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                placeholder="0"
              />
            </label>
            <label>
              Category
              <input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="e.g. Mouse"
              />
            </label>
            <label className="admin-form-full">
              Image URL
              <input
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="Path or URL to product image"
              />
            </label>
            <label className="admin-form-full">
              Description
              <textarea
                rows="3"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Product description"
              />
            </label>
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="btn btn-primary">
              {editing ? "Save Changes" : "Add Product"}
            </button>
            {editing && (
              <button type="button" className="btn btn-secondary" onClick={closeModal}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
