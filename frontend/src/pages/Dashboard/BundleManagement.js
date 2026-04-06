import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaTimes, FaGift } from 'react-icons/fa';

// Navbar color palette
const logoColors = {
  primary: '#fe7e8b',
  secondary: '#e65c70',
  light: '#ffd1d4',
  background: '#fff5f6',
  gradient: 'linear-gradient(135deg, #fe7e8b 0%, #e65c70 100%)',
  softGradient: 'linear-gradient(135deg, #fff5f6 0%, #ffd1d4 100%)',
  dark: '#d64555',
};

export default function BundleManagement() {
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
      // Fetch all bundles (including inactive) for admin view
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

    console.log('Submitting bundle with data:', formData);

    try {
      const submitData = {
        ...formData,
        isLifetime: formData.isLifetime,
        startDate: formData.isLifetime ? null : (formData.startDate || null),
        endDate: formData.isLifetime ? null : (formData.endDate || null)
      };
      
      console.log('Final submitData:', submitData);
      console.log('productIds:', submitData.productIds);
      
      if (editingBundle) {
        await axios.put(`${process.env.REACT_APP_API_URL}/api/bundles/${editingBundle._id}`, submitData);
        setSuccess('Bundle updated successfully!');
      } else {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/bundles`, submitData);
        console.log('Bundle created response:', response.data);
        setSuccess('Bundle created successfully!');
      }
      
      // Close modal after short delay to show success message
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

  // Format timeline display
  const formatTimeline = (bundle) => {
    if (bundle.isLifetime) return 'Lifetime';
    if (!bundle.startDate && !bundle.endDate) return 'Always active';
    
    const start = bundle.startDate ? new Date(bundle.startDate).toLocaleDateString() : 'Now';
    const end = bundle.endDate ? new Date(bundle.endDate).toLocaleDateString() : 'Ongoing';
    return `${start} - ${end}`;
  };

  // Check if bundle is currently active based on timeline
  const isBundleActive = (bundle) => {
    if (!bundle.isActive) return false;
    if (bundle.isLifetime) return true;
    
    const now = new Date();
    const afterStart = !bundle.startDate || now >= new Date(bundle.startDate);
    const beforeEnd = !bundle.endDate || now <= new Date(bundle.endDate);
    return afterStart && beforeEnd;
  };

  if (loading) {
    return (
      <Container className="text-center my-5 py-5">
        <Spinner animation="border" style={{ color: logoColors.primary }} />
      </Container>
    );
  }

  return (
    <Container fluid className="py-4" style={{ background: logoColors.background, minHeight: '100vh' }}>
      <Row className="mb-4">
        <Col>
          <h2 style={{ color: '#2D3748', fontWeight: 600 }}>Bundle Management</h2>
        </Col>
        <Col className="text-end">
          <Button
            style={{
              background: logoColors.gradient,
              border: 'none',
              borderRadius: '8px',
              padding: '0.5rem 1rem',
              fontWeight: 500
            }}
            onClick={() => handleOpenModal()}
          >
            <FaPlus className="me-2" /> Create Bundle
          </Button>
        </Col>
      </Row>

      {bundles.length === 0 ? (
        <div className="text-center my-5 py-5">
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: logoColors.softGradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem'
          }}>
            <FaGift size={48} style={{ color: logoColors.primary }} />
          </div>
          <h4 style={{ color: logoColors.dark, marginBottom: '0.5rem' }}>
            No Bundles Found
          </h4>
          <p style={{ color: '#718096', fontSize: '1rem', maxWidth: '450px', margin: '0 auto 1.5rem' }}>
            You haven't created any product bundles yet. Bundles allow you to group products together at a special price.
          </p>
          <Button
            onClick={() => handleOpenModal()}
            style={{
              background: logoColors.gradient,
              border: 'none',
              padding: '0.6rem 2rem',
              borderRadius: '50px',
              fontWeight: '500'
            }}
            onMouseEnter={(e) => {
              e.target.style.opacity = '0.9';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = `0 4px 12px ${logoColors.primary}40`;
            }}
            onMouseLeave={(e) => {
              e.target.style.opacity = '1';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            <FaPlus className="me-2" /> Create Your First Bundle
          </Button>
        </div>
      ) : (
        <Row className="g-4">
          {bundles.map(bundle => {
            const isActive = isBundleActive(bundle);
            return (
              <Col key={bundle._id} xs={12} md={6} lg={4}>
                <Card style={{ borderRadius: '12px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h5 style={{ color: '#2D3748', marginBottom: '0.25rem' }}>{bundle.name}</h5>
                        <div className="d-flex gap-2 align-items-center">
                          <span style={{ 
                            fontSize: '0.75rem', 
                            padding: '2px 8px',
                            borderRadius: '12px',
                            background: isActive ? '#C6F6D5' : '#FED7D7',
                            color: isActive ? '#22543D' : '#822727'
                          }}>
                            {isActive ? 'Active' : 'Inactive'}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: '#718096' }}>
                            {formatTimeline(bundle)}
                          </span>
                        </div>
                      </div>
                      <div className="d-flex align-items-center">
                        <Form.Check 
                          type="switch"
                          id={`active-now-${bundle._id}`}
                          label=""
                          checked={bundle.isActive}
                          onChange={() => handleToggleActive(bundle)}
                          style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '5px' }}
                        />
                        <Button
                          variant="link"
                          style={{ color: logoColors.primary, padding: '4px' }}
                          onClick={() => handleOpenModal(bundle)}
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant="link"
                          style={{ color: '#E53E3E', padding: '4px' }}
                          onClick={() => handleDelete(bundle._id)}
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    </div>

                    {bundle.description && (
                      <p style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '0.75rem' }}>
                        {bundle.description}
                      </p>
                    )}

                    <div className="d-flex flex-wrap gap-1 mb-3">
                      {bundle.products?.map((product, idx) => (
                        <div
                          key={idx}
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            border: '1px solid #E2E8F0'
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
                        <span className="text-muted text-decoration-line-through" style={{ fontSize: '0.85rem' }}>
                          Rs. {bundle.originalPrice?.toLocaleString()}
                        </span>
                        <span style={{ 
                          color: logoColors.primary, 
                          fontWeight: 700, 
                          fontSize: '1.25rem',
                          marginLeft: '0.5rem'
                        }}>
                          Rs. {bundle.bundlePrice?.toLocaleString()}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: '#38A169' }}>
                        Save Rs. {(bundle.originalPrice - bundle.bundlePrice)?.toLocaleString()}
                      </span>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* Create/Edit Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton style={{ borderBottom: '1px solid #E2E8F0' }}>
          <Modal.Title style={{ color: '#2D3748' }}>
            {editingBundle ? 'Edit Bundle' : 'Create New Bundle'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
            
            <Form.Group className="mb-3">
              <Form.Label style={{ color: '#4A5568', fontWeight: 500 }}>Bundle Name</Form.Label>
              <Form.Control
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Summer Combo Pack"
                required
                style={{ borderRadius: '8px' }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ color: '#4A5568', fontWeight: 500 }}>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the bundle"
                style={{ borderRadius: '8px' }}
              />
            </Form.Group>

            {/* Product Search */}
            <Form.Group className="mb-3">
              <Form.Label style={{ color: '#4A5568', fontWeight: 500 }}>
                Add Products (1-4 products)
              </Form.Label>
              <div ref={searchRef} style={{ position: 'relative' }}>
                <div style={{ position: 'relative' }}>
                  <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#A0AEC0' }} />
                  <Form.Control
                    type="text"
                    placeholder="Search products to add..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    style={{ borderRadius: '8px', paddingLeft: '35px' }}
                  />
                </div>
                
                {/* Search Results Dropdown */}
                {showSearchDropdown && searchResults.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: 'white',
                    border: '1px solid #E2E8F0',
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
                          borderBottom: '1px solid #F7FAFC'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#F7FAFC'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                      >
                        <img
                          src={getProductImage(product)}
                          alt={product.name}
                          style={{ width: '30px', height: '30px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{product.name}</div>
                          <div style={{ fontSize: '0.8rem', color: '#718096' }}>
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
                          background: '#F7FAFC',
                          borderRadius: '8px',
                          border: '1px solid #E2E8F0'
                        }}
                      >
                        <img
                          src={getProductImage(product)}
                          alt={product.name}
                          style={{ width: '24px', height: '24px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                        <span style={{ fontSize: '0.85rem', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {product.name}
                        </span>
                        <FaTimes
                          style={{ cursor: 'pointer', color: '#E53E3E', fontSize: '0.8rem' }}
                          onClick={() => removeProduct(productId)}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </Form.Group>

            {formData.productIds.length > 0 && (
              <Alert variant="info" style={{ borderRadius: '8px' }}>
                <strong>Original Price:</strong> Rs. {calculatedPrice.toLocaleString()}
              </Alert>
            )}

            <Form.Group className="mb-3">
              <Form.Label style={{ color: '#4A5568', fontWeight: 500 }}>Bundle Price (Rs.)</Form.Label>
              <Form.Control
                type="number"
                min="0"
                value={formData.bundlePrice}
                onChange={(e) => setFormData({ ...formData, bundlePrice: parseFloat(e.target.value) || 0 })}
                required
                style={{ borderRadius: '8px' }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="bundle-active"
                label="Active"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
            </Form.Group>

            {/* Timeline Section */}
            <div style={{ 
              padding: '15px', 
              background: '#F7FAFC', 
              borderRadius: '8px',
              marginBottom: '15px'
            }}>
              <h6 style={{ color: '#4A5568', marginBottom: '15px' }}>Schedule (Timeline)</h6>
              
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
                    <Form.Group className="mb-3">
                      <Form.Label style={{ color: '#4A5568', fontWeight: 500 }}>Start Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        style={{ borderRadius: '8px' }}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label style={{ color: '#4A5568', fontWeight: 500 }}>End Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        min={formData.startDate}
                        style={{ borderRadius: '8px' }}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              )}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal} style={{ borderRadius: '8px' }}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving || formData.productIds.length < 1}
              style={{
                background: logoColors.gradient,
                border: 'none',
                borderRadius: '8px'
              }}
            >
              {saving ? <Spinner size="sm" animation="border" /> : (editingBundle ? 'Update Bundle' : 'Create Bundle')}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}