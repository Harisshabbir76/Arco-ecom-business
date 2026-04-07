import React, { useEffect, useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa';

const GlobalWhatsAppButton = () => {
  const whatsappNumber = process.env.REACT_APP_WHATSAPP_ADMIN_NUMBER || '923471091917';
  const message = 'Hello! I am interested in kitchenware products from your website.';
  
  const handleWhatsAppClick = () => {
    const formattedNumber = whatsappNumber.replace(/[^0-9]/g, '');
    const encodedMessage = encodeURIComponent(message);
    const desktopAppUri = `whatsapp://send?phone=${formattedNumber}&text=${encodedMessage}`;
    const webUri = `https://web.whatsapp.com/send?phone=${formattedNumber}&text=${encodedMessage}`;

    if (navigator.platform.includes('Win') || navigator.platform.includes('Mac')) {
      window.location.href = desktopAppUri;
      setTimeout(() => {
        if (!document.hidden) {
          window.open(webUri, '_blank');
        }
      }, 500);
    } else {
      window.open(`https://wa.me/${formattedNumber}?text=${encodedMessage}`, '_blank');
    }
  };

  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      <style>
        {`
          @keyframes whatsapp-pulse {
            0% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.5); }
            70% { box-shadow: 0 0 0 20px rgba(37, 211, 102, 0); }
            100% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0); }
          }
          .whatsapp-float-btn {
            animation: whatsapp-pulse 2s infinite;
          }
        `}
      </style>
      <a
        href="#!"
        onClick={(e) => { e.preventDefault(); handleWhatsAppClick(); }}
        className="whatsapp-float-btn"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          zIndex: 99999,
          backgroundColor: '#25D366',
          color: 'white',
          width: '65px',
          height: '65px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '35px',
          boxShadow: '0 8px 24px rgba(37, 211, 102, 0.4)',
          textDecoration: 'none',
          transition: 'all 0.3s ease',
          transform: isHovered ? 'translateY(-5px) rotate(10deg)' : 'translateY(0) rotate(0deg)',
          cursor: 'pointer'
        }}
        title="Chat with Admin on WhatsApp"
        aria-label="Chat with Admin on WhatsApp"
      >
        <FaWhatsapp />
      </a>
    </>
  );
};

export default GlobalWhatsAppButton;
