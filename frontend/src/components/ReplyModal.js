// components/ReplyModal.js
import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { FiSend, FiCheck } from 'react-icons/fi';

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

const ReplyModal = ({ show, onHide, message, onSend }) => {
  const [replyData, setReplyData] = useState({
    subject: `Re: ${message?.subject || 'Your message'}`,
    content: ''
  });
  const [sending, setSending] = useState(false);
  const [isSent, setIsSent] = useState(false); // New state for success

  const handleSend = async () => {
    if (!replyData.subject || !replyData.content) {
      return;
    }

    setSending(true);
    try {
      await onSend({
        to: message.email,
        subject: replyData.subject,
        text: replyData.content
      });
      setIsSent(true); // Mark as sent successfully
    } catch (error) {
      alert(error.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      style={{
        backdropFilter: 'blur(5px)'
      }}
    >
      <Modal.Header
        closeButton
        style={{
          background: logoColors.softGradient,
          borderBottom: `1px solid ${logoColors.light}`,
          padding: '1rem 1.5rem'
        }}
      >
        <Modal.Title style={{ color: logoColors.dark, fontWeight: '600' }}>
          {isSent ? (
            <span style={{ color: logoColors.primary }}>
              <FiCheck className="me-2" style={{ color: logoColors.primary }} /> Reply Sent
            </span>
          ) : (
            `Reply to ${message?.name}`
          )}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ padding: '1.5rem', background: 'white' }}>
        {isSent ? (
          <Alert
            variant="success"
            className="mb-0"
            style={{
              background: logoColors.softGradient,
              border: `1px solid ${logoColors.light}`,
              color: logoColors.dark,
              borderRadius: '8px'
            }}
          >
            Your reply has been sent to <strong style={{ color: logoColors.primary }}>{message?.email}</strong>.
          </Alert>
        ) : (
          <Form>
            <Form.Group className="mb-3">
              <Form.Label style={{ color: logoColors.dark, fontWeight: '500' }}>Subject</Form.Label>
              <Form.Control
                type="text"
                value={replyData.subject}
                onChange={(e) => setReplyData({ ...replyData, subject: e.target.value })}
                style={{
                  borderRadius: '8px',
                  borderColor: logoColors.light
                }}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label style={{ color: logoColors.dark, fontWeight: '500' }}>Message</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                value={replyData.content}
                onChange={(e) => setReplyData({ ...replyData, content: e.target.value })}
                style={{
                  borderRadius: '8px',
                  borderColor: logoColors.light
                }}
              />
            </Form.Group>
          </Form>
        )}
      </Modal.Body>

      <Modal.Footer style={{
        borderTop: `1px solid ${logoColors.light}`,
        padding: '1rem 1.5rem',
        background: logoColors.lighterBg
      }}>
        <Button
          variant="secondary"
          onClick={onHide}
          style={{
            border: `1px solid ${logoColors.light}`,
            color: '#4A5568',
            background: 'white',
            padding: '0.5rem 1.5rem',
            borderRadius: '8px',
            fontWeight: '500',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = logoColors.softGradient;
            e.target.style.borderColor = logoColors.primary;
            e.target.style.color = logoColors.dark;
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'white';
            e.target.style.borderColor = logoColors.light;
            e.target.style.color = '#4A5568';
          }}
        >
          {isSent ? 'Close' : 'Cancel'}
        </Button>

        {!isSent && (
          <Button
            variant="danger"
            onClick={handleSend}
            disabled={sending || !replyData.content}
            style={{
              background: logoColors.gradient,
              border: 'none',
              padding: '0.5rem 1.5rem',
              borderRadius: '8px',
              fontWeight: '500',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              if (!sending) {
                e.target.style.opacity = '0.9';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = `0 4px 12px ${logoColors.primary}40`;
              }
            }}
            onMouseLeave={(e) => {
              if (!sending) {
                e.target.style.opacity = '1';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }
            }}
          >
            {sending ? (
              <>
                <Spinner as="span" size="sm" animation="border" variant="light" />
                <span className="ms-2">Sending...</span>
              </>
            ) : (
              <>
                <FiSend className="me-1" /> Send Reply
              </>
            )}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default ReplyModal;