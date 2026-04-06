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
  FiLink,
  FiImage,
  FiUpload,
  FiX,
  FiStar
} from 'react-icons/fi';

// Navbar color palette
const logoColors = {
  primary: '#fe7e8b',
  secondary: '#e65c70',
  light: '#ffd1d4',
  dark: '#d64555',
  background: '#fff5f6',
  gradient: 'linear-gradient(135deg, #fe7e8b 0%, #e65c70 100%)',
  softGradient: 'linear-gradient(135deg, #fff5f6 0%, #ffd1d4 100%)',
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

    // Add all fields except featured (to avoid duplication)
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== 'featured') data.append(key, value);
    });

    // Add featured once, explicitly as a string so backend parses correctly
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
      <Container
        fluid
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: '100vh', background: logoColors.background }}
      >
        <div className="text-center">
          <Spinner animation="border" style={{ color: logoColors.primary }} />
          <p className="mt-3" style={{ color: '#4A5568' }}>Loading...</p>
        </div>
      </Container>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <Container
      fluid
      style={{
        background: logoColors.background,
        minHeight: '100vh',
        padding: '2rem 0'
      }}
    >
      <Container>
        <Card
          className="border-0 shadow-lg mx-auto"
          style={{
            maxWidth: '900px',
            borderRadius: '16px',
            overflow: 'hidden'
          }}
        >
          {/* Card Header with Pink Gradient */}
          <div style={{
            background: logoColors.gradient,
            padding: '2rem 1.5rem',
            textAlign: 'center'
          }}>
            <h1 className="text-white mb-0" style={{ fontWeight: '600', fontSize: '2rem' }}>
              <FiPackage className="me-2" style={{ verticalAlign: 'middle' }} />
              Add New Product
            </h1>
            <p className="text-white-50 mt-2" style={{ opacity: 0.9 }}>
              Fill in the details to add a new product to your catalog
            </p>
          </div>

          <Card.Body style={{ padding: '2rem' }}>
            {error && (
              <Alert
                variant="danger"
                className="text-center"
                style={{
                  background: '#ffd1d4',
                  border: `1px solid ${logoColors.primary}`,
                  color: logoColors.dark,
                  borderRadius: '8px'
                }}
              >
                {error}
              </Alert>
            )}

            {success && (
              <Alert
                variant="success"
                className="text-center"
                style={{
                  background: logoColors.softGradient,
                  border: `1px solid ${logoColors.light}`,
                  color: logoColors.dark,
                  borderRadius: '8px'
                }}
              >
                {success}
              </Alert>
            )}

            <Form onSubmit={handleProductSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: logoColors.dark, fontWeight: '500' }}>
                      <FiPackage className="me-2" style={{ color: logoColors.primary }} />
                      Product Name
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      style={{
                        borderColor: logoColors.light,
                        padding: '0.75rem',
                        borderRadius: '8px',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = logoColors.primary;
                        e.target.style.boxShadow = `0 0 0 3px ${logoColors.primary}20`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = logoColors.light;
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: logoColors.dark, fontWeight: '500' }}>
                      <FiTag className="me-2" style={{ color: logoColors.primary }} />
                      Category
                    </Form.Label>
                    <Form.Select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      style={{
                        borderColor: logoColors.light,
                        padding: '0.75rem',
                        borderRadius: '8px',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = logoColors.primary;
                        e.target.style.boxShadow = `0 0 0 3px ${logoColors.primary}20`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = logoColors.light;
                        e.target.style.boxShadow = 'none';
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
                <Form.Label style={{ color: logoColors.dark, fontWeight: '500' }}>
                  <FiFileText className="me-2" style={{ color: logoColors.primary }} />
                  Description
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  style={{
                    borderColor: logoColors.light,
                    padding: '0.75rem',
                    borderRadius: '8px',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = logoColors.primary;
                    e.target.style.boxShadow = `0 0 0 3px ${logoColors.primary}20`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = logoColors.light;
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: logoColors.dark, fontWeight: '500' }}>
                      <FiDollarSign className="me-2" style={{ color: logoColors.primary }} />
                      Original Price
                    </Form.Label>
                    <InputGroup>
                      <InputGroup.Text style={{
                        background: 'white',
                        borderColor: logoColors.light,
                        color: logoColors.primary
                      }}>
                        Rs.
                      </InputGroup.Text>
                      <Form.Control
                        type="number"
                        name="originalPrice"
                        value={formData.originalPrice}
                        onChange={handleChange}
                        style={{
                          borderColor: logoColors.light,
                          padding: '0.75rem',
                          transition: 'all 0.3s ease'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = logoColors.primary;
                          e.target.style.boxShadow = `0 0 0 3px ${logoColors.primary}20`;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = logoColors.light;
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: logoColors.dark, fontWeight: '500' }}>
                      <FiPercent className="me-2" style={{ color: logoColors.primary }} />
                      Discounted Price
                    </Form.Label>
                    <InputGroup>
                      <InputGroup.Text style={{
                        background: 'white',
                        borderColor: logoColors.light,
                        color: logoColors.primary
                      }}>
                        Rs.
                      </InputGroup.Text>
                      <Form.Control
                        type="number"
                        name="discountedPrice"
                        value={formData.discountedPrice}
                        onChange={handleChange}
                        required
                        style={{
                          borderColor: logoColors.light,
                          padding: '0.75rem',
                          transition: 'all 0.3s ease'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = logoColors.primary;
                          e.target.style.boxShadow = `0 0 0 3px ${logoColors.primary}20`;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = logoColors.light;
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: logoColors.dark, fontWeight: '500' }}>
                      <FiHash className="me-2" style={{ color: logoColors.primary }} />
                      Stock Quantity
                    </Form.Label>
                    <Form.Control
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleChange}
                      required
                      style={{
                        borderColor: logoColors.light,
                        padding: '0.75rem',
                        borderRadius: '8px',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = logoColors.primary;
                        e.target.style.boxShadow = `0 0 0 3px ${logoColors.primary}20`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = logoColors.light;
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Featured Toggle */}
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem',
                      background: logoColors.softGradient,
                      borderRadius: '8px',
                      border: `1px solid ${logoColors.light}`
                    }}>
                      <div
                        style={{
                          width: '44px',
                          height: '24px',
                          background: formData.featured ? logoColors.primary : '#e2e8f0',
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
                            background: 'white',
                            borderRadius: '50%',
                            position: 'absolute',
                            top: '2px',
                            left: formData.featured ? '20px' : '2px',
                            transition: 'left 0.3s ease',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                          }}
                        />
                      </div>
                      <div style={{ fontWeight: '500', color: logoColors.dark }}>
                        <FiStar className="me-1" style={{ color: logoColors.primary, verticalAlign: 'middle' }} />
                        Feature on Home Page
                      </div>
                    </div>
                    <Form.Text className="text-muted mt-1" style={{ color: '#718096', fontSize: '0.85rem' }}>
                      Enable to show this product in the featured section on homepage
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              {/* Variants Section */}
              <div className="mb-4" style={{
                background: logoColors.softGradient,
                padding: '1.5rem',
                borderRadius: '12px',
                border: `1px solid ${logoColors.light}`
              }}>
                <h5 style={{ color: logoColors.dark, marginBottom: '1rem' }}>
                  Product Variants (Optional)
                </h5>
                <p style={{ color: '#718096', fontSize: '0.9rem', marginBottom: '1rem' }}>
                  Add sizes and colors for this product. Leave empty if not applicable.
                </p>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label style={{ color: logoColors.dark, fontWeight: '500' }}>
                        Sizes (comma separated)
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="sizes"
                        value={formData.sizes || ''}
                        onChange={handleChange}
                        placeholder="e.g., S, M, L, XL, XXL"
                        style={{
                          borderColor: logoColors.light,
                          padding: '0.75rem',
                          borderRadius: '8px',
                          transition: 'all 0.3s ease'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = logoColors.primary;
                          e.target.style.boxShadow = `0 0 0 3px ${logoColors.primary}20`;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = logoColors.light;
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                      <Form.Text className="text-muted" style={{ color: '#718096' }}>
                        Example: S, M, L, XL
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label style={{ color: logoColors.dark, fontWeight: '500' }}>
                        Colors (comma separated)
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="colors"
                        value={formData.colors || ''}
                        onChange={handleChange}
                        placeholder="e.g., Red, Blue, Green, Black"
                        style={{
                          borderColor: logoColors.light,
                          padding: '0.75rem',
                          borderRadius: '8px',
                          transition: 'all 0.3s ease'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = logoColors.primary;
                          e.target.style.boxShadow = `0 0 0 3px ${logoColors.primary}20`;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = logoColors.light;
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                      <Form.Text className="text-muted" style={{ color: '#718096' }}>
                        Example: Red, Blue, Black, White
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
              </div>

              {/* Main Product Images */}
              <Form.Group className="mb-4">
                <Form.Label style={{ color: logoColors.dark, fontWeight: '500' }}>
                  <FiImage className="me-2" style={{ color: logoColors.primary }} />
                  Main Product Images (gallery)
                </Form.Label>
                <div
                  className="border rounded p-4 text-center"
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                  onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleImageChange(e); }}
                  style={{
                    borderColor: isDragging ? logoColors.primary : logoColors.light,
                    background: isDragging ? logoColors.softGradient : '#f8fafc',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    borderStyle: isDragging ? 'dashed' : 'solid',
                    borderWidth: '2px'
                  }}
                >
                  <FiUpload size={32} style={{ color: logoColors.primary, marginBottom: '1rem' }} />
                  <p style={{ color: '#4A5568', marginBottom: '0.5rem' }}>
                    Drag and drop main images here or click to browse (product gallery)
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
                      borderColor: logoColors.primary,
                      color: logoColors.primary,
                      background: 'white',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = logoColors.softGradient;
                      e.target.style.color = logoColors.dark;
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'white';
                      e.target.style.color = logoColors.primary;
                    }}
                  >
                    Select Images
                  </Button>
                  <Form.Text className="d-block mt-2" style={{ color: '#718096' }}>
                    Upload main images for product gallery (JPEG, PNG, GIF)
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
                            style={{ height: '100px', width: '100%', objectFit: 'cover', borderColor: logoColors.light }}
                          />
                          <Button
                            variant="danger"
                            size="sm"
                            className="position-absolute top-0 end-0 m-1"
                            onClick={() => removeImage(index)}
                            style={{ background: '#dc3545', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px' }}
                          >
                            <FiX size={12} />
                          </Button>
                        </div>
                      </Col>
                    ))}
                  </Row>
                )}
              </Form.Group>

              {/* Design Images */}
              <Form.Group className="mb-4">
                <Form.Label style={{ color: logoColors.dark, fontWeight: '500' }}>
                  <FiImage className="me-2" style={{ color: logoColors.primary }} />
                  Design Images (variants - click to switch on product page)
                </Form.Label>
                <div
                  className="border rounded p-4 text-center"
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                  onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleDesignImageChange(e); }}
                  style={{
                    borderColor: isDragging ? logoColors.primary : logoColors.light,
                    background: isDragging ? logoColors.softGradient : '#f8fafc',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    borderStyle: isDragging ? 'dashed' : 'solid',
                    borderWidth: '2px'
                  }}
                >
                  <FiUpload size={32} style={{ color: logoColors.primary, marginBottom: '1rem' }} />
                  <p style={{ color: '#4A5568', marginBottom: '0.5rem' }}>
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
                      borderColor: logoColors.primary,
                      color: logoColors.primary,
                      background: 'white',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = logoColors.softGradient;
                      e.target.style.color = logoColors.dark;
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'white';
                      e.target.style.color = logoColors.primary;
                    }}
                  >
                    Select Design Images
                  </Button>
                  <Form.Text className="d-block mt-2" style={{ color: '#718096' }}>
                    Upload multiple design variant images (will appear as clickable thumbnails on product page)
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
                            style={{ height: '100px', width: '100%', objectFit: 'cover', borderColor: logoColors.light }}
                          />
                          <Button
                            variant="danger"
                            size="sm"
                            className="position-absolute top-0 end-0 m-1"
                            onClick={() => removeDesignImage(index)}
                            style={{ background: '#dc3545', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px' }}
                          >
                            <FiX size={12} />
                          </Button>
                        </div>
                      </Col>
                    ))}
                  </Row>
                )}
              </Form.Group>

              <Button
                variant="primary"
                type="submit"
                className="w-100 py-3"
                style={{
                  background: logoColors.gradient,
                  border: 'none',
                  fontSize: '1.1rem',
                  fontWeight: '500',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
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
                <FiPackage size={20} />
                Add Product
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </Container>
  );
}