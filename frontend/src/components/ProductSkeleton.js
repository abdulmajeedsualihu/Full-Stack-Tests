// Create src/components/ProductSkeleton.js
import React from 'react';
import { Card, Placeholder } from 'react-bootstrap';

const ProductSkeleton = () => (
  <Card style={{ height: '100%' }}>
    <Card.Img variant="top" style={{ height: '200px', backgroundColor: '#f5f5f5' }} />
    <Card.Body>
      <Placeholder as={Card.Title} animation="glow">
        <Placeholder xs={6} />
      </Placeholder>
      <Placeholder as={Card.Text} animation="glow">
        <Placeholder xs={7} /> <Placeholder xs={4} />
        <Placeholder xs={4} /> <Placeholder xs={6} />
      </Placeholder>
      <Placeholder.Button variant="primary" xs={6} />
    </Card.Body>
  </Card>
);

export default ProductSkeleton;

// In Products.js
import ProductSkeleton from '../components/ProductSkeleton';

// Replace loading spinner with skeletons
if (loading) {
  return (
    <Container className="mt-4">
      <h2 className="mb-4">Fresh Farm Products</h2>
      <Row>
        {[...Array(8)].map((_, i) => (
          <Col key={i} xs={12} sm={6} md={4} lg={3} className="mb-4">
            <ProductSkeleton />
          </Col>
        ))}
      </Row>
    </Container>
  );
}