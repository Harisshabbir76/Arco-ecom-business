import React, { useContext } from 'react';
import { CartContext } from './CartContext';
import { Button, Table, Container, Row, Col, Card } from 'react-bootstrap';
import { FaBox } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './heroSlider.css'; // We'll create this CSS file


// Navbar color palette
const logoColors = {
  primary: '#fe7e8b', // Navbar primary color
  secondary: '#e65c70', // Navbar secondary color
  light: '#ffd1d4', // Navbar light color
  dark: '#d64555', // Navbar dark color
  background: '#fff5f6', // Super light - almost white
  lighterBg: '#fff9fa', // Even lighter - subtle tint
  gradient: 'linear-gradient(135deg, #fe7e8b 0%, #e65c70 100%)', // Navbar gradient
  softGradient: 'linear-gradient(135deg, #fff5f6 0%, #ffd1d4 100%)', // Very soft gradient
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
      <Container fluid className="py-5 text-center" style={{
        background: logoColors.background,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ maxWidth: '500px' }}>
          <h2 className="mb-4" style={{ color: logoColors.dark }}>Your cart is empty</h2>
          <Link
            to="/catalog"
            className="btn btn-lg"
            style={{
              background: logoColors.gradient,
              color: 'white',
              border: 'none',
              padding: '0.75rem 2rem',
              borderRadius: '50px',
              fontWeight: '600',
              fontSize: '1.1rem',
              textDecoration: 'none',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.opacity = '0.9';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = `0 8px 20px ${logoColors.primary}40`;
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
    );
  }

  return (
    <Container fluid style={{ background: logoColors.background, minHeight: '100vh', padding: '2rem 0' }}>
      <Container className="py-4 cart-container">
        <h2 className="mb-4" style={{ color: logoColors.dark }}>Your Cart ({cartCount} items)</h2>

        {/* Decorative line under header */}
        <div style={{
          height: '2px',
          background: `linear-gradient(90deg, transparent, ${logoColors.primary}40, transparent)`,
          width: '100px',
          marginBottom: '2rem'
        }} />

        {/* Desktop Table View */}
        <div className="d-none d-md-block">
          <Table striped bordered hover responsive style={{ background: 'white', borderRadius: '12px', overflow: 'hidden' }}>
            <thead style={{ background: logoColors.softGradient }}>
              <tr>
                <th style={{ color: logoColors.dark, borderBottom: `2px solid ${logoColors.primary}` }}>Product</th>
                <th style={{ color: logoColors.dark, borderBottom: `2px solid ${logoColors.primary}` }}>Price</th>
                <th style={{ color: logoColors.dark, borderBottom: `2px solid ${logoColors.primary}` }}>Quantity</th>
                <th style={{ color: logoColors.dark, borderBottom: `2px solid ${logoColors.primary}` }}>Total</th>
                <th style={{ color: logoColors.dark, borderBottom: `2px solid ${logoColors.primary}` }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => (
                <tr key={item._id}>
                  <td>
                    <div className="d-flex align-items-center">
                      {item.isBundle ? (
                        <div style={{ width: '50px', height: '50px', background: '#f8f9fa', borderRadius: '8px', marginRight: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FaBox style={{ color: logoColors.primary, fontSize: '24px' }} />
                        </div>
                      ) : (
                        <img
                          src={item.image[0].startsWith('http') ? item.image[0] : `${process.env.REACT_APP_API_URL}${item.image[0].startsWith('/') ? '' : '/'}${item.image[0]}`}
                          alt={item.name}
                          className="cart-item-img"
                          style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px', marginRight: '1rem' }}
                        />
                      )}
                      <div>
                        <span style={{ color: '#2D3748', fontWeight: '500' }}>
                          {item.isBundle ? `${item.name} Bundle` : item.name}
                          {item.isBundle && item.bundleProducts && (
                            <span style={{ color: '#718096', fontSize: '0.85rem', display: 'block' }}>
                              ({item.bundleProducts.length} products)
                            </span>
                          )}
                          {!item.isBundle && (item.selectedSize || item.selectedColor) && (
                            <div style={{ color: '#718096', fontSize: '0.8rem', marginTop: '4px' }}>
                              {item.selectedSize && <span className="me-2">Size: {item.selectedSize}</span>}
                              {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                            </div>
                          )}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: logoColors.primary, fontWeight: '600' }}>Rs. {item.discountedPrice || item.price}</td>

                  <td>

                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item._id, parseInt(e.target.value))}
                      className="quantity-input"
                      style={{
                        width: '70px',
                        padding: '0.375rem',
                        border: `1px solid ${logoColors.light}`,
                        borderRadius: '6px',
                        textAlign: 'center'
                      }}
                    />
                  </td>

                  <td style={{ color: logoColors.primary, fontWeight: '600' }}>Rs. {((item.discountedPrice || item.price) * item.quantity).toFixed(2)}</td>
                  <td>
                    <Button
                      size="sm"
                      onClick={() => removeFromCart(item._id)}
                      className="remove-btn"
                      style={{
                        background: '#dc3545',
                        border: 'none',
                        padding: '0.375rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.opacity = '0.9';
                        e.target.style.transform = 'translateY(-1px)';
                        e.target.style.boxShadow = '0 4px 8px rgba(220,53,69,0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.opacity = '1';
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3" className="text-end">
                  <strong style={{ color: '#2D3748' }}>Total:</strong>
                </td>
                <td colSpan="2">
                  <strong style={{ color: logoColors.primary, fontSize: '1.2rem' }}>Rs. {cartTotal.toFixed(2)}</strong>
                </td>
              </tr>
            </tfoot>
          </Table>
        </div>

        {/* Mobile Card View */}
        <div className="d-md-none">
          {cart.map((item) => (
            <Card key={item._id} className="mb-3 cart-item-card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
              <Card.Body>
                <Row>
                  <Col xs={4}>
                    <img
                      src={item.image[0].startsWith('http') ? item.image[0] : `${process.env.REACT_APP_API_URL}${item.image[0].startsWith('/') ? '' : '/'}${item.image[0]}`}
                      alt={item.name}
                      className="cart-item-img-mobile"
                      style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                  </Col>
                  <Col xs={8}>
                    <h5 style={{ color: '#2D3748' }}>{item.isBundle ? `${item.name} Bundle` : item.name}</h5>
                    {!item.isBundle && (item.selectedSize || item.selectedColor) && (
                      <div className="mb-1" style={{ color: '#718096', fontSize: '0.8rem' }}>
                        {item.selectedSize && <span className="me-2">Size: {item.selectedSize}</span>}
                        {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                      </div>
                    )}
                    <div className="mb-2" style={{ color: logoColors.primary, fontWeight: '600' }}>Rs. {item.discountedPrice || item.price}</div>
                    <div className="d-flex align-items-center mb-2">
                      <span className="me-2" style={{ color: '#4A5568' }}>Qty:</span>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item._id, parseInt(e.target.value))}
                        className="quantity-input-mobile"
                        style={{
                          width: '60px',
                          padding: '0.25rem',
                          border: `1px solid ${logoColors.light}`,
                          borderRadius: '6px',
                          textAlign: 'center'
                        }}
                      />
                    </div>
                    <div className="mb-2">
                      <strong style={{ color: '#2D3748' }}>Total: <span style={{ color: logoColors.primary }}>Rs. {((item.discountedPrice || item.price) * item.quantity).toFixed(2)}</span></strong>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => removeFromCart(item._id)}
                      className="w-100 remove-btn-mobile"
                      style={{
                        background: '#dc3545',
                        border: 'none',
                        padding: '0.375rem',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.opacity = '0.9';
                        e.target.style.transform = 'translateY(-1px)';
                        e.target.style.boxShadow = '0 4px 8px rgba(220,53,69,0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.opacity = '1';
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      Remove
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          ))}
          <Card className="mb-3 border-0 shadow-sm" style={{ borderRadius: '12px' }}>
            <Card.Body className="text-center">
              <h5 style={{ color: '#2D3748' }}>Cart Total: <span style={{ color: logoColors.primary, fontSize: '1.3rem' }}>Rs. {cartTotal.toFixed(2)}</span></h5>
            </Card.Body>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="cart-actions mt-4">
          <Row>
            <Col xs={12} md={6} className="mb-3 mb-md-0">
              <Link
                to="/catalog"
                className="btn w-100"
                style={{
                  border: `2px solid ${logoColors.primary}`,
                  color: logoColors.primary,
                  background: 'transparent',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = logoColors.softGradient;
                  e.target.style.color = logoColors.dark;
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = logoColors.primary;
                }}
              >
                Continue Shopping
              </Link>
            </Col>
            <Col xs={12} md={6} className="d-flex flex-column flex-md-row justify-content-md-end">
              <Button
                variant="outline-danger"
                onClick={clearCart}
                className="mb-2 mb-md-0 me-md-2 w-100 w-md-auto"
                style={{
                  border: `2px solid #dc3545`,
                  color: '#dc3545',
                  background: 'transparent',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#dc3545';
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#dc3545';
                }}
              >
                Clear Cart
              </Button>
              <Link
                to="/checkout"
                className="btn w-100 w-md-auto"
                style={{
                  background: 'linear-gradient(135deg, #e8304a 0%, #c41a32 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1.2rem',
                  borderRadius: '8px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  fontSize: '0.9rem',
                  boxShadow: '0 4px 12px rgba(200,25,50,0.4)',
                  letterSpacing: '0.2px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #c41a32 0%, #a01025 100%)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(180,20,40,0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #e8304a 0%, #c41a32 100%)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(200,25,50,0.4)';
                }}
              >
                Proceed to Checkout →
              </Link>
            </Col>
          </Row>
        </div>
      </Container>
    </Container>
  );
}