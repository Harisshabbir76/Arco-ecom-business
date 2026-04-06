import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Row,
  Col,
  Spinner,
  Alert,
  Button,
  Badge,
  Card,
  Stack,
  Form,
  ListGroup
} from 'react-bootstrap';
import { 
  FiTruck, 
  FiShield, 
  FiRotateCcw
} from 'react-icons/fi';
import { useCart } from '../../components/CartContext';
import RecommendedProducts from '../../components/RecommendedProducts';

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

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedDesign, setSelectedDesign] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({
    userName: '',
    userEmail: '',
    rating: 0,
    comment: ''
  });
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/product/${id}`);
        setProduct(res.data);
        setReviews(res.data.reviews || []);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if ((product.variants?.sizes?.length > 0 && !selectedSize) || 
        (product.variants?.colors?.length > 0 && !selectedColor)) {
      alert('Please select size and color');
      return;
    }
    addToCart({
      ...product,
      quantity: quantity,
      selectedSize,
      selectedColor
    });
  };

  const handleOrderNow = () => {
    if ((product.variants?.sizes?.length > 0 && !selectedSize) || 
        (product.variants?.colors?.length > 0 && !selectedColor)) {
      alert('Please select size and color');
      return;
    }
    navigate('/checkout', {
      state: {
        products: [{
          ...product,
          quantity: quantity,
          selectedSize,
          selectedColor
        }]
      }
    });
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= (product?.stock || 10)) {
      setQuantity(value);
    }
  };

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setReviewForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingChange = (rating) => {
    setReviewForm(prev => ({
      ...prev,
      rating
    }));
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/reviews`, {
        product: product._id,
        ...reviewForm
      });

      // Refresh product and reviews
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/product/${id}`);
      setProduct(res.data);
      setReviews(res.data.reviews);

      setReviewSuccess('Review submitted successfully!');
      setReviewError('');
      setReviewForm({
        userName: '',
        userEmail: '',
        rating: 0,
        comment: ''
      });
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Error submitting review');
      setReviewSuccess('');
    }
  };

  if (loading) {
    return (
      <Container fluid className="text-center py-5" style={{ background: logoColors.background, minHeight: '100vh' }}>
        <Spinner animation="border" style={{ color: logoColors.primary }} />
        <p className="mt-3" style={{ color: '#4A5568' }}>Loading product details...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="py-5" style={{ background: logoColors.background, minHeight: '100vh' }}>
        <Alert variant="danger">
          Error loading product: {error.message}
        </Alert>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container fluid className="py-5" style={{ background: logoColors.background, minHeight: '100vh' }}>
        <Alert variant="info">Product not found</Alert>
      </Container>
    );
  }

  return (
    <Container fluid style={{ background: logoColors.background, minHeight: '100vh', padding: '2rem 0' }}>
      <Container>
        <Row className="g-4">
          {/* Product Images */}
          <Col md={6}>
            <Row xs={2} md={3} className="g-3 mb-4">
              {product.image?.map((img, index) => {
                const imgUrl = img.startsWith('http') ? img : `${process.env.REACT_APP_API_URL}${img}`;
                return (
                      <Col key={`img-${index}`}>
                    <Card
                      className={`h-100 cursor-pointer border ${index === selectedImage ? `border-2` : 'border-light'}`}
                      onClick={() => setSelectedImage(index)}
                      style={{
                        cursor: 'pointer',
                        borderColor: index === selectedImage ? logoColors.primary : '#e2e8f0',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Card.Img
                        src={imgUrl}
                        alt={`${product.name} image ${index + 1}`}
                        style={{ objectFit: 'cover', height: '150px', width: '100%' }}
                        onError={e => { e.target.src = '/placeholder.jpg'; }}
                      />
                    </Card>
                  </Col>
                );
              })}
            </Row>

            {product.designs?.length > 0 && (
              <>
                <h6 style={{ color: logoColors.dark, margin: '1.5rem 0 1rem 0', fontWeight: '600' }}>
                  🎨 Design Options
                </h6>
                <Row xs={2} md={3} className="g-3 mb-4">
                  {product.designs.map((design, index) => {
                    const designUrl = design.startsWith('http') ? design : `${process.env.REACT_APP_API_URL}${design}`;
                    return (
                      <Col key={`design-${index}`}>
                        <Card
                          className={`h-100 cursor-pointer border ${index === selectedDesign ? 'border-2' : 'border-light'}`}
                          onClick={() => setSelectedDesign(index)}
                          style={{
                            cursor: 'pointer',
                            borderColor: index === selectedDesign ? logoColors.primary : '#e2e8f0',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <Card.Img
                            src={designUrl}
                            alt={`${product.name} design ${index + 1}`}
                            style={{ objectFit: 'cover', height: '150px', width: '100%' }}
                            onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                          />
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              </>
            )}

            <Card className="mt-4 border-0 shadow-sm" style={{
              borderRadius: '12px',
              overflow: 'hidden'
            }}>
              <Card.Img
                src={
                  product.designs?.[selectedDesign] 
                    ? (product.designs[selectedDesign].startsWith('http') 
                        ? product.designs[selectedDesign] 
                        : `${process.env.REACT_APP_API_URL}${product.designs[selectedDesign]}`)
                    : (product.image?.[selectedImage]
                        ? (product.image[selectedImage].startsWith('http') 
                            ? product.image[selectedImage] 
                            : `${process.env.REACT_APP_API_URL}${product.image[selectedImage]}`) 
                        : '/placeholder.jpg')
                }
                alt={`${product.name} main image`}
                style={{
                  objectFit: 'contain',
                  height: '400px',
                  width: '100%',
                  backgroundColor: '#f8f9fa'
                }}
                onError={e => { e.target.src = '/placeholder.jpg'; }}
              />
            </Card>
          </Col>

          {/* Product Details */}
          <Col md={6}>
            <Stack gap={3}>
              <div>
                <Badge
                  bg="light"
                  text="dark"
                  className="mb-2"
                  style={{
                    background: logoColors.softGradient,
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    color: logoColors.dark,
                    fontWeight: '500'
                  }}
                >
                  {typeof product.category === 'object' ? product.category.name : product.category}
                </Badge>
                <h1 className="display-5 fw-bold" style={{ color: '#2D3748' }}>{product.name}</h1>
                {product.stock > 0 ? (
                  <Badge
                    className="mb-3"
                    style={{
                      background: logoColors.primary,
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '20px'
                    }}
                  >
                    In Stock
                  </Badge>
                ) : (
                  <Badge
                    bg="danger"
                    className="mb-3"
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '20px'
                    }}
                  >
                    Out of Stock
                  </Badge>
                )}
              </div>

              <div className="d-flex align-items-center gap-3">
                <h3 className="mb-0" style={{ color: logoColors.primary }}>
                  Rs. {product.discountedPrice}
                </h3>
                {product.originalPrice && product.originalPrice > product.discountedPrice && (
                  <del className="text-muted" style={{ color: '#718096' }}>Rs. {product.originalPrice}</del>
                )}
              </div>

              {/* Rating Display */}
              <div className="d-flex align-items-center mt-2">
                <div className="d-flex me-2">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      style={{
                        color: product.averageRating > i ? logoColors.primary : '#ccc',
                        fontSize: '1.2rem'
                      }}
                    >
                      {product.averageRating > i ? '★' : '☆'}
                    </span>
                  ))}
                </div>
                <span className="text-muted" style={{ color: '#718096' }}>
                  ({product.reviewCount} reviews)
                </span>
              </div>

              {/* Product Variants - Sizes and Colors */}
              {(product.variants?.sizes?.length > 0 || product.variants?.colors?.length > 0) && (
                <div className="mt-3">
                  {product.variants?.sizes?.length > 0 && (
                    <Form.Group className="mb-3">
                      <Form.Label style={{ color: '#4A5568', fontWeight: '500' }}>Size:</Form.Label>
                      <div className="d-flex gap-2 flex-wrap">
                        {product.variants.sizes.map((size, index) => (
                          <Button
                            key={index}
                            variant={selectedSize === size ? "primary" : "outline-secondary"}
                            size="sm"
                            onClick={() => setSelectedSize(size)}
                            style={{
                              borderRadius: '8px',
                              borderColor: selectedSize === size ? logoColors.primary : '#e2e8f0',
                              background: selectedSize === size ? logoColors.gradient : 'transparent',
                              color: selectedSize === size ? 'white' : '#4A5568'
                            }}
                          >
                            {size}
                          </Button>
                        ))}
                      </div>
                    </Form.Group>
                  )}
                  {product.variants?.colors?.length > 0 && (
                    <Form.Group className="mb-3">
                      <Form.Label style={{ color: '#4A5568', fontWeight: '500' }}>Color:</Form.Label>
                      <div className="d-flex gap-2 flex-wrap">
                        {product.variants.colors.map((color, index) => (
                          <Button
                            key={index}
                            variant={selectedColor === color ? "primary" : "outline-secondary"}
                            size="sm"
                            onClick={() => setSelectedColor(color)}
                            style={{
                              borderRadius: '8px',
                              borderColor: selectedColor === color ? logoColors.primary : '#e2e8f0',
                              background: selectedColor === color ? logoColors.gradient : 'transparent',
                              color: selectedColor === color ? 'white' : '#4A5568'
                            }}
                          >
                            {color}
                          </Button>
                        ))}
                      </div>
                    </Form.Group>
                  )}
                </div>
              )}

              {/* Quantity Selector */}
              {product.stock > 0 && (
                <Form.Group controlId="quantity" className="mt-3">
                  <Form.Label style={{ color: '#4A5568', fontWeight: '500' }}>Quantity:</Form.Label>
                  <div className="d-flex align-items-center">
                    <Button
                      variant="outline-secondary"
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      style={{ borderRadius: '8px 0 0 8px', borderColor: '#e2e8f0' }}
                    >
                      -
                    </Button>
                    <Form.Control
                      type="number"
                      min="1"
                      max={product.stock}
                      value={quantity}
                      onChange={handleQuantityChange}
                      className="text-center"
                      style={{
                        width: '60px',
                        borderRadius: '0',
                        borderColor: '#e2e8f0',
                        borderLeft: 'none',
                        borderRight: 'none'
                      }}
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                      style={{ borderRadius: '0 8px 8px 0', borderColor: '#e2e8f0' }}
                    >
                      +
                    </Button>
                  </div>
                  <Form.Text className="text-muted" style={{ color: '#718096' }}>
                    Max {product.stock} available
                  </Form.Text>
                </Form.Group>
              )}

              <Stack direction="horizontal" gap={3} className="mt-4">
                {product.stock > 0 ? (
                  <>
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleOrderNow}
                      style={{
                        background: 'linear-gradient(135deg, #FF4B5C 0%, #E63946 100%)',
                        border: 'none',
                        flex: 1,
                        padding: '0.9rem',
                        borderRadius: '12px',
                        fontWeight: '700',
                        fontSize: '1rem',
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase',
                        boxShadow: '0 4px 15px rgba(230,57,70,0.3)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(230,57,70,0.45)';
                        e.currentTarget.style.filter = 'brightness(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(230,57,70,0.3)';
                        e.currentTarget.style.filter = 'none';
                      }}
                    >
                      Order Now
                    </Button>
                    <Button
                      variant="outline-primary"
                      size="lg"
                      onClick={() => {
                        handleAddToCart();
                      }}
                      style={{
                        borderColor: '#E63946',
                        color: '#E63946',
                        background: 'white',
                        flex: 1,
                        padding: '0.9rem',
                        borderRadius: '12px',
                        fontWeight: '700',
                        fontSize: '1rem',
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase',
                        borderWidth: '2px',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#FFF5F5';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(230,57,70,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'white';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      data-track="add_to_cart"
                    >
                      Add to Cart
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="secondary"
                    size="lg"
                    disabled
                    style={{ width: '100%' }}
                  >
                    Currently Unavailable
                  </Button>
                )}
              </Stack>

              {/* Promotional Icons */}
              <div className="mt-4 pt-4 border-top">
                <Row className="text-center g-2">
                  <Col xs={4}>
                    <div className="d-flex flex-column align-items-center">
                      <FiTruck size={24} className="mb-2" />
                      <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>7 Day Delivery</div>
                      <div style={{ fontSize: '0.7rem', color: '#718096' }}>Fast Shipping</div>
                    </div>
                  </Col>
                  <Col xs={4} style={{ borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0' }}>
                    <div className="d-flex flex-column align-items-center">
                      <FiShield size={24} className="mb-2" />
                      <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>Verified Products</div>
                      <div style={{ fontSize: '0.7rem', color: '#718096' }}>Quality Assured</div>
                    </div>
                  </Col>
                  <Col xs={4}>
                    <div className="d-flex flex-column align-items-center">
                      <FiRotateCcw size={24} className="mb-2" />
                      <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>Easy Returns</div>
                      <div style={{ fontSize: '0.7rem', color: '#718096' }}>Hassle-Free Returns</div>
                    </div>
                  </Col>
                </Row>
              </div>

              {/* Description - Below Order Now/Add to Cart buttons */}
              <div className="mt-4">
                <h5 style={{ color: logoColors.dark, marginBottom: '0.5rem' }}>Description</h5>
                <p className="text-muted" style={{ color: '#4A5568', lineHeight: '1.8' }}>{product.description}</p>
              </div>
            </Stack>
          </Col>
        </Row>

        {/* Reviews Section */}
        <Row className="mt-5">
          <Col md={12}>
            <Card className="mb-4 border-0 shadow-sm" style={{
              borderRadius: '12px',
              background: 'white'
            }}>
              <Card.Body style={{ padding: '2rem' }}>
                <h4 style={{ color: logoColors.dark, marginBottom: '1.5rem' }}>Write a Review</h4>
                {reviewError && <Alert variant="danger">{reviewError}</Alert>}
                {reviewSuccess && <Alert variant="success">{reviewSuccess}</Alert>}

                <Form onSubmit={handleReviewSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ color: '#4A5568', fontWeight: '500' }}>Your Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="userName"
                          value={reviewForm.userName}
                          onChange={handleReviewChange}
                          required
                          style={{
                            borderRadius: '8px',
                            borderColor: '#e2e8f0'
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ color: '#4A5568', fontWeight: '500' }}>Your Email</Form.Label>
                        <Form.Control
                          type="email"
                          name="userEmail"
                          value={reviewForm.userEmail}
                          onChange={handleReviewChange}
                          required
                          style={{
                            borderRadius: '8px',
                            borderColor: '#e2e8f0'
                          }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: '#4A5568', fontWeight: '500' }}>Rating</Form.Label>
                    <div className="d-flex">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          style={{
                            cursor: 'pointer',
                            color: reviewForm.rating > i ? logoColors.primary : '#ccc',
                            fontSize: '1.5rem',
                            transition: 'color 0.2s ease'
                          }}
                          onClick={() => handleRatingChange(i + 1)}
                          onMouseEnter={(e) => {
                            if (reviewForm.rating <= i) {
                              e.target.style.color = logoColors.light;
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (reviewForm.rating <= i) {
                              e.target.style.color = '#ccc';
                            }
                          }}
                        >
                          {reviewForm.rating > i ? '★' : '☆'}
                        </span>
                      ))}
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: '#4A5568', fontWeight: '500' }}>Review</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="comment"
                      value={reviewForm.comment}
                      onChange={handleReviewChange}
                      required
                      style={{
                        borderRadius: '8px',
                        borderColor: '#e2e8f0'
                      }}
                    />
                  </Form.Group>

                  <Button
                    type="submit"
                    variant="primary"
                    style={{
                      background: logoColors.gradient,
                      border: 'none',
                      padding: '0.75rem 2rem',
                      borderRadius: '8px',
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
                    Submit Review
                  </Button>
                </Form>
              </Card.Body>
            </Card>

            {/* Reviews List */}
            <h4 style={{ color: logoColors.dark, marginBottom: '1.5rem' }}>Customer Reviews</h4>
            {reviews.length === 0 ? (
              <p style={{ color: '#718096' }}>No reviews yet. Be the first to review!</p>
            ) : (
              <ListGroup variant="flush">
                {reviews.map((review) => (
                  <ListGroup.Item key={review._id} className="px-0 mb-3" style={{ background: 'transparent' }}>
                    <Card className="border-0 shadow-sm" style={{
                      borderRadius: '12px',
                      background: 'white'
                    }}>
                      <Card.Body style={{ padding: '1.5rem' }}>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <div>
                            <strong style={{ color: '#2D3748' }}>{review.userName}</strong>
                            <small className="text-muted ms-2" style={{ color: '#718096' }}>{review.userEmail}</small>
                          </div>
                          <div className="d-flex">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                style={{
                                  color: review.rating > i ? logoColors.primary : '#ccc',
                                  fontSize: '1.2rem'
                                }}
                              >
                                {review.rating > i ? '★' : '☆'}
                              </span>
                            ))}
                          </div>
                        </div>
                        <Card.Text style={{ color: '#4A5568', lineHeight: '1.6' }}>{review.comment}</Card.Text>
                        <small className="text-muted" style={{ color: '#718096' }}>
                          Reviewed on {new Date(review.createdAt).toLocaleDateString()}
                        </small>
                      </Card.Body>
                    </Card>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Col>
        </Row>

        {/* Recommended Products Section */}
        <Row className="mt-5">
          <Col>
            <RecommendedProducts
              currentProductId={product._id}
              category={typeof product.category === 'object' ? product.category.name : product.category}
            />
          </Col>
        </Row>
      </Container>
    </Container>
  );
}