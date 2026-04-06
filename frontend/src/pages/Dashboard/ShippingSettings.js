import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiArrowLeft, FiTruck, FiSave, FiDollarSign } from 'react-icons/fi';

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

export default function ShippingSettings() {
  const navigate = useNavigate();
  const [shippingCharge, setShippingCharge] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/settings`);
        setShippingCharge(response.data.shippingCharge);
      } catch (error) {
        console.error('Error fetching settings:', error);
        setMessage({ type: 'danger', text: 'Failed to load settings.' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/settings`, {
        shippingCharge: parseFloat(shippingCharge)
      });
      setMessage({ type: 'success', text: 'Shipping charges updated successfully!' });
    } catch (error) {
      console.error('Error updating settings:', error);
      setMessage({ type: 'danger', text: 'Failed to update shipping charges.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner animation="border" style={{ color: C.red, width: '2.5rem', height: '2.5rem', borderWidth: '3px' }} />
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;500;600;700&display=swap');
        
        .shipping-page {
          min-height: 100vh;
          background: ${C.white};
          font-family: 'Barlow', sans-serif;
        }

        .form-control:focus {
          border-color: ${C.red};
          box-shadow: 0 0 0 0.2rem ${C.red}20;
        }
      `}</style>

      <div className="shipping-page" style={{ padding: '2rem 0' }}>
        <Container style={{ maxWidth: '800px' }}>
          {/* Back Button */}
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'none',
              border: 'none',
              color: C.red,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.5rem',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 500
            }}
            onMouseEnter={(e) => e.target.style.opacity = '0.8'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >
            <FiArrowLeft size={16} /> Back to Dashboard
          </button>

          {/* Header */}
          <div className="mb-4">
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              fontSize: '0.68rem',
              fontWeight: 600,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: C.red,
              marginBottom: '0.5rem'
            }}>
              <span style={{ width: '5px', height: '5px', background: C.red, borderRadius: '50%' }} />
              Settings
            </div>
            <h1 style={{
              margin: 0,
              fontWeight: 700,
              fontSize: 'clamp(1.5rem, 4vw, 2rem)',
              color: C.charcoal,
              lineHeight: 1.2
            }}>
              Shipping Settings
            </h1>
            <div style={{
              height: '3px',
              width: '60px',
              background: C.red,
              borderRadius: '2px',
              marginTop: '0.5rem'
            }} />
            <p style={{ color: C.gray, fontSize: '0.85rem', marginTop: '0.5rem' }}>
              Manage your delivery and shipping charges
            </p>
          </div>

          {/* Stats Card */}
          <div className="mb-4">
            <div style={{
              background: C.redLight,
              borderRadius: '12px',
              padding: '1rem',
              border: `1px solid ${C.border}`,
              maxWidth: '300px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <FiTruck size={20} color={C.red} />
                <span style={{ fontSize: '0.7rem', color: C.gray, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Shipping Charge</span>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: C.red }}>
                Rs. {shippingCharge.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.7rem', color: C.gray }}>Per order</div>
            </div>
          </div>

          {/* Main Settings Card */}
          <Card className="border-0 shadow-sm" style={{ borderRadius: '16px', overflow: 'hidden', border: `1px solid ${C.border}` }}>
            <div style={{ 
              background: C.gradient, 
              padding: '1.5rem', 
              color: C.white,
              borderBottom: `1px solid ${C.border}`
            }}>
              <div className="d-flex align-items-center gap-3">
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FiTruck size={24} />
                </div>
                <div>
                  <h2 className="mb-0" style={{ fontSize: '1.25rem', fontWeight: 600 }}>Shipping Configuration</h2>
                  <p className="mb-0" style={{ opacity: 0.8, fontSize: '0.8rem' }}>Set the default shipping charge for all orders</p>
                </div>
              </div>
            </div>

            <Card.Body className="p-4">
              {message.text && (
                <Alert 
                  variant={message.type} 
                  className="mb-4" 
                  style={{ 
                    borderRadius: '8px', 
                    borderLeft: `4px solid ${message.type === 'success' ? '#10B981' : C.red}`,
                    background: message.type === 'success' ? '#D1FAE5' : C.redLight,
                    color: message.type === 'success' ? '#065F46' : C.red
                  }}
                >
                  {message.text}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-4">
                  <Form.Label style={{ fontWeight: 600, color: C.charcoal, marginBottom: '0.5rem' }}>
                    Default Shipping Charge
                  </Form.Label>
                  <div className="position-relative">
                    <span style={{
                      position: 'absolute',
                      left: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: C.red,
                      fontWeight: 500,
                      zIndex: 2
                    }}>
                      Rs.
                    </span>
                    <Form.Control
                      type="number"
                      value={shippingCharge}
                      onChange={(e) => setShippingCharge(e.target.value)}
                      placeholder="0"
                      required
                      min="0"
                      step="50"
                      style={{
                        padding: '0.85rem 1rem 0.85rem 3rem',
                        borderRadius: '10px',
                        border: `1.5px solid ${C.border}`,
                        fontSize: '1rem',
                        fontWeight: 500
                      }}
                      onFocus={(e) => e.target.style.borderColor = C.red}
                      onBlur={(e) => e.target.style.borderColor = C.border}
                    />
                  </div>
                  <Form.Text className="text-muted" style={{ color: C.gray, fontSize: '0.75rem', marginTop: '0.5rem', display: 'block' }}>
                    This amount will be added to the total at checkout.
                  </Form.Text>
                </Form.Group>

                <div className="d-flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    style={{
                      flex: 1,
                      background: C.white,
                      border: `1.5px solid ${C.border}`,
                      borderRadius: '30px',
                      padding: '0.75rem',
                      color: C.gray,
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.borderColor = C.red;
                      e.target.style.color = C.red;
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.borderColor = C.border;
                      e.target.style.color = C.gray;
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    style={{
                      flex: 1,
                      background: C.gradient,
                      border: 'none',
                      borderRadius: '30px',
                      padding: '0.75rem',
                      color: C.white,
                      fontWeight: 600,
                      cursor: isSaving ? 'not-allowed' : 'pointer',
                      opacity: isSaving ? 0.7 : 1,
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSaving) {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = `0 4px 12px ${C.red}40`;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSaving) {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                      }
                    }}
                  >
                    {isSaving ? (
                      <Spinner animation="border" size="sm" style={{ color: C.white, width: '18px', height: '18px', borderWidth: '2px' }} />
                    ) : (
                      <FiSave size={16} />
                    )}
                    {isSaving ? 'Updating...' : 'Save Settings'}
                  </button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Container>
      </div>
    </>
  );
}