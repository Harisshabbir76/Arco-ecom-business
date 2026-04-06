import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Spinner, Alert, Badge } from 'react-bootstrap';
import { FaShoppingCart, FaStar } from 'react-icons/fa';
import { useCart } from '../components/CartContext';
import { useNavigate } from 'react-router-dom';

// Navbar color palette
const logoColors = {
    primary: '#fe7e8b',
    secondary: '#e65c70',
    light: '#ffd1d4',
    dark: '#d64555',
    background: '#fff5f6',
    lighterBg: '#fff9fa',
    gradient: 'linear-gradient(135deg, #fe7e8b 0%, #e65c70 100%)',
    softGradient: 'linear-gradient(135deg, #fff5f6 0%, #ffe0e3 100%)',
};


export default function BundlesPage() {
    const [bundles, setBundles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { addToCart } = useCart();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBundles = async () => {
            try {
                setLoading(true);
                // Fetch all bundles - backend handles filtering by timeline
                const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/bundles`);
                setBundles(res.data);
            } catch (err) {
                console.error('Error fetching bundles:', err);
                setError('Failed to load bundles.');
            } finally {
                setLoading(false);
            }
        };

        fetchBundles();
    }, []);

    const handleAddBundleToCart = (bundle) => {
        // Add bundle as single cart item using bundlePrice
        const bundleItem = {
            ...bundle,
            _id: `bundle_${bundle._id}`,
            isBundle: true,
            quantity: 1,
            price: bundle.bundlePrice,
            discountedPrice: bundle.bundlePrice,
            name: bundle.name,
            bundleProducts: bundle.products,
            image: bundle.image ? [bundle.image] : bundle.products[0]?.image || []
        };
        addToCart(bundleItem);
    };

    const getProductImage = (product) => {
        if (!product?.image?.[0]) return '/placeholder.jpg';
        if (product.image[0].startsWith('http')) return product.image[0];
        return `${process.env.REACT_APP_API_URL}${product.image[0].startsWith('/') ? '' : '/'}${product.image[0]}`;
    };

    // Check if bundle is currently active based on timeline
    const isBundleActive = (bundle) => {
        if (!bundle.isActive) return false;
        if (bundle.isLifetime) return true;

        const now = new Date();
        const afterStart = !bundle.startDate || now >= new Date(bundle.startDate);
        const beforeEnd = !bundle.endDate || now <= new Date(bundle.endDate);
        return afterStart && beforeEnd;
    };

    if (loading) {
        return (
            <Container fluid className="d-flex justify-content-center align-items-center" style={{ 
                minHeight: '100vh',
                background: logoColors.background 
            }}>
                <div className="text-center">
                    <Spinner animation="border" style={{ color: logoColors.primary }} />
                    <p className="mt-3" style={{ color: '#4A5568' }}>Loading bundles...</p>
                </div>
            </Container>
        );
    }

    if (error) {
        return (
            <Container fluid style={{ background: logoColors.background, minHeight: '100vh' }}>
                <Container className="py-5">
                    <Alert variant="danger" className="text-center" style={{ borderRadius: '12px' }}>
                        {error}
                    </Alert>
                </Container>
            </Container>
        );
    }

    // Filter to only show active bundles
    const activeBundles = bundles.filter(bundle => isBundleActive(bundle));

    return (
        <Container fluid className="py-4" style={{ background: logoColors.background, minHeight: '100vh' }}>
            <Container>
                <div className="page-header-wrapper mb-4 mb-md-5 text-center">
                    <h1 className="page-header" style={{ color: logoColors.dark }}>
                        Product Bundles
                    </h1>
                    <p style={{ color: '#718096', fontSize: '1rem', marginTop: '0.5rem' }}>
                        Great value packages - Save more with bundles
                    </p>

                    {/* Decorative line under header */}
                    <div style={{
                        height: '2px',
                        background: `linear-gradient(90deg, transparent, ${logoColors.primary}40, transparent)`,
                        width: '150px',
                        margin: '1rem auto 0 auto'
                    }} />
                </div>

                {activeBundles.length === 0 ? (
                    <div className="text-center my-5 py-5">
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: logoColors.softGradient,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem'
                        }}>
                            <FaShoppingCart size={32} style={{ color: logoColors.primary }} />
                        </div>
                        <h4 style={{ color: logoColors.dark, marginBottom: '0.5rem' }}>
                            No Bundles Available
                        </h4>
                        <p style={{ color: '#718096', fontSize: '1rem', maxWidth: '400px', margin: '0 auto' }}>
                            Check back later for exciting product bundles!
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Mobile view */}
                        <div className="d-block d-md-none">
                            <Row xs={1} className="g-3">
                                {activeBundles.map(bundle => (
                                    <Col key={bundle._id}>
                                        <BundleCard 
                                            bundle={bundle} 
                                            onAddToCart={handleAddBundleToCart}
                                            getProductImage={getProductImage}
                                            logoColors={logoColors}
                                            navigate={navigate} // Pass navigate to BundleCard
                                        />
                                    </Col>
                                ))}
                            </Row>
                        </div>

                        {/* Tablet/Desktop view */}
                        <div className="d-none d-md-block">
                            <Row xs={1} sm={2} md={3} className="g-4">
                                {activeBundles.map(bundle => (
                                    <Col key={bundle._id}>
                                        <BundleCard 
                                            bundle={bundle} 
                                            onAddToCart={handleAddBundleToCart}
                                            getProductImage={getProductImage}
                                            logoColors={logoColors}
                                            navigate={navigate} // Pass navigate to BundleCard
                                        />
                                    </Col>
                                ))}
                            </Row>
                        </div>
                    </>
                )}
            </Container>
        </Container>
    );
}

// Separate Bundle Card component for cleaner code
const BundleCard = ({ bundle, onAddToCart, getProductImage, logoColors, navigate }) => { // Added navigate prop
    return (
        <Card 
            className="product-card h-100 border-0"
            style={{
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
            }}
        >
            <div className="product-image-container" style={{ position: 'relative' }}>
                {/* Collage of product images */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: bundle.products?.length > 1 ? '1fr 1fr' : '1fr',
                    height: '200px',
                    gap: '2px',
                    backgroundColor: '#f5f5f5'
                }}>
                    {bundle.products?.slice(0, 4).map((product, idx) => (
                        <div
                            key={idx}
                            style={{
                                position: 'relative',
                                overflow: 'hidden',
                                height: bundle.products?.length > 2 && idx < 2 ? '100px' : '200px'
                            }}
                        >
                            <img
                                src={getProductImage(product)}
                                alt={product.name}
                                style={{
                                    width: '100%',
                                    height: '100%',
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
                        </div>
                    ))}
                </div>
                
                {/* Discount Badge */}
                {bundle.originalPrice > bundle.bundlePrice && (
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
                        {Math.round(100 - (bundle.bundlePrice / bundle.originalPrice) * 100)}% OFF
                    </div>
                )}

                {/* Bundle Badge */}
                <Badge
                    style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        padding: '4px 8px',
                        fontSize: '0.7rem',
                        zIndex: 1,
                        background: logoColors.primary,
                        border: 'none'
                    }}
                >
                    Bundle
                </Badge>
            </div>

            <Card.Body className="d-flex flex-column" style={{ padding: '1rem' }}>
                <Card.Title style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#2D3748',
                    marginBottom: '0.25rem'
                }}>
                    {bundle.name}
                </Card.Title>
                
                {bundle.description && (
                    <Card.Text style={{
                        fontSize: '0.85rem',
                        color: '#718096',
                        marginBottom: '0.5rem'
                    }}>
                        {bundle.description}
                    </Card.Text>
                )}

                {/* Product tags */}
                <div className="d-flex flex-wrap gap-1 mb-2">
                    {bundle.products?.map((product, idx) => (
                        <span
                            key={idx}
                            style={{
                                background: logoColors.softGradient,
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '0.65rem',
                                color: logoColors.dark
                            }}
                        >
                            {product.name?.split(' ').slice(0, 2).join(' ')}
                        </span>
                    ))}
                </div>

                <div className="mt-auto">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <div className="price">
                            {bundle.originalPrice > bundle.bundlePrice && (
                                <span className="original-price text-muted text-decoration-line-through me-2" style={{ fontSize: '0.8rem' }}>
                                    Rs. {bundle.originalPrice?.toLocaleString()}
                                </span>
                            )}
                            <span className="current-price fw-bold" style={{ color: logoColors.primary, fontSize: '1.1rem' }}>
                                Rs. {bundle.bundlePrice?.toLocaleString()}
                            </span>
                        </div>
                        <div className="rating" style={{ fontSize: '0.85rem', color: '#38A169' }}>
                            Save Rs. {(bundle.originalPrice - bundle.bundlePrice)?.toLocaleString()}
                        </div>
                    </div>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onAddToCart(bundle);
                        }}
                        className="w-100 mt-2 mb-1"
                        style={{
                            background: 'white',
                            color: logoColors.primary,
                            border: `2px solid ${logoColors.primary}`,
                            padding: '0.6rem',
                            borderRadius: '8px',
                            fontSize: '0.85rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = logoColors.primary;
                            e.target.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = 'white';
                            e.target.style.color = logoColors.primary;
                        }}
                    >
                        <FaShoppingCart className="me-2" />
                        Add to Cart
                    </button>
                    <button
                        onClick={() => {
                            // Order Now - navigate with state (no URL param)
                            navigate('/checkout', {
                                state: {
                                    products: [{
                                        ...bundle,
                                        _id: `bundle_${bundle._id}`,
                                        isBundle: true,
                                        quantity: 1,
                                        price: bundle.bundlePrice,
                                        discountedPrice: bundle.bundlePrice,
                                        name: bundle.name,
                                        bundleProducts: bundle.products,
                                        image: bundle.image ? [bundle.image] : bundle.products[0]?.image || []
                                    }]
                                }
                            });
                        }}
                        className="w-100"
                        style={{
                            background: logoColors.gradient,
                            color: 'white',
                            border: 'none',
                            padding: '0.6rem',
                            borderRadius: '8px',
                            fontSize: '0.85rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.opacity = '0.9';
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = `0 4px 12px ${logoColors.primary}40`;
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.opacity = '1';
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = 'none';
                        }}
                    >
                        Order Now
                    </button>
                </div>
            </Card.Body>
        </Card>
    );
};