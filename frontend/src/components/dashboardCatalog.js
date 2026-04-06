import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Alert,
  Badge,
  Button,
  ButtonGroup
} from 'react-bootstrap';
import { FaEdit, FaTrash, FaStar, FaPlus, FaArrowLeft } from 'react-icons/fa';
import { FiPackage, FiGrid, FiTag } from 'react-icons/fi';
import CategoryTabs from '../components/CategoryTabs';
import ProductEditModal from '../components/ProductEditModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import './heroSlider.css';

const C = {
  red:       '#CC1B1B',
  redDark:   '#A01212',
  redDeep:   '#7A0C0C',
  redLight:  '#fdf2f2',
  charcoal:  '#1e1e1e',
  white:     '#ffffff',
  lightGray: '#f7f7f7',
  border:    '#e8e8e8',
  gray:      '#888888',
  gradient:  'linear-gradient(135deg, #CC1B1B 0%, #A01212 100%)',
};

export default function AdminProductsDashboard() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/catalog`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
          }),
          axios.get(`${process.env.REACT_APP_API_URL}/categories`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
          })
        ]);

        const productsData = productsRes.data;
        let products = [];

        if (Array.isArray(productsData)) {
          products = productsData;
        } else if (productsData && Array.isArray(productsData.data)) {
          products = productsData.data;
        } else if (productsData && Array.isArray(productsData.products)) {
          products = productsData.products;
        } else {
          throw new Error('Unexpected API response');
        }

        const processedProducts = products.map(product => ({
          ...product,
          stock: product.stock !== undefined ? product.stock : 0,
          rating: product.averageRating || 0,
          reviewCount: product.reviewCount || 0,
          price: product.discountedPrice || product.price || 0,
          createdAt: product.createdAt ? new Date(product.createdAt) : new Date()
        }));

        setProducts(processedProducts);
        setFilteredProducts(processedProducts);
        setCategories(categoriesRes.data || []);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load data');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCategoryChange = async (category) => {
    setActiveCategory(category);
    setLoading(true);

    try {
      if (category === 'all') {
        setFilteredProducts(products);
      } else {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/category/${category}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
          }
        );
        setFilteredProducts(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to filter products');
    } finally {
      setLoading(false);
    }
  };

  const getProductImage = (product) => {
    if (!product?.image?.[0]) return '/placeholder.jpg';
    if (product.image[0].startsWith('http')) return product.image[0];
    return `${process.env.REACT_APP_API_URL}${product.image[0]}`;
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const handleDelete = (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/delete/${selectedProduct._id}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        }
      );
      setProducts(products.filter(p => p._id !== selectedProduct._id));
      setFilteredProducts(filteredProducts.filter(p => p._id !== selectedProduct._id));
      setShowDeleteModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleSave = (updatedProduct) => {
    const updatedProducts = products.map(p =>
      p._id === updatedProduct._id ? updatedProduct : p
    );
    setProducts(updatedProducts);

    const updatedCatName = typeof updatedProduct.category === 'object' ? updatedProduct.category.name : updatedProduct.category;
    if (activeCategory === 'all' || updatedCatName === activeCategory) {
      setFilteredProducts(updatedProducts.filter(p => {
        const pCatName = typeof p.category === 'object' ? p.category.name : p.category;
        return activeCategory === 'all' || pCatName === activeCategory;
      }));
    }

    setShowEditModal(false);
  };

  const renderProductCard = (product) => {
    const discountPct = product.discountedPrice < product.originalPrice
      ? Math.round(((product.originalPrice - product.discountedPrice) / product.originalPrice) * 100)
      : null;
    const stockQty = product.stock ?? 0;

    let stockLabel = null, stockClass = '';
    if (stockQty <= 0) { stockLabel = 'Out of Stock'; stockClass = 'out'; }
    else if (stockQty <= 5) { stockLabel = `Only ${stockQty} left`; stockClass = 'low'; }

    return (
      <Col 
        key={product._id || product.id} 
        xs={6} 
        sm={6} 
        md={4} 
        lg={3} 
        className="mb-3 mb-md-4"
        style={{ display: 'flex' }}
      >
        <div
          className="admin-product-card"
          style={{
            background: C.white,
            borderRadius: '12px',
            overflow: 'hidden',
            position: 'relative',
            border: `1px solid ${C.border}`,
            display: 'flex',
            flexDirection: 'column',
            transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
            height: '100%',
            width: '100%',
            maxWidth: '300px',
            margin: '0 auto'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = `0 14px 36px ${C.red}20`;
            e.currentTarget.style.borderColor = 'transparent';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.borderColor = C.border;
          }}
        >
          {/* Red sweep */}
          <div style={{
            position: 'absolute',
            bottom: 0, left: 0,
            width: 0, height: '3px',
            background: C.gradient,
            transition: 'width 0.32s ease',
            zIndex: 5,
            borderRadius: '0 0 2px 2px'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.width = '100%'; }}
          onMouseLeave={(e) => { e.currentTarget.style.width = '0'; }}
          />

          {/* Image container - Standard 1:1 square */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '1 / 1',
              overflow: 'hidden',
              backgroundColor: C.lightGray,
              flexShrink: 0
            }}
          >
            <img
              src={getProductImage(product)}
              alt={product.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                transition: 'transform 0.45s ease'
              }}
              onMouseEnter={(e) => { e.target.style.transform = 'scale(1.06)'; }}
              onMouseLeave={(e) => { e.target.style.transform = 'scale(1)'; }}
              onError={(e) => { e.target.src = '/placeholder.jpg'; }}
            />

            {/* Discount badge */}
            {discountPct && (
              <span style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                fontFamily: 'Barlow, sans-serif',
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding: '4px 12px',
                borderRadius: '4px',
                background: C.gradient,
                color: C.white,
                zIndex: 3,
                lineHeight: 1.4
              }}>−{discountPct}%</span>
            )}

            {/* Stock badge */}
            <span style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              fontFamily: 'Barlow, sans-serif',
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              padding: '4px 12px',
              borderRadius: '4px',
              background: stockQty <= 0 ? C.red : C.charcoal,
              color: C.white,
              zIndex: 3,
              lineHeight: 1.4
            }}>
              {stockQty <= 0 ? 'Out of Stock' : 'In Stock'}
            </span>
          </div>

          {/* Body */}
          <div style={{
            padding: '0.8rem 0.9rem 0.9rem',
            display: 'flex',
            flexDirection: 'column',
            flex: 1
          }}>
            {/* Category */}
            <span style={{
              fontFamily: 'Barlow, sans-serif',
              fontSize: '0.7rem',
              fontWeight: 500,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: C.gray,
              marginBottom: '0.3rem',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {typeof product.category === 'object' ? product.category.name : (product.category || 'Uncategorized')}
            </span>

            {/* Product Name */}
            <p style={{
              fontFamily: 'Barlow, sans-serif',
              fontSize: '0.9rem',
              fontWeight: 600,
              letterSpacing: '0.01em',
              color: C.charcoal,
              lineHeight: 1.35,
              margin: '0 0 0.5rem',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: 'calc(0.9rem * 1.35 * 2)'
            }}>{product.name}</p>

            {/* Rating */}
            <div className="d-flex align-items-center gap-2 mb-2">
              <div className="d-flex gap-1">
                {[1, 2, 3, 4, 5].map(s => (
                  <FaStar key={s} size={11}
                    style={{ color: s <= Math.round(product.rating) ? C.red : C.border }} />
                ))}
              </div>
              {product.reviewCount > 0 && (
                <span style={{ fontSize: '0.7rem', color: C.gray }}>
                  ({product.reviewCount})
                </span>
              )}
            </div>

            {/* Pricing */}
            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '0.5rem',
              marginBottom: '0.75rem',
              flexWrap: 'wrap'
            }}>
              <span style={{
                fontFamily: 'Barlow, sans-serif',
                fontSize: '1rem',
                fontWeight: 700,
                color: C.red
              }}>
                Rs. {(product.discountedPrice || product.price)?.toLocaleString()}
              </span>
              {product.discountedPrice < product.originalPrice && (
                <span style={{
                  fontFamily: 'Barlow, sans-serif',
                  fontSize: '0.75rem',
                  color: C.gray,
                  textDecoration: 'line-through'
                }}>
                  Rs. {product.originalPrice?.toLocaleString()}
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="d-flex gap-2 mt-auto">
              <button
                onClick={() => handleEdit(product)}
                style={{
                  flex: 1,
                  background: C.white,
                  color: C.red,
                  border: `1px solid ${C.red}`,
                  padding: '0.5rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = C.redLight;
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = C.white;
                }}
              >
                <FaEdit size={12} /> Edit
              </button>
              <button
                onClick={() => handleDelete(product)}
                style={{
                  flex: 1,
                  background: C.white,
                  color: '#dc3545',
                  border: `1px solid #dc3545`,
                  padding: '0.5rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#dc3545';
                  e.target.style.color = C.white;
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = C.white;
                  e.target.style.color = '#dc3545';
                }}
              >
                <FaTrash size={12} /> Delete
              </button>
            </div>
          </div>
        </div>
      </Col>
    );
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;500;600;700&display=swap');
        
        .admin-products-page {
          min-height: 100vh;
          background: ${C.white};
          font-family: 'Barlow', sans-serif;
        }

        /* Hero section */
        .admin-products-hero {
          background: ${C.white};
          padding: 2rem 2rem 1.5rem;
          position: relative;
          border-bottom: 1px solid ${C.border};
        }
        .admin-products-hero::after {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 5px;
          background: ${C.red};
          border-radius: 0 2px 2px 0;
        }
        .admin-products-hero-inner {
          max-width: 1320px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }
        .admin-products-eyebrow {
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
        .admin-products-eyebrow-dot {
          width: 5px; height: 5px;
          background: ${C.red};
          border-radius: 50%;
        }
        .admin-products-hero-title {
          font-family: 'Barlow', sans-serif;
          font-size: clamp(1.5rem, 4vw, 2rem);
          font-weight: 700;
          letter-spacing: -0.01em;
          color: ${C.charcoal};
          line-height: 1.05;
          margin: 0 0 0.25rem;
        }
        .admin-products-title-accent {
          display: flex;
          align-items: center;
          gap: 6px;
          margin: 0.5rem 0;
        }
        .admin-products-bar { width: 40px; height: 3px; background: ${C.red}; border-radius: 2px; flex-shrink: 0; }
        .admin-products-bar-thin { width: 20px; height: 3px; background: ${C.border}; border-radius: 2px; flex-shrink: 0; }

        /* Category tabs */
        .admin-category-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin: 1rem 0;
        }
        .admin-category-tab {
          background: ${C.white};
          border: 1px solid ${C.border};
          border-radius: 30px;
          padding: 0.5rem 1.25rem;
          font-family: 'Barlow', sans-serif;
          font-size: 0.8rem;
          font-weight: 500;
          color: ${C.charcoal};
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .admin-category-tab:hover {
          border-color: ${C.red};
          color: ${C.red};
        }
        .admin-category-tab.active {
          background: ${C.red};
          border-color: ${C.red};
          color: ${C.white};
        }

        .row {
          margin-left: -8px;
          margin-right: -8px;
        }
        .row > [class*="col-"] {
          padding-left: 8px;
          padding-right: 8px;
        }

        @media (max-width: 768px) {
          .admin-products-hero { padding: 1.5rem 1.25rem 1rem; }
          .row {
            margin-left: -6px;
            margin-right: -6px;
          }
          .row > [class*="col-"] {
            padding-left: 6px;
            padding-right: 6px;
          }
          .admin-category-tab { padding: 0.35rem 1rem; font-size: 0.7rem; }
        }
      `}</style>

      <div className="admin-products-page">
        {/* Hero Section */}
        <div className="admin-products-hero">
          <div className="admin-products-hero-inner">
            <div className="admin-products-eyebrow">
              <span className="admin-products-eyebrow-dot" />
              Admin Panel
            </div>
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
              <div>
                <h1 className="admin-products-hero-title">
                  Products Management
                </h1>
                <div className="admin-products-title-accent">
                  <div className="admin-products-bar" />
                  <div className="admin-products-bar-thin" />
                </div>
                <p style={{ color: C.gray, fontSize: '0.85rem', margin: 0 }}>
                  Manage your product catalog, edit prices, and track inventory
                </p>
              </div>
              <button
                onClick={() => navigate('/dashboard/add-product')}
                style={{
                  background: C.gradient,
                  color: C.white,
                  border: 'none',
                  padding: '0.6rem 1.25rem',
                  borderRadius: '30px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = `0 4px 12px ${C.red}40`;
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <FaPlus size={14} /> Add New Product
              </button>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div style={{ maxWidth: '1320px', margin: '0 auto', padding: '1rem 2rem 0' }}>
          <div className="admin-category-tabs">
            <button
              className={`admin-category-tab ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => handleCategoryChange('all')}
            >
              All Products
            </button>
            {categories.map(cat => (
              <button
                key={cat._id || cat.name}
                className={`admin-category-tab ${activeCategory === (cat.name || cat) ? 'active' : ''}`}
                onClick={() => handleCategoryChange(cat.name || cat)}
              >
                {cat.name || cat}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ maxWidth: '1320px', margin: '0 auto', padding: '1.5rem 2rem 3rem' }}>
          {error && (
            <Alert variant="danger" style={{ borderLeft: `4px solid ${C.red}`, borderRadius: '6px' }}>
              {error}
            </Alert>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '5rem 0',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <Spinner animation="border"
                style={{ color: C.red, width: '2.5rem', height: '2.5rem', borderWidth: '3px' }} />
              <p style={{ fontFamily: 'Barlow, sans-serif', color: C.gray,
                letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.72rem', margin: 0 }}>
                Loading Products...
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center my-5 py-5">
              <div style={{
                width: '80px', height: '80px',
                background: C.redLight,
                border: `1px solid ${C.border}`,
                borderLeft: `3px solid ${C.red}`,
                borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.25rem'
              }}>
                <FiPackage size={32} color={C.red} />
              </div>
              <h3 style={{
                fontFamily: 'Barlow, sans-serif',
                fontSize: '1.1rem', fontWeight: 700,
                letterSpacing: '0.03em',
                color: C.charcoal, margin: '0 0 0.5rem'
              }}>No Products Found</h3>
              <p style={{
                fontFamily: 'Barlow, sans-serif',
                fontSize: '0.875rem', color: C.gray, margin: 0
              }}>Try selecting a different category or add a new product.</p>
            </div>
          ) : (
            <Row className="g-2 g-md-3">
              {filteredProducts.map(product => renderProductCard(product))}
            </Row>
          )}
        </div>

        <ProductEditModal
          show={showEditModal}
          product={selectedProduct}
          onClose={() => setShowEditModal(false)}
          onSave={handleSave}
        />

        <DeleteConfirmationModal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          productName={selectedProduct?.name || 'this product'}
        />
      </div>
    </>
  );
}