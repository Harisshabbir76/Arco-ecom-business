// components/WhatsAppButton.js
import React from 'react';
import { Button } from 'react-bootstrap';
import { FaWhatsapp } from 'react-icons/fa';

const WhatsAppButton = ({ order }) => {
  const formatPhoneNumber = (phone) => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');

    // If number starts with country code (like 92 for Pakistan), keep it
    // If it starts with 0, replace with country code
    if (cleaned.startsWith('0')) {
      return '92' + cleaned.substring(1); // Replace leading 0 with 92
    }
    return cleaned;
  };

  const handleWhatsAppClick = () => {
    // Format the message
    const productsList = order.products.map(p => {
      let variantStr = '';
      if (p.size || p.color) {
        variantStr = ` (${[p.size, p.color].filter(Boolean).join(', ')})`;
      }
      return `${p.name}${variantStr} (x${p.quantity})`;
    }).join('\n');

    const message = `Hello ${order.customerName},\n\nYour order has been confirmed!\n\nOrder Details:\n${productsList}\n\nTotal Amount: Rs. ${order.totalAmount.toFixed(2)}\n\nThank you for shopping with us!`;

    // Format the phone number properly
    const rawPhone = order.phone; // Should be in format +92XXXXXXXXXX or 0XXXXXXXXXX
    const formattedPhone = formatPhoneNumber(rawPhone);

    if (!formattedPhone || formattedPhone.length < 11) {
      alert('Invalid phone number format');
      return;
    }

    // Encode the message for URL
    const encodedMessage = encodeURIComponent(message);

    // Create WhatsApp URIs
    const desktopAppUri = `whatsapp://send?phone=${formattedPhone}&text=${encodedMessage}`;
    const webUri = `https://web.whatsapp.com/send?phone=${formattedPhone}&text=${encodedMessage}`;

    // Try to open WhatsApp
    if (navigator.platform.includes('Win') || navigator.platform.includes('Mac')) {
      window.location.href = desktopAppUri;
      setTimeout(() => {
        if (!document.hidden) {
          window.open(webUri, '_blank');
        }
      }, 500);
    } else {
      window.open(webUri, '_blank');
    }
  };

  return (
    <Button
      variant="success"
      onClick={handleWhatsAppClick}
      className="d-flex align-items-center mt-3"
      style={{
        backgroundColor: '#25D366',
        borderColor: '#25D366',
      }}
    >
      <FaWhatsapp className="me-2" size={18} />
      Contact via WhatsApp
    </Button>
  );
};

export default WhatsAppButton;