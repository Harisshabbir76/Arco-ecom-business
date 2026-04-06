import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FaFacebook, FaInstagram, FaTwitter, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import './heroSlider.css';

// ARCO Brand Colors — matched to your theme
const C = {
  red: '#CC1B1B',
  redDark: '#A01212',
  redLight: '#fdf2f2',
  black: '#111111',
  charcoal: '#1e1e1e',
  white: '#ffffff',
  border: '#e8e8e8',
  lightGray: '#f7f7f7',
  muted: '#888',
  gradient: 'linear-gradient(135deg, #CC1B1B 0%, #A01212 100%)',
  softGradient: 'linear-gradient(135deg, #fdf2f2 0%, #f5c6c6 100%)',
};

export default function Footer() {
  return (
    <footer className="site-footer" style={{
      background: C.white,
      padding: '3rem 0 1.5rem',
      marginTop: 'auto',
      position: 'relative',
      borderTop: `1px solid ${C.border}`
    }}>
      <Container>
        <Row>
          {/* Quick Links Column */}
          <Col xs={6} md={6} className="footer-col">
            <h5 className="footer-heading" style={{
              color: C.charcoal,
              fontSize: '1.1rem',
              fontWeight: '600',
              marginBottom: '1.2rem',
              fontFamily: "'Barlow', sans-serif",
              letterSpacing: '0.02em'
            }}>
              Quick Links
            </h5>
            <ul className="footer-links" style={{
              listStyle: 'none',
              padding: 0,
              margin: 0
            }}>
              {['Home', 'Shop', 'T-Shirts', 'Bottoms', 'About', 'Contact'].map((item, index) => {
                const paths = ['/', '/catalog', '/category/t-shirt', '/category/bottom', '/about', '/contact'];
                return (
                  <li key={index} style={{ marginBottom: '0.75rem' }}>
                    <a
                      href={paths[index]}
                      style={{
                        color: C.muted,
                        textDecoration: 'none',
                        transition: 'all 0.2s ease',
                        fontSize: '0.95rem',
                        display: 'inline-block',
                        fontFamily: "'Barlow', sans-serif"
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.color = C.red;
                        e.target.style.transform = 'translateX(5px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.color = C.muted;
                        e.target.style.transform = 'translateX(0)';
                      }}
                    >
                      {item}
                    </a>
                  </li>
                );
              })}
            </ul>
          </Col>

          {/* Contact Info Column */}
          <Col xs={6} md={6} className="footer-col">
            <h5 className="footer-heading" style={{
              color: C.charcoal,
              fontSize: '1.1rem',
              fontWeight: '600',
              marginBottom: '1.2rem',
              fontFamily: "'Barlow', sans-serif",
              letterSpacing: '0.02em'
            }}>
              Contact Info
            </h5>
            <ul className="contact-info" style={{
              listStyle: 'none',
              padding: 0,
              margin: 0
            }}>
              <li style={{
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem'
              }}>
                <FaMapMarkerAlt style={{
                  color: C.red,
                  fontSize: '1rem',
                  marginTop: '0.2rem',
                  flexShrink: 0
                }} />
                <span style={{ color: C.muted, fontSize: '0.95rem', lineHeight: '1.5', fontFamily: "'Barlow', sans-serif" }}>
                  123 Fashion Street, Style City
                </span>
              </li>
              <li style={{
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <FaPhone style={{
                  color: C.red,
                  fontSize: '0.9rem',
                  flexShrink: 0
                }} />
                <span style={{ color: C.muted, fontSize: '0.95rem', fontFamily: "'Barlow', sans-serif" }}>
                  (123) 456-7890
                </span>
              </li>
              <li style={{
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <FaEnvelope style={{
                  color: C.red,
                  fontSize: '0.9rem',
                  flexShrink: 0
                }} />
                <span style={{ color: C.muted, fontSize: '0.95rem', fontFamily: "'Barlow', sans-serif" }}>
                  info@arco.com
                </span>
              </li>
            </ul>

            {/* Social Icons */}
            <div className="social-icons" style={{
              display: 'flex',
              gap: '1rem',
              marginTop: '0.5rem'
            }}>
              {[
                { icon: FaFacebook, url: 'https://facebook.com', label: 'Facebook' },
                { icon: FaInstagram, url: 'https://instagram.com', label: 'Instagram' },
                { icon: FaTwitter, url: 'https://twitter.com', label: 'Twitter' }
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  aria-label={social.label}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: C.white,
                    color: C.red,
                    transition: 'all 0.3s ease',
                    border: `1px solid ${C.border}`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = C.gradient;
                    e.currentTarget.style.color = C.white;
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = `0 5px 15px ${C.red}40`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = C.white;
                    e.currentTarget.style.color = C.red;
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <social.icon size={16} />
                </a>
              ))}
            </div>
          </Col>
        </Row>

        {/* Footer Bottom */}
        <Row className="footer-bottom" style={{
          marginTop: '2.5rem',
          paddingTop: '0.5rem'
        }}>
          <Col className="text-center">
            <p className="copyright" style={{
              color: C.muted,
              fontSize: '0.9rem',
              margin: 0,
              fontFamily: "'Barlow', sans-serif"
            }}>
              &copy; {new Date().getFullYear()} ARCO. All Rights Reserved.{' '}
              <span style={{ color: C.red, fontWeight: 500 }}>Own your Aura</span>
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}