import React, { useState, useContext, useEffect } from 'react';
import { Form, Button, Container, Modal, Row, Col, Alert } from 'react-bootstrap';
import { CartContext } from './CartContext';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

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

  if (products.length === 0) {
    return (
      <Container fluid className="py-5" style={{ background: logoColors.background, minHeight: '100vh' }}>
        <Container>
          <Alert variant="info" className="text-center" style={{ borderRadius: '12px' }}>
            <h2>Your cart is empty</h2>
            <Button
              variant="primary"
              onClick={() => navigate('/catalog')}
              className="mt-3"
              style={{
                background: logoColors.gradient,
                border: 'none',
                padding: '0.75rem 2rem',
                borderRadius: '8px',
                fontWeight: '500',
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
              Continue Shopping
            </Button>
          </Alert>
        </Container>
      </Container>
    );
  }

  return (
    <Container fluid style={{ background: logoColors.background, minHeight: '100vh', padding: '2rem 0' }}>
      <Container>
        <h2 className="mb-4" style={{ color: logoColors.dark }}>Checkout</h2>

        {/* Decorative line under header */}
        <div style={{
          height: '2px',
          background: `linear-gradient(90deg, transparent, ${logoColors.primary}40, transparent)`,
          width: '100px',
          marginBottom: '2rem'
        }} />

        <Row>
          <Col md={8}>
            <Form onSubmit={handleSubmit}>
              <div className="bg-white p-4 rounded shadow-sm mb-4" style={{ borderRadius: '12px' }}>
                <h4 className="mb-3" style={{ color: logoColors.dark }}>Shipping Information</h4>

                <Form.Group className="mb-3">
                  <Form.Label style={{ color: '#4A5568', fontWeight: '500' }}>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    required
                    style={{
                      borderRadius: '8px',
                      borderColor: logoColors.light
                    }}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label style={{ color: '#4A5568', fontWeight: '500' }}>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={{
                      borderRadius: '8px',
                      borderColor: logoColors.light
                    }}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label style={{ color: '#4A5568', fontWeight: '500' }}>Phone Number</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    style={{
                      borderRadius: '8px',
                      borderColor: logoColors.light
                    }}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label style={{ color: '#4A5568', fontWeight: '500' }}>Address</Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    style={{
                      borderRadius: '8px',
                      borderColor: logoColors.light
                    }}
                  />
                </Form.Group>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label style={{ color: '#4A5568', fontWeight: '500' }}>City</Form.Label>
                      <Form.Control
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        style={{
                          borderRadius: '8px',
                          borderColor: logoColors.light
                        }}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label style={{ color: '#4A5568', fontWeight: '500' }}>Zip Code</Form.Label>
                      <Form.Control
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        required
                        style={{
                          borderRadius: '8px',
                          borderColor: logoColors.light
                        }}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </div>

              <div className="bg-white p-4 rounded shadow-sm mb-4" style={{ borderRadius: '12px' }}>
                <h4 className="mb-3 mt-4" style={{ color: logoColors.dark }}>Payment Method</h4>
                <div className="mb-4 p-3 rounded" style={{ background: logoColors.softGradient }}>
                  <Form.Check
                    type="radio"
                    id="cash-on-delivery"
                    label={
                      <span style={{ color: '#2D3748', fontWeight: '500' }}>Cash on Delivery</span>
                    }
                    name="paymentMethod"
                    value="cash-on-delivery"
                    checked
                    readOnly
                  />
                  <small className="text-muted" style={{ color: '#718096' }}>Pay with cash upon delivery</small>
                </div>
              </div>

              <Button
                variant="primary"
                type="submit"
                className="w-100 py-3"
                style={{
                  background: logoColors.gradient,
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '500',
                  fontSize: '1.1rem',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.opacity = '0.9';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = `0 4px 15px ${logoColors.primary}40`;
                }}
                onMouseLeave={(e) => {
                  e.target.style.opacity = '1';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                Place Order
              </Button>
            </Form>
          </Col>

          <Col md={4}>
            <div className="bg-white p-4 rounded shadow-sm" style={{
              borderRadius: '12px',
              position: 'sticky',
              top: '2rem'
            }}>
              <h4 className="mb-3" style={{ color: logoColors.dark }}>Order Summary</h4>
              <ul className="list-unstyled">
                {products.map(item => (
                  <li key={item._id} className="d-flex justify-content-between mb-3 pb-2" style={{ borderBottom: `1px solid ${logoColors.light}` }}>
                    <div>
                      <p className="mb-1" style={{ color: '#2D3748', fontWeight: '500' }}>{item.name}</p>
                      <div className="d-flex align-items-center">
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          style={{
                            borderColor: logoColors.primary,
                            color: logoColors.primary,
                            background: 'transparent'
                          }}
                        >
                          -
                        </Button>
                        <Form.Control
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item._id, parseInt(e.target.value))}
                          style={{
                            width: '60px',
                            margin: '0 5px',
                            borderColor: logoColors.light,
                            textAlign: 'center'
                          }}
                          className="text-center"
                        />
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                          style={{
                            borderColor: logoColors.primary,
                            color: logoColors.primary,
                            background: 'transparent'
                          }}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                    <span style={{ color: logoColors.primary, fontWeight: '600' }}>
                      Rs. {(item.discountedPrice * item.quantity).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="d-flex justify-content-between mb-2">
                <span style={{ color: '#4A5568' }}>Subtotal</span>
                <span style={{ color: '#2D3748', fontWeight: '500' }}>
                  {products.reduce(
                    (total, item) => total + (item.discountedPrice * item.quantity),
                    0
                  ).toFixed(2)} Rs.
                </span>
              </div>
              <div className="d-flex justify-content-between mb-3 pb-2" style={{ borderBottom: `1px solid ${logoColors.light}` }}>
                <span style={{ color: '#4A5568' }}>Shipping</span>
                <span style={{ color: '#2D3748', fontWeight: '500' }}>
                  {shippingCharge.toFixed(2)} Rs.
                </span>
              </div>
              <div className="d-flex justify-content-between fw-bold">
                <span style={{ color: '#2D3748', fontSize: '1.1rem' }}>Total</span>
                <span style={{ color: logoColors.primary, fontSize: '1.3rem' }}>
                  Rs. {(products.reduce(
                    (total, item) => total + (item.discountedPrice * item.quantity),
                    0
                  ) + shippingCharge).toFixed(2)}
                </span>
              </div>
            </div>
          </Col>
        </Row>

        <Modal show={showSuccess} onHide={handleContinueShopping} centered>
          <Modal.Header closeButton style={{ borderBottom: `1px solid ${logoColors.light}` }}>
            <Modal.Title style={{ color: logoColors.dark }}>Order Confirmed!</Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center" style={{ padding: '2rem' }}>
            <div className="mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                style={{ color: logoColors.primary }}
                className="bi bi-check-circle-fill"
                viewBox="0 0 16 16"
                fill={logoColors.primary}
              >
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
              </svg>
            </div>
            <h5 className="mb-3" style={{ color: '#2D3748' }}>Thank you for your order!</h5>
            <p style={{ color: '#4A5568' }}>Your order will be delivered in 5 business days.</p>
          </Modal.Body>
          <Modal.Footer className="justify-content-center" style={{ borderTop: `1px solid ${logoColors.light}` }}>
            <Button
              variant="primary"
              onClick={handleContinueShopping}
              style={{
                background: logoColors.gradient,
                border: 'none',
                padding: '0.75rem 2rem',
                borderRadius: '8px',
                fontWeight: '500',
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
              Continue Shopping
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </Container>
  );
}