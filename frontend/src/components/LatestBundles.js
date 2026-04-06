import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { FaShoppingCart, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { useCart } from './CartContext';
import { useNavigate } from 'react-router-dom';

const logoColors = {
    primary: '#fe7e8b',
    secondary: '#e65c70',
    light: '#ffd1d4',
    background: '#fff5f6',
    gradient: 'linear-gradient(135deg, #fe7e8b 0%, #e65c70 100%)',
};

function BundleCard({ bundle, getProductImage, handleBundleClick, handleAddBundleToCart, handleBuyNow }) {
    return (
        <Card
            className="h-100 border-0"
            onClick={() => handleBundleClick(bundle._id)}
            style={{
                background: 'white',
                borderRadius: '12px',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                cursor: 'pointer',
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
            <div style={{ position: 'relative' }}>
                <div style={{
                    height: '160px',
                    display: 'flex',
                    padding: '0.5rem',
                    gap: '2px',
                    backgroundColor: '#f8f9fa'
                }}>
                    {(bundle.products || []).slice(0, 4).map((product, idx) => (
                        <div key={idx} style={{ flex: 1, overflow: 'hidden' }}>
                            <img
                                src={getProductImage(product)}
                                alt={product.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                            />
                        </div>
                    ))}
                </div>

                {bundle.originalPrice > bundle.bundlePrice && (
                    <div style={{
                        position: 'absolute', top: '10px', left: '10px',
                        background: logoColors.gradient, color: 'white',
                        padding: '4px 8px', borderRadius: '4px',
                        fontSize: '0.7rem', fontWeight: 'bold', zIndex: 1
                    }}>
                        {Math.round(100 - (bundle.bundlePrice / bundle.originalPrice) * 100)}% OFF
                    </div>
                )}

                <div style={{
                    position: 'absolute', top: '10px', right: '10px',
                    background: logoColors.primary, color: 'white',
                    padding: '4px 8px', borderRadius: '4px',
                    fontSize: '0.7rem', fontWeight: 'bold', zIndex: 1
                }}>
                    Bundle
                </div>
            </div>

            <Card.Body className="d-flex flex-column" style={{ padding: '0.85rem' }}>
                <Card.Title style={{
                    fontSize: '0.9rem', fontWeight: '600',
                    color: '#2D3748', marginBottom: '0.25rem'
                }}>
                    {bundle.name}
                </Card.Title>

                <span style={{
                    background: '#fff5f6', padding: '2px 6px',
                    borderRadius: '4px', fontSize: '0.65rem',
                    color: logoColors.primary, display: 'inline-block', marginBottom: '0.5rem'
                }}>
                    {(bundle.products?.length || 0)} Products
                </span>

                <div className="mt-auto">
                    <div className="mb-2">
                        {bundle.originalPrice > bundle.bundlePrice && (
                            <span className="text-muted text-decoration-line-through me-2" style={{ fontSize: '0.75rem' }}>
                                Rs. {bundle.originalPrice?.toLocaleString()}
                            </span>
                        )}
                        <span style={{ color: logoColors.primary, fontWeight: 'bold', fontSize: '1rem' }}>
                            Rs. {bundle.bundlePrice?.toLocaleString()}
                        </span>
                    </div>

                    <div className="d-flex gap-2">
                        <button
                            onClick={(e) => handleAddBundleToCart(e, bundle)}
                            className="btn w-50"
                            style={{
                                background: 'white', border: `1px solid ${logoColors.primary}`,
                                color: logoColors.primary, padding: '0.4rem',
                                borderRadius: '6px', fontSize: '0.75rem',
                                fontWeight: '500', cursor: 'pointer', transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => { e.target.style.background = logoColors.primary; e.target.style.color = 'white'; }}
                            onMouseLeave={(e) => { e.target.style.background = 'white'; e.target.style.color = logoColors.primary; }}
                        >
                            <FaShoppingCart className="me-1" size={10} />Cart
                        </button>
                        <button
                            onClick={(e) => handleBuyNow(e, bundle)}
                            className="btn w-50"
                            style={{
                                background: logoColors.gradient, color: 'white',
                                border: 'none', padding: '0.4rem',
                                borderRadius: '6px', fontSize: '0.75rem',
                                fontWeight: '500', cursor: 'pointer', transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => { e.target.style.opacity = '0.9'; e.target.style.transform = 'translateY(-1px)'; }}
                            onMouseLeave={(e) => { e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0)'; }}
                        >
                            Buy Now
                        </button>
                    </div>
                </div>
            </Card.Body>
        </Card>
    );
}

export default function LatestBundles() {
    const [bundles, setBundles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [slideDirection, setSlideDirection] = useState('right');
    const [animKey, setAnimKey] = useState(0);
    const itemsPerPage = 4;
    const { addToCart } = useCart();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLatestBundles = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/bundles/latest`);
                // Ensure we're setting an array
                const bundlesData = Array.isArray(res.data) ? res.data : (res.data?.bundles || []);
                setBundles(bundlesData);
            } catch (err) {
                console.error('Error fetching bundles:', err);
                setError('Failed to load bundles.');
                setBundles([]); // Set empty array on error
            } finally {
                setLoading(false);
            }
        };
        fetchLatestBundles();
    }, []);

    const totalPages = Math.ceil(bundles.length / itemsPerPage);
    const startIndex = currentPage * itemsPerPage;
    const visibleBundles = bundles.slice(startIndex, startIndex + itemsPerPage);

    const goToNextPage = () => {
        if (currentPage < totalPages - 1) {
            setSlideDirection('right');
            setAnimKey(k => k + 1);
            setCurrentPage(currentPage + 1);
        }
    };

    const goToPrevPage = () => {
        if (currentPage > 0) {
            setSlideDirection('left');
            setAnimKey(k => k + 1);
            setCurrentPage(currentPage - 1);
        }
    };

    const handleBundleClick = () => navigate('/bundles');

    const handleAddBundleToCart = (e, bundle) => {
        e.stopPropagation();
        addToCart({
            ...bundle,
            _id: `bundle_${bundle._id}`,
            isBundle: true,
            quantity: 1,
            price: bundle.bundlePrice,
            discountedPrice: bundle.bundlePrice,
            name: bundle.name,
            bundleProducts: bundle.products || [],
            image: bundle.image ? [bundle.image] : (bundle.products?.[0]?.image || [])
        });
    };

    const handleBuyNow = (e, bundle) => {
        e.stopPropagation();
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
                    bundleProducts: bundle.products || [],
                    image: bundle.image ? [bundle.image] : (bundle.products?.[0]?.image || [])
                }]
            }
        });
    };

    const getProductImage = (product) => {
        if (!product?.image?.[0]) return '/placeholder.jpg';
        if (product.image[0].startsWith('http')) return product.image[0];
        return `${process.env.REACT_APP_API_URL}${product.image[0].startsWith('/') ? '' : '/'}${product.image[0]}`;
    };

    if (loading) return (
        <Container className="text-center my-5 py-5">
            <Spinner animation="border" style={{ color: logoColors.primary }} />
        </Container>
    );

    if (error) return (
        <Container className="my-5">
            <Alert variant="danger">{error}</Alert>
        </Container>
    );

    if (!bundles || bundles.length === 0) return null;

    const arrowBtnStyle = {
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 10,
        background: 'transparent',
        border: '1.5px solid #ccc',
        color: '#999',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        fontSize: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
    };

    return (
        <div style={{ background: logoColors.background, padding: '3rem 0' }}>
            <style>{`
                .bundles-mobile-slider { display: none; }
                .bundles-desktop-grid  { display: block; }

                .bundles-row-animate {
                    animation: slideInRight 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
                }
                @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(50px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
                .bundles-row-animate-left {
                    animation: slideInLeft 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
                }
                @keyframes slideInLeft {
                    from { opacity: 0; transform: translateX(-50px); }
                    to   { opacity: 1; transform: translateX(0); }
                }

                .bundle-col-animate {
                    animation: cardPop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both;
                }
                .bundle-col-animate:nth-child(1) { animation-delay: 0ms; }
                .bundle-col-animate:nth-child(2) { animation-delay: 60ms; }
                .bundle-col-animate:nth-child(3) { animation-delay: 120ms; }
                .bundle-col-animate:nth-child(4) { animation-delay: 180ms; }
                @keyframes cardPop {
                    from { opacity: 0; transform: translateY(16px) scale(0.95); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }

                @media (max-width: 767px) {
                    .bundles-mobile-slider {
                        display: flex;
                        overflow-x: auto;
                        gap: 14px;
                        padding: 0.5rem 16px 1rem 16px;
                        scroll-snap-type: x mandatory;
                        scroll-behavior: smooth;
                        -webkit-overflow-scrolling: touch;
                        scrollbar-width: none;
                    }
                    .bundles-mobile-slider::-webkit-scrollbar { display: none; }
                    .bundle-slide-item {
                        flex: 0 0 72vw;
                        max-width: 260px;
                        scroll-snap-align: start;
                    }
                    .bundles-desktop-grid    { display: none; }
                    .bundles-pagination-dots { display: none !important; }
                }
            `}</style>

            <Container>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '2rem', color: '#2D3748', marginBottom: '0.5rem', fontWeight: '600' }}>
                        Latest <span style={{ color: logoColors.primary }}>Bundles</span>
                    </h2>
                    <p style={{ color: '#718096', fontSize: '1rem' }}>Great value product packages</p>
                </div>

                {/* Mobile slider */}
                <div className="bundles-mobile-slider">
                    {bundles.map((bundle) => (
                        <div key={bundle._id} className="bundle-slide-item">
                            <BundleCard
                                bundle={bundle}
                                getProductImage={getProductImage}
                                handleBundleClick={handleBundleClick}
                                handleAddBundleToCart={handleAddBundleToCart}
                                handleBuyNow={handleBuyNow}
                            />
                        </div>
                    ))}
                </div>

                {/* Desktop paginated grid */}
                <div className="bundles-desktop-grid" style={{ position: 'relative', padding: '0 50px' }}>
                    {totalPages > 1 && currentPage > 0 && (
                        <button
                            onClick={goToPrevPage}
                            style={{ ...arrowBtnStyle, left: '0' }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#f0f0f0';
                                e.currentTarget.style.color = '#666';
                                e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = '#999';
                                e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                            }}
                        >
                            <FaArrowLeft />
                        </button>
                    )}

                    {totalPages > 1 && currentPage < totalPages - 1 && (
                        <button
                            onClick={goToNextPage}
                            style={{ ...arrowBtnStyle, right: '0' }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#f0f0f0';
                                e.currentTarget.style.color = '#666';
                                e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = '#999';
                                e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                            }}
                        >
                            <FaArrowRight />
                        </button>
                    )}

                    <Row
                        key={animKey}
                        xs={1} sm={2} md={3} lg={4}
                        className={`g-4 ${slideDirection === 'right' ? 'bundles-row-animate' : 'bundles-row-animate-left'}`}
                    >
                        {visibleBundles.map((bundle) => (
                            <Col key={bundle._id} className="bundle-col-animate">
                                <BundleCard
                                    bundle={bundle}
                                    getProductImage={getProductImage}
                                    handleBundleClick={handleBundleClick}
                                    handleAddBundleToCart={handleAddBundleToCart}
                                    handleBuyNow={handleBuyNow}
                                />
                            </Col>
                        ))}
                    </Row>
                </div>

                {/* Pagination Dots */}
                {totalPages > 1 && (
                    <div className="bundles-pagination-dots" style={{
                        display: 'flex', justifyContent: 'center',
                        gap: '8px', marginTop: '2rem'
                    }}>
                        {Array.from({ length: totalPages }).map((_, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    setSlideDirection(index > currentPage ? 'right' : 'left');
                                    setAnimKey(k => k + 1);
                                    setCurrentPage(index);
                                }}
                                style={{
                                    width: '8px', height: '8px', borderRadius: '50%',
                                    border: 'none', cursor: 'pointer', padding: 0,
                                    transition: 'all 0.3s ease',
                                    background: index === currentPage ? logoColors.primary : '#ddd',
                                    transform: index === currentPage ? 'scale(1.2)' : 'scale(1)'
                                }}
                            />
                        ))}
                    </div>
                )}

                {/* View All */}
                {bundles.length > 0 && (
                    <div className="text-center mt-4">
                        <button
                            onClick={() => navigate('/bundles')}
                            style={{
                                background: 'transparent', border: `2px solid ${logoColors.primary}`,
                                color: logoColors.primary, padding: '0.6rem 2rem',
                                borderRadius: '8px', fontSize: '0.9rem',
                                fontWeight: 500, cursor: 'pointer', transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => { e.target.style.background = logoColors.primary; e.target.style.color = 'white'; }}
                            onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = logoColors.primary; }}
                        >
                            View All Bundles
                        </button>
                    </div>
                )}
            </Container>
        </div>
    );
}