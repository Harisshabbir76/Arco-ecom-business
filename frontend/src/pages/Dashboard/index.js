import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Container, Spinner, Button, Row, Col, Card, Nav } from 'react-bootstrap';
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
    FiImage,
    FiMenu,
    FiX,
    FiHome,
    FiBarChart2
} from 'react-icons/fi';

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

export default function Dashboard() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [user, setUser] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [stats, setStats] = useState({
        products: 0,
        orders: 0,
        messages: 0
    });

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
            if (window.innerWidth > 768) {
                setSidebarOpen(true);
            } else {
                setSidebarOpen(false);
            }
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/404');
                    return;
                }
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` }
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
        checkAuth();
    }, [navigate]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/dashboard/stats`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStats(response.data);
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        };
        fetchStats();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const menuItems = [
        { title: 'Dashboard', icon: FiHome, path: '/dashboard' },
        { title: 'Add Product', icon: FiPackage, path: '/dashboard/add-product' },
        { title: 'Catalog', icon: FiGrid, path: '/dashboard/catalog' },
        { title: 'Orders', icon: FiShoppingBag, path: '/dashboard/order-management' },
        { title: 'Messages', icon: FiMessageSquare, path: '/dashboard/contactus' },
        { title: 'Categories', icon: FiGrid, path: '/dashboard/categories' },
        { title: 'Hero Slider', icon: FiImage, path: '/dashboard/hero' },
        { title: 'Banners', icon: FiImage, path: '/dashboard/banners' },
        { title: 'Discounts', icon: FiTag, path: '/dashboard/discounts' },
        { title: 'Bundles', icon: FiBox, path: '/dashboard/bundles' },
        { title: 'Shipping', icon: FiTruck, path: '/dashboard/shipping' },
        { title: 'FAQs', icon: FiHelpCircle, path: '/dashboard/faqs' }
    ];

    const statItems = [
        { label: 'Total Products', value: stats.products, icon: FiPackage, color: C.red },
        { label: 'Total Orders', value: stats.orders, icon: FiShoppingBag, color: C.red },
        { label: 'Unread Messages', value: stats.messages, icon: FiMessageSquare, color: C.red },
    ];

    if (isLoading) {
        return (
            <div style={{ minHeight: '100vh', background: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="text-center">
                    <Spinner animation="border" style={{ color: C.red, width: '2.5rem', height: '2.5rem', borderWidth: '3px' }} />
                    <p style={{ fontFamily: 'Barlow, sans-serif', color: C.gray, marginTop: '1rem' }}>Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (!isAuthorized) {
        return (
            <div style={{ minHeight: '100vh', background: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Card className="border-0 shadow-sm text-center p-5" style={{ maxWidth: '400px', borderRadius: '12px', border: `1px solid ${C.border}` }}>
                    <div className="mb-4">
                        <FiShield size={48} style={{ color: C.red }} />
                    </div>
                    <h5 style={{ color: C.charcoal }}>Access Denied</h5>
                    <p style={{ color: C.gray, marginBottom: '2rem', fontSize: '0.9rem' }}>
                        You don't have permission to access this page.
                    </p>
                    <Button onClick={() => navigate('/')} style={{ background: C.gradient, border: 'none', padding: '0.6rem 2rem', borderRadius: '30px', fontSize: '0.9rem' }}>
                        Return Home
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;500;600;700&display=swap');
                * { font-family: 'Barlow', sans-serif; }
                .sidebar-item {
                    transition: all 0.2s ease;
                    cursor: pointer;
                }
                .sidebar-item:hover {
                    background: ${C.redLight};
                    padding-left: 1.5rem;
                }
                .sidebar-item.active {
                    background: ${C.redLight};
                    border-left: 3px solid ${C.red};
                    color: ${C.red};
                }
                .sidebar-item.active .sidebar-icon {
                    color: ${C.red};
                }
                .overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.5);
                    z-index: 998;
                }
                @media (max-width: 768px) {
                    .sidebar {
                        transform: translateX(-100%);
                        transition: transform 0.3s ease;
                    }
                    .sidebar.open {
                        transform: translateX(0);
                    }
                }
            `}</style>

            <div style={{ minHeight: '100vh', background: C.white, display: 'flex' }}>
                {/* Mobile Menu Button */}
                {isMobile && (
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        style={{
                            position: 'fixed',
                            top: '1rem',
                            left: '1rem',
                            zIndex: 1000,
                            background: C.gradient,
                            border: 'none',
                            borderRadius: '8px',
                            padding: '0.5rem',
                            color: C.white,
                            cursor: 'pointer'
                        }}
                    >
                        {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
                    </button>
                )}

                {/* Overlay for mobile */}
                {isMobile && sidebarOpen && <div className="overlay" onClick={() => setSidebarOpen(false)} />}

                {/* Sidebar */}
                <div className={`sidebar ${sidebarOpen ? 'open' : ''}`} style={{
                    width: '280px',
                    background: C.white,
                    borderRight: `1px solid ${C.border}`,
                    minHeight: '100vh',
                    position: isMobile ? 'fixed' : 'sticky',
                    top: 0,
                    left: 0,
                    zIndex: 999,
                    overflowY: 'auto'
                }}>
                    {/* Sidebar Header */}
                    <div style={{ padding: '1.5rem', borderBottom: `1px solid ${C.border}`, textAlign: 'center' }}>
                        <div style={{
                            width: '50px',
                            height: '50px',
                            background: C.gradient,
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 0.75rem'
                        }}>
                            <FiPackage size={24} color={C.white} />
                        </div>
                        <h5 style={{ color: C.charcoal, fontWeight: 600, marginBottom: '0.25rem' }}>Admin Panel</h5>
                        <p style={{ color: C.gray, fontSize: '0.75rem', marginBottom: 0 }}>{user?.name || 'Administrator'}</p>
                    </div>

                    {/* Navigation */}
                    <div style={{ padding: '1rem 0' }}>
                        {menuItems.map((item, index) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <div
                                    key={index}
                                    className={`sidebar-item ${isActive ? 'active' : ''}`}
                                    onClick={() => {
                                        navigate(item.path);
                                        if (isMobile) setSidebarOpen(false);
                                    }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '0.75rem 1.5rem',
                                        color: isActive ? C.red : C.gray,
                                        borderLeft: isActive ? `3px solid ${C.red}` : '3px solid transparent'
                                    }}
                                >
                                    <item.icon size={18} className="sidebar-icon" style={{ color: isActive ? C.red : C.gray }} />
                                    <span style={{ fontSize: '0.9rem', fontWeight: isActive ? 600 : 400 }}>{item.title}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Logout Button */}
                    <div style={{ padding: '1rem 1.5rem', borderTop: `1px solid ${C.border}`, marginTop: 'auto' }}>
                        <div
                            className="sidebar-item"
                            onClick={handleLogout}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                color: C.red
                            }}
                        >
                            <FiLogOut size={18} />
                            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Logout</span>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div style={{
                    flex: 1,
                    padding: isMobile ? '1rem' : '1.5rem',
                    marginTop: isMobile ? '3rem' : 0
                }}>
                    {/* Welcome Header */}
                    <div style={{ marginBottom: '2rem' }}>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: C.charcoal, marginBottom: '0.25rem' }}>
                            Welcome back, {user?.name?.split(' ')[0] || 'Admin'}
                        </h1>
                        <p style={{ color: C.gray, fontSize: '0.85rem' }}>Here's what's happening with your store today.</p>
                    </div>

                    {/* Stats Cards */}
                    <Row className="g-3 mb-4">
                        {statItems.map((item, index) => (
                            <Col key={index} xs={12} sm={6} md={4}>
                                <Card className="border-0 h-100" style={{
                                    borderRadius: '12px',
                                    border: `1px solid ${C.border}`,
                                    background: C.white
                                }}>
                                    <Card.Body className="p-3">
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div>
                                                <p style={{ color: C.gray, fontSize: '0.7rem', marginBottom: '0.25rem' }}>{item.label}</p>
                                                <h3 style={{ color: C.charcoal, fontSize: '1.5rem', fontWeight: 700, marginBottom: 0 }}>{item.value}</h3>
                                            </div>
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                background: C.redLight,
                                                borderRadius: '10px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <item.icon size={20} color={C.red} />
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    {/* Quick Actions */}
                    <div style={{ marginBottom: '1rem' }}>
                        <h6 style={{ color: C.gray, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quick Actions</h6>
                    </div>
                    <Row className="g-2">
                        <Col xs={6} sm={4} md={3}>
                            <div
                                onClick={() => navigate('/dashboard/add-product')}
                                style={{
                                    background: C.white,
                                    border: `1px solid ${C.border}`,
                                    borderRadius: '10px',
                                    padding: '1rem',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = C.red;
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = C.border;
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <FiPackage size={24} color={C.red} style={{ marginBottom: '0.5rem' }} />
                                <p style={{ color: C.charcoal, fontSize: '0.75rem', marginBottom: 0, fontWeight: 500 }}>Add Product</p>
                            </div>
                        </Col>
                        <Col xs={6} sm={4} md={3}>
                            <div
                                onClick={() => navigate('/dashboard/order-management')}
                                style={{
                                    background: C.white,
                                    border: `1px solid ${C.border}`,
                                    borderRadius: '10px',
                                    padding: '1rem',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = C.red;
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = C.border;
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <FiShoppingBag size={24} color={C.red} style={{ marginBottom: '0.5rem' }} />
                                <p style={{ color: C.charcoal, fontSize: '0.75rem', marginBottom: 0, fontWeight: 500 }}>View Orders</p>
                            </div>
                        </Col>
                        <Col xs={6} sm={4} md={3}>
                            <div
                                onClick={() => navigate('/dashboard/discounts')}
                                style={{
                                    background: C.white,
                                    border: `1px solid ${C.border}`,
                                    borderRadius: '10px',
                                    padding: '1rem',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = C.red;
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = C.border;
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <FiTag size={24} color={C.red} style={{ marginBottom: '0.5rem' }} />
                                <p style={{ color: C.charcoal, fontSize: '0.75rem', marginBottom: 0, fontWeight: 500 }}>Manage Discounts</p>
                            </div>
                        </Col>
                        <Col xs={6} sm={4} md={3}>
                            <div
                                onClick={() => navigate('/dashboard/contactus')}
                                style={{
                                    background: C.white,
                                    border: `1px solid ${C.border}`,
                                    borderRadius: '10px',
                                    padding: '1rem',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = C.red;
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = C.border;
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <FiMessageSquare size={24} color={C.red} style={{ marginBottom: '0.5rem' }} />
                                <p style={{ color: C.charcoal, fontSize: '0.75rem', marginBottom: 0, fontWeight: 500 }}>View Messages</p>
                            </div>
                        </Col>
                    </Row>

                    {/* Recent Activity Section */}
                    <div style={{ marginTop: '2rem' }}>
                        <div style={{ marginBottom: '1rem' }}>
                            <h6 style={{ color: C.gray, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recent Activity</h6>
                        </div>
                        <Card style={{ borderRadius: '12px', border: `1px solid ${C.border}`, background: C.white }}>
                            <Card.Body style={{ padding: '1rem' }}>
                                <div style={{ textAlign: 'center', padding: '2rem' }}>
                                    <FiBarChart2 size={32} color={C.gray} />
                                    <p style={{ color: C.gray, fontSize: '0.85rem', marginTop: '0.5rem' }}>Activity data will appear here</p>
                                </div>
                            </Card.Body>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}