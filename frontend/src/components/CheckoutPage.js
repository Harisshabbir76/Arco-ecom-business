// CheckoutPage.js - Full version with Stripe Payment Integration
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
import { FiShoppingBag } from 'react-icons/fi';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useCart } from './CartContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

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


// Initialize Stripe with public key from env
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY || 'pk_test_placeholder');

// Card Element styling - Professional design
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#2D3748',
      '::placeholder': {
        color: '#A0AEC0',
        fontWeight: '400',
      },
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSmoothing: 'antialiased',
      iconColor: '#fe7e8b',
    },
    invalid: {
      color: '#E53E3E',
      iconColor: '#E53E3E',
    },
  },
  hidePostalCode: true,
  classes: {
    base: 'stripe-card-element',
    focus: 'stripe-card-element--focus',
    invalid: 'stripe-card-element--invalid',
  },
};

// Country name to ISO code mapping
const countryCodeMap = {
  'pakistan': 'PK',
  'united states': 'US',
  'united kingdom': 'GB',
  'india': 'IN',
  'canada': 'CA',
  'australia': 'AU',
  'germany': 'DE',
  'france': 'FR',
  'china': 'CN',
  'japan': 'JP',
  'uae': 'AE',
  'united arab emirates': 'AE',
  'saudi arabia': 'SA',
  'Turkey': 'TR',
};

const getCountryCode = (countryName) => {
  if (!countryName) return 'US';
  const normalized = countryName.trim().toLowerCase();
  return countryCodeMap[normalized] || normalized.toUpperCase();
};

