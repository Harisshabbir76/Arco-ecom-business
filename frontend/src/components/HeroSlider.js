import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

/* ── ARCO Brand Colors ── */
const C = {
  red: '#CC1B1B',
  redDark: '#A01212',
  redDeep: '#7a0e0e',
  black: '#111111',
  charcoal: '#1e1e1e',
  offWhite: '#F5F2EE',
  white: '#FFFFFF',
  gold: '#C8A951',
  goldLight: '#e8c96b',
};

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState('next');

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth <= 768);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/hero-slides`);
        setSlides(res.data || []);
      } catch {
        setSlides([
          {
            desktopImage: 'https://via.placeholder.com/1920x900/111111/CC1B1B?text=ARCO',
            mobileImage: 'https://via.placeholder.com/390x600/111111/CC1B1B?text=ARCO',
          }
        ]);
      }
    };
    fetchSlides();
  }, []);

  const changeSlide = useCallback((newIndex, dir = 'next') => {
    if (animating || newIndex === currentSlide) return;
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => {
      setCurrentSlide(newIndex);
      setAnimating(false);
    }, 500);
  }, [animating, currentSlide]);

  const goToNext = useCallback(() => {
    if (!slides.length) return;
    changeSlide((currentSlide + 1) % slides.length, 'next');
  }, [slides.length, currentSlide, changeSlide]);

  const goToPrev = useCallback(() => {
    if (!slides.length) return;
    changeSlide(currentSlide === 0 ? slides.length - 1 : currentSlide - 1, 'prev');
  }, [slides.length, currentSlide, changeSlide]);

  useEffect(() => {
    if (!slides.length) return;
    const t = setInterval(goToNext, 6000);
    return () => clearInterval(t);
  }, [goToNext, slides.length]);

  const getImage = (slide) =>
    isMobile && slide.mobileImage ? slide.mobileImage : (slide.desktopImage || slide.image);

  if (!slides.length) return null;

  const slide = slides[currentSlide];

  /* ── Only show text elements that actually have a value ── */
  const hasTitle    = !!slide.title?.trim();
  const hasSubtitle = !!slide.subtitle?.trim();
  const hasTag      = !!slide.tag?.trim();
  const hasCta      = !!slide.ctaText?.trim();
  const hasContent  = hasTitle || hasSubtitle || hasTag || hasCta;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=Barlow:wght@300;400;500&display=swap');

        .arco-hero-wrapper {
         
          background: #f5f2ee;
        }

        .arco-hero {
          position: relative;
          width: 100%;
          height: ${isMobile ? '92vh' : '88vh'};
          min-height: ${isMobile ? '560px' : '580px'};
          max-height: 900px;
          overflow: hidden;
          background: ${C.black};
          font-family: 'Barlow', sans-serif;
        }

        .arco-bg {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          transition: opacity 0.5s ease, transform 0.7s ease;
          transform-origin: center;
        }
        .arco-bg.entering-next  { animation: slideInRight 0.55s ease forwards; }
        .arco-bg.entering-prev  { animation: slideInLeft 0.55s ease forwards; }
        .arco-bg.active-visible { opacity: 1; transform: scale(1.03); }

        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(4%) scale(1.04); }
          to   { opacity: 1; transform: translateX(0) scale(1.03); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-4%) scale(1.04); }
          to   { opacity: 1; transform: translateX(0) scale(1.03); }
        }

        .arco-overlay {
          position: absolute;
          inset: 0;
          background: ${isMobile
            ? 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.25) 100%)'
            : 'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.1) 75%, transparent 100%)'
          };
          z-index: 1;
        }

        .arco-stripe {
          position: absolute;
          top: 0;
          bottom: 0;
          left: ${isMobile ? '-10%' : '40%'};
          width: 3px;
          background: ${C.red};
          transform: skewX(-8deg);
          opacity: 0.6;
          z-index: 2;
          display: ${isMobile ? 'none' : 'block'};
        }

        

        .arco-content {
          position: absolute;
          z-index: 4;
          ${isMobile ? `
            bottom: 0;
            left: 0;
            right: 0;
            padding: 0 1.5rem 3rem;
            text-align: left;
          ` : `
            top: 50%;
            left: 8%;
            transform: translateY(-50%);
            max-width: 560px;
          `}
        }

        .arco-tag {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: ${C.red};
          color: white;
          font-family: 'Oswald', sans-serif;
          font-size: ${isMobile ? '0.65rem' : '0.7rem'};
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          padding: 5px 14px;
          border-radius: 2px;
          margin-bottom: ${isMobile ? '0.9rem' : '1.25rem'};
          animation: fadeSlideUp 0.6s ease 0.1s both;
        }
        .arco-tag::before {
          content: '';
          display: inline-block;
          width: 6px;
          height: 6px;
          background: ${C.goldLight};
          border-radius: 50%;
        }

        .arco-title {
          font-family: 'Oswald', sans-serif;
          font-size: ${isMobile ? 'clamp(2.4rem, 10vw, 3.5rem)' : 'clamp(3rem, 5vw, 4.8rem)'};
          font-weight: 700;
          color: ${C.white};
          line-height: 1.0;
          letter-spacing: 0.02em;
          text-transform: uppercase;
          margin: 0 0 ${isMobile ? '0.6rem' : '0.9rem'};
          animation: fadeSlideUp 0.6s ease 0.2s both;
        }
        .arco-title em {
          font-style: italic;
          font-family: 'Cormorant Garamond', serif;
          font-weight: 500;
          color: ${C.goldLight};
          font-size: 1.1em;
          text-transform: none;
          letter-spacing: 0.01em;
        }

        .arco-divider {
          width: ${isMobile ? '48px' : '60px'};
          height: 3px;
          background: linear-gradient(to right, ${C.red}, ${C.gold});
          margin: ${isMobile ? '0.75rem 0' : '1rem 0'};
          animation: fadeSlideUp 0.6s ease 0.3s both;
        }

        .arco-sub {
          font-family: 'Barlow', sans-serif;
          font-size: ${isMobile ? '0.85rem' : '1rem'};
          font-weight: 300;
          color: rgba(255,255,255,0.78);
          margin: 0 0 ${isMobile ? '1.5rem' : '2rem'};
          letter-spacing: 0.04em;
          line-height: 1.5;
          animation: fadeSlideUp 0.6s ease 0.35s both;
        }

        .arco-cta {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: ${C.red};
          color: white;
          font-family: 'Oswald', sans-serif;
          font-size: ${isMobile ? '0.85rem' : '0.9rem'};
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          text-decoration: none;
          padding: ${isMobile ? '12px 24px' : '14px 32px'};
          border-radius: 2px;
          transition: all 0.25s ease;
          animation: fadeSlideUp 0.6s ease 0.45s both;
          box-shadow: 0 4px 20px rgba(204,27,27,0.4);
          position: relative;
          overflow: hidden;
        }
        .arco-cta::before {
          content: '';
          position: absolute;
          inset: 0;
          background: ${C.redDark};
          transform: translateX(-101%);
          transition: transform 0.28s ease;
        }
        .arco-cta:hover::before { transform: translateX(0); }
        .arco-cta:hover {
          color: white;
          box-shadow: 0 6px 28px rgba(204,27,27,0.55);
          transform: translateY(-2px);
        }
        .arco-cta span, .arco-cta svg { position: relative; z-index: 1; }

        .arco-cta-ghost {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: rgba(255,255,255,0.7);
          font-family: 'Barlow', sans-serif;
          font-size: ${isMobile ? '0.8rem' : '0.85rem'};
          font-weight: 400;
          letter-spacing: 0.05em;
          text-decoration: none;
          padding: ${isMobile ? '12px 0' : '14px 0'};
          margin-left: ${isMobile ? '1.25rem' : '1.5rem'};
          border-bottom: 1px solid rgba(255,255,255,0.25);
          transition: all 0.22s ease;
          animation: fadeSlideUp 0.6s ease 0.5s both;
        }
        .arco-cta-ghost:hover {
          color: ${C.goldLight};
          border-color: ${C.goldLight};
        }

        .arco-counter {
          position: absolute;
          ${isMobile ? 'top: 1.2rem; right: 1.2rem;' : 'top: 2.5rem; right: 2.5rem;'}
          z-index: 5;
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: 'Oswald', sans-serif;
          font-size: ${isMobile ? '0.7rem' : '0.75rem'};
          font-weight: 500;
          letter-spacing: 0.1em;
          color: rgba(255,255,255,0.5);
        }
        .arco-counter-current {
          font-size: ${isMobile ? '1.4rem' : '1.8rem'};
          font-weight: 700;
          color: white;
          line-height: 1;
        }
        .arco-counter-bar {
          width: ${isMobile ? '28px' : '36px'};
          height: 1px;
          background: rgba(255,255,255,0.35);
        }

        .arco-arrows {
          position: absolute;
          ${isMobile
            ? 'bottom: 1.75rem; right: 1.5rem; flex-direction: row;'
            : 'bottom: 2.5rem; right: 2.5rem; flex-direction: column;'
          }
          display: flex;
          gap: 8px;
          z-index: 5;
        }
        .arco-arrow {
          width: ${isMobile ? '38px' : '46px'};
          height: ${isMobile ? '38px' : '46px'};
          border: 1px solid rgba(255,255,255,0.3);
          background: rgba(255,255,255,0.07);
          backdrop-filter: blur(6px);
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 2px;
          transition: all 0.22s ease;
          font-size: ${isMobile ? '1rem' : '1.1rem'};
        }
        .arco-arrow:hover {
          background: ${C.red};
          border-color: ${C.red};
          transform: scale(1.08);
        }

        .arco-dots {
          position: absolute;
          ${isMobile ? 'bottom: 1rem; left: 50%; transform: translateX(-50%);' : 'left: 8%; bottom: 2.5rem;'}
          display: flex;
          gap: 6px;
          z-index: 5;
          align-items: center;
        }
        .arco-dot {
          cursor: pointer;
          border: none;
          padding: 0;
          background: none;
          display: flex;
          align-items: center;
        }
        .arco-dot-inner {
          height: 3px;
          border-radius: 2px;
          transition: all 0.35s ease;
          background: rgba(255,255,255,0.35);
          width: 20px;
        }
        .arco-dot.active .arco-dot-inner {
          background: ${C.red};
          width: 40px;
        }

        .arco-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 3px;
          background: ${C.red};
          animation: progress 6s linear infinite;
          z-index: 6;
        }
        @keyframes progress {
          from { width: 0%; }
          to   { width: 100%; }
        }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="arco-hero-wrapper">
        <div className="arco-hero">

          {/* Background image */}
          <div
            key={currentSlide}
            className={`arco-bg ${animating ? `entering-${direction}` : 'active-visible'}`}
            style={{ backgroundImage: `url(${getImage(slide)})` }}
          />

          {/* Dark overlay + stripe — only when there's text to read */}
          {hasContent && <div className="arco-overlay" />}
          {hasContent && <div className="arco-stripe" />}

          

          {/* Content block — only renders when at least one field has a value */}
          {hasContent && (
            <div className="arco-content" key={`content-${currentSlide}`}>

              {hasTag && (
                <div className="arco-tag">{slide.tag}</div>
              )}

              {hasTitle && (
                <h1 className="arco-title">
                  {slide.title.split(' ').map((word, i, arr) =>
                    i === arr.length - 1
                      ? <em key={i}>{word}</em>
                      : <React.Fragment key={i}>{word} </React.Fragment>
                  )}
                </h1>
              )}

              {(hasTitle || hasSubtitle) && (
                <div className="arco-divider" />
              )}

              {hasSubtitle && (
                <p className="arco-sub">{slide.subtitle}</p>
              )}

              {hasCta && (
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.25rem' }}>
                  <a href={slide.ctaLink || '#'} className="arco-cta">
                    <span>{slide.ctaText}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12,5 19,12 12,19" />
                    </svg>
                  </a>
                  <a href="/catalog" className="arco-cta-ghost">
                    View All
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9,18 15,12 9,6" />
                    </svg>
                  </a>
                </div>
              )}

            </div>
          )}

          {/* Slide counter */}
          <div className="arco-counter">
            <span className="arco-counter-current">
              {String(currentSlide + 1).padStart(2, '0')}
            </span>
            <div className="arco-counter-bar" />
            <span>{String(slides.length).padStart(2, '0')}</span>
          </div>

          {/* Arrows */}
          <div className="arco-arrows">
            <button className="arco-arrow" onClick={goToPrev} aria-label="Previous">&#10094;</button>
            <button className="arco-arrow" onClick={goToNext} aria-label="Next">&#10095;</button>
          </div>

          {/* Dots */}
          <div className="arco-dots">
            {slides.map((_, i) => (
              <button
                key={i}
                className={`arco-dot${i === currentSlide ? ' active' : ''}`}
                onClick={() => changeSlide(i, i > currentSlide ? 'next' : 'prev')}
                aria-label={`Slide ${i + 1}`}
              >
                <div className="arco-dot-inner" />
              </button>
            ))}
          </div>

          {/* Progress bar */}
          <div key={`prog-${currentSlide}`} className="arco-progress" />

        </div>
      </div>
    </>
  );
};

export default HeroSlider;