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
import { FaEdit, FaTrash, FaStar } from 'react-icons/fa';
import CategoryTabs from '../components/CategoryTabs';
import ProductEditModal from '../components/ProductEditModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import './heroSlider.css';

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

  const renderProductCard = (product) => (
    <Col key={product._id || product.id} xs={6} sm={6} md={4} lg={3}>
      <Card className="product-card h-100 border-0 mb-3" style={{
        background: 'white',
        borderRadius: '12px',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
      }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.boxShadow = `0 8px 20px ${logoColors.primary}30`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
        }}>
        <div className="product-image-container" style={{ position: 'relative' }}>
          <Card.Img
            variant="top"
            src={getProductImage(product)}
            alt={product.name}
            className="product-img"
            style={{
              height: '200px',
              objectFit: 'cover',
              transition: 'transform 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
            }}
            onError={(e) => {
              e.target.src = '/placeholder.jpg';
            }}
          />
          {product.discountedPrice < product.originalPrice && (
            <div style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              background: logoColors.gradient,
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              zIndex: 1
            }}>
              {Math.round(100 - (product.discountedPrice / product.originalPrice) * 100)}% OFF
            </div>
          )}
          <Badge
            bg={product.stock > 0 ? "success" : "danger"}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              padding: '4px 8px',
              fontSize: '0.7rem',
              zIndex: 1,
              background: product.stock > 0 ? logoColors.primary : '#dc3545',
              border: 'none'
            }}
          >
            {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
          </Badge>
        </div>
        <Card.Body className="d-flex flex-column" style={{ padding: '1rem' }}>
          <Card.Title
            className="product-title"
            style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: '#2D3748',
              marginBottom: '0.25rem'
            }}
          >
            {product.name}
          </Card.Title>
          <Card.Text className="product-category" style={{
            fontSize: '0.85rem',
            marginBottom: '0.5rem',
            color: '#718096'
          }}>
            {typeof product.category === 'object' ? product.category.name : (product.category || 'Uncategorized')}
          </Card.Text>
          <div className="mt-auto">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div className="price">
                {product.discountedPrice < product.originalPrice && (
                  <span className="original-price text-muted text-decoration-line-through me-2" style={{ fontSize: '0.8rem' }}>
                    Rs. {product.originalPrice}
                  </span>
                )}
                <span className="current-price fw-bold" style={{ color: logoColors.primary, fontSize: '1.1rem' }}>
                  Rs. {product.discountedPrice || product.price}
                </span>
              </div>
              <div className="rating" style={{ fontSize: '0.85rem' }}>
                {product.reviewCount > 0 ? (
                  <>
                    <FaStar style={{ color: logoColors.primary }} />
                    <span className="ms-1" style={{ color: '#4A5568' }}>{product.rating.toFixed(1)}</span>
                    <small className="text-muted ms-1" style={{ color: '#718096' }}>({product.reviewCount})</small>
                  </>
                ) : (
                  <small className="text-muted" style={{ color: '#718096' }}>No reviews yet</small>
                )}
              </div>
            </div>
            <ButtonGroup className="w-100">
              <Button
                variant="outline-primary"
                onClick={() => handleEdit(product)}
                size="sm"
                style={{
                  borderColor: logoColors.primary,
                  color: logoColors.primary,
                  background: 'transparent',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = logoColors.softGradient;
                  e.target.style.color = logoColors.dark;
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = logoColors.primary;
                }}
              >
                <FaEdit /> Edit
              </Button>
              <Button
                variant="outline-danger"
                onClick={() => handleDelete(product)}
                size="sm"
                style={{
                  borderColor: '#dc3545',
                  color: '#dc3545',
                  background: 'transparent',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#dc3545';
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#dc3545';
                }}
              >
                <FaTrash /> Delete
              </Button>
            </ButtonGroup>
          </div>
        </Card.Body>
      </Card>
    </Col>
  );

  return (
    <Container fluid style={{ background: logoColors.background, minHeight: '100vh', padding: '2rem 0' }}>
      <Container className="admin-products-dashboard py-3 py-md-5">
        <div className="page-header-wrapper mb-4 mb-md-5 text-center">
          <h1 className="page-header" style={{ color: logoColors.dark }}>Products Management</h1>

          {/* Decorative line under header */}
          <div style={{
            height: '2px',
            background: `linear-gradient(90deg, transparent, ${logoColors.primary}40, transparent)`,
            width: '200px',
            margin: '1rem auto 2rem auto'
          }} />

          <CategoryTabs
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={handleCategoryChange}
          />
        </div>

        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}

        {loading ? (
          <div className="text-center my-5 py-5">
            <Spinner animation="border" style={{ color: logoColors.primary }} />
            <p className="mt-3" style={{ color: '#4A5568' }}>Loading products...</p>
          </div>
        ) : (
          <>
            <Row className="g-2 g-md-4">
              {filteredProducts.length > 0 ? (
                filteredProducts.map(product => renderProductCard(product))
              ) : (
                <Col className="text-center py-5">
                  <Alert variant="info" style={{
                    borderRadius: '8px',
                    border: `1px solid ${logoColors.light}`
                  }}>
                    No products found in this category
                  </Alert>
                </Col>
              )}
            </Row>

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
          </>
        )}
      </Container>
    </Container>
  );
}