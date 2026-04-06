import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { Spinner } from 'react-bootstrap';
import {
  FiPlus, FiEdit2, FiTrash2, FiUpload, FiCheck, FiX,
  FiImage, FiLink, FiType, FiEye, FiEyeOff,
  FiMove, FiSave, FiAlertCircle, FiToggleLeft, FiToggleRight, FiArrowLeft
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

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

/* ── Drag & Drop Zone ── */
function DropZone({ id, preview, hint, onFile, onClear }) {
  const [dragging, setDragging] = useState(false);
  const ref = useRef();

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f && f.type.startsWith('image/')) onFile(f);
  }, [onFile]);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onClick={() => !preview && ref.current?.click()}
      style={{
        border: `2px dashed ${dragging ? C.red : C.border}`,
        borderRadius: '12px',
        background: dragging ? C.redLight : preview ? C.white : C.lightGray,
        minHeight: '140px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column',
        cursor: preview ? 'default' : 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative', overflow: 'hidden',
        transform: dragging ? 'scale(1.01)' : 'scale(1)',
      }}
    >
      {preview ? (
        <>
          <img src={preview} alt="Preview"
            style={{ width: '100%', height: '140px', objectFit: 'cover', display: 'block', borderRadius: '10px' }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            opacity: 0, transition: 'opacity 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = 1}
            onMouseLeave={e => e.currentTarget.style.opacity = 0}
          >
            <button type="button" onClick={(e) => { e.stopPropagation(); ref.current?.click(); }}
              style={{
                background: C.white, border: 'none', borderRadius: '8px',
                padding: '6px 14px', fontSize: '0.75rem', fontWeight: 600,
                fontFamily: 'Barlow, sans-serif', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px', color: C.charcoal
              }}>
              <FiUpload size={12} /> Replace
            </button>
            <button type="button" onClick={(e) => { e.stopPropagation(); onClear(); }}
              style={{
                background: C.red, border: 'none', borderRadius: '8px',
                padding: '6px 14px', fontSize: '0.75rem', fontWeight: 600,
                fontFamily: 'Barlow, sans-serif', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px', color: C.white
              }}>
              <FiX size={12} /> Remove
            </button>
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '1rem', pointerEvents: 'none' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '12px',
            background: dragging ? C.redLight : C.lightGray,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 0.5rem', transition: 'background 0.2s'
          }}>
            {dragging ? <FiImage size={20} color={C.red} /> : <FiUpload size={20} color={C.gray} />}
          </div>
          <p style={{
            margin: '0 0 4px', fontFamily: 'Barlow, sans-serif', fontSize: '0.8rem',
            fontWeight: 500, color: C.charcoal
          }}>
            {dragging ? 'Drop to upload' : 'Drag & drop or click'}
          </p>
          <p style={{ margin: 0, fontSize: '0.7rem', color: C.gray }}>{hint}</p>
        </div>
      )}
      <input ref={ref} id={id} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
    </div>
  );
}

/* ─── Field wrapper ─── */
function Field({ label, icon, hint, children }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{
        display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px',
        fontFamily: 'Barlow, sans-serif', fontSize: '0.7rem', fontWeight: 600,
        letterSpacing: '0.1em', textTransform: 'uppercase', color: C.charcoal
      }}>
        {icon && React.cloneElement(icon, { size: 12, color: C.red })}
        {label}
      </label>
      {children}
      {hint && <p style={{ margin: '4px 0 0', fontSize: '0.68rem', color: C.gray }}>{hint}</p>}
    </div>
  );
}

const inp = {
  width: '100%', border: `1.5px solid ${C.border}`, borderRadius: '8px',
  padding: '8px 12px', fontFamily: 'Barlow, sans-serif', fontSize: '0.875rem',
  color: C.charcoal, background: C.white, outline: 'none',
  transition: 'border-color 0.18s', boxSizing: 'border-box',
};

