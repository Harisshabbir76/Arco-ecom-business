import React, { useState, useContext, useEffect } from 'react';
import { Form, Button, Container, Modal, Row, Col, Alert } from 'react-bootstrap';
import { CartContext } from './CartContext';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FaCheckCircle, FaArrowLeft, FaTruck, FaShieldAlt, FaLock } from 'react-icons/fa';

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

export default function Checkout() {
  const { cart, cartTotal, clearCart, updateQuantity } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: ''
  });
  const [products, setProducts] = useState([]);
  const [shippingCharge, setShippingCharge] = useState(0);

  useEffect(() => {
    if (location.state?.products) {
      setProducts(location.state.products);
    } else {
      setProducts(cart);
    }
  }, [location.state, cart]);

  useEffect(() => {
    const fetchShipping = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/settings`);
        setShippingCharge(response.data.shippingCharge);
      } catch (error) {
        console.error('Error fetching shipping charge:', error);
      }
    };
    fetchShipping();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (location.state?.products) {
      setProducts(prev => prev.map(item =>
        item._id === productId
          ? { ...item, quantity: newQuantity }
          : item
      ));
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const orderProducts = products.map(item => ({
        productId: item._id,
        name: item.name,
        quantity: item.quantity,
        price: item.discountedPrice
      }));

      const subtotal = products.reduce(
        (total, item) => total + (item.discountedPrice * item.quantity),
        0
      );

      const totalAmount = subtotal + shippingCharge;

      const orderData = {
        ...formData,
        products: orderProducts,
        totalAmount,
        shippingCharge,
        paymentMethod: 'cash-on-delivery'
      };

      const response = await axios.post(`${process.env.REACT_APP_API_URL}/orders`, orderData);

      if (response.status === 201) {
        setShowSuccess(true);
        if (!location.state?.products) {
          clearCart();
        }
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Failed to place order. Please try again.');
    }
  };

  const handleContinueShopping = () => {
    setShowSuccess(false);
    navigate('/catalog');
  };

  const subtotal = products.reduce(
    (total, item) => total + (item.discountedPrice * item.quantity),
    0
  );

  const totalAmount = subtotal + shippingCharge;

  if (products.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Container>
          <div className="text-center" style={{ maxWidth: '500px', margin: '0 auto' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: C.redLight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem'
            }}>
              <FaTruck size={40} color={C.red} />
            </div>
            <h3 style={{ fontFamily: 'Barlow, sans-serif', color: C.charcoal, marginBottom: '1rem' }}>
              Your cart is empty
            </h3>
            <p style={{ color: C.gray, marginBottom: '2rem' }}>
              Add some items to your cart before checking out.
            </p>
            <button
              onClick={() => navigate('/catalog')}
              style={{
                background: C.gradient,
                color: C.white,
                border: 'none',
                padding: '0.75rem 2rem',
                borderRadius: '30px',
                fontWeight: 600,
                fontSize: '1rem',
                cursor: 'pointer',
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
            </button>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;500;600;700&display=swap');
        
        .checkout-page {
          min-height: 100vh;
          background: ${C.white};
          font-family: 'Barlow', sans-serif;
        }

        .form-control:focus {
          border-color: ${C.red};
          box-shadow: 0 0 0 0.2rem ${C.red}20;
        }

        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          opacity: 1;
        }
      `}</style>

      <div className="checkout-page" style={{ padding: '2rem 0' }}>
        <Container>
          {/* Header with Back Button */}
          <div className="mb-4">
            <button
              onClick={() => navigate('/cart')}
              style={{
                background: 'none',
                border: 'none',
                color: C.red,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '1rem',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 500,
                transition: 'opacity 0.2s ease'
              }}
              onMouseEnter={(e) => { e.target.style.opacity = '0.8'; }}
              onMouseLeave={(e) => { e.target.style.opacity = '1'; }}
            >
              <FaArrowLeft size={14} /> Back to Cart
            </button>
            <h1 style={{ 
              fontFamily: 'Barlow, sans-serif', 
              fontSize: '1.75rem', 
              fontWeight: 700, 
              color: C.charcoal,
              marginBottom: '0.5rem'
            }}>
              Checkout
            </h1>
            <div style={{
              height: '3px',
              width: '60px',
              background: C.red,
              borderRadius: '2px'
            }} />
          </div>

          <Row className="g-4">
            {/* Left Column - Shipping Form */}
            <Col lg={7}>
              <Form onSubmit={handleSubmit}>
                <div style={{
                  background: C.white,
                  border: `1px solid ${C.border}`,
                  borderRadius: '12px',
                  padding: '1.5rem',
                  marginBottom: '1.5rem'
                }}>
                  <h4 style={{ 
                    fontFamily: 'Barlow, sans-serif', 
                    fontSize: '1.1rem', 
                    fontWeight: 600, 
                    color: C.charcoal,
                    marginBottom: '1.25rem'
                  }}>
                    Shipping Information
                  </h4>

                  <Row className="g-3">
                    <Col xs={12}>
                      <Form.Group>
                        <Form.Label style={{ color: C.charcoal, fontWeight: 500, fontSize: '0.85rem' }}>
                          Full Name
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="customerName"
                          value={formData.customerName}
                          onChange={handleChange}
                          required
                          style={{
                            borderRadius: '8px',
                            borderColor: C.border,
                            padding: '0.75rem'
                          }}
                        />
                      </Form.Group>
                    </Col>

                    <Col xs={12} md={6}>
                      <Form.Group>
                        <Form.Label style={{ color: C.charcoal, fontWeight: 500, fontSize: '0.85rem' }}>
                          Email Address
                        </Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          style={{
                            borderRadius: '8px',
                            borderColor: C.border,
                            padding: '0.75rem'
                          }}
                        />
                      </Form.Group>
                    </Col>

                    <Col xs={12} md={6}>
                      <Form.Group>
                        <Form.Label style={{ color: C.charcoal, fontWeight: 500, fontSize: '0.85rem' }}>
                          Phone Number
                        </Form.Label>
                        <Form.Control
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                          style={{
                            borderRadius: '8px',
                            borderColor: C.border,
                            padding: '0.75rem'
                          }}
                        />
                      </Form.Group>
                    </Col>

                    <Col xs={12}>
                      <Form.Group>
                        <Form.Label style={{ color: C.charcoal, fontWeight: 500, fontSize: '0.85rem' }}>
                          Street Address
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          required
                          style={{
                            borderRadius: '8px',
                            borderColor: C.border,
                            padding: '0.75rem'
                          }}
                        />
                      </Form.Group>
                    </Col>

                    <Col xs={12} md={6}>
                      <Form.Group>
                        <Form.Label style={{ color: C.charcoal, fontWeight: 500, fontSize: '0.85rem' }}>
                          City
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          required
                          style={{
                            borderRadius: '8px',
                            borderColor: C.border,
                            padding: '0.75rem'
                          }}
                        />
                      </Form.Group>
                    </Col>

                    <Col xs={12} md={6}>
                      <Form.Group>
                        <Form.Label style={{ color: C.charcoal, fontWeight: 500, fontSize: '0.85rem' }}>
                          Zip / Postal Code
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleChange}
                          required
                          style={{
                            borderRadius: '8px',
                            borderColor: C.border,
                            padding: '0.75rem'
                          }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                {/* Payment Method */}
                <div style={{
                  background: C.white,
                  border: `1px solid ${C.border}`,
                  borderRadius: '12px',
                  padding: '1.5rem',
                  marginBottom: '1.5rem'
                }}>
                  <h4 style={{ 
                    fontFamily: 'Barlow, sans-serif', 
                    fontSize: '1.1rem', 
                    fontWeight: 600, 
                    color: C.charcoal,
                    marginBottom: '1.25rem'
                  }}>
                    Payment Method
                  </h4>
                  <div style={{
                    background: C.redLight,
                    borderRadius: '8px',
                    padding: '1rem',
                    border: `1px solid ${C.border}`
                  }}>
                    <div className="d-flex align-items-center">
                      <input
                        type="radio"
                        id="cash-on-delivery"
                        name="paymentMethod"
                        value="cash-on-delivery"
                        checked
                        readOnly
                        style={{ marginRight: '0.75rem', accentColor: C.red }}
                      />
                      <label htmlFor="cash-on-delivery" style={{ color: C.charcoal, fontWeight: 500, cursor: 'pointer' }}>
                        Cash on Delivery
                      </label>
                    </div>
                    <small style={{ color: C.gray, marginLeft: '1.75rem', display: 'block' }}>
                      Pay with cash upon delivery
                    </small>
                  </div>
                </div>

                {/* Place Order Button */}
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    background: C.gradient,
                    color: C.white,
                    border: 'none',
                    padding: '1rem',
                    borderRadius: '30px',
                    fontWeight: 600,
                    fontSize: '1rem',
                    cursor: 'pointer',
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
                  Place Order
                </button>
              </Form>
            </Col>

            {/* Right Column - Order Summary */}
            <Col lg={5}>
              <div style={{
                background: C.white,
                border: `1px solid ${C.border}`,
                borderRadius: '12px',
                padding: '1.5rem',
                position: 'sticky',
                top: '2rem'
              }}>
                <h4 style={{ 
                  fontFamily: 'Barlow, sans-serif', 
                  fontSize: '1.1rem', 
                  fontWeight: 600, 
                  color: C.charcoal,
                  marginBottom: '1.25rem'
                }}>
                  Order Summary
                </h4>

                {/* Products List */}
                <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1rem' }}>
                  {products.map((item) => (
                    <div key={item._id} className="d-flex justify-content-between align-items-start mb-3 pb-2" style={{ borderBottom: `1px solid ${C.border}` }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ color: C.charcoal, fontWeight: 500, marginBottom: '0.25rem', fontSize: '0.85rem' }}>
                          {item.name}
                          {item.isBundle && <span style={{ color: C.red, fontSize: '0.7rem', marginLeft: '0.25rem' }}>(Bundle)</span>}
                        </p>
                        {!item.isBundle && (item.selectedSize || item.selectedColor) && (
                          <small style={{ color: C.gray, fontSize: '0.7rem' }}>
                            {item.selectedSize && <span className="me-2">Size: {item.selectedSize}</span>}
                            {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                          </small>
                        )}
                        <div className="d-flex align-items-center mt-2">
                          <button
                            onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '6px',
                              border: `1px solid ${C.border}`,
                              background: C.white,
                              cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer',
                              opacity: item.quantity <= 1 ? 0.5 : 1
                            }}
                          >
                            -
                          </button>
                          <span style={{ margin: '0 8px', fontSize: '0.85rem', minWidth: '30px', textAlign: 'center' }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '6px',
                              border: `1px solid ${C.border}`,
                              background: C.white,
                              cursor: 'pointer'
                            }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <span style={{ color: C.red, fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', marginLeft: '0.5rem' }}>
                        Rs. {(item.discountedPrice * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: '1rem' }}>
                  <div className="d-flex justify-content-between mb-2">
                    <span style={{ color: C.gray, fontSize: '0.9rem' }}>Subtotal</span>
                    <span style={{ color: C.charcoal, fontWeight: 500 }}>Rs. {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-3 pb-2" style={{ borderBottom: `1px solid ${C.border}` }}>
                    <span style={{ color: C.gray, fontSize: '0.9rem' }}>
                      Shipping
                      <span style={{ fontSize: '0.7rem', display: 'block' }}>Free shipping on orders over Rs. 5000</span>
                    </span>
                    <span style={{ color: C.charcoal, fontWeight: 500 }}>
                      {shippingCharge > 0 ? `Rs. ${shippingCharge.toLocaleString()}` : 'Free'}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span style={{ color: C.charcoal, fontWeight: 600, fontSize: '1.1rem' }}>Total</span>
                    <span style={{ color: C.red, fontWeight: 700, fontSize: '1.3rem' }}>
                      Rs. {totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="mt-4 pt-3 text-center" style={{ borderTop: `1px solid ${C.border}` }}>
                  <div className="d-flex justify-content-center gap-4">
                    <div className="text-center">
                      <FaLock size={18} color={C.red} />
                      <div style={{ fontSize: '0.65rem', color: C.gray, marginTop: '0.25rem' }}>Secure Checkout</div>
                    </div>
                    <div className="text-center">
                      <FaShieldAlt size={18} color={C.red} />
                      <div style={{ fontSize: '0.65rem', color: C.gray, marginTop: '0.25rem' }}>Quality Guarantee</div>
                    </div>
                    <div className="text-center">
                      <FaTruck size={18} color={C.red} />
                      <div style={{ fontSize: '0.65rem', color: C.gray, marginTop: '0.25rem' }}>Fast Delivery</div>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>

        {/* Success Modal */}
        <Modal show={showSuccess} onHide={handleContinueShopping} centered>
          <Modal.Header closeButton style={{ borderBottom: `1px solid ${C.border}` }}>
            <Modal.Title style={{ color: C.charcoal, fontFamily: 'Barlow, sans-serif', fontWeight: 600 }}>
              Order Confirmed!
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center" style={{ padding: '2rem' }}>
            <div className="mb-4">
              <FaCheckCircle size={64} color={C.red} />
            </div>
            <h5 style={{ color: C.charcoal, marginBottom: '0.5rem', fontWeight: 600 }}>
              Thank you for your order!
            </h5>
            <p style={{ color: C.gray, marginBottom: 0 }}>
              Your order has been placed successfully. You will receive a confirmation email shortly.
            </p>
            <p style={{ color: C.gray, marginTop: '0.5rem' }}>
              Estimated delivery: 5-7 business days
            </p>
          </Modal.Body>
          <Modal.Footer className="justify-content-center" style={{ borderTop: `1px solid ${C.border}` }}>
            <button
              onClick={handleContinueShopping}
              style={{
                background: C.gradient,
                color: C.white,
                border: 'none',
                padding: '0.75rem 2rem',
                borderRadius: '30px',
                fontWeight: 600,
                cursor: 'pointer',
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
              Continue Shopping
            </button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
}