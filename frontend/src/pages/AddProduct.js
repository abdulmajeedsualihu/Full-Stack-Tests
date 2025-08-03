// AddProduct.js
function AddProduct() {
  const [formData, setFormData] = useState({
    name: '', description: '', price: 0, category: 'VG',
    quantity: 1, harvestDate: '', expiryDate: '', image: null
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) data.append(key, value);
    });
    
    try {
      await axios.post('/api/products/', data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access')}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('Product added successfully!');
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields with proper validation */}
      <input type="file" onChange={(e) => setFormData({...formData, image: e.target.files[0]})} />
      <button type="submit">Add Product</button>
    </form>
  );
}