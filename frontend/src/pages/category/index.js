import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { FaChevronRight } from 'react-icons/fa';
import '../../components/heroSlider.css';

import BrowseImg from '../../images/browse.jpeg';

// Navbar color palette
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

export default function Category() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/categories`);

        if (!res || !res.data) {
          throw new Error('No data received from server');
        }

        let categories = [];

        if (Array.isArray(res.data)) {
          categories = res.data;
        } else if (Array.isArray(res.data.categories)) {
          categories = res.data.categories;
        } else if (Array.isArray(res.data.data)) {
          categories = res.data.data;
        } else if (Array.isArray(res.data.items)) {
          categories = res.data.items;
        } else {
          throw new Error('Invalid data format: Expected array');
        }

        setCategories(categories);
      } catch (err) {
        setError(err.message || 'Failed to load categories. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Function to get the full image URL from Cloudinary
  const getCategoryImageUrl = (category) => {
    if (!category.image) {
      return null;
    }
    
    // If it's already a full URL (starts with http), return as is
    if (category.image.startsWith('http')) {
      return category.image;
    }
    
    // If it's a Cloudinary path, construct the full URL
    if (category.image.includes('cloudinary')) {
      return category.image;
    }
    
    // Otherwise, prepend the API URL (assuming it's a relative path)
    return `${process.env.REACT_APP_API_URL}${category.image.startsWith('/') ? '' : '/'}${category.image}`;
  };

  // Fallback placeholder image
  const getPlaceholderImage = (categoryName) => {
    // You can use a default placeholder image
    return `https://via.placeholder.com/300x200?text=${encodeURIComponent(categoryName || 'Category')}`;
  };

  // Function to render category card
  const renderCategoryCard = (category, isBrowseAll = false) => (
    <Col key={isBrowseAll ? 'browse-all' : (category._id || category.name || category)} xs={6} md={4} lg={3} className="mb-4">
      <Card
        className="product-card h-100 border-0"
        onClick={() =>
          isBrowseAll
            ? navigate('/category')
            : navigate(`/category/${(category.name || category).toString().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`)
        }
        style={{
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
        }}
      >
        <div className="product-image-container" style={{ position: 'relative' }}>
          <Card.Img
            variant="top"
            src={isBrowseAll ? BrowseImg : (getCategoryImageUrl(category) || getPlaceholderImage(category.name || category))}
            alt={isBrowseAll ? 'Browse All' : (category.name || category)}
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
              // If image fails to load, use placeholder
              e.target.src = getPlaceholderImage(category.name || category);
            }}
          />
        </div>
        <Card.Body className="d-flex flex-column" style={{ padding: '1rem' }}>
          <Card.Title
            className="product-title text-capitalize"
            style={{
              fontSize: '1.1rem',
              fontWeight: '600',
              color: '#2D3748',
              marginBottom: '0.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isBrowseAll ? 'Browse All' : (category.name || category)}
            <FaChevronRight
              className="ms-2"
              style={{
                color: logoColors.primary,
                fontSize: '0.9rem',
                transition: 'transform 0.2s ease'
              }}
            />
          </Card.Title>
          {isBrowseAll && (
            <Card.Text className="text-muted product-category" style={{
              fontSize: '0.9rem',
              color: '#718096',
              textAlign: 'center'
            }}>
              See all categories
            </Card.Text>
          )}
        </Card.Body>
      </Card>
    </Col>
  );

  return (
    <Container fluid className="tshirt-products-page py-3 py-md-5" style={{
      background: logoColors.background,
      minHeight: '100vh'
    }}>
      <Container>
        <div className="page-header-wrapper mb-4 mb-md-5 text-center">
          <h1 className="page-header" style={{ color: logoColors.dark }}>
            Shop by Category
          </h1>

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
            <p className="mt-3" style={{ color: '#4A5568' }}>Loading categories...</p>
          </div>
        ) : error ? (
          <Alert variant="danger" className="text-center">
            {error}
          </Alert>
        ) : (
          <>
            {/* All categories - responsive grid */}
            <Row className="g-3 g-md-4">
              {categories.map(category => renderCategoryCard(category))}
            </Row>
          </>
        )}
      </Container>
    </Container>
  );
}