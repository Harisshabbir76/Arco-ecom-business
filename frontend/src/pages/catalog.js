import React, { useContext, useEffect, useState } from 'react';
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
import { FaShoppingCart, FaBoxOpen, FaStar } from 'react-icons/fa';
import { CartContext } from '../components/CartContext';
import FilterComponent from '../components/Filter';
import '../App.css';

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

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOption, setSortOption] = useState('default');
  const [isMobile, setIsMobile] = useState(false);
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/catalog`);
        const data = res.data;

        let products = [];

        if (Array.isArray(data)) {
          products = data;
        } else if (data && Array.isArray(data.data)) {
          products = data.data;
        } else if (data && Array.isArray(data.products)) {
          products = data.products;
        } else {
          throw new Error('Unexpected API response: expected an array of products');
        }

        const processedProducts = products.map(product => ({
          ...product,
          stock: product.stock !== undefined ? product.stock : 0,
          rating: product.averageRating || 0,
          reviewCount: product.reviewCount || 0,
          price: product.discountedPrice || product.price || 0,
          createdAt: product.createdAt ? new Date(product.createdAt) : new Date()
        }));

        setProducts(processedProducts);
        setFilteredProducts(processedProducts);

        const uniqueCategories = [...new Set(processedProducts.map(p => {
          if (typeof p.category === 'object' && p.category !== null) return p.category.name;
          return p.category;
        }).filter(Boolean))];
        setCategories(uniqueCategories);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load products');
        console.error('Fetch products error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (products.length === 0) return;

    let filtered = [...products];

    if (selectedCategory) {
      filtered = filtered.filter(p => {
        const catName = typeof p.category === 'object' ? p.category.name : p.category;
        return catName === selectedCategory;
      });
    }

    switch (sortOption) {
      case 'price-high-low':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'price-low-high':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'rating-high':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        filtered.sort((a, b) => b.createdAt - a.createdAt);
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
  }, [sortOption, products, selectedCategory]);

  const handleSortChange = (option) => {
    setSortOption(option);
  };

  const getProductImage = (product) => {
    if (!product?.image?.[0]) return '/placeholder.jpg';
    if (product.image[0].startsWith('http')) return product.image[0];
    return `${process.env.REACT_APP_API_URL}${product.image[0]}`;
  };

  const handleAddToCart = (product) => {
    if (product.stock > 0) {
      addToCart({ ...product, quantity: 1 });
    }
  };

  const renderProductCard = (product) => (
    <Col key={product._id || product.id} xs={6} md={4} lg={3} className="mb-3 mb-md-4">
      <Card
        className="product-card h-100 border-0"
        onClick={() => navigate(`/catalog/${product.slug || product._id}`)}
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
              {Math.round(100 - (product.discountedPrice / product.originalPrice) * 100)}% OFF
            </div>
          )}

          {/* Quick Add — desktop hover only */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart(product);
            }}
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
                {product.rating.toFixed(1)}
              </span>
              {product.reviewCount > 0 && (
                <small
                  className="text-muted ms-1"
                  style={{ color: '#718096', fontSize: isMobile ? '0.6rem' : '0.65rem' }}
                >
                  ({product.reviewCount})
                </small>
              )}
            </div>
          </div>

          {/* Add to Cart — mobile only */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart(product);
            }}
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
    <Container fluid className="catalog-page py-3 py-md-5" style={{
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
            Our Products
          </h1>
          <div style={{
            height: '2px',
            background: `linear-gradient(90deg, transparent, ${logoColors.primary}40, transparent)`,
            width: 'clamp(80px, 20vw, 150px)',
            margin: '0.5rem auto 1.5rem auto'
          }} />
        </div>

        <FilterComponent
          sortOption={sortOption}
          onSortChange={handleSortChange}
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

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
              <FaBoxOpen size={32} style={{ color: logoColors.primary }} />
            </div>
            <h4 style={{ color: logoColors.dark, marginBottom: '0.5rem' }}>No Products Found</h4>
            <p style={{ color: '#718096', fontSize: '1rem', maxWidth: '400px', margin: '0 auto' }}>
              Try adjusting your filters or check back later for new products.
            </p>
          </div>
        ) : (
          <Row className="g-2 g-md-4">
            {filteredProducts.map(product => renderProductCard(product))}
          </Row>
        )}

        {filteredProducts.length > 0 && (
          <div className="text-center mt-4">
            <p style={{ color: '#718096', fontSize: '0.85rem' }}>
              Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </Container>
    </Container>
  );
}