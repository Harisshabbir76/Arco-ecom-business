import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Alert,
  Badge,
  Button
} from 'react-bootstrap';
import { FaShoppingCart, FaBoxOpen, FaStar } from 'react-icons/fa';
import { CartContext } from '../components/CartContext';
import './heroSlider.css';

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

const SearchResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const query = new URLSearchParams(location.search).get('query');
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/search?query=${query}`
        );

        const products = response.data.map(product => ({
          ...product,
          stock: product.stock || Math.floor(Math.random() * 16) + 5,
          rating: product.rating || (Math.random() * 1 + 4).toFixed(1)
        }));

        setResults(products);
      } catch (error) {
        setError(error.response?.data?.error || 'Failed to load search results');
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchResults();
    }
  }, [query]);

  const handleAddToCart = (product) => {
    if (product.stock > 0) {
      addToCart({ ...product, quantity: 1 });
    }
  };



  if (loading) {
    return (
      <Container fluid className="d-flex justify-content-center align-items-center" style={{
        minHeight: '100vh',
        background: logoColors.background
      }}>
        <Spinner animation="border" style={{ color: logoColors.primary }} />
        <span className="ms-3" style={{ color: '#4A5568' }}>Searching for "{query}"...</span>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="py-5" style={{ background: logoColors.background, minHeight: '100vh' }}>
        <Container>
          <Alert variant="danger" className="text-center" style={{ borderRadius: '12px' }}>
            <h5>Search Error</h5>
            <p className="mb-3">{error}</p>
            <Button
              variant="outline-danger"
              onClick={() => window.location.reload()}
              style={{
                borderColor: logoColors.primary,
                color: logoColors.primary,
                background: 'transparent',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = logoColors.softGradient;
                e.target.style.color = logoColors.dark;
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = logoColors.primary;
              }}
            >
              Try Again
            </Button>
          </Alert>
        </Container>
      </Container>
    );
  }

  return (
    <Container fluid style={{ background: logoColors.background, minHeight: '100vh', padding: '2rem 0' }}>
      <Container className="search-results-container py-4">
        <div className="page-header-wrapper mb-4 mb-md-5 text-center">
          <h1 className="page-header" style={{ color: logoColors.dark }}>Search Results for "{query}"</h1>

          {/* Decorative line */}
          <div style={{
            height: '2px',
            background: `linear-gradient(90deg, transparent, ${logoColors.primary}40, transparent)`,
            width: '150px',
            margin: '1rem auto'
          }} />

          {results.length > 0 && (
            <p style={{ color: '#4A5568', marginTop: '0.5rem' }}>
              Found {results.length} {results.length === 1 ? 'result' : 'results'}
            </p>
          )}
        </div>

        {results.length === 0 ? (
          <Alert variant="info" className="text-center my-5" style={{
            borderRadius: '12px',
            border: `1px solid ${logoColors.light}`,
            background: logoColors.softGradient,
            color: logoColors.dark
          }}>
            <h5>No Results Found</h5>
            <p className="mb-0">We couldn't find any products matching "{query}"</p>
          </Alert>
        ) : (
          <Row className="g-3 g-md-4">
            {results.map((product) => (
              <Col key={product._id} xs={6} md={4} lg={3}>
                <ProductCard
                  product={product}
                  onAddToCart={() => handleAddToCart(product)}
                  onViewDetails={() => navigate(`/product/${product._id}`)}
                />
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </Container>
  );
};

const ProductCard = ({ product, onAddToCart, onViewDetails }) => {
  const getProductImage = (product) => {
    if (!product?.image?.[0]) return '/placeholder.jpg';
    return product.image[0].startsWith('http')
      ? product.image[0]
      : `${process.env.REACT_APP_API_URL}${product.image[0]}`;
  };

  return (
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
          variant="top"
          src={getProductImage(product)}
          alt={product.name}
          onClick={onViewDetails}
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
        {product.discountedPrice < product.price && (
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
            {Math.round(100 - (product.discountedPrice / product.price * 100))}% OFF
          </div>
        )}
        <Badge
          bg={product.stock > 0 ? "success" : "danger"}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            padding: '4px 8px',
            fontSize: '0.7rem',
            zIndex: 1,
            background: product.stock > 0 ? logoColors.primary : '#dc3545',
            border: 'none'
          }}
        >
          {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
        </Badge>
      </div>
      <Card.Body className="d-flex flex-column" style={{ padding: '1rem' }}>
        <Card.Title
          className="product-title"
          onClick={onViewDetails}
          style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: '#2D3748',
            marginBottom: '0.25rem',
            cursor: 'pointer'
          }}
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
              {product.discountedPrice < product.price && (
                <span className="original-price text-muted text-decoration-line-through me-2" style={{ fontSize: '0.8rem' }}>
                  Rs. {product.price}
                </span>
              )}
              <span className="current-price fw-bold" style={{ color: logoColors.primary, fontSize: '1.1rem' }}>
                Rs. {product.discountedPrice || product.price}
              </span>
            </div>
            <div className="rating" style={{ fontSize: '0.85rem' }}>
              <FaStar style={{ color: logoColors.primary }} />
              <span className="ms-1" style={{ color: '#4A5568' }}>{product.rating}</span>
            </div>
          </div>
          <button
            className={`add-to-cart-btn w-100 mt-2 ${product.stock <= 0 ? 'disabled' : ''}`}
            onClick={() => onAddToCart()}
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
  );
};

export default SearchResults;