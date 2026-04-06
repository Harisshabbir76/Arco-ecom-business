// CheckoutPage.js - Cash on Delivery Only
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Alert,
  Card,
  ListGroup,
  Spinner,
} from 'react-bootstrap';
import { FiShoppingBag, FiArrowLeft, FiTruck, FiShield, FiLock } from 'react-icons/fi';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useCart } from './CartContext';

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

// Checkout Form Component - Cash on Delivery Only
const CheckoutForm = ({ cart, cartTotal, clearCart, onOrderSuccess }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });

  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountBreakdown, setDiscountBreakdown] = useState([]);
  const [couponStatus, setCouponStatus] = useState({ type: '', message: '' });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.country.trim()) newErrors.country = 'Country is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Fetch automatic discounts
  useEffect(() => {
    const fetchAutomaticDiscounts = async () => {
      if (cart.length === 0) return;
      try {
        const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/apply-coupon`, {
          code: couponCode,
          totalAmount: cartTotal,
          products: cart.map(item => ({
            productId: item._id || item.productId,
            quantity: item.quantity,
            price: item.discountedPrice || item.price,
            category: item.category,
            size: item.selectedSize,
            color: item.selectedColor
          }))
        });
        setDiscountAmount(res.data.discount);
        setDiscountBreakdown(res.data.breakdown || []);
      } catch (err) {
        console.error('Error fetching automatic discounts:', err);
      }
    };

    fetchAutomaticDiscounts();
  }, [cart, cartTotal, couponCode]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/apply-coupon`, {
        code: couponCode,
        totalAmount: cartTotal,
        products: cart.map(item => ({
          productId: item._id || item.productId,
          quantity: item.quantity,
          price: item.discountedPrice || item.price,
          category: item.category
        }))
      });
      setDiscountAmount(res.data.discount);
      setDiscountBreakdown(res.data.breakdown || []);
      setCouponStatus({ type: 'success', message: `Coupon applied! You saved Rs. ${res.data.discount.toFixed(2)}` });
    } catch (err) {
      setDiscountAmount(0);
      setDiscountBreakdown([]);
      setCouponStatus({ type: 'danger', message: err.response?.data?.message || 'Invalid coupon' });
    }
  };

  const finalAmount = cartTotal - discountAmount;

  const handleCODSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      const orderData = {
        customerName: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        address: `${formData.address}, ${formData.city}, ${formData.state}, ${formData.country}`,
        city: formData.city,
        zipCode: formData.zipCode,
        products: cart.map(item => ({
          productId: item._id || item.productId,
          name: item.name,
          quantity: item.quantity,
          price: item.discountedPrice || item.price,
          category: item.category,
          size: item.selectedSize,
          color: item.selectedColor
        })),
        totalAmount: finalAmount,
        couponCode: couponStatus.type === 'success' ? couponCode : null,
        paymentMethod: 'cash-on-delivery'
      };

      const response = await axios.post(`${process.env.REACT_APP_API_URL}/orders`, orderData);

      clearCart();

      onOrderSuccess({
        order: response.data,
        customerName: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        address: orderData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        products: orderData.products,
        totalAmount: finalAmount,
        paymentMethod: 'cash-on-delivery',
        isPaymentSuccess: false
      });
    } catch (error) {
      console.error('Error submitting order:', error);
      setErrors({ submit: 'Failed to place order. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Shipping Information Card */}
      <Card className="mb-4 border-0 shadow-sm" style={{ borderRadius: '12px', overflow: 'hidden', border: `1px solid ${C.border}` }}>
        <Card.Header style={{
          background: C.white,
          borderBottom: `1px solid ${C.border}`,
          padding: '1rem 1.5rem'
        }}>
          <h5 style={{ color: C.charcoal, fontWeight: '600', margin: 0 }}>
            Shipping Information
          </h5>
        </Card.Header>
        <Card.Body style={{ padding: '1.5rem' }}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label style={{ color: C.charcoal, fontWeight: '500' }}>First Name *</Form.Label>
                <Form.Control
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  isInvalid={!!errors.firstName}
                  style={{
                    borderRadius: '8px',
                    borderColor: C.border,
                    padding: '0.6rem 1rem',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = C.red}
                  onBlur={(e) => e.target.style.borderColor = C.border}
                />
                <Form.Control.Feedback type="invalid">{errors.firstName}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label style={{ color: C.charcoal, fontWeight: '500' }}>Last Name *</Form.Label>
                <Form.Control
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  isInvalid={!!errors.lastName}
                  style={{
                    borderRadius: '8px',
                    borderColor: C.border,
                    padding: '0.6rem 1rem'
                  }}
                  onFocus={(e) => e.target.style.borderColor = C.red}
                  onBlur={(e) => e.target.style.borderColor = C.border}
                />
                <Form.Control.Feedback type="invalid">{errors.lastName}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label style={{ color: C.charcoal, fontWeight: '500' }}>Email Address *</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              isInvalid={!!errors.email}
              style={{
                borderRadius: '8px',
                borderColor: C.border,
                padding: '0.6rem 1rem'
              }}
              onFocus={(e) => e.target.style.borderColor = C.red}
              onBlur={(e) => e.target.style.borderColor = C.border}
            />
            <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label style={{ color: C.charcoal, fontWeight: '500' }}>Phone Number *</Form.Label>
            <Form.Control
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              isInvalid={!!errors.phone}
              style={{
                borderRadius: '8px',
                borderColor: C.border,
                padding: '0.6rem 1rem'
              }}
              onFocus={(e) => e.target.style.borderColor = C.red}
              onBlur={(e) => e.target.style.borderColor = C.border}
            />
            <Form.Control.Feedback type="invalid">{errors.phone}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label style={{ color: C.charcoal, fontWeight: '500' }}>Street Address *</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="address"
              value={formData.address}
              onChange={handleChange}
              isInvalid={!!errors.address}
              style={{
                borderRadius: '8px',
                borderColor: C.border,
                padding: '0.6rem 1rem',
                resize: 'vertical'
              }}
              onFocus={(e) => e.target.style.borderColor = C.red}
              onBlur={(e) => e.target.style.borderColor = C.border}
            />
            <Form.Control.Feedback type="invalid">{errors.address}</Form.Control.Feedback>
          </Form.Group>

          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label style={{ color: C.charcoal, fontWeight: '500' }}>City *</Form.Label>
                <Form.Control
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  isInvalid={!!errors.city}
                  style={{
                    borderRadius: '8px',
                    borderColor: C.border,
                    padding: '0.6rem 1rem'
                  }}
                  onFocus={(e) => e.target.style.borderColor = C.red}
                  onBlur={(e) => e.target.style.borderColor = C.border}
                />
                <Form.Control.Feedback type="invalid">{errors.city}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label style={{ color: C.charcoal, fontWeight: '500' }}>State / Province *</Form.Label>
                <Form.Control
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  isInvalid={!!errors.state}
                  style={{
                    borderRadius: '8px',
                    borderColor: C.border,
                    padding: '0.6rem 1rem'
                  }}
                  onFocus={(e) => e.target.style.borderColor = C.red}
                  onBlur={(e) => e.target.style.borderColor = C.border}
                />
                <Form.Control.Feedback type="invalid">{errors.state}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label style={{ color: C.charcoal, fontWeight: '500' }}>Zip Code</Form.Label>
                <Form.Control
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  style={{
                    borderRadius: '8px',
                    borderColor: C.border,
                    padding: '0.6rem 1rem'
                  }}
                  onFocus={(e) => e.target.style.borderColor = C.red}
                  onBlur={(e) => e.target.style.borderColor = C.border}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label style={{ color: C.charcoal, fontWeight: '500' }}>Country *</Form.Label>
            <Form.Select
              name="country"
              value={formData.country}
              onChange={handleChange}
              isInvalid={!!errors.country}
              style={{
                borderRadius: '8px',
                borderColor: C.border,
                padding: '0.6rem 1rem',
                cursor: 'pointer'
              }}
            >
              <option value="">Select Country</option>
              <option value="Pakistan">Pakistan</option>
              <option value="United States">United States</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="India">India</option>
              <option value="Canada">Canada</option>
              <option value="Australia">Australia</option>
              <option value="Germany">Germany</option>
              <option value="France">France</option>
              <option value="China">China</option>
              <option value="Japan">Japan</option>
              <option value="UAE">United Arab Emirates</option>
              <option value="Saudi Arabia">Saudi Arabia</option>
              <option value="Turkey">Turkey</option>
              <option value="Other">Other</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">{errors.country}</Form.Control.Feedback>
          </Form.Group>
        </Card.Body>
      </Card>

      {/* Payment Method Card - Cash on Delivery Only */}
      <Card className="mb-4 border-0 shadow-sm" style={{ borderRadius: '12px', overflow: 'hidden', border: `1px solid ${C.border}` }}>
        <Card.Header style={{
          background: C.white,
          borderBottom: `1px solid ${C.border}`,
          padding: '1rem 1.5rem'
        }}>
          <h5 style={{ color: C.charcoal, fontWeight: '600', margin: 0 }}>
            Payment Method
          </h5>
        </Card.Header>
        <Card.Body style={{ padding: '1.5rem' }}>
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

          <p style={{
            fontSize: '0.75rem',
            color: C.gray,
            marginTop: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <FiShield size={14} /> Pay securely when your order arrives
          </p>
        </Card.Body>
      </Card>

      {errors.submit && (
        <Alert variant="danger" className="mb-4" style={{ borderRadius: '8px' }}>
          {errors.submit}
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
        <button
          onClick={() => navigate('/cart')}
          style={{
            border: `2px solid ${C.red}`,
            color: C.red,
            background: C.white,
            padding: '0.75rem 1.5rem',
            borderRadius: '30px',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
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
          <FiArrowLeft size={14} /> Back to Cart
        </button>
        <button
          onClick={handleCODSubmit}
          disabled={isSubmitting}
          style={{
            background: C.gradient,
            color: C.white,
            border: 'none',
            padding: '1rem 2.5rem',
            borderRadius: '30px',
            fontWeight: 700,
            fontSize: '1rem',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            minWidth: '220px',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            opacity: isSubmitting ? 0.7 : 1,
            transition: 'all 0.3s ease',
            boxShadow: `0 4px 12px ${C.red}40`
          }}
          onMouseEnter={(e) => {
            if (!isSubmitting) {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = `0 6px 20px ${C.red}60`;
            }
          }}
          onMouseLeave={(e) => {
            if (!isSubmitting) {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = `0 4px 12px ${C.red}40`;
            }
          }}
        >
          {isSubmitting ? (
            <Spinner size="sm" animation="border" variant="light" />
          ) : (
            `Place Order - Rs. ${finalAmount.toFixed(2)}`
          )}
        </button>
      </div>
    </>
  );
};

// Order Success Component
const OrderSuccessPage = ({ orderDetails, onContinueShopping }) => {
  const { customerName, email, phone, address, city, state, country, products, totalAmount, paymentMethod } = orderDetails;

  return (
    <div style={{ minHeight: '100vh', background: C.white, padding: '2rem 0' }}>
      <Container>
        <Row className="justify-content-center">
          <Col lg={8}>
            {/* Success Message Header */}
            <Card className="border-0 shadow-sm mb-4" style={{
              borderRadius: '12px',
              overflow: 'hidden',
              border: `1px solid ${C.border}`
            }}>
              <div style={{
                height: '4px',
                background: C.gradient
              }} />
              <Card.Body className="text-center py-5">
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: C.redLight,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem'
                }}>
                  <span style={{
                    fontSize: '2rem',
                    color: C.red
                  }}>
                    ✓
                  </span>
                </div>
                <h2 style={{
                  color: C.charcoal,
                  fontWeight: '600',
                  marginBottom: '0.5rem'
                }}>
                  Order Confirmed!
                </h2>
                <p style={{ color: C.gray, fontSize: '1rem', maxWidth: '400px', margin: '0 auto' }}>
                  Thank you, {customerName}! Your order has been placed successfully and will be delivered soon.
                </p>
              </Card.Body>
            </Card>

            {/* Order Summary Card */}
            <Card className="border-0 shadow-sm mb-4" style={{
              borderRadius: '12px',
              overflow: 'hidden',
              border: `1px solid ${C.border}`
            }}>
              <Card.Header style={{
                background: C.white,
                borderBottom: `1px solid ${C.border}`,
                padding: '1rem 1.5rem'
              }}>
                <h5 style={{ color: C.charcoal, fontWeight: '600', margin: 0 }}>
                  Order Summary
                </h5>
              </Card.Header>
              <Card.Body style={{ padding: '1.5rem' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  {products.map((item, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem 0',
                      borderBottom: index < products.length - 1 ? `1px solid ${C.border}` : 'none'
                    }}>
                      <div>
                        <div style={{ fontWeight: '500', color: C.charcoal, marginBottom: '0.25rem' }}>
                          {item.name}
                        </div>
                        <div style={{ color: C.gray, fontSize: '0.85rem' }}>
                          Quantity: {item.quantity} × Rs. {item.price}
                          {(item.size || item.selectedSize) && (
                            <div style={{ marginTop: '2px', color: C.red, fontWeight: '500' }}>
                              Size: {item.size || item.selectedSize}
                            </div>
                          )}
                        </div>
                      </div>
                      <div style={{ fontWeight: '600', color: C.charcoal }}>
                        Rs. {(item.quantity * item.price).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{
                  background: C.redLight,
                  borderRadius: '8px',
                  padding: '1rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '600', color: C.charcoal }}>Total Amount</span>
                    <span style={{
                      fontWeight: '700',
                      fontSize: '1.3rem',
                      color: C.red
                    }}>
                      Rs. {totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Customer Information Card */}
            <Card className="border-0 shadow-sm mb-4" style={{
              borderRadius: '12px',
              overflow: 'hidden',
              border: `1px solid ${C.border}`
            }}>
              <Card.Header style={{
                background: C.white,
                borderBottom: `1px solid ${C.border}`,
                padding: '1rem 1.5rem'
              }}>
                <h5 style={{ color: C.charcoal, fontWeight: '600', margin: 0 }}>
                  Customer Information
                </h5>
              </Card.Header>
              <Card.Body style={{ padding: '1.5rem' }}>
                <Row>
                  <Col md={6}>
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.85rem', color: C.gray, marginBottom: '0.25rem' }}>
                        Full Name
                      </div>
                      <div style={{ fontWeight: '500', color: C.charcoal }}>{customerName}</div>
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.85rem', color: C.gray, marginBottom: '0.25rem' }}>
                        Email Address
                      </div>
                      <div style={{ fontWeight: '500', color: C.charcoal }}>{email}</div>
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.85rem', color: C.gray, marginBottom: '0.25rem' }}>
                        Phone Number
                      </div>
                      <div style={{ fontWeight: '500', color: C.charcoal }}>{phone}</div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.85rem', color: C.gray, marginBottom: '0.25rem' }}>
                        Shipping Address
                      </div>
                      <div style={{ fontWeight: '500', color: C.charcoal }}>
                        {address}<br />
                        {city}, {state}, {country}
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Payment Information Card */}
            <Card className="border-0 shadow-sm mb-4" style={{
              borderRadius: '12px',
              overflow: 'hidden',
              border: `1px solid ${C.border}`
            }}>
              <Card.Header style={{
                background: C.white,
                borderBottom: `1px solid ${C.border}`,
                padding: '1rem 1.5rem'
              }}>
                <h5 style={{ color: C.charcoal, fontWeight: '600', margin: 0 }}>
                  Payment Information
                </h5>
              </Card.Header>
              <Card.Body style={{ padding: '1.5rem' }}>
                <Row>
                  <Col md={6}>
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.85rem', color: C.gray, marginBottom: '0.25rem' }}>
                        Payment Method
                      </div>
                      <div style={{ fontWeight: '500', color: C.charcoal }}>
                        Cash on Delivery
                      </div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.85rem', color: C.gray, marginBottom: '0.25rem' }}>
                        Payment Status
                      </div>
                      <div>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.85rem',
                          fontWeight: '500',
                          background: '#f59e0b20',
                          color: '#f59e0b'
                        }}>
                          Pending (Pay on Delivery)
                        </span>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Continue Shopping Button */}
            <div className="text-center mt-4">
              <button
                onClick={onContinueShopping}
                style={{
                  background: C.gradient,
                  color: C.white,
                  border: 'none',
                  padding: '0.75rem 2.5rem',
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

            <p style={{
              textAlign: 'center',
              color: C.gray,
              fontSize: '0.85rem',
              marginTop: '2rem'
            }}>
              A confirmation email has been sent to {email}
            </p>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

// Main CheckoutPage Component
const CheckoutPage = () => {
  const location = useLocation();
  const { cart: cartFromContext, clearCart } = useCart();
  const navigate = useNavigate();

  const singleProductCheckout = location.state?.products && location.state.products.length > 0;
  const cart = singleProductCheckout ? location.state.products : cartFromContext;
  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const cartTotal = cart.reduce((sum, item) => sum + ((item.isBundle ? item.bundlePrice : (item.discountedPrice || item.price)) * (item.quantity || 1)), 0);

  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountBreakdown, setDiscountBreakdown] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  const [couponStatus, setCouponStatus] = useState({ type: '', message: '' });
  const [orderSuccessDetails, setOrderSuccessDetails] = useState(null);

  if (cartCount === 0 && !orderSuccessDetails) {
    return (
      <div style={{ minHeight: '100vh', background: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Container>
          <Card className="border-0 shadow-sm text-center py-5" style={{ borderRadius: '12px', border: `1px solid ${C.border}` }}>
            <Card.Body>
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
                <FiShoppingBag size={32} style={{ color: C.red }} />
              </div>
              <h5 style={{ color: C.charcoal, marginBottom: '1rem' }}>Your cart is empty</h5>
              <Link
                to="/catalog"
                style={{
                  color: C.red,
                  textDecoration: 'underline',
                  fontWeight: '500'
                }}
              >
                Continue shopping
              </Link>
            </Card.Body>
          </Card>
        </Container>
      </div>
    );
  }

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/apply-coupon`, {
        code: couponCode,
        totalAmount: cartTotal,
        products: cart.map(item => ({
          productId: item._id || item.productId,
          quantity: item.quantity,
          price: item.discountedPrice || item.price,
          category: item.category,
          size: item.selectedSize,
          color: item.selectedColor
        }))
      });
      setDiscountAmount(res.data.discount);
      setDiscountBreakdown(res.data.breakdown || []);
      setCouponStatus({ type: 'success', message: `Coupon applied! You saved Rs. ${res.data.discount.toFixed(2)}` });
    } catch (err) {
      setDiscountAmount(0);
      setDiscountBreakdown([]);
      setCouponStatus({ type: 'danger', message: err.response?.data?.message || 'Invalid coupon' });
    }
  };

  const finalAmount = cartTotal - discountAmount;

  const handleOrderSuccess = (orderDetails) => {
    setOrderSuccessDetails(orderDetails);
  };

  const handleContinueShopping = () => {
    setOrderSuccessDetails(null);
    navigate('/catalog');
  };

  if (orderSuccessDetails) {
    return <OrderSuccessPage orderDetails={orderSuccessDetails} onContinueShopping={handleContinueShopping} />;
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
        .form-control:focus, .form-select:focus {
          border-color: ${C.red};
          box-shadow: 0 0 0 0.2rem ${C.red}20;
        }
      `}</style>

      <div className="checkout-page" style={{ padding: '2rem 0' }}>
        <Container>
          <Row>
            <Col lg={8}>
              <div className="mb-4">
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

              <CheckoutForm
                cart={cart}
                cartTotal={cartTotal}
                clearCart={clearCart}
                onOrderSuccess={handleOrderSuccess}
              />
            </Col>

            <Col lg={4}>
              <Card className="border-0 shadow-sm" style={{
                borderRadius: '12px',
                overflow: 'hidden',
                position: 'sticky',
                top: '2rem',
                border: `1px solid ${C.border}`
              }}>
                <Card.Header style={{
                  background: C.white,
                  borderBottom: `1px solid ${C.border}`,
                  padding: '1rem 1.5rem'
                }}>
                  <h5 style={{ color: C.charcoal, fontWeight: '600', margin: 0 }}>
                    Order Summary
                  </h5>
                </Card.Header>
                <Card.Body style={{ padding: '1.5rem' }}>
                  <ListGroup variant="flush">
                    {cart.map(item => {
                      const itemBreakdown = discountBreakdown.find(b => b.productId === (item._id || item.productId) && b.type === 'BUY_X_GET_Y');
                      const freeQty = itemBreakdown ? itemBreakdown.freeQuantity : 0;
                      const inCartFreeQty = itemBreakdown ? itemBreakdown.inCartQuantity : 0;
                      const paidQty = item.quantity - inCartFreeQty;

                      const displayName = item.isBundle ? `${item.name} Bundle${item.bundleProducts ? ` (${item.bundleProducts.length} products)` : ''}` : item.name;
                      const displayPrice = item.isBundle ? item.bundlePrice : (item.discountedPrice || item.price);

                      return (
                        <React.Fragment key={item._id || item.productId}>
                          <ListGroup.Item className="border-0 px-0 mb-2" style={{ background: 'transparent' }}>
                            <div className="d-flex justify-content-between align-items-start">
                              <div style={{ color: C.charcoal, fontWeight: '500' }}>
                                {displayName}
                                <div style={{ fontSize: '0.85rem', color: C.gray }}>
                                  {paidQty} × Rs. {displayPrice}
                                  {!item.isBundle && (item.selectedSize || item.selectedColor || item.size || item.color) && (
                                    <div style={{ marginTop: '2px', color: C.red, fontWeight: '500' }}>
                                      {(item.selectedSize || item.size) && <span className="me-2">Size: {item.selectedSize || item.size}</span>}
                                      {(item.selectedColor || item.color) && <span>Color: {item.selectedColor || item.color}</span>}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div style={{ color: C.charcoal, fontWeight: '600' }}>
                                Rs. {(displayPrice * paidQty).toLocaleString()}
                              </div>
                            </div>
                          </ListGroup.Item>
                          {freeQty > 0 && (
                            <ListGroup.Item className="border-0 px-0 mb-2 mt-n2" style={{ background: 'transparent' }}>
                              <div className="d-flex justify-content-between align-items-start">
                                <div style={{ color: C.red, fontWeight: '500', paddingLeft: '1rem' }}>
                                  {freeQty} × {displayName} (Free)
                                </div>
                                <div style={{ color: C.red, fontWeight: '600' }}>Rs. 0.00</div>
                              </div>
                            </ListGroup.Item>
                          )}
                        </React.Fragment>
                      );
                    })}

                    <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${C.border}` }}>
                      <div className="d-flex justify-content-between mb-2">
                        <div style={{ color: C.gray }}>Subtotal</div>
                        <div style={{ color: C.charcoal, fontWeight: '500' }}>Rs. {cartTotal.toLocaleString()}</div>
                      </div>
                      {discountAmount > 0 && (
                        <div className="d-flex justify-content-between mb-2">
                          <div style={{ color: C.red }}>Total Savings</div>
                          <div style={{ color: C.red, fontWeight: '500' }}>-Rs. {discountAmount.toLocaleString()}</div>
                        </div>
                      )}
                      <div className="d-flex justify-content-between mt-2 pt-2 fw-bold" style={{ borderTop: `2px solid ${C.border}` }}>
                        <div style={{ color: C.charcoal, fontSize: '1.1rem' }}>Total Amount</div>
                        <div style={{ color: C.red, fontSize: '1.3rem' }}>Rs. {finalAmount.toLocaleString()}</div>
                      </div>
                    </div>
                  </ListGroup>

                  <div className="mt-4">
                    <Form.Label style={{ color: C.charcoal, fontWeight: '500', marginBottom: '0.5rem' }}>
                      Apply Coupon
                    </Form.Label>
                    <div className="d-flex">
                      <Form.Control
                        type="text"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        style={{
                          borderRadius: '8px 0 0 8px',
                          borderColor: C.red,
                          borderRight: 'none',
                          padding: '0.7rem 1rem',
                          fontWeight: '500'
                        }}
                      />
                      <button
                        onClick={handleApplyCoupon}
                        style={{
                          background: C.gradient,
                          border: 'none',
                          borderRadius: '0 8px 8px 0',
                          padding: '0 1rem',
                          fontWeight: '600',
                          fontSize: '0.85rem',
                          color: C.white,
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.opacity = '0.9';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.opacity = '1';
                        }}
                      >
                        Apply
                      </button>
                    </div>
                    {couponStatus.message && (
                      <div
                        className={`mt-2 text-${couponStatus.type}`}
                        style={{
                          fontSize: '0.9rem',
                          color: couponStatus.type === 'success' ? C.red : '#E53E3E'
                        }}
                      >
                        {couponStatus.message}
                      </div>
                    )}
                  </div>

                  {/* Trust Badges */}
                  <div className="mt-4 pt-3 text-center" style={{ borderTop: `1px solid ${C.border}` }}>
                    <div className="d-flex justify-content-center gap-4">
                      <div className="text-center">
                        <FiLock size={18} color={C.red} />
                        <div style={{ fontSize: '0.65rem', color: C.gray, marginTop: '0.25rem' }}>Secure Checkout</div>
                      </div>
                      <div className="text-center">
                        <FiShield size={18} color={C.red} />
                        <div style={{ fontSize: '0.65rem', color: C.gray, marginTop: '0.25rem' }}>Quality Guarantee</div>
                      </div>
                      <div className="text-center">
                        <FiTruck size={18} color={C.red} />
                        <div style={{ fontSize: '0.65rem', color: C.gray, marginTop: '0.25rem' }}>Fast Delivery</div>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default CheckoutPage;