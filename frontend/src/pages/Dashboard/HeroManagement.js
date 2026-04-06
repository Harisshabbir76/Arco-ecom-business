import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { Container, Button, Form, Modal, Card, Spinner, Alert, Image, Row, Col } from 'react-bootstrap';
import { FiPlus, FiEdit2, FiTrash2, FiUpload, FiCheck, FiX, FiMonitor, FiSmartphone, FiImage, FiArrowLeft } from 'react-icons/fi';
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

/* ── Drag & Drop Upload Zone ── */
function DropZone({ id, preview, label, hint, icon, onFile, onClear }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) onFile(file);
  }, [onFile]);

  const handleDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onFile(file);
  };

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !preview && inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? C.red : preview ? C.border : C.border}`,
          borderRadius: '12px',
          background: dragging ? C.redLight : preview ? C.white : C.lightGray,
          minHeight: '140px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          cursor: preview ? 'default' : 'pointer',
          transition: 'all 0.2s ease',
          position: 'relative',
          overflow: 'hidden',
          transform: dragging ? 'scale(1.01)' : 'scale(1)',
          boxShadow: dragging ? `0 0 0 4px ${C.red}20` : 'none',
        }}
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt="Preview"
              style={{
                width: '100%',
                height: '140px',
                objectFit: 'cover',
                borderRadius: '10px',
                display: 'block'
              }}
            />
            {/* Overlay on hover */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0,0,0,0.5)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                opacity: 0,
                transition: 'opacity 0.2s'
              }}
              className="dropzone-overlay"
            >
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                style={{
                  background: C.white,
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 14px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: C.charcoal,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <FiUpload size={12} /> Replace
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onClear(); }}
                style={{
                  background: C.red,
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 14px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: C.white,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <FiX size={12} /> Remove
              </button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '1rem', pointerEvents: 'none' }}>
            <div style={{
              width: '48px', height: '48px',
              borderRadius: '12px',
              background: dragging ? C.redLight : C.lightGray,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 0.5rem',
              transition: 'background 0.2s'
            }}>
              {dragging
                ? <FiImage size={22} color={C.red} />
                : icon
              }
            </div>
            <p style={{ margin: 0, fontWeight: 500, fontSize: '0.8rem', color: C.charcoal }}>
              {dragging ? 'Drop image here' : 'Drag & drop or click to upload'}
            </p>
            <p style={{ margin: '2px 0 0', fontSize: '0.7rem', color: C.gray }}>{hint}</p>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleInputChange}
      />

      <style>{`
        .dropzone-overlay { opacity: 0 !important; }
        div:hover > .dropzone-overlay { opacity: 1 !important; }
      `}</style>
    </div>
  );
}

export default function HeroManagement() {
  const navigate = useNavigate();
  const [slides, setSlides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [formData, setFormData] = useState({
    title: '', subtitle: '', ctaText: '', ctaLink: '', isActive: true,
    desktopImage: null, mobileImage: null
  });
  const [desktopImagePreview, setDesktopImagePreview] = useState(null);
  const [mobileImagePreview, setMobileImagePreview] = useState(null);
  const [error, setError] = useState(null);

  const fetchSlides = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/hero-slides`);
      setSlides(res.data);
    } catch (err) {
      setError('Failed to load slides');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchSlides(); }, []);

  const handleOpenModal = (slide = null) => {
    if (slide) {
      setEditingSlide(slide);
      setFormData({
        title: slide.title || '', subtitle: slide.subtitle || '',
        ctaText: slide.ctaText || '', ctaLink: slide.ctaLink || '',
        isActive: slide.isActive, desktopImage: null, mobileImage: null
      });
      setDesktopImagePreview(slide.desktopImage || slide.image);
      setMobileImagePreview(slide.mobileImage);
    } else {
      setEditingSlide(null);
      setFormData({ title: '', subtitle: '', ctaText: '', ctaLink: '', isActive: true, desktopImage: null, mobileImage: null });
      setDesktopImagePreview(null);
      setMobileImagePreview(null);
    }
    setShowModal(true);
    setError(null);
  };

  const handleDesktopFile = useCallback((file) => {
    setFormData(f => ({ ...f, desktopImage: file }));
    setDesktopImagePreview(URL.createObjectURL(file));
  }, []);

  const handleMobileFile = useCallback((file) => {
    setFormData(f => ({ ...f, mobileImage: file }));
    setMobileImagePreview(URL.createObjectURL(file));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (slides.length >= 5 && !editingSlide) { setError('Maximum 5 slides allowed'); return; }
    if (!desktopImagePreview) { setError('Desktop image is required'); return; }
    if (!mobileImagePreview) { setError('Mobile image is required'); return; }

    setIsSubmitting(true);
    setError(null);
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) data.append(key, value);
    });

    try {
      if (editingSlide) {
        await axios.put(`${process.env.REACT_APP_API_URL}/api/hero-slides/${editingSlide._id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/hero-slides`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      fetchSlides();
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save slide');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this slide?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/hero-slides/${id}`);
        fetchSlides();
      } catch { setError('Failed to delete slide'); }
    }
  };

  const getPreviewImage = (slide) => slide.desktopImage || slide.image || slide.mobileImage;

  if (isLoading) return (
    <div style={{ minHeight: '100vh', background: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Spinner animation="border" style={{ color: C.red, width: '2.5rem', height: '2.5rem', borderWidth: '3px' }} />
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;500;600;700&display=swap');
        
        .hero-management-page {
          min-height: 100vh;
          background: ${C.white};
          font-family: 'Barlow', sans-serif;
        }

        .form-control:focus, .form-select:focus {
          border-color: ${C.red};
          box-shadow: 0 0 0 0.2rem ${C.red}20;
        }
      `}</style>

      <div className="hero-management-page" style={{ padding: '2rem 0' }}>
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
                Hero Slider Management
              </h1>
              <div style={{
                height: '3px',
                width: '60px',
                background: C.red,
                borderRadius: '2px',
                marginTop: '0.5rem'
              }} />
              <p style={{ color: C.gray, fontSize: '0.85rem', marginTop: '0.5rem' }}>
                Manage homepage hero slider images and content
              </p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              disabled={slides.length >= 5}
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
                cursor: slides.length >= 5 ? 'not-allowed' : 'pointer',
                opacity: slides.length >= 5 ? 0.6 : 1,
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                if (slides.length < 5) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = `0 4px 12px ${C.red}40`;
                }
              }}
              onMouseLeave={(e) => {
                if (slides.length < 5) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }
              }}
            >
              <FiPlus size={16} /> Add Slide ({slides.length}/5)
            </button>
          </div>

          {error && (
            <Alert variant="danger" className="mb-4" style={{ borderLeft: `4px solid ${C.red}`, borderRadius: '6px' }}>
              {error}
            </Alert>
          )}

          {/* Slides Grid */}
          <Row className="g-4">
            {slides.length === 0 ? (
              <Col>
                <div className="text-center py-5">
                  <div style={{
                    width: '80px',
                    height: '80px',
                    background: C.redLight,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem'
                  }}>
                    <FiImage size={32} color={C.red} />
                  </div>
                  <h5 style={{ color: C.charcoal, marginBottom: '0.5rem' }}>No Slides Yet</h5>
                  <p style={{ color: C.gray }}>Click "Add Slide" to create your first hero slider image.</p>
                </div>
              </Col>
            ) : (
              slides.map((slide) => (
                <Col key={slide._id} md={6} lg={4}>
                  <div className="hero-slide-card" style={{
                    background: C.white,
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: `1px solid ${C.border}`,
                    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                    height: '100%'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = `0 14px 36px ${C.red}20`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}>
                    <div style={{ position: 'relative', paddingTop: '56.25%', background: C.lightGray }}>
                      <img
                        src={getPreviewImage(slide)}
                        alt={slide.title || 'Hero slide'}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                      />
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: slide.isActive ? '#10B981' : C.gray,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: C.white
                      }}>
                        {slide.isActive ? <FiCheck size={14} /> : <FiX size={14} />}
                      </div>
                    </div>
                    <div style={{ padding: '1rem' }}>
                      <h6 style={{
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        color: C.charcoal,
                        marginBottom: '0.25rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {slide.title || 'Untitled'}
                      </h6>
                      <p style={{
                        fontSize: '0.75rem',
                        color: C.gray,
                        marginBottom: '0.75rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {slide.subtitle || 'No subtitle'}
                      </p>
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          onClick={() => handleOpenModal(slide)}
                          style={{
                            background: C.white,
                            border: `1px solid ${C.red}`,
                            borderRadius: '6px',
                            padding: '0.35rem 0.75rem',
                            color: C.red,
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = C.redLight;
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = C.white;
                          }}
                        >
                          <FiEdit2 size={12} /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(slide._id)}
                          style={{
                            background: C.white,
                            border: `1px solid #dc3545`,
                            borderRadius: '6px',
                            padding: '0.35rem 0.75rem',
                            color: '#dc3545',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
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
                          <FiTrash2 size={12} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </Col>
              ))
            )}
          </Row>

          {/* Footer Stats */}
          <div className="mt-4 text-center">
            <p style={{ color: C.gray, fontSize: '0.75rem', margin: 0 }}>
              {slides.length} of 5 slides used
            </p>
          </div>
        </Container>

        {/* Add/Edit Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
          <Modal.Header closeButton style={{ borderBottom: `1px solid ${C.border}` }}>
            <Modal.Title style={{ color: C.charcoal, fontWeight: 600, fontFamily: 'Barlow, sans-serif' }}>
              {editingSlide ? 'Edit Hero Slide' : 'Add New Hero Slide'}
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body style={{ padding: '1.5rem' }}>
              {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: C.charcoal, fontWeight: 500 }}>Title</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter slide title"
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
                    <Form.Label style={{ color: C.charcoal, fontWeight: 500 }}>Subtitle</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.subtitle}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                      placeholder="Enter slide subtitle"
                      style={{
                        borderRadius: '8px',
                        borderColor: C.border,
                        padding: '0.6rem 1rem'
                      }}
                      onFocus={(e) => e.target.style.borderColor = C.red}
                      onBlur={(e) => e.target.style.borderColor = C.border}
                    />
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ color: C.charcoal, fontWeight: 500 }}>Button Text</Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.ctaText}
                          onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                          placeholder="e.g., Shop Now"
                          style={{
                            borderRadius: '8px',
                            borderColor: C.border,
                            padding: '0.6rem 1rem'
                          }}
                          onFocus={(e) => e.target.style.borderColor = C.red}
                          onBlur={(e) => e.target.style.borderColor = C.border}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ color: C.charcoal, fontWeight: 500 }}>Button Link</Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.ctaLink}
                          onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                          placeholder="e.g., /catalog"
                          style={{
                            borderRadius: '8px',
                            borderColor: C.border,
                            padding: '0.6rem 1rem'
                          }}
                          onFocus={(e) => e.target.style.borderColor = C.red}
                          onBlur={(e) => e.target.style.borderColor = C.border}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Check
                    type="switch"
                    id="active-switch"
                    label="Active"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    style={{ color: C.charcoal }}
                  />
                </Col>

                <Col md={6}>
                  {/* Desktop Image */}
                  <Form.Group className="mb-4">
                    <Form.Label className="d-flex align-items-center gap-1 mb-2" style={{ color: C.charcoal, fontWeight: 500 }}>
                      <FiMonitor size={14} style={{ color: C.red }} />
                      Desktop Image *
                    </Form.Label>
                    <DropZone
                      id="desktop-image"
                      preview={desktopImagePreview}
                      hint="PNG, JPG · 1920×800px recommended"
                      icon={<FiMonitor size={20} color={C.gray} />}
                      onFile={handleDesktopFile}
                      onClear={() => { setDesktopImagePreview(null); setFormData(f => ({ ...f, desktopImage: null })); }}
                    />
                  </Form.Group>

                  {/* Mobile Image */}
                  <Form.Group>
                    <Form.Label className="d-flex align-items-center gap-1 mb-2" style={{ color: C.charcoal, fontWeight: 500 }}>
                      <FiSmartphone size={14} style={{ color: C.red }} />
                      Mobile Image *
                    </Form.Label>
                    <DropZone
                      id="mobile-image"
                      preview={mobileImagePreview}
                      hint="PNG, JPG · 390×500px recommended"
                      icon={<FiSmartphone size={20} color={C.gray} />}
                      onFile={handleMobileFile}
                      onClear={() => { setMobileImagePreview(null); setFormData(f => ({ ...f, mobileImage: null })); }}
                    />
                  </Form.Group>
                </Col>
              </Row>
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
                {isSubmitting ? 'Saving...' : (editingSlide ? 'Update Slide' : 'Add Slide')}
              </button>
            </Modal.Footer>
          </Form>
        </Modal>
      </div>
    </>
  );
}