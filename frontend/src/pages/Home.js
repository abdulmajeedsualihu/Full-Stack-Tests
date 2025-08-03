import React from 'react';
import { Container, Card, Row, Col } from 'react-bootstrap';

const Home = () => {
  return (
    <Container>
      <h1 className="my-4">Welcome to FarmDirect</h1>
      <p className="lead">Connecting farmers directly with buyers</p>
      
      <Row className="mt-5">
        <Col md={4}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Fresh Produce</Card.Title>
              <Card.Text>
                Buy directly from local farmers and get the freshest products available.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Support Local</Card.Title>
              <Card.Text>
                Help support your local farming community by purchasing directly from them.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Easy to Use</Card.Title>
              <Card.Text>
                Simple platform that makes it easy to find and purchase farm products.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;