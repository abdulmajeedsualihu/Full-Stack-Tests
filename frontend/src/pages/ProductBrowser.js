// ProductBrowser.js
function ProductBrowser() {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
    search: '', category: '', minPrice: 0, maxPrice: 100
  });

  useEffect(() => {
    const fetchProducts = async () => {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      params.append('min_price', filters.minPrice);
      params.append('max_price', filters.maxPrice);
      
      const response = await axios.get(`/api/products/?${params.toString()}`);
      setProducts(response.data);
    };
    fetchProducts();
  }, [filters]);

  return (
    <div>
      <div className="filters">
        <input type="text" placeholder="Search..." 
               onChange={(e) => setFilters({...filters, search: e.target.value})} />
        <select onChange={(e) => setFilters({...filters, category: e.target.value})}>
          <option value="">All Categories</option>
          <option value="VG">Vegetables</option>
          <option value="FR">Fruits</option>
          {/* Other options */}
        </select>
        {/* Price range sliders */}
      </div>
      
      <div className="product-grid">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}