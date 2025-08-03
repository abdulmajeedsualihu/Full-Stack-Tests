// src/pages/FarmerDashboard.js
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table } from 'react-bootstrap';
import api from '../services/api';

const FarmerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsRes = await api.get('/farmer/products/');
        const ordersRes = await api.get('/farmer/orders/');
        setProducts(productsRes.data);
        setOrders(ordersRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="dashboard">
      <h2 className="mb-4">Your Farm Dashboard</h2>
      
      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title>Your Products</Card.Title>
              <Card.Text>
                Total: {products.length}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title>Pending Orders</Card.Title>
              <Card.Text>
                {orders.filter(o => o.status === 'PENDING').length}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <h4>Recent Orders</h4>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.slice(0, 5).map(order => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{new Date(order.created_at).toLocaleDateString()}</td>
              <td>{order.status}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default FarmerDashboard;