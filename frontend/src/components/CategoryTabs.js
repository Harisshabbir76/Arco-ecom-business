import React from 'react';
import { Nav } from 'react-bootstrap';

const CategoryTabs = ({ categories, activeCategory, onCategoryChange }) => {
  return (
    <Nav variant="tabs" defaultActiveKey="all" className="mb-4">
      <Nav.Item>
        <Nav.Link 
          eventKey="all" 
          active={activeCategory === 'all'}
          onClick={() => onCategoryChange('all')}
        >
          All Products
        </Nav.Link>
      </Nav.Item>
      {categories.map(category => {
        const catName = typeof category === 'object' ? category.name : category;
        const catId = typeof category === 'object' ? (category._id || category.id || category.name) : category;
        
        return (
          <Nav.Item key={catId}>
            <Nav.Link 
              eventKey={catName} 
              active={activeCategory === catName}
              onClick={() => onCategoryChange(catName)}
            >
              {catName}
            </Nav.Link>
          </Nav.Item>
        );
      })}
    </Nav>
  );
};

export default CategoryTabs;