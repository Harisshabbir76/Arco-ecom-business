import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { FaStar, FaShoppingCart } from 'react-icons/fa';
import { useCart } from './CartContext';
import { useNavigate, Link } from 'react-router-dom';

// ARCO brand colors — matched to logo
const C = {
  red:        '#CC1B1B',
  redDark:    '#A01212',
  redDeep:    '#7A0C0C',
  redLight:   '#fdf2f2',
  redMid:     '#e8a0a0',
  white:      '#ffffff',
  border:     '#e8e8e8',
  charcoal:   '#1e1e1e',
  textMuted:  '#718096',
  textBody:   '#2D3748',
  lightGray:  '#f7f7f7',
  gradient:   'linear-gradient(135deg, #CC1B1B 0%, #A01212 100%)',
  softGrad:   'linear-gradient(135deg, #fdf2f2 0%, #f5c6c6 100%)',
};

const getProductImage = (product) => {
  const img = product?.image?.[0] || product?.images?.[0];
  if (!img) return '/placeholder.jpg';
  if (img.startsWith('http')) return img;
  return `${process.env.REACT_APP_API_URL}${img.startsWith('/') ? '' : '/'}${img}`;
};

export default function HomeFeaturedCategories() {
  const [featuredCategories, setFeaturedCategories] = useState([]);
  const [products, setProducts]                     = useState([]);
  const [loading, setLoading]                       = useState(true);
  const [error, setError]                           = useState(null);
  const { addToCart }                               = useCart();
  const navigate                                    = useNavigate();

  useEffect(() => {
    const fetchFeaturedData = async () => {
      try {
        setLoading(true);
        const catRes  = await axios.get(`${process.env.REACT_APP_API_URL}/api/categories`);
        const catsToShow = catRes.data.filter(cat => cat.showOnHome);
        setFeaturedCategories(catsToShow);

        const prodRes   = await axios.get(`${process.env.REACT_APP_API_URL}/catalog`);
        const allProducts = Array.isArray(prodRes.data)
          ? prodRes.data
          : prodRes.data?.data || prodRes.data?.products || [];
        setProducts(allProducts);
      } catch (err) {
        console.error('Error fetching featured data:', err);
        setError('Failed to load featured products.');
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedData();
  }, []);

  const handleProductClick = (productId) => navigate(`/catalog/${productId}`);

  const getFilteredProducts = (categoryName) =>
    products
      .filter(p => {
        const pCatName = typeof p?.category === 'object' ? p?.category?.name : p?.category;
        return (pCatName || '').toLowerCase().trim() === (categoryName || '').toLowerCase().trim();
      })
      .sort((a, b) =>
        new Date(b.createdAt || b.updatedAt || b.date || 0) -
        new Date(a.createdAt || a.updatedAt || a.date || 0)
      );

  const getCategorySlug = (name) =>
    name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  if (loading) {
    return (
      <div style={{
        background: C.white, padding: '5rem 0', textAlign: 'center',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem'
      }}>
        <Spinner animation="border" style={{ color: C.red, width: '2.5rem', height: '2.5rem', borderWidth: '3px' }} />
        <p style={{
          fontFamily: "'Barlow', sans-serif", color: C.textMuted,
          letterSpacing: '0.1em', textTransform: 'uppercase',
          fontSize: '0.72rem', margin: 0
        }}>Loading Featured Products…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: C.white, padding: '3rem 1.5rem' }}>
        <Alert variant="danger" style={{
          maxWidth: 600, margin: '0 auto',
          borderLeft: `4px solid ${C.red}`, borderRadius: 4
        }}>{error}</Alert>
      </div>
    );
  }

  if (featuredCategories.length === 0) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;500;600;700&display=swap');

        .hfc-card {
          background: ${C.white};
          border-radius: 10px;
          overflow: hidden;
          cursor: pointer;
          position: relative;
          border: 1px solid ${C.border};
          display: flex;
          flex-direction: column;
          transition: all 0.25s ease;
          height: 100%;
        }
        .hfc-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 28px rgba(204,27,27,0.14);
        }
        .hfc-card:hover .hfc-img {
          transform: scale(1.06);
        }

        .hfc-img-wrap {
          position: relative;
          width: 100%;
          height: 230px;
          overflow: hidden;
          background: ${C.lightGray};
          flex-shrink: 0;
        }
        .hfc-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.35s ease;
          display: block;
        }

        /* Badges */
        .hfc-badge {
          position: absolute;
          font-family: 'Barlow', sans-serif;
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.02em;
          padding: 3px 8px;
          border-radius: 4px;
          z-index: 2;
        }
        .hfc-badge-discount { 
          top: 9px;
          left: 9px;  
          background: ${C.gradient}; 
          color: white; 
        }
        .hfc-badge-stock { 
          top: 9px;
          right: 9px; 
          background: ${C.red}; 
          color: white; 
        }

        /* Rating pill */
        .hfc-rating-pill {
          position: absolute;
          bottom: 9px;
          left: 9px;
          background: ${C.white};
          border-radius: 30px;
          padding: 3px 9px;
          display: flex;
          align-items: center;
          gap: 4px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.12);
          z-index: 2;
        }

        /* Quick Add Button */
        .hfc-quick-add {
          position: absolute;
          bottom: 10px;
          left: 50%;
          transform: translateX(-50%) translateY(6px);
          border: 1px solid ${C.border};
          padding: 5px 14px;
          border-radius: 30px;
          font-size: 0.72rem;
          font-weight: 500;
          white-space: nowrap;
          z-index: 3;
          opacity: 0;
          transition: opacity 0.2s ease, transform 0.2s ease;
          display: flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          cursor: pointer;
          background: ${C.white};
          color: ${C.red};
        }
        .hfc-card:hover .hfc-quick-add {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
        .hfc-quick-add:hover:not(:disabled) {
          background: ${C.red};
          color: ${C.white};
          border-color: ${C.red};
        }
        .hfc-quick-add:disabled {
          opacity: 0;
          cursor: not-allowed;
        }

        /* Card Body */
        .hfc-body {
          padding: 0.85rem 1rem 1rem;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .hfc-category {
          font-family: 'Barlow', sans-serif;
          font-size: 0.75rem;
          font-weight: 500;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: ${C.textMuted};
          margin-bottom: 0.2rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .hfc-name {
          font-family: 'Barlow', sans-serif;
          font-size: 0.92rem;
          font-weight: 600;
          color: ${C.charcoal};
          line-height: 1.35;
          margin: 0 0 0.2rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          min-height: 2.5rem;
        }

        .hfc-pricing {
          display: flex;
          align-items: baseline;
          gap: 6px;
          margin-bottom: 0.75rem;
          flex-wrap: wrap;
        }
        .hfc-price-current {
          font-size: 1.05rem;
          font-weight: 700;
          color: ${C.red};
        }
        .hfc-price-original {
          font-size: 0.75rem;
          color: ${C.textMuted};
          text-decoration: line-through;
        }

        /* Add to Cart Button */
        .hfc-add-btn {
          width: 100%;
          background: ${C.gradient};
          color: ${C.white};
          border: none;
          padding: 0.55rem;
          border-radius: 7px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          margin-top: auto;
          letter-spacing: 0.02em;
        }
        .hfc-add-btn:hover:not(:disabled) {
          opacity: 0.88;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(204,27,27,0.3);
        }
        .hfc-add-btn:disabled {
          background: #e2e8f0;
          color: ${C.textMuted};
          cursor: not-allowed;
        }

        .hfc-see-more {
          display: inline-block;
          background: ${C.gradient};
          color: ${C.white};
          padding: 0.6rem 2rem;
          border-radius: 7px;
          font-weight: 600;
          font-size: 0.9rem;
          text-decoration: none;
          letter-spacing: 0.03em;
          transition: all 0.2s ease;
          border: none;
        }
        .hfc-see-more:hover {
          background: ${C.redDark};
          box-shadow: 0 4px 14px rgba(204,27,27,0.35);
          transform: translateY(-1px);
          color: ${C.white};
        }

        /* Grid Layout */
        .hfc-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.125rem;
          margin-top: 2rem;
        }

        /* Responsive Breakpoints */
        @media (max-width: 1100px) {
          .hfc-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
          }
        }

        @media (max-width: 768px) {
          .hfc-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.5rem;
          }

          .hfc-img-wrap {
            height: 160px;
          }

          .hfc-body {
            padding: 0.55rem 0.65rem 0.7rem;
          }

          .hfc-name {
            font-size: 0.78rem;
            min-height: 2.1rem;
            margin-bottom: 0.15rem;
          }

          .hfc-price-current {
            font-size: 0.88rem;
          }

          .hfc-price-original {
            font-size: 0.7rem;
          }

          .hfc-category {
            font-size: 0.62rem;
          }

          .hfc-badge {
            font-size: 0.58rem;
            padding: 2px 6px;
            top: 6px;
          }

          .hfc-quick-add {
            display: none;
          }

          .hfc-add-btn {
            font-size: 0.72rem;
            padding: 0.42rem 0.3rem;
            gap: 5px;
          }

          .hfc-rating-pill {
            bottom: 6px;
            left: 6px;
            padding: 2px 6px;
          }

          .hfc-rating-pill span {
            font-size: 0.62rem;
          }
        }

        @media (max-width: 480px) {
          .hfc-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.45rem;
          }

          .hfc-img-wrap {
            height: 150px;
          }

          .hfc-body {
            padding: 0.5rem 0.55rem 0.6rem;
          }

          .hfc-name {
            font-size: 0.74rem;
            min-height: 2rem;
          }

          .hfc-price-current {
            font-size: 0.82rem;
          }

          .hfc-category {
            font-size: 0.58rem;
          }

          .hfc-pricing {
            margin-bottom: 0.5rem;
          }

          .hfc-add-btn {
            font-size: 0.68rem;
            padding: 0.38rem 0.25rem;
          }

          .hfc-add-btn svg {
            font-size: 0.65rem;
          }
        }
      `}</style>

      {featuredCategories.map((cat, index) => {
        const catProducts = getFilteredProducts(cat.name);
        if (catProducts.length === 0) return null;

        return (
          <React.Fragment key={cat._id || index}>
            {/* ── Section ── */}
            <div style={{
              background: C.white,
              padding: '56px 1.5rem 64px',
              fontFamily: "'Barlow', sans-serif",
            }}>
              <div style={{ maxWidth: 1320, margin: '0 auto' }}>
                {/* ── Centered Section Header ── */}
                <div style={{ textAlign: 'center', marginBottom: '2.75rem' }}>
                  <div style={{
                    width: 50,
                    height: 3,
                    background: C.gradient,
                    borderRadius: 2,
                    margin: '0 auto 1rem auto',
                  }} />
                  
                  <h2 style={{
                    fontSize: 'clamp(1.3rem, 3vw, 1.9rem)',
                    fontWeight: 700,
                    color: C.charcoal,
                    margin: 0,
                    letterSpacing: '-0.01em',
                  }}>
                    Featured{' '}
                    <span style={{ color: C.red }}>{cat.name}</span>
                  </h2>
                  
                  <p style={{
                    color: C.textMuted,
                    fontSize: '0.9rem',
                    margin: '0.5rem auto 0',
                    maxWidth: '500px',
                  }}>
                    Discover our top picks for {cat.name}
                  </p>
                </div>

                {/* ── Product grid ── */}
                <div className="hfc-grid">
                  {catProducts.map(product => {
                    const discountPct = product.discountedPrice && product.discountedPrice < product.originalPrice
                      ? Math.round(((product.originalPrice - product.discountedPrice) / product.originalPrice) * 100)
                      : null;
                    const rating = product.rating || 0;
                    const stockQty = product.stock ?? 0;

                    return (
                      <div
                        key={product._id}
                        className="hfc-card"
                        onClick={() => handleProductClick(product._id)}
                      >
                        {/* Image */}
                        <div className="hfc-img-wrap">
                          <img
                            className="hfc-img"
                            src={getProductImage(product)}
                            alt={product.name}
                            loading="lazy"
                            onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                          />

                          {/* Discount badge */}
                          {discountPct && (
                            <span className="hfc-badge hfc-badge-discount">
                              {discountPct}% OFF
                            </span>
                          )}

                          {/* Stock badge */}
                          {stockQty > 0 && stockQty <= 5 && (
                            <span className="hfc-badge hfc-badge-stock">
                              Only {stockQty} left
                            </span>
                          )}

                          {/* Rating pill */}
                          {rating > 0 && (
                            <div className="hfc-rating-pill">
                              <FaStar style={{ color: C.red, fontSize: '0.65rem' }} />
                              <span>
                                {Number(rating).toFixed(1)}
                              </span>
                            </div>
                          )}

                          {/* Quick Add on Hover */}
                          <button
                            className="hfc-quick-add"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (stockQty > 0) addToCart({ ...product, quantity: 1 });
                            }}
                            disabled={stockQty <= 0}
                          >
                            <FaShoppingCart size={11} />
                            {stockQty > 0 ? 'Quick Add' : 'Out of Stock'}
                          </button>
                        </div>

                        {/* Body */}
                        <div className="hfc-body">
                          {/* Category label */}
                          <span className="hfc-category">
                            {typeof product.category === 'object'
                              ? product.category.name
                              : (product.category || 'Uncategorized')}
                          </span>

                          {/* Name */}
                          <p className="hfc-name">{product.name}</p>

                          {/* Price */}
                          <div className="hfc-pricing">
                            {discountPct && (
                              <span className="hfc-price-original">
                                Rs. {product.originalPrice?.toLocaleString()}
                              </span>
                            )}
                            <span className="hfc-price-current">
                              Rs. {(product.discountedPrice || product.originalPrice)?.toLocaleString()}
                            </span>
                          </div>

                          {/* Add to cart button */}
                          <button
                            className="hfc-add-btn"
                            onClick={(e) => { e.stopPropagation(); addToCart({ ...product, quantity: 1 }); }}
                            disabled={stockQty <= 0}
                          >
                            <FaShoppingCart size={13} />
                            {stockQty > 0 ? 'Add to Cart' : 'Out of Stock'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* ── See More button ── */}
                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                  <Link
                    to={`/category/${getCategorySlug(cat.name)}`}
                    className="hfc-see-more"
                  >
                    See More {cat.name}
                  </Link>
                </div>
              </div>
            </div>

            {/* ── Divider between sections ── */}
            <div style={{
              height: 1,
              background: C.border,
              width: '100%',
            }} />
          </React.Fragment>
        );
      })}
    </>
  );
}