import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Spinner, Alert } from 'react-bootstrap';
import { FaStar, FaShoppingCart } from 'react-icons/fa';
import { FiArrowRight } from 'react-icons/fi';
import { useCart } from './CartContext';
import { useNavigate, Link } from 'react-router-dom';

const C = {
  red:       '#CC1B1B',
  redDark:   '#A01212',
  redLight:  '#fdf2f2',
  black:     '#111111',
  charcoal:  '#1e1e1e',
  white:     '#ffffff',
  lightGray: '#f7f7f7',
  border:    '#e8e8e8',
  gray:      '#888888',
  gradient:  'linear-gradient(135deg, #CC1B1B 0%, #A01212 100%)',
};

const getProductImage = (product) => {
  const img = product?.image?.[0] || product?.images?.[0];
  if (!img) return '/placeholder.jpg';
  if (img.startsWith('http')) return img;
  return `${process.env.REACT_APP_API_URL}${img.startsWith('/') ? '' : '/'}${img}`;
};

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const { addToCart }           = useCart();
  const navigate                = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/featured-products`);
        console.log('FeaturedProducts API response:', { 
          type: typeof res.data, 
          isArray: Array.isArray(res.data), 
          length: res.data?.length, 
          data: res.data 
        });
        
        // Handle the response properly - check if it's actually HTML
        let data = res.data;
        
        // If response is a string that looks like HTML, it's an error
        if (typeof data === 'string' && data.includes('<!doctype html>')) {
          console.error('Received HTML instead of JSON - check API endpoint');
          setError('Unable to load featured products. Please try again later.');
          setProducts([]);
          setLoading(false);
          return;
        }
        
        // Ensure we have an array
        const productsArray = Array.isArray(data) ? data : (data?.products || []);
        setProducts(productsArray);
      } catch (err) {
        console.error('FeaturedProducts API error:', err.response?.data || err.message);
        setProducts([]);
        setError('Failed to load featured products.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleProductClick = (productId) => navigate(`/catalog/${productId}`);

  if (loading) return (
    <div style={{
      background: C.white, padding: '5rem 0', textAlign: 'center',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem'
    }}>
      <Spinner animation="border" style={{ color: C.red, width: '2.5rem', height: '2.5rem', borderWidth: '3px' }} />
      <p style={{
        fontFamily: "'Barlow', sans-serif", color: C.gray,
        letterSpacing: '0.1em', textTransform: 'uppercase',
        fontSize: '0.72rem', margin: 0
      }}>Loading Collection…</p>
    </div>
  );

  if (error) return (
    <div style={{ background: C.white, padding: '3rem 1.5rem' }}>
      <Alert variant="danger" style={{
        maxWidth: 600, margin: '0 auto',
        borderLeft: `4px solid ${C.red}`, borderRadius: 4
      }}>{error}</Alert>
    </div>
  );

  // Safe check for products array
  if (!products || !Array.isArray(products) || products.length === 0) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;500;600;700&display=swap');

        /* ── Section ── */
        .fp-section {
          background: ${C.white};
          padding: 56px 1.5rem 64px;
          position: relative;
          overflow: hidden;
        }

        .fp-inner {
          max-width: 1320px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        /* ── Header - Centered ── */
        .fp-header {
          text-align: center;
          margin-bottom: 2.75rem;
        }

        .fp-accent-bar {
          width: 50px;
          height: 3px;
          background: ${C.gradient};
          border-radius: 2px;
          margin: 0 auto 1rem auto;
        }

        .fp-title {
          font-family: 'Barlow', sans-serif;
          font-size: clamp(1.3rem, 3vw, 1.9rem);
          font-weight: 700;
          letter-spacing: -0.01em;
          color: ${C.charcoal};
          line-height: 1.15;
          margin: 0 0 0.6rem;
        }
        .fp-title span {
          color: ${C.red};
        }

        .fp-subtitle {
          color: ${C.gray};
          font-size: 0.9rem;
          margin: 0.5rem auto 0;
          max-width: 500px;
          font-family: 'Barlow', sans-serif;
        }

        .fp-view-all {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-family: 'Barlow', sans-serif;
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: ${C.white};
          text-decoration: none;
          padding: 10px 28px;
          background: ${C.gradient};
          border-radius: 6px;
          transition: all 0.2s ease;
          white-space: nowrap;
          border: none;
          margin-top: 1.5rem;
        }
        .fp-view-all:hover {
          background: linear-gradient(135deg, #A01212 0%, #7A0C0C 100%);
          box-shadow: 0 4px 14px rgba(204,27,27,0.32);
          transform: translateY(-1px);
          color: ${C.white};
        }

        /* ── Grid ── */
        .fp-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.125rem;
          margin-top: 2rem;
        }
        @media (max-width: 1100px) {
          .fp-grid { grid-template-columns: repeat(3, 1fr); }
        }

        /* ── Card ── */
        .fp-card {
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
        .fp-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 28px rgba(204,27,27,0.14);
        }
        .fp-card:hover .fp-img {
          transform: scale(1.06);
        }

        /* ── Image wrapper ── */
        .fp-img-wrap {
          position: relative;
          width: 100%;
          height: 230px;
          overflow: hidden;
          background: ${C.lightGray};
          flex-shrink: 0;
        }
        .fp-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.35s ease;
          display: block;
        }

        /* ── Badges ── */
        .fp-badge {
          position: absolute;
          font-family: 'Barlow', sans-serif;
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.02em;
          padding: 3px 8px;
          border-radius: 4px;
          z-index: 2;
        }
        .fp-badge-discount { 
          top: 9px;
          left: 9px;  
          background: ${C.gradient}; 
          color: white; 
        }
        .fp-badge-new { 
          top: 9px;
          left: 9px;  
          background: ${C.charcoal}; 
          color: white; 
        }
        .fp-badge-stock { 
          top: 9px;
          right: 9px; 
          background: ${C.red}; 
          color: white; 
        }

        /* Rating pill */
        .fp-rating-pill {
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

        /* ── Quick Add Button (appears on hover) ── */
        .fp-quick-add {
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
        .fp-card:hover .fp-quick-add {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
        .fp-quick-add:hover:not(:disabled) {
          background: ${C.red};
          color: ${C.white};
          border-color: ${C.red};
        }
        .fp-quick-add:disabled {
          opacity: 0;
          cursor: not-allowed;
        }

        /* ── Card body ── */
        .fp-body {
          padding: 0.85rem 1rem 1rem;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .fp-category {
          font-family: 'Barlow', sans-serif;
          font-size: 0.75rem;
          font-weight: 500;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: ${C.gray};
          margin-bottom: 0.2rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .fp-name {
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

        .fp-pricing {
          display: flex;
          align-items: baseline;
          gap: 6px;
          margin-bottom: 0.75rem;
          flex-wrap: wrap;
        }
        .fp-price-current {
          font-size: 1.05rem;
          font-weight: 700;
          color: ${C.red};
        }
        .fp-price-original {
          font-size: 0.75rem;
          color: ${C.gray};
          text-decoration: line-through;
        }

        /* ── Add to Cart Button ── */
        .fp-add-btn {
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
        .fp-add-btn:hover:not(:disabled) {
          opacity: 0.88;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(204,27,27,0.3);
        }
        .fp-add-btn:disabled {
          background: #e2e8f0;
          color: ${C.gray};
          cursor: not-allowed;
        }

        /* ── Mobile adjustments ── */
        @media (max-width: 768px) {
          .fp-section { padding: 3rem 1rem 3.5rem; }
          .fp-grid    { grid-template-columns: repeat(2, 1fr); gap: 0.5rem; }
          .fp-header  { margin-bottom: 1.75rem; }

          .fp-img-wrap { height: 160px; }
          .fp-body { padding: 0.55rem 0.65rem 0.7rem; }
          .fp-name { font-size: 0.78rem; min-height: 2.1rem; margin-bottom: 0.15rem; }
          .fp-price-current { font-size: 0.88rem; }
          .fp-price-original { font-size: 0.7rem; }
          .fp-category { font-size: 0.62rem; }
          .fp-badge { font-size: 0.58rem; padding: 2px 6px; top: 6px; }
          .fp-quick-add { display: none; }
          .fp-add-btn { font-size: 0.72rem; padding: 0.42rem 0.3rem; gap: 5px; }
          .fp-rating-pill { bottom: 6px; left: 6px; padding: 2px 6px; }
          .fp-rating-pill span { font-size: 0.62rem; }
          .fp-pricing { margin-bottom: 0.5rem; }
        }

        @media (max-width: 480px) {
          .fp-grid { gap: 0.45rem; }

          .fp-img-wrap { height: 150px; }
          .fp-body { padding: 0.5rem 0.55rem 0.6rem; }
          .fp-name { font-size: 0.74rem; min-height: 2rem; }
          .fp-price-current { font-size: 0.82rem; }
          .fp-category { font-size: 0.58rem; }
          .fp-add-btn { font-size: 0.68rem; padding: 0.38rem 0.25rem; }
          .fp-add-btn svg { font-size: 0.65rem; }
        }
      `}</style>

      <section className="fp-section">
        <div className="fp-inner">

          {/* ── Centered Header ── */}
          <div className="fp-header">
            <div className="fp-accent-bar" />
            <h2 className="fp-title">
              Featured <span>Products</span>
            </h2>
            <p className="fp-subtitle">
              Hand-picked premium products just for you
            </p>
            <Link to="/catalog" className="fp-view-all">
              View All Collection
              <FiArrowRight size={14} />
            </Link>
          </div>

          {/* ── Grid ── */}
          <div className="fp-grid">
            {products.map((product) => {
              // Add safe check for product
              if (!product) return null;
              
              const discountPct = product.discountedPrice && product.discountedPrice < product.originalPrice
                ? Math.round(((product.originalPrice - product.discountedPrice) / product.originalPrice) * 100)
                : null;
              const rating = product.averageRating ? parseFloat(product.averageRating) : (product.rating || 0);
              const isNew = !discountPct && product.isNew;
              const stockQty = product.stock ?? 0;

              return (
                <div
                  key={product._id || Math.random()}
                  className="fp-card"
                  onClick={() => handleProductClick(product._id)}
                >
                  {/* Image */}
                  <div className="fp-img-wrap">
                    <img
                      className="fp-img"
                      src={getProductImage(product)}
                      alt={product.name || 'Product'}
                      loading="lazy"
                      onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                    />

                    {/* Discount Badge */}
                    {discountPct && (
                      <span className="fp-badge fp-badge-discount">
                        {discountPct}% OFF
                      </span>
                    )}

                    {/* New Badge */}
                    {isNew && !discountPct && (
                      <span className="fp-badge fp-badge-new">NEW</span>
                    )}

                    {/* Stock Badge */}
                    {stockQty > 0 && stockQty <= 5 && (
                      <span className="fp-badge fp-badge-stock">
                        Only {stockQty} left
                      </span>
                    )}

                    {/* Rating Pill */}
                    {rating > 0 && (
                      <div className="fp-rating-pill">
                        <FaStar style={{ color: C.red, fontSize: '0.65rem' }} />
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          color: C.charcoal,
                        }}>
                          {rating.toFixed(1)}
                        </span>
                      </div>
                    )}

                    {/* Quick Add on Hover */}
                    <button
                      className="fp-quick-add"
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
                  <div className="fp-body">
                    {product.category && (
                      <span className="fp-category">
                        {typeof product.category === 'object' ? product.category.name : product.category}
                      </span>
                    )}

                    <p className="fp-name">{product.name || 'Product'}</p>

                    {/* Pricing */}
                    <div className="fp-pricing">
                      {discountPct && (
                        <span className="fp-price-original">
                          Rs. {product.originalPrice?.toLocaleString()}
                        </span>
                      )}
                      <span className="fp-price-current">
                        Rs. {(product.discountedPrice || product.originalPrice)?.toLocaleString()}
                      </span>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      className="fp-add-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (stockQty > 0) addToCart({ ...product, quantity: 1 });
                      }}
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

        </div>
      </section>
    </>
  );
}