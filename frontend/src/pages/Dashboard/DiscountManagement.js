import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Table, Button, Form, Modal, Card, Spinner, Alert, Row, Col, Badge } from 'react-bootstrap';
import { FiPlus, FiEdit2, FiTrash2, FiInfo } from 'react-icons/fi';

const logoColors = {
    primary: '#fe7e8b',
    light: '#ffd1d4',
    dark: '#d64555',
    background: '#fff9fa',
    gradient: 'linear-gradient(135deg, #fe7e8b 0%, #e65c70 100%)',
    softGradient: 'linear-gradient(135deg, #fff5f6 0%, #ffd1d4 100%)',
};

export default function DiscountManagement() {
    const [discounts, setDiscounts] = useState([]);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingDiscount, setEditingDiscount] = useState(null);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        code: '',
        type: 'COUPON',
        description: '',
        discountPercent: '',
        minAmount: '',
        buyQty: '',
        getQty: '',
        targetProducts: [],
        targetCategories: [],
        isActive: true
    });

    const fetchData = async () => {
        try {
            const [discRes, prodRes, catRes] = await Promise.all([
                axios.get(`${process.env.REACT_APP_API_URL}/api/discounts`),
                axios.get(`${process.env.REACT_APP_API_URL}/catalog`),
                axios.get(`${process.env.REACT_APP_API_URL}/api/categories`)
            ]);
            setDiscounts(discRes.data);
            setProducts(Array.isArray(prodRes.data) ? prodRes.data : (prodRes.data.products || []));
            setCategories(catRes.data || []);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenModal = (discount = null) => {
        if (discount) {
            setEditingDiscount(discount);
            setFormData({
                ...discount,
                targetProducts: discount.targetProducts || [],
                targetCategories: discount.targetCategories || []
            });
        } else {
            setEditingDiscount(null);
            setFormData({
                code: '',
                type: 'COUPON',
                description: '',
                discountPercent: '',
                minAmount: '',
                buyQty: '',
                getQty: '',
                targetProducts: [],
                targetCategories: [],
                isActive: true
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            if (editingDiscount) {
                await axios.put(`${process.env.REACT_APP_API_URL}/api/discounts/${editingDiscount._id}`, formData);
            } else {
                await axios.post(`${process.env.REACT_APP_API_URL}/api/discounts`, formData);
            }
            fetchData();
            setShowModal(false);
        } catch (err) {
            setError('Failed to save discount');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this discount?')) {
            try {
                await axios.delete(`${process.env.REACT_APP_API_URL}/api/discounts/${id}`);
                fetchData();
            } catch (err) {
                setError('Failed to delete discount');
            }
        }
    };

    if (isLoading) return <div className="text-center py-5"><Spinner animation="border" style={{ color: logoColors.primary }} /></div>;

    return (
        <Container className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 style={{ color: logoColors.dark }}>Discount & Coupon Management</h4>
                <Button onClick={() => handleOpenModal()} style={{ background: logoColors.gradient, border: 'none' }}>
                    <FiPlus className="me-2" /> Add Discount
                </Button>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                    <Table responsive hover className="mb-0">
                        <thead style={{ background: logoColors.background }}>
                            <tr>
                                <th className="ps-4">Code/Name</th>
                                <th>Type</th>
                                <th>Details</th>
                                <th>Status</th>
                                <th className="text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {discounts.map((disc) => (
                                <tr key={disc._id}>
                                    <td className="ps-4 align-middle">
                                        <div className="fw-bold" style={{ color: logoColors.dark }}>{disc.code || 'Auto-Offer'}</div>
                                        <small className="text-muted">{disc.description}</small>
                                    </td>
                                    <td className="align-middle">
                                        <Badge bg="light" text="dark" style={{ border: `1px solid ${logoColors.light}` }}>
                                            {disc.type.replace(/_/g, ' ')}
                                        </Badge>
                                    </td>
                                    <td className="align-middle">
                                        {disc.type === 'COUPON' && `${disc.discountPercent}% OFF`}
                                        {disc.type === 'SPEND_X_GET_Y' && `Min $${disc.minAmount} -> ${disc.discountPercent}% OFF`}
                                        {disc.type === 'BUY_X_GET_Y' && `Buy ${disc.buyQty} Get ${disc.getQty} FREE`}
                                    </td>
                                    <td className="align-middle">
                                        <Badge bg={disc.isActive ? 'success' : 'secondary'}>
                                            {disc.isActive ? 'Active' : 'Disabled'}
                                        </Badge>
                                    </td>
                                    <td className="text-end pe-4 align-middle">
                                        <Button variant="link" onClick={() => handleOpenModal(disc)} style={{ color: logoColors.primary }}>
                                            <FiEdit2 />
                                        </Button>
                                        <Button variant="link" onClick={() => handleDelete(disc._id)} style={{ color: '#E53E3E' }}>
                                            <FiTrash2 />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title style={{ color: logoColors.dark }}>{editingDiscount ? 'Edit Discount' : 'Add New Discount'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Discount Type</Form.Label>
                                    <Form.Select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option value="COUPON">Coupon (Code Required)</option>
                                        <option value="SPEND_X_GET_Y">Spend X Get Y (Automatic)</option>
                                        <option value="BUY_X_GET_Y">Buy X Get Y (Bundle)</option>
                                    </Form.Select>
                                </Form.Group>

                                {formData.type === 'COUPON' && (
                                    <Form.Group className="mb-3">
                                        <Form.Label>Coupon Code</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="e.g. SUMMER25"
                                            value={formData.code}
                                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                            required
                                        />
                                    </Form.Group>
                                )}

                                <Form.Group className="mb-3">
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </Form.Group>

                                <Row>
                                    {(formData.type === 'COUPON' || formData.type === 'SPEND_X_GET_Y') && (
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Discount %</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    value={formData.discountPercent}
                                                    onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                                                    required
                                                />
                                            </Form.Group>
                                        </Col>
                                    )}
                                    {formData.type === 'SPEND_X_GET_Y' && (
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Minimum Spend ($)</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    value={formData.minAmount}
                                                    onChange={(e) => setFormData({ ...formData, minAmount: e.target.value })}
                                                    required
                                                />
                                            </Form.Group>
                                        </Col>
                                    )}
                                    {formData.type === 'BUY_X_GET_Y' && (
                                        <>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Buy Quantity</Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        value={formData.buyQty}
                                                        onChange={(e) => setFormData({ ...formData, buyQty: e.target.value })}
                                                        required
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Get Quantity Free</Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        value={formData.getQty}
                                                        onChange={(e) => setFormData({ ...formData, getQty: e.target.value })}
                                                        required
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </>
                                    )}
                                </Row>

                                <Form.Check
                                    type="switch"
                                    className="mt-3"
                                    label="Is Active"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                />
                            </Col>

                            <Col md={6}>
                                <Card className="bg-light border-0">
                                    <Card.Body>
                                        <h6 className="mb-3 d-flex align-items-center">
                                            <FiInfo className="me-2" /> Targeting (Optional)
                                        </h6>

                                        <Form.Group className="mb-3">
                                            <Form.Label className="small">Target Categories</Form.Label>
                                            <div style={{ maxHeight: '120px', overflowY: 'auto' }} className="border rounded p-2 bg-white">
                                                {categories.map(cat => (
                                                    <Form.Check
                                                        key={cat._id}
                                                        type="checkbox"
                                                        label={cat.name}
                                                        checked={formData.targetCategories.includes(cat.name)}
                                                        onChange={(e) => {
                                                            const newCats = e.target.checked
                                                                ? [...formData.targetCategories, cat.name]
                                                                : formData.targetCategories.filter(c => c !== cat.name);
                                                            setFormData({ ...formData, targetCategories: newCats });
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        </Form.Group>

                                        <Form.Group className="mb-0">
                                            <Form.Label className="small">Target Products</Form.Label>
                                            <div style={{ maxHeight: '150px', overflowY: 'auto' }} className="border rounded p-2 bg-white">
                                                {products.map(prod => (
                                                    <Form.Check
                                                        key={prod._id}
                                                        type="checkbox"
                                                        label={prod.name}
                                                        checked={formData.targetProducts.includes(prod._id)}
                                                        onChange={(e) => {
                                                            const newProds = e.target.checked
                                                                ? [...formData.targetProducts, prod._id]
                                                                : formData.targetProducts.filter(p => p !== prod._id);
                                                            setFormData({ ...formData, targetProducts: newProds });
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        </Form.Group>
                                        <small className="text-muted mt-2 d-block">
                                            Leave both empty to apply discount to all products.
                                        </small>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="light" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting} style={{ background: logoColors.gradient, border: 'none' }}>
                            {isSubmitting ? 'Saving...' : 'Save Discount'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
}
