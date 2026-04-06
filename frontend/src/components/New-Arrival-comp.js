import React, { useEffect, useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaShoppingCart, FaBoxOpen, FaStar, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { CartContext } from '../components/CartContext';

const C = {
  red: '#CC1B1B',
  redDark: '#A01212',
  redLight: '#fdf2f2',
  border: '#e8e8e8',
  muted: '#888',
  lightGray: '#f7f7f7',
  charcoal: '#1e1e1e',
  white: '#ffffff',
  gradient: 'linear-gradient(135deg, #CC1B1B 0%, #A01212 100%)',
};

const NewArrivalsSlider = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const trackRef = useRef(null);
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  // Responsive: how many cards visible at once
  const [visibleCount, setVisibleCount] = useState(4);

  useEffect(() => {
    const updateVisible = () => {
      const w = window.innerWidth;
      if (w < 480) setVisibleCount(2);       // mobile: always show 2
      else if (w < 768) setVisibleCount(2);  // small tablet: 2
      else if (w < 1024) setVisibleCount(3);
      else setVisibleCount(4);
    };
    updateVisible();
    window.addEventListener('resize', updateVisible);
    return () => window.removeEventListener('resize', updateVisible);
  }, []);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/new-arrival`);
        const data = Array.isArray(response.data) ? response.data : [];
        const limited = data.slice(0, 8).map(product => ({
          ...product,
          stock: product.stock !== undefined ? product.stock : 10,
          rating: product.rating || (Math.random() * 1 + 4).toFixed(1),
        }));
        setProducts(limited);
      } catch (err) {
        setError('Failed to load new arrivals');
      } finally {
        setLoading(false);
      }
    };
    fetchNewArrivals();
  }, []);

  const maxIndex = Math.max(0, products.length - visibleCount);

  const goTo = (index) => {
    if (isAnimating) return;
    const clamped = Math.max(0, Math.min(index, maxIndex));
    setIsAnimating(true);
    setCurrentIndex(clamped);
    setTimeout(() => setIsAnimating(false), 350);
  };

  const prev = () => goTo(currentIndex - 1);
  const next = () => goTo(currentIndex + 1);

  // Touch / mouse drag
  const onDragStart = (clientX) => {
    setIsDragging(true);
    setDragStartX(clientX);
    setDragOffset(0);
  };
  const onDragMove = (clientX) => {
    if (!isDragging) return;
    setDragOffset(clientX - dragStartX);
  };
  const onDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const threshold = 60;
    if (dragOffset < -threshold) next();
    else if (dragOffset > threshold) prev();
    setDragOffset(0);
  };

  const getProductImage = (product) => {
    if (!product?.image?.[0]) return '/placeholder.jpg';
    if (product.image[0].startsWith('http')) return product.image[0];
    return `${process.env.REACT_APP_API_URL}${product.image[0]}`;
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    if (product.stock > 0) addToCart({ ...product, quantity: 1 });
  };

  const cardWidthPct = 100 / visibleCount;
  const trackWidthPct = (products.length / visibleCount) * 100;
  const translatePct = isDragging
    ? (currentIndex * cardWidthPct) - (dragOffset / (trackRef.current?.offsetWidth || 1)) * 100
    : currentIndex * cardWidthPct;

  if (loading) {
    return (
      <section style={styles.section}>
        <div style={styles.header}>
          <h2 style={styles.title}>New Arrivals</h2>
        </div>
        <div style={{ display: 'flex', gap: '1rem', padding: '0 1.5rem' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ flex: `0 0 ${100 / visibleCount}%`, borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ ...styles.skeleton, height: '230px' }} />
              <div style={{ padding: '0.6rem' }}>
                <div style={{ ...styles.skeleton, height: 14, marginBottom: 6, borderRadius: 4 }} />
                <div style={{ ...styles.skeleton, height: 14, width: '60%', borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error || products.length === 0) return null;

  return (
    <section style={styles.section}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;500;600;700&display=swap');

        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .na-card:hover .na-quick-add { opacity: 1 !important; transform: translateY(0) !important; }
        .na-card:hover .na-img { transform: scale(1.06); }
        .na-card:hover { box-shadow: 0 12px 28px rgba(204,27,27,0.13) !important; transform: translateY(-3px); }
        .na-nav-btn:hover { background: ${C.red} !important; color: white !important; border-color: ${C.red} !important; }
        .na-dot.active { background: ${C.red} !important; width: 20px !important; }

        /* ── Mobile card sizing ── */
        @media (max-width: 768px) {
          .na-image-wrap { height: 160px !important; }
          .na-body { padding: 0.55rem 0.65rem 0.7rem !important; }
          .na-product-name { font-size: 0.78rem !important; min-height: 2.1rem !important; }
          .na-price-current { font-size: 0.88rem !important; }
          .na-price-original { font-size: 0.7rem !important; }
          .na-category { font-size: 0.62rem !important; }
          .na-badge { font-size: 0.58rem !important; padding: 2px 6px !important; top: 6px !important; }
          .na-quick-add { display: none !important; }
          .na-add-btn { font-size: 0.72rem !important; padding: 0.42rem 0.3rem !important; gap: 5px !important; }
          .na-rating-pill { bottom: 6px !important; left: 6px !important; padding: 2px 6px !important; }
          .na-rating-pill span { font-size: 0.62rem !important; }
          .na-pricing { margin-bottom: 0.5rem !important; }
          .na-nav-btn { width: 32px !important; height: 32px !important; }
        }

        @media (max-width: 480px) {
          .na-image-wrap { height: 150px !important; }
          .na-body { padding: 0.5rem 0.55rem 0.6rem !important; }
          .na-product-name { font-size: 0.74rem !important; min-height: 2rem !important; }
          .na-price-current { font-size: 0.82rem !important; }
          .na-category { font-size: 0.58rem !important; }
          .na-add-btn { font-size: 0.68rem !important; padding: 0.38rem 0.25rem !important; }
        }
      `}</style>

      {/* ── Centered Header ── */}
      <div style={styles.header}>
        <div style={styles.accentBar} />
        <h2 style={styles.title}>
          New <span style={{ color: C.red }}>Arrivals</span>
        </h2>
        <p style={styles.subtitle}>
          Fresh styles just landed — be the first to shop
        </p>
      </div>

      {/* ── Slider Container with Overlay Buttons ── */}
      <div style={styles.sliderContainer}>
        {/* Left Navigation Button */}
        {currentIndex > 0 && (
          <button
            className="na-nav-btn"
            onClick={prev}
            style={styles.navBtnLeft}
            aria-label="Previous"
          >
            <FaChevronLeft size={18} />
          </button>
        )}

        {/* Track */}
        <div
          style={styles.viewport}
          onMouseDown={(e) => onDragStart(e.clientX)}
          onMouseMove={(e) => onDragMove(e.clientX)}
          onMouseUp={onDragEnd}
          onMouseLeave={onDragEnd}
          onTouchStart={(e) => onDragStart(e.touches[0].clientX)}
          onTouchMove={(e) => onDragMove(e.touches[0].clientX)}
          onTouchEnd={onDragEnd}
        >
          <div
            ref={trackRef}
            style={{
              display: 'flex',
              width: `${trackWidthPct}%`,
              transform: `translateX(-${translatePct}%)`,
              transition: isDragging ? 'none' : 'transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              willChange: 'transform',
              userSelect: 'none',
            }}
          >
            {products.map((product) => (
              <div
                key={product._id}
                style={{
                  width: `${100 / products.length}%`,
                  flexShrink: 0,
                  padding: '0 6px',
                  boxSizing: 'border-box',
                }}
              >
                <div
                  className="na-card"
                  onClick={() => navigate(`/catalog/${product._id}`)}
                  style={styles.card}
                >
                  {/* Image */}
                  <div className="na-image-wrap" style={styles.imageWrap}>
                    <img
                      className="na-img"
                      src={getProductImage(product)}
                      alt={product.name}
                      draggable={false}
                      style={styles.img}
                      onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                    />

                    {/* Discount badge */}
                    {product.discountedPrice < product.originalPrice && (
                      <span className="na-badge" style={styles.discountBadge}>
                        {Math.round(100 - (product.discountedPrice / product.originalPrice) * 100)}% OFF
                      </span>
                    )}

                    {/* NEW badge */}
                    {!product.discountedPrice && (
                      <span className="na-badge" style={styles.newBadge}>NEW</span>
                    )}

                    {/* Rating Pill */}
                    {product.rating > 0 && (
                      <div className="na-rating-pill" style={styles.ratingPill}>
                        <FaStar style={{ color: C.red, fontSize: '0.65rem' }} />
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          color: C.charcoal,
                        }}>
                          {Number(product.rating).toFixed(1)}
                        </span>
                      </div>
                    )}

                    {/* Quick Add */}
                    <button
                      className="na-quick-add"
                      onClick={(e) => handleAddToCart(e, product)}
                      disabled={product.stock <= 0}
                      style={{
                        ...styles.quickAdd,
                        background: product.stock > 0 ? C.white : '#e2e8f0',
                        color: product.stock > 0 ? C.red : C.muted,
                        cursor: product.stock > 0 ? 'pointer' : 'not-allowed',
                      }}
                    >
                      {product.stock > 0
                        ? <><FaShoppingCart size={11} style={{ marginRight: 5 }} />Quick Add</>
                        : <><FaBoxOpen size={11} style={{ marginRight: 5 }} />Out of Stock</>
                      }
                    </button>
                  </div>

                  {/* Body */}
                  <div className="na-body" style={styles.body}>
                    {product.category && (
                      <span className="na-category" style={styles.category}>
                        {typeof product.category === 'object' ? product.category.name : product.category}
                      </span>
                    )}
                    <p className="na-product-name" style={styles.productName}>{product.name}</p>
                    <div className="na-pricing" style={styles.pricing}>
                      {product.discountedPrice < product.originalPrice && (
                        <span className="na-price-original" style={styles.originalPrice}>
                          Rs. {product.originalPrice?.toLocaleString()}
                        </span>
                      )}
                      <span className="na-price-current" style={styles.currentPrice}>
                        Rs. {(product.discountedPrice || product.originalPrice)?.toLocaleString()}
                      </span>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      className="na-add-btn"
                      onClick={(e) => handleAddToCart(e, product)}
                      disabled={product.stock <= 0}
                      style={{
                        ...styles.addBtn,
                        background: product.stock > 0 ? C.gradient : '#e2e8f0',
                        color: product.stock > 0 ? C.white : C.muted,
                        cursor: product.stock > 0 ? 'pointer' : 'not-allowed',
                      }}
                    >
                      <FaShoppingCart size={13} />
                      {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Navigation Button */}
        {currentIndex < maxIndex && (
          <button
            className="na-nav-btn"
            onClick={next}
            style={styles.navBtnRight}
            aria-label="Next"
          >
            <FaChevronRight size={18} />
          </button>
        )}
      </div>

      {/* ── Dot indicators ── */}
      <div style={styles.dots}>
        {Array.from({ length: maxIndex + 1 }).map((_, i) => (
          <button
            key={i}
            className={`na-dot${i === currentIndex ? ' active' : ''}`}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            style={{
              ...styles.dot,
              background: i === currentIndex ? C.red : C.border,
              width: i === currentIndex ? 20 : 8,
            }}
          />
        ))}
      </div>
    </section>
  );
};