// Checkout Form Component with Stripe - Combined Logic
const CheckoutForm = ({ cart, cartTotal, clearCart, onOrderSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
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
    paymentMethod: 'creditCard'
  });

  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountBreakdown, setDiscountBreakdown] = useState([]);
  const [couponStatus, setCouponStatus] = useState({ type: '', message: '' });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cardError, setCardError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [isCardFocused, setIsCardFocused] = useState(false);

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

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    if (!validateForm()) return;

    setProcessing(true);
    setCardError('');

    try {
      // Create payment intent
      const { data: { clientSecret } } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/create-payment-intent`,
        {
          amount: Math.round(cartTotal * 100), // Convert to cents/paisa
          currency: 'pkr',
          products: cart.map(item => ({
            productId: item._id || item.productId,
            quantity: item.quantity,
            price: item.discountedPrice || item.price,
            category: item.category,
            size: item.selectedSize,
            color: item.selectedColor
          })),
          couponCode: couponStatus.type === 'success' ? couponCode : null
        }
      );

      // Confirm payment with Stripe
      const cardElement = elements.getElement(CardElement);
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            phone: formData.phone,
            address: {
              line1: formData.address,
              city: formData.city,
              state: formData.state,
              country: getCountryCode(formData.country),
            },
          },
        },
      });

      if (error) {
        setCardError(error.message);
        setProcessing(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        // Process the order on backend
        const orderData = {
          paymentIntentId: paymentIntent.id,
          customerName: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
          address: `${formData.address}, ${formData.city}, ${formData.state}, ${formData.country}`,
          city: formData.city,
          zipCode: '',
          products: cart.map(item => ({
            productId: item._id || item.productId,
            name: item.name,
            quantity: item.quantity,
            price: item.discountedPrice || item.price,
            category: item.category,
            size: item.selectedSize,
            color: item.selectedColor
          })),
          totalAmount: cartTotal,
          couponCode: couponStatus.type === 'success' ? couponCode : null,
          paymentMethod: 'card'
        };

        const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/process-payment`, orderData);

        clearCart();

        // Navigate to success page with all details
        onOrderSuccess({
          order: response.data.order,
          customerName: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
          address: orderData.address,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          products: orderData.products,
          totalAmount: finalAmount,
          paymentMethod: 'card',
          isPaymentSuccess: true
        });
      }
    } catch (err) {
      console.error('Payment error:', err);
      setCardError('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

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
        zipCode: '',
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

      // Navigate to success page with all details
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
      <Card className="mb-4 border-0 shadow-sm" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <Card.Header style={{
          background: 'white',
          borderBottom: `1px solid ${logoColors.light}`,
          padding: '1rem 1.5rem'
        }}>
          <h5 style={{ color: logoColors.dark, fontWeight: '600', margin: 0 }}>
            Shipping Information
          </h5>
        </Card.Header>
        <Card.Body style={{ padding: '1.5rem' }}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label style={{ color: '#4A5568', fontWeight: '500' }}>First Name *</Form.Label>
                <Form.Control
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  isInvalid={!!errors.firstName}
                  style={{
                    borderRadius: '8px',
                    borderColor: logoColors.light,
                    padding: '0.6rem 1rem',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = logoColors.primary}
                  onBlur={(e) => e.target.style.borderColor = logoColors.light}
                />
                <Form.Control.Feedback type="invalid">{errors.firstName}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label style={{ color: '#4A5568', fontWeight: '500' }}>Last Name *</Form.Label>
                <Form.Control
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  isInvalid={!!errors.lastName}
                  style={{
                    borderRadius: '8px',
                    borderColor: logoColors.light,
                    padding: '0.6rem 1rem'
                  }}
                  onFocus={(e) => e.target.style.borderColor = logoColors.primary}
                  onBlur={(e) => e.target.style.borderColor = logoColors.light}
                />
                <Form.Control.Feedback type="invalid">{errors.lastName}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label style={{ color: '#4A5568', fontWeight: '500' }}>Email Address *</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              isInvalid={!!errors.email}
              style={{
                borderRadius: '8px',
                borderColor: logoColors.light,
                padding: '0.6rem 1rem'
              }}
              onFocus={(e) => e.target.style.borderColor = logoColors.primary}
              onBlur={(e) => e.target.style.borderColor = logoColors.light}
            />
            <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label style={{ color: '#4A5568', fontWeight: '500' }}>Phone Number *</Form.Label>
            <Form.Control
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              isInvalid={!!errors.phone}
              style={{
                borderRadius: '8px',
                borderColor: logoColors.light,
                padding: '0.6rem 1rem'
              }}
              onFocus={(e) => e.target.style.borderColor = logoColors.primary}
              onBlur={(e) => e.target.style.borderColor = logoColors.light}
            />
            <Form.Control.Feedback type="invalid">{errors.phone}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label style={{ color: '#4A5568', fontWeight: '500' }}>Street Address *</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="address"
              value={formData.address}
              onChange={handleChange}
              isInvalid={!!errors.address}
              style={{
                borderRadius: '8px',
                borderColor: logoColors.light,
                padding: '0.6rem 1rem',
                resize: 'vertical'
              }}
              onFocus={(e) => e.target.style.borderColor = logoColors.primary}
              onBlur={(e) => e.target.style.borderColor = logoColors.light}
            />
            <Form.Control.Feedback type="invalid">{errors.address}</Form.Control.Feedback>
          </Form.Group>

          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label style={{ color: '#4A5568', fontWeight: '500' }}>City *</Form.Label>
                <Form.Control
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  isInvalid={!!errors.city}
                  style={{
                    borderRadius: '8px',
                    borderColor: logoColors.light,
                    padding: '0.6rem 1rem'
                  }}
                  onFocus={(e) => e.target.style.borderColor = logoColors.primary}
                  onBlur={(e) => e.target.style.borderColor = logoColors.light}
                />
                <Form.Control.Feedback type="invalid">{errors.city}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label style={{ color: '#4A5568', fontWeight: '500' }}>State / Province *</Form.Label>
                <Form.Control
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  isInvalid={!!errors.state}
                  style={{
                    borderRadius: '8px',
                    borderColor: logoColors.light,
                    padding: '0.6rem 1rem'
                  }}
                  onFocus={(e) => e.target.style.borderColor = logoColors.primary}
                  onBlur={(e) => e.target.style.borderColor = logoColors.light}
                />
                <Form.Control.Feedback type="invalid">{errors.state}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label style={{ color: '#4A5568', fontWeight: '500' }}>Zip Code</Form.Label>
                <Form.Control
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  style={{
                    borderRadius: '8px',
                    borderColor: logoColors.light,
                    padding: '0.6rem 1rem'
                  }}
                  onFocus={(e) => e.target.style.borderColor = logoColors.primary}
                  onBlur={(e) => e.target.style.borderColor = logoColors.light}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label style={{ color: '#4A5568', fontWeight: '500' }}>Country *</Form.Label>
            <Form.Select
              name="country"
              value={formData.country}
              onChange={handleChange}
              isInvalid={!!errors.country}
              style={{
                borderRadius: '8px',
                borderColor: logoColors.light,
                padding: '0.6rem 1rem',
                cursor: 'pointer'
              }}
            >
              <option value="">Select Country</option>
              <option value="PK">Pakistan</option>
              <option value="US">United States</option>
              <option value="GB">United Kingdom</option>
              <option value="IN">India</option>
              <option value="CA">Canada</option>
              <option value="AU">Australia</option>
              <option value="DE">Germany</option>
              <option value="FR">France</option>
              <option value="CN">China</option>
              <option value="JP">Japan</option>
              <option value="AE">United Arab Emirates</option>
              <option value="SA">Saudi Arabia</option>
              <option value="TR">Turkey</option>
              <option value="OTHER">Other</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">{errors.country}</Form.Control.Feedback>
          </Form.Group>
        </Card.Body>
      </Card>

      {/* Payment Method Card */}
      <Card className="mb-4 border-0 shadow-sm" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <Card.Header style={{
          background: 'white',
          borderBottom: `1px solid ${logoColors.light}`,
          padding: '1rem 1.5rem'
        }}>
          <h5 style={{ color: logoColors.dark, fontWeight: '600', margin: 0 }}>
            Payment Method
          </h5>
        </Card.Header>
        <Card.Body style={{ padding: '1.5rem' }}>
          <Form.Group>
            <div className="d-flex gap-4 mb-3">
              <Form.Check
                type="radio"
                id="creditCard"
                name="paymentMethod"
                label={
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: '500' }}>Credit / Debit Card</span>
                    <span style={{
                      fontSize: '0.7rem',
                      padding: '2px 8px',
                      background: logoColors.softGradient,
                      color: logoColors.primary,
                      borderRadius: '12px'
                    }}>
                      Recommended
                    </span>
                  </span>
                }
                value="creditCard"
                checked={formData.paymentMethod === 'creditCard'}
                onChange={handleChange}
                style={{ color: '#4A5568' }}
              />
              <Form.Check
                type="radio"
                id="cashOnDelivery"
                name="paymentMethod"
                label="Cash on Delivery"
                value="cashOnDelivery"
                checked={formData.paymentMethod === 'cashOnDelivery'}
                onChange={handleChange}
                style={{ color: '#4A5568' }}
              />
            </div>
          </Form.Group>

          {formData.paymentMethod === 'creditCard' && (
            <div className="mt-4">
              {/* Card Details Section */}
              <div style={{ marginBottom: '1rem' }}>
                <Form.Label style={{ color: '#4A5568', fontWeight: '500', marginBottom: '0.5rem' }}>
                  Card Details
                </Form.Label>

                {/* Card Number Row */}
                <div style={{ marginBottom: '1rem' }}>
                  <div
                    style={{
                      border: `2px solid ${isCardFocused ? logoColors.primary : logoColors.light}`,
                      borderRadius: '12px',
                      padding: '0.75rem 1rem',
                      backgroundColor: 'white',
                      transition: 'all 0.2s ease',
                      boxShadow: isCardFocused ? `0 0 0 4px ${logoColors.primary}20` : 'none'
                    }}
                  >
                    <CardElement
                      options={cardElementOptions}
                      onFocus={() => setIsCardFocused(true)}
                      onBlur={() => setIsCardFocused(false)}
                    />
                  </div>
                </div>



                {/* Card Icons Row */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginTop: '0.5rem',
                  padding: '0.5rem 0',
                  borderTop: `1px solid ${logoColors.light}`
                }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <img
                      src="https://a.storyblok.com/f/191576/120x54/5bb33c9a1d/visa-logo.png"
                      alt="Visa"
                      style={{ height: '24px', width: 'auto', opacity: 0.8 }}
                      onError={(e) => e.target.style.display = 'none'}
                    />
                    <img
                      src="https://a.storyblok.com/f/191576/120x54/8d6cc9a092/mastercard-logo.png"
                      alt="Mastercard"
                      style={{ height: '24px', width: 'auto', opacity: 0.8 }}
                      onError={(e) => e.target.style.display = 'none'}
                    />
                    <img
                      src="https://a.storyblok.com/f/191576/120x54/3c5f96e3e2/amex-logo.png"
                      alt="American Express"
                      style={{ height: '24px', width: 'auto', opacity: 0.8 }}
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  </div>
                  <span style={{ color: '#A0AEC0', fontSize: '0.8rem', marginLeft: 'auto' }}>
                    🔒 Secured by Stripe
                  </span>
                </div>
              </div>

              {/* Card Error Message */}
              {cardError && (
                <Alert variant="danger" style={{
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  padding: '0.75rem 1rem',
                  background: '#FEF2F2',
                  border: '1px solid #FCA5A5',
                  color: '#991B1B'
                }}>
                  <span style={{ fontWeight: '500' }}>Payment Error:</span> {cardError}
                </Alert>
              )}

              {/* Security Note */}
              <p style={{
                fontSize: '0.8rem',
                color: '#718096',
                marginTop: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                <span>✓</span> Your card details are encrypted and secure
                <span style={{ marginLeft: 'auto' }}>PCI-DSS Compliant</span>
              </p>
            </div>
          )}

          
        </Card.Body>
      </Card>

      {errors.submit && (
        <Alert variant="danger" className="mb-4" style={{ borderRadius: '8px' }}>
          {errors.submit}
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
        <Button
          variant="outline-secondary"
          onClick={() => navigate('/cart')}
          className="order-2 order-md-1 w-100 w-md-auto"
          style={{
            borderColor: logoColors.light,
            color: logoColors.dark,
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            fontWeight: '500',
            background: 'white',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = logoColors.softGradient;
            e.target.style.borderColor = logoColors.primary;
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'white';
            e.target.style.borderColor = logoColors.light;
          }}
        >
          Back to Cart
        </Button>
        <Button
          type="button"
          variant="primary"
          className="order-1 order-md-2 w-100 w-md-auto"
          disabled={isSubmitting || processing || (formData.paymentMethod === 'creditCard' && !stripe)}
          onClick={formData.paymentMethod === 'creditCard' ? handlePayment : handleCODSubmit}
          style={{
            background: 'linear-gradient(135deg, #FF4B5C 0%, #E63946 100%)',
            border: 'none',
            padding: '1rem 2.5rem',
            borderRadius: '14px',
            fontWeight: '700',
            fontSize: '1.1rem',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            minWidth: '220px',
            boxShadow: '0 4px 15px rgba(230,57,70,0.3)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          onMouseEnter={(e) => {
            if (!isSubmitting && !processing) {
              e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(230,57,70,0.45)';
              e.currentTarget.style.filter = 'brightness(1.1)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isSubmitting && !processing) {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(230,57,70,0.3)';
              e.currentTarget.style.filter = 'none';
            }
          }}
        >
          {processing ? (
            <Spinner size="sm" animation="border" variant="light" />
          ) : isSubmitting ? (
            'Placing Order...'
          ) : formData.paymentMethod === 'creditCard' ? (
            `Pay Rs. ${finalAmount.toFixed(2)}`
          ) : (
            `Place Order - Rs. ${finalAmount.toFixed(2)}`
          )}
        </Button>
      </div>
    </>
  );
};

// Order Success Component - Professional styling without emojis
const OrderSuccessPage = ({ orderDetails, onContinueShopping }) => {
  const { customerName, email, phone, address, city, state, country, products, totalAmount, paymentMethod, isPaymentSuccess } = orderDetails;

  const countryName = country === 'PK' ? 'Pakistan' :
    country === 'US' ? 'United States' :
      country === 'GB' ? 'United Kingdom' :
        country;

  return (
    <Container fluid className="py-5" style={{ background: logoColors.background, minHeight: '100vh' }}>
      <Container>
        <Row className="justify-content-center">
          <Col lg={8}>
            {/* Success Message Header */}
            <Card className="border-0 shadow-sm mb-4" style={{
              borderRadius: '16px',
              overflow: 'hidden',
              border: `1px solid ${logoColors.light}`
            }}>
              <div style={{
                height: '4px',
                background: isPaymentSuccess ? '#22c55e' : logoColors.gradient
              }} />
              <Card.Body className="text-center py-5">
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: isPaymentSuccess ? '#22c55e20' : logoColors.softGradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem'
                }}>
                  <span style={{
                    fontSize: '2rem',
                    color: isPaymentSuccess ? '#22c55e' : logoColors.primary
                  }}>
                    ✓
                  </span>
                </div>
                <h2 style={{
                  color: isPaymentSuccess ? '#22c55e' : logoColors.dark,
                  fontWeight: '600',
                  marginBottom: '0.5rem'
                }}>
                  {isPaymentSuccess ? 'Payment Successful' : 'Order Confirmed'}
                </h2>
                <p style={{ color: '#4A5568', fontSize: '1rem', maxWidth: '400px', margin: '0 auto' }}>
                  Thank you, {customerName}! {isPaymentSuccess
                    ? 'Your payment has been processed successfully.'
                    : 'Your order has been placed successfully and will be delivered soon.'}
                </p>
              </Card.Body>
            </Card>

            {/* Order Summary Card */}
            <Card className="border-0 shadow-sm mb-4" style={{
              borderRadius: '16px',
              overflow: 'hidden',
              border: `1px solid ${logoColors.light}`
            }}>
              <Card.Header style={{
                background: 'white',
                borderBottom: `1px solid ${logoColors.light}`,
                padding: '1rem 1.5rem'
              }}>
                <h5 style={{ color: logoColors.dark, fontWeight: '600', margin: 0 }}>
                  Order Summary
                </h5>
              </Card.Header>
              <Card.Body style={{ padding: '1.5rem' }}>
                {/* Products List */}
                <div style={{ marginBottom: '1.5rem' }}>
                  {products.map((item, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem 0',
                      borderBottom: index < products.length - 1 ? `1px solid ${logoColors.light}` : 'none'
                    }}>
                      <div>
                        <div style={{ fontWeight: '500', color: '#2D3748', marginBottom: '0.25rem' }}>
                          {item.name}
                        </div>
                        <div style={{ color: '#718096', fontSize: '0.85rem' }}>
                          Quantity: {item.quantity} × Rs. {item.price}
                          {(item.size || item.color || item.selectedSize || item.selectedColor) && (
                            <div style={{ marginTop: '2px', color: logoColors.primary, fontWeight: '500' }}>
                              {(item.size || item.selectedSize) && <span className="me-2">Size: {item.size || item.selectedSize}</span>}
                              {(item.color || item.selectedColor) && <span>Color: {item.color || item.selectedColor}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                      <div style={{ fontWeight: '600', color: '#2D3748' }}>
                        Rs. {(item.quantity * item.price).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total Section */}
                <div style={{
                  background: logoColors.softGradient,
                  borderRadius: '8px',
                  padding: '1rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '600', color: logoColors.dark }}>Total Amount</span>
                    <span style={{
                      fontWeight: '700',
                      fontSize: '1.3rem',
                      color: logoColors.primary
                    }}>
                      Rs. {totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Customer Information Card */}
            <Card className="border-0 shadow-sm mb-4" style={{
              borderRadius: '16px',
              overflow: 'hidden',
              border: `1px solid ${logoColors.light}`
            }}>
              <Card.Header style={{
                background: 'white',
                borderBottom: `1px solid ${logoColors.light}`,
                padding: '1rem 1.5rem'
              }}>
                <h5 style={{ color: logoColors.dark, fontWeight: '600', margin: 0 }}>
                  Customer Information
                </h5>
              </Card.Header>
              <Card.Body style={{ padding: '1.5rem' }}>
                <Row>
                  <Col md={6}>
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '0.25rem' }}>
                        Full Name
                      </div>
                      <div style={{ fontWeight: '500', color: '#2D3748' }}>{customerName}</div>
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '0.25rem' }}>
                        Email Address
                      </div>
                      <div style={{ fontWeight: '500', color: '#2D3748' }}>{email}</div>
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '0.25rem' }}>
                        Phone Number
                      </div>
                      <div style={{ fontWeight: '500', color: '#2D3748' }}>{phone}</div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '0.25rem' }}>
                        Shipping Address
                      </div>
                      <div style={{ fontWeight: '500', color: '#2D3748' }}>
                        {address}<br />
                        {city}, {state}, {countryName}
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Payment Information Card */}
            <Card className="border-0 shadow-sm mb-4" style={{
              borderRadius: '16px',
              overflow: 'hidden',
              border: `1px solid ${logoColors.light}`
            }}>
              <Card.Header style={{
                background: 'white',
                borderBottom: `1px solid ${logoColors.light}`,
                padding: '1rem 1.5rem'
              }}>
                <h5 style={{ color: logoColors.dark, fontWeight: '600', margin: 0 }}>
                  Payment Information
                </h5>
              </Card.Header>
              <Card.Body style={{ padding: '1.5rem' }}>
                <Row>
                  <Col md={6}>
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '0.25rem' }}>
                        Payment Method
                      </div>
                      <div style={{ fontWeight: '500', color: '#2D3748' }}>
                        {paymentMethod === 'card' ? 'Credit / Debit Card' : 'Cash on Delivery'}
                      </div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '0.25rem' }}>
                        Payment Status
                      </div>
                      <div>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.85rem',
                          fontWeight: '500',
                          background: isPaymentSuccess ? '#22c55e20' : '#f59e0b20',
                          color: isPaymentSuccess ? '#22c55e' : '#f59e0b'
                        }}>
                          {isPaymentSuccess ? 'Paid' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Continue Shopping Button */}
            <div className="text-center mt-4">
              <Button
                onClick={onContinueShopping}
                style={{
                  background: logoColors.gradient,
                  border: 'none',
                  padding: '0.75rem 2.5rem',
                  borderRadius: '8px',
                  fontWeight: '500',
                  fontSize: '1rem',
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
            </div>

            {/* Order Reference Note */}
            <p style={{
              textAlign: 'center',
              color: '#718096',
              fontSize: '0.85rem',
              marginTop: '2rem'
            }}>
              A confirmation email has been sent to {email}
            </p>
          </Col>
        </Row>
      </Container>
    </Container>
  );
};

