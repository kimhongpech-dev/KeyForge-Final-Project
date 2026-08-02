import { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";
import CategoryFilter from "../components/CategoryFilter";
import {
  fetchProducts,
  searchProducts,
  fetchCategories,
  fetchProductsByCategory,
} from "../data/products";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(console.error);
    fetchProducts()
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      searchProducts(searchQuery).then(setProducts).catch(console.error);
    } else if (selectedCategory) {
      fetchProductsByCategory(selectedCategory)
        .then(setProducts)
        .catch(console.error);
    } else {
      fetchProducts().then(setProducts).catch(console.error);
    }
  }, [searchQuery, selectedCategory]);

  return (
    <div className="page">
      <div className="home-hero">
        <h1 className="home-title">Type in Style</h1>
        <p className="home-subtitle">
          Premium mechanical keyboards built for performance and aesthetics
        </p>
      </div>
      <div className="container">
        <div className="collection-header">
          <h2 className="page-title">Collection</h2>
          <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        </div>
        <CategoryFilter
          categories={categories}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
        {loading ? (
          <div className="no-results">
            <p>Loading products...</p>
          </div>
        ) : products.length > 0 ? (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard product={product} key={product.id} />
            ))}
          </div>
        ) : (
          <div className="no-results">
            <p>No products found for "{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
