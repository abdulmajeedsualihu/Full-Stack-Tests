import React, { useState } from 'react';
import { Form, Button, Container, Card, Alert, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    user_type: 'customer', // 'customer' or 'farmer'
    farm_name: '',
    location: '',
    contact_number: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

    const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.password2) newErrors.password2 = 'Passwords do not match';
    
    if (formData.user_type === 'farmer') {
      if (!formData.farm_name.trim()) newErrors.farm_name = 'Farm name is required';
      if (!formData.location.trim()) newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    
    // Add this debug line:
    console.log('Validation errors:', newErrors);
    
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  console.log('Form submitted'); // Check if form submission fires
  
  if (!validateForm()) {
    console.log('Validation failed', errors); // Check validation errors
    return;
  }

  console.log('Form data to submit:', formData); // Verify form data
  
  setIsSubmitting(true);
  try {
    const payload = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      is_farmer: formData.user_type === 'farmer'
    };

    if (formData.user_type === 'farmer') {
      payload.farm_name = formData.farm_name;
      payload.location = formData.location;
      payload.contact_number = formData.contact_number;
    }

    console.log('Final payload:', payload); // Check the payload
    
    const response = await api.post('/register/', payload);
    console.log('API response:', response); // Check API response
    
    toast.success('Registration successful! Please login.');
    navigate('/login');
  } catch (error) {
    console.error('Registration error:', error);
    console.log('Error response:', error.response); // Detailed error info
    toast.error(error.response?.data?.message || 'Registration failed');
  } finally {
    setIsSubmitting(false);
  }
};
  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card>
            <Card.Body>
              <h2 className="text-center mb-4">Create Your Account</h2>
              
              <Form onSubmit={handleSubmit} noValidate>
                <Form.Group className="mb-3">
                  <Form.Label>I am a:</Form.Label>
                  <div>
                    <Form.Check
                      inline
                      type="radio"
                      label="Customer"
                      name="user_type"
                      value="customer"
                      checked={formData.user_type === 'customer'}
                      onChange={handleChange}
                    />
                    <Form.Check
                      inline
                      type="radio"
                      label="Farmer"
                      name="user_type"
                      value="farmer"
                      checked={formData.user_type === 'farmer'}
                      onChange={handleChange}
                    />
                  </div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    isInvalid={!!errors.username}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.username}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    isInvalid={!!errors.email}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email}
                  </Form.Control.Feedback>
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        isInvalid={!!errors.password}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.password}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Confirm Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="password2"
                        value={formData.password2}
                        onChange={handleChange}
                        isInvalid={!!errors.password2}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.password2}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                {formData.user_type === 'farmer' && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>Farm Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="farm_name"
                        value={formData.farm_name}
                        onChange={handleChange}
                        isInvalid={!!errors.farm_name}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.farm_name}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Location</Form.Label>
                      <Form.Control
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        isInvalid={!!errors.location}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.location}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Contact Number</Form.Label>
                      <Form.Control
                        type="tel"
                        name="contact_number"
                        value={formData.contact_number}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </>
                )}

                 <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100 mt-3"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                      Registering...
                    </>
                  ) : 'Register'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;