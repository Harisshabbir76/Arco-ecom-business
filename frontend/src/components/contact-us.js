import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Spinner, Dropdown } from 'react-bootstrap';
import {
  FiUser, FiMessageSquare, FiSend,
  FiCheck, FiInbox, FiChevronDown, FiClock,
  FiAlertCircle, FiCheckCircle
} from 'react-icons/fi';
import ReplyModal from './ReplyModal';

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
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap');

    *, *::before, *::after { box-sizing: border-box; }
    body { background: ${C.bg}; font-family: 'DM Sans', sans-serif; }

    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: ${C.bg}; }
    ::-webkit-scrollbar-thumb { background: ${C.light}; border-radius: 99px; }

    /* Tabs */
    .cm-tabs .nav-link {
      color: ${C.subtext};
      font-weight: 500;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.875rem;
      border: none !important;
      padding: 0.875rem 1.25rem;
      background: transparent;
      transition: color .2s;
      position: relative;
    }
    .cm-tabs .nav-link::after {
      content: '';
      position: absolute;
      bottom: 0; left: 50%; right: 50%;
      height: 2px;
      background: ${C.gradient};
      border-radius: 2px 2px 0 0;
      transition: left .25s ease, right .25s ease;
    }
    .cm-tabs .nav-link.active {
      color: ${C.primary} !important;
      background: transparent !important;
      font-weight: 600;
    }
    .cm-tabs .nav-link.active::after { left: 0.75rem; right: 0.75rem; }
    .cm-tabs .nav-link:hover { color: ${C.primary} !important; }
    .cm-tabs .nav { border-bottom: 1.5px solid ${C.border}; }

    /* Dropdown */
    .cm-dropdown-menu {
      border: 1.5px solid ${C.border} !important;
      border-radius: 12px !important;
      padding: 0.4rem !important;
      box-shadow: 0 8px 24px rgba(255,105,180,.12) !important;
    }
    .cm-dropdown-item {
      border-radius: 8px;
      font-size: 0.875rem;
      padding: 0.5rem 0.875rem;
      color: ${C.text};
      transition: background .15s, color .15s;
    }
    .cm-dropdown-item:hover {
      background: ${C.softGrad} !important;
      color: ${C.dark} !important;
    }

    /* Message card */
    .cm-msg-card {
      background: white;
      border: 1.5px solid ${C.border};
      border-radius: 16px;
      overflow: hidden;
      transition: transform .2s ease, box-shadow .2s ease;
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .cm-msg-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 32px rgba(255,105,180,.14) !important;
    }

    /* Card entrance */
    @keyframes cm-rise {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .cm-card-wrap { animation: cm-rise .35s ease both; }

    /* Grid item stagger */
    @keyframes cm-fadeUp {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .cm-item { animation: cm-fadeUp .3s ease both; }

    /* Spin */
    @keyframes cm-spin { to { transform: rotate(360deg); } }
    .cm-spin { animation: cm-spin .8s linear infinite; }

    /* Pulse */
    @keyframes cm-pulse {
      0%,100% { box-shadow: 0 0 0 0 rgba(220,53,69,.3); }
      50%      { box-shadow: 0 0 0 5px rgba(220,53,69,0); }
    }
    .cm-pulse { animation: cm-pulse 2s ease infinite; }
  `}</style>
);

/* ─── Time filter labels ─── */
const timeLabels = {
  all: 'All Time', today: 'Today', yesterday: 'Yesterday',
  '7days': 'Last 7 Days', '30days': 'Last 30 Days', '90days': 'Last 90 Days'
};

/* ─── Stat pill ─── */
const StatPill = ({ label, value, icon: Icon, active, danger }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: '0.4rem',
    background: active ? C.gradient : danger ? 'linear-gradient(135deg,#FFF5F5,#FFE8E8)' : 'white',
    border: `1.5px solid ${active ? 'transparent' : danger ? '#FFCDD2' : C.border}`,
    borderRadius: 99,
    padding: '0.35rem 0.875rem 0.35rem 0.6rem',
    fontSize: '0.8rem', fontWeight: 600,
    color: active ? 'white' : danger ? '#E53E3E' : C.subtext,
    boxShadow: active ? '0 4px 14px rgba(255,105,180,.3)' : 'none',
    whiteSpace: 'nowrap'
  }}>
    {Icon && <Icon size={13} />}
    {label}: <span style={{ marginLeft: 3, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
  </div>
);

/* ─── Tab title ─── */
const TabTitle = ({ text, count, active, variant }) => {
  const badgeBg = active
    ? C.gradient
    : variant === 'danger'
      ? 'linear-gradient(135deg,#FFF5F5,#FFE8E8)'
      : C.border;
  const badgeColor = active ? 'white' : variant === 'danger' ? '#E53E3E' : C.subtext;

  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
      <span>{text}</span>
      {count > 0 && (
        <span style={{
          background: badgeBg, color: badgeColor,
          borderRadius: 99, fontSize: '0.7rem', fontWeight: 700,
          padding: '1px 7px', lineHeight: '1.6', minWidth: 22, textAlign: 'center',
          ...(active ? { boxShadow: '0 2px 8px rgba(255,20,147,.3)' } : {})
        }}>
          {count}
        </span>
      )}
    </span>
  );
};

/* ─── Reply badge ─── */
const ReplyBadge = ({ replied }) => (
  replied ? (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      background: 'linear-gradient(135deg,#48BB78,#38A169)',
      color: 'white', borderRadius: 99,
      padding: '0.25rem 0.65rem', fontSize: '0.72rem', fontWeight: 700,
      boxShadow: '0 2px 8px rgba(72,187,120,.25)'
    }}>
      <FiCheck size={11} /> Replied
    </span>
  ) : (
    <span className="cm-pulse" style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      background: 'linear-gradient(135deg,#FC8181,#E53E3E)',
      color: 'white', borderRadius: 99,
      padding: '0.25rem 0.65rem', fontSize: '0.72rem', fontWeight: 700,
    }}>
      <span style={{
        width: 5, height: 5, borderRadius: '50%',
        background: 'rgba(255,255,255,.8)', flexShrink: 0
      }} />
      Pending
    </span>
  )
);

/* ─── Message card ─── */
const MessageCard = ({ message, onReply, index }) => {
  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <div
      className="cm-item"
      style={{ animationDelay: `${index * 0.05}s`, height: '100%' }}
    >
      <div className="cm-msg-card" style={{ boxShadow: '0 2px 12px rgba(255,105,180,.06)' }}>

        {/* Card header */}
        <div style={{
          background: C.softGrad,
          padding: '0.875rem 1rem',
          borderBottom: `1.5px solid ${C.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
            <span style={{
              width: 34, height: 34, borderRadius: 10,
              background: C.gradient,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, boxShadow: '0 4px 10px rgba(255,105,180,.3)'
            }}>
              <FiUser size={15} color="white" />
            </span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', color: C.text, lineHeight: 1.2 }}>
                {message.name}
              </div>
              <div style={{
                fontSize: '0.72rem', color: C.muted,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
              }}>
                {message.email}
              </div>
            </div>
          </div>
          <ReplyBadge replied={message.replied} />
        </div>

        {/* Card body */}
        <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

          {/* Subject */}
          <div>
            <div style={{
              fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.07em',
              textTransform: 'uppercase', color: C.muted, marginBottom: 3
            }}>
              Subject
            </div>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: C.text }}>
              {message.subject}
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: `linear-gradient(90deg, ${C.border}, transparent)` }} />

          {/* Message */}
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.07em',
              textTransform: 'uppercase', color: C.muted, marginBottom: 4,
              display: 'flex', alignItems: 'center', gap: '0.3rem'
            }}>
              <FiMessageSquare size={11} style={{ color: C.light }} /> Message
            </div>
            <p style={{
              fontSize: '0.855rem', color: C.subtext, margin: 0,
              lineHeight: 1.6,
              display: '-webkit-box',
              WebkitLineClamp: 4,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {message.message}
            </p>
          </div>
        </div>

        {/* Card footer */}
        <div style={{
          padding: '0.75rem 1rem',
          borderTop: `1.5px solid ${C.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: C.muted, fontSize: '0.75rem' }}>
            <FiClock size={11} style={{ color: C.light }} />
            {formatDate(message.createdAt)}
          </div>

          {!message.replied && onReply && (
            <button
              onClick={() => onReply(message)}
              style={{
                background: C.gradient,
                border: 'none',
                borderRadius: 8,
                color: 'white',
                fontWeight: 700,
                fontSize: '0.78rem',
                padding: '0.4rem 0.875rem',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.35rem',
                fontFamily: 'inherit',
                boxShadow: '0 4px 12px rgba(255,105,180,.3)',
                transition: 'all .2s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(255,105,180,.4)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(255,105,180,.3)';
              }}
            >
              <FiSend size={12} /> Reply
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Messages grid ─── */
const MessagesGrid = ({ messages, onReply, emptyMessage }) => (
  <div style={{ padding: '1.25rem' }}>
    {messages.length === 0 ? (
      <div style={{ textAlign: 'center', padding: '5rem 0' }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: C.softGrad, margin: '0 auto 1rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <FiInbox size={26} style={{ color: C.light }} />
        </div>
        <p style={{ color: C.muted, fontWeight: 500, margin: 0, fontSize: '0.875rem' }}>
          {emptyMessage}
        </p>
      </div>
    ) : (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1rem'
      }}>
        {messages.map((msg, i) => (
          <MessageCard key={msg._id} message={msg} onReply={onReply} index={i} />
        ))}
      </div>
    )}
  </div>
);

/* ─── Main component ─── */
export default function ContactMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentMessage, setCurrentMessage] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [activeTab, setActiveTab] = useState('unreplied');
  const [timeFilter, setTimeFilter] = useState('all');
  const [counts, setCounts] = useState({ all: 0, unreplied: 0, replied: 0 });

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/contactus/show`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setMessages(res.data);
        setCounts({
          all: res.data.length,
          unreplied: res.data.filter(m => !m.replied).length,
          replied: res.data.filter(m => m.replied).length
        });
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  const handleSendReply = async (emailData) => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/contactus/reply`, {
        ...emailData, messageId: currentMessage._id
      }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

      const updated = messages.map(m =>
        m._id === currentMessage._id ? { ...m, replied: true } : m
      );
      setMessages(updated);
      setCounts({
        all: updated.length,
        unreplied: updated.filter(m => !m.replied).length,
        replied: updated.filter(m => m.replied).length
      });
      setShowReplyModal(false);
      return { success: true };
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to send reply');
    }
  };

  const filterByDate = (d) => {
    if (timeFilter === 'all') return true;
    const date = new Date(d);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    if (timeFilter === 'today') return date >= today;
    if (timeFilter === 'yesterday') return date >= yesterday && date < today;
    const days = { '7days': 7, '30days': 30, '90days': 90 }[timeFilter];
    if (days) { const c = new Date(today); c.setDate(c.getDate() - days); return date >= c; }
    return true;
  };

  const filtered = {
    all: messages.filter(m => filterByDate(m.createdAt)),
    unreplied: messages.filter(m => !m.replied && filterByDate(m.createdAt)),
    replied: messages.filter(m => m.replied && filterByDate(m.createdAt)),
  };

  useEffect(() => {
    setCounts({ all: filtered.all.length, unreplied: filtered.unreplied.length, replied: filtered.replied.length });
  }, [timeFilter, messages]);

  /* ── Loading ── */
  if (loading) return (
    <>
      <GlobalStyle />
      <div style={{
        minHeight: '100vh', background: C.bg,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '1rem'
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: C.gradient, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(255,105,180,.35)'
        }}>
          <FiInbox size={22} color="white" />
        </div>
        <Spinner animation="border" style={{ color: C.primary, width: 28, height: 28, borderWidth: 2 }} />
        <p style={{ color: C.muted, fontWeight: 500, margin: 0, fontSize: '0.875rem' }}>Loading messages…</p>
      </div>
    </>
  );

  /* ── Error ── */
  if (error) return (
    <>
      <GlobalStyle />
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{
          background: 'white', border: '1.5px solid #FFCDD2', borderRadius: 16,
          padding: '2rem', maxWidth: 440, width: '100%', textAlign: 'center',
          boxShadow: '0 4px 24px rgba(220,53,69,.1)'
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: 'linear-gradient(135deg,#FFF5F5,#FFE8E8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem'
          }}>
            <FiAlertCircle size={24} style={{ color: '#E53E3E' }} />
          </div>
          <h5 style={{ color: C.text, fontFamily: 'DM Serif Display, serif', fontWeight: 400, marginBottom: '0.5rem' }}>
            Failed to load messages
          </h5>
          <p style={{ color: C.subtext, fontSize: '0.875rem', margin: 0 }}>{error}</p>
        </div>
      </div>
    </>
  );

  /* ── Main ── */
  return (
    <>
      <GlobalStyle />
      <div style={{ background: C.bg, minHeight: '100vh', padding: '2rem 1rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          {/* Page header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem'
          }}>
            <div>
              <p style={{
                margin: 0, fontSize: '0.75rem', fontWeight: 700,
                letterSpacing: '0.1em', textTransform: 'uppercase', color: C.light
              }}>
                Dashboard
              </p>
              <h1 style={{
                margin: 0,
                fontFamily: 'DM Serif Display, serif',
                fontWeight: 400,
                fontSize: 'clamp(1.5rem,4vw,2rem)',
                background: C.gradient,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text', lineHeight: 1.2
              }}>
                Contact Messages
              </h1>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              <StatPill label="Total" value={counts.all} icon={FiInbox} active />
              <StatPill label="Pending" value={counts.unreplied} icon={FiAlertCircle} danger />
              <StatPill label="Replied" value={counts.replied} icon={FiCheckCircle} />
            </div>
          </div>

          {/* Main card */}
          <div className="cm-card-wrap" style={{
            background: 'white',
            borderRadius: 16,
            border: `1.5px solid ${C.border}`,
            boxShadow: '0 4px 40px rgba(255,105,180,.08)',
            overflow: 'hidden'
          }}>
            {/* Toolbar */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
              flexWrap: 'wrap', gap: '0.75rem',
              padding: '1rem 1.25rem',
              borderBottom: `1.5px solid ${C.border}`,
              background: C.softGrad
            }}>
              <Dropdown>
                <Dropdown.Toggle style={{
                  background: 'white',
                  border: `1.5px solid ${C.border}`,
                  color: C.text,
                  borderRadius: 10, fontWeight: 600,
                  fontSize: '0.8rem',
                  padding: '0.45rem 0.875rem',
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  boxShadow: 'none', fontFamily: 'inherit'
                }}>
                  <FiClock size={13} style={{ color: C.primary }} />
                  {timeLabels[timeFilter]}
                  <FiChevronDown size={12} style={{ color: C.muted }} />
                </Dropdown.Toggle>
                <Dropdown.Menu className="cm-dropdown-menu">
                  {Object.entries(timeLabels).map(([key, label], i) => (
                    <React.Fragment key={key}>
                      {i === 1 && <Dropdown.Divider style={{ borderColor: C.border, margin: '0.3rem 0' }} />}
                      <Dropdown.Item
                        className="cm-dropdown-item"
                        onClick={() => setTimeFilter(key)}
                        style={{
                          fontWeight: timeFilter === key ? 700 : 400,
                          color: timeFilter === key ? C.primary : C.text
                        }}
                      >
                        {label}
                      </Dropdown.Item>
                    </React.Fragment>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </div>

            {/* Tabs — manual render to avoid react-bootstrap dep on nav */}
            <div>
              {/* Tab nav */}
              <div className="cm-tabs" style={{ padding: '0 0.5rem' }}>
                <nav className="nav nav-tabs" style={{ borderBottom: `1.5px solid ${C.border}` }}>
                  {[
                    { key: 'all', label: 'All Messages', count: counts.all },
                    { key: 'unreplied', label: 'Unreplied', count: counts.unreplied, variant: 'danger' },
                    { key: 'replied', label: 'Replied', count: counts.replied },
                  ].map(t => (
                    <button
                      key={t.key}
                      className={`nav-link${activeTab === t.key ? ' active' : ''}`}
                      onClick={() => setActiveTab(t.key)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                      <TabTitle
                        text={t.label}
                        count={t.count}
                        active={activeTab === t.key}
                        variant={t.variant}
                      />
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab panels */}
              {activeTab === 'all' && (
                <MessagesGrid
                  messages={filtered.all}
                  onReply={msg => { setCurrentMessage(msg); setShowReplyModal(true); }}
                  emptyMessage="No messages found"
                />
              )}
              {activeTab === 'unreplied' && (
                <MessagesGrid
                  messages={filtered.unreplied}
                  onReply={msg => { setCurrentMessage(msg); setShowReplyModal(true); }}
                  emptyMessage="No unreplied messages — you're all caught up!"
                />
              )}
              {activeTab === 'replied' && (
                <MessagesGrid
                  messages={filtered.replied}
                  emptyMessage="No replied messages yet"
                />
              )}
            </div>
          </div>

          {/* Footer */}
          <p style={{ textAlign: 'center', color: C.muted, fontSize: '0.75rem', marginTop: '1.25rem' }}>
            Showing {counts[activeTab]} message{counts[activeTab] !== 1 ? 's' : ''} · {timeLabels[timeFilter]}
          </p>
        </div>
      </div>

      <ReplyModal
        show={showReplyModal}
        onHide={() => setShowReplyModal(false)}
        message={currentMessage}
        onSend={handleSendReply}
      />
    </>
  );
}