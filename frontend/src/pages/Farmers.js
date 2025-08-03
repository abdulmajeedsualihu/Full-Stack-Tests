import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Container, Spinner, Button, Tab, Tabs } from 'react-bootstrap';
import api from '../services/api';
import { useCart } from '../contexts/CartContext';
import { toast } from 'react-toastify';

const Farmers = () => {
  const [farmers, setFarmers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('farmers');
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [farmersRes, productsRes] = await Promise.all([
          api.get('/farmers/'),
          api.get('/products/')
        ]);
        setFarmers(farmersRes.data);
        setProducts(productsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getFarmerProducts = (farmerId) => {
    return products.filter(product => product.farmer === farmerId);
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
      <h2 className="mb-4">Our Farmers</h2>
      
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab eventKey="farmers" title="Farmers List">
          <Row className="mt-3">
            {farmers.map(farmer => (
              <Col key={farmer.id} md={6} className="mb-4">
                <Card>
                  <Card.Body>
                    <Card.Title>{farmer.farm_name}</Card.Title>
                    <Card.Text>
                      <strong>Location:</strong> {farmer.location}<br />
                      <strong>Products:</strong> {getFarmerProducts(farmer.id).length}
                    </Card.Text>
                    <Button 
                      variant="outline-primary"
                      onClick={() => setActiveTab(`farmer-${farmer.id}`)}
                    >
                      View Products
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Tab>
        
        {farmers.map(farmer => (
          <Tab 
            key={`farmer-${farmer.id}`} 
            eventKey={`farmer-${farmer.id}`} 
            title={farmer.farm_name}
          >
            <div className="mt-3">
              <h3>{farmer.farm_name}'s Products</h3>
              <p className="text-muted">{farmer.location}</p>
              
              <Row>
                {getFarmerProducts(farmer.id).map(product => (
                  <Col key={product.id} md={4} className="mb-4">
                    <Card>
                      <Card.Img 
                        variant="top" 
                        src={product.image || 'https://via.placeholder.com/300'} 
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                      <Card.Body>
                        <Card.Title>{product.name}</Card.Title>
                        <Card.Text>
                          <strong>Price:</strong> ${product.price}<br />
                          <strong>In Stock:</strong> {product.quantity}
                        </Card.Text>
                        <Button 
                          variant="primary"
                          onClick={() => addToCart(product)}
                        >
                          Add to Cart
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          </Tab>
        ))}
      </Tabs>
    </Container>
  );
};

export default Farmers;