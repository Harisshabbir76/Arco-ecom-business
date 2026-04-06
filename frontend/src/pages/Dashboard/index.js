import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Spinner, Button, Row, Col, Card } from 'react-bootstrap';
import {
    FiLogOut,
    FiPackage,
    FiShoppingBag,
    FiMessageSquare,
    FiGrid,
    FiUser,
    FiLock,
    FiShield,
    FiTruck,
    FiTag,
    FiBox,
    FiHelpCircle,
    FiImage
} from 'react-icons/fi';

// Navbar color palette - Minimal version
const logoColors = {
    primary: '#fe7e8b',
    light: '#ffd1d4',
    dark: '#d64555',
    background: '#fff9fa',
    gradient: 'linear-gradient(135deg, #fe7e8b 0%, #e65c70 100%)',
    softGradient: 'linear-gradient(135deg, #fff5f6 0%, #ffd1d4 100%)',
};

export default function Dashboard() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({
        products: 0,
        orders: 0,
        messages: 0
    });

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem('token');

                if (!token) {
                    navigate('/404');
                    return;
                }

                const response = await axios.get(`${process.env.REACT_APP_API_URL}/auth/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (response.data.user?.email === '05harisshabbir@gmail.com') {
                    setIsAuthorized(true);
                    setUser(response.data.user);
                } else {
                    navigate('/404');
                }
            } catch (error) {
                console.error('Authentication error:', error);
                localStorage.removeItem('token');
                navigate('/404');
            } finally {
                setIsLoading(false);
            }
        };

        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/dashboard/stats`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setStats(response.data);
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        };

        checkAuth();
        fetchStats();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    if (isLoading) {
        return (
            <Container
                fluid
                className="d-flex justify-content-center align-items-center"
                style={{
                    minHeight: '100vh',
                    background: logoColors.background
                }}
            >
                <div className="text-center">
                    <Spinner
                        animation="border"
                        style={{ color: logoColors.primary }}
                    />
                    <p className="mt-3" style={{ color: '#666' }}>Loading dashboard...</p>
                </div>
            </Container>
        );
    }

    if (!isAuthorized) {
        return (
            <Container
                fluid
                className="d-flex justify-content-center align-items-center"
                style={{
                    minHeight: '100vh',
                    background: logoColors.background
                }}
            >
                <Card
                    className="border-0 shadow-sm text-center p-5"
                    style={{
                        maxWidth: '400px',
                        borderRadius: '12px'
                    }}
                >
                    <div className="mb-4">
                        <FiShield size={48} style={{ color: logoColors.light }} />
                    </div>
                    <h5 style={{ color: logoColors.dark }}>Access Denied</h5>
                    <p style={{ color: '#666', marginBottom: '2rem', fontSize: '0.9rem' }}>
                        You don't have permission to access this page.
                    </p>
                    <Button
                        variant="primary"
                        onClick={() => navigate('/')}
                        style={{
                            background: logoColors.gradient,
                            border: 'none',
                            padding: '0.6rem 2rem',
                            borderRadius: '6px',
                            fontSize: '0.9rem'
                        }}
                    >
                        Return Home
                    </Button>
                </Card>
            </Container>
        );
    }

    const dashboardItems = [
        {
            title: 'Add Product',
            icon: <FiPackage size={20} />,
            path: '/dashboard/add-product',
            description: 'Create new product'
        },
        {
            title: 'Orders',
            icon: <FiShoppingBag size={20} />,
            path: '/dashboard/order-management',
            description: 'Manage orders'
        },
        {
            title: 'Messages',
            icon: <FiMessageSquare size={20} />,
            path: '/dashboard/contactus',
            description: 'Customer inquiries'
        },
        {
            title: 'Catalog',
            icon: <FiGrid size={20} />,
            path: '/dashboard/catalog',
            description: 'Product catalog'
        },
        {
            title: 'Shipping',
            icon: <FiTruck size={20} />,
            path: '/dashboard/shipping',
            description: 'Delivery settings'
        },
        {
            title: 'Categories',
            icon: <FiGrid size={20} />,
            path: '/dashboard/categories',
            description: 'Manage categories'
        },
        {
            title: 'Hero Slider',
            icon: <FiGrid size={20} />,
            path: '/dashboard/hero',
            description: 'Home page slider'
        },
        {
            title: 'Discounts',
            icon: <FiTag size={20} />,
            path: '/dashboard/discounts',
            description: 'Coupons & offers'
        },
        {
            title: 'Bundles',
            icon: <FiBox size={20} />,
            path: '/dashboard/bundles',
            description: 'Product bundles'
        },
        {
            title: 'FAQs',
            icon: <FiHelpCircle size={20} />,
            path: '/dashboard/faqs',
            description: 'Frequently asked questions'
        },
        {
            title: 'Banner',
            icon: <FiImage size={20} />,
            path: '/dashboard/banners',
            description: 'Manage site banners'
        }
    ];

    const statItems = [
        { label: 'Products', value: stats.products, icon: FiPackage },
        { label: 'Orders', value: stats.orders, icon: FiShoppingBag },
        { label: 'Messages', value: stats.messages, icon: FiMessageSquare },
        { label: 'Security', value: 'High', icon: FiLock }
    ];

    return (
        <Container fluid style={{ background: logoColors.background, minHeight: '100vh' }}>
            {/* Simple Header */}
            <div style={{
                background: 'white',
                borderBottom: '1px solid rgba(0,0,0,0.05)',
                padding: '1rem 0'
            }}>
                <Container>
                    <Row className="align-items-center">
                        <Col xs={6}>
                            <h6 style={{ color: logoColors.dark, margin: 0 }}>Dashboard</h6>
                        </Col>
                        <Col xs={6} className="text-end">
                            <Button
                                variant="link"
                                onClick={handleLogout}
                                className="p-0"
                                style={{
                                    color: logoColors.primary,
                                    textDecoration: 'none',
                                    fontSize: '0.9rem'
                                }}
                            >
                                <FiLogOut className="me-1" size={14} />
                                Logout
                            </Button>
                        </Col>
                    </Row>
                </Container>
            </div>

            <Container className="py-4">
                {/* Welcome Text - Minimal */}
                <Row className="mb-4">
                    <Col>
                        <p style={{ color: '#999', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                            Welcome back,
                        </p>
                        <h5 style={{ color: logoColors.dark, fontWeight: '500' }}>
                            {user?.name || 'Admin'}
                        </h5>
                    </Col>
                </Row>

                {/* Stats Cards - Minimal */}
                <Row className="g-3 mb-4">
                    {statItems.map((item, index) => (
                        <Col key={index} xs={6} md={3}>
                            <Card className="border-0 h-100" style={{
                                background: 'white',
                                borderRadius: '8px',
                                boxShadow: 'none'
                            }}>
                                <Card.Body className="p-3">
                                    <div className="d-flex align-items-center mb-2">
                                        <item.icon size={14} style={{ color: logoColors.light, marginRight: '0.5rem' }} />
                                        <span style={{ color: '#666', fontSize: '0.75rem' }}>{item.label}</span>
                                    </div>
                                    <h4 style={{
                                        color: logoColors.dark,
                                        fontSize: '1.3rem',
                                        fontWeight: '500',
                                        margin: 0
                                    }}>
                                        {item.value}
                                    </h4>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>

                {/* Section Label */}
                <Row className="mb-3">
                    <Col>
                        <p style={{ color: '#999', fontSize: '0.75rem', margin: 0 }}>
                            MANAGEMENT
                        </p>
                    </Col>
                </Row>

                {/* Dashboard Items - Minimal Grid */}
                <Row className="g-2">
                    {dashboardItems.map((item, index) => (
                        <Col key={index} xs={6} md={4}>
                            <Card
                                className="border-0 h-100"
                                style={{
                                    background: 'white',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = logoColors.softGradient;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'white';
                                }}
                                onClick={() => navigate(item.path)}
                            >
                                <Card.Body className="p-3">
                                    <div className="d-flex align-items-center mb-2">
                                        <div
                                            className="d-flex align-items-center justify-content-center rounded-circle"
                                            style={{
                                                background: logoColors.softGradient,
                                                width: '24px',
                                                height: '24px',
                                                marginRight: '0.5rem'
                                            }}
                                        >
                                            {React.cloneElement(item.icon, {
                                                size: 12,
                                                style: { color: logoColors.primary }
                                            })}
                                        </div>
                                        <h6 style={{
                                            color: logoColors.dark,
                                            fontSize: '0.85rem',
                                            fontWeight: '500',
                                            margin: 0
                                        }}>
                                            {item.title}
                                        </h6>
                                    </div>
                                    <p style={{
                                        color: '#999',
                                        fontSize: '0.7rem',
                                        margin: 0,
                                        paddingLeft: '2rem'
                                    }}>
                                        {item.description}
                                    </p>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>

                {/* Quick Actions Label */}
                <Row className="mt-4 mb-2">
                    <Col>
                        <p style={{ color: '#999', fontSize: '0.75rem', margin: 0 }}>
                            QUICK ACTIONS
                        </p>
                    </Col>
                </Row>

            </Container>
        </Container>
    );
}