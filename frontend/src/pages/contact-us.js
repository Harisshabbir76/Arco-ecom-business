import React, { useState } from "react";
import axios from "axios";
import { Container, Form, Button, Alert, Spinner, Row, Col, Card } from 'react-bootstrap';
import { FaPaperPlane, FaUser, FaEnvelope, FaTag, FaComment, FaCheckCircle, FaTimesCircle, FaMapMarkerAlt, FaPhoneAlt } from 'react-icons/fa';
import Popup from '../components/popup';
import '../App.css';

// KitchenCraft Branding Palette
const C = {
  red: '#CC1B1B',
  redDark: '#A01212',
  charcoal: '#1e1e1e',
  white: '#ffffff',
  lightGray: '#f7f7f7',
  border: '#e8e8e8',
  gray: '#888888',
  redLight: '#fdf2f2',
  gradient: 'linear-gradient(135deg, #CC1B1B 0%, #A01212 100%)',
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const showSuccessPopup = (message) => {
    setPopupConfig({
      show: true,
      title: "Success",
      headerClass: "text-white border-0",
      content: (
        <div className="text-center py-3">
          <FaCheckCircle style={{ color: C.red }} size={60} className="mb-3" />
          <h4 style={{ color: C.charcoal, fontWeight: 700 }}>Message Received!</h4>
          <p style={{ color: C.gray }}>{message || "We will get back to you shortly."}</p>
        </div>
      ),
      footerContent: (
        <Button onClick={hidePopup} style={{ background: C.gradient, border: 'none' }} className="w-100 py-2">
          Close
        </Button>
      )
    });
  };

  const showErrorPopup = (message) => {
    setPopupConfig({
      show: true,
      title: "Error",
      headerClass: "bg-dark text-white border-0",
      content: (
        <div className="text-center py-3">
          <FaTimesCircle className="text-danger mb-3" size={60} />
          <h4 style={{ color: C.charcoal, fontWeight: 700 }}>Something went wrong</h4>
          <p style={{ color: C.gray }}>{message}</p>
        </div>
      ),
      footerContent: <Button variant="secondary" onClick={hidePopup} className="w-100">Try Again</Button>
    });
  };

  const hidePopup = () => setPopupConfig(prev => ({ ...prev, show: false }));

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/contactUs`, formData);
      showSuccessPopup(response.data.message);
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      showErrorPopup(error.response?.data?.error || "Connection error. Please try later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ background: C.white, minHeight: '100vh', fontFamily: "'Barlow', sans-serif" }}>
      {/* Visual Header Section */}
      <div style={{ 
        background: C.lightGray, 
        padding: '4rem 0 3rem', 
        borderBottom: `1px solid ${C.border}`,
        position: 'relative'
      }}>
        <Container className="text-center">
          <h6 style={{ color: C.red, letterSpacing: '3px', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.8rem' }}>
            Get In Touch
          </h6>
          <h1 style={{ fontWeight: 800, color: C.charcoal, fontSize: '3.5rem', margin: '10px 0' }}>
            Contact <span style={{ color: C.red }}>Us</span>
          </h1>
          <div style={{ width: '60px', height: '4px', background: C.red, margin: '20px auto' }} />
          <p style={{ color: C.gray, maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem' }}>
            Have questions about our cookware or an existing order? Our culinary support team is here to help you.
          </p>
        </Container>
      </div>

      <Container className="py-5">
        <Row className="g-5">
          {/* Left Side: Contact Info Cards */}
          <Col lg={4}>
            <div className="d-flex flex-column gap-4">
              <Card className="border-0 shadow-sm p-3" style={{ borderRadius: '15px' }}>
                <Card.Body className="d-flex align-items-center gap-3">
                  <div style={{ background: C.redLight, padding: '15px', borderRadius: '12px' }}>
                    <FaEnvelope style={{ color: C.red }} size={24} />
                  </div>
                  <div>
                    <h6 className="mb-1" style={{ fontWeight: 700, color: C.charcoal }}>Email Us</h6>
                    <p className="mb-0 text-muted">support@kitchencraft.com</p>
                  </div>
                </Card.Body>
              </Card>

              <Card className="border-0 shadow-sm p-3" style={{ borderRadius: '15px' }}>
                <Card.Body className="d-flex align-items-center gap-3">
                  <div style={{ background: C.redLight, padding: '15px', borderRadius: '12px' }}>
                    <FaPhoneAlt style={{ color: C.red }} size={24} />
                  </div>
                  <div>
                    <h6 className="mb-1" style={{ fontWeight: 700, color: C.charcoal }}>Call Us</h6>
                    <p className="mb-0 text-muted">{process.env.REACT_APP_WHATSAPP_ADMIN_NUMBER}</p>
                  </div>
                </Card.Body>
              </Card>

              <Card className="border-0 shadow-sm p-3" style={{ borderRadius: '15px' }}>
                <Card.Body className="d-flex align-items-center gap-3">
                  <div style={{ background: C.redLight, padding: '15px', borderRadius: '12px' }}>
                    <FaMapMarkerAlt style={{ color: C.red }} size={24} />
                  </div>
                  <div>
                    <h6 className="mb-1" style={{ fontWeight: 700, color: C.charcoal }}>Visit Store</h6>
                    <p className="mb-0 text-muted">Gulshan-e-Iqbal, Karachi, PK</p>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </Col>

          {/* Right Side: Main Contact Form */}
          <Col lg={8}>
            <Card className="border-0 shadow-lg p-2 p-md-4" style={{ borderRadius: '20px', borderTop: `5px solid ${C.red}` }}>
              <Card.Body>
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label style={{ fontWeight: 600, color: C.charcoal }}>Full Name</Form.Label>
                        <div className="position-relative">
                          <FaUser className="position-absolute" style={{ left: '15px', top: '18px', color: C.gray }} />
                          <Form.Control
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="John Doe"
                            style={{ paddingLeft: '45px', height: '55px', borderRadius: '10px', backgroundColor: C.lightGray, border: 'none' }}
                          />
                        </div>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label style={{ fontWeight: 600, color: C.charcoal }}>Email Address</Form.Label>
                        <div className="position-relative">
                          <FaEnvelope className="position-absolute" style={{ left: '15px', top: '18px', color: C.gray }} />
                          <Form.Control
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="john@example.com"
                            style={{ paddingLeft: '45px', height: '55px', borderRadius: '10px', backgroundColor: C.lightGray, border: 'none' }}
                          />
                        </div>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-4">
                    <Form.Label style={{ fontWeight: 600, color: C.charcoal }}>Subject</Form.Label>
                    <div className="position-relative">
                      <FaTag className="position-absolute" style={{ left: '15px', top: '18px', color: C.gray }} />
                      <Form.Control
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        placeholder="How can we help?"
                        style={{ paddingLeft: '45px', height: '55px', borderRadius: '10px', backgroundColor: C.lightGray, border: 'none' }}
                      />
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label style={{ fontWeight: 600, color: C.charcoal }}>Your Message</Form.Label>
                    <div className="position-relative">
                      <FaComment className="position-absolute" style={{ left: '15px', top: '18px', color: C.gray }} />
                      <Form.Control
                        as="textarea"
                        rows={5}
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        placeholder="Describe your inquiry in detail..."
                        style={{ paddingLeft: '45px', borderRadius: '10px', backgroundColor: C.lightGray, border: 'none', paddingTop: '15px' }}
                      />
                    </div>
                  </Form.Group>

                  <div className="text-end">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      style={{
                        background: C.gradient,
                        border: 'none',
                        padding: '15px 40px',
                        borderRadius: '10px',
                        fontWeight: 700,
                        fontSize: '1rem',
                        transition: 'transform 0.2s'
                      }}
                      className="submit-btn shadow"
                    >
                      {isSubmitting ? (
                        <><Spinner size="sm" className="me-2" /> Sending...</>
                      ) : (
                        <><FaPaperPlane className="me-2" /> Send Message</>
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Reusable Popup Component */}
      <Popup
        show={popupConfig.show}
        onHide={hidePopup}
        title={popupConfig.title}
        headerClass={popupConfig.headerClass}
        footerContent={popupConfig.footerContent}
        centered
      >
        {popupConfig.content}
      </Popup>
    </div>
  );
};

export default ContactUs;