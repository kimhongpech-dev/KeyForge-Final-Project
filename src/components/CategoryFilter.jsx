export default function CategoryFilter({ categories, selected, onSelect }) {
  return (
    <div className="category-filter">
      <button
        className={`category-btn ${!selected ? "active" : ""}`}
        onClick={() => onSelect("")}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          className={`category-btn ${selected === cat ? "active" : ""}`}
          onClick={() => onSelect(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