// Stripe loading wrapper component
const StripeElementsWrapper = ({ children, cart, cartTotal, clearCart, onOrderSuccess }) => {
  const [stripeReady, setStripeReady] = useState(false);
  const [stripeError, setStripeError] = useState(null);

  useEffect(() => {
    stripePromise
      .then(() => setStripeReady(true))
      .catch(err => setStripeError(err.message));
  }, []);

  if (stripeError) {
    return (
      <Alert variant="danger">
        <h4>Payment System Unavailable</h4>
        <p>We're unable to load the payment system. Please try again later.</p>
        <p className="text-muted">Error: {stripeError}</p>
      </Alert>
    );
  }

  if (!stripeReady) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Loading payment system...</p>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      {React.cloneElement(children, { cart, cartTotal, clearCart, onOrderSuccess })}
    </Elements>
  );
};

// Main CheckoutPage Component
const CheckoutPage = () => {
  const location = useLocation();
  const { cart: cartFromContext, clearCart } = useCart();
  const navigate = useNavigate();

  // Check for single product checkout from Order Now
  const singleProductCheckout = location.state?.products && location.state.products.length > 0;
  const cart = singleProductCheckout ? location.state.products : cartFromContext;
  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const cartTotal = cart.reduce((sum, item) => sum + ((item.isBundle ? item.bundlePrice : (item.discountedPrice || item.price)) * (item.quantity || 1)), 0);

  // Calculate discount for order summary
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountBreakdown, setDiscountBreakdown] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  const [couponStatus, setCouponStatus] = useState({ type: '', message: '' });
  // State for order success
  const [orderSuccessDetails, setOrderSuccessDetails] = useState(null);

  if (cartCount === 0 && !orderSuccessDetails) {
    return (
      <Container fluid className="py-5" style={{ background: logoColors.background, minHeight: '100vh' }}>
        <Container>
          <Card className="border-0 shadow-sm text-center py-5" style={{ borderRadius: '16px' }}>
            <Card.Body>
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
                <FiShoppingBag size={32} style={{ color: logoColors.primary }} />
              </div>
              <h5 style={{ color: logoColors.dark, marginBottom: '1rem' }}>Your cart is empty</h5>
              <Link
                to="/"
                style={{
                  color: logoColors.primary,
                  textDecoration: 'underline',
                  fontWeight: '500'
                }}
              >
                Continue shopping
              </Link>
            </Card.Body>
          </Card>
        </Container>
      </Container>
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
    // Cart is already cleared by CheckoutForm
  };

  const handleContinueShopping = () => {
    setOrderSuccessDetails(null);
    navigate('/catalog');
  };

  // If order success details exist, show the success page
  if (orderSuccessDetails) {
    return <OrderSuccessPage orderDetails={orderSuccessDetails} onContinueShopping={handleContinueShopping} />;
  }

  return (
    <Container fluid style={{ background: logoColors.background, minHeight: '100vh', padding: '2rem 0' }}>
      <Container>
        <Row>
          <Col lg={8}>
            <h2 className="mb-4" style={{ color: logoColors.dark }}>Checkout</h2>
            <div style={{
              height: '2px',
              background: `linear-gradient(90deg, transparent, ${logoColors.primary}40, transparent)`,
              width: '100px',
              marginBottom: '1.5rem'
            }} />

            <StripeElementsWrapper
              cart={cart}
              cartTotal={cartTotal}
              clearCart={clearCart}
              onOrderSuccess={handleOrderSuccess}
            >
              <CheckoutForm />
            </StripeElementsWrapper>
          </Col>

          <Col lg={4}>
            <Card className="border-0 shadow-sm" style={{
              borderRadius: '16px',
              overflow: 'hidden',
              position: 'sticky',
              top: '2rem',
              border: `1px solid ${logoColors.light}`
            }}>
              <Card.Header style={{
                background: 'white',
                borderBottom: `1px solid ${logoColors.light}`,
                padding: '1rem 1.5rem'
              }}>
                <h5 style={{ color: logoColors.dark, fontWeight: '600', margin: 0 }}>
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
                            <div style={{ color: '#2D3748', fontWeight: '500' }}>
                              {displayName}
                              <div style={{ fontSize: '0.85rem', color: '#718096' }}>
                                {paidQty} × Rs. {displayPrice}
                                {!item.isBundle && (item.selectedSize || item.selectedColor || item.size || item.color) && (
                                  <div style={{ marginTop: '2px', color: logoColors.primary, fontWeight: '500' }}>
                                    {(item.selectedSize || item.size) && <span className="me-2">Size: {item.selectedSize || item.size}</span>}
                                    {(item.selectedColor || item.color) && <span>Color: {item.selectedColor || item.color}</span>}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div style={{ color: '#2D3748', fontWeight: '600' }}>
                              Rs. {(displayPrice * paidQty).toFixed(2)}
                            </div>
                          </div>
                        </ListGroup.Item>
                        {freeQty > 0 && (
                          <ListGroup.Item className="border-0 px-0 mb-2 mt-n2" style={{ background: 'transparent' }}>
                            <div className="d-flex justify-content-between align-items-start">
                              <div style={{ color: logoColors.primary, fontWeight: '500', paddingLeft: '1rem' }}>
                                {freeQty} × {displayName} (Free)
                              </div>
                              <div style={{ color: logoColors.primary, fontWeight: '600' }}>Rs. 0.00</div>
                            </div>
                          </ListGroup.Item>
                        )}
                      </React.Fragment>
                    );
                  })}

                  <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${logoColors.light}` }}>
                    <div className="d-flex justify-content-between mb-2">
                      <div style={{ color: '#718096' }}>Subtotal</div>
                      <div style={{ color: '#2D3748', fontWeight: '500' }}>Rs. {cartTotal.toFixed(2)}</div>
                    </div>
                    {discountAmount > 0 && (
                      <div className="d-flex justify-content-between mb-2">
                        <div style={{ color: logoColors.primary }}>Total Savings</div>
                        <div style={{ color: logoColors.primary, fontWeight: '500' }}>-Rs. {discountAmount.toFixed(2)}</div>
                      </div>
                    )}
                    <div className="d-flex justify-content-between mt-2 pt-2 fw-bold" style={{ borderTop: `2px solid ${logoColors.background}` }}>
                      <div style={{ color: '#2D3748', fontSize: '1.1rem' }}>Total Amount</div>
                      <div style={{ color: logoColors.primary, fontSize: '1.3rem' }}>Rs. {finalAmount.toFixed(2)}</div>
                    </div>
                  </div>
                </ListGroup>

                <div className="mt-4">
                  <Form.Label style={{ color: '#4A5568', fontWeight: '500', marginBottom: '0.5rem' }}>
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
                        borderColor: logoColors.primary,
                        borderRight: 'none',
                        padding: '0.7rem 1rem',
                        fontWeight: '500'
                      }}
                    />
                    <Button
                      onClick={handleApplyCoupon}
                      style={{
                        background: 'linear-gradient(135deg, #e8304a 0%, #c41a32 100%)',
                        border: 'none',
                        borderRadius: '0 8px 8px 0',
                        padding: '0 1rem',
                        fontWeight: '600',
                        fontSize: '0.85rem',
                        boxShadow: '0 3px 10px rgba(200,25,50,0.35)',
                        letterSpacing: '0.2px',
                        color: 'white',
                        minWidth: '80px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #c41a32 0%, #a01025 100%)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(180,20,40,0.45)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #e8304a 0%, #c41a32 100%)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 3px 10px rgba(200,25,50,0.35)';
                      }}
                    >
                      Apply
                    </Button>
                  </div>
                  {couponStatus.message && (
                    <div
                      className={`mt-2 text-${couponStatus.type}`}
                      style={{
                        fontSize: '0.9rem',
                        color: couponStatus.type === 'success' ? logoColors.primary : '#E53E3E'
                      }}
                    >
                      {couponStatus.message}
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </Container>
  );
};

export default CheckoutPage;