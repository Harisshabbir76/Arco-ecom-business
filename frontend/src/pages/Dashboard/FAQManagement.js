import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Spinner, Alert, Badge } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaQuestionCircle, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const C = {
  red:       '#CC1B1B',
  redDark:   '#A01212',
  redDeep:   '#7A0C0C',
  redLight:  '#fdf2f2',
  charcoal:  '#1e1e1e',
  white:     '#ffffff',
  lightGray: '#f7f7f7',
  border:    '#e8e8e8',
  gray:      '#888888',
  gradient:  'linear-gradient(135deg, #CC1B1B 0%, #A01212 100%)',
};

export default function FAQManagement() {
  const navigate = useNavigate();
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

  const activeCount = faqs.filter(f => f.isActive).length;
  const inactiveCount = faqs.filter(f => !f.isActive).length;

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner animation="border" style={{ color: C.red, width: '2.5rem', height: '2.5rem', borderWidth: '3px' }} />
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;500;600;700&display=swap');
        
        .faq-page {
          min-height: 100vh;
          background: ${C.white};
          font-family: 'Barlow', sans-serif;
        }

        .form-control:focus, .form-select:focus {
          border-color: ${C.red};
          box-shadow: 0 0 0 0.2rem ${C.red}20;
        }
      `}</style>

      <div className="faq-page" style={{ padding: '2rem 0' }}>
        <Container>
          {/* Back Button */}
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'none',
              border: 'none',
              color: C.red,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.5rem',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 500
            }}
            onMouseEnter={(e) => e.target.style.opacity = '0.8'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >
            <FaArrowLeft size={16} /> Back to Dashboard
          </button>

          {/* Header */}
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                fontSize: '0.68rem',
                fontWeight: 600,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: C.red,
                marginBottom: '0.5rem'
              }}>
                <span style={{ width: '5px', height: '5px', background: C.red, borderRadius: '50%' }} />
                Management
              </div>
              <h1 style={{
                margin: 0,
                fontWeight: 700,
                fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                color: C.charcoal,
                lineHeight: 1.2
              }}>
                FAQ Management
              </h1>
              <div style={{
                height: '3px',
                width: '60px',
                background: C.red,
                borderRadius: '2px',
                marginTop: '0.5rem'
              }} />
              <p style={{ color: C.gray, fontSize: '0.85rem', marginTop: '0.5rem' }}>
                Manage frequently asked questions and answers
              </p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              style={{
                background: C.gradient,
                border: 'none',
                borderRadius: '30px',
                padding: '0.6rem 1.25rem',
                color: C.white,
                fontWeight: 600,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = `0 4px 12px ${C.red}40`;
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <FaPlus size={14} /> Add FAQ
            </button>
          </div>

          {/* Stats Cards */}
          <Row className="g-3 mb-4">
            <Col md={4}>
              <div style={{
                background: C.redLight,
                borderRadius: '12px',
                padding: '1rem',
                border: `1px solid ${C.border}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: C.gray, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total FAQs</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: C.red }}>{faqs.length}</div>
                  </div>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: C.white,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FaQuestionCircle size={24} color={C.red} />
                  </div>
                </div>
              </div>
            </Col>
            <Col md={4}>
              <div style={{
                background: C.white,
                borderRadius: '12px',
                padding: '1rem',
                border: `1px solid ${C.border}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: C.gray, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10B981' }}>{activeCount}</div>
                  </div>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: C.redLight,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FaQuestionCircle size={24} color={C.red} />
                  </div>
                </div>
              </div>
            </Col>
            <Col md={4}>
              <div style={{
                background: C.white,
                borderRadius: '12px',
                padding: '1rem',
                border: `1px solid ${C.border}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: C.gray, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Inactive</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: C.gray }}>{inactiveCount}</div>
                  </div>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: C.redLight,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FaQuestionCircle size={24} color={C.gray} />
                  </div>
                </div>
              </div>
            </Col>
          </Row>

          {error && (
            <Alert variant="danger" className="mb-4" style={{ borderLeft: `4px solid ${C.red}`, borderRadius: '6px' }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert variant="success" className="mb-4" style={{ borderLeft: `4px solid #10B981`, borderRadius: '6px' }}>
              {success}
            </Alert>
          )}

          {/* FAQs Grid */}
          {faqs.length === 0 ? (
            <div className="text-center py-5">
              <div style={{
                width: '80px',
                height: '80px',
                background: C.redLight,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}>
                <FaQuestionCircle size={32} color={C.red} />
              </div>
              <h4 style={{ color: C.charcoal, marginBottom: '0.5rem' }}>No FAQs Found</h4>
              <p style={{ color: C.gray, marginBottom: '1rem' }}>
                You haven't created any FAQs yet. Add frequently asked questions to help customers.
              </p>
              <button
                onClick={() => handleOpenModal()}
                style={{
                  background: C.gradient,
                  border: 'none',
                  borderRadius: '30px',
                  padding: '0.6rem 1.5rem',
                  color: C.white,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <FaPlus className="me-2" size={12} /> Create Your First FAQ
              </button>
            </div>
          ) : (
            <Row className="g-4">
              {faqs.map(faq => (
                <Col key={faq._id} xs={12} md={6} lg={4}>
                  <div style={{
                    background: C.white,
                    borderRadius: '12px',
                    border: `1px solid ${C.border}`,
                    overflow: 'hidden',
                    transition: 'transform 0.25s ease, box-shadow 0.25s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = `0 12px 28px ${C.red}20`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}>
                    <div style={{ padding: '1rem', borderBottom: `1px solid ${C.border}`, background: C.redLight }}>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <Badge
                            style={{
                              background: faq.isActive ? '#10B981' : C.gray,
                              padding: '4px 10px',
                              fontSize: '0.65rem',
                              fontWeight: 600,
                              borderRadius: '20px'
                            }}
                          >
                            {faq.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <div className="d-flex gap-2">
                          <button
                            onClick={() => handleOpenModal(faq)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: C.red,
                              cursor: 'pointer',
                              padding: '4px'
                            }}
                            title="Edit"
                          >
                            <FaEdit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(faq._id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#dc3545',
                              cursor: 'pointer',
                              padding: '4px'
                            }}
                            title="Delete"
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ padding: '1rem' }}>
                      <h5 style={{ color: C.charcoal, marginBottom: '0.5rem', fontSize: '0.95rem', fontWeight: 600 }}>
                        {faq.question}
                      </h5>
                      <p style={{ color: C.gray, fontSize: '0.8rem', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                        {faq.answer.length > 100 ? `${faq.answer.substring(0, 100)}...` : faq.answer}
                      </p>
                      <div className="d-flex justify-content-between align-items-center mt-2 pt-2" style={{ borderTop: `1px solid ${C.border}` }}>
                        <span style={{ fontSize: '0.7rem', color: C.gray }}>
                          Order: {faq.order || 0}
                        </span>
                        <Form.Check
                          type="switch"
                          id={`faq-active-${faq._id}`}
                          label=""
                          checked={faq.isActive}
                          onChange={() => handleToggleActive(faq)}
                          style={{ fontSize: '0.75rem' }}
                        />
                      </div>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          )}

          {/* Footer Stats */}
          <div className="mt-4 text-center">
            <p style={{ color: C.gray, fontSize: '0.75rem', margin: 0 }}>
              Total {faqs.length} FAQ{faqs.length !== 1 ? 's' : ''} · {activeCount} active · {inactiveCount} inactive
            </p>
          </div>
        </Container>

        {/* Modal for Create/Edit FAQ */}
        <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
          <Modal.Header closeButton style={{ borderBottom: `1px solid ${C.border}` }}>
            <Modal.Title style={{ color: C.charcoal, fontWeight: 600, fontFamily: 'Barlow, sans-serif' }}>
              {editingFaq ? 'Edit FAQ' : 'Create New FAQ'}
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body style={{ padding: '1.5rem' }}>
              {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
              
              <Form.Group className="mb-3">
                <Form.Label style={{ color: C.charcoal, fontWeight: 500 }}>Question</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="Enter frequently asked question"
                  required
                  style={{
                    borderRadius: '8px',
                    borderColor: C.border,
                    padding: '0.6rem 1rem'
                  }}
                  onFocus={(e) => e.target.style.borderColor = C.red}
                  onBlur={(e) => e.target.style.borderColor = C.border}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label style={{ color: C.charcoal, fontWeight: 500 }}>Answer</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  placeholder="Enter the answer"
                  required
                  style={{
                    borderRadius: '8px',
                    borderColor: C.border,
                    padding: '0.6rem 1rem',
                    resize: 'vertical'
                  }}
                  onFocus={(e) => e.target.style.borderColor = C.red}
                  onBlur={(e) => e.target.style.borderColor = C.border}
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: C.charcoal, fontWeight: 500 }}>Display Order</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                      style={{
                        borderRadius: '8px',
                        borderColor: C.border,
                        padding: '0.6rem 1rem'
                      }}
                      onFocus={(e) => e.target.style.borderColor = C.red}
                      onBlur={(e) => e.target.style.borderColor = C.border}
                    />
                    <Form.Text className="text-muted" style={{ color: C.gray, fontSize: '0.7rem' }}>
                      Lower numbers appear first
                    </Form.Text>
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
                      style={{ fontSize: '0.9rem', color: C.charcoal }}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer style={{ borderTop: `1px solid ${C.border}` }}>
              <button
                type="button"
                onClick={handleCloseModal}
                style={{
                  background: C.white,
                  border: `1.5px solid ${C.border}`,
                  borderRadius: '30px',
                  padding: '0.5rem 1.25rem',
                  color: C.gray,
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  background: C.gradient,
                  border: 'none',
                  borderRadius: '30px',
                  padding: '0.5rem 1.5rem',
                  color: C.white,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = `0 4px 12px ${C.red}40`;
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                {editingFaq ? 'Update FAQ' : 'Create FAQ'}
              </button>
            </Modal.Footer>
          </Form>
        </Modal>
      </div>
    </>
  );
}