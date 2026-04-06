import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import Rating from './Rating';

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

const ReviewForm = ({ productId, onReviewSubmit }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/reviews`,
        {
          product: productId,
          userName,
          userEmail,
          rating,
          comment
        }
      );

      setSuccess('Review submitted successfully');
      setError('');
      setRating(0);
      setComment('');
      setUserName('');
      setUserEmail('');
      onReviewSubmit(); // Refresh reviews
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error submitting review');
      setSuccess('');
    }
  };

  return (
    <div
      className="my-4 p-4 rounded"
      style={{
        background: logoColors.lighterBg,
        border: `1px solid ${logoColors.light}`,
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
      }}
    >
      <h4 style={{ color: logoColors.dark, marginBottom: '1.5rem' }}>Write a Review</h4>

      {error && (
        <Alert
          variant="danger"
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

      <Form onSubmit={submitHandler}>
        <Form.Group controlId="userName" className="mb-3">
          <Form.Label style={{ color: logoColors.dark, fontWeight: '500' }}>Your Name</Form.Label>
          <Form.Control
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            required
            style={{
              borderRadius: '8px',
              borderColor: logoColors.light,
              padding: '0.75rem'
            }}
          />
        </Form.Group>

        <Form.Group controlId="userEmail" className="mb-3">
          <Form.Label style={{ color: logoColors.dark, fontWeight: '500' }}>Your Email</Form.Label>
          <Form.Control
            type="email"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            required
            style={{
              borderRadius: '8px',
              borderColor: logoColors.light,
              padding: '0.75rem'
            }}
          />
        </Form.Group>

        <Form.Group controlId="rating" className="mb-3">
          <Form.Label style={{ color: logoColors.dark, fontWeight: '500' }}>Rating</Form.Label>
          <Rating
            value={rating}
            onChange={(value) => setRating(value)}
            size={24}
            color={logoColors.primary}
            activeColor={logoColors.primary}
            inactiveColor="#ccc"
          />
        </Form.Group>

        <Form.Group controlId="comment" className="mb-4">
          <Form.Label style={{ color: logoColors.dark, fontWeight: '500' }}>Review</Form.Label>
          <Form.Control
            as="textarea"
            rows="4"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            style={{
              borderRadius: '8px',
              borderColor: logoColors.light,
              padding: '0.75rem'
            }}
          />
        </Form.Group>

        <Button
          type="submit"
          variant="primary"
          style={{
            background: logoColors.gradient,
            border: 'none',
            padding: '0.75rem 2rem',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '1rem',
            transition: 'all 0.3s ease',
            minWidth: '150px'
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
          Submit Review
        </Button>
      </Form>
    </div>
  );
};

export default ReviewForm;