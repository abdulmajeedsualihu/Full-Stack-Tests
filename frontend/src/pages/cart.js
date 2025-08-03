// Cart.js
function Cart() {
  const [cart, setCart] = useState([]);
  
  const checkout = async () => {
    try {
      await axios.post('/api/orders/', { items: cart }, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access')}` }
      });
      setCart([]);
      alert('Order placed successfully!');
    } catch (error) {
      console.error('Checkout error:', error);
    }
  };

  return (
    <div>
      <h2>Your Cart</h2>
      {cart.map(item => (
        <CartItem key={item.id} item={item} />
      ))}
      <button onClick={checkout}>Checkout</button>
    </div>
  );
}