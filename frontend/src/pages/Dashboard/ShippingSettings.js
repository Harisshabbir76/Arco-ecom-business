import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiArrowLeft, FiTruck, FiSave } from 'react-icons/fi';

const logoColors = {
    primary: '#fe7e8b',
    secondary: '#e65c70',
    light: '#ffd1d4',
    dark: '#d64555',
    background: '#fff5f6',
    gradient: 'linear-gradient(135deg, #fe7e8b 0%, #e65c70 100%)',
    softGradient: 'linear-gradient(135deg, #fff5f6 0%, #ffd1d4 100%)',
};

export default function ShippingSettings() {
    const navigate = useNavigate();
    const [shippingCharge, setShippingCharge] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/settings`);
                setShippingCharge(response.data.shippingCharge);
            } catch (error) {
                console.error('Error fetching settings:', error);
                setMessage({ type: 'danger', text: 'Failed to load settings.' });
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage({ type: '', text: '' });

        try {
            await axios.put(`${process.env.REACT_APP_API_URL}/api/settings`, {
                shippingCharge: parseFloat(shippingCharge)
            });
            setMessage({ type: 'success', text: 'Shipping charges updated successfully!' });
        } catch (error) {
            console.error('Error updating settings:', error);
            setMessage({ type: 'danger', text: 'Failed to update shipping charges.' });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <Container fluid className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', background: logoColors.background }}>
                <Spinner animation="border" style={{ color: logoColors.primary }} />
            </Container>
        );
    }

    return (
        <Container fluid style={{ background: logoColors.background, minHeight: '100vh', padding: '2rem' }}>
            <Container style={{ maxWidth: '800px' }}>
                <Button
                    variant="link"
                    onClick={() => navigate('/dashboard')}
                    className="mb-4 p-0 d-flex align-items-center text-decoration-none"
                    style={{ color: logoColors.primary }}
                >
                    <FiArrowLeft className="me-2" /> Back to Dashboard
                </Button>

                <Card className="border-0 shadow-lg" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                    <div style={{ background: logoColors.gradient, padding: '2rem', color: 'white' }}>
                        <div className="d-flex align-items-center mb-2">
                            <FiTruck size={32} className="me-3" />
                            <h2 className="mb-0">Shipping Settings</h2>
                        </div>
                        <p className="mb-0 opacity-75">Manage your delivery and shipping charges</p>
                    </div>

                    <Card.Body className="p-4">
                        {message.text && (
                            <Alert variant={message.type} className="mb-4" style={{ borderRadius: '12px' }}>
                                {message.text}
                            </Alert>
                        )}

                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-4">
                                <Form.Label style={{ fontWeight: '600', color: logoColors.dark }}>
                                    Default Shipping Charge (Rs.)
                                </Form.Label>
                                <Form.Control
                                    type="number"
                                    value={shippingCharge}
                                    onChange={(e) => setShippingCharge(e.target.value)}
                                    placeholder="Enter shipping amount"
                                    required
                                    min="0"
                                    style={{
                                        padding: '0.75rem',
                                        borderRadius: '10px',
                                        border: `1px solid ${logoColors.light}`
                                    }}
                                />
                                <Form.Text className="text-muted">
                                    This amount will be added to the total at checkout.
                                </Form.Text>
                            </Form.Group>

                            <Button
                                type="submit"
                                disabled={isSaving}
                                className="w-100 d-flex align-items-center justify-content-center"
                                style={{
                                    background: logoColors.gradient,
                                    border: 'none',
                                    padding: '0.75rem',
                                    borderRadius: '10px',
                                    fontWeight: '600',
                                    fontSize: '1.1rem',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                {isSaving ? (
                                    <Spinner animation="border" size="sm" className="me-2" />
                                ) : (
                                    <FiSave className="me-2" />
                                )}
                                {isSaving ? 'Updating...' : 'Save Settings'}
                            </Button>
                        </Form>
                    </Card.Body>
                </Card>
            </Container>
        </Container>
    );
}
