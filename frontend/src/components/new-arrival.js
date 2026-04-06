import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Spinner, Alert } from 'react-bootstrap';
import { FaShoppingCart, FaBoxOpen, FaStar } from 'react-icons/fa';
import { FiArrowRight, FiEye, FiSliders, FiChevronDown } from 'react-icons/fi';
import { CartContext } from '../components/CartContext';

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

const SORT_OPTIONS = [
  { value: 'default',        label: 'Default' },
  { value: 'price-low-high', label: 'Price: Low to High' },
  { value: 'price-high-low', label: 'Price: High to Low' },
  { value: 'rating-high',    label: 'Top Rated' },
  { value: 'newest',         label: 'Newest First' },
];

export default function NewArrivals() {
  const [products, setProducts]         = useState([]);
  const [filteredProducts, setFiltered] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [sortOption, setSortOption]     = useState('default');
  const [sortOpen, setSortOpen]         = useState(false);
  const { addToCart }                   = useContext(CartContext);
  const navigate                        = useNavigate();

  /* ── Fetch ── */
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/new-arrival`);
        const data = res.data.map(p => ({
          ...p,
          stock:     p.stock     ?? Math.floor(Math.random() * 16) + 5,
          rating:    p.rating    || (Math.random() * 1 + 4).toFixed(1),
          createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
        }));
        setProducts(data);
        setFiltered(data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load new arrivals.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ── Sort ── */
  useEffect(() => {
    let sorted = [...products];
    if (sortOption === 'price-low-high') sorted.sort((a, b) => a.discountedPrice - b.discountedPrice);
    else if (sortOption === 'price-high-low') sorted.sort((a, b) => b.discountedPrice - a.discountedPrice);
    else if (sortOption === 'rating-high') sorted.sort((a, b) => b.rating - a.rating);
    else if (sortOption === 'newest') sorted.sort((a, b) => b.createdAt - a.createdAt);
    setFiltered(sorted);
  }, [sortOption, products]);

  const getImage = (p) => {
    if (!p?.image?.[0]) return '/placeholder.jpg';
    if (p.image[0].startsWith('http')) return p.image[0];
    return `${process.env.REACT_APP_API_URL}${p.image[0]}`;
  };

  const handleAdd = (e, p) => {
    e.stopPropagation();
    if (p.stock > 0) addToCart({ ...p, quantity: 1 });
  };

  const currentSortLabel = SORT_OPTIONS.find(o => o.value === sortOption)?.label || 'Sort';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; }

        /* ── Page ── */
        .na-page {
          min-height: 100vh;
          background: ${C.white};
          font-family: 'Barlow', sans-serif;
        }

        /* ── Hero — clean white background ── */
        .na-hero {
          background: ${C.white};
          padding: 3rem 2rem 2.75rem;
          position: relative;
          border-bottom: 1px solid ${C.border};
        }
        /* Left red accent bar */
        .na-hero::after {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 5px;
          background: ${C.red};
          border-radius: 0 2px 2px 0;
        }
        .na-hero-inner {
          max-width: 1320px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        /* Eyebrow */
        .na-eyebrow {
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
        .na-eyebrow-dot {
          width: 5px; height: 5px;
          background: ${C.red};
          border-radius: 50%;
        }

        /* Title */
        .na-hero-title {
          font-family: 'Barlow', sans-serif;
          font-size: clamp(2rem, 5vw, 3.2rem);
          font-weight: 700;
          letter-spacing: -0.01em;
          color: ${C.charcoal};
          line-height: 1.05;
          margin: 0 0 0.5rem;
        }
        .na-hero-title span {
          color: ${C.gray};
          font-weight: 400;
        }

        .na-title-accent {
          display: flex;
          align-items: center;
          gap: 6px;
          margin: 0.85rem 0;
        }
        .na-bar      { width: 40px; height: 3px; background: ${C.red}; border-radius: 2px; flex-shrink: 0; }
        .na-bar-thin { width: 20px; height: 3px; background: ${C.border}; border-radius: 2px; flex-shrink: 0; }

        .na-hero-sub {
          font-family: 'Barlow', sans-serif;
          font-size: 0.9rem;
          font-weight: 400;
          color: ${C.gray};
          letter-spacing: 0.02em;
          margin: 0;
        }

        /* ── Toolbar ── */
        .na-toolbar {
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

        /* Sort dropdown */
        .na-sort-wrap { position: relative; }
        .na-sort-btn {
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
        .na-sort-btn:hover, .na-sort-btn.open { border-color: ${C.red}; color: ${C.red}; }
        .na-sort-btn svg { transition: transform 0.2s; }
        .na-sort-btn.open svg { transform: rotate(180deg); }

        .na-sort-menu {
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
          to   { opacity: 1; transform: translateY(0); }
        }
        .na-sort-item {
          display: block; width: 100%; text-align: left;
          padding: 9px 14px; border: none; background: none;
          font-family: 'Barlow', sans-serif; font-size: 0.875rem;
          color: ${C.charcoal}; cursor: pointer;
          transition: background 0.14s, padding-left 0.14s;
          border-bottom: 1px solid ${C.border};
        }
        .na-sort-item:last-child { border-bottom: none; }
        .na-sort-item:hover { background: ${C.redLight}; color: ${C.red}; padding-left: 18px; }
        .na-sort-item.active { color: ${C.red}; font-weight: 600; background: ${C.redLight}; }

        /* ── Grid ── */
        .na-grid-wrap {
          max-width: 1320px;
          margin: 0 auto;
          padding: 2rem 2rem 4rem;
        }
        .na-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        /* ── Product Card - Standard Shopify Size ── */
        .na-card {
          background: ${C.white};
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          position: relative;
          border: 1px solid ${C.border};
          display: flex;
          flex-direction: column;
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
          max-width: 100%;
        }
        .na-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 14px 36px rgba(204,27,27,0.13);
          border-color: transparent;
        }
        /* Red sweep */
        .na-card::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0;
          width: 0; height: 3px;
          background: ${C.gradient};
          transition: width 0.32s ease;
          z-index: 5;
          border-radius: 0 0 2px 2px;
        }
        .na-card:hover::after { width: 100%; }

        /* Image — 1:1 Square (Shopify standard) */
        .na-img-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          overflow: hidden;
          background: ${C.lightGray};
          flex-shrink: 0;
        }
        .na-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          transition: transform 0.45s ease;
        }
        .na-card:hover .na-img { transform: scale(1.06); }
        .na-card.sold-out .na-img { filter: grayscale(0.2); }

        /* Badges */
        .na-badge {
          position: absolute;
          top: 12px;
          font-family: 'Barlow', sans-serif;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 4px 12px;
          border-radius: 4px;
          z-index: 3;
          line-height: 1.4;
        }
        .na-badge-new      { right: 12px; background: ${C.charcoal}; color: white; }
        .na-badge-discount { left: 12px;  background: ${C.gradient}; color: white; }
        .na-badge-sold     { left: 12px;  background: rgba(100,100,100,0.9); color: white; }

        /* Hover actions */
        .na-actions {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          display: flex;
          z-index: 4;
          transform: translateY(100%);
          transition: transform 0.24s ease;
        }
        .na-card:hover .na-actions { transform: translateY(0); }

        .na-btn-cart {
          flex: 1;
          background: ${C.charcoal};
          color: white;
          font-family: 'Barlow', sans-serif;
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 0.85rem 0;
          border: none;
          cursor: pointer;
          transition: background 0.18s;
        }
        .na-btn-cart:hover    { background: ${C.red}; }
        .na-btn-cart:disabled { background: #aaa; cursor: not-allowed; }

        .na-btn-view {
          background: rgba(30,30,30,0.88);
          color: white;
          border: none;
          border-left: 1px solid rgba(255,255,255,0.1);
          width: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.18s;
          flex-shrink: 0;
          padding: 0;
        }
        .na-btn-view:hover { background: ${C.red}; }

        /* Card body */
        .na-body {
          padding: 1rem;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .na-cat {
          font-family: 'Barlow', sans-serif;
          font-size: 0.7rem;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: ${C.gray};
          margin-bottom: 0.3rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .na-name {
          font-family: 'Barlow', sans-serif;
          font-size: 0.95rem;
          font-weight: 600;
          letter-spacing: 0.01em;
          color: ${C.charcoal};
          line-height: 1.35;
          margin: 0 0 0.5rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          min-height: calc(0.95rem * 1.35 * 2);
        }
        .na-pricing {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          flex-wrap: wrap;
        }
        .na-price {
          font-family: 'Barlow', sans-serif;
          font-size: 1.1rem;
          font-weight: 700;
          color: ${C.red};
        }
        .na-price-orig {
          font-family: 'Barlow', sans-serif;
          font-size: 0.8rem;
          color: ${C.gray};
          text-decoration: line-through;
        }
        .na-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 20px;
          margin-top: auto;
        }
        .na-rating {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .na-stars { display: flex; gap: 2px; }
        .na-rating-txt {
          font-family: 'Barlow', sans-serif;
          font-size: 0.75rem;
          color: ${C.gray};
        }
        .na-stock {
          font-family: 'Barlow', sans-serif;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .na-stock.low { color: #b87a00; }
        .na-stock.out { color: ${C.red}; }

        /* Mobile add button */
        .na-mobile-add {
          display: none;
          width: 100%;
          background: ${C.gradient};
          color: white;
          font-family: 'Barlow', sans-serif;
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          border: none;
          padding: 0.8rem 0;
          cursor: pointer;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background 0.18s;
          margin-top: 0.75rem;
          border-radius: 8px;
        }
        .na-mobile-add:disabled { background: #ccc; cursor: not-allowed; }

        /* Empty state */
        .na-empty {
          text-align: center;
          padding: 5rem 2rem;
        }
        .na-empty-ico {
          width: 80px; height: 80px;
          background: ${C.redLight};
          border: 1px solid ${C.border};
          border-left: 3px solid ${C.red};
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 1.25rem;
        }
        .na-empty h3 {
          font-family: 'Barlow', sans-serif;
          font-size: 1.2rem; font-weight: 700;
          letter-spacing: 0.03em;
          color: ${C.charcoal}; margin: 0 0 0.5rem;
        }
        .na-empty p {
          font-family: 'Barlow', sans-serif;
          font-size: 0.9rem; color: ${C.gray}; margin: 0;
        }

        /* ── Responsive ── */
        @media (max-width: 1200px) {
          .na-grid {
            grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
            gap: 1.25rem;
          }
        }
        @media (max-width: 768px) {
          .na-hero       { padding: 2rem 1.25rem 1.75rem; }
          .na-hero-title { font-size: clamp(1.7rem, 8vw, 2.4rem); }
          .na-toolbar    { padding: 1rem 1.25rem; justify-content: center; }
          .na-grid-wrap  { padding: 1.5rem 1.25rem 3rem; }
          .na-grid       { 
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            gap: 0.875rem;
          }
          .na-mobile-add { display: flex !important; }
          .na-actions    { display: none !important; }
          .na-body       { padding: 0.75rem; }
          .na-name       { font-size: 0.85rem; min-height: calc(0.85rem * 1.35 * 2); }
          .na-price      { font-size: 0.95rem; }
          .na-cat        { font-size: 0.65rem; }
          .na-badge      { font-size: 0.6rem; padding: 3px 8px; top: 8px; }
          .na-btn-cart    { font-size: 0.7rem; padding: 0.6rem 0; }
          .na-btn-view    { width: 44px; }
        }
        @media (max-width: 480px) {
          .na-grid {
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            gap: 0.75rem;
          }
          .na-name { font-size: 0.75rem; }
          .na-price { font-size: 0.85rem; }
          .na-cat { font-size: 0.6rem; }
          .na-body { padding: 0.6rem; }
        }
      `}</style>

      <div className="na-page">

        {/* ── Hero — clean white background ── */}
        <div className="na-hero">
          <div className="na-hero-inner">
            <div className="na-eyebrow">
              <span className="na-eyebrow-dot" />
              Latest Additions
            </div>
            <h1 className="na-hero-title">
              New <span>Arrivals</span>
            </h1>
            <div className="na-title-accent">
              <div className="na-bar" />
              <div className="na-bar-thin" />
            </div>
            <p className="na-hero-sub">Discover our freshest products — added in the last 30 days</p>
          </div>
        </div>

        {/* ── Toolbar ── */}
        <div className="na-toolbar">
          <div className="na-sort-wrap">
            <button
              className={`na-sort-btn${sortOpen ? ' open' : ''}`}
              onClick={() => setSortOpen(v => !v)}
              onBlur={() => setTimeout(() => setSortOpen(false), 150)}
            >
              <FiSliders size={13} />
              {currentSortLabel}
              <FiChevronDown size={12} />
            </button>
            {sortOpen && (
              <div className="na-sort-menu">
                {SORT_OPTIONS.map(o => (
                  <button key={o.value}
                    className={`na-sort-item${sortOption === o.value ? ' active' : ''}`}
                    onClick={() => { setSortOption(o.value); setSortOpen(false); }}>
                    {o.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Content ── */}
        <div className="na-grid-wrap">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '5rem 0',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <Spinner animation="border"
                style={{ color: C.red, width: '2.5rem', height: '2.5rem', borderWidth: '3px' }} />
              <p style={{ fontFamily: 'Barlow, sans-serif', color: C.gray,
                letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.72rem', margin: 0 }}>
                Loading Collection…
              </p>
            </div>
          ) : error ? (
            <Alert variant="danger" style={{ borderLeft: `4px solid ${C.red}`, borderRadius: '6px' }}>
              {error}
            </Alert>
          ) : filteredProducts.length === 0 ? (
            <div className="na-empty">
              <div className="na-empty-ico">
                <FaBoxOpen size={28} color={C.red} />
              </div>
              <h3>No New Arrivals</h3>
              <p>Check back soon — new products are added regularly.</p>
            </div>
          ) : (
            <div className="na-grid">
              {filteredProducts.map(product => {
                const discountPct = product.discountedPrice < product.originalPrice
                  ? Math.round(((product.originalPrice - product.discountedPrice) / product.originalPrice) * 100)
                  : null;
                const rating   = product.rating ? parseFloat(product.rating) : null;
                const stockQty = product.stock ?? 0;

                let stockLabel = null, stockClass = '';
                if (stockQty <= 0)      { stockLabel = 'Out of Stock'; stockClass = 'out'; }
                else if (stockQty <= 5) { stockLabel = `Only ${stockQty} left`; stockClass = 'low'; }

                const catName = typeof product.category === 'object'
                  ? product.category?.name
                  : product.category;

                return (
                  <div
                    key={product._id}
                    className={`na-card${stockQty <= 0 ? ' sold-out' : ''}`}
                    onClick={() => navigate(`/catalog/${product._id}`)}
                  >
                    {/* Image */}
                    <div className="na-img-wrap">
                      <img
                        className="na-img"
                        src={getImage(product)}
                        alt={product.name}
                        loading="lazy"
                        onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                      />

                      {/* NEW badge */}
                      <span className="na-badge na-badge-new">New</span>

                      {/* Discount badge */}
                      {discountPct && (
                        <span className="na-badge na-badge-discount">−{discountPct}%</span>
                      )}

                      {/* Sold out */}
                      {stockQty <= 0 && (
                        <span className="na-badge na-badge-sold"
                          style={{ left: discountPct ? 'auto' : '12px', right: discountPct ? '12px' : 'auto' }}>
                          Sold Out
                        </span>
                      )}

                      {/* Desktop hover actions */}
                      <div className="na-actions">
                        <button
                          className="na-btn-cart"
                          disabled={stockQty <= 0}
                          onClick={(e) => handleAdd(e, product)}
                        >
                          <FaShoppingCart size={13} />
                          {stockQty > 0 ? 'Add to Cart' : 'Unavailable'}
                        </button>
                        <button
                          className="na-btn-view"
                          onClick={(e) => { e.stopPropagation(); navigate(`/catalog/${product._id}`); }}
                          title="View product"
                        >
                          <FiEye size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="na-body">
                      {catName && <span className="na-cat">{catName}</span>}

                      <p className="na-name">{product.name}</p>

                      <div className="na-pricing">
                        <span className="na-price">
                          Rs.&nbsp;{(product.discountedPrice || product.originalPrice)?.toLocaleString()}
                        </span>
                        {product.discountedPrice < product.originalPrice && (
                          <span className="na-price-orig">
                            Rs.&nbsp;{product.originalPrice?.toLocaleString()}
                          </span>
                        )}
                      </div>

                      <div className="na-footer">
                        {rating > 0 ? (
                          <div className="na-rating">
                            <div className="na-stars">
                              {[1,2,3,4,5].map(s => (
                                <FaStar key={s} size={11}
                                  style={{ color: s <= Math.round(rating) ? C.red : C.border }} />
                              ))}
                            </div>
                            <span className="na-rating-txt">{parseFloat(rating).toFixed(1)}</span>
                          </div>
                        ) : <span />}

                        {stockLabel && (
                          <span className={`na-stock ${stockClass}`}>{stockLabel}</span>
                        )}
                      </div>

                      {/* Mobile add button */}
                      <button
                        className="na-mobile-add"
                        disabled={stockQty <= 0}
                        onClick={(e) => handleAdd(e, product)}
                      >
                        {stockQty > 0
                          ? <><FaShoppingCart size={12} /> Add to Cart</>
                          : <><FaBoxOpen size={12} /> Out of Stock</>}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}