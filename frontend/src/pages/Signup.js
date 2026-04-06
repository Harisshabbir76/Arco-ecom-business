import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Form,
  Button,
  Alert,
  Card,
  Stack,
  InputGroup
} from 'react-bootstrap';
import { FiUser, FiMail, FiLock, FiCalendar, FiAtSign, FiUserPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { Spinner } from 'react-bootstrap';

// Navbar color palette
const logoColors = {
  primary: '#fe7e8b', // Navbar primary color
  secondary: '#e65c70', // Navbar secondary color
  light: '#ffd1d4', // Navbar light color
  dark: '#d64555', // Navbar dark color
  background: '#fff5f6', // Super light - almost white
  gradient: 'linear-gradient(135deg, #fe7e8b 0%, #e65c70 100%)', // Navbar gradient
  softGradient: 'linear-gradient(135deg, #fff5f6 0%, #ffd1d4 100%)', // Very soft gradient
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
    <Container
      fluid
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: '100vh', background: logoColors.background }}
    >
      <Card className="shadow-lg border-0" style={{
        width: '100%',
        maxWidth: '500px',
        borderRadius: '16px',
        overflow: 'hidden'
      }}>
        {/* Card Header with Pink Gradient */}
        <div style={{
          background: logoColors.gradient,
          padding: '2rem 1.5rem',
          textAlign: 'center'
        }}>
          <h1 className="text-white mb-0" style={{ fontWeight: '600', fontSize: '2rem' }}>
            Create Account
          </h1>
          <p className="text-white-50 mt-2" style={{ opacity: 0.9 }}>
            Join us today! It's free and easy
          </p>
        </div>

        <Card.Body style={{ padding: '2rem 1.5rem' }}>
          {error && (
            <Alert
              variant="danger"
              className="text-center"
              style={{
                background: '#ffd1d4',
                border: `1px solid ${logoColors.primary}`,
                color: logoColors.dark,
                borderRadius: '8px'
              }}
            >
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSignup}>
            {/* Full Name */}
            <Form.Group className="mb-3">
              <Form.Label style={{ color: logoColors.dark, fontWeight: '500' }}>
                Full Name
              </Form.Label>
              <InputGroup>
                <InputGroup.Text style={{
                  background: 'white',
                  borderColor: logoColors.light,
                  color: logoColors.primary
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
                    borderColor: logoColors.light,
                    padding: '0.75rem',
                    borderRadius: '0 8px 8px 0',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = logoColors.primary;
                    e.target.style.boxShadow = `0 0 0 3px ${logoColors.primary}20`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = logoColors.light;
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </InputGroup>
            </Form.Group>

            {/* Username */}
            <Form.Group className="mb-3">
              <Form.Label style={{ color: logoColors.dark, fontWeight: '500' }}>
                Username
              </Form.Label>
              <InputGroup>
                <InputGroup.Text style={{
                  background: 'white',
                  borderColor: logoColors.light,
                  color: logoColors.primary
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
                    borderColor: logoColors.light,
                    padding: '0.75rem',
                    borderRadius: '0 8px 8px 0',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = logoColors.primary;
                    e.target.style.boxShadow = `0 0 0 3px ${logoColors.primary}20`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = logoColors.light;
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </InputGroup>
            </Form.Group>

            {/* Email */}
            <Form.Group className="mb-3">
              <Form.Label style={{ color: logoColors.dark, fontWeight: '500' }}>
                Email
              </Form.Label>
              <InputGroup>
                <InputGroup.Text style={{
                  background: 'white',
                  borderColor: logoColors.light,
                  color: logoColors.primary
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
                    borderColor: logoColors.light,
                    padding: '0.75rem',
                    borderRadius: '0 8px 8px 0',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = logoColors.primary;
                    e.target.style.boxShadow = `0 0 0 3px ${logoColors.primary}20`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = logoColors.light;
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </InputGroup>
            </Form.Group>

            {/* Password */}
            <Form.Group className="mb-3">
              <Form.Label style={{ color: logoColors.dark, fontWeight: '500' }}>
                Password
              </Form.Label>
              <InputGroup>
                <InputGroup.Text style={{
                  background: 'white',
                  borderColor: logoColors.light,
                  color: logoColors.primary
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
                    borderColor: logoColors.light,
                    padding: '0.75rem',
                    borderRadius: '0 8px 8px 0',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = logoColors.primary;
                    e.target.style.boxShadow = `0 0 0 3px ${logoColors.primary}20`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = logoColors.light;
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    borderColor: logoColors.light,
                    color: logoColors.primary,
                    background: 'white',
                    borderRadius: '0 8px 8px 0',
                    marginLeft: '-1px'
                  }}
                >
                  {showPassword ? '👁️' : '🔒'}
                </Button>
              </InputGroup>
            </Form.Group>

            {/* Age */}
            <Form.Group className="mb-4">
              <Form.Label style={{ color: logoColors.dark, fontWeight: '500' }}>
                Age
              </Form.Label>
              <InputGroup>
                <InputGroup.Text style={{
                  background: 'white',
                  borderColor: logoColors.light,
                  color: logoColors.primary
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
                    borderColor: logoColors.light,
                    padding: '0.75rem',
                    borderRadius: '0 8px 8px 0',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = logoColors.primary;
                    e.target.style.boxShadow = `0 0 0 3px ${logoColors.primary}20`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = logoColors.light;
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </InputGroup>
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="w-100 mb-3 py-3"
              disabled={isLoading}
              style={{
                background: logoColors.gradient,
                border: 'none',
                fontSize: '1.1rem',
                fontWeight: '500',
                borderRadius: '8px',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                opacity: isLoading ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.target.style.opacity = '0.9';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = `0 4px 15px ${logoColors.primary}40`;
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
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                  Signing up...
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
                background: `linear-gradient(90deg, transparent, ${logoColors.light}, transparent)`
              }} />
              <span style={{ color: '#718096', padding: '0 1rem', fontSize: '0.9rem' }}>Already have an account?</span>
              <div style={{
                flex: 1,
                height: '1px',
                background: `linear-gradient(90deg, transparent, ${logoColors.light}, transparent)`
              }} />
            </div>

            <div className="text-center">
              <a
                href="/login"
                style={{
                  color: logoColors.primary,
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '1rem',
                  transition: 'all 0.2s ease'
                }}
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/login');
                }}
                onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
              >
                Login
              </a>
            </div>
          </Form>
        </Card.Body>

        {/* Optional decorative element at bottom */}
        <div style={{
          height: '4px',
          background: logoColors.gradient,
          width: '100%'
        }} />
      </Card>
    </Container>
  );
}