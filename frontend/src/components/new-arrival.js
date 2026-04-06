import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Alert,
  Badge
} from 'react-bootstrap';
import { FaShoppingCart, FaBoxOpen, FaCalendarAlt, FaStar } from 'react-icons/fa';
import { CartContext } from '../components/CartContext';
import FilterComponent from './Filter';
import './heroSlider.css';

const logoColors = {
  primary: '#fe7e8b',
  secondary: '#e65c70',
  light: '#ffd1d4',
  dark: '#d64555',
  background: '#fff5f6',
  lighterBg: '#fff9fa',
  gradient: 'linear-gradient(135deg, #fe7e8b 0%, #e65c70 100%)',
  softGradient: 'linear-gradient(135deg, #fff5f6 0%, #ffd1d4 100%)',
};

const NewArrivals = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOption, setSortOption] = useState('default');
  const [isMobile, setIsMobile] = useState(false);
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/new-arrival`);
        const productsWithDefaults = response.data.map(product => ({
          ...product,
          stock: product.stock !== undefined ? product.stock : Math.floor(Math.random() * 16) + 5,
          rating: product.rating || (Math.random() * 1 + 4).toFixed(1),
          createdAt: product.createdAt ? new Date(product.createdAt) : new Date()
        }));
        setProducts(productsWithDefaults);
        setFilteredProducts(productsWithDefaults);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load new arrivals');
      } finally {
        setLoading(false);
      }
    };

    fetchNewArrivals();
  }, []);

  useEffect(() => {
    const sortProducts = () => {
      let sorted = [...products];
      switch (sortOption) {
        case 'price-high-low':
          sorted.sort((a, b) => b.discountedPrice - a.discountedPrice);
          break;
        case 'price-low-high':
          sorted.sort((a, b) => a.discountedPrice - b.discountedPrice);
          break;
        case 'rating-high':
          sorted.sort((a, b) => b.rating - a.rating);
          break;
        case 'newest':
          sorted.sort((a, b) => b.createdAt - a.createdAt);
          break;
        default:
          break;
      }
      setFilteredProducts(sorted);
    };
    sortProducts();
  }, [sortOption, products]);

  const handleAddToCart = (product) => {
    if (product.stock > 0) {
      addToCart({ ...product, quantity: 1 });
    }
  };

  const getProductImage = (product) => {
    if (!product?.image?.[0]) return '/placeholder.jpg';
    if (product.image[0].startsWith('http')) return product.image[0];
    return `${process.env.REACT_APP_API_URL}${product.image[0]}`;
  };

  return (
    <Container fluid className="new-arrivals-container py-3 py-md-5" style={{
      background: logoColors.background,
      minHeight: '100vh'
    }}>
      <Container>
        <div className="page-header-wrapper mb-3 mb-md-5 text-center">
          <h1 className="page-header" style={{
            color: logoColors.dark,
            fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
            fontWeight: '600'
          }}>
            <FaCalendarAlt className="me-2" style={{ color: logoColors.primary, fontSize: 'clamp(1.2rem, 4vw, 2rem)' }} />
            New Arrivals
          </h1>
          <p className="lead mt-2" style={{ color: '#4A5568', fontSize: 'clamp(0.9rem, 3vw, 1.1rem)' }}>
            Discover our latest products added in the last 30 days
          </p>
          <div style={{
            height: '2px',
            background: `linear-gradient(90deg, transparent, ${logoColors.primary}40, transparent)`,
            width: 'clamp(80px, 20vw, 200px)',
            margin: '1rem auto'
          }} />
        </div>

        <FilterComponent
          sortOption={sortOption}
          onSortChange={setSortOption}
        />

        {loading ? (
          <div className="text-center my-5 py-5">
            <Spinner animation="border" style={{ color: logoColors.primary }} />
            <p className="mt-3" style={{ color: '#4A5568' }}>Loading new arrivals...</p>
          </div>
        ) : error ? (
          <Alert variant="danger" className="text-center">{error}</Alert>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center my-5 py-5">
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: logoColors.softGradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem'
            }}>
              <FaCalendarAlt size={32} style={{ color: logoColors.primary }} />
            </div>
            <h4 style={{ color: logoColors.dark, marginBottom: '0.5rem' }}>No New Arrivals</h4>
            <p style={{ color: '#718096', fontSize: '1rem', maxWidth: '400px', margin: '0 auto' }}>
              Check back soon for our latest products!
            </p>
          </div>
        ) : (
          <>
            {/* Mobile grid */}
            <div className="d-block d-md-none">
              <Row xs={2} className="g-2">
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    isMobile={true}
                    onAddToCart={handleAddToCart}
                    onViewDetails={() => navigate(`/catalog/${product._id}`)}
                    getProductImage={getProductImage}
                  />
                ))}
              </Row>
            </div>

            {/* Desktop grid */}
            <div className="d-none d-md-block">
              <Row xs={1} sm={2} md={3} lg={4} className="g-4">
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    isMobile={false}
                    onAddToCart={handleAddToCart}
                    onViewDetails={() => navigate(`/catalog/${product._id}`)}
                    getProductImage={getProductImage}
                  />
                ))}
              </Row>
            </div>

            <div className="text-center mt-4">
              <p style={{ color: '#718096', fontSize: '0.85rem' }}>
                Showing {filteredProducts.length} new arrival{filteredProducts.length !== 1 ? 's' : ''}
              </p>
            </div>
          </>
        )}
      </Container>
    </Container>
  );
};

const ProductCard = ({ product, isMobile, onAddToCart, onViewDetails, getProductImage }) => {
  return (
    <Col>
      <Card
        className="product-card h-100 border-0"
        onClick={onViewDetails}
        style={{
          background: 'white',
          borderRadius: '8px',
          overflow: 'hidden',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          cursor: 'pointer',
          height: '100%',
          position: 'relative'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = `0 8px 16px ${logoColors.primary}20`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
        }}
      >
        {/* ── Image container ── */}
        <div
          className="product-image-container"
          style={{
            position: 'relative',
            width: '100%',
            // Mobile → 1/1 square (matches home page); Desktop → 3/4 portrait
            aspectRatio: isMobile ? '1 / 1' : '3 / 4',
            overflow: 'hidden',
            backgroundColor: '#f8f9fa'
          }}
        >
          <Card.Img
            variant="top"
            src={getProductImage(product)}
            alt={product.name}
            className="product-img"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.3s ease'
            }}
            onMouseEnter={(e) => { e.target.style.transform = 'scale(1.05)'; }}
            onMouseLeave={(e) => { e.target.style.transform = 'scale(1)'; }}
            onError={(e) => { e.target.src = '/placeholder.jpg'; }}
          />

          {/* Discount badge */}
          {product.discountedPrice < product.originalPrice && (
            <div style={{
              position: 'absolute',
              top: '8px',
              left: '8px',
              background: logoColors.gradient,
              color: 'white',
              padding: isMobile ? '2px 6px' : '4px 8px',
              borderRadius: '4px',
              fontSize: isMobile ? '0.6rem' : '0.7rem',
              fontWeight: '600',
              zIndex: 2,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              {Math.round(100 - (product.discountedPrice / product.originalPrice * 100))}% OFF
            </div>
          )}

          {/* New badge */}
          <div style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: logoColors.primary,
            color: 'white',
            padding: isMobile ? '2px 6px' : '4px 8px',
            borderRadius: '4px',
            fontSize: isMobile ? '0.6rem' : '0.65rem',
            fontWeight: '600',
            zIndex: 2,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            NEW
          </div>

          {/* Quick Add — desktop hover only */}
          <button
            onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
            className="d-none d-md-block"
            disabled={product.stock <= 0}
            style={{
              position: 'absolute',
              bottom: '10px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'white',
              border: `1px solid ${logoColors.primary}`,
              color: logoColors.primary,
              padding: '6px 12px',
              borderRadius: '30px',
              fontSize: '0.8rem',
              fontWeight: '500',
              cursor: product.stock > 0 ? 'pointer' : 'not-allowed',
              opacity: 0,
              transition: 'opacity 0.2s ease',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              zIndex: 3
            }}
            onMouseEnter={(e) => {
              if (product.stock > 0) {
                e.target.style.background = logoColors.primary;
                e.target.style.color = 'white';
              }
            }}
            onMouseLeave={(e) => {
              if (product.stock > 0) {
                e.target.style.background = 'white';
                e.target.style.color = logoColors.primary;
              }
            }}
          >
            <FaShoppingCart className="me-1" size={12} />
            Quick Add
          </button>

          <style>{`
            .product-card:hover .d-md-block { opacity: 1 !important; }
          `}</style>
        </div>

        {/* ── Card body ── */}
        <Card.Body
          className="d-flex flex-column"
          style={{ padding: isMobile ? '0.4rem' : '0.75rem' }}
        >
          {/* Title */}
          <Card.Title
            className="product-title"
            style={{
              fontSize: isMobile ? '0.72rem' : '0.9rem',
              fontWeight: '500',
              color: '#2D3748',
              marginBottom: '0.2rem',
              lineHeight: '1.3',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              minHeight: isMobile ? '2rem' : '2.5rem'
            }}
          >
            {product.name}
          </Card.Title>

          {/* Category — desktop only */}
          <Card.Text
            className="d-none d-md-block text-muted product-category"
            style={{
              fontSize: '0.75rem',
              marginBottom: '0.5rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            {typeof product.category === 'object'
              ? product.category.name
              : (product.category || 'Uncategorized')}
          </Card.Text>

          {/* Price */}
          <div className="price-wrapper mb-1">
            <div className="price d-flex align-items-center flex-wrap">
              {product.discountedPrice < product.originalPrice && (
                <span
                  className="original-price text-muted text-decoration-line-through me-1"
                  style={{ fontSize: isMobile ? '0.6rem' : '0.7rem' }}
                >
                  Rs. {product.originalPrice?.toLocaleString()}
                </span>
              )}
              <span
                className="current-price fw-bold"
                style={{
                  color: logoColors.primary,
                  fontSize: isMobile ? '0.78rem' : '0.95rem'
                }}
              >
                Rs. {product.discountedPrice?.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Rating */}
          <div className="rating-wrapper mb-1">
            <div className="rating d-flex align-items-center" style={{ fontSize: '0.7rem' }}>
              <FaStar style={{ color: logoColors.primary, fontSize: isMobile ? '0.6rem' : '0.7rem' }} />
              <span className="ms-1" style={{ color: '#4A5568', fontSize: isMobile ? '0.65rem' : '0.7rem' }}>
                {product.rating}
              </span>
            </div>
          </div>

          {/* Stock badge — mobile only */}
          <div className="d-md-none mb-1">
            <Badge
              bg={product.stock > 0 ? 'success' : 'danger'}
              style={{
                background: product.stock > 0 ? logoColors.primary : '#dc3545',
                border: 'none',
                fontSize: '0.55rem',
                padding: '2px 5px',
                fontWeight: '400'
              }}
            >
              {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
            </Badge>
          </div>

          {/* Add to Cart — mobile only */}
          <button
            onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
            className="d-md-none w-100"
            disabled={product.stock <= 0}
            style={{
              background: product.stock > 0 ? logoColors.gradient : '#e2e8f0',
              color: product.stock > 0 ? 'white' : '#718096',
              border: 'none',
              padding: '5px 0',
              borderRadius: '5px',
              fontSize: '0.7rem',
              fontWeight: '500',
              cursor: product.stock > 0 ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
              marginTop: 'auto'
            }}
          >
            {product.stock > 0 ? (
              <><FaShoppingCart className="me-1" size={10} />Add to Cart</>
            ) : (
              <><FaBoxOpen className="me-1" size={10} />Out of Stock</>
            )}
          </button>
        </Card.Body>
      </Card>
    </Col>
  );
};

export default NewArrivals;