import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Spinner, Alert, Badge } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaQuestionCircle } from 'react-icons/fa';
import axios from 'axios';

// Navbar color palette
const logoColors = {
  primary: '#fe7e8b',
  secondary: '#e65c70',
  light: '#ffd1d4',
  dark: '#d64555',
  background: '#fff5f6',
  gradient: 'linear-gradient(135deg, #fe7e8b 0%, #e65c70 100%)',
};

export default function FAQManagement() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    isActive: true,
    order: 0
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/faqs/admin`);
      setFaqs(res.data);
    } catch (err) {
      console.error('Error fetching FAQs:', err);
      setError('Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (faq = null) => {
    if (faq) {
      setEditingFaq(faq);
      setFormData({
        question: faq.question,
        answer: faq.answer,
        isActive: faq.isActive,
        order: faq.order || 0
      });
    } else {
      setEditingFaq(null);
      setFormData({
        question: '',
        answer: '',
        isActive: true,
        order: 0
      });
    }
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingFaq(null);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingFaq) {
        await axios.put(`${process.env.REACT_APP_API_URL}/api/faqs/${editingFaq._id}`, formData);
        setSuccess('FAQ updated successfully!');
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/faqs`, formData);
        setSuccess('FAQ created successfully!');
      }
      setTimeout(() => {
        fetchFAQs();
        handleCloseModal();
      }, 1000);
    } catch (err) {
      console.error('Error saving FAQ:', err.response || err);
      setError(err.response?.data?.message || 'Error saving FAQ');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this FAQ?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/faqs/${id}`);
        fetchFAQs();
      } catch (err) {
        console.error('Error deleting FAQ:', err);
        setError('Error deleting FAQ');
      }
    }
  };

  const handleToggleActive = async (faq) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/faqs/${faq._id}`, {
        isActive: !faq.isActive
      });
      fetchFAQs();
    } catch (err) {
      console.error('Error updating FAQ:', err);
      setError('Error updating FAQ');
    }
  };

  if (loading) {
    return (
      <Container fluid className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', background: logoColors.background }}>
        <Spinner animation="border" style={{ color: logoColors.primary }} />
      </Container>
    );
  }

  return (
    <Container fluid className="py-4" style={{ background: logoColors.background, minHeight: '100vh' }}>
      <Container>
        <Row className="mb-4">
          <Col>
            <h2 style={{ color: '#2D3748', fontWeight: 600 }}>FAQ Management</h2>
            <p style={{ color: '#718096' }}>Manage frequently asked questions and answers</p>
          </Col>
          <Col className="text-end">
            <Button
              onClick={() => handleOpenModal()}
              style={{
                background: logoColors.gradient,
                border: 'none',
                padding: '0.6rem 1.5rem',
                borderRadius: '8px'
              }}
            >
              <FaPlus className="me-2" /> Add FAQ
            </Button>
          </Col>
        </Row>

        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        {faqs.length === 0 ? (
          <div className="text-center my-5 py-5">
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: logoColors.light,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem'
            }}>
              <FaQuestionCircle size={32} style={{ color: logoColors.primary }} />
            </div>
            <h4 style={{ color: logoColors.dark, marginBottom: '0.5rem' }}>
              No FAQs Found
            </h4>
            <p style={{ color: '#718096', fontSize: '1rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
              You haven't created any FAQs yet. Add frequently asked questions to help customers.
            </p>
            <Button
              onClick={() => handleOpenModal()}
              style={{
                background: logoColors.gradient,
                border: 'none',
                padding: '0.6rem 1.5rem',
                borderRadius: '8px'
              }}
            >
              <FaPlus className="me-2" /> Create Your First FAQ
            </Button>
          </div>
        ) : (
          <Row className="g-4">
            {faqs.map(faq => (
              <Col key={faq._id} xs={12} md={6} lg={4}>
                <Card style={{ borderRadius: '12px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <Badge
                        style={{
                          background: faq.isActive ? '#38A169' : '#E53E3E',
                          padding: '4px 8px',
                          fontSize: '0.7rem'
                        }}
                      >
                        {faq.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <div className="d-flex gap-2">
                        <button
                          className="btn p-1"
                          style={{ color: logoColors.primary }}
                          onClick={() => handleOpenModal(faq)}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="btn p-1"
                          style={{ color: '#E53E3E' }}
                          onClick={() => handleDelete(faq._id)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                    
                    <h5 style={{ color: '#2D3748', marginBottom: '0.5rem', fontSize: '1rem' }}>
                      {faq.question}
                    </h5>
                    <p style={{ color: '#718096', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                      {faq.answer.length > 100 ? `${faq.answer.substring(0, 100)}...` : faq.answer}
                    </p>
                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <span style={{ fontSize: '0.75rem', color: '#A0AEC0' }}>
                        Order: {faq.order || 0}
                      </span>
                      <Form.Check
                        type="switch"
                        id={`faq-active-${faq._id}`}
                        label={faq.isActive ? 'Active' : 'Inactive'}
                        checked={faq.isActive}
                        onChange={() => handleToggleActive(faq)}
                        style={{ fontSize: '0.75rem' }}
                      />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>

      {/* Modal for Create/Edit FAQ */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton style={{ borderBottom: '1px solid #E2E8F0' }}>
          <Modal.Title style={{ color: '#2D3748' }}>
            {editingFaq ? 'Edit FAQ' : 'Create New FAQ'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
            
            <Form.Group className="mb-3">
              <Form.Label style={{ color: '#4A5568', fontWeight: 500 }}>Question</Form.Label>
              <Form.Control
                type="text"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                placeholder="Enter frequently asked question"
                required
                style={{ borderRadius: '8px' }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ color: '#4A5568', fontWeight: 500 }}>Answer</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                placeholder="Enter the answer"
                required
                style={{ borderRadius: '8px' }}
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ color: '#4A5568', fontWeight: 500 }}>Display Order</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    style={{ borderRadius: '8px' }}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3 d-flex align-items-center h-100">
                  <Form.Check
                    type="switch"
                    id="faq-active-switch"
                    label="Active"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    style={{ fontSize: '0.9rem' }}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer style={{ borderTop: '1px solid #E2E8F0' }}>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              style={{
                background: logoColors.gradient,
                border: 'none'
              }}
            >
              {editingFaq ? 'Update FAQ' : 'Create FAQ'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

