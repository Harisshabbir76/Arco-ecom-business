import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

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

const RecommendedProducts = ({ currentProductId, category }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendedProducts = async () => {
      try {
        if (!category) {
          setLoading(false);
          return;
        }

        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/catalog?category=${encodeURIComponent(typeof category === 'object' ? category.name : category)}`
        );

        let productList = [];
        if (Array.isArray(res.data)) {
          productList = res.data;
        } else if (res.data && Array.isArray(res.data.products)) {
          productList = res.data.products;
        } else if (res.data && Array.isArray(res.data.data)) {
          productList = res.data.data;
        }

        const filteredProducts = productList
          .filter(product => product._id !== currentProductId)
          .slice(0, 4);

        setProducts(filteredProducts);
      } catch (err) {
        console.error('Error fetching recommended products:', err);
        setError(err.message || 'Failed to load recommendations');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedProducts();
  }, [category, currentProductId]);

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <div className="d-flex gap-1">
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={`full-${i}`} style={{ color: C.red, fontSize: '0.7rem' }} />
        ))}
        {hasHalfStar && <FaStarHalfAlt style={{ color: C.red, fontSize: '0.7rem' }} />}
        {[...Array(emptyStars)].map((_, i) => (
          <FaRegStar key={`empty-${i}`} style={{ color: C.border, fontSize: '0.7rem' }} />
        ))}
      </div>
    );
  };

  if (!category) {
    return null;
  }

  if (loading) {
    return (
      <div className="text-center my-5 py-3">
        <Spinner animation="border" style={{ color: C.red, width: '2rem', height: '2rem', borderWidth: '2px' }} />
        <p style={{ fontFamily: 'Barlow, sans-serif', color: C.gray, marginTop: '0.75rem', fontSize: '0.8rem' }}>
          Loading recommendations...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="warning" className="my-4" style={{ borderLeft: `4px solid ${C.red}`, borderRadius: '6px' }}>
        {error}
      </Alert>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <h4 style={{ 
        fontFamily: 'Barlow, sans-serif', 
        fontSize: '1.25rem', 
        fontWeight: 600, 
        color: C.charcoal,
        marginBottom: '1.25rem'
      }}>
        You May Also Like
      </h4>
      <Row className="g-3">
        {products.map((product) => {
          const imageUrl = product.image?.[0]?.startsWith('http')
            ? product.image[0]
            : `${process.env.REACT_APP_API_URL}${product.image?.[0] || ''}`;

          const discountPct = product.discountedPrice < product.originalPrice
            ? Math.round(((product.originalPrice - product.discountedPrice) / product.originalPrice) * 100)
            : null;

          return (
            <Col key={product._id} xs={6} md={3}>
              <Card
                as={Link}
                to={`/product/${product._id}`}
                className="h-100 text-decoration-none border-0"
                style={{
                  borderRadius: '12px',
                  overflow: 'hidden',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                  cursor: 'pointer',
                  border: `1px solid ${C.border}`,
                  background: C.white
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = `0 8px 20px ${C.red}20`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ position: 'relative' }}>
                  <Card.Img
                    variant="top"
                    src={imageUrl}
                    alt={product.name}
                    style={{
                      height: '180px',
                      objectFit: 'cover',
                      width: '100%',
                      backgroundColor: C.lightGray
                    }}
                    onError={(e) => {
                      e.target.src = '/placeholder.jpg';
                    }}
                  />
                  {discountPct && (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      background: C.gradient,
                      color: C.white,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      zIndex: 2
                    }}>
                      -{discountPct}%
                    </div>
                  )}
                </div>
                <Card.Body style={{ padding: '0.75rem' }}>
                  <Card.Title style={{
                    fontFamily: 'Barlow, sans-serif',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: C.charcoal,
                    marginBottom: '0.25rem',
                    lineHeight: 1.3,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    minHeight: '2.2rem'
                  }}>
                    {product.name}
                  </Card.Title>
                  
                  {product.averageRating > 0 && (
                    <div className="d-flex align-items-center gap-1 mb-1">
                      {renderStars(product.averageRating)}
                      <span style={{ fontSize: '0.65rem', color: C.gray }}>
                        ({product.reviewCount || 0})
                      </span>
                    </div>
                  )}

                  <div className="d-flex align-items-center gap-2">
                    <span style={{
                      fontFamily: 'Barlow, sans-serif',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      color: C.red
                    }}>
                      Rs. {(product.discountedPrice || product.price)?.toLocaleString()}
                    </span>
                    {product.discountedPrice < product.originalPrice && (
                      <span style={{
                        fontFamily: 'Barlow, sans-serif',
                        fontSize: '0.7rem',
                        color: C.gray,
                        textDecoration: 'line-through'
                      }}>
                        Rs. {product.originalPrice?.toLocaleString()}
                      </span>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default RecommendedProducts;