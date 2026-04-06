import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Container } from 'react-bootstrap';

// Navbar color palette
const logoColors = {
  primary: '#fe7e8b', // Navbar primary color
  secondary: '#e65c70', // Navbar secondary color
  light: '#ffd1d4', // Navbar light color
  dark: '#d64555', // Navbar dark color
  background: '#fff5f6', // Super light - almost white
  lighterBg: '#fff9fa', // Even lighter - subtle tint
  gradient: 'linear-gradient(135deg, #fe7e8b 0%, #e65c70 100%)', // Navbar gradient
  softGradient: 'linear-gradient(135deg, #fff5f6 0%, #ffd1d4 100%)', // Very soft gradient
};

const NotFoundPage = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: logoColors.background
    }}>
      {/* Navbar removed - it should be in your layout component */}

      <Container
        className="d-flex flex-column align-items-center justify-content-center text-center py-5"
        style={{ flex: 1 }}
      >
        <div
          className="p-5 rounded"
          style={{
            background: logoColors.softGradient,
            border: `1px solid ${logoColors.light}`,
            boxShadow: `0 10px 25px -5px ${logoColors.primary}30`
          }}
        >
          <h1
            className="display-1 fw-bold mb-4"
            style={{
              background: logoColors.gradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: `0 2px 10px ${logoColors.primary}40`
            }}
          >
            404
          </h1>

          <h2 className="h4 mb-4" style={{ color: logoColors.dark }}>
            Oops! Page not found
          </h2>

          <p className="mb-4" style={{ color: '#4A5568', maxWidth: '500px' }}>
            The page you're looking for doesn't exist or has been moved.
          </p>

          <Button
            as={Link}
            to="/"
            variant="primary"
            className="px-5 py-3"
            style={{
              background: logoColors.gradient,
              border: 'none',
              borderRadius: '50px',
              fontWeight: '600',
              fontSize: '1.1rem',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.opacity = '0.9';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = `0 8px 20px ${logoColors.primary}40`;
            }}
            onMouseLeave={(e) => {
              e.target.style.opacity = '1';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            Return Home
          </Button>
        </div>
      </Container>
    </div>
  );
};

export default NotFoundPage;