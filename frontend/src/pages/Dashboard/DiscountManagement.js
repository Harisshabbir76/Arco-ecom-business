import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Table, Button, Form, Modal, Card, Spinner, Alert, Row, Col, Badge } from 'react-bootstrap';
import { FiPlus, FiEdit2, FiTrash2, FiInfo, FiTag, FiPercent, FiDollarSign, FiBox, FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

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

export default function DiscountManagement() {
  const navigate = useNavigate();
  const [discounts, setDiscounts] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    code: '',
    type: 'COUPON',
    description: '',
    discountPercent: '',
    minAmount: '',
    buyQty: '',
    getQty: '',
    targetProducts: [],
    targetCategories: [],
    isActive: true
  });

  const fetchData = async () => {
    try {
      const [discRes, prodRes, catRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/api/discounts`),
        axios.get(`${process.env.REACT_APP_API_URL}/catalog`),
        axios.get(`${process.env.REACT_APP_API_URL}/api/categories`)
      ]);
      setDiscounts(discRes.data);
      setProducts(Array.isArray(prodRes.data) ? prodRes.data : (prodRes.data.products || []));
      setCategories(catRes.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (discount = null) => {
    if (discount) {
      setEditingDiscount(discount);
      setFormData({
        ...discount,
        targetProducts: discount.targetProducts || [],
        targetCategories: discount.targetCategories || []
      });
    } else {
      setEditingDiscount(null);
      setFormData({
        code: '',
        type: 'COUPON',
        description: '',
        discountPercent: '',
        minAmount: '',
        buyQty: '',
        getQty: '',
        targetProducts: [],
        targetCategories: [],
        isActive: true
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (editingDiscount) {
        await axios.put(`${process.env.REACT_APP_API_URL}/api/discounts/${editingDiscount._id}`, formData);
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/discounts`, formData);
      }
      fetchData();
      setShowModal(false);
    } catch (err) {
      setError('Failed to save discount');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this discount?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/discounts/${id}`);
        fetchData();
      } catch (err) {
        setError('Failed to delete discount');
      }
    }
  };

  const getDiscountDetails = (disc) => {
    if (disc.type === 'COUPON') {
      return `${disc.discountPercent}% OFF`;
    } else if (disc.type === 'SPEND_X_GET_Y') {
      return `Min Rs. ${disc.minAmount} → ${disc.discountPercent}% OFF`;
    } else if (disc.type === 'BUY_X_GET_Y') {
      return `Buy ${disc.buyQty} Get ${disc.getQty} FREE`;
    }
    return '';
  };

  const getDiscountIcon = (type) => {
    if (type === 'COUPON') return <FiTag size={14} />;
    if (type === 'SPEND_X_GET_Y') return <FiDollarSign size={14} />;
    return <FiBox size={14} />;
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="text-center">
          <Spinner animation="border" style={{ color: C.red, width: '2.5rem', height: '2.5rem', borderWidth: '3px' }} />
          <p className="mt-3" style={{ color: C.gray }}>Loading discounts...</p>
        </div>
      </div>
    );
  }

  const activeCount = discounts.filter(d => d.isActive).length;
  const couponCount = discounts.filter(d => d.type === 'COUPON').length;
  const autoCount = discounts.filter(d => d.type !== 'COUPON').length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;500;600;700&display=swap');
        
        .discount-page {
          min-height: 100vh;
          background: ${C.white};
          font-family: 'Barlow', sans-serif;
        }

        .form-control:focus, .form-select:focus {
          border-color: ${C.red};
          box-shadow: 0 0 0 0.2rem ${C.red}20;
        }

        .discount-table th {
          font-weight: 600;
          font-size: 0.75rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: ${C.gray};
          background: ${C.redLight};
          border-bottom: 1.5px solid ${C.border};
          padding: 1rem;
        }

        .discount-table td {
          padding: 1rem;
          vertical-align: middle;
          border-bottom: 1px solid ${C.border};
        }

        .discount-table tbody tr:hover {
          background: ${C.redLight};
        }
      `}</style>

      <div className="discount-page" style={{ padding: '2rem 0' }}>
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
            <FiArrowLeft size={16} /> Back to Dashboard
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
                Discount & Coupon Management
              </h1>
              <div style={{
                height: '3px',
                width: '60px',
                background: C.red,
                borderRadius: '2px',
                marginTop: '0.5rem'
              }} />
              <p style={{ color: C.gray, fontSize: '0.85rem', marginTop: '0.5rem' }}>
                Create and manage promotional discounts and coupons
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
              <FiPlus size={16} /> Add Discount
            </button>
          </div>

          {error && (
            <Alert variant="danger" className="mb-4" style={{ borderLeft: `4px solid ${C.red}`, borderRadius: '6px' }}>
              {error}
            </Alert>
          )}

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
                    <div style={{ fontSize: '0.7rem', color: C.gray, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Discounts</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: C.red }}>{discounts.length}</div>
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
                    <FiTag size={24} color={C.red} />
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
                    <FiPercent size={24} color={C.red} />
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
                    <div style={{ fontSize: '0.7rem', color: C.gray, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Auto Offers</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: C.charcoal }}>{autoCount}</div>
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
                    <FiBox size={24} color={C.red} />
                  </div>
                </div>
              </div>
            </Col>
          </Row>

          {/* Discounts Table */}
          <Card className="border-0 shadow-sm" style={{ borderRadius: '12px', border: `1px solid ${C.border}`, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="discount-table w-100">
                <thead>
                  <tr>
                    <th style={{ paddingLeft: '1.5rem' }}>Code / Name</th>
                    <th>Type</th>
                    <th>Details</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right', paddingRight: '1.5rem' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {discounts.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-5" style={{ color: C.gray }}>
                        No discounts found. Click "Add Discount" to create one.
                      </td>
                    </tr>
                  ) : (
                    discounts.map((disc) => (
                      <tr key={disc._id}>
                        <td style={{ paddingLeft: '1.5rem' }}>
                          <div style={{ fontWeight: 600, color: C.charcoal, marginBottom: '0.25rem' }}>
                            {disc.code || 'Auto-Offer'}
                          </div>
                          <small style={{ color: C.gray, fontSize: '0.7rem' }}>{disc.description}</small>
                        </td>
                        <td>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: C.redLight,
                            color: C.red,
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '0.7rem',
                            fontWeight: 600
                          }}>
                            {getDiscountIcon(disc.type)}
                            {disc.type.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td>
                          <span style={{ color: C.charcoal, fontWeight: 500 }}>
                            {getDiscountDetails(disc)}
                          </span>
                        </td>
                        <td>
                          <span style={{
                            display: 'inline-block',
                            background: disc.isActive ? '#10B981' : C.gray,
                            color: C.white,
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '0.7rem',
                            fontWeight: 600
                          }}>
                            {disc.isActive ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', paddingRight: '1.5rem' }}>
                          <button
                            onClick={() => handleOpenModal(disc)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: C.red,
                              cursor: 'pointer',
                              padding: '0.5rem',
                              transition: 'opacity 0.2s'
                            }}
                            title="Edit"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(disc._id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#dc3545',
                              cursor: 'pointer',
                              padding: '0.5rem',
                              transition: 'opacity 0.2s'
                            }}
                            title="Delete"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Footer Stats */}
          <div className="mt-4 text-center">
            <p style={{ color: C.gray, fontSize: '0.75rem', margin: 0 }}>
              Total {discounts.length} discount{discounts.length !== 1 ? 's' : ''} · {couponCount} coupon{discounts.length !== 1 ? 's' : ''} · {autoCount} auto offer{discounts.length !== 1 ? 's' : ''}
            </p>
          </div>
        </Container>

        {/* Add/Edit Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
          <Modal.Header closeButton style={{ borderBottom: `1px solid ${C.border}` }}>
            <Modal.Title style={{ color: C.charcoal, fontWeight: 600, fontFamily: 'Barlow, sans-serif' }}>
              {editingDiscount ? 'Edit Discount' : 'Add New Discount'}
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body style={{ padding: '1.5rem' }}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: C.charcoal, fontWeight: 500 }}>Discount Type</Form.Label>
                    <Form.Select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      style={{
                        borderRadius: '8px',
                        borderColor: C.border,
                        padding: '0.6rem 1rem'
                      }}
                    >
                      <option value="COUPON">Coupon (Code Required)</option>
                      <option value="SPEND_X_GET_Y">Spend X Get Y (Automatic)</option>
                      <option value="BUY_X_GET_Y">Buy X Get Y (Bundle)</option>
                    </Form.Select>
                  </Form.Group>

                  {formData.type === 'COUPON' && (
                    <Form.Group className="mb-3">
                      <Form.Label style={{ color: C.charcoal, fontWeight: 500 }}>Coupon Code</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="e.g., SUMMER25"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        required
                        style={{
                          borderRadius: '8px',
                          borderColor: C.border,
                          padding: '0.6rem 1rem'
                        }}
                      />
                    </Form.Group>
                  )}

                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: C.charcoal, fontWeight: 500 }}>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief description of this discount"
                      style={{
                        borderRadius: '8px',
                        borderColor: C.border,
                        padding: '0.6rem 1rem',
                        resize: 'vertical'
                      }}
                    />
                  </Form.Group>

                  <Row>
                    {(formData.type === 'COUPON' || formData.type === 'SPEND_X_GET_Y') && (
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label style={{ color: C.charcoal, fontWeight: 500 }}>Discount %</Form.Label>
                          <Form.Control
                            type="number"
                            value={formData.discountPercent}
                            onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                            required
                            style={{
                              borderRadius: '8px',
                              borderColor: C.border,
                              padding: '0.6rem 1rem'
                            }}
                          />
                        </Form.Group>
                      </Col>
                    )}
                    {formData.type === 'SPEND_X_GET_Y' && (
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label style={{ color: C.charcoal, fontWeight: 500 }}>Minimum Spend (Rs.)</Form.Label>
                          <Form.Control
                            type="number"
                            value={formData.minAmount}
                            onChange={(e) => setFormData({ ...formData, minAmount: e.target.value })}
                            required
                            style={{
                              borderRadius: '8px',
                              borderColor: C.border,
                              padding: '0.6rem 1rem'
                            }}
                          />
                        </Form.Group>
                      </Col>
                    )}
                    {formData.type === 'BUY_X_GET_Y' && (
                      <>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label style={{ color: C.charcoal, fontWeight: 500 }}>Buy Quantity</Form.Label>
                            <Form.Control
                              type="number"
                              value={formData.buyQty}
                              onChange={(e) => setFormData({ ...formData, buyQty: e.target.value })}
                              required
                              style={{
                                borderRadius: '8px',
                                borderColor: C.border,
                                padding: '0.6rem 1rem'
                              }}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label style={{ color: C.charcoal, fontWeight: 500 }}>Get Quantity Free</Form.Label>
                            <Form.Control
                              type="number"
                              value={formData.getQty}
                              onChange={(e) => setFormData({ ...formData, getQty: e.target.value })}
                              required
                              style={{
                                borderRadius: '8px',
                                borderColor: C.border,
                                padding: '0.6rem 1rem'
                              }}
                            />
                          </Form.Group>
                        </Col>
                      </>
                    )}
                  </Row>

                  <Form.Check
                    type="switch"
                    className="mt-2"
                    label="Is Active"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    style={{ color: C.charcoal }}
                  />
                </Col>

                <Col md={6}>
                  <Card className="border-0" style={{ background: C.redLight, borderRadius: '12px' }}>
                    <Card.Body>
                      <h6 className="mb-3 d-flex align-items-center" style={{ color: C.charcoal, fontWeight: 600 }}>
                        <FiInfo className="me-2" style={{ color: C.red }} /> Targeting (Optional)
                      </h6>

                      <Form.Group className="mb-3">
                        <Form.Label className="small" style={{ color: C.charcoal, fontWeight: 500 }}>Target Categories</Form.Label>
                        <div style={{ maxHeight: '120px', overflowY: 'auto' }} className="border rounded p-2 bg-white">
                          {categories.length === 0 ? (
                            <p className="text-muted small mb-0">No categories available</p>
                          ) : (
                            categories.map(cat => (
                              <Form.Check
                                key={cat._id}
                                type="checkbox"
                                label={cat.name}
                                checked={formData.targetCategories.includes(cat.name)}
                                onChange={(e) => {
                                  const newCats = e.target.checked
                                    ? [...formData.targetCategories, cat.name]
                                    : formData.targetCategories.filter(c => c !== cat.name);
                                  setFormData({ ...formData, targetCategories: newCats });
                                }}
                              />
                            ))
                          )}
                        </div>
                      </Form.Group>

                      <Form.Group className="mb-0">
                        <Form.Label className="small" style={{ color: C.charcoal, fontWeight: 500 }}>Target Products</Form.Label>
                        <div style={{ maxHeight: '150px', overflowY: 'auto' }} className="border rounded p-2 bg-white">
                          {products.length === 0 ? (
                            <p className="text-muted small mb-0">No products available</p>
                          ) : (
                            products.slice(0, 50).map(prod => (
                              <Form.Check
                                key={prod._id}
                                type="checkbox"
                                label={prod.name.length > 40 ? prod.name.substring(0, 40) + '...' : prod.name}
                                checked={formData.targetProducts.includes(prod._id)}
                                onChange={(e) => {
                                  const newProds = e.target.checked
                                    ? [...formData.targetProducts, prod._id]
                                    : formData.targetProducts.filter(p => p !== prod._id);
                                  setFormData({ ...formData, targetProducts: newProds });
                                }}
                              />
                            ))
                          )}
                        </div>
                      </Form.Group>
                      <small className="text-muted mt-2 d-block" style={{ color: C.gray }}>
                        Leave both empty to apply discount to all products.
                      </small>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer style={{ borderTop: `1px solid ${C.border}` }}>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{
                  background: C.white,
                  border: `1.5px solid ${C.border}`,
                  borderRadius: '30px',
                  padding: '0.5rem 1.25rem',
                  color: C.gray,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = C.red;
                  e.target.style.color = C.red;
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = C.border;
                  e.target.style.color = C.gray;
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  background: C.gradient,
                  border: 'none',
                  borderRadius: '30px',
                  padding: '0.5rem 1.5rem',
                  color: C.white,
                  fontWeight: 600,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.7 : 1,
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = `0 4px 12px ${C.red}40`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              >
                {isSubmitting ? 'Saving...' : (editingDiscount ? 'Update Discount' : 'Create Discount')}
              </button>
            </Modal.Footer>
          </Form>
        </Modal>
      </div>
    </>
  );
}