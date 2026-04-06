import React, { useContext } from 'react';
import { CartContext } from './CartContext';
import { Button, Table, Container, Row, Col, Card } from 'react-bootstrap';
import { FaBox, FaShoppingCart, FaTrashAlt, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './heroSlider.css';

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

export default function Cart() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    cartTotal,
    cartCount,
    clearCart
  } = useContext(CartContext);

  if (cartCount === 0) {
    return (
      <div style={{ minHeight: '100vh', background: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Container>
          <div className="text-center" style={{ maxWidth: '500px', margin: '0 auto' }}>
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: C.redLight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem'
            }}>
              <FaShoppingCart size={48} color={C.red} />
            </div>
            <h2 style={{ fontFamily: 'Barlow, sans-serif', color: C.charcoal, marginBottom: '1rem' }}>
              Your cart is empty
            </h2>
            <p style={{ color: C.gray, marginBottom: '2rem' }}>
              Looks like you haven't added any items to your cart yet.
            </p>
            <Link
              to="/catalog"
              style={{
                background: C.gradient,
                color: C.white,
                border: 'none',
                padding: '0.75rem 2rem',
                borderRadius: '30px',
                fontWeight: 600,
                fontSize: '1rem',
                textDecoration: 'none',
                display: 'inline-block',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.opacity = '0.9';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = `0 4px 12px ${C.red}40`;
              }}
              onMouseLeave={(e) => {
                e.target.style.opacity = '1';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              Continue Shopping
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;500;600;700&display=swap');
        
        .cart-page {
          min-height: 100vh;
          background: ${C.white};
          font-family: 'Barlow', sans-serif;
        }

        .cart-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .quantity-input {
          width: 70px;
          padding: 0.5rem;
          border: 1px solid ${C.border};
          border-radius: 8px;
          text-align: center;
          font-family: 'Barlow', sans-serif;
          font-size: 0.9rem;
          outline: none;
          transition: border-color 0.2s ease;
        }
        .quantity-input:focus {
          border-color: ${C.red};
        }

        .cart-table th {
          font-family: 'Barlow', sans-serif;
          font-weight: 600;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 1rem;
        }

        .cart-table td {
          padding: 1rem;
          vertical-align: middle;
        }

        .cart-table tbody tr:hover {
          background: ${C.redLight};
        }
      `}</style>

      <div className="cart-page" style={{ padding: '2rem 0' }}>
        <Container className="cart-container">
          {/* Header */}
          <div className="mb-4">
            <h1 style={{ 
              fontFamily: 'Barlow, sans-serif', 
              fontSize: '1.75rem', 
              fontWeight: 700, 
              color: C.charcoal,
              marginBottom: '0.5rem'
            }}>
              Shopping Cart
            </h1>
            <div style={{
              height: '3px',
              width: '60px',
              background: C.red,
              borderRadius: '2px'
            }} />
            <p style={{ color: C.gray, marginTop: '0.75rem' }}>
              You have {cartCount} item{cartCount !== 1 ? 's' : ''} in your cart
            </p>
          </div>

          {/* Desktop Table View */}
          <div className="d-none d-md-block">
            <Table className="cart-table" style={{ background: C.white, borderRadius: '12px', overflow: 'hidden' }}>
              <thead style={{ background: C.redLight, borderBottom: `2px solid ${C.red}` }}>
                <tr>
                  <th style={{ color: C.charcoal }}>Product</th>
                  <th style={{ color: C.charcoal }}>Price</th>
                  <th style={{ color: C.charcoal }}>Quantity</th>
                  <th style={{ color: C.charcoal }}>Total</th>
                  <th style={{ color: C.charcoal }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div className="d-flex align-items-center">
                        {item.isBundle ? (
                          <div style={{ 
                            width: '60px', 
                            height: '60px', 
                            background: C.lightGray, 
                            borderRadius: '8px', 
                            marginRight: '1rem', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            border: `1px solid ${C.border}`
                          }}>
                            <FaBox style={{ color: C.red, fontSize: '28px' }} />
                          </div>
                        ) : (
                          <img
                            src={item.image?.[0]?.startsWith('http') ? item.image[0] : `${process.env.REACT_APP_API_URL}${item.image?.[0]?.startsWith('/') ? '' : '/'}${item.image?.[0] || ''}`}
                            alt={item.name}
                            style={{ 
                              width: '60px', 
                              height: '60px', 
                              objectFit: 'cover', 
                              borderRadius: '8px', 
                              marginRight: '1rem',
                              border: `1px solid ${C.border}`
                            }}
                            onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                          />
                        )}
                        <div>
                          <span style={{ color: C.charcoal, fontWeight: 600, fontSize: '0.95rem' }}>
                            {item.isBundle ? `${item.name} Bundle` : item.name}
                          </span>
                          {item.isBundle && item.bundleProducts && (
                            <span style={{ color: C.gray, fontSize: '0.75rem', display: 'block' }}>
                              ({item.bundleProducts.length} products included)
                            </span>
                          )}
                          {!item.isBundle && (item.selectedSize || item.selectedColor) && (
                            <div style={{ color: C.gray, fontSize: '0.75rem', marginTop: '4px' }}>
                              {item.selectedSize && <span className="me-2">Size: {item.selectedSize}</span>}
                              {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ color: C.red, fontWeight: 600 }}>
                      Rs. {(item.discountedPrice || item.price)?.toLocaleString()}
                    </td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        max={item.stock || 99}
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item._id, parseInt(e.target.value))}
                        className="quantity-input"
                      />
                    </td>
                    <td style={{ color: C.red, fontWeight: 600 }}>
                      Rs. {((item.discountedPrice || item.price) * item.quantity).toLocaleString()}
                    </td>
                    <td>
                      <Button
                        size="sm"
                        onClick={() => removeFromCart(item._id)}
                        style={{
                          background: '#dc3545',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 500,
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.opacity = '0.9';
                          e.target.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.opacity = '1';
                          e.target.style.transform = 'translateY(0)';
                        }}
                      >
                        <FaTrashAlt className="me-1" size={12} /> Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot style={{ borderTop: `2px solid ${C.border}` }}>
                <tr>
                  <td colSpan="3" className="text-end">
                    <strong style={{ color: C.charcoal, fontSize: '1rem' }}>Subtotal:</strong>
                  </td>
                  <td colSpan="2">
                    <strong style={{ color: C.red, fontSize: '1.25rem' }}>Rs. {cartTotal.toLocaleString()}</strong>
                  </td>
                </tr>
              </tfoot>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="d-md-none">
            {cart.map((item) => (
              <Card key={item._id} className="mb-3 border-0 shadow-sm" style={{ borderRadius: '12px', border: `1px solid ${C.border}` }}>
                <Card.Body style={{ padding: '1rem' }}>
                  <Row className="align-items-start">
                    <Col xs={4}>
                      {item.isBundle ? (
                        <div style={{ 
                          width: '100%', 
                          aspectRatio: '1/1', 
                          background: C.lightGray, 
                          borderRadius: '8px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          border: `1px solid ${C.border}`
                        }}>
                          <FaBox style={{ color: C.red, fontSize: '32px' }} />
                        </div>
                      ) : (
                        <img
                          src={item.image?.[0]?.startsWith('http') ? item.image[0] : `${process.env.REACT_APP_API_URL}${item.image?.[0]?.startsWith('/') ? '' : '/'}${item.image?.[0] || ''}`}
                          alt={item.name}
                          style={{ 
                            width: '100%', 
                            aspectRatio: '1/1', 
                            objectFit: 'cover', 
                            borderRadius: '8px',
                            border: `1px solid ${C.border}`
                          }}
                          onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                        />
                      )}
                    </Col>
                    <Col xs={8}>
                      <h6 style={{ color: C.charcoal, fontWeight: 600, marginBottom: '0.25rem' }}>
                        {item.isBundle ? `${item.name} Bundle` : item.name}
                      </h6>
                      {!item.isBundle && (item.selectedSize || item.selectedColor) && (
                        <div className="mb-1" style={{ color: C.gray, fontSize: '0.7rem' }}>
                          {item.selectedSize && <span className="me-2">Size: {item.selectedSize}</span>}
                          {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                        </div>
                      )}
                      <div className="mb-2" style={{ color: C.red, fontWeight: 600, fontSize: '1rem' }}>
                        Rs. {(item.discountedPrice || item.price)?.toLocaleString()}
                      </div>
                      <div className="d-flex align-items-center mb-2">
                        <span className="me-2" style={{ color: C.charcoal, fontSize: '0.8rem' }}>Qty:</span>
                        <input
                          type="number"
                          min="1"
                          max={item.stock || 99}
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item._id, parseInt(e.target.value))}
                          style={{
                            width: '60px',
                            padding: '0.35rem',
                            border: `1px solid ${C.border}`,
                            borderRadius: '6px',
                            textAlign: 'center',
                            fontSize: '0.8rem'
                          }}
                        />
                      </div>
                      <div className="mb-2">
                        <strong style={{ color: C.charcoal, fontSize: '0.85rem' }}>
                          Total: <span style={{ color: C.red }}>Rs. {((item.discountedPrice || item.price) * item.quantity).toLocaleString()}</span>
                        </strong>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => removeFromCart(item._id)}
                        className="w-100"
                        style={{
                          background: '#dc3545',
                          border: 'none',
                          padding: '0.5rem',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.opacity = '0.9';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.opacity = '1';
                        }}
                      >
                        <FaTrashAlt className="me-1" size={10} /> Remove
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            ))}
            
            {/* Mobile Total Card */}
            <Card className="border-0 shadow-sm" style={{ borderRadius: '12px', border: `1px solid ${C.border}` }}>
              <Card.Body className="text-center" style={{ padding: '1rem' }}>
                <h5 style={{ color: C.charcoal, marginBottom: '0.5rem' }}>
                  Cart Total
                </h5>
                <h4 style={{ color: C.red, fontWeight: 700, marginBottom: 0 }}>
                  Rs. {cartTotal.toLocaleString()}
                </h4>
              </Card.Body>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="mt-4">
            <Row className="align-items-center">
              <Col xs={12} md={6} className="mb-3 mb-md-0">
                <Link
                  to="/catalog"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    border: `2px solid ${C.red}`,
                    color: C.red,
                    background: C.white,
                    padding: '0.75rem 1.5rem',
                    borderRadius: '30px',
                    fontWeight: 600,
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                    fontSize: '0.9rem'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = C.redLight;
                    e.target.style.transform = 'translateX(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = C.white;
                    e.target.style.transform = 'translateX(0)';
                  }}
                >
                  <FaArrowLeft size={14} /> Continue Shopping
                </Link>
              </Col>
              <Col xs={12} md={6} className="d-flex gap-3 justify-content-md-end">
                <button
                  onClick={clearCart}
                  style={{
                    background: C.white,
                    color: '#dc3545',
                    border: `2px solid #dc3545`,
                    padding: '0.75rem 1.5rem',
                    borderRadius: '30px',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#dc3545';
                    e.target.style.color = C.white;
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = C.white;
                    e.target.style.color = '#dc3545';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  Clear Cart
                </button>
                <Link
                  to="/checkout"
                  style={{
                    background: C.gradient,
                    color: C.white,
                    border: 'none',
                    padding: '0.75rem 2rem',
                    borderRadius: '30px',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.3s ease',
                    boxShadow: `0 4px 12px ${C.red}40`
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = `0 6px 20px ${C.red}60`;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = `0 4px 12px ${C.red}40`;
                  }}
                >
                  Proceed to Checkout <FaArrowRight size={14} />
                </Link>
              </Col>
            </Row>
          </div>
        </Container>
      </div>
    </>
  );
}