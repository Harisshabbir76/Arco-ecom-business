import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { Spinner } from 'react-bootstrap';
import {
  FiPlus, FiEdit2, FiTrash2, FiUpload, FiCheck, FiX,
  FiImage, FiLink, FiType, FiEye, FiEyeOff,
  FiMove, FiSave, FiAlertCircle, FiToggleLeft, FiToggleRight
} from 'react-icons/fi';

const C = {
  red:      '#CC1B1B',
  redDark:  '#A01212',
  redLight: '#fdf2f2',
  black:    '#111111',
  charcoal: '#1e1e1e',
  white:    '#ffffff',
  offWhite: '#F5F2EE',
  gold:     '#C8A951',
  border:   '#E0DDD9',
  gray:     '#888888',
  light:    '#f5f5f5',
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
        borderRadius: '4px',
        background: dragging ? C.redLight : preview ? '#fafafa' : C.offWhite,
        minHeight: '120px',
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
            style={{ width: '100%', height: '120px', objectFit: 'cover', display: 'block' }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.42)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            opacity: 0, transition: 'opacity 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = 1}
            onMouseLeave={e => e.currentTarget.style.opacity = 0}
          >
            <button type="button" onClick={(e) => { e.stopPropagation(); ref.current?.click(); }}
              style={{
                background: 'white', border: 'none', borderRadius: '3px',
                padding: '5px 12px', fontSize: '0.7rem', fontWeight: 600,
                fontFamily: "'Oswald',sans-serif", letterSpacing: '0.08em',
                textTransform: 'uppercase', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '5px', color: C.charcoal
              }}>
              <FiUpload size={11} /> Replace
            </button>
            <button type="button" onClick={(e) => { e.stopPropagation(); onClear(); }}
              style={{
                background: C.red, border: 'none', borderRadius: '3px',
                padding: '5px 12px', fontSize: '0.7rem', fontWeight: 600,
                fontFamily: "'Oswald',sans-serif", letterSpacing: '0.08em',
                textTransform: 'uppercase', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '5px', color: 'white'
              }}>
              <FiX size={11} /> Remove
            </button>
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '1rem', pointerEvents: 'none' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '8px',
            background: dragging ? 'rgba(204,27,27,0.12)' : '#ebebeb',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 0.6rem', transition: 'background 0.2s'
          }}>
            {dragging ? <FiImage size={18} color={C.red} /> : <FiUpload size={18} color={C.gray} />}
          </div>
          <p style={{ margin: '0 0 3px', fontFamily: "'Oswald',sans-serif", fontSize: '0.76rem',
            fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.charcoal }}>
            {dragging ? 'Drop to upload' : 'Drag & drop or click'}
          </p>
          <p style={{ margin: 0, fontFamily: "'Barlow',sans-serif", fontSize: '0.7rem', color: C.gray }}>{hint}</p>
          <span style={{
            display: 'inline-block', marginTop: '8px',
            background: 'rgba(204,27,27,0.1)', color: C.red,
            fontFamily: "'Oswald',sans-serif", fontSize: '0.62rem', fontWeight: 600,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            padding: '3px 10px', borderRadius: '100px'
          }}>Browse Files</span>
        </div>
      )}
      <input ref={ref} id={id} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
    </div>
  );
}

/* ── Field wrapper ── */
function Field({ label, icon, hint, children }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{
        display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px',
        fontFamily: "'Oswald',sans-serif", fontSize: '0.68rem', fontWeight: 600,
        letterSpacing: '0.12em', textTransform: 'uppercase', color: C.charcoal
      }}>
        {icon && React.cloneElement(icon, { size: 12, color: C.red })}
        {label}
      </label>
      {children}
      {hint && <p style={{ margin: '4px 0 0', fontFamily: "'Barlow',sans-serif",
        fontSize: '0.68rem', color: C.gray }}>{hint}</p>}
    </div>
  );
}

const inp = {
  width: '100%', border: `1.5px solid ${C.border}`, borderRadius: '3px',
  padding: '8px 11px', fontFamily: "'Barlow',sans-serif", fontSize: '0.875rem',
  color: C.black, background: C.white, outline: 'none',
  transition: 'border-color 0.18s', boxSizing: 'border-box',
};

