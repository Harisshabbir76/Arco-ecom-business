import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Card, Spinner, Alert, Button, Badge } from 'react-bootstrap';
import { FaShoppingCart, FaBoxOpen, FaStar, FaSearch } from 'react-icons/fa';
import { CartContext } from '../../../components/CartContext';
import FilterComponent from '../../../components/Filter';
import '../../../App.css';

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

export default function CategoryProducts() {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOption, setSortOption] = useState('newest');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!categoryName) return;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/category/${encodeURIComponent(categoryName)}`);

        if (!res.data || res.data.length === 0) {
          setProducts([]);
          setFilteredProducts([]);
        } else {
          const productsWithDefaults = res.data.map(product => ({
            ...product,
            stock: product.stock !== undefined ? product.stock : Math.floor(Math.random() * 16) + 5,
            rating: product.rating || (Math.random() * 1 + 4).toFixed(1),
            createdAt: product.createdAt ? new Date(product.createdAt) : new Date()
          }));
          setProducts(productsWithDefaults);
          setFilteredProducts(productsWithDefaults);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        if (err.response?.status === 404) {
          setProducts([]);
          setFilteredProducts([]);
        } else {
          setError(err.message || 'Failed to load products');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryName]);

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
    return `${process.env.REACT_APP_API_URL}${product.image[0].startsWith('/') ? '' : '/'}${product.image[0]}`;
  };

  const renderProductCard = (product) => (
    <Col key={product._id} xs={6} md={4} lg={3} className="mb-3 mb-md-4">
      <Card
        className="product-card h-100 border-0"
        onClick={() => product.stock > 0 && navigate(`/category/${categoryName}/${product.slug || product._id}`)}
        style={{
          background: 'white',
          borderRadius: '8px',
          overflow: 'hidden',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          cursor: product.stock > 0 ? 'pointer' : 'default',
          height: '100%',
          position: 'relative'
        }}
        onMouseEnter={(e) => {
          if (product.stock > 0) {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = `0 8px 16px ${logoColors.primary}20`;
          }
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
            // Square on mobile (2-col grid), portrait on desktop
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
            onMouseEnter={(e) => {
              if (product.stock > 0) e.target.style.transform = 'scale(1.05)';
            }}
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
              {Math.round(100 - (product.discountedPrice / product.originalPrice) * 100)}% OFF
            </div>
          )}

          {/* Quick Add — desktop hover only */}
          <button
            onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
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
                Rs. {product.discountedPrice || product.price?.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Rating */}
          <div className="rating-wrapper mb-1">
            <div className="rating d-flex align-items-center">
              <FaStar style={{ color: logoColors.primary, fontSize: isMobile ? '0.6rem' : '0.7rem' }} />
              <span
                className="ms-1"
                style={{ color: '#4A5568', fontSize: isMobile ? '0.65rem' : '0.7rem' }}
              >
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
            className={`d-md-none w-100 ${product.stock <= 0 ? 'disabled' : ''}`}
            onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
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
              <><FaShoppingCart className="me-1" size={10} />Add</>
            ) : (
              <><FaBoxOpen className="me-1" size={10} />Out of Stock</>
            )}
          </button>
        </Card.Body>
      </Card>
    </Col>
  );

  return (
    <Container fluid className="category-products-page py-3 py-md-5" style={{
      background: logoColors.background,
      minHeight: '100vh'
    }}>
      <Container>
        <div className="page-header-wrapper mb-3 mb-md-5 text-center">
          <h1 className="page-header" style={{
            color: logoColors.dark,
            textTransform: 'capitalize',
            fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
            fontWeight: '600'
          }}>
            Featuring <span style={{ color: logoColors.primary }}>{categoryName}</span>
          </h1>
          <div style={{
            height: '2px',
            background: `linear-gradient(90deg, transparent, ${logoColors.primary}40, transparent)`,
            width: 'clamp(80px, 20vw, 150px)',
            margin: '0.5rem auto 1.5rem auto'
          }} />
        </div>

        {products.length > 0 && (
          <FilterComponent
            sortOption={sortOption}
            onSortChange={setSortOption}
          />
        )}

        {loading ? (
          <div className="text-center my-5 py-5">
            <Spinner animation="border" style={{ color: logoColors.primary }} />
            <p className="mt-3" style={{ color: '#4A5568' }}>Loading products...</p>
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
              <FaSearch size={32} style={{ color: logoColors.primary }} />
            </div>
            <h4 style={{ color: logoColors.dark, marginBottom: '0.5rem' }}>No Products Found</h4>
            <p style={{ color: '#718096', fontSize: '1rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
              We couldn't find any products in the "{categoryName}" category.
              Please check back later or browse other categories.
            </p>
            <Button
              onClick={() => navigate('/catalog')}
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
              Browse All Products
            </Button>
          </div>
        ) : (
          <>
            <div className="d-block d-md-none">
              <Row xs={2} className="g-2">
                {filteredProducts.map(product => renderProductCard(product))}
              </Row>
            </div>

            <div className="d-none d-md-block">
              <Row xs={1} sm={2} md={3} lg={4} className="g-4">
                {filteredProducts.map(product => renderProductCard(product))}
              </Row>
            </div>

            {filteredProducts.length > 0 && (
              <div className="text-center mt-4">
                <p style={{ color: '#718096', fontSize: '0.85rem' }}>
                  Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} in {categoryName}
                </p>
              </div>
            )}
          </>
        )}
      </Container>
    </Container>
  );
}