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
  Form,
  ListGroup
} from 'react-bootstrap';
import { 
  FiTruck, 
  FiShield, 
  FiRotateCcw,
  FiShoppingCart,
  FiCheck
} from 'react-icons/fi';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import { useCart } from '../../components/CartContext';
import RecommendedProducts from '../../components/RecommendedProducts';

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
  const [activeTab, setActiveTab] = useState('description');
  const [reviewForm, setReviewForm] = useState({
    userName: '',
    userEmail: '',
    rating: 0,
    comment: ''
  });
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

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

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <>
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={`full-${i}`} style={{ color: C.red, fontSize: '0.9rem' }} />
        ))}
        {hasHalfStar && <FaStarHalfAlt style={{ color: C.red, fontSize: '0.9rem' }} />}
        {[...Array(emptyStars)].map((_, i) => (
          <FaRegStar key={`empty-${i}`} style={{ color: C.border, fontSize: '0.9rem' }} />
        ))}
      </>
    );
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <Spinner animation="border" style={{ color: C.red, width: '2.5rem', height: '2.5rem', borderWidth: '3px' }} />
          <p style={{ fontFamily: 'Barlow, sans-serif', color: C.gray, marginTop: '1rem' }}>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: C.white, padding: '2rem' }}>
        <Container>
          <Alert variant="danger" style={{ borderLeft: `4px solid ${C.red}`, borderRadius: '6px' }}>
            Error loading product: {error.message}
          </Alert>
        </Container>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ minHeight: '100vh', background: C.white, padding: '2rem' }}>
        <Container>
          <Alert variant="info" style={{ borderLeft: `4px solid ${C.red}`, borderRadius: '6px' }}>
            Product not found
          </Alert>
        </Container>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;500;600;700&display=swap');
        
        .product-details-page {
          min-height: 100vh;
          background: ${C.white};
          font-family: 'Barlow', sans-serif;
        }

        .quantity-input::-webkit-inner-spin-button,
        .quantity-input::-webkit-outer-spin-button {
          opacity: 1;
        }

        .tab-button {
          background: none;
          border: none;
          padding: 0.75rem 1.5rem;
          font-family: 'Barlow', sans-serif;
          font-size: 1rem;
          font-weight: 600;
          color: ${C.gray};
          cursor: pointer;
          transition: all 0.2s ease;
          border-bottom: 2px solid transparent;
        }
        .tab-button:hover {
          color: ${C.red};
        }
        .tab-button.active {
          color: ${C.red};
          border-bottom-color: ${C.red};
        }
      `}</style>

      <div className="product-details-page" style={{ padding: '2rem 0' }}>
        <Container>
          <Row className="g-5">
            {/* Product Images - Left Column */}
            <Col lg={6}>
              {/* Main Image */}
              <div style={{
                border: `1px solid ${C.border}`,
                borderRadius: '12px',
                overflow: 'hidden',
                marginBottom: '1rem',
                backgroundColor: C.lightGray
              }}>
                <img
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
                  alt={product.name}
                  style={{
                    width: '100%',
                    height: 'auto',
                    objectFit: 'contain',
                    padding: '2rem'
                  }}
                  onError={e => { e.target.src = '/placeholder.jpg'; }}
                />
              </div>

              {/* Thumbnail Images - Small size under main image */}
              {product.image?.length > 0 && (
                <div className="d-flex gap-2 justify-content-center">
                  {product.image.map((img, index) => {
                    const imgUrl = img.startsWith('http') ? img : `${process.env.REACT_APP_API_URL}${img}`;
                    return (
                      <div
                        key={`img-${index}`}
                        onClick={() => setSelectedImage(index)}
                        style={{
                          cursor: 'pointer',
                          border: index === selectedImage ? `2px solid ${C.red}` : `1px solid ${C.border}`,
                          borderRadius: '8px',
                          overflow: 'hidden',
                          transition: 'all 0.2s ease',
                          backgroundColor: C.lightGray,
                          width: '70px',
                          height: '70px',
                          flexShrink: 0
                        }}
                      >
                        <img
                          src={imgUrl}
                          alt={`${product.name} ${index + 1}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={e => { e.target.src = '/placeholder.jpg'; }}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </Col>

            {/* Product Info - Right Column */}
            <Col lg={6}>
              {/* Brand */}
              <div style={{ 
                fontSize: '0.75rem', 
                letterSpacing: '0.1em', 
                color: C.gray, 
                textTransform: 'uppercase',
                marginBottom: '0.5rem'
              }}>
                {typeof product.category === 'object' ? product.category.name : product.category}
              </div>

              {/* Title */}
              <h1 style={{ 
                fontFamily: 'Barlow, sans-serif', 
                fontSize: '2rem', 
                fontWeight: 700, 
                color: C.charcoal,
                marginBottom: '0.75rem'
              }}>
                {product.name}
              </h1>
              {/* Stock Status */}
              <div className="mb-4">
                {product.stock > 0 ? (
                  <span style={{ color: '#2e7d32', fontSize: '0.85rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FiCheck size={16} /> In Stock
                  </span>
                ) : (
                  <span style={{ color: C.red, fontSize: '0.85rem', fontWeight: 500 }}>
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Rating */}
              <div className="d-flex align-items-center gap-2 mb-3">
                <div className="d-flex gap-1">
                  {renderStars(product.averageRating || 0)}
                </div>
                <span style={{ color: C.gray, fontSize: '0.85rem' }}>
                  {product.reviewCount || 0} Reviews
                </span>
              </div>

              {/* Price */}
              <div className="d-flex align-items-center gap-3 mb-4">
                <span style={{ 
                  fontFamily: 'Barlow, sans-serif', 
                  fontSize: '1.75rem', 
                  fontWeight: 700, 
                  color: C.red 
                }}>
                  Rs. {product.discountedPrice?.toLocaleString()}
                </span>
                {product.originalPrice && product.originalPrice > product.discountedPrice && (
                  <span style={{ 
                    fontFamily: 'Barlow, sans-serif', 
                    fontSize: '1.1rem', 
                    color: C.gray, 
                    textDecoration: 'line-through' 
                  }}>
                    Rs. {product.originalPrice?.toLocaleString()}
                  </span>
                )}
              </div>

              {/* Design Options - Small size under price */}
              {product.designs?.length > 0 && (
                <div className="mb-4">
                  <label style={{ color: C.charcoal, fontWeight: 600, marginBottom: '0.5rem', display: 'block', fontSize: '0.85rem' }}>
                    Design Options
                  </label>
                  <div className="d-flex gap-2 flex-wrap">
                    {product.designs.map((design, index) => {
                      const designUrl = design.startsWith('http') ? design : `${process.env.REACT_APP_API_URL}${design}`;
                      return (
                        <div
                          key={`design-${index}`}
                          onClick={() => setSelectedDesign(index)}
                          style={{
                            cursor: 'pointer',
                            border: index === selectedDesign ? `2px solid ${C.red}` : `1px solid ${C.border}`,
                            borderRadius: '8px',
                            overflow: 'hidden',
                            transition: 'all 0.2s ease',
                            backgroundColor: C.lightGray,
                            width: '60px',
                            height: '60px'
                          }}
                        >
                          <img
                            src={designUrl}
                            alt={`Design ${index + 1}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={e => { e.target.src = '/placeholder.jpg'; }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Variants - Sizes and Colors */}
              {(product.variants?.sizes?.length > 0 || product.variants?.colors?.length > 0) && (
                <div className="mb-4">
                  {product.variants?.sizes?.length > 0 && (
                    <div className="mb-3">
                      <label style={{ color: C.charcoal, fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>
                        Size
                      </label>
                      <div className="d-flex gap-2 flex-wrap">
                        {product.variants.sizes.map((size, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedSize(size)}
                            style={{
                              padding: '0.5rem 1.2rem',
                              borderRadius: '30px',
                              border: selectedSize === size ? `1px solid ${C.red}` : `1px solid ${C.border}`,
                              background: selectedSize === size ? C.redLight : C.white,
                              color: selectedSize === size ? C.red : C.charcoal,
                              fontWeight: 500,
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {product.variants?.colors?.length > 0 && (
                    <div className="mb-3">
                      <label style={{ color: C.charcoal, fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>
                        Color
                      </label>
                      <div className="d-flex gap-2 flex-wrap">
                        {product.variants.colors.map((color, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedColor(color)}
                            style={{
                              padding: '0.5rem 1.2rem',
                              borderRadius: '30px',
                              border: selectedColor === color ? `1px solid ${C.red}` : `1px solid ${C.border}`,
                              background: selectedColor === color ? C.redLight : C.white,
                              color: selectedColor === color ? C.red : C.charcoal,
                              fontWeight: 500,
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {color}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Quantity */}
              {product.stock > 0 && (
                <div className="mb-4">
                  <label style={{ color: C.charcoal, fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>
                    Quantity
                  </label>
                  <div className="d-flex align-items-center">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      style={{
                        width: '40px',
                        height: '45px',
                        border: `1px solid ${C.border}`,
                        background: C.white,
                        borderRadius: '8px 0 0 8px',
                        cursor: 'pointer',
                        fontSize: '1.2rem'
                      }}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={product.stock}
                      value={quantity}
                      onChange={handleQuantityChange}
                      className="quantity-input"
                      style={{
                        width: '70px',
                        height: '45px',
                        border: `1px solid ${C.border}`,
                        borderLeft: 'none',
                        borderRight: 'none',
                        textAlign: 'center',
                        fontSize: '1rem',
                        outline: 'none'
                      }}
                    />
                    <button
                      onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                      style={{
                        width: '40px',
                        height: '45px',
                        border: `1px solid ${C.border}`,
                        background: C.white,
                        borderRadius: '0 8px 8px 0',
                        cursor: 'pointer',
                        fontSize: '1.2rem'
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="d-flex gap-3 mb-4">
                <button
                  onClick={handleOrderNow}
                  disabled={product.stock <= 0}
                  style={{
                    flex: 1,
                    background: C.gradient,
                    color: C.white,
                    border: 'none',
                    padding: '1rem',
                    borderRadius: '30px',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    cursor: product.stock > 0 ? 'pointer' : 'not-allowed',
                    opacity: product.stock > 0 ? 1 : 0.6,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (product.stock > 0) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = `0 4px 12px ${C.red}40`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  Buy Now
                </button>
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  style={{
                    flex: 1,
                    background: C.white,
                    color: C.red,
                    border: `2px solid ${C.red}`,
                    padding: '1rem',
                    borderRadius: '30px',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    cursor: product.stock > 0 ? 'pointer' : 'not-allowed',
                    opacity: product.stock > 0 ? 1 : 0.6,
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    if (product.stock > 0) {
                      e.target.style.background = C.redLight;
                      e.target.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = C.white;
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  <FiShoppingCart size={18} />
                  Add to Cart
                </button>
              </div>



              {/* Shipping Info */}
              <div className="pt-3 border-top" style={{ borderTopColor: C.border }}>
                <Row className="g-3 text-center">
                  <Col xs={4}>
                    <FiTruck size={20} color={C.red} />
                    <div style={{ fontSize: '0.7rem', color: C.charcoal, marginTop: '0.25rem' }}>Free Shipping</div>
                    <div style={{ fontSize: '0.6rem', color: C.gray }}>On orders over Rs. 5000</div>
                  </Col>
                  <Col xs={4}>
                    <FiShield size={20} color={C.red} />
                    <div style={{ fontSize: '0.7rem', color: C.charcoal, marginTop: '0.25rem' }}>Quality Guarantee</div>
                    <div style={{ fontSize: '0.6rem', color: C.gray }}>1 year warranty</div>
                  </Col>
                  <Col xs={4}>
                    <FiRotateCcw size={20} color={C.red} />
                    <div style={{ fontSize: '0.7rem', color: C.charcoal, marginTop: '0.25rem' }}>Easy Returns</div>
                    <div style={{ fontSize: '0.6rem', color: C.gray }}>7 days return policy</div>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>

          {/* Tabs Section - Only Description and Reviews */}
          <Row className="mt-5">
            <Col>
              <div style={{ borderBottom: `1px solid ${C.border}`, marginBottom: '1.5rem' }}>
                <button
                  className={`tab-button ${activeTab === 'description' ? 'active' : ''}`}
                  onClick={() => setActiveTab('description')}
                >
                  Description
                </button>
                <button
                  className={`tab-button ${activeTab === 'reviews' ? 'active' : ''}`}
                  onClick={() => setActiveTab('reviews')}
                >
                  Reviews ({reviews.length})
                </button>
              </div>

              {activeTab === 'description' && (
                <div>
                  <p style={{ color: C.charcoal, lineHeight: 1.7, fontSize: '1rem' }}>
                    {product.description}
                  </p>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div>
                  {/* Write Review Form */}
                  <Card className="mb-4 border-0 shadow-sm" style={{ borderRadius: '12px', border: `1px solid ${C.border}` }}>
                    <Card.Body style={{ padding: '1.5rem' }}>
                      <h5 style={{ color: C.charcoal, marginBottom: '1rem' }}>Write a Review</h5>
                      {reviewError && <Alert variant="danger">{reviewError}</Alert>}
                      {reviewSuccess && <Alert variant="success">{reviewSuccess}</Alert>}

                      <Form onSubmit={handleReviewSubmit}>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label style={{ color: C.charcoal, fontWeight: 500 }}>Your Name</Form.Label>
                              <Form.Control
                                type="text"
                                name="userName"
                                value={reviewForm.userName}
                                onChange={handleReviewChange}
                                required
                                style={{ borderRadius: '6px', borderColor: C.border }}
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label style={{ color: C.charcoal, fontWeight: 500 }}>Your Email</Form.Label>
                              <Form.Control
                                type="email"
                                name="userEmail"
                                value={reviewForm.userEmail}
                                onChange={handleReviewChange}
                                required
                                style={{ borderRadius: '6px', borderColor: C.border }}
                              />
                            </Form.Group>
                          </Col>
                        </Row>

                        <Form.Group className="mb-3">
                          <Form.Label style={{ color: C.charcoal, fontWeight: 500 }}>Rating</Form.Label>
                          <div className="d-flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <FaStar
                                key={star}
                                size={24}
                                style={{
                                  cursor: 'pointer',
                                  color: (hoverRating >= star || reviewForm.rating >= star) ? C.red : C.border,
                                  transition: 'color 0.2s ease'
                                }}
                                onClick={() => handleRatingChange(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                              />
                            ))}
                          </div>
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label style={{ color: C.charcoal, fontWeight: 500 }}>Your Review</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={4}
                            name="comment"
                            value={reviewForm.comment}
                            onChange={handleReviewChange}
                            required
                            style={{ borderRadius: '6px', borderColor: C.border }}
                          />
                        </Form.Group>

                        <Button
                          type="submit"
                          style={{
                            background: C.gradient,
                            border: 'none',
                            padding: '0.6rem 1.5rem',
                            borderRadius: '6px',
                            fontWeight: 500
                          }}
                          onMouseEnter={(e) => { e.target.style.opacity = '0.9'; }}
                          onMouseLeave={(e) => { e.target.style.opacity = '1'; }}
                        >
                          Submit Review
                        </Button>
                      </Form>
                    </Card.Body>
                  </Card>

                  {/* Reviews List */}
                  {reviews.length === 0 ? (
                    <p style={{ color: C.gray, textAlign: 'center', padding: '2rem' }}>No reviews yet. Be the first to review!</p>
                  ) : (
                    <ListGroup variant="flush">
                      {reviews.map((review) => (
                        <ListGroup.Item key={review._id} style={{ background: 'transparent', borderBottom: `1px solid ${C.border}`, padding: '1rem 0' }}>
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <strong style={{ color: C.charcoal }}>{review.userName}</strong>
                              <small className="ms-2" style={{ color: C.gray }}>{review.userEmail}</small>
                            </div>
                            <div className="d-flex gap-1">
                              {[...Array(5)].map((_, i) => (
                                <FaStar key={i} size={14} style={{ color: review.rating > i ? C.red : C.border }} />
                              ))}
                            </div>
                          </div>
                          <p style={{ color: C.charcoal, marginBottom: '0.5rem' }}>{review.comment}</p>
                          <small style={{ color: C.gray }}>
                            {new Date(review.createdAt).toLocaleDateString()}
                          </small>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  )}
                </div>
              )}
            </Col>
          </Row>

          {/* Recommended Products */}
          <Row className="mt-5">
            <Col>
              <h3 style={{ 
                fontFamily: 'Barlow, sans-serif', 
                fontSize: '1.5rem', 
                fontWeight: 600, 
                color: C.charcoal,
                marginBottom: '1.5rem'
              }}>
                You May Also Like
              </h3>
              <RecommendedProducts
                currentProductId={product._id}
                category={typeof product.category === 'object' ? product.category.name : product.category}
              />
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
}