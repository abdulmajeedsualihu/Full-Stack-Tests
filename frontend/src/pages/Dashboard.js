import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [farmStats, setFarmStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFarmer, setIsFarmer] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Verify token first
        const token = localStorage.getItem('access_token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Set auth header
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Fetch user data
        const [userResponse, statsResponse] = await Promise.all([
          api.get('user/profile/'),
          isFarmer ? api.get('farm/stats/') : Promise.resolve(null)
        ]);

        setUserData(userResponse.data);
        if (isFarmer && statsResponse) {
          setFarmStats(statsResponse.data);
        }
      } catch (error) {
        console.error('Dashboard error:', error);
        if (error.response?.status === 401) {
          toast.error('Session expired. Please login again.');
          navigate('/login');
        } else {
          toast.error('Failed to load dashboard data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, isFarmer]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    delete api.defaults.headers.common['Authorization'];
    navigate('/login');
    toast.success('Logged out successfully');
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row className="mb-4">
        <Col>
          <h2>Dashboard</h2>
          <Button variant="outline-danger" onClick={handleLogout} className="float-end">
            Logout
          </Button>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title>User Profile</Card.Title>
              {userData && (
                <>
                  <p><strong>Name:</strong> {userData.name}</p>
                  <p><strong>Email:</strong> {userData.email}</p>
                  <p><strong>Role:</strong> {isFarmer ? 'Farmer' : 'Customer'}</p>
                  {isFarmer && userData.farm_name && (
                    <p><strong>Farm:</strong> {userData.farm_name}</p>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </Col>

        {isFarmer && farmStats && (
          <Col md={6}>
            <Card>
              <Card.Body>
                <Card.Title>Farm Statistics</Card.Title>
                <p><strong>Total Products:</strong> {farmStats.total_products}</p>
                <p><strong>Active Orders:</strong> {farmStats.active_orders}</p>
                <p><strong>Total Revenue:</strong> ${farmStats.total_revenue}</p>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

      {/* Additional dashboard sections can be added here */}
    </Container>
  );
};

export default Dashboard;