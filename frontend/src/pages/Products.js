import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Container, 
  Spinner, 
  Button,
  Form,
  Modal  // Added Modal import
} from 'react-bootstrap';
import api from '../services/api';
import { useCart } from '../contexts/CartContext';
import { toast } from 'react-toastify';
import { formatPrice } from '../utils/Format';  // Make sure this utility exists

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({});
  const [addingProductId, setAddingProductId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Add the missing state declarations
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const { addToCart } = useCart();

  // Calculate filtered products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products/');
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleQuantityChange = (productId, availableQuantity) => (e) => {
    const value = Math.min(
      Math.max(parseInt(e.target.value || 1, 10), 1),
      availableQuantity
    );
    setQuantities(prev => ({ ...prev, [productId]: value }));
  };

  const handleAddToCart = (product) => {
    const quantity = quantities[product.id] || 1;
    setAddingProductId(product.id);
    addToCart({ ...product, quantity });
    toast.success(`${quantity} ${product.name}(s) added to cart!`);
    setTimeout(() => setAddingProductId(null), 500);
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Fresh Farm Products</h2>
      
      {/* Search and Filter Section */}
      <div className="mb-4">
        <Form.Group className="mb-3">
          <Form.Control
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Form.Group>
        <Form.Select 
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="vegetables">Vegetables</option>
          <option value="fruits">Fruits</option>
          <option value="dairy">Dairy</option>
          <option value="grains">Grains</option>
        </Form.Select>
      </div>

      <Row>
        {filteredProducts.map(product => (
          <Col key={product.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
            <Card style={{ height: '100%', minHeight: '400px' }}>
              <Card.Img 
                variant="top" 
                src={product.image || 'https://via.placeholder.com/300'} 
                style={{ height: '200px', objectFit: 'cover' }}
                onClick={() => setSelectedProduct(product)}
                className="cursor-pointer"
              />
              <Card.Body>
                <Card.Title>{product.name}</Card.Title>
                <Card.Text className="mb-3">
                  <strong>Price:</strong> {formatPrice(product.price)}<br />
                  <strong>In Stock:</strong> {product.quantity}
                </Card.Text>
                
                <Form.Group controlId={`quantity-${product.id}`} className="mb-3">
                  <Form.Label>Quantity</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    max={product.quantity}
                    value={quantities[product.id] || 1}
                    onChange={handleQuantityChange(product.id, product.quantity)}
                  />
                </Form.Group>

                <Button 
                  variant="primary" 
                  onClick={() => handleAddToCart(product)}
                  disabled={addingProductId === product.id || product.quantity <= 0}
                  className="me-2"
                >
                  {addingProductId === product.id ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Adding...
                    </>
                  ) : (
                    product.quantity <= 0 ? 'Out of Stock' : 'Add to Cart'
                  )}
                </Button>

                <Button 
                  variant="outline-secondary" 
                  onClick={() => setSelectedProduct(product)}
                >
                  View Details
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <Modal show={true} onHide={() => setSelectedProduct(null)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>{selectedProduct.name}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <img 
                  src={selectedProduct.image || 'https://via.placeholder.com/400'} 
                  alt={selectedProduct.name}
                  className="img-fluid"
                />
              </Col>
              <Col md={6}>
                <p>{selectedProduct.description}</p>
                <p><strong>Price:</strong> {formatPrice(selectedProduct.price)}</p>
                <p><strong>In Stock:</strong> {selectedProduct.quantity}</p>
                {/* Add quantity selector and add to cart button here if needed */}
              </Col>
            </Row>
          </Modal.Body>
        </Modal>
      )}
    </Container>
  );
};

export default Products;