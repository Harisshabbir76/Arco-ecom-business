import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const C = {
  red: '#CC1B1B',
  charcoal: '#1e1e1e',
  gray: '#666666',
  light: '#f8f9fa'
};

const AboutUsMinimal = () => {
  return (
    <Container className="py-5" style={{ fontFamily: "'Barlow', sans-serif", maxWidth: '800px' }}>
      {/* Header */}
      <section className="text-center mb-5">
        <h6 style={{ color: C.red, letterSpacing: '2px', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem' }}>
          Since 2015
        </h6>
        <h1 style={{ fontWeight: 700, color: C.charcoal, fontSize: '3rem' }}>
          KitchenCraft
        </h1>
        <div style={{ width: '40px', height: '3px', background: C.red, margin: '20px auto' }} />
      </section>

      {/* Main Content */}
      <Row className="justify-content-center text-center">
        <Col md={10}>
          <p style={{ fontSize: '1.2rem', lineHeight: '1.8', color: C.charcoal, fontWeight: 500 }}>
            We believe that the best memories are made around the table. 
            That’s why we’ve dedicated a decade to crafting kitchenware that 
            balances professional performance with timeless design.
          </p>
          
          <p className="mt-4" style={{ color: C.gray, lineHeight: '1.7' }}>
            From our signature stainless steel cookware to eco-friendly essentials, 
            every KitchenCraft piece is built to last a lifetime. We don't just 
            make tools; we make the foundation for your next great meal.
          </p>
        </Col>
      </Row>

      {/* Stats / Pillars */}
      <Row className="mt-5 pt-4 border-top text-center">
        <Col xs={4}>
          <h4 style={{ fontWeight: 700, color: C.red, marginBottom: '5px' }}>500k+</h4>
          <small style={{ color: C.gray, textTransform: 'uppercase', fontSize: '0.7rem' }}>Customers</small>
        </Col>
        <Col xs={4}>
          <h4 style={{ fontWeight: 700, color: C.red, marginBottom: '5px' }}>10+</h4>
          <small style={{ color: C.gray, textTransform: 'uppercase', fontSize: '0.7rem' }}>Countries</small>
        </Col>
        <Col xs={4}>
          <h4 style={{ fontWeight: 700, color: C.red, marginBottom: '5px' }}>100%</h4>
          <small style={{ color: C.gray, textTransform: 'uppercase', fontSize: '0.7rem' }}>Sustainable</small>
        </Col>
      </Row>

      {/* Simple CTA */}
      <div className="text-center mt-5 pt-4">
        <Button 
          as={Link} 
          to="/catalog"
          style={{ 
            backgroundColor: C.charcoal, 
            border: 'none', 
            padding: '12px 30px', 
            borderRadius: '0', 
            fontWeight: 600 
          }}
        >
          View Collection
        </Button>
      </div>
    </Container>
  );
};

export default AboutUsMinimal;