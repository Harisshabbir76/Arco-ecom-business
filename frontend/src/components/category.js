import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Spinner, Alert } from 'react-bootstrap';

/* ── ARCO Brand Colors — matched to logo ── */
const C = {
  red:      '#CC1B1B',
  redDark:  '#A01212',
  redLight: '#fdf2f2',
  black:    '#111111',
  charcoal: '#1e1e1e',
  white:    '#ffffff',
  border:   '#e8e8e8',
  lightGray:'#f7f7f7',
  muted:    '#888',
  gradient: 'linear-gradient(135deg, #CC1B1B 0%, #A01212 100%)',
};

export default function Categories() {
  const [categories, setCategories]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [visibleCount, setVisibleCount] = useState(4);
  const navigate    = useNavigate();
  const trackRef    = useRef(null);
  const containerRef = useRef(null);

  /* ── Responsive visible count ── */
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 640) setVisibleCount(2);
      else if (w < 900) setVisibleCount(3);
      else setVisibleCount(4);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  /* ── Fetch categories ── */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/categories`);
        let cats = [];
        if (Array.isArray(res.data)) cats = res.data;
        else if (Array.isArray(res.data?.categories)) cats = res.data.categories;
        else if (Array.isArray(res.data?.data)) cats = res.data.data;
        else if (Array.isArray(res.data?.items)) cats = res.data.items;
        else throw new Error('Invalid data format');
        setCategories(cats);
      } catch (err) {
        setError(err.message || 'Failed to load categories');
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  /* ── Reset index on resize ── */
  useEffect(() => {
    setCurrentIndex(0);
  }, [visibleCount]);

  const getCategoryImageUrl = (category) => {
    if (!category.image) return null;
    if (category.image.startsWith('http')) return category.image;
    return `${process.env.REACT_APP_API_URL}${category.image.startsWith('/') ? '' : '/'}${category.image}`;
  };

  const getCategorySlug = (name) =>
    name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const maxIndex = Math.max(0, categories.length - visibleCount);

  const slide = (dir) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex(prev => {
      if (dir === 'next') return Math.min(prev + 1, maxIndex);
      return Math.max(prev - 1, 0);
    });
    setTimeout(() => setIsAnimating(false), 400);
  };

  const goTo = (i) => {
    if (isAnimating || i === currentIndex) return;
    setIsAnimating(true);
    setCurrentIndex(i);
    setTimeout(() => setIsAnimating(false), 400);
  };

  const canPrev = currentIndex > 0;
  const canNext = currentIndex < maxIndex;

  const itemWidthPercent = 100 / visibleCount;
  const translateX = currentIndex * itemWidthPercent;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Barlow:wght@300;400;500;600&display=swap');

        /* ── Section ── */
        .cat-section {
          background: ${C.white};
          padding: 56px 0 64px;
          overflow: hidden;
          position: relative;
        }

        /* ── Header - Centered (matching HomeFeaturedCategories) ── */
        .cat-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .cat-accent-bar {
          width: 50px;
          height: 3px;
          background: ${C.gradient};
          border-radius: 2px;
          margin: 0 auto 1rem auto;
        }

        .cat-title {
          font-family: 'Barlow', sans-serif;
          font-size: clamp(1.2rem, 3.5vw, 1.7rem);
          font-weight: 700;
          color: ${C.charcoal};
          letter-spacing: -0.01em;
          line-height: 1.2;
          margin: 0;
        }
        .cat-title span {
          color: ${C.red};
        }

        .cat-subtitle {
          color: ${C.muted};
          font-size: 0.9rem;
          margin: 0.5rem auto 0;
          max-width: 500px;
          font-family: 'Barlow', sans-serif;
        }

        /* ── Carousel Container ── */
        .cat-carousel-container {
          position: relative;
          display: flex;
          align-items: center;
        }

        /* ── Arrow buttons (overlay on images) ── */
        .cat-arrow-overlay {
          position: absolute;
          top: 45%;
          transform: translateY(-50%);
          width: 36px;
          height: 36px;
          border: 1.5px solid ${C.border};
          background: ${C.white};
          color: ${C.charcoal};
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.2s ease;
          font-size: 1rem;
          z-index: 10;
          box-shadow: 0 2px 8px rgba(0,0,0,0.10);
        }
        .cat-arrow-overlay:hover:not(:disabled) {
          background: ${C.red};
          color: ${C.white};
          border-color: ${C.red};
          box-shadow: 0 4px 14px rgba(204,27,27,0.28);
          transform: translateY(-50%) scale(1.06);
        }
        .cat-arrow-overlay:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        .arrow-prev { 
          left: 0.5rem; 
        }
        .arrow-next { 
          right: 0.5rem; 
        }

        @media (min-width: 640px) {
          .cat-arrow-overlay { width: 40px; height: 40px; font-size: 1.1rem; }
          .arrow-prev { left: 1rem; }
          .arrow-next { right: 1rem; }
        }

        /* ── Viewport & track ── */
        .cat-viewport {
          overflow: hidden;
          padding: 4px 0.5rem 8px;
          flex: 1;
        }
        @media (min-width: 640px) {
          .cat-viewport { padding: 4px 2rem 8px; }
        }
        .cat-track {
          display: flex;
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* ── Card - Standard size matching product cards ── */
        .cat-card {
          flex-shrink: 0;
          padding: 0 6px;
          cursor: pointer;
          box-sizing: border-box;
        }
        @media (min-width: 640px) {
          .cat-card { padding: 0 10px; }
        }

        .cat-card-inner {
          position: relative;
          overflow: hidden;
          border-radius: 10px;
          background: ${C.lightGray};
          width: 100%;
          height: 230px;
          border: 1px solid ${C.border};
          transition: box-shadow 0.25s ease, transform 0.25s ease;
        }
        .cat-card:hover .cat-card-inner {
          box-shadow: 0 12px 28px rgba(204,27,27,0.14);
          transform: translateY(-4px);
        }

        .cat-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.45s ease;
        }
        .cat-card:hover .cat-card-img {
          transform: scale(1.06);
        }

        /* ── Red overlay on hover ── */
        .cat-card-overlay {
          position: absolute;
          inset: 0;
          background: rgba(204, 27, 27, 0);
          transition: background 0.3s ease;
        }
        .cat-card:hover .cat-card-overlay {
          background: rgba(204, 27, 27, 0.10);
        }

        /* ── Bottom red bar ── */
        .cat-card-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: ${C.gradient};
          transform: scaleX(0);
          transition: transform 0.3s ease;
          transform-origin: left;
          border-radius: 0 0 2px 2px;
        }
        .cat-card:hover .cat-card-bar {
          transform: scaleX(1);
        }

        /* ── No-image fallback ── */
        .cat-card-fallback {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: ${C.lightGray};
          font-size: 2.5rem;
        }

        /* ── Name label ── */
        .cat-card-name {
          font-family: 'Barlow', sans-serif;
          font-size: 0.92rem;
          font-weight: 600;
          color: ${C.charcoal};
          text-align: center;
          margin-top: 12px;
          letter-spacing: 0.01em;
          transition: color 0.2s;
          line-height: 1.3;
        }
        @media (min-width: 640px) {
          .cat-card-name { font-size: 0.92rem; margin-top: 12px; }
        }
        .cat-card:hover .cat-card-name {
          color: ${C.red};
        }

        /* ── Progress dots ── */
        .cat-progress {
          display: flex;
          gap: 6px;
          align-items: center;
          justify-content: center;
          margin-top: 24px;
          padding: 0 1rem;
        }
        .cat-progress-dot {
          height: 3px;
          border-radius: 2px;
          background: ${C.border};
          transition: all 0.3s ease;
          cursor: pointer;
          flex: 1;
          max-width: 28px;
          border: none;
          padding: 0;
        }
        .cat-progress-dot.active {
          background: ${C.red};
          max-width: 48px;
        }
        @media (min-width: 640px) {
          .cat-progress-dot { max-width: 32px; }
          .cat-progress-dot.active { max-width: 56px; }
        }

        /* ── Mobile adjustments ── */
        @media (max-width: 768px) {
          .cat-card-inner { height: 180px; }
          .cat-card-name { font-size: 0.82rem; margin-top: 8px; }
        }
      `}</style>

      <div className="cat-section">

        {/* ── Centered Header (matching HomeFeaturedCategories) ── */}
        <div className="cat-header">
          <div className="cat-accent-bar" />
          <h2 className="cat-title">
            Our <span>Categories</span>
          </h2>
          <p className="cat-subtitle">
            Explore our collection of premium categories
          </p>
        </div>

        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <Spinner animation="border" style={{ color: C.red }} />
            <p style={{ marginTop: '1rem', color: C.muted, fontFamily: 'Barlow, sans-serif', fontSize: '0.9rem' }}>
              Loading categories…
            </p>
          </div>
        ) : error ? (
          <div style={{ padding: '0 1rem' }}>
            <Alert variant="danger">Error loading categories: {error}</Alert>
          </div>
        ) : categories.length === 0 ? (
          <div style={{ padding: '0 1rem' }}>
            <Alert variant="info">No categories found.</Alert>
          </div>
        ) : (
          <div className="cat-carousel-container" ref={containerRef}>

            {/* Left arrow - only show if there are items to scroll */}
            {visibleCount < categories.length && canPrev && (
              <button
                className="cat-arrow-overlay arrow-prev"
                onClick={() => slide('prev')}
                disabled={!canPrev}
                aria-label="Previous"
              >
                &#8592;
              </button>
            )}

            {/* Track */}
            <div className="cat-viewport">
              <div
                ref={trackRef}
                className="cat-track"
                style={{ transform: `translateX(-${translateX}%)` }}
              >
                {categories.map((category) => {
                  const imgUrl = getCategoryImageUrl(category);
                  return (
                    <div
                      key={category._id || category.name}
                      className="cat-card"
                      style={{ width: `${itemWidthPercent}%` }}
                      onClick={() => navigate(`/category/${getCategorySlug(category.name)}`)}
                    >
                      <div className="cat-card-inner">
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt={category.name}
                            className="cat-card-img"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              const fallback = e.target.parentElement?.querySelector('.cat-card-fallback');
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div
                          className="cat-card-fallback"
                          style={{ display: imgUrl ? 'none' : 'flex' }}
                        >
                          📦
                        </div>
                        <div className="cat-card-overlay" />
                        <div className="cat-card-bar" />
                      </div>
                      <div className="cat-card-name">{category.name}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right arrow - only show if there are items to scroll */}
            {visibleCount < categories.length && canNext && (
              <button
                className="cat-arrow-overlay arrow-next"
                onClick={() => slide('next')}
                disabled={!canNext}
                aria-label="Next"
              >
                &#8594;
              </button>
            )}

            {/* Progress dots */}
            {maxIndex > 0 && (
              <div className="cat-progress">
                {Array.from({ length: Math.min(maxIndex + 1, 8) }).map((_, i) => (
                  <button
                    key={i}
                    className={`cat-progress-dot${i === currentIndex ? ' active' : ''}`}
                    onClick={() => goTo(i)}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            )}

          </div>
        )}
      </div>
    </>
  );
}