import React, { useState } from 'react';
import { Form, InputGroup, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiX } from 'react-icons/fi';

// Navbar color palette
const logoColors = {
  primary: '#fe7e8b', // Navbar primary color
  secondary: '#e65c70', // Navbar secondary color
  light: '#ffd1d4', // Navbar light color
  dark: '#d64555', // Navbar dark color
  background: '#fff5f6', // Super light - almost white
  gradient: 'linear-gradient(135deg, #fe7e8b 0%, #e65c70 100%)', // Navbar gradient
  softGradient: 'linear-gradient(135deg, #fff5f6 0%, #ffd1d4 100%)', // Very soft gradient
};

const SearchComponent = ({ onClose, searchSource = 'header' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    performSearch();
  };

  const performSearch = () => {
    const trimmedSearch = searchTerm.trim();
    if (trimmedSearch) {
      trackEvent('search_query', {
        query: trimmedSearch,
        source: searchSource,
        timestamp: new Date().toISOString()
      });

      navigate(`/search?query=${encodeURIComponent(trimmedSearch)}`);
      if (onClose) onClose();
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <Form onSubmit={handleSearchSubmit}>
        <InputGroup>
          <InputGroup.Text
            style={{
              background: 'transparent',
              borderRight: 'none',
              color: logoColors.primary,
              borderColor: logoColors.light
            }}
          >
            <FiSearch size={18} />
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
            data-track="search_input"
            style={{
              borderRadius: '8px',
              borderColor: logoColors.light,
              padding: '0.75rem 1rem',
              boxShadow: 'none',
              transition: 'all 0.3s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = logoColors.primary;
              e.target.style.boxShadow = `0 0 0 3px ${logoColors.primary}20`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = logoColors.light;
              e.target.style.boxShadow = 'none';
            }}
          />
          <Button
            variant="primary"
            onClick={performSearch}
            data-track="search_submit"
            style={{
              background: logoColors.gradient,
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '0 8px 8px 0',
              fontWeight: '500',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => {
              e.target.style.opacity = '0.9';
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = `0 4px 12px ${logoColors.primary}40`;
            }}
            onMouseLeave={(e) => {
              e.target.style.opacity = '1';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            Search
          </Button>
          {onClose && (
            <Button
              variant="link"
              onClick={onClose}
              style={{
                marginLeft: '8px',
                color: logoColors.primary,
                background: logoColors.softGradient,
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                border: `1px solid ${logoColors.light}`,
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = logoColors.gradient;
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = logoColors.softGradient;
                e.currentTarget.style.color = logoColors.primary;
                e.currentTarget.style.borderColor = logoColors.light;
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <FiX size={18} />
            </Button>
          )}
        </InputGroup>
      </Form>
    </div>
  );
};

export default SearchComponent;