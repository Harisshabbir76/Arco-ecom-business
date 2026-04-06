import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Spinner, Alert } from 'react-bootstrap';
import { FaStar, FaShoppingCart } from 'react-icons/fa';
import { useCart } from './CartContext';
import { useNavigate } from 'react-router-dom';

// ARCO brand colors — matched to other components
const C = {
  red: '#CC1B1B',
  redDark: '#A01212',
  redLight: '#fdf2f2',
  black: '#111111',
  charcoal: '#1e1e1e',
  white: '#ffffff',
  border: '#e8e8e8',
  lightGray: '#f7f7f7',
  muted: '#888',
  gradient: 'linear-gradient(135deg, #CC1B1B 0%, #A01212 100%)',
};

const getProductImage = (product) => {
  const img = product?.image?.[0] || product?.images?.[0];
  if (!img) return '/placeholder.jpg';
  if (img.startsWith('http')) return img;
  return `${process.env.REACT_APP_API_URL}${img.startsWith('/') ? '' : '/'}${img}`;
};

export default function TopRatedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopRatedProducts = async () => {
      try {
        setLoading(true);
        const prodRes = await axios.get(`${process.env.REACT_APP_API_URL}/catalog`);
        let allProducts = Array.isArray(prodRes.data) 
          ? prodRes.data 
          : prodRes.data?.data || prodRes.data?.products || [];
        
        const sortedProducts = allProducts
          .filter(p => p.averageRating > 0 || p.rating > 0)
          .sort((a, b) => (b.averageRating || b.rating || 0) - (a.averageRating || a.rating || 0))
          .slice(0, 8);
        
        setProducts(sortedProducts);
      } catch (err) {
        console.error('Error fetching top rated products:', err);
        setError('Failed to load top rated products.');
      } finally {
        setLoading(false);
      }
    };

    fetchTopRatedProducts();
  }, []);

  const handleProductClick = (productId) => {
    navigate(`/catalog/${productId}`);
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    if (product.stock > 0) addToCart({ ...product, quantity: 1 });
  };

  if (loading) {
    return (
      <div style={{
        background: C.white, padding: '5rem 0', textAlign: 'center',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem'
      }}>
        <Spinner animation="border" style={{ color: C.red, width: '2.5rem', height: '2.5rem', borderWidth: '3px' }} />
        <p style={{
          fontFamily: "'Barlow', sans-serif", color: C.muted,
          letterSpacing: '0.1em', textTransform: 'uppercase',
          fontSize: '0.72rem', margin: 0
        }}>Loading Top Rated…</p>
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

  if (products.length === 0) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;500;600;700&display=swap');

        .tr-section {
          background: ${C.white};
          padding: 56px 1.5rem 64px;
          position: relative;
          overflow: hidden;
        }

        .tr-inner {
          max-width: 1320px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        /* ── Header - Centered ── */
        .tr-header {
          text-align: center;
          margin-bottom: 2.75rem;
        }

        .tr-accent-bar {
          width: 50px;
          height: 3px;
          background: ${C.gradient};
          border-radius: 2px;
          margin: 0 auto 1rem auto;
        }

        .tr-title {
          font-family: 'Barlow', sans-serif;
          font-size: clamp(1.3rem, 3vw, 1.9rem);
          font-weight: 700;
          letter-spacing: -0.01em;
          color: ${C.charcoal};
          line-height: 1.15;
          margin: 0 0 0.6rem;
        }
        .tr-title span {
          color: ${C.red};
        }

        .tr-subtitle {
          color: ${C.muted};
          font-size: 0.9rem;
          margin: 0.5rem auto 0;
          max-width: 500px;
          font-family: 'Barlow', sans-serif;
        }

        /* ── Grid Layout ── */
        .tr-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.125rem;
          margin-top: 2rem;
        }
        
        /* Tablet */
        @media (max-width: 1100px) {
          .tr-grid { 
            grid-template-columns: repeat(3, 1fr); 
            gap: 1rem;
          }
        }
        
        /* Mobile - Shopify Standard (2 columns, optimized sizing) */
        @media (max-width: 768px) {
          .tr-section { 
            padding: 2rem 0.75rem 3rem; 
          }
          .tr-grid { 
            grid-template-columns: repeat(2, 1fr); 
            gap: 0.75rem;
            margin-top: 1.5rem;
          }
          .tr-header { 
            margin-bottom: 1.5rem; 
          }
        }

        /* Small Mobile */
        @media (max-width: 480px) {
          .tr-grid { 
            gap: 0.6rem;
          }
          .tr-section {
            padding: 1.5rem 0.6rem 2.5rem;
          }
        }

        /* ── Card Styles ── */
        .tr-card {
          background: ${C.white};
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          position: relative;
          border: 1px solid ${C.border};
          display: flex;
          flex-direction: column;
          transition: all 0.25s ease;
          height: 100%;
        }
        
        .tr-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 28px rgba(204,27,27,0.14);
        }
        
        .tr-card:hover .tr-img {
          transform: scale(1.06);
        }

        /* ── Image wrapper - Desktop ── */
        .tr-img-wrap {
          position: relative;
          width: 100%;
          height: 230px;
          overflow: hidden;
          background: ${C.lightGray};
          flex-shrink: 0;
        }
        
        .tr-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.35s ease;
          display: block;
        }

        /* Mobile Image Size - Shopify Standard */
        @media (max-width: 768px) {
          .tr-img-wrap {
            height: 160px;
          }
        }

        @media (max-width: 480px) {
          .tr-img-wrap {
            height: 140px;
          }
        }

        /* ── Badges ── */
        .tr-badge {
          position: absolute;
          font-family: 'Barlow', sans-serif;
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.02em;
          padding: 3px 8px;
          border-radius: 4px;
          z-index: 2;
        }
        
        .tr-badge-discount { 
          top: 9px;
          left: 9px;  
          background: ${C.gradient}; 
          color: white; 
        }
        
        .tr-badge-stock { 
          top: 9px;
          right: 9px; 
          background: ${C.red}; 
          color: white; 
        }

        /* Mobile Badge Sizing */
        @media (max-width: 768px) {
          .tr-badge {
            font-size: 0.6rem;
            padding: 2px 6px;
            top: 6px;
          }
          .tr-badge-discount { left: 6px; }
          .tr-badge-stock { right: 6px; }
        }

        /* Rating pill */
        .tr-rating-pill {
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

        @media (max-width: 768px) {
          .tr-rating-pill {
            bottom: 6px;
            left: 6px;
            padding: 2px 6px;
          }
          .tr-rating-pill svg {
            font-size: 0.55rem !important;
          }
          .tr-rating-pill span {
            font-size: 0.65rem !important;
          }
        }

        /* ── Quick Add Button ── */
        .tr-quick-add {
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
        
        .tr-card:hover .tr-quick-add {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
        
        .tr-quick-add:hover:not(:disabled) {
          background: ${C.red};
          color: ${C.white};
          border-color: ${C.red};
        }
        
        .tr-quick-add:disabled {
          opacity: 0;
          cursor: not-allowed;
        }

        /* Hide quick add on mobile */
        @media (max-width: 768px) {
          .tr-quick-add {
            display: none;
          }
        }

        /* ── Card body ── */
        .tr-body {
          padding: 0.85rem 1rem 1rem;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        /* Mobile Body Padding - Shopify Standard */
        @media (max-width: 768px) {
          .tr-body {
            padding: 0.6rem 0.7rem 0.75rem;
          }
        }

        @media (max-width: 480px) {
          .tr-body {
            padding: 0.5rem 0.6rem 0.65rem;
          }
        }

        .tr-category {
          font-family: 'Barlow', sans-serif;
          font-size: 0.75rem;
          font-weight: 500;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: ${C.muted};
          margin-bottom: 0.2rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Mobile Category Size */
        @media (max-width: 768px) {
          .tr-category {
            font-size: 0.65rem;
            margin-bottom: 0.15rem;
          }
        }

        @media (max-width: 480px) {
          .tr-category {
            font-size: 0.6rem;
          }
        }

        .tr-name {
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

        /* Mobile Name Size - Shopify Standard */
        @media (max-width: 768px) {
          .tr-name {
            font-size: 0.8rem;
            min-height: 2.2rem;
            margin-bottom: 0.15rem;
          }
        }

        @media (max-width: 480px) {
          .tr-name {
            font-size: 0.75rem;
            min-height: 2rem;
            line-height: 1.3;
          }
        }

        .tr-pricing {
          display: flex;
          align-items: baseline;
          gap: 6px;
          margin-bottom: 0.75rem;
          flex-wrap: wrap;
        }
        
        .tr-price-current {
          font-size: 1.05rem;
          font-weight: 700;
          color: ${C.red};
        }
        
        .tr-price-original {
          font-size: 0.75rem;
          color: ${C.muted};
          text-decoration: line-through;
        }

        /* Mobile Price Size - Shopify Standard */
        @media (max-width: 768px) {
          .tr-pricing {
            margin-bottom: 0.6rem;
            gap: 4px;
          }
          .tr-price-current {
            font-size: 0.9rem;
          }
          .tr-price-original {
            font-size: 0.7rem;
          }
        }

        @media (max-width: 480px) {
          .tr-price-current {
            font-size: 0.85rem;
          }
          .tr-price-original {
            font-size: 0.65rem;
          }
        }

        /* ── Add to Cart Button ── */
        .tr-add-btn {
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
        
        .tr-add-btn:hover:not(:disabled) {
          opacity: 0.88;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(204,27,27,0.3);
        }
        
        .tr-add-btn:disabled {
          background: #e2e8f0;
          color: ${C.muted};
          cursor: not-allowed;
        }

        /* Mobile Button Size - Shopify Standard */
        @media (max-width: 768px) {
          .tr-add-btn {
            padding: 0.45rem;
            font-size: 0.75rem;
            gap: 5px;
            border-radius: 6px;
          }
          .tr-add-btn svg {
            font-size: 0.7rem;
          }
        }

        @media (max-width: 480px) {
          .tr-add-btn {
            padding: 0.4rem;
            font-size: 0.7rem;
          }
          .tr-add-btn svg {
            font-size: 0.65rem;
          }
        }
      `}</style>

      <section className="tr-section">
        <div className="tr-inner">
          {/* ── Centered Header ── */}
          <div className="tr-header">
            <div className="tr-accent-bar" />
            <h2 className="tr-title">
              Top <span>Rated</span>
            </h2>
            <p className="tr-subtitle">
              Our most highly rated products by customers
            </p>
          </div>

          {/* ── Grid ── */}
          <div className="tr-grid">
            {products.map((product) => {
              const discountPct = product.discountedPrice && product.discountedPrice < product.originalPrice
                ? Math.round(((product.originalPrice - product.discountedPrice) / product.originalPrice) * 100)
                : null;
              const rating = product.averageRating || product.rating || 0;
              const stockQty = product.stock ?? 0;

              return (
                <div
                  key={product._id}
                  className="tr-card"
                  onClick={() => handleProductClick(product._id)}
                >
                  {/* Image */}
                  <div className="tr-img-wrap">
                    <img
                      className="tr-img"
                      src={getProductImage(product)}
                      alt={product.name}
                      loading="lazy"
                      onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                    />

                    {/* Discount Badge */}
                    {discountPct && (
                      <span className="tr-badge tr-badge-discount">
                        {discountPct}% OFF
                      </span>
                    )}

                    {/* Stock Badge */}
                    {stockQty > 0 && stockQty <= 5 && (
                      <span className="tr-badge tr-badge-stock">
                        Only {stockQty} left
                      </span>
                    )}

                    {/* Rating Pill */}
                    {rating > 0 && (
                      <div className="tr-rating-pill">
                        <FaStar style={{ color: C.red, fontSize: '0.65rem' }} />
                        <span>
                          {rating.toFixed(1)}
                        </span>
                      </div>
                    )}

                    {/* Quick Add on Hover */}
                    <button
                      className="tr-quick-add"
                      onClick={(e) => handleAddToCart(e, product)}
                      disabled={stockQty <= 0}
                    >
                      <FaShoppingCart size={11} />
                      {stockQty > 0 ? 'Quick Add' : 'Out of Stock'}
                    </button>
                  </div>

                  {/* Body */}
                  <div className="tr-body">
                    {product.category && (
                      <span className="tr-category">
                        {typeof product.category === 'object' ? product.category.name : product.category}
                      </span>
                    )}

                    <p className="tr-name">{product.name}</p>

                    {/* Pricing */}
                    <div className="tr-pricing">
                      {discountPct && (
                        <span className="tr-price-original">
                          Rs. {product.originalPrice?.toLocaleString()}
                        </span>
                      )}
                      <span className="tr-price-current">
                        Rs. {(product.discountedPrice || product.originalPrice)?.toLocaleString()}
                      </span>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      className="tr-add-btn"
                      onClick={(e) => handleAddToCart(e, product)}
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