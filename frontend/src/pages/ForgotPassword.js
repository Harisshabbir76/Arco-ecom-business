import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Container,
    Card,
    Form,
    Button,
    Alert,
    Spinner,
    InputGroup
} from 'react-bootstrap';
import { FiMail, FiLock, FiEye, FiEyeOff, FiCheckCircle } from 'react-icons/fi';

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

const API = process.env.REACT_APP_API_URL;

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: new password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Step 1: Send OTP
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await axios.post(`${API}/forgot-password`, { email });
            setSuccess(`OTP sent to ${email}. Please check your inbox.`);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP. Please check your email.');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await axios.post(`${API}/verify-otp`, { email, otp });
            setSuccess('OTP verified! Now set your new password.');
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or expired OTP.');
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        setLoading(true);
        try {
            await axios.post(`${API}/reset-password`, { email, otp, newPassword });
            setSuccess('Password reset successfully! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { num: 1, label: 'Enter Email' },
        { num: 2, label: 'Verify OTP' },
        { num: 3, label: 'New Password' }
    ];

    return (
        <Container
            fluid
            className="d-flex justify-content-center align-items-center"
            style={{ minHeight: '100vh', background: logoColors.background }}
        >
            <Card className="shadow-lg border-0" style={{
                width: '100%',
                maxWidth: '480px',
                borderRadius: '16px',
                overflow: 'hidden'
            }}>
                {/* Card Header with Pink Gradient */}
                <div style={{
                    background: logoColors.gradient,
                    padding: '2rem 1.5rem',
                    textAlign: 'center'
                }}>
                    <h2 className="text-white mb-2" style={{ fontWeight: '600' }}>
                        Forgot Password
                    </h2>
                    <p className="text-white-50 mb-0" style={{ opacity: 0.9 }}>
                        We'll send a 6-digit OTP to your email
                    </p>
                </div>

                <Card.Body style={{ padding: '2rem 1.5rem' }}>
                    {/* Step Indicator */}
                    <div className="d-flex justify-content-center mb-4">
                        {steps.map((s, i) => (
                            <div key={s.num} className="d-flex align-items-center">
                                <div
                                    className="d-flex align-items-center justify-content-center rounded-circle"
                                    style={{
                                        width: 36,
                                        height: 36,
                                        background: step >= s.num
                                            ? logoColors.gradient
                                            : '#e9ecef',
                                        color: step >= s.num ? 'white' : '#6c757d',
                                        fontSize: '0.9rem',
                                        fontWeight: 600,
                                        transition: 'all 0.3s ease',
                                        boxShadow: step >= s.num ? `0 4px 10px ${logoColors.primary}40` : 'none'
                                    }}
                                >
                                    {step > s.num ? <FiCheckCircle size={18} /> : s.num}
                                </div>
                                <div
                                    className="mx-2"
                                    style={{
                                        fontSize: '0.75rem',
                                        color: step >= s.num ? logoColors.dark : '#6c757d',
                                        fontWeight: step >= s.num ? '600' : '400'
                                    }}
                                >
                                    {s.label}
                                </div>
                                {i < steps.length - 1 && (
                                    <div
                                        style={{
                                            width: 30,
                                            height: 2,
                                            background: step > s.num ? logoColors.primary : '#e9ecef',
                                            margin: '0 4px'
                                        }}
                                    />
                                )}
                            </div>
                        ))}
                    </div>

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

                    {success && (
                        <Alert
                            variant="success"
                            className="text-center"
                            style={{
                                background: logoColors.softGradient,
                                border: `1px solid ${logoColors.light}`,
                                color: logoColors.dark,
                                borderRadius: '8px'
                            }}
                        >
                            {success}
                        </Alert>
                    )}

                    {/* Step 1: Email */}
                    {step === 1 && (
                        <Form onSubmit={handleSendOtp}>
                            <Form.Group className="mb-4">
                                <Form.Label style={{ color: logoColors.dark, fontWeight: '500' }}>
                                    Email Address
                                </Form.Label>
                                <InputGroup>
                                    <InputGroup.Text style={{
                                        background: 'white',
                                        borderColor: logoColors.light,
                                        color: logoColors.primary
                                    }}>
                                        <FiMail />
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="email"
                                        placeholder="Enter your registered email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                        style={{
                                            borderColor: logoColors.light,
                                            padding: '0.75rem',
                                            borderRadius: '0 8px 8px 0'
                                        }}
                                    />
                                </InputGroup>
                                <Form.Text className="text-muted" style={{ color: '#718096' }}>
                                    We'll send a 6-digit OTP to this email.
                                </Form.Text>
                            </Form.Group>
                            <Button
                                type="submit"
                                className="w-100 py-3"
                                disabled={loading}
                                style={{
                                    background: logoColors.gradient,
                                    border: 'none',
                                    fontSize: '1rem',
                                    fontWeight: '500',
                                    borderRadius: '8px',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    if (!loading) {
                                        e.target.style.opacity = '0.9';
                                        e.target.style.transform = 'translateY(-2px)';
                                        e.target.style.boxShadow = `0 4px 12px ${logoColors.primary}40`;
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!loading) {
                                        e.target.style.opacity = '1';
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.boxShadow = 'none';
                                    }
                                }}
                            >
                                {loading ? <Spinner size="sm" animation="border" variant="light" /> : 'Send OTP'}
                            </Button>
                        </Form>
                    )}

                    {/* Step 2: OTP */}
                    {step === 2 && (
                        <Form onSubmit={handleVerifyOtp}>
                            <Form.Group className="mb-4">
                                <Form.Label style={{ color: logoColors.dark, fontWeight: '500' }}>
                                    Enter OTP
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter the 6-digit OTP"
                                    value={otp}
                                    onChange={e => setOtp(e.target.value)}
                                    maxLength={6}
                                    required
                                    style={{
                                        letterSpacing: '6px',
                                        fontSize: '1.6rem',
                                        textAlign: 'center',
                                        borderColor: logoColors.light,
                                        padding: '0.75rem',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Form.Text className="text-muted" style={{ color: '#718096' }}>
                                    OTP sent to <strong style={{ color: logoColors.primary }}>{email}</strong>. Valid for 10 minutes.
                                </Form.Text>
                            </Form.Group>
                            <Button
                                type="submit"
                                className="w-100 py-3 mb-2"
                                disabled={loading}
                                style={{
                                    background: logoColors.gradient,
                                    border: 'none',
                                    fontSize: '1rem',
                                    fontWeight: '500',
                                    borderRadius: '8px',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    if (!loading) {
                                        e.target.style.opacity = '0.9';
                                        e.target.style.transform = 'translateY(-2px)';
                                        e.target.style.boxShadow = `0 4px 12px ${logoColors.primary}40`;
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!loading) {
                                        e.target.style.opacity = '1';
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.boxShadow = 'none';
                                    }
                                }}
                            >
                                {loading ? <Spinner size="sm" animation="border" variant="light" /> : 'Verify OTP'}
                            </Button>
                            <Button
                                variant="link"
                                className="w-100"
                                onClick={() => { setStep(1); setError(''); setSuccess(''); }}
                                style={{ color: logoColors.primary, textDecoration: 'none' }}
                            >
                                ← Change Email
                            </Button>
                        </Form>
                    )}

                    {/* Step 3: New Password */}
                    {step === 3 && (
                        <Form onSubmit={handleResetPassword}>
                            <Form.Group className="mb-3">
                                <Form.Label style={{ color: logoColors.dark, fontWeight: '500' }}>
                                    New Password
                                </Form.Label>
                                <InputGroup>
                                    <InputGroup.Text style={{
                                        background: 'white',
                                        borderColor: logoColors.light,
                                        color: logoColors.primary
                                    }}>
                                        <FiLock />
                                    </InputGroup.Text>
                                    <Form.Control
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="At least 6 characters"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        required
                                        minLength={6}
                                        style={{
                                            borderColor: logoColors.light,
                                            padding: '0.75rem'
                                        }}
                                    />
                                    <Button
                                        variant="outline-secondary"
                                        onClick={() => setShowPassword(p => !p)}
                                        style={{
                                            borderColor: logoColors.light,
                                            color: logoColors.primary,
                                            background: 'white'
                                        }}
                                    >
                                        {showPassword ? <FiEyeOff /> : <FiEye />}
                                    </Button>
                                </InputGroup>
                            </Form.Group>
                            <Form.Group className="mb-4">
                                <Form.Label style={{ color: logoColors.dark, fontWeight: '500' }}>
                                    Confirm Password
                                </Form.Label>
                                <InputGroup>
                                    <InputGroup.Text style={{
                                        background: 'white',
                                        borderColor: logoColors.light,
                                        color: logoColors.primary
                                    }}>
                                        <FiLock />
                                    </InputGroup.Text>
                                    <Form.Control
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Re-enter new password"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        required
                                        style={{
                                            borderColor: logoColors.light,
                                            padding: '0.75rem'
                                        }}
                                    />
                                </InputGroup>
                            </Form.Group>
                            <Button
                                type="submit"
                                className="w-100 py-3"
                                disabled={loading}
                                style={{
                                    background: logoColors.gradient,
                                    border: 'none',
                                    fontSize: '1rem',
                                    fontWeight: '500',
                                    borderRadius: '8px',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    if (!loading) {
                                        e.target.style.opacity = '0.9';
                                        e.target.style.transform = 'translateY(-2px)';
                                        e.target.style.boxShadow = `0 4px 12px ${logoColors.primary}40`;
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!loading) {
                                        e.target.style.opacity = '1';
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.boxShadow = 'none';
                                    }
                                }}
                            >
                                {loading ? <Spinner size="sm" animation="border" variant="light" /> : 'Reset Password'}
                            </Button>
                        </Form>
                    )}

                    {/* Back to Login */}
                    <div className="text-center mt-4">
                        <a
                            href="/login"
                            style={{ color: logoColors.primary, textDecoration: 'none', fontSize: '0.9rem' }}
                            onClick={e => { e.preventDefault(); navigate('/login'); }}
                            onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                            onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                        >
                            ← Back to Login
                        </a>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
}