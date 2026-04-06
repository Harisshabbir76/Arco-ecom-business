import React from 'react'
import Categories from '../components/category'
import HomeFeaturedCategories from '../components/HomeFeaturedCategories'
import FeaturedProducts from '../components/FeaturedProducts'
import TopRatedProducts from '../components/TopRatedProducts'
import LatestBundles from '../components/LatestBundles'
import NewArrivalCompnonent from '../components/New-Arrival-comp'
import FAQs from '../components/FAQs'
import { Link } from 'react-router-dom'
import { FiArrowRight } from 'react-icons/fi';
import HeroSlider from '../components/HeroSlider'
import { useEffect, useState } from 'react';


// Navbar color palette - light backgrounds
const logoColors = {
  primary: '#fe7e8b', // Navbar primary color
  secondary: '#e65c70', // Navbar secondary color
  light: '#ffd1d4', // Navbar light color
  dark: '#d64555', // Navbar dark color
  background: '#ffffff', // Pure white
  lighterBg: '#fff9fa', // Even lighter - subtle tint
  gradient: 'linear-gradient(135deg, #fe7e8b 0%, #e65c70 100%)', // Navbar gradient
  softGradient: 'linear-gradient(135deg, #fff5f6 0%, #ffd1d4 100%)', // Very soft gradient
};

export default function Home() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Hero section style with very light pink overlay
  const heroStyle = {
    position: 'relative',
    background: logoColors.background,
    padding: 0,
    margin: 0,
  };

  const welcomeSectionStyle = {
    textAlign: 'center',
    padding: '4rem 1rem',
    background: logoColors.background, // Match all other light sections
  };

  const welcomeTitleStyle = {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#2D3748', // Dark gray instead of dark pink for better contrast on light bg
    marginBottom: '1rem',
  };

  const welcomeTextStyle = {
    fontSize: '1.1rem',
    color: '#4A5568', // Medium gray
    maxWidth: '600px',
    margin: '0 auto 2rem auto',
    lineHeight: '1.6',
  };

  const ctaButtonStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 2rem',
    background: logoColors.gradient,
    color: 'white',
    border: 'none',
    borderRadius: '2rem',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    boxShadow: `0 4px 15px ${logoColors.primary}30`, // More subtle shadow
  };

  const sectionDividerStyle = {
    height: '1px',
    background: `linear-gradient(90deg, transparent, ${logoColors.primary}20, ${logoColors.primary}40, ${logoColors.primary}20, transparent)`,
    width: '100%',
    margin: '0 auto',
  };



  return (
    <div style={{ background: logoColors.background }}> {/* Consistent base background */}
      {/* Hero Section */}
      
      <div style={heroStyle}>
        <HeroSlider />
        
      </div>
      

      {/* Divider after Hero */}
      <div style={sectionDividerStyle}></div>

      {/* Welcome Section */}
<div style={{
  fontFamily: "'Barlow', sans-serif",
  background: '#ffffff',
  padding: '56px 24px 64px',
  textAlign: 'center',
  borderTop: '1px solid #e8e8e8',
  borderBottom: '1px solid #e8e8e8',
}}>

  {/* Eyebrow */}
  <div style={{
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    fontFamily: "'Oswald', sans-serif", fontSize: '0.7rem',
    fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase',
    color: '#CC1B1B', marginBottom: '16px',
  }}>
    <span style={{ display: 'inline-block', width: '28px', height: '1.5px', background: '#CC1B1B' }} />
    Est. 2018 &nbsp;·&nbsp; Kitchenware &amp; Utensils
    <span style={{ display: 'inline-block', width: '28px', height: '1.5px', background: '#CC1B1B' }} />
  </div>

  {/* Title */}
  <div style={{
    fontFamily: "'Oswald', sans-serif",
    fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700,
    color: '#111111', textTransform: 'uppercase',
    letterSpacing: '0.03em', lineHeight: 1.1, margin: '0 0 16px',
  }}>
    Cook with <span style={{ color: '#CC1B1B' }}>Elegance.</span><br />
    Live with Quality.
  </div>

  {/* Red divider */}
  <div style={{ width: '48px', height: '3px', background: '#CC1B1B', margin: '0 auto 20px' }} />

  {/* Body text */}
  <div style={{
    fontSize: '1rem', fontWeight: 300, color: '#555555',
    maxWidth: '560px', margin: '0 auto 32px',
    lineHeight: 1.7, letterSpacing: '0.02em',
  }}>
    ARCO brings you premium kitchenware and utensils crafted for every home.
    From everyday essentials to professional-grade cookware — built to last, designed to impress.
  </div>

  {/* CTA */}
  <Link
    to="/catalog"
    style={{
      display: 'inline-flex', alignItems: 'center', gap: '10px',
      background: '#CC1B1B', color: '#ffffff',
      fontFamily: "'Oswald', sans-serif", fontSize: '0.9rem',
      fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase',
      textDecoration: 'none', padding: '14px 36px', borderRadius: '2px',
    }}
  >
    Explore the Collection <FiArrowRight />
  </Link>


</div>

      {/* Divider after Welcome */}
      <div style={sectionDividerStyle}></div>
      

      {/* Categories Section */}
      <div style={{ background: logoColors.background }}>
        <Categories />
      </div>

      {/* Divider after Categories */}
      <div style={sectionDividerStyle}></div>

      {/* Featured Categories Products - Shows products from categories with showOnHome enabled */}
      <HomeFeaturedCategories />

      {/* Divider after Featured Categories */}
      <div style={sectionDividerStyle}></div>
      

      {/* Featured Products Section */}
      <FeaturedProducts />

      {/* Divider after Top Products */}
      <div style={sectionDividerStyle}></div>

      <NewArrivalCompnonent />

      {/* Divider after New Arrivals */}
      <div style={sectionDividerStyle}></div>

      

      {/* Top Rated Products - Shows highest rated products */}
      <TopRatedProducts />

      {/* Divider after Top Products */}
      <div style={sectionDividerStyle}></div>

      {/* Latest Bundles - Shows latest bundles */}
      <LatestBundles />

      {/* Divider after Bundles */}
      <div style={sectionDividerStyle}></div>

      {/* FAQs Section */}
      <FAQs />

    </div>
  )
}