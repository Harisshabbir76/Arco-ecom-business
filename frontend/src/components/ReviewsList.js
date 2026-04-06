import React from 'react';
import { Card, ListGroup, Badge } from 'react-bootstrap';
import Rating from './Rating';
import axios from 'axios';

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

const ReviewsList = ({ reviews, productId, onReviewSubmit }) => {
  return (
    <div className="my-4">
      <h4 style={{ color: logoColors.dark, marginBottom: '1.5rem' }}>Customer Reviews</h4>

      {/* Decorative line */}
      <div style={{
        height: '2px',
        background: `linear-gradient(90deg, ${logoColors.primary}40, transparent)`,
        width: '100px',
        marginBottom: '1.5rem'
      }} />

      {reviews.length === 0 ? (
        <p style={{ color: '#4A5568', fontStyle: 'italic', textAlign: 'center', padding: '2rem' }}>
          No reviews yet. Be the first to review!
        </p>
      ) : (
        <ListGroup variant="flush">
          {reviews.map((review, index) => (
            <ListGroup.Item
              key={review._id}
              className="px-0 mb-3 border-0"
              style={{ background: 'transparent' }}
            >
              <Card
                className="border-0 shadow-sm"
                style={{
                  borderRadius: '12px',
                  background: 'white',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 6px 16px ${logoColors.primary}30`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                }}
              >
                <Card.Body style={{ padding: '1.5rem' }}>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <strong style={{ color: logoColors.dark, fontSize: '1.1rem' }}>
                        {review.userName}
                      </strong>
                      <small style={{ color: '#718096', marginLeft: '0.5rem' }}>
                        {review.userEmail}
                      </small>
                    </div>
                    <Rating
                      value={review.rating}
                      size={18}
                      readOnly
                      color={logoColors.primary}
                      activeColor={logoColors.primary}
                    />
                  </div>

                  <Card.Text style={{
                    color: '#4A5568',
                    lineHeight: '1.6',
                    margin: '1rem 0',
                    fontSize: '1rem'
                  }}>
                    {review.comment}
                  </Card.Text>

                  <div className="d-flex align-items-center">
                    <div style={{
                      height: '4px',
                      width: '4px',
                      background: logoColors.primary,
                      borderRadius: '50%',
                      marginRight: '0.5rem'
                    }} />
                    <small style={{ color: '#718096' }}>
                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </small>
                  </div>
                </Card.Body>
              </Card>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}

      {/* Show total reviews count */}
      {reviews.length > 0 && (
        <div className="text-center mt-3">
          <Badge
            style={{
              background: logoColors.softGradient,
              color: logoColors.dark,
              border: `1px solid ${logoColors.light}`,
              padding: '0.5rem 1rem',
              borderRadius: '50px',
              fontWeight: '500',
              fontSize: '0.9rem'
            }}
          >
            Total {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
          </Badge>
        </div>
      )}
    </div>
  );
};

export default ReviewsList;