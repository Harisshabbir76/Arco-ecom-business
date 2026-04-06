import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { FaChevronRight } from 'react-icons/fa';
import '../../components/heroSlider.css';

import BrowseImg from '../../images/browse.jpeg';

const C = {
  red:       '#CC1B1B',
  redDark:   '#A01212',
  redDeep:   '#7A0C0C',
  redLight:  '#fdf2f2',
  charcoal:  '#1e1e1e',
  white:     '#ffffff',
  lightGray: '#f7f7f7',
  border:    '#e8e8e8',
  gray:      '#000000',
  gradient:  'linear-gradient(135deg, #CC1B1B 0%, #A01212 100%)',
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

  const getCategoryImageUrl = (category) => {
    if (!category.image) {
      return null;
    }
    
    if (category.image.startsWith('http')) {
      return category.image;
    }
    
    if (category.image.includes('cloudinary')) {
      return category.image;
    }
    
    return `${process.env.REACT_APP_API_URL}${category.image.startsWith('/') ? '' : '/'}${category.image}`;
  };

  const getPlaceholderImage = (categoryName) => {
    return `https://via.placeholder.com/400x400?text=${encodeURIComponent(categoryName || 'Category')}`;
  };

  const renderCategoryCard = (category, isBrowseAll = false) => (
    <Col 
      key={isBrowseAll ? 'browse-all' : (category._id || category.name || category)} 
      xs={6} 
      sm={6} 
      md={4} 
      lg={3} 
      className="mb-3 mb-md-4"
      style={{ display: 'flex' }}
    >
      <div
        className="category-card"
        onClick={() =>
          isBrowseAll
            ? navigate('/category')
            : navigate(`/category/${(category.name || category).toString().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`)
        }
        style={{
          background: C.white,
          borderRadius: '12px',
          overflow: 'hidden',
          cursor: 'pointer',
          position: 'relative',
          border: `1px solid ${C.border}`,
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
          height: '100%',
          width: '100%',
          maxWidth: '300px',
          margin: '0 auto'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.boxShadow = `0 14px 36px ${C.red}20`;
          e.currentTarget.style.borderColor = 'transparent';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.borderColor = C.border;
        }}
      >
        {/* Red sweep on hover */}
        <div style={{
          position: 'absolute',
          bottom: 0, left: 0,
          width: 0, height: '3px',
          background: C.gradient,
          transition: 'width 0.32s ease',
          zIndex: 5,
          borderRadius: '0 0 2px 2px'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.width = '100%'; }}
        onMouseLeave={(e) => { e.currentTarget.style.width = '0'; }}
        />

        {/* Image container - Standard 1:1 square */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '1 / 1',
            overflow: 'hidden',
            backgroundColor: C.lightGray,
            flexShrink: 0
          }}
        >
          <img
            src={isBrowseAll ? BrowseImg : (getCategoryImageUrl(category) || getPlaceholderImage(category.name || category))}
            alt={isBrowseAll ? 'Browse All' : (category.name || category)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              transition: 'transform 0.45s ease'
            }}
            onMouseEnter={(e) => { e.target.style.transform = 'scale(1.06)'; }}
            onMouseLeave={(e) => { e.target.style.transform = 'scale(1)'; }}
            onError={(e) => {
              e.target.src = getPlaceholderImage(category.name || category);
            }}
          />
        </div>

        {/* Body */}
        <div style={{
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          textAlign: 'center'
        }}>
          <h3 style={{
            fontFamily: 'Barlow, sans-serif',
            fontSize: '1rem',
            fontWeight: 600,
            letterSpacing: '0.01em',
            color: C.charcoal,
            margin: '0 0 0.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            {isBrowseAll ? 'Browse All' : (category.name || category)}
            <FaChevronRight
              style={{
                color: C.red,
                fontSize: '0.85rem',
                transition: 'transform 0.2s ease'
              }}
            />
          </h3>
          {isBrowseAll && (
            <p style={{
              fontFamily: 'Barlow, sans-serif',
              fontSize: '0.75rem',
              color: C.gray,
              margin: 0
            }}>
              See all categories
            </p>
          )}
        </div>
      </div>
    </Col>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;500;600;700&display=swap');
        
        .category-page {
          min-height: 100vh;
          background: ${C.white};
          font-family: 'Barlow', sans-serif;
        }

        /* Hero section matching theme */
        .category-hero {
          background: ${C.white};
          padding: 3rem 2rem 2.75rem;
          position: relative;
          border-bottom: 1px solid ${C.border};
        }
        .category-hero::after {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 5px;
          background: ${C.red};
          border-radius: 0 2px 2px 0;
        }
        .category-hero-inner {
          max-width: 1320px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }
        .category-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-family: 'Barlow', sans-serif;
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: ${C.red};
          margin-bottom: 0.6rem;
        }
        .category-eyebrow-dot {
          width: 5px; height: 5px;
          background: ${C.red};
          border-radius: 50%;
        }
        .category-hero-title {
          font-family: 'Barlow', sans-serif;
          font-size: clamp(2rem, 5vw, 3.2rem);
          font-weight: 700;
          letter-spacing: -0.01em;
          color: ${C.charcoal};
          line-height: 1.05;
          margin: 0 0 0.5rem;
        }
        .category-hero-title span {
          color: ${C.gray};
          font-weight: 400;
        }
        .category-title-accent {
          display: flex;
          align-items: center;
          gap: 6px;
          margin: 0.85rem 0;
        }
        .category-bar { width: 40px; height: 3px; background: ${C.red}; border-radius: 2px; flex-shrink: 0; }
        .category-bar-thin { width: 20px; height: 3px; background: ${C.border}; border-radius: 2px; flex-shrink: 0; }
        .category-hero-sub {
          font-family: 'Barlow', sans-serif;
          font-size: 0.9rem;
          font-weight: 400;
          color: ${C.gray};
          letter-spacing: 0.02em;
          margin: 0;
        }

        /* Grid layout */
        .category-grid-wrap {
          max-width: 1320px;
          margin: 0 auto;
          padding: 2rem 2rem 4rem;
        }
        .row {
          margin-left: -8px;
          margin-right: -8px;
        }
        .row > [class*="col-"] {
          padding-left: 8px;
          padding-right: 8px;
        }

        @media (max-width: 768px) {
          .category-hero { padding: 2rem 1.25rem 1.75rem; }
          .category-hero-title { font-size: clamp(1.7rem, 8vw, 2.4rem); }
          .category-grid-wrap { padding: 1.5rem 1.25rem 3rem; }
          .row {
            margin-left: -6px;
            margin-right: -6px;
          }
          .row > [class*="col-"] {
            padding-left: 6px;
            padding-right: 6px;
          }
        }
      `}</style>

      <div className="category-page">
        {/* Hero section */}
        <div className="category-hero">
          <div className="category-hero-inner">
            <div className="category-eyebrow">
              <span className="category-eyebrow-dot" />
              Shop Collection
            </div>
            <h1 className="category-hero-title">
              Shop by <span>Category</span>
            </h1>
            <div className="category-title-accent">
              <div className="category-bar" />
              <div className="category-bar-thin" />
            </div>
            <p className="category-hero-sub">Browse our curated collection by category</p>
          </div>
        </div>

        {/* Content */}
        <div className="category-grid-wrap">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '5rem 0',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <Spinner animation="border"
                style={{ color: C.red, width: '2.5rem', height: '2.5rem', borderWidth: '3px' }} />
              <p style={{ fontFamily: 'Barlow, sans-serif', color: C.gray,
                letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.72rem', margin: 0 }}>
                Loading Categories…
              </p>
            </div>
          ) : error ? (
            <Alert variant="danger" style={{ borderLeft: `4px solid ${C.red}`, borderRadius: '6px' }}>
              {error}
            </Alert>
          ) : categories.length === 0 ? (
            <div className="text-center my-5 py-5">
              <div style={{
                width: '80px', height: '80px',
                background: C.redLight,
                border: `1px solid ${C.border}`,
                borderLeft: `3px solid ${C.red}`,
                borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.25rem'
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="9" y1="21" x2="9" y2="9"></line>
                </svg>
              </div>
              <h3 style={{
                fontFamily: 'Barlow, sans-serif',
                fontSize: '1.1rem', fontWeight: 700,
                letterSpacing: '0.03em',
                color: C.charcoal, margin: '0 0 0.5rem'
              }}>No Categories Found</h3>
              <p style={{
                fontFamily: 'Barlow, sans-serif',
                fontSize: '0.875rem', color: C.gray, margin: 0
              }}>Check back soon for new categories.</p>
            </div>
          ) : (
            <Row className="g-2 g-md-3">
              {categories.map(category => renderCategoryCard(category))}
            </Row>
          )}
        </div>
      </div>
    </>
  );
}