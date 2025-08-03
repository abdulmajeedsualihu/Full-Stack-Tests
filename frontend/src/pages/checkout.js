// src/pages/Checkout.js
import React, { useState } from 'react';
import { Form, Button, Alert, Container } from 'react-bootstrap';
import { useCart } from '../contexts/CartContext';
import api from '../services/api';

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    paymentMethod: 'credit'
  });
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await api.post('/orders/', {
        items: cart,
        customer_info: formData,
        total: cartTotal
      });
      clearCart();
      setOrderSuccess(true);
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <Container className="mt-5 text-center">
        <Alert variant="success">
          <h4>Order Placed Successfully!</h4>
          <p>Thank you for your purchase.</p>
          <Button href="/">Continue Shopping</Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Checkout</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Full Name</Form.Label>
          <Form.Control
            required
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Shipping Address</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            required
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
          />
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label>Payment Method</Form.Label>
          <Form.Select
            value={formData.paymentMethod}
            onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
          >
            <option value="credit">Credit Card</option>
            <option value="paypal">PayPal</option>
            <option value="bank">Bank Transfer</option>
          </Form.Select>
        </Form.Group>

        <div className="border-top pt-3 mb-4">
          <h4>Order Total: ${cartTotal.toFixed(2)}</h4>
        </div>

        <Button 
          variant="primary" 
          type="submit" 
          disabled={loading || cart.length === 0}
          className="w-100 py-3"
        >
          {loading ? 'Processing...' : 'Place Order'}
        </Button>
      </Form>
    </Container>
  );
};

export default Checkout;