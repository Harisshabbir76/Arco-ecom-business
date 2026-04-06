import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Form,
  Button,
  Alert,
  Card,
  InputGroup
} from 'react-bootstrap';
import { FiUser, FiMail, FiLock, FiCalendar, FiAtSign, FiUserPlus, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { Spinner } from 'react-bootstrap';

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

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);

    setIsLoading(true);
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/signup`, {
        name,
        email,
        password,
        age,
        username
      });
      if (res.data.success || res.status === 200 || res.status === 201 || res.data.token) {
        toast.success("Signup Successful!");
        navigate('/login');
      } else {
        toast.success("Signup Successful!");
        navigate('/login');
      }
    } catch (err) {
      console.log(err);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Signup failed. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;500;600;700&display=swap');
        
        .signup-page {
          min-height: 100vh;
          background: ${C.white};
          font-family: 'Barlow', sans-serif;
        }

        .form-control:focus {
          border-color: ${C.red};
          box-shadow: 0 0 0 0.2rem ${C.red}20;
        }
      `}</style>

      <div className="signup-page">
        <Container
          fluid
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: '100vh', padding: '2rem' }}
        >
          <Card className="shadow-lg border-0" style={{
            width: '100%',
            maxWidth: '500px',
            borderRadius: '16px',
            overflow: 'hidden',
            border: `1px solid ${C.border}`
          }}>
            {/* Card Header with Red Gradient */}
            <div style={{
              background: C.gradient,
              padding: '2rem 1.5rem',
              textAlign: 'center'
            }}>
              <h1 className="text-white mb-0" style={{ fontFamily: 'Barlow, sans-serif', fontWeight: '700', fontSize: '2rem' }}>
                Create Account
              </h1>
              <p className="mt-2" style={{ color: 'rgba(255,255,255,0.85)', fontFamily: 'Barlow, sans-serif' }}>
                Join us today! It's free and easy
              </p>
            </div>

            <Card.Body style={{ padding: '2rem 1.5rem', background: C.white }}>
              {error && (
                <Alert
                  variant="danger"
                  className="text-center"
                  style={{
                    background: C.redLight,
                    border: `1px solid ${C.red}`,
                    color: C.red,
                    borderRadius: '8px',
                    fontFamily: 'Barlow, sans-serif'
                  }}
                >
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSignup}>
                {/* Full Name */}
                <Form.Group className="mb-3">
                  <Form.Label style={{ color: C.charcoal, fontWeight: '600', fontFamily: 'Barlow, sans-serif' }}>
                    Full Name
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text style={{
                      background: C.white,
                      borderColor: C.border,
                      color: C.red,
                      borderRight: 'none'
                    }}>
                      <FiUser size={18} />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      style={{
                        borderColor: C.border,
                        padding: '0.75rem',
                        borderRadius: '0 8px 8px 0',
                        transition: 'all 0.3s ease',
                        fontFamily: 'Barlow, sans-serif'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = C.red;
                        e.target.style.boxShadow = `0 0 0 3px ${C.red}20`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = C.border;
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </InputGroup>
                </Form.Group>

                {/* Username */}
                <Form.Group className="mb-3">
                  <Form.Label style={{ color: C.charcoal, fontWeight: '600', fontFamily: 'Barlow, sans-serif' }}>
                    Username
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text style={{
                      background: C.white,
                      borderColor: C.border,
                      color: C.red,
                      borderRight: 'none'
                    }}>
                      <FiAtSign size={18} />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Choose a username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      style={{
                        borderColor: C.border,
                        padding: '0.75rem',
                        borderRadius: '0 8px 8px 0',
                        transition: 'all 0.3s ease',
                        fontFamily: 'Barlow, sans-serif'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = C.red;
                        e.target.style.boxShadow = `0 0 0 3px ${C.red}20`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = C.border;
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </InputGroup>
                </Form.Group>

                {/* Email */}
                <Form.Group className="mb-3">
                  <Form.Label style={{ color: C.charcoal, fontWeight: '600', fontFamily: 'Barlow, sans-serif' }}>
                    Email
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text style={{
                      background: C.white,
                      borderColor: C.border,
                      color: C.red,
                      borderRight: 'none'
                    }}>
                      <FiMail size={18} />
                    </InputGroup.Text>
                    <Form.Control
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      style={{
                        borderColor: C.border,
                        padding: '0.75rem',
                        borderRadius: '0 8px 8px 0',
                        transition: 'all 0.3s ease',
                        fontFamily: 'Barlow, sans-serif'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = C.red;
                        e.target.style.boxShadow = `0 0 0 3px ${C.red}20`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = C.border;
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </InputGroup>
                </Form.Group>

                {/* Password */}
                <Form.Group className="mb-3">
                  <Form.Label style={{ color: C.charcoal, fontWeight: '600', fontFamily: 'Barlow, sans-serif' }}>
                    Password
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text style={{
                      background: C.white,
                      borderColor: C.border,
                      color: C.red,
                      borderRight: 'none'
                    }}>
                      <FiLock size={18} />
                    </InputGroup.Text>
                    <Form.Control
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      style={{
                        borderColor: C.border,
                        padding: '0.75rem',
                        borderRadius: '0',
                        transition: 'all 0.3s ease',
                        fontFamily: 'Barlow, sans-serif'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = C.red;
                        e.target.style.boxShadow = `0 0 0 3px ${C.red}20`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = C.border;
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        borderColor: C.border,
                        color: C.red,
                        background: C.white,
                        borderRadius: '0 8px 8px 0',
                        borderLeft: 'none'
                      }}
                    >
                      {showPassword ? <FiEye size={18} /> : <FiEyeOff size={18} />}
                    </Button>
                  </InputGroup>
                </Form.Group>

                {/* Age */}
                <Form.Group className="mb-4">
                  <Form.Label style={{ color: C.charcoal, fontWeight: '600', fontFamily: 'Barlow, sans-serif' }}>
                    Age
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text style={{
                      background: C.white,
                      borderColor: C.border,
                      color: C.red,
                      borderRight: 'none'
                    }}>
                      <FiCalendar size={18} />
                    </InputGroup.Text>
                    <Form.Control
                      type="number"
                      placeholder="Enter your age"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      min="13"
                      max="120"
                      required
                      style={{
                        borderColor: C.border,
                        padding: '0.75rem',
                        borderRadius: '0 8px 8px 0',
                        transition: 'all 0.3s ease',
                        fontFamily: 'Barlow, sans-serif'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = C.red;
                        e.target.style.boxShadow = `0 0 0 3px ${C.red}20`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = C.border;
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </InputGroup>
                </Form.Group>

                <Button
                  type="submit"
                  className="w-100 mb-3 py-3"
                  disabled={isLoading}
                  style={{
                    background: C.gradient,
                    border: 'none',
                    fontSize: '1rem',
                    fontWeight: '600',
                    borderRadius: '30px',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    opacity: isLoading ? 0.7 : 1,
                    fontFamily: 'Barlow, sans-serif'
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading) {
                      e.target.style.opacity = '0.9';
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = `0 4px 15px ${C.red}40`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading) {
                      e.target.style.opacity = '1';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }
                  }}
                >
                  {isLoading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" style={{ color: C.white }} />
                      <span>Signing up...</span>
                    </>
                  ) : (
                    <>
                      <FiUserPlus size={20} />
                      Sign Up
                    </>
                  )}
                </Button>

                {/* Decorative divider */}
                <div className="d-flex align-items-center my-3">
                  <div style={{
                    flex: 1,
                    height: '1px',
                    background: `linear-gradient(90deg, transparent, ${C.border}, transparent)`
                  }} />
                  <span style={{ color: C.gray, padding: '0 1rem', fontSize: '0.85rem', fontFamily: 'Barlow, sans-serif' }}>
                    Already have an account?
                  </span>
                  <div style={{
                    flex: 1,
                    height: '1px',
                    background: `linear-gradient(90deg, transparent, ${C.border}, transparent)`
                  }} />
                </div>

                <div className="text-center">
                  <button
                    onClick={() => navigate('/login')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: C.red,
                      fontWeight: '600',
                      fontSize: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      fontFamily: 'Barlow, sans-serif'
                    }}
                    onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                    onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                  >
                    Login
                  </button>
                </div>
              </Form>
            </Card.Body>

            {/* Bottom decorative line */}
            <div style={{
              height: '4px',
              background: C.gradient,
              width: '100%'
            }} />
          </Card>
        </Container>
      </div>
    </>
  );
}