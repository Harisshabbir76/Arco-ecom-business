import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Tab,
  Tabs,
  Button,
  Spinner,
  Dropdown
} from 'react-bootstrap';
import {
  FiRefreshCw,
  FiTruck,
  FiCheckCircle,
  FiShoppingBag,
  FiChevronDown,
  FiPackage,
  FiClock,
  FiUsers,
  FiBarChart 
} from 'react-icons/fi';
import OrderDetailsModal from './OrderDetailsModal';
import ExportOrders from './ExportOrders';

/* ─── Design tokens - Red Theme ─────────────────────────────────────────────── */
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

/* ─── Injected global styles ─────────────────────────────────────── */
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;500;600;700&display=swap');

    body { 
      background: ${C.white}; 
      font-family: 'Barlow', sans-serif;
      margin: 0;
      padding: 0;
    }

    /* ── Scrollbar ── */
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: ${C.white}; }
    ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 99px; }
    ::-webkit-scrollbar-thumb:hover { background: ${C.red}; }

    /* ── Tab overrides ── */
    .om-tabs .nav-link {
      color: ${C.gray};
      fontWeight: 500;
      font-size: 0.875rem;
      border: none !important;
      padding: 0.875rem 1.25rem;
      background: transparent;
      transition: color .2s;
      position: relative;
      font-family: 'Barlow', sans-serif;
    }
    .om-tabs .nav-link::after {
      content: '';
      position: absolute;
      bottom: 0; left: 50%; right: 50%;
      height: 2px;
      background: ${C.gradient};
      border-radius: 2px 2px 0 0;
      transition: left .25s ease, right .25s ease;
    }
    .om-tabs .nav-link.active {
      color: ${C.red} !important;
      background: transparent !important;
      fontWeight: 600;
    }
    .om-tabs .nav-link.active::after { left: 0.75rem; right: 0.75rem; }
    .om-tabs .nav-link:hover { color: ${C.red} !important; }
    .om-tabs .nav { border-bottom: 1.5px solid ${C.border}; }

    /* ── Dropdown ── */
    .om-dropdown-menu {
      border: 1.5px solid ${C.border} !important;
      border-radius: 12px !important;
      padding: 0.4rem !important;
      box-shadow: 0 8px 24px rgba(204,27,27,.12) !important;
    }
    .om-dropdown-item {
      border-radius: 8px;
      font-size: 0.875rem;
      padding: 0.5rem 0.875rem;
      color: ${C.charcoal};
      transition: background .15s, color .15s;
      font-family: 'Barlow', sans-serif;
    }
    .om-dropdown-item:hover {
      background: ${C.redLight} !important;
      color: ${C.red} !important;
    }

    /* ── Spin animation ── */
    @keyframes om-spin { to { transform: rotate(360deg); } }
    .om-spin { animation: om-spin .8s linear infinite; }

    /* ── Card entrance ── */
    @keyframes om-rise {
      from { opacity: 0; transform: translateY(18px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .om-card { animation: om-rise .35s ease both; }

    /* ── Table styles ── */
    .om-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;
    }
    
    .om-table th {
      fontWeight: 600;
      font-size: 0.75rem;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: ${C.gray};
      background: ${C.redLight};
      border-bottom: 1.5px solid ${C.border};
      padding: 1rem 0.75rem;
      text-align: left;
      white-space: nowrap;
      font-family: 'Barlow', sans-serif;
    }
    
    .om-table td {
      padding: 1rem 0.75rem;
      border-bottom: 1px solid ${C.border};
      vertical-align: middle;
      font-family: 'Barlow', sans-serif;
    }
    
    .om-table tbody tr:hover {
      background: ${C.redLight};
    }

    /* Column widths */
    .om-table th:nth-child(1) { width: 10%; }  /* Order ID */
    .om-table th:nth-child(2) { width: 12%; }  /* Customer */
    .om-table th:nth-child(3) { width: 10%; }  /* Date */
    .om-table th:nth-child(4) { width: 25%; }  /* Products */
    .om-table th:nth-child(5) { width: 8%; }   /* Total */
    .om-table th:nth-child(6) { width: 12%; }  /* Status */
    .om-table th:nth-child(7) { width: 23%; }  /* Actions */

    @media (max-width: 768px) {
      .om-table th:nth-child(4) { width: 30%; }
      .om-table th:nth-child(7) { width: 20%; }
    }
  `}</style>
);

/* ─── Small utility components ───────────────────────────────────── */

const StatPill = ({ label, value, icon: Icon, active }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: active ? C.gradient : C.white,
    border: `1.5px solid ${active ? 'transparent' : C.border}`,
    borderRadius: '30px',
    padding: '0.35rem 1rem 0.35rem 0.75rem',
    fontSize: '0.8rem',
    fontWeight: 600,
    color: active ? C.white : C.gray,
    boxShadow: active ? `0 4px 14px ${C.red}40` : 'none',
    transition: 'all .25s',
    whiteSpace: 'nowrap',
    fontFamily: 'Barlow, sans-serif'
  }}>
    {Icon && <Icon size={14} />}
    {label}: <span style={{ marginLeft: 3, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
  </div>
);

const TabTitle = ({ icon, text, count, active }) => (
  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
    {icon && React.cloneElement(icon, {
      size: 14,
      style: { color: active ? C.red : C.gray, flexShrink: 0 }
    })}
    <span>{text}</span>
    {count > 0 && (
      <span style={{
        background: active ? C.gradient : C.border,
        color: active ? C.white : C.gray,
        borderRadius: '99px',
        fontSize: '0.7rem',
        fontWeight: 700,
        padding: '1px 7px',
        lineHeight: '1.6',
        minWidth: 22,
        textAlign: 'center',
        ...(active ? { boxShadow: `0 2px 8px ${C.red}40` } : {})
      }}>
        {count}
      </span>
    )}
  </span>
);

/* ─── Status badge ───────────────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const map = {
    pending: {
      bg: '#FEF3C7',
      color: '#92400E',
      label: 'Pending',
      dot: '#FBBF24'
    },
    'out-for-delivery': {
      bg: C.redLight,
      color: C.red,
      label: 'Out for Delivery',
      dot: C.red
    },
    completed: {
      bg: '#D1FAE5',
      color: '#065F46',
      label: 'Completed',
      dot: '#10B981'
    },
  };
  const s = map[status] || { bg: C.redLight, color: C.red, label: status, dot: C.red };
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.35rem',
      background: s.bg,
      color: s.color,
      borderRadius: '20px',
      padding: '0.25rem 0.75rem',
      fontSize: '0.75rem',
      fontWeight: 600,
      whiteSpace: 'nowrap'
    }}>
      <span style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: s.dot
      }} />
      {s.label}
    </span>
  );
};

/* ─── Status dropdown ────────────────────────────────────────────── */
const StatusDropdown = ({ order, onStatusUpdate }) => (
  <Dropdown>
    <Dropdown.Toggle
      size="sm"
      style={{
        background: C.white,
        border: `1.5px solid ${C.border}`,
        color: C.red,
        borderRadius: '6px',
        fontWeight: 500,
        fontSize: '0.78rem',
        padding: '0.35rem 0.7rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.3rem',
        transition: 'all .2s',
      }}
    >
      Update <FiChevronDown size={12} />
    </Dropdown.Toggle>
    <Dropdown.Menu className="om-dropdown-menu">
      <Dropdown.Item
        className="om-dropdown-item"
        onClick={() => onStatusUpdate(order._id, 'out-for-delivery')}
      >
        <FiTruck size={13} style={{ marginRight: 6, color: C.red }} />
        Out for Delivery
      </Dropdown.Item>
      <Dropdown.Item
        className="om-dropdown-item"
        onClick={() => onStatusUpdate(order._id, 'completed')}
      >
        <FiCheckCircle size={13} style={{ marginRight: 6, color: '#10B981' }} />
        Mark Completed
      </Dropdown.Item>
    </Dropdown.Menu>
  </Dropdown>
);

/* ─── Order table ────────────────────────────────────────────────── */
const OrderTable = ({ orders, onStatusUpdate, onViewDetails, loading, emptyMessage }) => (
  <div style={{ padding: '0.5rem 0 1rem' }}>
    {loading ? (
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <Spinner animation="border" style={{ color: C.red, width: 36, height: 36, borderWidth: 3 }} />
        <p style={{ marginTop: '1rem', color: C.gray, fontSize: '0.875rem', fontWeight: 500 }}>
          Loading orders…
        </p>
      </div>
    ) : orders.length === 0 ? (
      <div style={{ textAlign: 'center', padding: '5rem 0' }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: C.redLight, margin: '0 auto 1rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <FiPackage size={28} style={{ color: C.red }} />
        </div>
        <p style={{ color: C.gray, fontWeight: 500, margin: 0 }}>{emptyMessage}</p>
      </div>
    ) : (
      <div style={{ overflowX: 'auto', padding: '0 0.5rem' }}>
        <table className="om-table">
          <thead>
            <tr>
              <th>ORDER ID</th>
              <th>CUSTOMER</th>
              <th>DATE</th>
              <th>PRODUCTS</th>
              <th>TOTAL</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>
                  <span style={{
                    color: C.red,
                    fontWeight: 600,
                    fontFamily: 'monospace',
                    fontSize: '0.85rem'
                  }}>
                    #{order._id.substring(0, 8).toUpperCase()}
                  </span>
                </td>

                <td>
                  <span style={{ color: C.charcoal, fontWeight: 500 }}>
                    {order.customerName}
                  </span>
                </td>

                <td>
                  <span style={{ color: C.gray, fontSize: '0.85rem' }}>
                    {new Date(order.orderDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </td>

                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {order.products.slice(0, 2).map((p, idx) => (
                      <div key={p.productId} style={{
                        fontSize: '0.85rem',
                        color: C.charcoal,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '250px'
                      }}>
                        {p.name} <span style={{ color: C.red, fontWeight: 500 }}>x{p.quantity}</span>
                        {(p.size || p.color || p.selectedSize || p.selectedColor) && (
                          <div style={{ fontSize: '0.7rem', color: C.red, fontWeight: 600, marginTop: '1px' }}>
                            {(p.size || p.selectedSize) && <span style={{ marginRight: '6px' }}>S: {p.size || p.selectedSize}</span>}
                            {(p.color || p.selectedColor) && <span>C: {p.color || p.selectedColor}</span>}
                          </div>
                        )}
                      </div>
                    ))}
                    {order.products.length > 2 && (
                      <span style={{
                        fontSize: '0.75rem',
                        color: C.red,
                        fontWeight: 600,
                        background: C.redLight,
                        padding: '2px 8px',
                        borderRadius: '12px',
                        display: 'inline-block',
                        width: 'fit-content'
                      }}>
                        +{order.products.length - 2} more
                      </span>
                    )}
                  </div>
                </td>

                <td>
                  <span style={{
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    color: C.red
                  }}>
                    Rs. {order.totalAmount.toFixed(2)}
                  </span>
                </td>

                <td>
                  <StatusBadge status={order.status} />
                </td>

                <td>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <StatusDropdown order={order} onStatusUpdate={onStatusUpdate} />
                    <button
                      onClick={() => onViewDetails(order)}
                      style={{
                        background: C.white,
                        border: `1.5px solid ${C.border}`,
                        borderRadius: '6px',
                        color: C.gray,
                        fontWeight: 500,
                        fontSize: '0.78rem',
                        padding: '0.35rem 0.8rem',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all .2s'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = C.red;
                        e.currentTarget.style.color = C.red;
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = C.border;
                        e.currentTarget.style.color = C.gray;
                      }}
                    >
                      Details
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

/* ─── Time filter labels ─────────────────────────────────────────── */
const timeLabels = {
  all: 'All Time',
  today: 'Today',
  yesterday: 'Yesterday',
  '7days': 'Last 7 Days',
  '30days': 'Last 30 Days',
  '90days': 'Last 90 Days'
};

/* ─── Main component ─────────────────────────────────────────────── */
const OrderManagement = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [timeFilter, setTimeFilter] = useState('all');
  const [filteredCounts, setFilteredCounts] = useState({ all: 0, delivery: 0, completed: 0 });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/404');
          return;
        }

        const response = await axios.get(`${process.env.REACT_APP_API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.user.email === '05harisshabbir@gmail.com') {
          setIsAuthorized(true);
          fetchOrders();
        } else {
          navigate('/404');
        }
      } catch {
        navigate('/404');
      } finally {
        setAuthLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/allOrder`);
      setOrders(response.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/allOrder/${orderId}/status`, { status: newStatus });
      fetchOrders();
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowDetails(true);
  };

  const filterByDate = (orderDate) => {
    if (timeFilter === 'all') return true;
    const date = new Date(orderDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (timeFilter === 'today') return date >= today;
    if (timeFilter === 'yesterday') return date >= yesterday && date < today;

    const daysMap = { '7days': 7, '30days': 30, '90days': 90 };
    const days = daysMap[timeFilter];
    if (days) {
      const cutoff = new Date(today);
      cutoff.setDate(cutoff.getDate() - days);
      return date >= cutoff;
    }
    return true;
  };

  const filtered = {
    all: orders.filter(o => filterByDate(o.orderDate)),
    delivery: orders.filter(o => o.status === 'out-for-delivery' && filterByDate(o.orderDate)),
    completed: orders.filter(o => o.status === 'completed' && filterByDate(o.orderDate)),
  };

  useEffect(() => {
    setFilteredCounts({
      all: filtered.all.length,
      delivery: filtered.delivery.length,
      completed: filtered.completed.length,
    });
  }, [filtered.all.length, filtered.completed.length, filtered.delivery.length]);

  if (authLoading) return (
    <>
      <GlobalStyle />
      <div style={{
        minHeight: '100vh',
        background: C.white,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem'
      }}>
        <div style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: C.gradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 8px 24px ${C.red}40`
        }}>
          <FiShoppingBag size={24} color={C.white} />
        </div>
        <Spinner animation="border" style={{ color: C.red, width: 28, height: 28, borderWidth: 2 }} />
        <p style={{ color: C.gray, fontWeight: 500, margin: 0, fontSize: '0.875rem' }}>Verifying access…</p>
      </div>
    </>
  );

  if (!isAuthorized) return null;

  // Calculate total revenue
  const totalRevenue = filtered.all.reduce((sum, order) => sum + order.totalAmount, 0);

  return (
    <>
      <GlobalStyle />
      <div style={{ background: C.white, minHeight: '100vh', padding: '2rem 1rem' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>

          {/* ── Header ── */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div>
              <div className="admin-products-eyebrow" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                fontFamily: 'Barlow, sans-serif',
                fontSize: '0.68rem',
                fontWeight: 600,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: C.red,
                marginBottom: '0.5rem'
              }}>
                <span style={{ width: '5px', height: '5px', background: C.red, borderRadius: '50%' }} />
                Dashboard
              </div>
              <h1 style={{
                margin: 0,
                fontWeight: 700,
                fontSize: 'clamp(1.5rem,4vw,2rem)',
                color: C.charcoal,
                lineHeight: 1.2,
                fontFamily: 'Barlow, sans-serif'
              }}>
                Order Management
              </h1>
              <div style={{
                height: '3px',
                width: '60px',
                background: C.red,
                borderRadius: '2px',
                marginTop: '0.5rem'
              }} />
            </div>

            {/* Stat pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              <StatPill label="Total" value={filteredCounts.all} icon={FiPackage} active />
              <StatPill label="Delivery" value={filteredCounts.delivery} icon={FiTruck} />
              <StatPill label="Completed" value={filteredCounts.completed} icon={FiCheckCircle} />
            </div>
          </div>

          {/* Revenue Summary Card */}
          <div className="om-card" style={{
            background: C.redLight,
            borderRadius: 12,
            border: `1px solid ${C.border}`,
            padding: '1rem 1.5rem',
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                background: C.white,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FiBarChart  size={24} color={C.red} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: C.gray, fontWeight: 500 }}>Total Revenue</p>
                <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: C.red }}>
                  Rs. {totalRevenue.toLocaleString()}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                background: C.white,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FiUsers size={24} color={C.red} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: C.gray, fontWeight: 500 }}>Total Customers</p>
                <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: C.charcoal }}>
                  {new Set(orders.map(o => o.email)).size}
                </p>
              </div>
            </div>
          </div>

          {/* ── Main card ── */}
          <div className="om-card" style={{
            background: C.white,
            borderRadius: 16,
            border: `1.5px solid ${C.border}`,
            boxShadow: `0 4px 40px ${C.red}08`,
            overflow: 'hidden'
          }}>
            {/* Card toolbar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
              padding: '1rem 1.25rem',
              borderBottom: `1.5px solid ${C.border}`,
              background: C.redLight
            }}>
              <ExportOrders orders={filtered.all} />

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {/* Time filter */}
                <Dropdown>
                  <Dropdown.Toggle style={{
                    background: C.white,
                    border: `1.5px solid ${C.border}`,
                    color: C.charcoal,
                    borderRadius: 8,
                    fontWeight: 500,
                    fontSize: '0.8rem',
                    padding: '0.45rem 0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    boxShadow: 'none'
                  }}>
                    <FiClock size={13} style={{ color: C.red }} />
                    {timeLabels[timeFilter]}
                    <FiChevronDown size={12} style={{ color: C.gray }} />
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="om-dropdown-menu">
                    {Object.entries(timeLabels).map(([key, label], i) => (
                      <React.Fragment key={key}>
                        {i === 1 && <Dropdown.Divider style={{ borderColor: C.border, margin: '0.3rem 0' }} />}
                        <Dropdown.Item
                          className="om-dropdown-item"
                          onClick={() => setTimeFilter(key)}
                          style={{
                            fontWeight: timeFilter === key ? 700 : 400,
                            color: timeFilter === key ? C.red : C.charcoal
                          }}
                        >
                          {label}
                        </Dropdown.Item>
                      </React.Fragment>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>

                {/* Refresh */}
                <button
                  onClick={fetchOrders}
                  disabled={loading}
                  style={{
                    background: C.white,
                    border: `1.5px solid ${C.border}`,
                    color: C.red,
                    borderRadius: 8,
                    fontWeight: 500,
                    fontSize: '0.8rem',
                    padding: '0.45rem 0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  <FiRefreshCw size={13} className={loading ? 'om-spin' : ''} />
                  {loading ? 'Refreshing…' : 'Refresh'}
                </button>
              </div>
            </div>

            {/* Tabs */}
            <Tabs
              activeKey={activeTab}
              onSelect={k => setActiveTab(k)}
              className="om-tabs px-2"
              fill
            >
              <Tab
                eventKey="all"
                title={<TabTitle text="All Orders" count={filteredCounts.all} active={activeTab === 'all'} />}
              >
                <OrderTable
                  orders={filtered.all}
                  onStatusUpdate={updateOrderStatus}
                  onViewDetails={viewOrderDetails}
                  loading={loading}
                  emptyMessage="No orders found in the system"
                />
              </Tab>
              <Tab
                eventKey="delivery"
                title={<TabTitle icon={<FiTruck />} text="Out for Delivery" count={filteredCounts.delivery} active={activeTab === 'delivery'} />}
              >
                <OrderTable
                  orders={filtered.delivery}
                  onStatusUpdate={updateOrderStatus}
                  onViewDetails={viewOrderDetails}
                  loading={loading}
                  emptyMessage="No orders currently out for delivery"
                />
              </Tab>
              <Tab
                eventKey="completed"
                title={<TabTitle icon={<FiCheckCircle />} text="Completed" count={filteredCounts.completed} active={activeTab === 'completed'} />}
              >
                <OrderTable
                  orders={filtered.completed}
                  onStatusUpdate={updateOrderStatus}
                  onViewDetails={viewOrderDetails}
                  loading={loading}
                  emptyMessage="No completed orders yet"
                />
              </Tab>
            </Tabs>
          </div>

          {/* Footer note */}
          <p style={{
            textAlign: 'center',
            color: C.gray,
            fontSize: '0.75rem',
            marginTop: '1.25rem'
          }}>
            Showing {filteredCounts.all} order{filteredCounts.all !== 1 ? 's' : ''} · {timeLabels[timeFilter]}
          </p>
        </div>
      </div>

      <OrderDetailsModal
        show={showDetails}
        onHide={() => setShowDetails(false)}
        order={selectedOrder}
      />
    </>
  );
};

export default OrderManagement;