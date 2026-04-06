import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { FaFilter } from 'react-icons/fa';

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

const FilterComponent = ({ sortOption, onSortChange, categories = [], selectedCategory, onCategoryChange }) => {
  const sortOptions = [
    { value: 'default', label: 'Default' },
    { value: 'price-high-low', label: 'Price: High to Low' },
    { value: 'price-low-high', label: 'Price: Low to High' },
    { value: 'rating-high', label: 'Highest Rating' },
    { value: 'newest', label: 'Newest' }
  ];

  return (
    <div className="d-flex justify-content-end mb-3">
      {categories && categories.length > 0 && onCategoryChange && (
        <Dropdown>
          <Dropdown.Toggle
            variant="outline-secondary"
            id="dropdown-category"
            className="me-2"
            style={{
              borderColor: logoColors.light,
              color: logoColors.dark,
              background: logoColors.softGradient,
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontWeight: '500',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = logoColors.gradient;
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.borderColor = 'transparent';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = logoColors.softGradient;
              e.currentTarget.style.color = logoColors.dark;
              e.currentTarget.style.borderColor = logoColors.light;
            }}
          >
            {selectedCategory || 'All Categories'}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => onCategoryChange('')}>All Categories</Dropdown.Item>
            {categories.map(category => {
              const catName = typeof category === 'object' ? category.name : category;
              const catId = typeof category === 'object' ? (category._id || category.id || category.name) : category;
              
              return (
                <Dropdown.Item
                  key={catId}
                  onClick={() => onCategoryChange(catName)}
                  active={selectedCategory === catName}
                >
                  {catName}
                </Dropdown.Item>
              );
            })}
          </Dropdown.Menu>
        </Dropdown>
      )}

      <Dropdown>
        <Dropdown.Toggle
          variant="outline-secondary"
          id="dropdown-sort"
          style={{
            borderColor: logoColors.light,
            color: logoColors.dark,
            background: logoColors.softGradient,
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            fontWeight: '500',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = logoColors.gradient;
            e.currentTarget.style.color = 'white';
            e.currentTarget.style.borderColor = 'transparent';
            e.currentTarget.style.boxShadow = `0 4px 12px ${logoColors.primary}40`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = logoColors.softGradient;
            e.currentTarget.style.color = logoColors.dark;
            e.currentTarget.style.borderColor = logoColors.light;
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <FaFilter className="me-2" style={{ color: logoColors.primary }} />
          {sortOptions.find(opt => opt.value === sortOption)?.label || 'Sort By'}
        </Dropdown.Toggle>
        <Dropdown.Menu style={{
          borderRadius: '8px',
          border: `1px solid ${logoColors.light}`,
          boxShadow: `0 4px 12px rgba(0,0,0,0.1)`,
          padding: '0.5rem',
          minWidth: '200px'
        }}>
          {sortOptions.map((option) => (
            <Dropdown.Item
              key={option.value}
              active={sortOption === option.value}
              onClick={() => onSortChange(option.value)}
              style={{
                borderRadius: '6px',
                padding: '0.5rem 1rem',
                transition: 'all 0.2s ease',
                backgroundColor: sortOption === option.value ? logoColors.softGradient : 'transparent',
                color: sortOption === option.value ? logoColors.dark : '#4A5568',
                fontWeight: sortOption === option.value ? '600' : '400'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = logoColors.softGradient;
                e.currentTarget.style.color = logoColors.dark;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = sortOption === option.value ? logoColors.softGradient : 'transparent';
                e.currentTarget.style.color = sortOption === option.value ? logoColors.dark : '#4A5568';
              }}
            >
              {option.label}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

export default FilterComponent;