/* ─── Banner list card ── */
function BannerCard({ banner, onEdit, onDelete, onToggle }) {
  const img = banner.desktopImage || banner.image || banner.mobileImage;
  const [hovered, setHovered] = useState(false);
  return (
    <div style={{
      background: C.white, border: `1px solid ${C.border}`, borderRadius: '12px',
      overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative',
      transition: 'box-shadow 0.25s, transform 0.25s',
      boxShadow: hovered ? `0 12px 28px ${C.red}20` : 'none',
      transform: hovered ? 'translateY(-4px)' : 'none',
    }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Active stripe */}
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px',
        background: banner.isActive ? C.red : C.border, transition: 'background 0.2s',
        borderRadius: '12px 0 0 12px'
      }} />

      {/* Thumbnail */}
      <div style={{ position: 'relative', paddingTop: '45%', background: C.lightGray, marginLeft: '4px' }}>
        {img
          ? <img src={img} alt={banner.title || 'Banner'}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
              justifyContent: 'center' }}>
              <FiImage size={28} color={C.gray} />
            </div>
        }
        <span style={{
          position: 'absolute', top: 10, right: 10,
          background: banner.isActive ? C.red : C.gray,
          color: C.white, borderRadius: '6px',
          fontSize: '0.6rem', fontWeight: 600,
          letterSpacing: '0.08em', textTransform: 'uppercase', padding: '3px 8px',
          display: 'flex', alignItems: 'center', gap: '4px'
        }}>
          {banner.isActive ? <FiEye size={10} /> : <FiEyeOff size={10} />}
          {banner.isActive ? 'Active' : 'Hidden'}
        </span>
      </div>

      {/* Info */}
      <div style={{ padding: '0.75rem 1rem', flex: 1 }}>
        <p style={{
          margin: '0 0 2px', fontSize: '0.9rem', fontWeight: 600, color: C.charcoal,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
        }}>{banner.title || 'Untitled'}</p>
        {banner.subtitle && (
          <p style={{ margin: '0 0 5px', fontSize: '0.75rem', color: C.gray,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {banner.subtitle}
          </p>
        )}
        {banner.ctaLink && (
          <p style={{ margin: 0, fontSize: '0.7rem', color: C.red, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <FiLink size={10} /> {banner.ctaLink}
          </p>
        )}
      </div>

      {/* Actions row */}
      <div style={{ display: 'flex', borderTop: `1px solid ${C.border}` }}>
        <button
          onClick={() => onToggle(banner._id, !banner.isActive)}
          style={{
            flex: 1, background: 'none', border: 'none',
            borderRight: `1px solid ${C.border}`,
            padding: '8px 4px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            fontSize: '0.7rem', fontWeight: 500, color: banner.isActive ? C.gray : C.red,
            transition: 'background 0.14s'
          }}
          onMouseEnter={(e) => e.target.style.background = C.lightGray}
          onMouseLeave={(e) => e.target.style.background = 'none'}
        >
          {banner.isActive ? <FiToggleRight size={14} /> : <FiToggleLeft size={14} />}
          {banner.isActive ? 'Deactivate' : 'Activate'}
        </button>
        <button
          onClick={() => onEdit(banner)}
          style={{
            flex: 1, background: 'none', border: 'none',
            borderRight: `1px solid ${C.border}`,
            padding: '8px 4px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            fontSize: '0.7rem', fontWeight: 500, color: C.charcoal,
            transition: 'background 0.14s'
          }}
          onMouseEnter={(e) => e.target.style.background = C.lightGray}
          onMouseLeave={(e) => e.target.style.background = 'none'}
        >
          <FiEdit2 size={12} /> Edit
        </button>
        <button
          onClick={() => onDelete(banner._id)}
          style={{
            flex: 1, background: 'none', border: 'none',
            padding: '8px 4px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            fontSize: '0.7rem', fontWeight: 500, color: C.red,
            transition: 'background 0.14s'
          }}
          onMouseEnter={(e) => e.target.style.background = C.redLight}
          onMouseLeave={(e) => e.target.style.background = 'none'}
        >
          <FiTrash2 size={12} /> Delete
        </button>
      </div>
    </div>
  );
}

/* ─── Main ── */
export default function BannerManagement() {
  const navigate = useNavigate();
  const [banners, setBanners]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [editingId, setEditingId]   = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError]   = useState(null);
  const [toast, setToast]           = useState(null);

  const [form, setForm] = useState({
    title: '', subtitle: '', ctaText: '', ctaLink: '',
    isActive: true, position: 'home-top',
    desktopImage: null, mobileImage: null,
  });
  const [deskPrev, setDeskPrev] = useState(null);
  const [mobPrev,  setMobPrev]  = useState(null);

  const positions = [
    { value: 'home-top',    label: 'Home — Top Banner' },
    { value: 'home-mid',    label: 'Home — Mid Section' },
    { value: 'home-bottom', label: 'Home — Bottom' },
    { value: 'catalog-top', label: 'Catalog — Top' },
    { value: 'sidebar',     label: 'Sidebar' },
  ];

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchBanners = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/banners`);
      setBanners(res.data || []);
    } catch { showToast('Failed to load banners.', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBanners(); }, []);

  const resetForm = () => {
    setForm({ title: '', subtitle: '', ctaText: '', ctaLink: '', isActive: true,
      position: 'home-top', desktopImage: null, mobileImage: null });
    setDeskPrev(null); setMobPrev(null);
    setEditingId(null); setFormError(null);
  };

  const openEdit = (banner) => {
    setForm({
      title: banner.title || '', subtitle: banner.subtitle || '',
      ctaText: banner.ctaText || '', ctaLink: banner.ctaLink || '',
      isActive: banner.isActive, position: banner.position || 'home-top',
      desktopImage: null, mobileImage: null,
    });
    setDeskPrev(banner.desktopImage || banner.image || null);
    setMobPrev(banner.mobileImage || null);
    setEditingId(banner._id); setShowForm(true); setFormError(null);
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!deskPrev) { setFormError('Desktop image is required.'); return; }
    setSubmitting(true); setFormError(null);
    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v !== null && v !== undefined) data.append(k, v); });
    try {
      if (editingId) {
        await axios.put(`${process.env.REACT_APP_API_URL}/api/banners/${editingId}`, data,
          { headers: { 'Content-Type': 'multipart/form-data' } });
        showToast('Banner updated.');
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/banners`, data,
          { headers: { 'Content-Type': 'multipart/form-data' } });
        showToast('Banner created.');
      }
      fetchBanners(); setShowForm(false); resetForm();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save banner.');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this banner permanently?')) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/banners/${id}`);
      fetchBanners(); showToast('Banner deleted.');
    } catch { showToast('Failed to delete.', 'error'); }
  };

  const handleToggle = async (id, isActive) => {
    try {
      await axios.patch(`${process.env.REACT_APP_API_URL}/api/banners/${id}`, { isActive });
      setBanners(prev => prev.map(b => b._id === id ? { ...b, isActive } : b));
    } catch { showToast('Failed to update status.', 'error'); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;500;600;700&display=swap');
        
        .bm-page {
          min-height: 100vh;
          background: ${C.white};
          font-family: 'Barlow', sans-serif;
        }

        .bm-inp:focus {
          border-color: ${C.red} !important;
          outline: none;
          box-shadow: 0 0 0 3px ${C.red}20;
        }

        .bm-toast {
          position: fixed;
          bottom: 1.5rem;
          right: 1.5rem;
          padding: 0.75rem 1.25rem;
          border-radius: 8px;
          font-weight: 500;
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          z-index: 9999;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
          animation: toastIn 0.22s ease;
        }
        .bm-toast.success { background: ${C.charcoal}; color: ${C.white}; border-left: 4px solid #10B981; }
        .bm-toast.error { background: ${C.charcoal}; color: ${C.white}; border-left: 4px solid ${C.red}; }
        
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="bm-page" style={{ padding: '2rem 0' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1rem' }}>
          {/* Back Button */}
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'none',
              border: 'none',
              color: C.red,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.5rem',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 500
            }}
            onMouseEnter={(e) => e.target.style.opacity = '0.8'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >
            <FiArrowLeft size={16} /> Back to Dashboard
          </button>

          {/* Header */}
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                fontSize: '0.68rem',
                fontWeight: 600,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: C.red,
                marginBottom: '0.5rem'
              }}>
                <span style={{ width: '5px', height: '5px', background: C.red, borderRadius: '50%' }} />
                Management
              </div>
              <h1 style={{
                margin: 0,
                fontWeight: 700,
                fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                color: C.charcoal,
                lineHeight: 1.2
              }}>
                Banner Management
              </h1>
              <div style={{
                height: '3px',
                width: '60px',
                background: C.red,
                borderRadius: '2px',
                marginTop: '0.5rem'
              }} />
              <p style={{ color: C.gray, fontSize: '0.85rem', marginTop: '0.5rem' }}>
                Manage promotional banners across your website
              </p>
            </div>
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              style={{
                background: C.gradient,
                border: 'none',
                borderRadius: '30px',
                padding: '0.6rem 1.25rem',
                color: C.white,
                fontWeight: 600,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = `0 4px 12px ${C.red}40`;
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <FiPlus size={16} /> New Banner
            </button>
          </div>

          {/* Stats Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              background: C.redLight,
              borderRadius: '12px',
              padding: '1rem',
              border: `1px solid ${C.border}`
            }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: C.red }}>{banners.length}</div>
              <div style={{ fontSize: '0.7rem', color: C.gray, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Banners</div>
            </div>
            <div style={{
              background: C.white,
              borderRadius: '12px',
              padding: '1rem',
              border: `1px solid ${C.border}`
            }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#10B981' }}>{banners.filter(b => b.isActive).length}</div>
              <div style={{ fontSize: '0.7rem', color: C.gray, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active</div>
            </div>
            <div style={{
              background: C.white,
              borderRadius: '12px',
              padding: '1rem',
              border: `1px solid ${C.border}`
            }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: C.gray }}>{banners.filter(b => !b.isActive).length}</div>
              <div style={{ fontSize: '0.7rem', color: C.gray, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hidden</div>
            </div>
          </div>

          {/* Main Content - Two Column Layout */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: showForm ? '1fr 450px' : '1fr',
            gap: '1.5rem',
            transition: 'all 0.3s ease'
          }}>
            {/* Left Column - Banner List */}
            <div>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                  <Spinner animation="border" style={{ color: C.red, width: '2.5rem', height: '2.5rem', borderWidth: '3px' }} />
                </div>
              ) : banners.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '4rem',
                  background: C.white,
                  borderRadius: '12px',
                  border: `2px dashed ${C.border}`
                }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    background: C.redLight,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem'
                  }}>
                    <FiImage size={32} color={C.red} />
                  </div>
                  <h3 style={{ color: C.charcoal, marginBottom: '0.5rem' }}>No Banners Yet</h3>
                  <p style={{ color: C.gray, marginBottom: '1rem' }}>Click "New Banner" to create your first promotional banner.</p>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '1rem'
                }}>
                  {banners.map(b => (
                    <BannerCard key={b._id} banner={b}
                      onEdit={openEdit} onDelete={handleDelete} onToggle={handleToggle} />
                  ))}
                </div>
              )}
            </div>

            {/* Right Column - Form Panel */}
            {showForm && (
              <div style={{
                background: C.white,
                borderRadius: '12px',
                border: `1px solid ${C.border}`,
                position: 'sticky',
                top: '2rem',
                height: 'fit-content',
                maxHeight: 'calc(100vh - 2rem)',
                overflow: 'auto'
              }}>
                <div style={{
                  padding: '1rem 1.25rem',
                  borderBottom: `1px solid ${C.border}`,
                  background: C.redLight,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: C.charcoal }}>
                    {editingId ? 'Edit Banner' : 'Create New Banner'}
                  </h3>
                  <button
                    onClick={() => { setShowForm(false); resetForm(); }}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: C.gray
                    }}
                  >
                    <FiX size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '1.25rem' }}>
                  {formError && (
                    <div style={{
                      background: C.redLight,
                      border: `1px solid ${C.red}`,
                      borderRadius: '8px',
                      padding: '0.75rem',
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: C.red,
                      fontSize: '0.8rem'
                    }}>
                      <FiAlertCircle size={14} />
                      {formError}
                    </div>
                  )}

                  <Field label="Desktop Image" icon={<FiImage />} hint="1920 × 500 px recommended">
                    <DropZone id="bm-desk" preview={deskPrev} hint="PNG · JPG · WebP up to 10MB"
                      onFile={(f) => { set('desktopImage', f); setDeskPrev(URL.createObjectURL(f)); }}
                      onClear={() => { set('desktopImage', null); setDeskPrev(null); }} />
                  </Field>

                  <Field label="Mobile Image" icon={<FiImage />} hint="768 × 400 px recommended">
                    <DropZone id="bm-mob" preview={mobPrev} hint="PNG · JPG · WebP up to 5MB"
                      onFile={(f) => { set('mobileImage', f); setMobPrev(URL.createObjectURL(f)); }}
                      onClear={() => { set('mobileImage', null); setMobPrev(null); }} />
                  </Field>

                  <div style={{ height: '1px', background: C.border, margin: '1rem 0' }} />

                  <Field label="Title" icon={<FiType />}>
                    <input className="bm-inp" style={inp} type="text"
                      placeholder="e.g., Summer Sale" value={form.title}
                      onChange={e => set('title', e.target.value)} />
                  </Field>

                  <Field label="Subtitle" icon={<FiType />}>
                    <input className="bm-inp" style={inp} type="text"
                      placeholder="e.g., Up to 40% off" value={form.subtitle}
                      onChange={e => set('subtitle', e.target.value)} />
                  </Field>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <Field label="Button Text" icon={<FiType />}>
                      <input className="bm-inp" style={inp} type="text"
                        placeholder="Shop Now" value={form.ctaText}
                        onChange={e => set('ctaText', e.target.value)} />
                    </Field>
                    <Field label="Link" icon={<FiLink />}>
                      <input className="bm-inp" style={inp} type="text"
                        placeholder="/catalog" value={form.ctaLink}
                        onChange={e => set('ctaLink', e.target.value)} />
                    </Field>
                  </div>

                  <Field label="Placement" icon={<FiMove />} hint="Where this banner appears">
                    <select className="bm-inp" style={{ ...inp, cursor: 'pointer' }}
                      value={form.position} onChange={e => set('position', e.target.value)}>
                      {positions.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                  </Field>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    background: C.redLight,
                    borderRadius: '8px',
                    marginBottom: '1rem'
                  }}>
                    <span style={{ fontWeight: 500, color: C.charcoal }}>
                      {form.isActive ? 'Active — visible on site' : 'Hidden — not shown'}
                    </span>
                    <button
                      type="button"
                      onClick={() => set('isActive', !form.isActive)}
                      style={{
                        background: form.isActive ? C.red : C.gray,
                        border: 'none',
                        borderRadius: '30px',
                        padding: '0.25rem 0.75rem',
                        color: C.white,
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {form.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                    <button
                      type="button"
                      onClick={() => { setShowForm(false); resetForm(); }}
                      style={{
                        flex: 1,
                        background: C.white,
                        border: `1.5px solid ${C.border}`,
                        borderRadius: '30px',
                        padding: '0.6rem',
                        color: C.gray,
                        fontWeight: 500,
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      style={{
                        flex: 1,
                        background: C.gradient,
                        border: 'none',
                        borderRadius: '30px',
                        padding: '0.6rem',
                        color: C.white,
                        fontWeight: 600,
                        cursor: submitting ? 'not-allowed' : 'pointer',
                        opacity: submitting ? 0.7 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      {submitting ? (
                        <><Spinner animation="border" size="sm" style={{ width: '14px', height: '14px', borderWidth: '2px' }} /> Saving...</>
                      ) : (
                        <><FiSave size={14} /> {editingId ? 'Update Banner' : 'Create Banner'}</>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`bm-toast ${toast.type}`}>
          {toast.type === 'success' ? <FiCheck size={14} /> : <FiAlertCircle size={14} />}
          {toast.msg}
        </div>
      )}
    </>
  );
}