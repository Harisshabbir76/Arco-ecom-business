import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { Container, Button, Form, Modal, Card, Spinner, Alert, Image, Row, Col } from 'react-bootstrap';
import { FiPlus, FiEdit2, FiTrash2, FiUpload, FiCheck, FiX, FiMonitor, FiSmartphone, FiImage } from 'react-icons/fi';

const logoColors = {
    primary: '#fe7e8b',
    light: '#ffd1d4',
    dark: '#d64555',
    background: '#fff9fa',
    gradient: 'linear-gradient(135deg, #fe7e8b 0%, #e65c70 100%)',
    softGradient: 'linear-gradient(135deg, #fff5f6 0%, #ffd1d4 100%)',
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
                    border: `2px dashed ${dragging ? logoColors.primary : preview ? '#d0d0d0' : '#d8d8d8'}`,
                    borderRadius: '14px',
                    background: dragging
                        ? '#fff0f2'
                        : preview
                        ? '#fafafa'
                        : '#f9f9f9',
                    minHeight: '160px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    cursor: preview ? 'default' : 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    transform: dragging ? 'scale(1.01)' : 'scale(1)',
                    boxShadow: dragging ? `0 0 0 4px ${logoColors.light}` : 'none',
                }}
            >
                {preview ? (
                    <>
                        <img
                            src={preview}
                            alt="Preview"
                            style={{
                                width: '100%',
                                height: '160px',
                                objectFit: 'cover',
                                borderRadius: '12px',
                                display: 'block'
                            }}
                        />
                        {/* Overlay on hover */}
                        <div
                            style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'rgba(0,0,0,0.45)',
                                borderRadius: '12px',
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
                                    background: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '6px 14px',
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    color: logoColors.dark,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px'
                                }}
                            >
                                <FiUpload size={13} /> Replace
                            </button>
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); onClear(); }}
                                style={{
                                    background: '#ff4d4d',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '6px 14px',
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    color: 'white',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px'
                                }}
                            >
                                <FiX size={13} /> Remove
                            </button>
                        </div>
                    </>
                ) : (
                    <div style={{ textAlign: 'center', padding: '1.25rem', pointerEvents: 'none' }}>
                        <div style={{
                            width: '52px', height: '52px',
                            borderRadius: '14px',
                            background: dragging ? logoColors.light : '#f0f0f0',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 0.75rem',
                            transition: 'background 0.2s'
                        }}>
                            {dragging
                                ? <FiImage size={24} color={logoColors.primary} />
                                : icon
                            }
                        </div>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: '#444' }}>
                            {dragging ? 'Drop image here' : 'Drag & drop or click to upload'}
                        </p>
                        <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#999' }}>{hint}</p>
                        <span style={{
                            display: 'inline-block',
                            marginTop: '10px',
                            padding: '5px 14px',
                            borderRadius: '100px',
                            background: logoColors.light,
                            color: logoColors.dark,
                            fontSize: '0.75rem',
                            fontWeight: 600
                        }}>
                            Browse files
                        </span>
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
        <div className="text-center py-5">
            <Spinner animation="border" style={{ color: logoColors.primary }} />
        </div>
    );

    return (
        <Container className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 style={{ color: logoColors.dark, margin: 0 }}>Hero Slider Management</h4>
                    <small className="text-muted">{slides.length}/5 slides used</small>
                </div>
                <Button onClick={() => handleOpenModal()} disabled={slides.length >= 5} style={{ background: logoColors.gradient, border: 'none' }}>
                    <FiPlus className="me-2" /> Add Slide
                </Button>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <Row className="g-4">
                {slides.map((slide) => (
                    <Col key={slide._id} md={6} lg={4}>
                        <Card className="h-100 border-0 shadow-sm overflow-hidden">
                            <div style={{ position: 'relative', paddingTop: '50%' }}>
                                <Image src={getPreviewImage(slide)} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                                    {slide.isActive
                                        ? <div className="bg-success text-white p-1 rounded-circle"><FiCheck size={12} /></div>
                                        : <div className="bg-secondary text-white p-1 rounded-circle"><FiX size={12} /></div>}
                                </div>
                            </div>
                            <Card.Body>
                                <h6 className="mb-1 text-truncate">{slide.title || 'Untitled'}</h6>
                                <p className="text-muted small mb-3 text-truncate">{slide.subtitle || 'No subtitle'}</p>
                                <div className="d-flex justify-content-end gap-2">
                                    <Button size="sm" variant="outline-primary" onClick={() => handleOpenModal(slide)}><FiEdit2 /> Edit</Button>
                                    <Button size="sm" variant="outline-danger" onClick={() => handleDelete(slide._id)}><FiTrash2 /></Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title style={{ color: logoColors.dark }}>
                        {editingSlide ? 'Edit Slide' : 'Add Hero Slide'}
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Title</Form.Label>
                                    <Form.Control type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Subtitle</Form.Label>
                                    <Form.Control type="text" value={formData.subtitle} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Button Text</Form.Label>
                                    <Form.Control type="text" value={formData.ctaText} onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })} />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Button Link</Form.Label>
                                    <Form.Control type="text" value={formData.ctaLink} onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })} />
                                </Form.Group>
                                <Form.Check
                                    type="switch"
                                    label="Active"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                />
                            </Col>

                            <Col md={6}>
                                {/* Desktop Image */}
                                <Form.Group className="mb-4">
                                    <Form.Label className="d-flex align-items-center gap-1 mb-2">
                                        <FiMonitor size={15} />
                                        <strong>Desktop Image</strong>
                                        <span className="text-muted ms-1" style={{ fontSize: '0.75rem', fontWeight: 400 }}>
                                            1920 × 800 px
                                        </span>
                                    </Form.Label>
                                    <DropZone
                                        id="desktop-image"
                                        preview={desktopImagePreview}
                                        hint="PNG, JPG up to 10MB · 1920×800px recommended"
                                        icon={<FiMonitor size={22} color="#bbb" />}
                                        onFile={handleDesktopFile}
                                        onClear={() => { setDesktopImagePreview(null); setFormData(f => ({ ...f, desktopImage: null })); }}
                                    />
                                </Form.Group>

                                {/* Mobile Image */}
                                <Form.Group>
                                    <Form.Label className="d-flex align-items-center gap-1 mb-2">
                                        <FiSmartphone size={15} />
                                        <strong>Mobile Image</strong>
                                        <span className="text-muted ms-1" style={{ fontSize: '0.75rem', fontWeight: 400 }}>
                                            390 × 500 px
                                        </span>
                                    </Form.Label>
                                    <DropZone
                                        id="mobile-image"
                                        preview={mobileImagePreview}
                                        hint="PNG, JPG up to 10MB · 390×500px recommended"
                                        icon={<FiSmartphone size={22} color="#bbb" />}
                                        onFile={handleMobileFile}
                                        onClear={() => { setMobileImagePreview(null); setFormData(f => ({ ...f, mobileImage: null })); }}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="light" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting} style={{ background: logoColors.gradient, border: 'none' }}>
                            {isSubmitting ? 'Saving…' : 'Save Slide'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
}