import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaTimes, FaGift, FaBox, FaTag, FaClock, FaArrowLeft } from 'react-icons/fa';
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

export default function BundleManagement() {
  const navigate = useNavigate();
  const [bundles, setBundles] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBundle, setEditingBundle] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    productIds: [],
    bundlePrice: 0,
    image: '',
    isActive: true,
    isLifetime: true,
    startDate: '',
    endDate: ''
  });
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    fetchBundles();
    fetchProducts();
  }, []);

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchBundles = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/bundles?all=true`);
      setBundles(res.data);
    } catch (err) {
      console.error('Error fetching bundles:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/products/list`);
      setProducts(res.data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const calculateOriginalPrice = async (productIds) => {
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/bundles/calculate-price`, { productIds });
      setCalculatedPrice(res.data.originalPrice);
      return res.data.originalPrice;
    } catch (err) {
      console.error('Error calculating price:', err);
      return 0;
    }
  };

  // Search products
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim().length > 0) {
      const filtered = products.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) &&
        !formData.productIds.includes(p._id)
      );
      setSearchResults(filtered.slice(0, 5));
      setShowSearchDropdown(true);
    } else {
      setSearchResults([]);
      setShowSearchDropdown(false);
    }
  };

  // Add product to bundle
  const addProduct = async (product) => {
    if (formData.productIds.length >= 4) {
      setError('Maximum 4 products allowed per bundle');
      return;
    }
    const newProductIds = [...formData.productIds, product._id];
    setFormData({ ...formData, productIds: newProductIds });
    setSearchQuery('');
    setShowSearchDropdown(false);
    await calculateOriginalPrice(newProductIds);
    setError('');
  };

  // Remove product from bundle
  const removeProduct = async (productId) => {
    const newProductIds = formData.productIds.filter(id => id !== productId);
    setFormData({ ...formData, productIds: newProductIds });
    if (newProductIds.length > 0) {
      await calculateOriginalPrice(newProductIds);
    } else {
      setCalculatedPrice(0);
    }
  };

  const handleOpenModal = (bundle = null) => {
    if (bundle) {
      setEditingBundle(bundle);
      setFormData({
        name: bundle.name,
        description: bundle.description || '',
        productIds: bundle.products.map(p => p._id),
        bundlePrice: bundle.bundlePrice,
        image: bundle.image || '',
        isActive: bundle.isActive,
        isLifetime: bundle.isLifetime || false,
        startDate: bundle.startDate ? bundle.startDate.split('T')[0] : '',
        endDate: bundle.endDate ? bundle.endDate.split('T')[0] : ''
      });
      calculateOriginalPrice(bundle.products.map(p => p._id));
    } else {
      setEditingBundle(null);
      setFormData({
        name: '',
        description: '',
        productIds: [],
        bundlePrice: 0,
        image: '',
        isActive: true,
        isLifetime: true,
        startDate: '',
        endDate: ''
      });
      setCalculatedPrice(0);
    }
    setSearchQuery('');
    setError('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBundle(null);
    setError('');
    setSuccess('');
    setSearchQuery('');
    setShowSearchDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const submitData = {
        ...formData,
        isLifetime: formData.isLifetime,
        startDate: formData.isLifetime ? null : (formData.startDate || null),
        endDate: formData.isLifetime ? null : (formData.endDate || null)
      };
      
      if (editingBundle) {
        await axios.put(`${process.env.REACT_APP_API_URL}/api/bundles/${editingBundle._id}`, submitData);
        setSuccess('Bundle updated successfully!');
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/bundles`, submitData);
        setSuccess('Bundle created successfully!');
      }
      
      setTimeout(() => {
        fetchBundles();
        handleCloseModal();
      }, 1500);
    } catch (err) {
      console.error('Error saving bundle:', err.response || err);
      setError(err.response?.data?.message || 'Error saving bundle');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this bundle?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/bundles/${id}`);
        fetchBundles();
      } catch (err) {
        console.error('Error deleting bundle:', err);
      }
    }
  };
  
  const handleToggleActive = async (bundle) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/bundles/${bundle._id}`, {
        isActive: !bundle.isActive
      });
      setBundles(prev => prev.map(b => b._id === bundle._id ? { ...b, isActive: !b.isActive } : b));
      setSuccess(`Bundle ${!bundle.isActive ? 'activated' : 'deactivated'} successfully!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error toggling bundle status:', err);
      setError('Failed to update bundle status');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getProductImage = (product) => {
    if (!product?.image?.[0]) return '/placeholder.jpg';
    if (product.image[0].startsWith('http')) return product.image[0];
    return `${process.env.REACT_APP_API_URL}${product.image[0].startsWith('/') ? '' : '/'}${product.image[0]}`;
  };

  const getProductById = (id) => products.find(p => p._id === id) || {};

  const formatTimeline = (bundle) => {
    if (bundle.isLifetime) return 'Lifetime';
    if (!bundle.startDate && !bundle.endDate) return 'Always active';
    
    const start = bundle.startDate ? new Date(bundle.startDate).toLocaleDateString() : 'Now';
    const end = bundle.endDate ? new Date(bundle.endDate).toLocaleDateString() : 'Ongoing';
    return `${start} - ${end}`;
  };

  const isBundleActive = (bundle) => {
    if (!bundle.isActive) return false;
    if (bundle.isLifetime) return true;
    
    const now = new Date();
    const afterStart = !bundle.startDate || now >= new Date(bundle.startDate);
    const beforeEnd = !bundle.endDate || now <= new Date(bundle.endDate);
    return afterStart && beforeEnd;
  };

  const activeCount = bundles.filter(b => b.isActive).length;
  const totalSavings = bundles.reduce((sum, b) => sum + ((b.originalPrice - b.bundlePrice) || 0), 0);

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
        
        .bundle-page {
          min-height: 100vh;
          background: ${C.white};
          font-family: 'Barlow', sans-serif;
        }

        .form-control:focus, .form-select:focus {
          border-color: ${C.red};
          box-shadow: 0 0 0 0.2rem ${C.red}20;
        }
      `}</style>

      <div className="bundle-page" style={{ padding: '2rem 0' }}>
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
                Bundle Management
              </h1>
              <div style={{
                height: '3px',
                width: '60px',
                background: C.red,
                borderRadius: '2px',
                marginTop: '0.5rem'
              }} />
              <p style={{ color: C.gray, fontSize: '0.85rem', marginTop: '0.5rem' }}>
                Create product bundles and offer special discounted prices
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
              <FaPlus size={14} /> Create Bundle
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
                    <div style={{ fontSize: '0.7rem', color: C.gray, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Bundles</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: C.red }}>{bundles.length}</div>
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
                    <FaBox size={24} color={C.red} />
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
                    <div style={{ fontSize: '0.7rem', color: C.gray, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Bundles</div>
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
                    <FaTag size={24} color={C.red} />
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
                    <div style={{ fontSize: '0.7rem', color: C.gray, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Savings</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: C.charcoal }}>Rs. {totalSavings.toLocaleString()}</div>
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
                    <FaGift size={24} color={C.red} />
                  </div>
                </div>
              </div>
            </Col>
          </Row>

          {/* Bundles Grid */}
          {bundles.length === 0 ? (
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
                <FaGift size={32} color={C.red} />
              </div>
              <h4 style={{ color: C.charcoal, marginBottom: '0.5rem' }}>No Bundles Found</h4>
              <p style={{ color: C.gray, marginBottom: '1rem' }}>
                You haven't created any product bundles yet.
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
                <FaPlus className="me-2" size={12} /> Create Your First Bundle
              </button>
            </div>
          ) : (
            <Row className="g-4">
              {bundles.map(bundle => {
                const isActive = isBundleActive(bundle);
                return (
                  <Col key={bundle._id} xs={12} md={6} lg={4}>
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
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h5 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: C.charcoal }}>
                              {bundle.name}
                            </h5>
                            <div className="d-flex gap-2 mt-1">
                              <span style={{
                                fontSize: '0.65rem',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                background: isActive ? '#10B981' : C.gray,
                                color: C.white
                              }}>
                                {isActive ? 'Active' : 'Inactive'}
                              </span>
                              <span style={{ fontSize: '0.65rem', color: C.gray, display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <FaClock size={10} /> {formatTimeline(bundle)}
                              </span>
                            </div>
                          </div>
                          <div className="d-flex gap-1">
                            <Form.Check 
                              type="switch"
                              id={`active-now-${bundle._id}`}
                              checked={bundle.isActive}
                              onChange={() => handleToggleActive(bundle)}
                              style={{ marginRight: '5px' }}
                            />
                            <button
                              onClick={() => handleOpenModal(bundle)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: C.red,
                                cursor: 'pointer',
                                padding: '4px'
                              }}
                            >
                              <FaEdit size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(bundle._id)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#dc3545',
                                cursor: 'pointer',
                                padding: '4px'
                              }}
                            >
                              <FaTrash size={14} />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div style={{ padding: '1rem' }}>
                        {bundle.description && (
                          <p style={{ fontSize: '0.8rem', color: C.gray, marginBottom: '0.75rem' }}>
                            {bundle.description}
                          </p>
                        )}

                        <div className="d-flex gap-1 mb-3">
                          {bundle.products?.map((product, idx) => (
                            <div
                              key={idx}
                              style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                border: `1px solid ${C.border}`
                              }}
                              title={product.name}
                            >
                              <img
                                src={getProductImage(product)}
                                alt={product.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            </div>
                          ))}
                        </div>

                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <span style={{ fontSize: '0.75rem', color: C.gray, textDecoration: 'line-through' }}>
                              Rs. {bundle.originalPrice?.toLocaleString()}
                            </span>
                            <span style={{ 
                              color: C.red, 
                              fontWeight: 700, 
                              fontSize: '1.1rem',
                              marginLeft: '0.5rem'
                            }}>
                              Rs. {bundle.bundlePrice?.toLocaleString()}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: 600 }}>
                            Save Rs. {(bundle.originalPrice - bundle.bundlePrice)?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Col>
                );
              })}
            </Row>
          )}

          {/* Footer Stats */}
          <div className="mt-4 text-center">
            <p style={{ color: C.gray, fontSize: '0.75rem', margin: 0 }}>
              Total {bundles.length} bundle{bundles.length !== 1 ? 's' : ''} · {activeCount} active
            </p>
          </div>
        </Container>

        {/* Create/Edit Modal */}
        <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
          <Modal.Header closeButton style={{ borderBottom: `1px solid ${C.border}` }}>
            <Modal.Title style={{ color: C.charcoal, fontWeight: 600, fontFamily: 'Barlow, sans-serif' }}>
              {editingBundle ? 'Edit Bundle' : 'Create New Bundle'}
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body style={{ padding: '1.5rem' }}>
              {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
              {success && <Alert variant="success" className="mb-3">{success}</Alert>}
              
              <Form.Group className="mb-3">
                <Form.Label style={{ color: C.charcoal, fontWeight: 500 }}>Bundle Name</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Summer Combo Pack"
                  required
                  style={{ borderRadius: '8px', borderColor: C.border }}
                  onFocus={(e) => e.target.style.borderColor = C.red}
                  onBlur={(e) => e.target.style.borderColor = C.border}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label style={{ color: C.charcoal, fontWeight: 500 }}>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the bundle"
                  style={{ borderRadius: '8px', borderColor: C.border, resize: 'vertical' }}
                  onFocus={(e) => e.target.style.borderColor = C.red}
                  onBlur={(e) => e.target.style.borderColor = C.border}
                />
              </Form.Group>

              {/* Product Search */}
              <Form.Group className="mb-3">
                <Form.Label style={{ color: C.charcoal, fontWeight: 500 }}>
                  Add Products (1-4 products)
                </Form.Label>
                <div ref={searchRef} style={{ position: 'relative' }}>
                  <div style={{ position: 'relative' }}>
                    <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: C.gray }} />
                    <Form.Control
                      type="text"
                      placeholder="Search products to add..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      style={{ borderRadius: '8px', paddingLeft: '35px', borderColor: C.border }}
                      onFocus={(e) => e.target.style.borderColor = C.red}
                      onBlur={(e) => e.target.style.borderColor = C.border}
                    />
                  </div>
                  
                  {/* Search Results Dropdown */}
                  {showSearchDropdown && searchResults.length > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      background: C.white,
                      border: `1px solid ${C.border}`,
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      zIndex: 1000,
                      maxHeight: '200px',
                      overflowY: 'auto'
                    }}>
                      {searchResults.map(product => (
                        <div
                          key={product._id}
                          onClick={() => addProduct(product)}
                          style={{
                            padding: '10px 12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            borderBottom: `1px solid ${C.border}`
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = C.redLight}
                          onMouseLeave={(e) => e.currentTarget.style.background = C.white}
                        >
                          <img
                            src={getProductImage(product)}
                            alt={product.name}
                            style={{ width: '30px', height: '30px', objectFit: 'cover', borderRadius: '4px' }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 500, color: C.charcoal }}>{product.name}</div>
                            <div style={{ fontSize: '0.75rem', color: C.red }}>
                              Rs. {(product.discountedPrice || product.originalPrice)?.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Selected Products Display */}
                {formData.productIds.length > 0 && (
                  <div className="mt-2 d-flex flex-wrap gap-2">
                    {formData.productIds.map(productId => {
                      const product = getProductById(productId);
                      return (
                        <div
                          key={productId}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '6px 10px',
                            background: C.redLight,
                            borderRadius: '8px',
                            border: `1px solid ${C.border}`
                          }}
                        >
                          <img
                            src={getProductImage(product)}
                            alt={product.name}
                            style={{ width: '24px', height: '24px', objectFit: 'cover', borderRadius: '4px' }}
                          />
                          <span style={{ fontSize: '0.8rem', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: C.charcoal }}>
                            {product.name}
                          </span>
                          <FaTimes
                            style={{ cursor: 'pointer', color: C.red, fontSize: '0.8rem' }}
                            onClick={() => removeProduct(productId)}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </Form.Group>

              {formData.productIds.length > 0 && (
                <div style={{
                  background: C.redLight,
                  borderRadius: '8px',
                  padding: '0.75rem',
                  marginBottom: '1rem'
                }}>
                  <strong style={{ color: C.charcoal }}>Original Price:</strong> Rs. {calculatedPrice.toLocaleString()}
                </div>
              )}

              <Form.Group className="mb-3">
                <Form.Label style={{ color: C.charcoal, fontWeight: 500 }}>Bundle Price (Rs.)</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  value={formData.bundlePrice}
                  onChange={(e) => setFormData({ ...formData, bundlePrice: parseFloat(e.target.value) || 0 })}
                  required
                  style={{ borderRadius: '8px', borderColor: C.border }}
                  onFocus={(e) => e.target.style.borderColor = C.red}
                  onBlur={(e) => e.target.style.borderColor = C.border}
                />
              </Form.Group>

              {/* Timeline Section */}
              <div style={{ 
                padding: '1rem', 
                background: C.redLight, 
                borderRadius: '8px',
                marginBottom: '1rem'
              }}>
                <h6 style={{ color: C.charcoal, marginBottom: '1rem', fontWeight: 600 }}>Schedule (Timeline)</h6>
                
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="bundle-lifetime"
                    label="Never expire (Lifetime)"
                    checked={formData.isLifetime}
                    onChange={(e) => setFormData({ ...formData, isLifetime: e.target.checked })}
                  />
                </Form.Group>

                {!formData.isLifetime && (
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-2">
                        <Form.Label style={{ color: C.charcoal, fontWeight: 500, fontSize: '0.8rem' }}>Start Date</Form.Label>
                        <Form.Control
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                          style={{ borderRadius: '8px', borderColor: C.border }}
                          onFocus={(e) => e.target.style.borderColor = C.red}
                          onBlur={(e) => e.target.style.borderColor = C.border}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-2">
                        <Form.Label style={{ color: C.charcoal, fontWeight: 500, fontSize: '0.8rem' }}>End Date</Form.Label>
                        <Form.Control
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                          min={formData.startDate}
                          style={{ borderRadius: '8px', borderColor: C.border }}
                          onFocus={(e) => e.target.style.borderColor = C.red}
                          onBlur={(e) => e.target.style.borderColor = C.border}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                )}
              </div>
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
                disabled={saving || formData.productIds.length < 1}
                style={{
                  background: C.gradient,
                  border: 'none',
                  borderRadius: '30px',
                  padding: '0.5rem 1.5rem',
                  color: C.white,
                  fontWeight: 600,
                  cursor: (saving || formData.productIds.length < 1) ? 'not-allowed' : 'pointer',
                  opacity: (saving || formData.productIds.length < 1) ? 0.7 : 1,
                  transition: 'all 0.3s ease'
                }}
              >
                {saving ? <Spinner size="sm" animation="border" style={{ color: C.white }} /> : (editingBundle ? 'Update Bundle' : 'Create Bundle')}
              </button>
            </Modal.Footer>
          </Form>
        </Modal>
      </div>
    </>
  );
}