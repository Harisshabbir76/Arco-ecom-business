import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Table, Button, Form, Modal, Card, Spinner, Alert, Image, Row, Col, Badge } from 'react-bootstrap';
import { FiPlus, FiEdit2, FiTrash2, FiImage, FiUpload, FiFolder, FiGrid, FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

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

export default function CategoryManagement() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', image: null, showOnHome: false });
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState(null);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/categories`);
      setCategories(res.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ name: category.name, image: null, showOnHome: category.showOnHome || false });
      setImagePreview(category.image);
    } else {
      setEditingCategory(null);
      setFormData({ name: '', image: null, showOnHome: false });
      setImagePreview(null);
    }
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const data = new FormData();
    data.append('name', formData.name);
    data.append('showOnHome', formData.showOnHome);
    if (formData.image) {
      data.append('image', formData.image);
    }

    try {
      if (editingCategory) {
        await axios.put(`${process.env.REACT_APP_API_URL}/api/categories/${editingCategory._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/categories`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      fetchCategories();
      setShowModal(false);
    } catch (err) {
      setError('Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/categories/${id}`);
        fetchCategories();
      } catch (err) {
        setError('Failed to delete category');
      }
    }
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="text-center">
          <Spinner animation="border" style={{ color: C.red, width: '2.5rem', height: '2.5rem', borderWidth: '3px' }} />
          <p className="mt-3" style={{ color: C.gray }}>Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;500;600;700&display=swap');
        
        .category-management-page {
          min-height: 100vh;
          background: ${C.white};
          font-family: 'Barlow', sans-serif;
        }

        .category-table th {
          font-weight: 600;
          font-size: 0.75rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: ${C.gray};
          background: ${C.redLight};
          border-bottom: 1.5px solid ${C.border};
          padding: 1rem;
        }

        .category-table td {
          padding: 1rem;
          vertical-align: middle;
          border-bottom: 1px solid ${C.border};
        }

        .category-table tbody tr:hover {
          background: ${C.redLight};
        }

        .form-control:focus, .form-select:focus {
          border-color: ${C.red};
          box-shadow: 0 0 0 0.2rem ${C.red}20;
        }
      `}</style>

      <div className="category-management-page" style={{ padding: '2rem 0' }}>
        <Container>
          {/* Back Button */}
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'none',
              border: 'none',
              color: C.red,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.5rem',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 500
            }}
            onMouseEnter={(e) => e.target.style.opacity = '0.8'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >
            <FiArrowLeft size={16} /> Back to Dashboard
          </button>

          {/* Header */}
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                fontSize: '0.68rem',
                fontWeight: 600,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: C.red,
                marginBottom: '0.5rem'
              }}>
                <span style={{ width: '5px', height: '5px', background: C.red, borderRadius: '50%' }} />
                Management
              </div>
              <h1 style={{
                margin: 0,
                fontWeight: 700,
                fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                color: C.charcoal,
                lineHeight: 1.2
              }}>
                Category Management
              </h1>
              <div style={{
                height: '3px',
                width: '60px',
                background: C.red,
                borderRadius: '2px',
                marginTop: '0.5rem'
              }} />
            </div>
            <button
              onClick={() => handleOpenModal()}
              style={{
                background: C.gradient,
                border: 'none',
                borderRadius: '30px',
                padding: '0.6rem 1.25rem',
                color: C.white,
                fontWeight: 600,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
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
              <FiPlus size={16} /> Add Category
            </button>
          </div>

          {error && (
            <Alert variant="danger" className="mb-4" style={{ borderLeft: `4px solid ${C.red}`, borderRadius: '6px' }}>
              {error}
            </Alert>
          )}

          {/* Categories Grid - Card View for Mobile, Table for Desktop */}
          <Card className="border-0 shadow-sm" style={{ borderRadius: '12px', border: `1px solid ${C.border}`, overflow: 'hidden' }}>
            {/* Desktop Table View */}
            <div className="d-none d-md-block">
              <table className="category-table w-100">
                <thead>
                  <tr>
                    <th style={{ paddingLeft: '1.5rem' }}>Image</th>
                    <th>Name</th>
                    <th>Show on Home</th>
                    <th style={{ textAlign: 'right', paddingRight: '1.5rem' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-5" style={{ color: C.gray }}>
                        No categories found. Click "Add Category" to create one.
                      </td>
                    </tr>
                  ) : (
                    categories.map((cat) => (
                      <tr key={cat._id}>
                        <td style={{ paddingLeft: '1.5rem' }}>
                          {cat.image ? (
                            <img
                              src={cat.image}
                              alt={cat.name}
                              style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }}
                            />
                          ) : (
                            <div style={{
                              width: '50px',
                              height: '50px',
                              background: C.lightGray,
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: C.gray
                            }}>
                              <FiFolder size={20} />
                            </div>
                          )}
                        </td>
                        <td className="align-middle" style={{ fontWeight: 500, color: C.charcoal }}>
                          {cat.name}
                        </td>
                        <td className="align-middle">
                          {cat.showOnHome ? (
                            <span style={{
                              background: C.gradient,
                              color: C.white,
                              padding: '4px 10px',
                              borderRadius: '20px',
                              fontSize: '0.7rem',
                              fontWeight: 600
                            }}>
                              Yes
                            </span>
                          ) : (
                            <span style={{
                              background: C.lightGray,
                              color: C.gray,
                              padding: '4px 10px',
                              borderRadius: '20px',
                              fontSize: '0.7rem',
                              fontWeight: 600
                            }}>
                              No
                            </span>
                          )}
                        </td>
                        <td className="text-end align-middle" style={{ paddingRight: '1.5rem' }}>
                          <button
                            onClick={() => handleOpenModal(cat)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: C.red,
                              cursor: 'pointer',
                              padding: '0.5rem',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.target.style.opacity = '0.7'}
                            onMouseLeave={(e) => e.target.style.opacity = '1'}
                            title="Edit"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(cat._id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#dc3545',
                              cursor: 'pointer',
                              padding: '0.5rem',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.target.style.opacity = '0.7'}
                            onMouseLeave={(e) => e.target.style.opacity = '1'}
                            title="Delete"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="d-md-none">
              {categories.length === 0 ? (
                <div className="text-center py-5" style={{ color: C.gray }}>
                  No categories found. Click "Add Category" to create one.
                </div>
              ) : (
                categories.map((cat) => (
                  <div
                    key={cat._id}
                    style={{
                      padding: '1rem',
                      borderBottom: `1px solid ${C.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem'
                    }}
                  >
                    <div>
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt={cat.name}
                          style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }}
                        />
                      ) : (
                        <div style={{
                          width: '50px',
                          height: '50px',
                          background: C.lightGray,
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: C.gray
                        }}>
                          <FiFolder size={20} />
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: C.charcoal, marginBottom: '0.25rem' }}>
                        {cat.name}
                      </div>
                      <div>
                        {cat.showOnHome ? (
                          <span style={{
                            background: C.gradient,
                            color: C.white,
                            padding: '2px 8px',
                            borderRadius: '20px',
                            fontSize: '0.65rem',
                            fontWeight: 600
                          }}>
                            Show on Home
                          </span>
                        ) : (
                          <span style={{
                            background: C.lightGray,
                            color: C.gray,
                            padding: '2px 8px',
                            borderRadius: '20px',
                            fontSize: '0.65rem',
                            fontWeight: 600
                          }}>
                            Hidden
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <button
                        onClick={() => handleOpenModal(cat)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: C.red,
                          cursor: 'pointer',
                          padding: '0.5rem'
                        }}
                        title="Edit"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(cat._id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#dc3545',
                          cursor: 'pointer',
                          padding: '0.5rem'
                        }}
                        title="Delete"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Stats Footer */}
          <div className="mt-4 text-center">
            <p style={{ color: C.gray, fontSize: '0.75rem', margin: 0 }}>
              Total Categories: {categories.length}
            </p>
          </div>
        </Container>

        {/* Add/Edit Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton style={{ borderBottom: `1px solid ${C.border}` }}>
            <Modal.Title style={{ color: C.charcoal, fontWeight: 600, fontFamily: 'Barlow, sans-serif' }}>
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body style={{ padding: '1.5rem' }}>
              <Form.Group className="mb-3">
                <Form.Label style={{ color: C.charcoal, fontWeight: 500 }}>Category Name *</Form.Label>
                <Form.Control
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter category name"
                  style={{
                    borderRadius: '8px',
                    borderColor: C.border,
                    padding: '0.6rem 1rem'
                  }}
                  onFocus={(e) => e.target.style.borderColor = C.red}
                  onBlur={(e) => e.target.style.borderColor = C.border}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  id="show-on-home-switch"
                  label="Show products from this category on the Home page"
                  checked={formData.showOnHome}
                  onChange={(e) => setFormData({ ...formData, showOnHome: e.target.checked })}
                  style={{ color: C.charcoal }}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label style={{ color: C.charcoal, fontWeight: 500 }}>Category Image</Form.Label>
                <div
                  className="border rounded p-3 text-center"
                  style={{
                    background: C.redLight,
                    borderColor: C.border,
                    cursor: 'pointer',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => document.getElementById('cat-image').click()}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = C.red}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = C.border}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" style={{ maxHeight: '120px', maxWidth: '100%', borderRadius: '8px' }} />
                  ) : (
                    <div>
                      <FiUpload size={28} style={{ color: C.red, marginBottom: '0.5rem' }} />
                      <p className="mb-0 small" style={{ color: C.gray }}>Click to upload image</p>
                    </div>
                  )}
                  <Form.Control
                    id="cat-image"
                    type="file"
                    className="d-none"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>
              </Form.Group>
            </Modal.Body>
            <Modal.Footer style={{ borderTop: `1px solid ${C.border}` }}>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{
                  background: C.white,
                  border: `1.5px solid ${C.border}`,
                  borderRadius: '30px',
                  padding: '0.5rem 1.25rem',
                  color: C.gray,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = C.red;
                  e.target.style.color = C.red;
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = C.border;
                  e.target.style.color = C.gray;
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  background: C.gradient,
                  border: 'none',
                  borderRadius: '30px',
                  padding: '0.5rem 1.5rem',
                  color: C.white,
                  fontWeight: 600,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.7 : 1,
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = `0 4px 12px ${C.red}40`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              >
                {isSubmitting ? 'Saving...' : (editingCategory ? 'Update Category' : 'Add Category')}
              </button>
            </Modal.Footer>
          </Form>
        </Modal>
      </div>
    </>
  );
}