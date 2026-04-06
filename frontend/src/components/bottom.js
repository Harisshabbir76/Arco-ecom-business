import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { FaStar, FaShoppingCart, FaBoxOpen } from 'react-icons/fa';
import { useCart } from '../components/CartContext';
import './heroSlider.css';
import { useNavigate } from 'react-router-dom';

// Navbar color palette
const logoColors = {
  primary: '#fe7e8b', // Navbar primary color
  secondary: '#e65c70', // Navbar secondary color
  light: '#ffd1d4', // Navbar light color
  dark: '#d64555', // Navbar dark color
  background: '#fff5f6', // Super light - almost white
  gradient: 'linear-gradient(135deg, #fe7e8b 0%, #e65c70 100%)', // Navbar gradient
  softGradient: 'linear-gradient(135deg, #fff5f6 0%, #ffd1d4 100%)', // Very soft gradient
};

export default function BottomProducts() {
  const [bottoms, setBottoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/catalog`);
        const data = res.data;

        console.log('API response:', data);

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

        const filtered = products.filter(p => {
          const cat = typeof p?.category === 'object' ? p.category.name : p?.category;
          return cat?.toLowerCase()?.includes('bottom');
        });

        setBottoms(filtered);
        setError(filtered.length === 0 ? 'No bottoms found' : null);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message || 'Failed to load products');
        setBottoms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = (product) => {
    addToCart({
      ...product,
      quantity: 1,
    });
  };

  // Helper function to get correct image URL
  const getProductImage = (product) => {
    if (!product?.image?.[0]) return '/placeholder.jpg';

    // If it's already a full URL
    if (product.image[0].startsWith('http')) {
      return product.image[0];
    }

    // Remove any double slashes and ensure correct path
    const imagePath = product.image[0].startsWith('/')
      ? product.image[0]
      : `/${product.image[0]}`;

    return `${process.env.REACT_APP_API_URL}${imagePath}`;
  };

  const renderProductCard = (product) => (
    <Col key={product._id || product.id}>
      <Card className="product-card h-100 border-0" style={{
        background: 'white',
        borderRadius: '12px',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        cursor: 'pointer'
      }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.boxShadow = `0 8px 20px ${logoColors.primary}30`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
        }}>
        <div className="product-image-container" style={{ position: 'relative' }}>
          <Card.Img
            onClick={() => navigate(`/catalog/${product._id}`)}
            variant="top"
            src={getProductImage(product)}
            alt={product.name}
            className="product-img"
            style={{
              height: '200px',
              objectFit: 'cover',
              transition: 'transform 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
            }}
            onError={(e) => {
              e.target.src = '/placeholder.jpg';
            }}
          />
          {product.discountedPrice < product.originalPrice && (
            <div style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              background: logoColors.gradient,
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              zIndex: 1
            }}>
              {Math.round(100 - (product.discountedPrice / product.originalPrice) * 100)}% OFF
            </div>
          )}
        </div>
        <Card.Body className="d-flex flex-column" style={{ padding: '1rem' }}>
          <Card.Title
            className="product-title"
            style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: '#2D3748',
              marginBottom: '0.25rem',
              cursor: 'pointer'
            }}
            onClick={() => navigate(`/catalog/${product._id}`)}
          >
            {product.name}
          </Card.Title>
          <Card.Text className="product-category" style={{
            fontSize: '0.85rem',
            marginBottom: '0.5rem',
            color: '#718096'
          }}>
            {typeof product.category === 'object' ? product.category.name : (product.category || 'Uncategorized')}
          </Card.Text>
          <div className="mt-auto">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div className="price">
                {product.discountedPrice < product.originalPrice && (
                  <span className="original-price text-muted text-decoration-line-through me-2" style={{ fontSize: '0.8rem' }}>
                    Rs. {product.originalPrice}
                  </span>
                )}
                <span className="current-price fw-bold" style={{ color: logoColors.primary, fontSize: '1.1rem' }}>
                  Rs. {product.discountedPrice || product.price}
                </span>
              </div>
              <div className="rating" style={{ fontSize: '0.85rem' }}>
                <FaStar style={{ color: logoColors.primary }} />
                <span className="ms-1" style={{ color: '#4A5568' }}>{product.rating || '4.5'}</span>
              </div>
            </div>
            <button
              className={`add-to-cart-btn w-100 mt-2 ${product.stock <= 0 ? 'disabled' : ''}`}
              onClick={() => handleAddToCart(product)}
              disabled={product.stock <= 0}
              style={{
                background: product.stock > 0 ? logoColors.gradient : '#e2e8f0',
                color: product.stock > 0 ? 'white' : '#718096',
                border: 'none',
                padding: '0.6rem',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: '500',
                cursor: product.stock > 0 ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                if (product.stock > 0) {
                  e.target.style.opacity = '0.9';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = `0 4px 12px ${logoColors.primary}40`;
                }
              }}
              onMouseLeave={(e) => {
                if (product.stock > 0) {
                  e.target.style.opacity = '1';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }
              }}
            >
              {product.stock > 0 ? (
                <>
                  <FaShoppingCart className="me-2" />
                  Add to Cart
                </>
              ) : (
                <>
                  <FaBoxOpen className="me-2" />
                  Out of Stock
                </>
              )}
            </button>
          </div>
        </Card.Body>
      </Card>
    </Col>
  );

  return (
    <Container fluid style={{ background: logoColors.background, minHeight: '100vh', padding: '2rem 0' }}>
      <Container className="tshirt-products-page py-3 py-md-5">
        <div className="page-header-wrapper mb-4 mb-md-5 text-center">
          <h1 className="page-header" style={{ color: logoColors.dark }}>Bottom Collection</h1>

          {/* Decorative line under header */}
          <div style={{
            height: '2px',
            background: `linear-gradient(90deg, transparent, ${logoColors.primary}40, transparent)`,
            width: '150px',
            margin: '1rem auto 2rem auto'
          }} />
        </div>

        {loading ? (
          <div className="text-center my-5 py-5">
            <Spinner animation="border" style={{ color: logoColors.primary }} />
            <p className="mt-3" style={{ color: '#4A5568' }}>Loading bottoms...</p>
          </div>
        ) : error ? (
          <Alert variant="danger" className="text-center" style={{ borderRadius: '12px' }}>
            {error}
          </Alert>
        ) : (
          <>
            {/* Mobile view - show only 4 products (2x2 grid) */}
            <div className="d-block d-md-none">
              <Row xs={2} className="g-3">
                {bottoms.slice(0, 4).map(product => renderProductCard(product))}
              </Row>
            </div>

            {/* Tablet/Desktop view - show all products with responsive columns */}
            <div className="d-none d-md-block">
              <Row xs={1} sm={2} md={3} lg={4} className="g-4">
                {bottoms.map(product => renderProductCard(product))}
              </Row>
            </div>
          </>
        )}
      </Container>
    </Container>
  );
}