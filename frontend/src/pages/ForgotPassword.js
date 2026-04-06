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
import { FiMail, FiLock, FiEye, FiEyeOff, FiCheckCircle, FiArrowLeft } from 'react-icons/fi';

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
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;500;600;700&display=swap');
                
                .forgot-password-page {
                    min-height: 100vh;
                    background: ${C.white};
                    font-family: 'Barlow', sans-serif;
                }

                .form-control:focus {
                    border-color: ${C.red};
                    box-shadow: 0 0 0 0.2rem ${C.red}20;
                }
            `}</style>

            <div className="forgot-password-page">
                <Container
                    fluid
                    className="d-flex justify-content-center align-items-center"
                    style={{ minHeight: '100vh', padding: '2rem' }}
                >
                    <Card className="shadow-lg border-0" style={{
                        width: '100%',
                        maxWidth: '480px',
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
                            <h2 className="text-white mb-2" style={{ fontFamily: 'Barlow, sans-serif', fontWeight: '700' }}>
                                Forgot Password
                            </h2>
                            <p className="mb-0" style={{ color: 'rgba(255,255,255,0.85)', fontFamily: 'Barlow, sans-serif' }}>
                                We'll send a 6-digit OTP to your email
                            </p>
                        </div>

                        <Card.Body style={{ padding: '2rem 1.5rem', background: C.white }}>
                            {/* Step Indicator */}
                            <div className="d-flex justify-content-center mb-4">
                                {steps.map((s, i) => (
                                    <div key={s.num} className="d-flex align-items-center">
                                        <div
                                            className="d-flex align-items-center justify-content-center rounded-circle"
                                            style={{
                                                width: 36,
                                                height: 36,
                                                background: step >= s.num ? C.gradient : C.lightGray,
                                                color: step >= s.num ? C.white : C.gray,
                                                fontSize: '0.9rem',
                                                fontWeight: 600,
                                                transition: 'all 0.3s ease',
                                                boxShadow: step >= s.num ? `0 4px 10px ${C.red}40` : 'none'
                                            }}
                                        >
                                            {step > s.num ? <FiCheckCircle size={18} /> : s.num}
                                        </div>
                                        <div
                                            className="mx-2"
                                            style={{
                                                fontSize: '0.7rem',
                                                color: step >= s.num ? C.charcoal : C.gray,
                                                fontWeight: step >= s.num ? '600' : '400',
                                                fontFamily: 'Barlow, sans-serif'
                                            }}
                                        >
                                            {s.label}
                                        </div>
                                        {i < steps.length - 1 && (
                                            <div
                                                style={{
                                                    width: 30,
                                                    height: 2,
                                                    background: step > s.num ? C.red : C.border,
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

                            {success && (
                                <Alert
                                    variant="success"
                                    className="text-center"
                                    style={{
                                        background: '#d4edda',
                                        border: `1px solid #28a745`,
                                        color: '#155724',
                                        borderRadius: '8px',
                                        fontFamily: 'Barlow, sans-serif'
                                    }}
                                >
                                    {success}
                                </Alert>
                            )}

                            {/* Step 1: Email */}
                            {step === 1 && (
                                <Form onSubmit={handleSendOtp}>
                                    <Form.Group className="mb-4">
                                        <Form.Label style={{ color: C.charcoal, fontWeight: '600', fontFamily: 'Barlow, sans-serif' }}>
                                            Email Address
                                        </Form.Label>
                                        <InputGroup>
                                            <InputGroup.Text style={{
                                                background: C.white,
                                                borderColor: C.border,
                                                color: C.red,
                                                borderRight: 'none'
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
                                                    borderColor: C.border,
                                                    padding: '0.75rem',
                                                    borderRadius: '0 8px 8px 0',
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
                                        <Form.Text className="text-muted" style={{ color: C.gray, fontFamily: 'Barlow, sans-serif' }}>
                                            We'll send a 6-digit OTP to this email.
                                        </Form.Text>
                                    </Form.Group>
                                    <Button
                                        type="submit"
                                        className="w-100 py-3"
                                        disabled={loading}
                                        style={{
                                            background: C.gradient,
                                            border: 'none',
                                            fontSize: '1rem',
                                            fontWeight: '600',
                                            borderRadius: '30px',
                                            transition: 'all 0.3s ease',
                                            fontFamily: 'Barlow, sans-serif'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!loading) {
                                                e.target.style.opacity = '0.9';
                                                e.target.style.transform = 'translateY(-2px)';
                                                e.target.style.boxShadow = `0 4px 12px ${C.red}40`;
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
                                        <Form.Label style={{ color: C.charcoal, fontWeight: '600', fontFamily: 'Barlow, sans-serif' }}>
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
                                                borderColor: C.border,
                                                padding: '0.75rem',
                                                borderRadius: '8px',
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
                                        <Form.Text className="text-muted" style={{ color: C.gray, fontFamily: 'Barlow, sans-serif' }}>
                                            OTP sent to <strong style={{ color: C.red }}>{email}</strong>. Valid for 10 minutes.
                                        </Form.Text>
                                    </Form.Group>
                                    <Button
                                        type="submit"
                                        className="w-100 py-3 mb-2"
                                        disabled={loading}
                                        style={{
                                            background: C.gradient,
                                            border: 'none',
                                            fontSize: '1rem',
                                            fontWeight: '600',
                                            borderRadius: '30px',
                                            transition: 'all 0.3s ease',
                                            fontFamily: 'Barlow, sans-serif'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!loading) {
                                                e.target.style.opacity = '0.9';
                                                e.target.style.transform = 'translateY(-2px)';
                                                e.target.style.boxShadow = `0 4px 12px ${C.red}40`;
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
                                    <button
                                        onClick={() => { setStep(1); setError(''); setSuccess(''); }}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: C.red,
                                            fontSize: '0.85rem',
                                            fontWeight: '500',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            fontFamily: 'Barlow, sans-serif',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '4px',
                                            width: '100%'
                                        }}
                                        onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                                        onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                                    >
                                        <FiArrowLeft size={14} /> Change Email
                                    </button>
                                </Form>
                            )}

                            {/* Step 3: New Password */}
                            {step === 3 && (
                                <Form onSubmit={handleResetPassword}>
                                    <Form.Group className="mb-3">
                                        <Form.Label style={{ color: C.charcoal, fontWeight: '600', fontFamily: 'Barlow, sans-serif' }}>
                                            New Password
                                        </Form.Label>
                                        <InputGroup>
                                            <InputGroup.Text style={{
                                                background: C.white,
                                                borderColor: C.border,
                                                color: C.red,
                                                borderRight: 'none'
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
                                                    borderColor: C.border,
                                                    padding: '0.75rem',
                                                    borderRadius: '0',
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
                                                onClick={() => setShowPassword(p => !p)}
                                                style={{
                                                    borderColor: C.border,
                                                    color: C.red,
                                                    background: C.white,
                                                    borderRadius: '0 8px 8px 0',
                                                    borderLeft: 'none'
                                                }}
                                            >
                                                {showPassword ? <FiEyeOff /> : <FiEye />}
                                            </Button>
                                        </InputGroup>
                                    </Form.Group>
                                    <Form.Group className="mb-4">
                                        <Form.Label style={{ color: C.charcoal, fontWeight: '600', fontFamily: 'Barlow, sans-serif' }}>
                                            Confirm Password
                                        </Form.Label>
                                        <InputGroup>
                                            <InputGroup.Text style={{
                                                background: C.white,
                                                borderColor: C.border,
                                                color: C.red,
                                                borderRight: 'none'
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
                                                    borderColor: C.border,
                                                    padding: '0.75rem',
                                                    borderRadius: '0 8px 8px 0',
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
                                        className="w-100 py-3"
                                        disabled={loading}
                                        style={{
                                            background: C.gradient,
                                            border: 'none',
                                            fontSize: '1rem',
                                            fontWeight: '600',
                                            borderRadius: '30px',
                                            transition: 'all 0.3s ease',
                                            fontFamily: 'Barlow, sans-serif'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!loading) {
                                                e.target.style.opacity = '0.9';
                                                e.target.style.transform = 'translateY(-2px)';
                                                e.target.style.boxShadow = `0 4px 12px ${C.red}40`;
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
                                <button
                                    onClick={() => navigate('/login')}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: C.red,
                                        fontSize: '0.85rem',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        fontFamily: 'Barlow, sans-serif'
                                    }}
                                    onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                                    onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                                >
                                    ← Back to Login
                                </button>
                            </div>
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