/* ── Banner list card ── */
function BannerCard({ banner, onEdit, onDelete, onToggle }) {
  const img = banner.desktopImage || banner.image || banner.mobileImage;
  const [hovered, setHovered] = useState(false);
  return (
    <div style={{
      background: C.white, border: `1px solid ${C.border}`, borderRadius: '4px',
      overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative',
      transition: 'box-shadow 0.22s, transform 0.22s',
      boxShadow: hovered ? '0 10px 32px rgba(0,0,0,0.11)' : 'none',
      transform: hovered ? 'translateY(-3px)' : 'none',
    }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Active stripe */}
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0, width: '3px',
        background: banner.isActive ? C.red : C.border, transition: 'background 0.2s'
      }} />

      {/* Thumbnail */}
      <div style={{ position: 'relative', paddingTop: '38%', background: '#f0ece8', marginLeft: '3px' }}>
        {img
          ? <img src={img} alt={banner.title || 'Banner'}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
              justifyContent: 'center' }}>
              <FiImage size={24} color={C.gray} />
            </div>
        }
        <span style={{
          position: 'absolute', top: 8, right: 8,
          background: banner.isActive ? C.red : 'rgba(17,17,17,0.65)',
          color: 'white', borderRadius: '2px',
          fontFamily: "'Oswald',sans-serif", fontSize: '0.56rem', fontWeight: 600,
          letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 7px',
          display: 'flex', alignItems: 'center', gap: '3px'
        }}>
          {banner.isActive ? <FiEye size={9} /> : <FiEyeOff size={9} />}
          {banner.isActive ? 'Live' : 'Hidden'}
        </span>
        {banner.position && (
          <span style={{
            position: 'absolute', bottom: 8, left: 8,
            background: 'rgba(0,0,0,0.55)', color: 'rgba(255,255,255,0.85)',
            borderRadius: '2px', fontFamily: "'Barlow',sans-serif",
            fontSize: '0.6rem', padding: '2px 7px', letterSpacing: '0.04em'
          }}>
            {banner.position}
          </span>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '0.75rem 1rem 0.75rem 1.25rem', flex: 1 }}>
        <p style={{
          margin: '0 0 2px', fontFamily: "'Oswald',sans-serif", fontSize: '0.875rem',
          fontWeight: 600, letterSpacing: '0.02em', color: C.black,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
        }}>{banner.title || 'Untitled'}</p>
        {banner.subtitle && (
          <p style={{ margin: '0 0 5px', fontFamily: "'Barlow',sans-serif", fontSize: '0.76rem',
            color: C.gray, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {banner.subtitle}
          </p>
        )}
        {banner.ctaLink && (
          <p style={{ margin: 0, fontFamily: "'Barlow',sans-serif", fontSize: '0.68rem',
            color: C.red, display: 'flex', alignItems: 'center', gap: '3px' }}>
            <FiLink size={9} /> {banner.ctaLink}
          </p>
        )}
      </div>

      {/* Actions row */}
      <div style={{ display: 'flex', borderTop: `1px solid ${C.border}`, marginLeft: '3px' }}>
        {[
          {
            label: banner.isActive ? 'Deactivate' : 'Activate',
            icon: banner.isActive ? <FiToggleRight size={12} /> : <FiToggleLeft size={12} />,
            color: banner.isActive ? C.gray : C.red,
            hoverBg: C.light,
            onClick: () => onToggle(banner._id, !banner.isActive),
          },
          {
            label: 'Edit',
            icon: <FiEdit2 size={12} />,
            color: C.charcoal,
            hoverBg: C.light,
            onClick: () => onEdit(banner),
          },
          {
            label: 'Delete',
            icon: <FiTrash2 size={12} />,
            color: C.red,
            hoverBg: C.redLight,
            onClick: () => onDelete(banner._id),
          },
        ].map((btn, i, arr) => (
          <ActionBtn key={btn.label} {...btn} hasBorder={i < arr.length - 1} />
        ))}
      </div>
    </div>
  );
}

function ActionBtn({ label, icon, color, hoverBg, onClick, hasBorder }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flex: 1, background: hov ? hoverBg : 'none', border: 'none',
        borderRight: hasBorder ? `1px solid ${C.border}` : 'none',
        padding: '7px 4px', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
        fontFamily: "'Oswald',sans-serif", fontSize: '0.6rem', fontWeight: 500,
        letterSpacing: '0.08em', textTransform: 'uppercase', color,
        transition: 'background 0.14s',
      }}>
      {icon} {label}
    </button>
  );
}

