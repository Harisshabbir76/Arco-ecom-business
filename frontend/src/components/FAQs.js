import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Spinner, Accordion } from 'react-bootstrap';
import axios from 'axios';
import { FaQuestionCircle, FaChevronDown, FaChevronUp } from 'react-icons/fa';

// Navbar color palette
const logoColors = {
  primary: '#fe7e8b',
  secondary: '#e65c70',
  light: '#ffd1d4',
  dark: '#d64555',
  background: '#fff5f6',
  gradient: 'linear-gradient(135deg, #fe7e8b 0%, #e65c70 100%)',
};

export default function FAQs() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/faqs`);
        console.log('FAQs API response:', { type: typeof res.data, isArray: Array.isArray(res.data), length: res.data?.length, data: res.data });
        const data = Array.isArray(res.data) ? res.data : [];
        setFaqs(data);
      } catch (err) {
        console.error('FAQs API error:', err.response?.data || err.message);
        setError('Failed to load FAQs');
        setFaqs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFAQs();
  }, []);

  if (loading) {
    return (
      <Container className="text-center my-5 py-5">
        <Spinner animation="border" style={{ color: logoColors.primary }} />
      </Container>
    );
  }

  if (error || faqs.length === 0) {
    return null; // Don't show section if no FAQs
  }

  return (
    <div style={{
      background: logoColors.background,
      padding: '3rem 0',
    }}>
      <Container>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{
            fontSize: '2rem',
            color: '#2D3748',
            marginBottom: '0.5rem',
            fontWeight: '600'
          }}>
            Frequently <span style={{ color: logoColors.primary }}>Asked Questions</span>
          </h2>
          <p style={{ color: '#718096', fontSize: '1rem' }}>
            Find answers to common questions about our products and services
          </p>
        </div>

        <Row className="justify-content-center">
          <Col lg={8} md={10}>
            <Accordion>
              {faqs.map((faq, index) => (
                <Accordion.Item
                  key={faq._id}
                  eventKey={index.toString()}
                  style={{
                    marginBottom: '1rem',
                    border: 'none',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                  }}
                >
                  <Accordion.Header
                    style={{
                      background: 'white',
                      borderBottom: 'none'
                    }}
                  >
                    <div className="d-flex align-items-center">
                      <FaQuestionCircle
                        style={{
                          color: logoColors.primary,
                          marginRight: '0.75rem',
                          fontSize: '1rem'
                        }}
                      />
                      <span style={{
                        color: '#2D3748',
                        fontWeight: '500',
                        fontSize: '1rem'
                      }}>
                        {faq.question}
                      </span>
                    </div>
                  </Accordion.Header>
                  <Accordion.Body
                    style={{
                      background: 'white',
                      borderTop: '1px solid #f0f0f0',
                      color: '#718096',
                      fontSize: '0.95rem',
                      lineHeight: '1.6'
                    }}
                  >
                    {faq.answer}
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

