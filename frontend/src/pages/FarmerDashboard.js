// FarmerDashboard.js
function FarmerDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const productsRes = await axios.get('/api/farmer/products/', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access')}` }
      });
      const ordersRes = await axios.get('/api/farmer/orders/', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access')}` }
      });
      setProducts(productsRes.data);
      setOrders(ordersRes.data);
    };
    fetchData();
  }, []);

  return (
    <div className="dashboard">
      <div className="stats">
        <StatCard title="Total Products" value={products.length} />
        <StatCard title="Pending Orders" value={orders.filter(o => o.status === 'PENDING').length} />
      </div>
      
      <div className="recent-orders">
        <h3>Recent Orders</h3>
        <OrderList orders={orders.slice(0, 5)} />
      </div>
    </div>
  );
}