/* ── Main ── */
export default function BannerManagement() {
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
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Cormorant+Garamond:ital@1&family=Barlow:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }

        .bm-page { min-height: 100vh; background: ${C.offWhite}; font-family: 'Barlow', sans-serif; }

        /* Top bar */
        .bm-topbar {
          background: ${C.black}; padding: 0 2rem; height: 56px;
          display: flex; align-items: center; justify-content: space-between;
          border-bottom: 3px solid ${C.red}; position: sticky; top: 0; z-index: 100;
        }
        .bm-topbar-title {
          font-family: 'Oswald', sans-serif; font-size: 1.05rem; font-weight: 600;
          letter-spacing: 0.08em; text-transform: uppercase; color: ${C.white}; margin: 0;
        }
        .bm-topbar-title em {
          font-style: italic; font-family: 'Cormorant Garamond', serif;
          font-weight: 400; color: ${C.gold}; font-size: 1.05em; text-transform: none; letter-spacing: 0;
        }
        .bm-topbar-left { display: flex; align-items: center; gap: 12px; }
        .bm-topbar-stripe { width: 4px; height: 28px; background: ${C.red}; flex-shrink: 0; }
        .bm-topbar-count { font-family: 'Barlow',sans-serif; font-size: 0.7rem; color: rgba(255,255,255,0.4); }

        .bm-add-btn {
          display: inline-flex; align-items: center; gap: 6px;
          background: ${C.red}; color: white; font-family: 'Oswald',sans-serif;
          font-size: 0.7rem; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase;
          border: none; padding: 8px 16px; border-radius: 2px; cursor: pointer;
          transition: background 0.18s, transform 0.15s;
        }
        .bm-add-btn:hover { background: ${C.redDark}; transform: translateY(-1px); }

        /* Body grid */
        .bm-body { display: grid; grid-template-columns: 1fr 400px; min-height: calc(100vh - 56px); }

        /* Left */
        .bm-left { padding: 1.75rem 2rem; overflow-y: auto; }

        .bm-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 1rem; margin-bottom: 1.75rem; }
        .bm-stat {
          background: ${C.white}; border: 1px solid ${C.border}; border-radius: 4px;
          padding: 1rem 1.25rem; border-left: 3px solid ${C.red};
        }
        .bm-stat-num { font-family:'Oswald',sans-serif; font-size:1.7rem; font-weight:700; color:${C.red}; line-height:1; margin-bottom:3px; }
        .bm-stat-label { font-family:'Barlow',sans-serif; font-size:0.68rem; font-weight:500; letter-spacing:0.1em; text-transform:uppercase; color:${C.gray}; }

        .bm-sec-label { display:flex; align-items:center; gap:8px; margin-bottom:1.1rem; }
        .bm-sec-bar { width:22px; height:2px; background:${C.red}; }
        .bm-sec-label span { font-family:'Oswald',sans-serif; font-size:0.68rem; font-weight:600; letter-spacing:0.14em; text-transform:uppercase; color:${C.gray}; }

        .bm-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:1rem; }

        .bm-empty {
          grid-column:1/-1; text-align:center; padding:4rem 2rem;
          background:${C.white}; border:2px dashed ${C.border}; border-radius:4px;
        }
        .bm-empty-ico { width:56px;height:56px;background:${C.light};border-radius:8px;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem; }
        .bm-empty h3 { font-family:'Oswald',sans-serif;font-size:0.9rem;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:${C.charcoal};margin:0 0 .35rem; }
        .bm-empty p { font-family:'Barlow',sans-serif;font-size:0.82rem;color:${C.gray};margin:0; }

        /* Right form panel */
        .bm-right {
          background: ${C.white}; border-left: 2px solid ${C.black};
          display: flex; flex-direction: column;
          position: sticky; top: 56px; height: calc(100vh - 56px); overflow: hidden;
        }
        .bm-form-head {
          background: ${C.black}; padding: 1.1rem 1.5rem;
          border-bottom: 2px solid ${C.red};
          display: flex; align-items: center; justify-content: space-between; flex-shrink: 0;
        }
        .bm-form-head-title { font-family:'Oswald',sans-serif;font-size:0.82rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:white;margin:0; }
        .bm-form-close {
          background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.14);
          color:white;width:28px;height:28px;border-radius:3px;
          display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .15s;
        }
        .bm-form-close:hover { background:${C.red}; border-color:${C.red}; }

        .bm-form-scroll { flex:1;overflow-y:auto;padding:1.25rem; }
        .bm-form-scroll::-webkit-scrollbar{width:3px;}
        .bm-form-scroll::-webkit-scrollbar-track{background:${C.offWhite};}
        .bm-form-scroll::-webkit-scrollbar-thumb{background:${C.border};border-radius:2px;}

        .bm-divider { height:1px;background:${C.border};margin:1.1rem 0; }

        .bm-form-footer {
          padding:.875rem 1.25rem;border-top:1px solid ${C.border};
          background:${C.offWhite};display:flex;gap:.625rem;flex-shrink:0;
        }
        .bm-save { flex:1;background:${C.red};color:white;font-family:'Oswald',sans-serif;font-size:0.75rem;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;border:none;padding:10px;border-radius:2px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;transition:background .18s; }
        .bm-save:hover:not(:disabled){background:${C.redDark};}
        .bm-save:disabled{background:#ccc;cursor:not-allowed;}
        .bm-cancel{background:none;border:1.5px solid ${C.border};color:${C.charcoal};font-family:'Oswald',sans-serif;font-size:0.72rem;font-weight:500;letter-spacing:.1em;text-transform:uppercase;padding:10px 16px;border-radius:2px;cursor:pointer;transition:border-color .15s,background .15s;}
        .bm-cancel:hover{border-color:${C.black};background:${C.light};}

        /* Toggle */
        .bm-toggle { display:flex;align-items:center;gap:10px;padding:10px 12px;background:${C.offWhite};border:1px solid ${C.border};border-radius:3px;cursor:pointer;user-select:none; }
        .bm-track { width:36px;height:19px;border-radius:100px;position:relative;flex-shrink:0;transition:background .2s; }
        .bm-thumb { position:absolute;top:2px;width:15px;height:15px;background:white;border-radius:50%;transition:left .2s;box-shadow:0 1px 3px rgba(0,0,0,.2); }
        .bm-toggle-lbl { font-family:'Oswald',sans-serif;font-size:0.75rem;font-weight:500;letter-spacing:.07em;text-transform:uppercase;color:${C.charcoal}; }

        /* Placeholder */
        .bm-ph { flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem;text-align:center; }
        .bm-ph-ico { width:64px;height:64px;background:${C.offWhite};border:1px solid ${C.border};border-radius:10px;display:flex;align-items:center;justify-content:center;margin-bottom:1.1rem; }
        .bm-ph h3 { font-family:'Oswald',sans-serif;font-size:0.88rem;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:${C.charcoal};margin:0 0 .4rem; }
        .bm-ph p { font-family:'Barlow',sans-serif;font-size:0.8rem;color:${C.gray};margin:0 0 1.25rem;line-height:1.5; }
        .bm-ph-btn { display:inline-flex;align-items:center;gap:6px;background:${C.red};color:white;font-family:'Oswald',sans-serif;font-size:0.7rem;font-weight:500;letter-spacing:.1em;text-transform:uppercase;border:none;padding:9px 18px;border-radius:2px;cursor:pointer;transition:background .18s; }
        .bm-ph-btn:hover { background:${C.redDark}; }

        /* Error inline */
        .bm-err { background:${C.redLight};border:1px solid ${C.red};border-left:3px solid ${C.red};border-radius:3px;padding:9px 11px;margin-bottom:1rem;display:flex;align-items:flex-start;gap:7px;font-family:'Barlow',sans-serif;font-size:0.8rem;color:${C.red}; }

        /* Input focus */
        .bm-inp:focus { border-color:${C.red} !important; outline:none; }

        /* Toast */
        .bm-toast {
          position:fixed;bottom:1.5rem;right:1.5rem;padding:9px 14px;border-radius:4px;
          font-family:'Oswald',sans-serif;font-size:0.72rem;font-weight:500;letter-spacing:.08em;text-transform:uppercase;
          display:flex;align-items:center;gap:7px;z-index:9999;
          box-shadow:0 8px 24px rgba(0,0,0,0.16);
          animation:toastIn .22s ease;
        }
        .bm-toast.success { background:${C.black};color:white;border-left:3px solid #2e7d32; }
        .bm-toast.error   { background:${C.black};color:white;border-left:3px solid ${C.red}; }
        @keyframes toastIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

        /* Responsive */
        @media(max-width:900px){
          .bm-body{grid-template-columns:1fr;}
          .bm-right{position:fixed;right:0;top:56px;bottom:0;width:min(100%,400px);z-index:200;box-shadow:-8px 0 40px rgba(0,0,0,.15);}
        }
        @media(max-width:600px){
          .bm-left{padding:1.25rem;}
          .bm-grid{grid-template-columns:1fr;}
          .bm-stats{grid-template-columns:1fr 1fr;}
        }
      `}</style>

      <div className="bm-page">

        {/* ── Top bar ── */}
        <div className="bm-topbar">
          <div className="bm-topbar-left">
            <div className="bm-topbar-stripe" />
            <h1 className="bm-topbar-title">Banner <em>Management</em></h1>
            <span className="bm-topbar-count">{banners.length} banner{banners.length !== 1 ? 's' : ''}</span>
          </div>
          <button className="bm-add-btn" onClick={() => { resetForm(); setShowForm(true); }}>
            <FiPlus size={13} /> New Banner
          </button>
        </div>

        {/* ── Body ── */}
        <div className="bm-body">

          {/* Left */}
          <div className="bm-left">

            {/* Stats */}
            <div className="bm-stats">
              <div className="bm-stat">
                <div className="bm-stat-num">{banners.length}</div>
                <div className="bm-stat-label">Total</div>
              </div>
              <div className="bm-stat">
                <div className="bm-stat-num">{banners.filter(b => b.isActive).length}</div>
                <div className="bm-stat-label">Active</div>
              </div>
              <div className="bm-stat">
                <div className="bm-stat-num">{banners.filter(b => !b.isActive).length}</div>
                <div className="bm-stat-label">Hidden</div>
              </div>
            </div>

            <div className="bm-sec-label">
              <div className="bm-sec-bar" />
              <span>All Banners</span>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                <Spinner animation="border" style={{ color: C.red, width: '2rem', height: '2rem', borderWidth: '2px' }} />
              </div>
            ) : (
              <div className="bm-grid">
                {banners.length === 0 ? (
                  <div className="bm-empty">
                    <div className="bm-empty-ico"><FiImage size={26} color={C.gray} /></div>
                    <h3>No Banners Yet</h3>
                    <p>Click "New Banner" to create your first promotional banner.</p>
                  </div>
                ) : banners.map(b => (
                  <BannerCard key={b._id} banner={b}
                    onEdit={openEdit} onDelete={handleDelete} onToggle={handleToggle} />
                ))}
              </div>
            )}
          </div>

          {/* Right */}
          <div className="bm-right">
            {showForm ? (
              <>
                <div className="bm-form-head">
                  <h2 className="bm-form-head-title">
                    {editingId ? '✎ Edit Banner' : '+ New Banner'}
                  </h2>
                  <button className="bm-form-close" onClick={() => { setShowForm(false); resetForm(); }}>
                    <FiX size={15} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                  <div className="bm-form-scroll">
                    {formError && (
                      <div className="bm-err">
                        <FiAlertCircle size={14} style={{ marginTop: '1px', flexShrink: 0 }} />
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

                    <div className="bm-divider" />

                    <Field label="Title" icon={<FiType />}>
                      <input className="bm-inp" style={inp} type="text"
                        placeholder="e.g. Summer Sale" value={form.title}
                        onChange={e => set('title', e.target.value)} />
                    </Field>

                    <Field label="Subtitle" icon={<FiType />}>
                      <input className="bm-inp" style={inp} type="text"
                        placeholder="e.g. Up to 40% off" value={form.subtitle}
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

                    <div className="bm-toggle" onClick={() => set('isActive', !form.isActive)}>
                      <div className="bm-track" style={{ background: form.isActive ? C.red : C.border }}>
                        <div className="bm-thumb" style={{ left: form.isActive ? '19px' : '2px' }} />
                      </div>
                      <span className="bm-toggle-lbl">
                        {form.isActive ? 'Active — visible on site' : 'Hidden — not shown'}
                      </span>
                    </div>
                  </div>

                  <div className="bm-form-footer">
                    <button type="button" className="bm-cancel"
                      onClick={() => { setShowForm(false); resetForm(); }}>Cancel</button>
                    <button type="submit" className="bm-save" disabled={submitting}>
                      {submitting
                        ? <><Spinner animation="border" size="sm"
                            style={{ width: '13px', height: '13px', borderWidth: '2px' }} /> Saving…</>
                        : <><FiSave size={13} /> {editingId ? 'Update' : 'Create Banner'}</>}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <div className="bm-form-head">
                  <h2 className="bm-form-head-title">Banner Editor</h2>
                </div>
                <div className="bm-ph">
                  <div className="bm-ph-ico"><FiImage size={28} color={C.gray} /></div>
                  <h3>No Banner Selected</h3>
                  <p>Create a new banner or click Edit on an existing one to modify it.</p>
                  <button className="bm-ph-btn" onClick={() => { resetForm(); setShowForm(true); }}>
                    <FiPlus size={13} /> Create Banner
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`bm-toast ${toast.type}`}>
          {toast.type === 'success' ? <FiCheck size={13} /> : <FiAlertCircle size={13} />}
          {toast.msg}
        </div>
      )}
    </>
  );
}