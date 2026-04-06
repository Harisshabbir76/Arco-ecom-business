import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Form,
  Button,
  Alert,
  Card,
  Spinner,
  Row,
  Col,
  InputGroup,
  Image
} from 'react-bootstrap';
import {
  FiPackage,
  FiTag,
  FiFileText,
  FiDollarSign,
  FiPercent,
  FiHash,
  FiImage,
  FiUpload,
  FiX,
  FiStar,
  FiArrowLeft
} from 'react-icons/fi';

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

export default function AddProduct() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    originalPrice: '',
    discountedPrice: '',
    category: '',
    stock: '',
    sizes: '',
    colors: '',
    featured: false
  });
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [designImages, setDesignImages] = useState([]);
  const [designPreviews, setDesignPreviews] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingDesign, setIsDraggingDesign] = useState(false);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFeaturedToggle = () => {
    setFormData(prev => ({
      ...prev,
      featured: !prev.featured
    }));
  };

  const handleImageChange = (e) => {
    let files = [];
    if (e.target.files) {
      files = Array.from(e.target.files);
    } else if (e.dataTransfer && e.dataTransfer.files) {
      files = Array.from(e.dataTransfer.files);
    }
    
    if (files.length === 0) return;
    
    setImages(prev => [...prev, ...files]);
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...previews]);
  };

  const handleDesignImageChange = (e) => {
    let files = [];
    if (e.target.files) {
      files = Array.from(e.target.files);
    } else if (e.dataTransfer && e.dataTransfer.files) {
      files = Array.from(e.dataTransfer.files);
    }
    
    if (files.length === 0) return;
    
    setDesignImages(prev => [...prev, ...files]);
    const previews = files.map(file => URL.createObjectURL(file));
    setDesignPreviews(prev => [...prev, ...previews]);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    const newPreviews = [...imagePreviews];
    URL.revokeObjectURL(newPreviews[index]);
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const removeDesignImage = (index) => {
    const newDesignImages = [...designImages];
    const newDesignPreviews = [...designPreviews];
    URL.revokeObjectURL(newDesignPreviews[index]);
    newDesignImages.splice(index, 1);
    newDesignPreviews.splice(index, 1);
    setDesignImages(newDesignImages);
    setDesignPreviews(newDesignPreviews);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const data = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (key !== 'featured') data.append(key, value);
    });

    data.append('featured', formData.featured.toString());

    for (let i = 0; i < images.length; i++) {
      data.append("images", images[i]);
    }

    for (let i = 0; i < designImages.length; i++) {
      data.append("designs", designImages[i]);
    }

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/dashboard/add-product`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      setSuccess("Product Added Successfully");
      setFormData({
        name: '',
        description: '',
        originalPrice: '',
        discountedPrice: '',
        category: '',
        stock: '',
        sizes: '',
        colors: '',
        featured: false
      });

      imagePreviews.forEach(url => URL.revokeObjectURL(url));
      designPreviews.forEach(url => URL.revokeObjectURL(url));
      setImages([]);
      setDesignImages([]);
      setDesignPreviews([]);
      setImagePreviews([]);

      setTimeout(() => {
        navigate('/dashboard/catalog');
      }, 2000);
    } catch (err) {
      console.error(err);
      setError("Product Addition Failed: " + (err.response?.data?.message || err.message));
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/404');
          return;
        }

        const response = await axios.get(`${process.env.REACT_APP_API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.user?.email?.toLowerCase() === '05harisshabbir@gmail.com') {
          setIsAuthorized(true);
        } else {
          navigate('/404');
        }
      } catch (error) {
        console.error('Authentication error:', error);
        navigate('/404');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/categories`);
        setCategories(res.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    checkAuth();
    fetchCategories();
  }, [navigate]);

  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
      designPreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreviews, designPreviews]);

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="text-center">
          <Spinner animation="border" style={{ color: C.red, width: '2.5rem', height: '2.5rem', borderWidth: '3px' }} />
          <p className="mt-3" style={{ color: C.gray }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;500;600;700&display=swap');
        
        .add-product-page {
          min-height: 100vh;
          background: ${C.white};
          font-family: 'Barlow', sans-serif;
        }

        .form-control:focus, .form-select:focus {
          border-color: ${C.red};
          box-shadow: 0 0 0 0.2rem ${C.red}20;
        }
      `}</style>

      <div className="add-product-page" style={{ padding: '2rem 0' }}>
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

          <Card className="border-0 shadow-sm mx-auto" style={{
            maxWidth: '1000px',
            borderRadius: '16px',
            overflow: 'hidden',
            border: `1px solid ${C.border}`
          }}>
            {/* Card Header with Red Gradient */}
            <div style={{
              background: C.gradient,
              padding: '2rem 1.5rem',
              textAlign: 'center'
            }}>
              <h1 className="text-white mb-0" style={{ fontFamily: 'Barlow, sans-serif', fontWeight: '700', fontSize: '1.75rem' }}>
                <FiPackage className="me-2" style={{ verticalAlign: 'middle' }} />
                Add New Product
              </h1>
              <p className="mt-2" style={{ color: 'rgba(255,255,255,0.85)', fontFamily: 'Barlow, sans-serif' }}>
                Fill in the details to add a new product to your catalog
              </p>
            </div>

            <Card.Body style={{ padding: '2rem', background: C.white }}>
              {error && (
                <Alert variant="danger" className="text-center" style={{
                  background: C.redLight,
                  border: `1px solid ${C.red}`,
                  color: C.red,
                  borderRadius: '8px'
                }}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert variant="success" className="text-center" style={{
                  background: '#d4edda',
                  border: `1px solid #28a745`,
                  color: '#155724',
                  borderRadius: '8px'
                }}>
                  {success}
                </Alert>
              )}

              <Form onSubmit={handleProductSubmit}>
                {/* Basic Information */}
                <div className="mb-4">
                  <h5 style={{ color: C.charcoal, fontWeight: 600, marginBottom: '1rem', fontSize: '1rem' }}>
                    Basic Information
                  </h5>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ color: C.charcoal, fontWeight: 500 }}>
                          <FiPackage className="me-2" style={{ color: C.red }} size={14} />
                          Product Name *
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          style={{
                            borderColor: C.border,
                            padding: '0.75rem',
                            borderRadius: '8px'
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ color: C.charcoal, fontWeight: 500 }}>
                          <FiTag className="me-2" style={{ color: C.red }} size={14} />
                          Category *
                        </Form.Label>
                        <Form.Select
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          required
                          style={{
                            borderColor: C.border,
                            padding: '0.75rem',
                            borderRadius: '8px'
                          }}
                        >
                          <option value="">Select Category</option>
                          {categories.map(cat => (
                            <option key={cat._id} value={cat.name}>
                              {cat.name}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: C.charcoal, fontWeight: 500 }}>
                      <FiFileText className="me-2" style={{ color: C.red }} size={14} />
                      Description
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      style={{
                        borderColor: C.border,
                        padding: '0.75rem',
                        borderRadius: '8px',
                        resize: 'vertical'
                      }}
                    />
                  </Form.Group>
                </div>

                {/* Pricing */}
                <div className="mb-4">
                  <h5 style={{ color: C.charcoal, fontWeight: 600, marginBottom: '1rem', fontSize: '1rem' }}>
                    Pricing
                  </h5>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ color: C.charcoal, fontWeight: 500 }}>
                          <FiDollarSign className="me-2" style={{ color: C.red }} size={14} />
                          Original Price *
                        </Form.Label>
                        <InputGroup>
                          <InputGroup.Text style={{
                            background: C.white,
                            borderColor: C.border,
                            color: C.red
                          }}>
                            Rs.
                          </InputGroup.Text>
                          <Form.Control
                            type="number"
                            name="originalPrice"
                            value={formData.originalPrice}
                            onChange={handleChange}
                            required
                            style={{ borderColor: C.border, padding: '0.75rem' }}
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ color: C.charcoal, fontWeight: 500 }}>
                          <FiPercent className="me-2" style={{ color: C.red }} size={14} />
                          Discounted Price *
                        </Form.Label>
                        <InputGroup>
                          <InputGroup.Text style={{
                            background: C.white,
                            borderColor: C.border,
                            color: C.red
                          }}>
                            Rs.
                          </InputGroup.Text>
                          <Form.Control
                            type="number"
                            name="discountedPrice"
                            value={formData.discountedPrice}
                            onChange={handleChange}
                            required
                            style={{ borderColor: C.border, padding: '0.75rem' }}
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                {/* Inventory */}
                <div className="mb-4">
                  <h5 style={{ color: C.charcoal, fontWeight: 600, marginBottom: '1rem', fontSize: '1rem' }}>
                    Inventory
                  </h5>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ color: C.charcoal, fontWeight: 500 }}>
                          <FiHash className="me-2" style={{ color: C.red }} size={14} />
                          Stock Quantity *
                        </Form.Label>
                        <Form.Control
                          type="number"
                          name="stock"
                          value={formData.stock}
                          onChange={handleChange}
                          required
                          style={{
                            borderColor: C.border,
                            padding: '0.75rem',
                            borderRadius: '8px'
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.75rem',
                          background: C.redLight,
                          borderRadius: '8px',
                          border: `1px solid ${C.border}`
                        }}>
                          <div
                            style={{
                              width: '44px',
                              height: '24px',
                              background: formData.featured ? C.red : C.border,
                              borderRadius: '12px',
                              position: 'relative',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              flexShrink: 0
                            }}
                            onClick={handleFeaturedToggle}
                          >
                            <div
                              style={{
                                width: '20px',
                                height: '20px',
                                background: C.white,
                                borderRadius: '50%',
                                position: 'absolute',
                                top: '2px',
                                left: formData.featured ? '20px' : '2px',
                                transition: 'left 0.3s ease',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                              }}
                            />
                          </div>
                          <div style={{ fontWeight: 500, color: C.charcoal }}>
                            <FiStar className="me-1" style={{ color: C.red, verticalAlign: 'middle' }} />
                            Feature on Home Page
                          </div>
                        </div>
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                {/* Variants Section */}
                <div className="mb-4" style={{
                  background: C.redLight,
                  padding: '1.5rem',
                  borderRadius: '12px',
                  border: `1px solid ${C.border}`
                }}>
                  <h5 style={{ color: C.charcoal, marginBottom: '0.5rem', fontWeight: 600, fontSize: '1rem' }}>
                    Product Variants (Optional)
                  </h5>
                  <p style={{ color: C.gray, fontSize: '0.85rem', marginBottom: '1rem' }}>
                    Add sizes and colors for this product. Leave empty if not applicable.
                  </p>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ color: C.charcoal, fontWeight: 500 }}>
                          Sizes (comma separated)
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="sizes"
                          value={formData.sizes || ''}
                          onChange={handleChange}
                          placeholder="e.g., S, M, L, XL, XXL"
                          style={{
                            borderColor: C.border,
                            padding: '0.75rem',
                            borderRadius: '8px'
                          }}
                        />
                        <Form.Text className="text-muted" style={{ color: C.gray }}>
                          Example: S, M, L, XL
                        </Form.Text>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ color: C.charcoal, fontWeight: 500 }}>
                          Colors (comma separated)
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="colors"
                          value={formData.colors || ''}
                          onChange={handleChange}
                          placeholder="e.g., Red, Blue, Green, Black"
                          style={{
                            borderColor: C.border,
                            padding: '0.75rem',
                            borderRadius: '8px'
                          }}
                        />
                        <Form.Text className="text-muted" style={{ color: C.gray }}>
                          Example: Red, Blue, Black, White
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                {/* Main Product Images */}
                <div className="mb-4">
                  <Form.Label style={{ color: C.charcoal, fontWeight: 500 }}>
                    <FiImage className="me-2" style={{ color: C.red }} size={14} />
                    Main Product Images (gallery)
                  </Form.Label>
                  <div
                    className="border rounded p-4 text-center"
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                    onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleImageChange(e); }}
                    style={{
                      borderColor: isDragging ? C.red : C.border,
                      background: isDragging ? C.redLight : C.lightGray,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      borderStyle: isDragging ? 'dashed' : 'solid',
                      borderWidth: '2px',
                      borderRadius: '8px'
                    }}
                  >
                    <FiUpload size={32} style={{ color: C.red, marginBottom: '1rem' }} />
                    <p style={{ color: C.charcoal, marginBottom: '0.5rem' }}>
                      Drag and drop main images here or click to browse
                    </p>
                    <Form.Control
                      type="file"
                      multiple
                      onChange={handleImageChange}
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="image-upload"
                    />
                    <Button
                      variant="outline-primary"
                      onClick={() => document.getElementById('image-upload').click()}
                      style={{
                        borderColor: C.red,
                        color: C.red,
                        background: C.white,
                        borderRadius: '30px',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = C.redLight;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = C.white;
                      }}
                    >
                      Select Images
                    </Button>
                    <Form.Text className="d-block mt-2" style={{ color: C.gray }}>
                      Upload main images for product gallery (JPEG, PNG, WEBP)
                    </Form.Text>
                  </div>

                  {imagePreviews.length > 0 && (
                    <Row className="mt-3">
                      {imagePreviews.map((preview, index) => (
                        <Col key={index} xs={4} md={3} className="mb-2">
                          <div className="position-relative">
                            <Image
                              src={preview}
                              thumbnail
                              style={{ height: '100px', width: '100%', objectFit: 'cover', borderRadius: '8px' }}
                            />
                            <button
                              onClick={() => removeImage(index)}
                              style={{
                                position: 'absolute',
                                top: '4px',
                                right: '4px',
                                background: '#dc3545',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '4px',
                                color: C.white,
                                cursor: 'pointer'
                              }}
                            >
                              <FiX size={10} />
                            </button>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  )}
                </div>

                {/* Design Images */}
                <div className="mb-4">
                  <Form.Label style={{ color: C.charcoal, fontWeight: 500 }}>
                    <FiImage className="me-2" style={{ color: C.red }} size={14} />
                    Design Images (variants)
                  </Form.Label>
                  <div
                    className="border rounded p-4 text-center"
                    onDragOver={(e) => { e.preventDefault(); setIsDraggingDesign(true); }}
                    onDragEnter={(e) => { e.preventDefault(); setIsDraggingDesign(true); }}
                    onDragLeave={(e) => { e.preventDefault(); setIsDraggingDesign(false); }}
                    onDrop={(e) => { e.preventDefault(); setIsDraggingDesign(false); handleDesignImageChange(e); }}
                    style={{
                      borderColor: isDraggingDesign ? C.red : C.border,
                      background: isDraggingDesign ? C.redLight : C.lightGray,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      borderStyle: isDraggingDesign ? 'dashed' : 'solid',
                      borderWidth: '2px',
                      borderRadius: '8px'
                    }}
                  >
                    <FiUpload size={32} style={{ color: C.red, marginBottom: '1rem' }} />
                    <p style={{ color: C.charcoal, marginBottom: '0.5rem' }}>
                      Drag and drop design images here or click to browse
                    </p>
                    <Form.Control
                      type="file"
                      multiple
                      onChange={handleDesignImageChange}
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="design-upload"
                    />
                    <Button
                      variant="outline-primary"
                      onClick={() => document.getElementById('design-upload').click()}
                      style={{
                        borderColor: C.red,
                        color: C.red,
                        background: C.white,
                        borderRadius: '30px',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = C.redLight;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = C.white;
                      }}
                    >
                      Select Design Images
                    </Button>
                    <Form.Text className="d-block mt-2" style={{ color: C.gray }}>
                      Upload multiple design variant images (will appear as clickable thumbnails)
                    </Form.Text>
                  </div>

                  {designPreviews.length > 0 && (
                    <Row className="mt-3">
                      {designPreviews.map((preview, index) => (
                        <Col key={index} xs={4} md={3} className="mb-2">
                          <div className="position-relative">
                            <Image
                              src={preview}
                              thumbnail
                              style={{ height: '100px', width: '100%', objectFit: 'cover', borderRadius: '8px' }}
                            />
                            <button
                              onClick={() => removeDesignImage(index)}
                              style={{
                                position: 'absolute',
                                top: '4px',
                                right: '4px',
                                background: '#dc3545',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '4px',
                                color: C.white,
                                cursor: 'pointer'
                              }}
                            >
                              <FiX size={10} />
                            </button>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-100 py-3"
                  style={{
                    background: C.gradient,
                    border: 'none',
                    fontSize: '1rem',
                    fontWeight: 600,
                    borderRadius: '30px',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.opacity = '0.9';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = `0 4px 15px ${C.red}40`;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.opacity = '1';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <FiPackage size={18} />
                  Add Product
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Container>
      </div>
    </>
  );
}