// components/OrderDetailsModal.jsx
import React from 'react';
import { Modal } from 'react-bootstrap';
import {
  FiUser, FiShoppingBag, FiMapPin, FiPhone,
  FiMail, FiCalendar, FiCreditCard, FiX
} from 'react-icons/fi';
import WhatsAppButton from './WhatsAppButton';

/* ─── Design tokens (matches OrderManagement) ─── */
const C = {
  primary: '#fe7e8b',
  secondary: '#e65c70',
  light: '#ffd1d4',
  dark: '#d64555',
  bg: '#fff5f6',
  border: '#FFE4EC',
  text: '#2D3748',
  subtext: '#718096',
  muted: '#A0AEC0',
  gradient: 'linear-gradient(135deg, #fe7e8b 0%, #e65c70 100%)',
  softGrad: 'linear-gradient(135deg, #fff5f6 0%, #ffd1d4 100%)',
};

/* ─── Injected styles ─── */
const ModalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap');

    .odm .modal-content {
      border: 1.5px solid ${C.border} !important;
      border-radius: 20px !important;
      overflow: hidden;
      box-shadow: 0 24px 64px rgba(255,105,180,.18) !important;
      font-family: 'DM Sans', sans-serif;
    }
    .odm .modal-header { border: none !important; }
    .odm .modal-footer { border: none !important; }
    .odm .btn-close { filter: none !important; opacity: .6; }
    .odm .btn-close:hover { opacity: 1; }

    /* Product table */
    .odm-table { width: 100%; border-collapse: collapse; }
    .odm-table th {
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      color: ${C.subtext};
      padding: 0.75rem 1rem;
      background: ${C.bg};
      border-bottom: 1.5px solid ${C.border};
      text-align: left;
    }
    .odm-table th:last-child { text-align: right; }
    .odm-table td {
      padding: 0.8rem 1rem;
      border-bottom: 1px solid ${C.border};
      font-size: 0.875rem;
      color: ${C.text};
      vertical-align: middle;
    }
    .odm-table td:last-child { text-align: right; }
    .odm-table tbody tr:last-child td { border-bottom: none; }
    .odm-table tbody tr { transition: background .15s; }
    .odm-table tbody tr:hover { background: #FFF8FA; }

    /* Section header */
    .odm-section-title {
      font-family: 'DM Serif Display', serif;
      font-size: 1rem;
      font-weight: 400;
      font-style: italic;
      color: ${C.dark};
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    /* Info row */
    .odm-info-row {
      display: flex;
      align-items: flex-start;
      gap: 0.6rem;
      margin-bottom: 0.6rem;
    }
    .odm-info-icon {
      width: 28px; height: 28px;
      border-radius: 8px;
      background: ${C.softGrad};
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      margin-top: 1px;
    }
    .odm-info-label {
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      color: ${C.muted};
      line-height: 1;
      margin-bottom: 2px;
    }
    .odm-info-value {
      font-size: 0.875rem;
      color: ${C.text};
      font-weight: 500;
      line-height: 1.3;
    }

    /* Entrance animation */
    @keyframes odm-rise {
      from { opacity: 0; transform: translateY(12px) scale(.98); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    .odm .modal-content { animation: odm-rise .28s ease both; }

    /* Pulse dot */
    @keyframes odm-pulse {
      0%,100% { box-shadow: 0 0 0 0 rgba(255,105,180,.4); }
      50%      { box-shadow: 0 0 0 5px rgba(255,105,180,0); }
    }
    .odm-pulse-dot { animation: odm-pulse 1.8s ease infinite; }
  `}</style>
);

/* ─── Status badge ─── */
const StatusBadge = ({ status }) => {
  const map = {
    pending: { bg: 'linear-gradient(135deg,#FFC107,#FF9F00)', color: '#fff', label: 'Pending', dot: '#fff' },
    'out-for-delivery': { bg: C.gradient, color: '#fff', label: 'Out for Delivery', dot: '#fff', pulse: true },
    completed: { bg: 'linear-gradient(135deg,#48BB78,#38A169)', color: '#fff', label: 'Completed', dot: '#fff' },
  };
  const s = map[status] || { bg: C.softGrad, color: C.dark, label: status, dot: C.light };

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
      background: s.bg, color: s.color,
      borderRadius: 99, padding: '0.4rem 1rem',
      fontSize: '0.8rem', fontWeight: 700,
      letterSpacing: '0.04em',
      boxShadow: '0 4px 14px rgba(0,0,0,.1)'
    }}>
      <span style={{
        width: 7, height: 7, borderRadius: '50%',
        background: 'rgba(255,255,255,.75)',
        ...(s.pulse ? {} : {})
      }} className={s.pulse ? 'odm-pulse-dot' : ''} />
      {s.label}
    </span>
  );
};

/* ─── Info row ─── */
const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="odm-info-row">
    <div className="odm-info-icon">
      <Icon size={13} style={{ color: C.primary }} />
    </div>
    <div>
      <div className="odm-info-label">{label}</div>
      <div className="odm-info-value">{value}</div>
    </div>
  </div>
);

/* ─── Divider ─── */
const Divider = () => (
  <div style={{
    height: 1,
    background: `linear-gradient(90deg, ${C.border}, transparent)`,
    margin: '1.25rem 0'
  }} />
);

/* ─── Main modal ─── */
const OrderDetailsModal = ({ show, onHide, order }) => {
  if (!order) return null;

  const totalItems = order.products.reduce((s, p) => s + p.quantity, 0);

  return (
    <>
      <ModalStyle />
      <Modal
        show={show}
        onHide={onHide}
        size="lg"
        centered
        dialogClassName="odm"
        style={{ backdropFilter: 'blur(6px)' }}
      >
        {/* ── Header ── */}
        <Modal.Header
          closeButton
          style={{ background: C.softGrad, padding: '1.25rem 1.5rem' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            {/* Icon orb */}
            <div style={{
              width: 44, height: 44, borderRadius: 14,
              background: C.gradient,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 6px 18px rgba(255,105,180,.35)'
            }}>
              <FiShoppingBag size={20} color="white" />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.muted }}>
                Order Details
              </p>
              <h5 style={{
                margin: 0,
                fontFamily: 'DM Serif Display, serif',
                fontWeight: 400,
                color: C.dark,
                fontSize: '1.15rem',
                lineHeight: 1.2
              }}>
                #{order._id.substring(0, 8).toUpperCase()}
              </h5>
            </div>
          </div>
        </Modal.Header>

        {/* ── Body ── */}
        <Modal.Body style={{ padding: '1.5rem', background: 'white' }}>

          {/* Customer section */}
          <p className="odm-section-title">
            <span style={{
              width: 28, height: 28, borderRadius: 8,
              background: C.softGrad,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <FiUser size={13} style={{ color: C.primary }} />
            </span>
            Customer Information
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 2rem' }}>
            <InfoRow icon={FiUser} label="Name" value={order.customerName} />
            <InfoRow icon={FiPhone} label="Phone" value={order.phone} />
            <InfoRow icon={FiMail} label="Email" value={order.email} />
            <InfoRow icon={FiCalendar} label="Order Date" value={new Date(order.orderDate).toLocaleString()} />
          </div>

          <div style={{ marginTop: '0.25rem' }}>
            <InfoRow
              icon={FiMapPin}
              label="Delivery Address"
              value={`${order.address}, ${order.city}${order.zipCode ? `, ${order.zipCode}` : ''}`}
            />
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <WhatsAppButton order={order} />
          </div>

          <Divider />

          {/* Products section */}
          <p className="odm-section-title">
            <span style={{
              width: 28, height: 28, borderRadius: 8,
              background: C.softGrad,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <FiShoppingBag size={13} style={{ color: C.primary }} />
            </span>
            Order Items
            <span style={{
              marginLeft: 'auto',
              fontSize: '0.75rem',
              fontFamily: 'DM Sans, sans-serif',
              fontStyle: 'normal',
              fontWeight: 600,
              color: C.muted
            }}>
              {totalItems} item{totalItems !== 1 ? 's' : ''}
            </span>
          </p>

          <div style={{
            border: `1.5px solid ${C.border}`,
            borderRadius: 12,
            overflow: 'hidden'
          }}>
            <table className="odm-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th style={{ textAlign: 'center' }}>Qty</th>
                  <th style={{ textAlign: 'right' }}>Price</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.products.map((product, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>
                      {product.name}
                      {(product.size || product.color || product.selectedSize || product.selectedColor) && (
                        <div style={{ fontSize: '0.75rem', color: C.primary, fontWeight: 500, marginTop: '2px' }}>
                          {(product.size || product.selectedSize) && <span style={{ marginRight: '8px' }}>Size: {product.size || product.selectedSize}</span>}
                          {(product.color || product.selectedColor) && <span>Color: {product.color || product.selectedColor}</span>}
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{
                        background: C.softGrad,
                        color: C.primary,
                        borderRadius: 99,
                        padding: '2px 10px',
                        fontSize: '0.8rem',
                        fontWeight: 700
                      }}>
                        ×{product.quantity}
                      </span>
                    </td>
                    <td style={{ color: C.subtext, textAlign: 'right' }}>
                      Rs. {product.price.toFixed(2)}
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      <span style={{
                        background: C.gradient,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}>
                        Rs. {(product.price * product.quantity).toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Divider />

          {/* Summary row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            {/* Payment + Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FiCreditCard size={14} style={{ color: C.light }} />
                <span style={{ fontSize: '0.8rem', color: C.subtext, fontWeight: 500 }}>
                  {order.paymentMethod}
                </span>
              </div>
              <StatusBadge status={order.status} />
            </div>

            {/* Total */}
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.muted, marginBottom: 2 }}>
                Total Amount
              </div>
              <div style={{
                fontSize: '1.5rem',
                fontFamily: 'DM Serif Display, serif',
                background: C.gradient,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: 400,
                lineHeight: 1
              }}>
                Rs. {order.totalAmount.toFixed(2)}
              </div>
            </div>
          </div>
        </Modal.Body>

        {/* ── Footer ── */}
        <Modal.Footer style={{ background: C.bg, padding: '0.875rem 1.5rem' }}>
          <button
            onClick={onHide}
            style={{
              background: 'white',
              border: `1.5px solid ${C.border}`,
              borderRadius: 10,
              color: C.subtext,
              fontWeight: 600,
              fontSize: '0.85rem',
              padding: '0.5rem 1.5rem',
              cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              transition: 'all .2s'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = C.softGrad;
              e.currentTarget.style.borderColor = C.light;
              e.currentTarget.style.color = C.dark;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.borderColor = C.border;
              e.currentTarget.style.color = C.subtext;
            }}
          >
            <FiX size={14} /> Close
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default OrderDetailsModal;