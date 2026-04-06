import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Table, Button, Form, Modal, Card, Spinner, Alert, Image } from 'react-bootstrap';
import { FiPlus, FiEdit2, FiTrash2, FiImage, FiUpload } from 'react-icons/fi';

const logoColors = {
    primary: '#fe7e8b',
    light: '#ffd1d4',
    dark: '#d64555',
    background: '#fff9fa',
    gradient: 'linear-gradient(135deg, #fe7e8b 0%, #e65c70 100%)',
    softGradient: 'linear-gradient(135deg, #fff5f6 0%, #ffd1d4 100%)',
};

export default function CategoryManagement() {
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

    if (isLoading) return <div className="text-center py-5"><Spinner animation="border" style={{ color: logoColors.primary }} /></div>;

    return (
        <Container className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 style={{ color: logoColors.dark }}>Category Management</h4>
                <Button
                    onClick={() => handleOpenModal()}
                    style={{ background: logoColors.gradient, border: 'none' }}
                >
                    <FiPlus className="me-2" /> Add Category
                </Button>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                    <Table responsive hover className="mb-0">
                        <thead style={{ background: logoColors.background }}>
                            <tr>
                                <th className="ps-4">Image</th>
                                <th>Name</th>
                                <th>Show on Home</th>
                                <th className="text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((cat, index) => (
                                <tr key={cat._id || index}>
                                    <td className="ps-4">
                                        {cat.image ? (
                                            <Image src={cat.image} rounded style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '50px', height: '50px', background: '#f0f0f0', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#888' }}>
                                                No Img
                                            </div>
                                        )}
                                    </td>
                                    <td className="align-middle">
                                        {cat.name}
                                    </td>
                                    <td className="align-middle">
                                        {cat.showOnHome ? (
                                            <span className="badge" style={{ backgroundColor: logoColors.primary }}>Yes</span>
                                        ) : (
                                            <span className="badge bg-secondary">No</span>
                                        )}
                                    </td>
                                    <td className="text-end pe-4 align-middle">
                                        <Button
                                            variant="link"
                                            onClick={() => handleOpenModal(cat)}
                                            style={{ color: logoColors.primary }}
                                            title="Edit"
                                        >
                                            <FiEdit2 />
                                        </Button>
                                        <Button
                                            variant="link"
                                            onClick={() => handleDelete(cat._id)}
                                            style={{ color: '#E53E3E' }}
                                            title="Delete"
                                        >
                                            <FiTrash2 />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title style={{ color: logoColors.dark }}>{editingCategory ? 'Edit Category' : 'Add Category'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Category Name</Form.Label>
                            <Form.Control
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Check
                                type="switch"
                                id="show-on-home-switch"
                                label="Show products from this category on the Home page"
                                checked={formData.showOnHome}
                                onChange={(e) => setFormData({ ...formData, showOnHome: e.target.checked })}
                                style={{ accentColor: logoColors.primary }}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Category Image</Form.Label>
                            <div
                                className="border rounded p-3 text-center mb-2"
                                style={{ background: '#f8f9fa', cursor: 'pointer' }}
                                onClick={() => document.getElementById('cat-image').click()}
                            >
                                {imagePreview ? (
                                    <Image src={imagePreview} fluid style={{ maxHeight: '150px' }} />
                                ) : (
                                    <div><FiUpload size={24} className="mb-2" /><p className="mb-0 small">Click to upload</p></div>
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
                    <Modal.Footer>
                        <Button variant="light" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            style={{ background: logoColors.gradient, border: 'none' }}
                        >
                            {isSubmitting ? 'Saving...' : 'Save Category'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
}
