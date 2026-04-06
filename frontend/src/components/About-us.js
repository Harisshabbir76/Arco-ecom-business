import React from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Image,
  Button,
  Badge,
  ListGroup,
  Accordion
} from 'react-bootstrap';
import {
  FaUsers,
  FaBullseye,
  FaHandshake,
  FaAward,
  FaCheckCircle,
  FaQuoteLeft
} from 'react-icons/fa';

// Import team member images
import member1 from '../images/member1.jpeg';
import member2 from '../images/member2.jpeg';
import member3 from '../images/member3.jpeg';
import member4 from '../images/member4.jpeg';

// Navbar color palette
const logoColors = {
  primary: '#fe7e8b',
  secondary: '#e65c70',
  light: '#ffd1d4',
  dark: '#d64555',
  background: '#fff5f6',
  lighterBg: '#fff9fa',
  gradient: 'linear-gradient(135deg, #fe7e8b 0%, #e65c70 100%)',
  softGradient: 'linear-gradient(135deg, #fff5f6 0%, #ffd1d4 100%)',
};

const AboutUs = () => {
  const teamMembers = [
    { name: 'John Doe', role: 'CEO', image: member1 },
    { name: 'Jane Smith', role: 'Design Director', image: member2 },
    { name: 'Mike Johnson', role: 'Tech Lead', image: member3 },
    { name: 'Sarah Williams', role: 'Marketing Head', image: member4 }
  ];

  const milestones = [
    { year: '2010', event: 'Company Founded' },
    { year: '2014', event: 'First Major Client' },
    { year: '2018', event: 'Expanded to 3 Countries' },
    { year: '2022', event: 'Reached 1M Customers' }
  ];

  return (
    <Container fluid style={{ background: logoColors.background, minHeight: '100vh', padding: '2rem 1rem' }}>
      <Container>
        {/* Hero Section */}
        <Row className="mb-4 mb-md-5 text-center">
          <Col>
            <h1 className="mb-3 mb-md-4" style={{ 
              color: logoColors.dark,
              fontSize: 'clamp(2rem, 6vw, 3.5rem)',
              fontWeight: '600'
            }}>
              About Our Company
            </h1>
            <p className="lead" style={{ 
              color: '#4A5568',
              fontSize: 'clamp(1rem, 4vw, 1.25rem)',
              padding: '0 1rem'
            }}>
              We've been delivering excellence for over a decade, serving customers worldwide with passion and dedication.
            </p>

            {/* Decorative line under header */}
            <div style={{
              height: '2px',
              background: `linear-gradient(90deg, transparent, ${logoColors.primary}40, transparent)`,
              width: 'min(200px, 80%)',
              margin: '1.5rem auto'
            }} />
          </Col>
        </Row>

        {/* Mission and Values */}
        <Row className="mb-4 mb-md-5 g-3 g-md-4">
          <Col md={6} className="mb-3 mb-md-0">
            <Card className="h-100 border-0 shadow-sm" style={{
              borderRadius: '12px',
              background: 'white',
              transition: 'all 0.3s ease',
              height: '100%'
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = `0 8px 20px ${logoColors.primary}30`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
              }}>
              <Card.Body className="p-3 p-md-4">
                <FaBullseye style={{ color: logoColors.primary, marginBottom: '1rem' }} size={window.innerWidth <= 768 ? 28 : 32} />
                <Card.Title as="h3" style={{ 
                  color: logoColors.dark,
                  fontSize: 'clamp(1.25rem, 5vw, 1.75rem)',
                  marginBottom: '0.75rem'
                }}>
                  Our Mission
                </Card.Title>
                <Card.Text style={{ 
                  color: '#4A5568', 
                  lineHeight: '1.6',
                  fontSize: 'clamp(0.9rem, 4vw, 1rem)'
                }}>
                  To provide innovative solutions that transform businesses and create lasting value for our customers,
                  employees, and communities through technology and exceptional service.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="h-100 border-0 shadow-sm" style={{
              borderRadius: '12px',
              background: 'white',
              transition: 'all 0.3s ease',
              height: '100%'
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = `0 8px 20px ${logoColors.primary}30`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
              }}>
              <Card.Body className="p-3 p-md-4">
                <FaHandshake style={{ color: logoColors.primary, marginBottom: '1rem' }} size={window.innerWidth <= 768 ? 28 : 32} />
                <Card.Title as="h3" style={{ 
                  color: logoColors.dark,
                  fontSize: 'clamp(1.25rem, 5vw, 1.75rem)',
                  marginBottom: '0.75rem'
                }}>
                  Our Values
                </Card.Title>
                <ListGroup variant="flush">
                  <ListGroup.Item className="border-0 px-0 py-2" style={{ background: 'transparent' }}>
                    <FaCheckCircle style={{ color: logoColors.primary, marginRight: '0.75rem', fontSize: '0.9rem' }} />
                    <span style={{ color: '#4A5568', fontSize: 'clamp(0.85rem, 4vw, 1rem)' }}>Integrity in all we do</span>
                  </ListGroup.Item>
                  <ListGroup.Item className="border-0 px-0 py-2" style={{ background: 'transparent' }}>
                    <FaCheckCircle style={{ color: logoColors.primary, marginRight: '0.75rem', fontSize: '0.9rem' }} />
                    <span style={{ color: '#4A5568', fontSize: 'clamp(0.85rem, 4vw, 1rem)' }}>Customer-first approach</span>
                  </ListGroup.Item>
                  <ListGroup.Item className="border-0 px-0 py-2" style={{ background: 'transparent' }}>
                    <FaCheckCircle style={{ color: logoColors.primary, marginRight: '0.75rem', fontSize: '0.9rem' }} />
                    <span style={{ color: '#4A5568', fontSize: 'clamp(0.85rem, 4vw, 1rem)' }}>Continuous innovation</span>
                  </ListGroup.Item>
                  <ListGroup.Item className="border-0 px-0 py-2" style={{ background: 'transparent' }}>
                    <FaCheckCircle style={{ color: logoColors.primary, marginRight: '0.75rem', fontSize: '0.9rem' }} />
                    <span style={{ color: '#4A5568', fontSize: 'clamp(0.85rem, 4vw, 1rem)' }}>Team collaboration</span>
                  </ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Team Section */}
        <Row className="mb-4 mb-md-5">
          <Col>
            <h2 className="text-center mb-3 mb-md-4" style={{ 
              color: logoColors.dark,
              fontSize: 'clamp(1.5rem, 6vw, 2.5rem)',
              fontWeight: '600'
            }}>
              <FaUsers style={{ color: logoColors.primary, marginRight: '0.5rem', fontSize: 'clamp(1.2rem, 5vw, 2rem)' }} /> 
              Meet Our Team
            </h2>

            {/* Decorative line under team header */}
            <div style={{
              height: '2px',
              background: `linear-gradient(90deg, transparent, ${logoColors.primary}40, transparent)`,
              width: 'min(150px, 60%)',
              margin: '1rem auto 2rem auto'
            }} />

            <Row className="g-3 g-md-4">
              {teamMembers.map((member, index) => (
                <Col key={index} xs={6} md={3} className="mb-2 mb-md-0">
                  <Card className="h-100 border-0 text-center" style={{
                    borderRadius: '12px',
                    background: 'white',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    height: '100%'
                  }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.boxShadow = `0 8px 20px ${logoColors.primary}30`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                    }}>
                    <div className="d-flex justify-content-center mt-3">
                      <Image
                        src={member.image}
                        roundedCircle
                        style={{
                          width: 'min(120px, 25vw)',
                          height: 'min(120px, 25vw)',
                          objectFit: 'cover',
                          border: `3px solid ${logoColors.primary}`
                        }}
                      />
                    </div>
                    <Card.Body className="p-2 p-md-3">
                      <Card.Title style={{ 
                        color: '#2D3748',
                        fontSize: 'clamp(0.9rem, 4vw, 1.1rem)',
                        marginBottom: '0.5rem'
                      }}>
                        {member.name}
                      </Card.Title>
                      <Badge
                        pill
                        style={{
                          background: logoColors.gradient,
                          border: 'none',
                          padding: '0.4rem 0.8rem',
                          fontSize: 'clamp(0.7rem, 3vw, 0.8rem)',
                          fontWeight: '500'
                        }}
                      >
                        {member.role}
                      </Badge>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>

        {/* History/Accordion */}
        <Row className="mb-4 mb-md-5">
          <Col>
            <h2 className="text-center mb-3 mb-md-4" style={{ 
              color: logoColors.dark,
              fontSize: 'clamp(1.5rem, 6vw, 2.5rem)',
              fontWeight: '600'
            }}>
              <FaAward style={{ color: logoColors.primary, marginRight: '0.5rem', fontSize: 'clamp(1.2rem, 5vw, 2rem)' }} /> 
              Our Journey
            </h2>

            {/* Decorative line under history header */}
            <div style={{
              height: '2px',
              background: `linear-gradient(90deg, transparent, ${logoColors.primary}40, transparent)`,
              width: 'min(150px, 60%)',
              margin: '1rem auto 2rem auto'
            }} />

            <Accordion defaultActiveKey="0" flush>
              {milestones.map((item, index) => (
                <Accordion.Item
                  key={index}
                  eventKey={index.toString()}
                  style={{
                    marginBottom: '0.75rem',
                    border: `1px solid ${logoColors.primary}20`,
                    borderRadius: '8px',
                    overflow: 'hidden'
                  }}
                >
                  <Accordion.Header>
                    <strong className="me-2" style={{ color: logoColors.primary, fontSize: 'clamp(0.9rem, 4vw, 1rem)' }}>
                      {item.year}:
                    </strong>
                    <span style={{ color: '#2D3748', fontSize: 'clamp(0.9rem, 4vw, 1rem)' }}>{item.event}</span>
                  </Accordion.Header>
                  <Accordion.Body style={{ 
                    background: logoColors.lighterBg, 
                    color: '#4A5568',
                    fontSize: 'clamp(0.85rem, 4vw, 0.95rem)',
                    padding: '1rem'
                  }}>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                    tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
                    quis nostrud exercitation ullamco laboris.
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          </Col>
        </Row>

        {/* Testimonial */}
        <Row className="mb-4 mb-md-5">
          <Col>
            <Card className="border-0" style={{
              background: logoColors.softGradient,
              borderRadius: '12px',
              transition: 'all 0.3s ease'
            }}>
              <Card.Body className="p-4 p-md-5 text-center">
                <FaQuoteLeft style={{ color: logoColors.primary, marginBottom: '1rem' }} size={window.innerWidth <= 768 ? 20 : 24} />
                <blockquote className="blockquote mb-0">
                  <p className="mb-3" style={{ 
                    color: '#2D3748',
                    fontSize: 'clamp(1rem, 5vw, 1.5rem)',
                    lineHeight: '1.5',
                    padding: '0 1rem'
                  }}>
                    "Working with this company has been transformative for our business. Their
                    innovative approach and dedicated team delivered results beyond our expectations."
                  </p>
                  <footer className="blockquote-footer" style={{ 
                    color: '#4A5568',
                    fontSize: 'clamp(0.85rem, 4vw, 1rem)'
                  }}>
                    Satisfied Customer from <cite style={{ color: logoColors.primary }}>Global Enterprises</cite>
                  </footer>
                </blockquote>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* CTA */}
        <Row className="text-center">
          <Col>
            <Card className="border-0" style={{
              background: logoColors.gradient,
              borderRadius: '12px'
            }}>
              <Card.Body className="p-4 p-md-5">
                <h3 className="text-white mb-3" style={{
                  fontSize: 'clamp(1.25rem, 6vw, 2rem)',
                  fontWeight: '600'
                }}>
                  Ready to work with us?
                </h3>
                <p className="mb-4" style={{ 
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: 'clamp(0.9rem, 4vw, 1.1rem)'
                }}>
                  Join thousands of satisfied customers worldwide
                </p>
                <Button
                  as={Link}
                  to="/contact-us"
                  variant="light"
                  size="lg"
                  className="px-4 px-md-5 py-2 py-md-3"
                  style={{
                    borderRadius: '8px',
                    fontWeight: '500',
                    color: logoColors.primary,
                    border: 'none',
                    transition: 'all 0.3s ease',
                    fontSize: 'clamp(0.9rem, 4vw, 1.1rem)',
                    width: window.innerWidth <= 576 ? '100%' : 'auto',
                    maxWidth: '300px',
                    margin: '0 auto'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  Contact Us Today
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </Container>
  );
};

export default AboutUs;