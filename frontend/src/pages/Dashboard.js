import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Spinner, Button, Tab, Tabs,
  ListGroup, Badge, Modal, Form, Alert, Dropdown
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import api from '../services/api';
import { toast } from 'react-toastify';

const localizer = momentLocalizer(moment);

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState({
    profile: null,
    stats: null,
    recentOrders: [],
    products: [],
    notifications: [],
    events: [],
    analytics: {
      monthly_revenue: [],
      order_status: []
    }
  });
  const [loading, setLoading] = useState(true);
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    start: new Date(),
    end: new Date(),
    allDay: false
  });
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch all dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          navigate('/login');
          return;
        }

        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Define all endpoints to fetch
        const endpoints = [
          'user/profile/',
          'user/stats/',
          'orders/recent/',
          'products/',
          'notifications/',
          'calendar/events/',
          'analytics/'
        ];

        // Use Promise.allSettled to handle successes/failures
        const responses = await Promise.allSettled(
          endpoints.map(endpoint => api.get(endpoint).catch(e => e))
        );

        // Process responses
        const data = {
          profile: responses[0].status === 'fulfilled' ? responses[0].value.data : null,
          stats: responses[1].status === 'fulfilled' ? responses[1].value.data : null,
          recentOrders: responses[2].status === 'fulfilled' ? responses[2].value.data : [],
          products: responses[3].status === 'fulfilled' ? responses[3].value.data : [],
          notifications: responses[4].status === 'fulfilled' ? responses[4].value.data : [],
          events: responses[5].status === 'fulfilled' 
            ? responses[5].value.data.map(event => ({
                ...event,
                start: new Date(event.start),
                end: new Date(event.end)
              })) 
            : [],
          analytics: responses[6].status === 'fulfilled' 
            ? responses[6].value.data 
            : { monthly_revenue: [], order_status: [] }
        };

        setDashboardData(data);
        setUnreadCount(data.notifications.filter(n => !n.read).length);
        setLoading(false);

      } catch (error) {
        handleApiError(error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const handleApiError = (error) => {
    console.error('Dashboard error:', error);
    if (error.response?.status === 401) {
      toast.error('Session expired. Please login again.');
      navigate('/login');
    } else {
      toast.error(error.response?.data?.message || 'Failed to load dashboard data');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    delete api.defaults.headers.common['Authorization'];
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const handleEventSelect = (event) => {
    setNewEvent({
      title: event.title,
      start: event.start,
      end: event.end,
      allDay: event.allDay || false
    });
    setShowEventModal(true);
  };

  const handleCreateEvent = async () => {
    try {
      const response = await api.post('calendar/events/', newEvent);
      setDashboardData(prev => ({
        ...prev,
        events: [...prev.events, {
          ...response.data,
          start: new Date(response.data.start),
          end: new Date(response.data.end)
        }]
      }));
      setShowEventModal(false);
      toast.success('Event created successfully');
    } catch (error) {
      toast.error('Failed to create event');
    }
  };

  const markNotificationAsRead = async (id) => {
    try {
      await api.patch(`notifications/${id}/`, { read: true });
      setDashboardData(prev => ({
        ...prev,
        notifications: prev.notifications.map(n => 
          n.id === id ? { ...n, read: true } : n
        )
      }));
      setUnreadCount(prev => prev - 1);
    } catch (error) {
      toast.error('Failed to update notification');
    }
  };

  // Chart color schemes
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  const statusColors = {
    pending: '#FFBB28',
    completed: '#00C49F',
    cancelled: '#FF8042',
    shipped: '#0088FE'
  };

  // Tab Components
  const renderOverviewTab = () => (
    <Row>
      <Col md={4} className="mb-4">
        <ProfileCard profile={dashboardData.profile} />
      </Col>
      <Col md={8} className="mb-4">
        <AnalyticsCards stats={dashboardData.stats} />
      </Col>
      <Col md={6} className="mb-4">
        <Card>
          <Card.Body>
            <Card.Title>Monthly Revenue</Card.Title>
            {dashboardData.analytics?.monthly_revenue?.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dashboardData.analytics.monthly_revenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Alert variant="info">No revenue data available</Alert>
            )}
          </Card.Body>
        </Card>
      </Col>
      <Col md={6} className="mb-4">
        <Card>
          <Card.Body>
            <Card.Title>Order Status</Card.Title>
            {dashboardData.analytics?.order_status?.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dashboardData.analytics.order_status}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {dashboardData.analytics.order_status.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={statusColors[entry.name?.toLowerCase()] || COLORS[index % COLORS.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Alert variant="info">No order status data available</Alert>
            )}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );

  const renderCalendarTab = () => (
    <Card className="mb-4">
      <Card.Body>
        <div className="d-flex justify-content-between mb-3">
          <Card.Title>Calendar</Card.Title>
          <Button variant="primary" size="sm" onClick={() => setShowEventModal(true)}>
            Add Event
          </Button>
        </div>
        <div style={{ height: 600 }}>
          <Calendar
            localizer={localizer}
            events={dashboardData.events}
            startAccessor="start"
            endAccessor="end"
            onSelectEvent={handleEventSelect}
            defaultView="month"
          />
        </div>
      </Card.Body>
    </Card>
  );

  const renderNotificationsTab = () => (
    <Card className="mb-4">
      <Card.Body>
        <Card.Title>
          Notifications
          {unreadCount > 0 && (
            <Badge bg="danger" className="ms-2">{unreadCount}</Badge>
          )}
        </Card.Title>
        {dashboardData.notifications.length > 0 ? (
          <ListGroup variant="flush">
            {dashboardData.notifications.map(notification => (
              <ListGroup.Item 
                key={notification.id} 
                action 
                onClick={() => markNotificationAsRead(notification.id)}
                className={!notification.read ? 'fw-bold' : ''}
              >
                <div className="d-flex justify-content-between">
                  <div>{notification.message}</div>
                  <div className="text-muted small">
                    {moment(notification.created_at).fromNow()}
                  </div>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        ) : (
          <Alert variant="info">No notifications available</Alert>
        )}
      </Card.Body>
    </Card>
  );

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
    <Container fluid className="mt-3">
      {/* Top Navigation Bar */}
      <Row className="mb-4 align-items-center">
        <Col>
          <h2>Dashboard</h2>
          <p className="text-muted">
            {moment().format('dddd, MMMM Do YYYY')}
          </p>
        </Col>
        <Col xs="auto">
          <Dropdown>
            <Dropdown.Toggle variant="outline-secondary">
              <i className="bi bi-bell-fill"></i>
              {unreadCount > 0 && (
                <Badge bg="danger" pill className="ms-1">{unreadCount}</Badge>
              )}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {dashboardData.notifications.slice(0, 3).map(notification => (
                <Dropdown.Item 
                  key={notification.id}
                  onClick={() => markNotificationAsRead(notification.id)}
                >
                  <div className={!notification.read ? 'fw-bold' : ''}>
                    {notification.message}
                  </div>
                  <div className="text-muted small">
                    {moment(notification.created_at).fromNow()}
                  </div>
                </Dropdown.Item>
              ))}
              <Dropdown.Divider />
              <Dropdown.Item onClick={() => setActiveTab('notifications')}>
                View All Notifications
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <Button variant="outline-danger" onClick={handleLogout} className="ms-2">
            Logout
          </Button>
        </Col>
      </Row>

      {/* Main Content */}
      <Tabs activeKey={activeTab} onSelect={setActiveTab} className="mb-3">
        <Tab eventKey="overview" title="Overview">
          {renderOverviewTab()}
        </Tab>
        <Tab eventKey="calendar" title="Calendar">
          {renderCalendarTab()}
        </Tab>
        <Tab eventKey="notifications" title={`Notifications ${unreadCount > 0 ? `(${unreadCount})` : ''}`}>
          {renderNotificationsTab()}
        </Tab>
      </Tabs>

      {/* Event Modal */}
      <Modal show={showEventModal} onHide={() => setShowEventModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Event</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Event Title</Form.Label>
              <Form.Control
                type="text"
                value={newEvent.title}
                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Start Date/Time</Form.Label>
              <Form.Control
                type="datetime-local"
                value={moment(newEvent.start).format('YYYY-MM-DDTHH:mm')}
                onChange={(e) => setNewEvent({...newEvent, start: new Date(e.target.value)})}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>End Date/Time</Form.Label>
              <Form.Control
                type="datetime-local"
                value={moment(newEvent.end).format('YYYY-MM-DDTHH:mm')}
                onChange={(e) => setNewEvent({...newEvent, end: new Date(e.target.value)})}
                required
              />
            </Form.Group>
            <Form.Check
              type="checkbox"
              label="All Day Event"
              checked={newEvent.allDay}
              onChange={(e) => setNewEvent({...newEvent, allDay: e.target.checked})}
            />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEventModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleCreateEvent}>
            Save Event
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

// Sub-components
const ProfileCard = ({ profile }) => (
  <Card>
    <Card.Body className="text-center">
      <div className="mb-3">
        <div className="avatar-lg mx-auto">
          {profile?.avatar ? (
            <img 
              src={profile.avatar} 
              alt="Profile" 
              className="rounded-circle img-thumbnail"
              style={{ width: '100px', height: '100px', objectFit: 'cover' }}
            />
          ) : (
            <div className="bg-light rounded-circle d-flex align-items-center justify-content-center" 
                 style={{ width: '100px', height: '100px' }}>
              <i className="bi bi-person-fill" style={{ fontSize: '3rem' }}></i>
            </div>
          )}
        </div>
      </div>
      <h4>{profile?.name || 'User'}</h4>
      <p className="text-muted">{profile?.email}</p>
      <Badge bg={profile?.is_farmer ? 'success' : 'primary'}>
        {profile?.is_farmer ? 'Farmer' : 'Customer'}
      </Badge>
      {profile?.farm_name && (
        <div className="mt-3">
          <p>
            <i className="bi bi-house-door me-2"></i>
            {profile.farm_name}
          </p>
          <p>
            <i className="bi bi-geo-alt me-2"></i>
            {profile.location}
          </p>
        </div>
      )}
    </Card.Body>
  </Card>
);

const AnalyticsCards = ({ stats }) => (
  <Row>
    <Col md={6} className="mb-3">
      <Card className="h-100">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h6 className="text-muted mb-1">Total Revenue</h6>
              <h3>${stats?.total_revenue?.toLocaleString() || '0'}</h3>
            </div>
            <div className="bg-light-primary p-3 rounded">
              <i className="bi bi-currency-dollar" style={{ fontSize: '1.5rem' }}></i>
            </div>
          </div>
        </Card.Body>
      </Card>
    </Col>
    <Col md={6} className="mb-3">
      <Card className="h-100">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h6 className="text-muted mb-1">Total Orders</h6>
              <h3>{stats?.total_orders || '0'}</h3>
            </div>
            <div className="bg-light-warning p-3 rounded">
              <i className="bi bi-cart" style={{ fontSize: '1.5rem' }}></i>
            </div>
          </div>
        </Card.Body>
      </Card>
    </Col>
    <Col md={6} className="mb-3">
      <Card className="h-100">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h6 className="text-muted mb-1">Products</h6>
              <h3>{stats?.total_products || '0'}</h3>
            </div>
            <div className="bg-light-success p-3 rounded">
              <i className="bi bi-box-seam" style={{ fontSize: '1.5rem' }}></i>
            </div>
          </div>
        </Card.Body>
      </Card>
    </Col>
    <Col md={6} className="mb-3">
      <Card className="h-100">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h6 className="text-muted mb-1">Active Customers</h6>
              <h3>{stats?.active_customers || '0'}</h3>
            </div>
            <div className="bg-light-info p-3 rounded">
              <i className="bi bi-people" style={{ fontSize: '1.5rem' }}></i>
            </div>
          </div>
        </Card.Body>
      </Card>
    </Col>
  </Row>
);

export default Dashboard;