const styles = {
  section: {
    padding: '2rem 0',
    background: '#fff',
    overflow: 'hidden',
    position: 'relative',
  },
  header: {
    textAlign: 'center',
    marginBottom: '1.25rem',
    padding: '0 1.5rem',
  },
  accentBar: {
    width: 50,
    height: 3,
    background: 'linear-gradient(135deg, #CC1B1B 0%, #A01212 100%)',
    borderRadius: 2,
    margin: '0 auto 1rem auto',
  },
  title: {
    fontFamily: "'Barlow', sans-serif",
    fontSize: 'clamp(1.2rem, 3vw, 1.7rem)',
    fontWeight: 700,
    color: '#1e1e1e',
    margin: 0,
    letterSpacing: '-0.01em',
  },
  subtitle: {
    color: '#888',
    fontSize: '0.9rem',
    margin: '0.5rem auto 0',
    maxWidth: '500px',
    fontFamily: "'Barlow', sans-serif",
  },
  sliderContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  navBtnLeft: {
    position: 'absolute',
    left: 10,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: '#ffffff',
    border: '1px solid #e8e8e8',
    color: '#1e1e1e',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  navBtnRight: {
    position: 'absolute',
    right: 10,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: '#ffffff',
    border: '1px solid #e8e8e8',
    color: '#1e1e1e',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  viewport: {
    overflow: 'hidden',
    padding: '0.5rem 1rem 0.75rem',
    cursor: 'grab',
    flex: 1,
  },
  card: {
    background: '#ffffff',
    borderRadius: 10,
    overflow: 'hidden',
    border: '1px solid #e8e8e8',
    transition: 'all 0.25s ease',
    cursor: 'pointer',
    position: 'relative',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  imageWrap: {
    position: 'relative',
    width: '100%',
    height: '230px',
    overflow: 'hidden',
    background: '#f7f7f7',
    flexShrink: 0,
  },
  img: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.35s ease',
    display: 'block',
    pointerEvents: 'none',
  },
  discountBadge: {
    position: 'absolute',
    top: 9,
    left: 9,
    background: 'linear-gradient(135deg, #CC1B1B 0%, #A01212 100%)',
    color: '#fff',
    fontSize: '0.68rem',
    fontWeight: 700,
    padding: '3px 8px',
    borderRadius: 4,
    zIndex: 2,
    letterSpacing: '0.02em',
  },
  newBadge: {
    position: 'absolute',
    top: 9,
    left: 9,
    background: '#1e1e1e',
    color: '#fff',
    fontSize: '0.68rem',
    fontWeight: 700,
    padding: '3px 8px',
    borderRadius: 4,
    zIndex: 2,
    letterSpacing: '0.05em',
  },
  ratingPill: {
    position: 'absolute',
    bottom: 9,
    left: 9,
    background: '#ffffff',
    borderRadius: 30,
    padding: '3px 9px',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
    zIndex: 2,
  },
  quickAdd: {
    position: 'absolute',
    bottom: 10,
    left: '50%',
    transform: 'translateX(-50%) translateY(6px)',
    border: '1px solid #e8e8e8',
    padding: '5px 14px',
    borderRadius: 30,
    fontSize: '0.72rem',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    zIndex: 3,
    opacity: 0,
    transition: 'opacity 0.2s ease, transform 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  body: {
    padding: '0.85rem 1rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  category: {
    fontFamily: "'Barlow', sans-serif",
    fontSize: '0.75rem',
    fontWeight: 500,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: '#888',
    marginBottom: '0.2rem',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'block',
  },
  productName: {
    fontSize: '0.92rem',
    fontWeight: 600,
    color: '#1e1e1e',
    marginBottom: '0.2rem',
    lineHeight: 1.35,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    minHeight: '2.5rem',
    fontFamily: "'Barlow', sans-serif",
  },
  pricing: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: '0.75rem',
    flexWrap: 'wrap',
  },
  originalPrice: {
    fontSize: '0.75rem',
    color: '#888',
    textDecoration: 'line-through',
  },
  currentPrice: {
    fontSize: '1.05rem',
    fontWeight: 700,
    color: '#CC1B1B',
    fontFamily: "'Barlow', sans-serif",
  },
  addBtn: {
    width: '100%',
    border: 'none',
    padding: '0.55rem',
    borderRadius: 7,
    fontSize: '0.85rem',
    fontWeight: 600,
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginTop: 'auto',
    letterSpacing: '0.02em',
  },
  dots: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: '0.5rem',
  },
  dot: {
    height: 8,
    borderRadius: 4,
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    transition: 'all 0.25s ease',
  },
  skeleton: {
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
    backgroundSize: '400px 100%',
    animation: 'shimmer 1.4s infinite linear',
  },
};

export default NewArrivalsSlider;