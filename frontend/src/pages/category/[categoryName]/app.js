import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Card, Spinner, Alert, Button, Badge } from 'react-bootstrap';
import { FaShoppingCart, FaBoxOpen, FaStar, FaSearch } from 'react-icons/fa';
import { FiEye, FiSliders, FiChevronDown } from 'react-icons/fi';
import { CartContext } from '../../../components/CartContext';
import '../../../App.css';

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

export default function CategoryProducts() {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOption, setSortOption] = useState('default');
  const [isMobile, setIsMobile] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

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

  const SORT_OPTIONS = [
    { value: 'default', label: 'Default' },
    { value: 'price-low-high', label: 'Price: Low to High' },
    { value: 'price-high-low', label: 'Price: High to Low' },
    { value: 'rating-high', label: 'Top Rated' },
    { value: 'newest', label: 'Newest First' },
  ];

  const currentSortLabel = SORT_OPTIONS.find(o => o.value === sortOption)?.label || 'Sort';

  const renderProductCard = (product) => {
    const discountPct = product.discountedPrice < product.originalPrice
      ? Math.round(((product.originalPrice - product.discountedPrice) / product.originalPrice) * 100)
      : null;
    const rating = product.rating ? parseFloat(product.rating) : null;
    const stockQty = product.stock ?? 0;

    let stockLabel = null, stockClass = '';
    if (stockQty <= 0) { stockLabel = 'Out of Stock'; stockClass = 'out'; }
    else if (stockQty <= 5) { stockLabel = `Only ${stockQty} left`; stockClass = 'low'; }

    const catName = typeof product.category === 'object'
      ? product.category?.name
      : product.category;

    return (
      <Col 
        key={product._id} 
        xs={6} 
        sm={6} 
        md={4} 
        lg={3} 
        className="mb-3 mb-md-4"
        style={{ display: 'flex' }}
      >
        <div
          className={`category-product-card${stockQty <= 0 ? ' sold-out' : ''}`}
          onClick={() => stockQty > 0 && navigate(`/category/${categoryName}/${product.slug || product._id}`)}
          style={{
            background: C.white,
            borderRadius: '12px',
            overflow: 'hidden',
            cursor: stockQty > 0 ? 'pointer' : 'default',
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
            if (stockQty > 0) {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = `0 14px 36px ${C.red}20`;
              e.currentTarget.style.borderColor = 'transparent';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.borderColor = C.border;
          }}
        >
          {/* Red sweep */}
          <div style={{
            position: 'absolute',
            bottom: 0, left: 0,
            width: 0, height: '3px',
            background: C.gradient,
            transition: 'width 0.32s ease',
            zIndex: 5,
            borderRadius: '0 0 2px 2px'
          }}
          onMouseEnter={(e) => { if (stockQty > 0) e.currentTarget.style.width = '100%'; }}
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
              src={getProductImage(product)}
              alt={product.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                transition: 'transform 0.45s ease'
              }}
              onMouseEnter={(e) => { if (stockQty > 0) e.target.style.transform = 'scale(1.06)'; }}
              onMouseLeave={(e) => { e.target.style.transform = 'scale(1)'; }}
              onError={(e) => { e.target.src = '/placeholder.jpg'; }}
            />

            {/* NEW badge - show for recent products */}
            {product.createdAt && (new Date() - product.createdAt) < 30 * 24 * 60 * 60 * 1000 && (
              <span style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                fontFamily: 'Barlow, sans-serif',
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding: '4px 12px',
                borderRadius: '4px',
                background: C.charcoal,
                color: C.white,
                zIndex: 3,
                lineHeight: 1.4
              }}>New</span>
            )}

            {/* Discount badge */}
            {discountPct && (
              <span style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                fontFamily: 'Barlow, sans-serif',
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding: '4px 12px',
                borderRadius: '4px',
                background: C.gradient,
                color: C.white,
                zIndex: 3,
                lineHeight: 1.4
              }}>−{discountPct}%</span>
            )}

            {/* Sold out badge */}
            {stockQty <= 0 && (
              <span style={{
                position: 'absolute',
                top: '12px',
                left: discountPct ? 'auto' : '12px',
                right: discountPct ? '12px' : 'auto',
                fontFamily: 'Barlow, sans-serif',
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding: '4px 12px',
                borderRadius: '4px',
                background: 'rgba(100,100,100,0.9)',
                color: C.white,
                zIndex: 3,
                lineHeight: 1.4
              }}>Sold Out</span>
            )}

            {/* Desktop hover actions */}
            <div style={{
              position: 'absolute',
              bottom: 0, left: 0, right: 0,
              display: 'flex',
              zIndex: 4,
              transform: 'translateY(100%)',
              transition: 'transform 0.24s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart(product);
                }}
                disabled={stockQty <= 0}
                style={{
                  flex: 1,
                  background: C.charcoal,
                  color: C.white,
                  fontFamily: 'Barlow, sans-serif',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  letterSpacing: '0.07em',
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '0.75rem 0',
                  border: 'none',
                  cursor: stockQty > 0 ? 'pointer' : 'not-allowed',
                  transition: 'background 0.18s'
                }}
                onMouseEnter={(e) => { if (stockQty > 0) e.target.style.background = C.red; }}
                onMouseLeave={(e) => { if (stockQty > 0) e.target.style.background = C.charcoal; }}
              >
                <FaShoppingCart size={13} />
                {stockQty > 0 ? 'Add to Cart' : 'Unavailable'}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); navigate(`/category/${categoryName}/${product.slug || product._id}`); }}
                title="View product"
                style={{
                  background: 'rgba(30,30,30,0.88)',
                  color: C.white,
                  border: 'none',
                  borderLeft: '1px solid rgba(255,255,255,0.1)',
                  width: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background 0.18s',
                  flexShrink: 0,
                  padding: 0
                }}
                onMouseEnter={(e) => { e.target.style.background = C.red; }}
                onMouseLeave={(e) => { e.target.style.background = 'rgba(30,30,30,0.88)'; }}
              >
                <FiEye size={16} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div style={{
            padding: isMobile ? '0.75rem 0.6rem 0.8rem' : '1rem 0.9rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            flex: 1
          }}>
            {catName && (
              <span style={{
                fontFamily: 'Barlow, sans-serif',
                fontSize: '0.7rem',
                fontWeight: 500,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: C.gray,
                marginBottom: '0.3rem',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>{catName}</span>
            )}

            <p style={{
              fontFamily: 'Barlow, sans-serif',
              fontSize: isMobile ? '0.85rem' : '0.95rem',
              fontWeight: 600,
              letterSpacing: '0.01em',
              color: C.charcoal,
              lineHeight: 1.35,
              margin: '0 0 0.5rem',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: isMobile ? 'calc(0.85rem * 1.35 * 2)' : 'calc(0.95rem * 1.35 * 2)'
            }}>{product.name}</p>

            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '0.5rem',
              marginBottom: '0.5rem',
              flexWrap: 'wrap'
            }}>
              <span style={{
                fontFamily: 'Barlow, sans-serif',
                fontSize: isMobile ? '1rem' : '1.1rem',
                fontWeight: 700,
                color: C.red
              }}>
                Rs. {(product.discountedPrice || product.price)?.toLocaleString()}
              </span>
              {product.discountedPrice < product.originalPrice && (
                <span style={{
                  fontFamily: 'Barlow, sans-serif',
                  fontSize: '0.8rem',
                  color: C.gray,
                  textDecoration: 'line-through'
                }}>
                  Rs. {product.originalPrice?.toLocaleString()}
                </span>
              )}
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.5rem'
            }}>
              {rating > 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <FaStar key={s} size={11}
                        style={{ color: s <= Math.round(rating) ? C.red : C.border }} />
                    ))}
                  </div>
                  <span style={{
                    fontFamily: 'Barlow, sans-serif',
                    fontSize: '0.7rem',
                    color: C.gray
                  }}>{parseFloat(rating).toFixed(1)}</span>
                </div>
              ) : <div style={{ height: '11px' }} />}

              {stockLabel && (
                <span style={{
                  fontFamily: 'Barlow, sans-serif',
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: stockClass === 'out' ? C.red : '#b87a00'
                }}>{stockLabel}</span>
              )}
            </div>

            {/* Mobile add button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart(product);
              }}
              disabled={stockQty <= 0}
              style={{
                display: isMobile ? 'flex' : 'none',
                width: '100%',
                background: stockQty > 0 ? C.gradient : '#ccc',
                color: C.white,
                fontFamily: 'Barlow, sans-serif',
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                border: 'none',
                padding: '0.7rem 0',
                cursor: stockQty > 0 ? 'pointer' : 'not-allowed',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'background 0.18s',
                marginTop: '0.5rem',
                borderRadius: '8px'
              }}
            >
              {stockQty > 0
                ? <><FaShoppingCart size={12} /> Add to Cart</>
                : <><FaBoxOpen size={12} /> Out of Stock</>}
            </button>
          </div>
        </div>
      </Col>
    );
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;500;600;700&display=swap');
        
        .category-products-page {
          min-height: 100vh;
          background: ${C.white};
          font-family: 'Barlow', sans-serif;
        }

        /* Hero section matching theme */
        .category-products-hero {
          background: ${C.white};
          padding: 3rem 2rem 2.75rem;
          position: relative;
          border-bottom: 1px solid ${C.border};
        }
        .category-products-hero::after {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 5px;
          background: ${C.red};
          border-radius: 0 2px 2px 0;
        }
        .category-products-hero-inner {
          max-width: 1320px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }
        .category-products-eyebrow {
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
        .category-products-eyebrow-dot {
          width: 5px; height: 5px;
          background: ${C.red};
          border-radius: 50%;
        }
        .category-products-hero-title {
          font-family: 'Barlow', sans-serif;
          font-size: clamp(2rem, 5vw, 3.2rem);
          font-weight: 700;
          letter-spacing: -0.01em;
          color: ${C.charcoal};
          line-height: 1.05;
          margin: 0 0 0.5rem;
          text-transform: capitalize;
        }
        .category-products-hero-title span {
          color: ${C.red};
          font-weight: 400;
        }
        .category-products-title-accent {
          display: flex;
          align-items: center;
          gap: 6px;
          margin: 0.85rem 0;
        }
        .category-products-bar { width: 40px; height: 3px; background: ${C.red}; border-radius: 2px; flex-shrink: 0; }
        .category-products-bar-thin { width: 20px; height: 3px; background: ${C.border}; border-radius: 2px; flex-shrink: 0; }
        .category-products-hero-sub {
          font-family: 'Barlow', sans-serif;
          font-size: 0.9rem;
          font-weight: 400;
          color: ${C.gray};
          letter-spacing: 0.02em;
          margin: 0;
        }

        /* Toolbar */
        .category-products-toolbar {
          max-width: 1320px;
          margin: 0 auto;
          padding: 1.25rem 2rem;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 1rem;
          flex-wrap: wrap;
          border-bottom: 1px solid ${C.border};
        }
        .category-products-sort-wrap { position: relative; }
        .category-products-sort-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: ${C.white};
          border: 1.5px solid ${C.border};
          border-radius: 6px;
          padding: 8px 14px;
          font-family: 'Barlow', sans-serif;
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: ${C.charcoal};
          cursor: pointer;
          transition: border-color 0.18s, color 0.18s;
          white-space: nowrap;
        }
        .category-products-sort-btn:hover, .category-products-sort-btn.open { border-color: ${C.red}; color: ${C.red}; }
        .category-products-sort-btn svg { transition: transform 0.2s; }
        .category-products-sort-btn.open svg { transform: rotate(180deg); }
        .category-products-sort-menu {
          position: absolute;
          right: 0;
          top: calc(100% + 6px);
          background: ${C.white};
          border: 1px solid ${C.border};
          border-top: 3px solid ${C.red};
          border-radius: 0 0 8px 8px;
          min-width: 200px;
          box-shadow: 0 12px 36px rgba(0,0,0,0.10);
          z-index: 50;
          animation: dropIn 0.15s ease;
          overflow: hidden;
        }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .category-products-sort-item {
          display: block; width: 100%; text-align: left;
          padding: 9px 14px; border: none; background: none;
          font-family: 'Barlow', sans-serif; font-size: 0.875rem;
          color: ${C.charcoal}; cursor: pointer;
          transition: background 0.14s, padding-left 0.14s;
          border-bottom: 1px solid ${C.border};
        }
        .category-products-sort-item:last-child { border-bottom: none; }
        .category-products-sort-item:hover { background: ${C.redLight}; color: ${C.red}; padding-left: 18px; }
        .category-products-sort-item.active { color: ${C.red}; font-weight: 600; background: ${C.redLight}; }

        /* Grid layout */
        .category-products-grid-wrap {
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
          .category-products-hero { padding: 2rem 1.25rem 1.75rem; }
          .category-products-hero-title { font-size: clamp(1.7rem, 8vw, 2.4rem); }
          .category-products-toolbar { padding: 1rem 1.25rem; justify-content: center; }
          .category-products-grid-wrap { padding: 1.5rem 1.25rem 3rem; }
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

      <div className="category-products-page">
        {/* Hero section */}
        <div className="category-products-hero">
          <div className="category-products-hero-inner">
            <div className="category-products-eyebrow">
              <span className="category-products-eyebrow-dot" />
              Shop Collection
            </div>
            <h1 className="category-products-hero-title">
              Featuring <span>{categoryName}</span>
            </h1>
            <div className="category-products-title-accent">
              <div className="category-products-bar" />
              <div className="category-products-bar-thin" />
            </div>
            <p className="category-products-hero-sub">Explore our curated collection of {categoryName} products</p>
          </div>
        </div>

        {/* Toolbar with sort */}
        <div className="category-products-toolbar">
          <div className="category-products-sort-wrap">
            <button
              className={`category-products-sort-btn${sortOpen ? ' open' : ''}`}
              onClick={() => setSortOpen(v => !v)}
              onBlur={() => setTimeout(() => setSortOpen(false), 150)}
            >
              <FiSliders size={13} />
              {currentSortLabel}
              <FiChevronDown size={12} />
            </button>
            {sortOpen && (
              <div className="category-products-sort-menu">
                {SORT_OPTIONS.map(o => (
                  <button
                    key={o.value}
                    className={`category-products-sort-item${sortOption === o.value ? ' active' : ''}`}
                    onClick={() => { setSortOption(o.value); setSortOpen(false); }}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="category-products-grid-wrap">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '5rem 0',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <Spinner animation="border"
                style={{ color: C.red, width: '2.5rem', height: '2.5rem', borderWidth: '3px' }} />
              <p style={{ fontFamily: 'Barlow, sans-serif', color: C.gray,
                letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.72rem', margin: 0 }}>
                Loading Products…
              </p>
            </div>
          ) : error ? (
            <Alert variant="danger" style={{ borderLeft: `4px solid ${C.red}`, borderRadius: '6px' }}>
              {error}
            </Alert>
          ) : filteredProducts.length === 0 ? (
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
                <FaSearch size={32} color={C.red} />
              </div>
              <h3 style={{
                fontFamily: 'Barlow, sans-serif',
                fontSize: '1.1rem', fontWeight: 700,
                letterSpacing: '0.03em',
                color: C.charcoal, margin: '0 0 0.5rem'
              }}>No Products Found</h3>
              <p style={{
                fontFamily: 'Barlow, sans-serif',
                fontSize: '0.875rem', color: C.gray, margin: '0 0 1.5rem'
              }}>
                We couldn't find any products in the "{categoryName}" category.
              </p>
              <Button
                onClick={() => navigate('/catalog')}
                style={{
                  background: C.gradient,
                  border: 'none',
                  padding: '0.6rem 2rem',
                  borderRadius: '50px',
                  fontWeight: '500',
                  fontFamily: 'Barlow, sans-serif'
                }}
                onMouseEnter={(e) => {
                  e.target.style.opacity = '0.9';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.opacity = '1';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Browse All Products
              </Button>
            </div>
          ) : (
            <Row className="g-2 g-md-3">
              {filteredProducts.map(product => renderProductCard(product))}
            </Row>
          )}
        </div>
      </div>
    </>
  );
}