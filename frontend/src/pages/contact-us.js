import React, { useState } from "react";
import axios from "axios";
import { Container, Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { FaPaperPlane, FaUser, FaEnvelope, FaTag, FaComment, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import Popup from '../components/popup';
import '../App.css';

// Navbar color palette
const logoColors = {
  primary: '#fe7e8b', // Navbar primary color
  secondary: '#e65c70', // Navbar secondary color
  light: '#ffd1d4', // Navbar light color
  dark: '#d64555', // Navbar dark color
  background: '#fff5f6', // Super light - almost white
  lighterBg: '#fff9fa', // Even lighter - subtle tint
  gradient: 'linear-gradient(135deg, #fe7e8b 0%, #e65c70 100%)', // Navbar gradient
  softGradient: 'linear-gradient(135deg, #fff5f6 0%, #ffd1d4 100%)', // Very soft gradient
};

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [popupConfig, setPopupConfig] = useState({
    show: false,
    title: "",
    content: null,
    headerClass: "",
    footerContent: null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const showSuccessPopup = (message) => {
    setPopupConfig({
      show: true,
      title: "Success!",
      headerClass: "bg-success text-white",
      content: (
        <div className="popup-content text-center">
          <FaCheckCircle style={{ color: logoColors.primary }} className="mb-3" size={48} />
          <h5 className="mb-2" style={{ color: '#2D3748' }}>Message Sent Successfully!</h5>
          <p className="mb-3" style={{ color: '#4A5568' }}>{message}</p>
          <p className="small" style={{ color: '#718096' }}>
            We'll respond to your inquiry within 24 hours.
          </p>
        </div>
      ),
      footerContent: (
        <Button
          variant="success"
          onClick={hidePopup}
          className="px-4"
          style={{
            background: logoColors.gradient,
            border: 'none'
          }}
        >
          OK
        </Button>
      )
    });
  };

  const showErrorPopup = (message) => {
    setPopupConfig({
      show: true,
      title: "Error",
      headerClass: "bg-danger text-white",
      content: (
        <div className="popup-content text-center">
          <FaTimesCircle className="text-danger mb-3" size={48} />
          <h5 className="mb-2" style={{ color: '#2D3748' }}>Sending Failed</h5>
          <Alert variant="light" className="mb-3" style={{ color: '#4A5568' }}>
            {message}
          </Alert>
          <p style={{ color: '#718096' }}>Please check your information and try again.</p>
        </div>
      ),
      footerContent: (
        <div className="d-flex gap-2 justify-content-center w-100">
          <Button
            variant="outline-secondary"
            onClick={hidePopup}
            className="px-3"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleSubmit}
            className="px-3"
            style={{
              background: logoColors.gradient,
              border: 'none'
            }}
          >
            Try Again
          </Button>
        </div>
      )
    });
  };

  const hidePopup = () => {
    setPopupConfig(prev => ({ ...prev, show: false }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/contactUs`, formData);
      showSuccessPopup(response.data.message || "Thank you for your message!");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      showErrorPopup(
        error.response?.data?.error ||
        "An unexpected error occurred. Please try again later."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container fluid style={{ background: logoColors.background, minHeight: '100vh', padding: '2rem 0' }}>
      <Container>
        <div className="page-header-wrapper mb-5 text-center">
          <h1 className="page-header" style={{ color: logoColors.dark }}>Contact Us</h1>
          <p className="lead mt-3" style={{ color: '#4A5568' }}>We'd love to hear from you!</p>

          {/* Decorative line under header */}
          <div style={{
            height: '2px',
            background: `linear-gradient(90deg, transparent, ${logoColors.primary}40, transparent)`,
            width: '150px',
            margin: '1.5rem auto 0 auto'
          }} />
        </div>

        <Row className="justify-content-center">
          <Col xs={12} md={10} lg={8}>
            <Form onSubmit={handleSubmit} className="contact-form p-4 p-md-5 shadow-sm rounded-3" style={{
              background: 'white',
              borderRadius: '12px'
            }}>
              <Form.Group controlId="name" className="mb-4 form-group">
                <div className="input-icon">
                  <FaUser style={{ color: logoColors.primary }} />
                </div>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder=" "
                  className="form-input py-3 ps-5"
                  style={{
                    borderColor: logoColors.light,
                    borderRadius: '8px'
                  }}
                />
                <label style={{ color: '#718096' }}>Your Name</label>
              </Form.Group>

              <Form.Group controlId="email" className="mb-4 form-group">
                <div className="input-icon">
                  <FaEnvelope style={{ color: logoColors.primary }} />
                </div>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Your Email"
                  className="form-input py-3 ps-5"
                  style={{
                    borderColor: logoColors.light,
                    borderRadius: '8px'
                  }}
                />
              </Form.Group>

              <Form.Group controlId="subject" className="mb-4 form-group">
                <div className="input-icon">
                  <FaTag style={{ color: logoColors.primary }} />
                </div>
                <Form.Control
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder="Subject"
                  className="form-input py-3 ps-5"
                  style={{
                    borderColor: logoColors.light,
                    borderRadius: '8px'
                  }}
                />
              </Form.Group>

              <Form.Group controlId="message" className="mb-4 form-group">
                <div className="input-icon align-items-start pt-3">
                  <FaComment style={{ color: logoColors.primary }} />
                </div>
                <Form.Control
                  as="textarea"
                  rows={5}
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="Your Message"
                  className="form-input py-3 ps-5"
                  style={{
                    borderColor: logoColors.light,
                    borderRadius: '8px'
                  }}
                />
              </Form.Group>

              <div className="text-center mt-4">
                <Button
                  variant="primary"
                  type="submit"
                  disabled={isSubmitting}
                  className="submit-btn py-3 px-5 rounded-pill fw-bold"
                  style={{
                    minWidth: '200px',
                    background: logoColors.gradient,
                    border: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.opacity = '0.9';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = `0 4px 15px ${logoColors.primary}40`;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.opacity = '1';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" className="me-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane className="me-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </div>
            </Form>
          </Col>
        </Row>

        <Popup
          show={popupConfig.show}
          onHide={hidePopup}
          title={popupConfig.title}
          headerClass={popupConfig.headerClass}
          footerContent={popupConfig.footerContent}
          bodyClass="py-4 px-3"
          centered
        >
          {popupConfig.content}
        </Popup>
      </Container>
    </Container>
  );
};

export default ContactUs;