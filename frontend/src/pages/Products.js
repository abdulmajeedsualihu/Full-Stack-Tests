// src/pages/Products.js
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Container, Spinner } from 'react-bootstrap';
import api from '../services/api';
import { useCart } from '../contexts/CartContext';

// Inside your product component:
const { addToCart } = useCart();

<Button 
  variant="primary" 
  onClick={() => addToCart(product)}
>
  Add to Cart
</Button>

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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
      <Row>
        {products.map(product => (
          <Col key={product.id} md={4} className="mb-4">
            <Card style={{ height: '100%' }}>
              <Card.Img 
                variant="top" 
                src={product.image || 'https://via.placeholder.com/300'} 
                style={{ height: '200px', objectFit: 'cover' }}
              />
              <Card.Body>
                <Card.Title>{product.name}</Card.Title>
                <Card.Text>
                  <strong>Price:</strong> ${product.price}<br />
                  <strong>Category:</strong> {product.get_category_display()}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Products;