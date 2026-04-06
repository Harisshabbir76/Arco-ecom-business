import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Spinner, Alert, Badge } from 'react-bootstrap';
import { FaShoppingCart, FaBoxOpen, FaStar } from 'react-icons/fa';
import { FiEye } from 'react-icons/fi';
import { useCart } from '../components/CartContext';
import { useNavigate } from 'react-router-dom';

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

export default function BundlesPage() {
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchBundles = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/bundles`);
        setBundles(res.data);
      } catch (err) {
        console.error('Error fetching bundles:', err);
        setError('Failed to load bundles.');
      } finally {
        setLoading(false);
      }
    };

    fetchBundles();
  }, []);

  const handleAddBundleToCart = (bundle) => {
    const bundleItem = {
      ...bundle,
      _id: `bundle_${bundle._id}`,
      isBundle: true,
      quantity: 1,
      price: bundle.bundlePrice,
      discountedPrice: bundle.bundlePrice,
      name: bundle.name,
      bundleProducts: bundle.products,
      image: bundle.image ? [bundle.image] : bundle.products[0]?.image || []
    };
    addToCart(bundleItem);
  };

  const getProductImage = (product) => {
    if (!product?.image?.[0]) return '/placeholder.jpg';
    if (product.image[0].startsWith('http')) return product.image[0];
    return `${process.env.REACT_APP_API_URL}${product.image[0].startsWith('/') ? '' : '/'}${product.image[0]}`;
  };

  const getBundleImage = (bundle) => {
    if (bundle.image) return bundle.image;
    if (bundle.products?.[0]?.image?.[0]) {
      if (bundle.products[0].image[0].startsWith('http')) return bundle.products[0].image[0];
      return `${process.env.REACT_APP_API_URL}${bundle.products[0].image[0].startsWith('/') ? '' : '/'}${bundle.products[0].image[0]}`;
    }
    return '/placeholder.jpg';
  };

  const isBundleActive = (bundle) => {
    if (!bundle.isActive) return false;
    if (bundle.isLifetime) return true;

    const now = new Date();
    const afterStart = !bundle.startDate || now >= new Date(bundle.startDate);
    const beforeEnd = !bundle.endDate || now <= new Date(bundle.endDate);
    return afterStart && beforeEnd;
  };

  const activeBundles = bundles.filter(bundle => isBundleActive(bundle));

  const renderBundleCard = (bundle) => {
    const discountPct = bundle.originalPrice > bundle.bundlePrice
      ? Math.round(((bundle.originalPrice - bundle.bundlePrice) / bundle.originalPrice) * 100)
      : null;
    const stockQty = bundle.stock ?? 10;

    let stockLabel = null, stockClass = '';
    if (stockQty <= 0) { stockLabel = 'Out of Stock'; stockClass = 'out'; }
    else if (stockQty <= 5) { stockLabel = `Only ${stockQty} left`; stockClass = 'low'; }

    return (
      <Col 
        key={bundle._id} 
        xs={6} 
        sm={6} 
        md={4} 
        lg={3} 
        className="mb-3 mb-md-4"
        style={{ display: 'flex' }}
      >
        <div
          className="bundle-card"
          onClick={() => navigate('/checkout', {
            state: {
              products: [{
                ...bundle,
                _id: `bundle_${bundle._id}`,
                isBundle: true,
                quantity: 1,
                price: bundle.bundlePrice,
                discountedPrice: bundle.bundlePrice,
                name: bundle.name,
                bundleProducts: bundle.products,
                image: bundle.image ? [bundle.image] : bundle.products[0]?.image || []
              }]
            }
          })}
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
              src={getBundleImage(bundle)}
              alt={bundle.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                transition: 'transform 0.45s ease'
              }}
              onMouseEnter={(e) => { e.target.style.transform = 'scale(1.06)'; }}
              onMouseLeave={(e) => { e.target.style.transform = 'scale(1)'; }}
              onError={(e) => { e.target.src = '/placeholder.jpg'; }}
            />

            {/* Bundle badge */}
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
              background: C.red,
              color: C.white,
              zIndex: 3,
              lineHeight: 1.4
            }}>Bundle</span>

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
                  handleAddBundleToCart(bundle);
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
                onClick={(e) => { 
                  e.stopPropagation(); 
                  navigate('/checkout', {
                    state: {
                      products: [{
                        ...bundle,
                        _id: `bundle_${bundle._id}`,
                        isBundle: true,
                        quantity: 1,
                        price: bundle.bundlePrice,
                        discountedPrice: bundle.bundlePrice,
                        name: bundle.name,
                        bundleProducts: bundle.products,
                        image: bundle.image ? [bundle.image] : bundle.products[0]?.image || []
                      }]
                    }
                  });
                }}
                title="Buy Now"
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
            {/* Product count indicator */}
            <span style={{
              fontFamily: 'Barlow, sans-serif',
              fontSize: '0.7rem',
              fontWeight: 500,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: C.gray,
              marginBottom: '0.3rem'
            }}>
              {bundle.products?.length || 0} Items in Bundle
            </span>

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
            }}>{bundle.name}</p>

            {bundle.description && (
              <p style={{
                fontFamily: 'Barlow, sans-serif',
                fontSize: '0.7rem',
                color: C.gray,
                marginBottom: '0.5rem',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.4
              }}>{bundle.description}</p>
            )}

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
                Rs. {bundle.bundlePrice?.toLocaleString()}
              </span>
              {bundle.originalPrice > bundle.bundlePrice && (
                <span style={{
                  fontFamily: 'Barlow, sans-serif',
                  fontSize: '0.8rem',
                  color: C.gray,
                  textDecoration: 'line-through'
                }}>
                  Rs. {bundle.originalPrice?.toLocaleString()}
                </span>
              )}
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{
                  fontFamily: 'Barlow, sans-serif',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: '#38a169'
                }}>
                  Save Rs. {(bundle.originalPrice - bundle.bundlePrice)?.toLocaleString()}
                </span>
              </div>

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
                handleAddBundleToCart(bundle);
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
                ? <><FaShoppingCart size={12} /> Add Bundle to Cart</>
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
        
        .bundles-page {
          min-height: 100vh;
          background: ${C.white};
          font-family: 'Barlow', sans-serif;
        }

        /* Hero section matching theme */
        .bundles-hero {
          background: ${C.white};
          padding: 3rem 2rem 2.75rem;
          position: relative;
          border-bottom: 1px solid ${C.border};
        }
        .bundles-hero::after {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 5px;
          background: ${C.red};
          border-radius: 0 2px 2px 0;
        }
        .bundles-hero-inner {
          max-width: 1320px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }
        .bundles-eyebrow {
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
        .bundles-eyebrow-dot {
          width: 5px; height: 5px;
          background: ${C.red};
          border-radius: 50%;
        }
        .bundles-hero-title {
          font-family: 'Barlow', sans-serif;
          font-size: clamp(2rem, 5vw, 3.2rem);
          font-weight: 700;
          letter-spacing: -0.01em;
          color: ${C.charcoal};
          line-height: 1.05;
          margin: 0 0 0.5rem;
        }
        .bundles-hero-title span {
          color: ${C.charcoal};
          font-weight: 400;
        }
        .bundles-title-accent {
          display: flex;
          align-items: center;
          gap: 6px;
          margin: 0.85rem 0;
        }
        .bundles-bar { width: 40px; height: 3px; background: ${C.red}; border-radius: 2px; flex-shrink: 0; }
        .bundles-bar-thin { width: 20px; height: 3px; background: ${C.border}; border-radius: 2px; flex-shrink: 0; }
        .bundles-hero-sub {
          font-family: 'Barlow', sans-serif;
          font-size: 0.9rem;
          font-weight: 400;
          color: ${C.gray};
          letter-spacing: 0.02em;
          margin: 0;
        }

        /* Grid layout */
        .bundles-grid-wrap {
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
          .bundles-hero { padding: 2rem 1.25rem 1.75rem; }
          .bundles-hero-title { font-size: clamp(1.7rem, 8vw, 2.4rem); }
          .bundles-grid-wrap { padding: 1.5rem 1.25rem 3rem; }
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

      <div className="bundles-page">
        {/* Hero section */}
        <div className="bundles-hero">
          <div className="bundles-hero-inner">
            <div className="bundles-eyebrow">
              <span className="bundles-eyebrow-dot" />
              Shop Collection
            </div>
            <h1 className="bundles-hero-title">
              Product <span>Bundles</span>
            </h1>
            <div className="bundles-title-accent">
              <div className="bundles-bar" />
              <div className="bundles-bar-thin" />
            </div>
            <p className="bundles-hero-sub">Great value packages — Save more with bundles</p>
          </div>
        </div>

        {/* Content */}
        <div className="bundles-grid-wrap">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '5rem 0',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <Spinner animation="border"
                style={{ color: C.red, width: '2.5rem', height: '2.5rem', borderWidth: '3px' }} />
              <p style={{ fontFamily: 'Barlow, sans-serif', color: C.gray,
                letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.72rem', margin: 0 }}>
                Loading Bundles…
              </p>
            </div>
          ) : error ? (
            <Alert variant="danger" style={{ borderLeft: `4px solid ${C.red}`, borderRadius: '6px' }}>
              {error}
            </Alert>
          ) : activeBundles.length === 0 ? (
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
                <FaShoppingCart size={32} color={C.red} />
              </div>
              <h3 style={{
                fontFamily: 'Barlow, sans-serif',
                fontSize: '1.1rem', fontWeight: 700,
                letterSpacing: '0.03em',
                color: C.charcoal, margin: '0 0 0.5rem'
              }}>No Bundles Available</h3>
              <p style={{
                fontFamily: 'Barlow, sans-serif',
                fontSize: '0.875rem', color: C.gray, margin: 0
              }}>Check back soon for exciting product bundles!</p>
            </div>
          ) : (
            <Row className="g-2 g-md-3">
              {activeBundles.map(bundle => renderBundleCard(bundle))}
            </Row>
          )}
        </div>
      </div>
    </>
  );
}