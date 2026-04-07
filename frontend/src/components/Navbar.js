import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import {
  FiShoppingBag,
  FiMenu,
  FiSearch,
  FiUser,
  FiLogOut,
  FiHome,
  FiShoppingCart,
  FiGrid,
  FiInfo,
  FiMail,
  FiChevronDown,
  FiChevronRight,
  FiX,
  FiPackage,
  FiPhone,
  FiHeart,
  FiPlus,
  FiMinus,
  FiChevronUp,
} from 'react-icons/fi';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CartContext } from '../components/CartContext';
import logoImage from '../images/logo.png';

const Navbar = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarTab, setSidebarTab] = useState('menu'); // 'menu' | 'categories'
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [expandedCats, setExpandedCats] = useState({});
  const [scrolled, setScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount } = useContext(CartContext);

  const categoriesRef = useRef(null);

  const C = {
    red: '#CC1B1B',
    redDark: '#A01212',
    redLight: '#fdf2f2',
    black: '#111111',
    charcoal: '#1e1e1e',
    white: '#ffffff',
    offWhite: '#F5F2EE',
    border: '#e8e8e8',
    muted: '#888',
    lightGray: '#f7f7f7',
  };

  // FIX 1: Robust category fetching — handles array, nested object shapes
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/categories`);
        let data = [];
        if (Array.isArray(res.data)) {
          data = res.data;
        } else if (Array.isArray(res.data?.categories)) {
          data = res.data.categories;
        } else if (Array.isArray(res.data?.data)) {
          data = res.data.data;
        }
        setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, [location]);

  useEffect(() => {
    if (showSidebar) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [showSidebar]);

  // FIX 2: Click-outside closes dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoriesRef.current && !categoriesRef.current.contains(event.target)) {
        setCategoriesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.get(`${process.env.REACT_APP_API_URL}/logout`);
      localStorage.removeItem('token');
      localStorage.removeItem('userEmail');
      setIsLoggedIn(false);
      navigate('/');
      setShowSidebar(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowSearch(false);
      setShowSidebar(false);
    }
  };

  const allNavLinks = [
    { name: 'Home',         path: '/',            icon: <FiHome size={14} /> },
    { name: 'New Arrivals', path: '/new-arrivals', icon: <FiShoppingCart size={14} /> },
    { name: 'Catalog',      path: '/catalog',      icon: <FiPackage size={14} /> },
    { name: 'Bundles',      path: '/bundles',      icon: <FiGrid size={14} /> },
    { name: 'About',        path: '/about-us',     icon: <FiInfo size={14} /> },
    { name: 'Contact Us',   path: '/contact-us',   icon: <FiMail size={14} /> },
  ];

  const isActive = (path) => location.pathname === path;

  const toggleCat = (id) => setExpandedCats(prev => ({ ...prev, [id]: !prev[id] }));

  const getCategorySlug = (name) => {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600&family=Barlow:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }

        .nb-root {
          font-family: 'Barlow', sans-serif;
          position: sticky;
          top: 0;
          z-index: 1000;
          background: ${C.white};
          transition: box-shadow 0.3s ease;
        }
        .nb-root.scrolled { box-shadow: 0 4px 20px rgba(0,0,0,0.10); }

        /* ── Desktop Main bar ── */
        .nb-main {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          padding: 0 2.5rem;
          height: 110px;
          background: ${C.white};
          border-bottom: 1px solid ${C.border};
          position: relative;
        }

        .nb-contact-item {
          display: flex; align-items: center; gap: 6px;
          font-size: 0.8rem; color: ${C.muted}; text-decoration: none;
          transition: color 0.15s;
        }
        .nb-contact-item:hover { color: ${C.red}; }
        .nb-contact-item svg { color: ${C.red}; flex-shrink: 0; }

        .nb-logo {
          display: flex; justify-content: center;
          text-decoration: none; margin-bottom: 16px;
        }
        .nb-logo img { height: 80px; object-fit: contain; display: block; }

        .nb-icons {
          display: flex; align-items: center;
          justify-content: flex-end; gap: 4px;
        }
        .nb-icon-btn {
          background: none; border: none; cursor: pointer;
          width: 40px; height: 40px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: ${C.charcoal}; position: relative;
          transition: all 0.18s ease; text-decoration: none;
        }
        .nb-icon-btn:hover { background: ${C.redLight}; color: ${C.red}; }

        .nb-badge {
          position: absolute; top: 2px; right: 2px;
          background: ${C.red}; color: white; font-size: 0.58rem;
          font-weight: 700; border-radius: 100px; min-width: 16px;
          height: 16px; display: flex; align-items: center;
          justify-content: center; border: 2px solid white;
          line-height: 1; padding: 0 2px;
        }

        /* Search overlay */
        .nb-search-overlay {
          position: absolute; top: 100%; left: 0; right: 0;
          background: ${C.white}; border-bottom: 2px solid ${C.red};
          padding: 1rem 2.5rem; box-shadow: 0 8px 24px rgba(0,0,0,0.10);
          z-index: 999; animation: slideDown 0.2s ease;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .nb-search-form {
          display: flex; align-items: center; background: ${C.lightGray};
          border: 1.5px solid ${C.border}; border-radius: 4px; height: 44px;
          padding: 0 0.5rem 0 1rem; max-width: 600px; margin: 0 auto;
          transition: border-color 0.2s;
        }
        .nb-search-form:focus-within { border-color: ${C.red}; background: ${C.white}; }
        .nb-search-form input {
          flex: 1; border: none; background: transparent; outline: none;
          font-family: 'Barlow', sans-serif; font-size: 0.9rem; color: ${C.black};
        }
        .nb-search-form input::placeholder { color: #aaa; }
        .nb-search-form button[type="submit"] {
          background: ${C.red}; border: none; border-radius: 3px;
          color: white; width: 34px; height: 32px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: background 0.2s;
        }
        .nb-search-form button[type="submit"]:hover { background: ${C.redDark}; }

        /* ── Desktop Nav bar ── */
        /* FIX 3: Remove overflow-x:auto — it creates a stacking context
           that clips the dropdown even with high z-index */
        .nb-nav {
          display: flex; align-items: center; justify-content: center;
          gap: 0; height: 48px; background: ${C.white};
          border-bottom: 1px solid ${C.border};
          padding: 0 2rem;
          position: relative;
          overflow: visible;
        }
        .nb-nav-link {
          display: flex; align-items: center; gap: 5px;
          padding: 0 18px; height: 48px;
          font-family: 'Barlow', sans-serif; font-size: 0.875rem;
          font-weight: 500; letter-spacing: 0.03em; color: ${C.charcoal};
          text-decoration: none; white-space: nowrap; transition: all 0.18s ease;
          background: transparent; border: none; cursor: pointer; position: relative;
        }
        .nb-nav-link::after {
          content: ''; position: absolute; bottom: 0; left: 18px; right: 18px;
          height: 2px; background: ${C.red}; transform: scaleX(0);
          transition: transform 0.2s ease; transform-origin: center;
        }
        .nb-nav-link:hover { color: ${C.red}; }
        .nb-nav-link:hover::after, .nb-nav-link.active::after { transform: scaleX(1); }
        .nb-nav-link.active { color: ${C.red}; font-weight: 600; }

        /* FIX 4: Categories wrapper — high z-index to escape stacking context */
        .nb-cat-wrap {
          position: relative;
          height: 48px;
          display: flex;
          align-items: center;
          z-index: 9999;
        }

        .nb-cat-button {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 0 18px;
          height: 48px;
          font-family: 'Barlow', sans-serif;
          font-size: 0.875rem;
          font-weight: 500;
          letter-spacing: 0.03em;
          color: ${C.charcoal};
          background: transparent;
          border: none;
          cursor: pointer;
          position: relative;
          transition: all 0.18s ease;
          white-space: nowrap;
        }

        .nb-cat-button::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 18px;
          right: 18px;
          height: 2px;
          background: ${C.red};
          transform: scaleX(0);
          transition: transform 0.2s ease;
          transform-origin: center;
        }

        .nb-cat-button:hover { color: ${C.red}; }
        .nb-cat-button:hover::after,
        .nb-cat-button.active::after { transform: scaleX(1); }
        .nb-cat-button.active { color: ${C.red}; font-weight: 600; }

        /* FIX 5: Dropdown — absolute to .nb-cat-wrap, high z-index, visible overflow */
        .nb-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          background: ${C.white};
          border: 1px solid ${C.border};
          border-top: 2px solid ${C.red};
          border-radius: 0 0 6px 6px;
          min-width: 220px;
          max-width: 280px;
          max-height: 400px;
          overflow-y: auto;
          box-shadow: 0 12px 32px rgba(0,0,0,0.15);
          z-index: 9999;
          animation: dropIn 0.2s ease;
        }

        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .dropdown-header {
          padding: 10px 16px;
          font-weight: 600;
          color: ${C.red};
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          background: ${C.lightGray};
          border-bottom: 1px solid ${C.border};
          position: sticky;
          top: 0;
        }

        .nb-dropdown-item {
          display: block;
          padding: 10px 16px;
          font-family: 'Barlow', sans-serif;
          font-size: 0.875rem;
          color: ${C.charcoal};
          text-decoration: none;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          background: transparent;
          width: 100%;
          text-align: left;
          white-space: nowrap;
        }

        .nb-dropdown-item:hover {
          background: ${C.redLight};
          color: ${C.red};
          padding-left: 20px;
        }

        .nb-dropdown-divider {
          height: 1px;
          background: ${C.border};
          margin: 0.25rem 0;
        }

        /* ── Mobile Top Bar ── */
        .nb-mobile-bar {
          display: none;
          grid-template-columns: 52px 1fr 52px;
          align-items: center;
          padding: 0 1rem;
          height: 60px;
          background: ${C.white};
          border-bottom: 1px solid ${C.border};
          position: relative;
        }
        .nb-mobile-logo {
          display: flex; 
          justify-content: center;
          text-decoration: none;
        }
        .nb-mobile-logo img { height: 38px; object-fit: contain; }
        .nb-mobile-right {
          display: flex; 
          align-items: center; 
          justify-content: flex-end; 
          gap: 2px;
        }

        /* ── Mobile Bottom Bar ── */
        .nb-bottom-bar {
          display: none;
          position: fixed;
          bottom: 0; left: 0; right: 0;
          height: 60px;
          background: ${C.white};
          border-top: 1px solid ${C.border};
          z-index: 1050;
          box-shadow: 0 -2px 12px rgba(0,0,0,0.08);
        }
        .nb-bottom-bar-inner {
          display: flex; align-items: stretch; height: 100%;
        }
        .nb-bottom-tab {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 3px;
          font-family: 'Barlow', sans-serif; font-size: 0.62rem;
          font-weight: 500; color: ${C.muted};
          text-decoration: none; background: transparent;
          border: none; cursor: pointer;
          position: relative; transition: color 0.15s;
          padding: 6px 0 4px;
        }
        .nb-bottom-tab.active { color: ${C.red}; }
        .nb-bottom-tab:hover { color: ${C.red}; }
        .nb-bottom-tab-badge {
          position: absolute; top: 6px;
          right: calc(50% - 16px);
          background: ${C.red}; color: white;
          font-size: 0.5rem; font-weight: 700;
          border-radius: 100px; min-width: 14px; height: 14px;
          display: flex; align-items: center; justify-content: center;
          border: 1.5px solid white; padding: 0 2px; line-height: 1;
        }

        /* ── Mobile Sidebar ── */
        .nb-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.45);
          z-index: 1100; backdrop-filter: blur(2px);
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .nb-sidebar {
          position: fixed; left: 0; top: 0; bottom: 0; width: 290px;
          background: ${C.white}; z-index: 1200; display: flex; flex-direction: column;
          box-shadow: 4px 0 30px rgba(0,0,0,0.15);
          animation: slideIn 0.25s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to   { transform: translateX(0); }
        }

        .nb-sidebar-tabs {
          display: flex; align-items: stretch;
          border-bottom: 1px solid ${C.border};
          flex-shrink: 0;
        }
        .nb-sidebar-tab-btn {
          flex: 1; padding: 0; height: 52px;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Barlow', sans-serif; font-size: 0.78rem;
          font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase;
          border: none; background: transparent; cursor: pointer;
          color: ${C.muted}; border-bottom: 2px solid transparent;
          transition: color 0.15s, border-color 0.15s;
          margin-bottom: -1px;
        }
        .nb-sidebar-tab-btn.active {
          color: ${C.charcoal}; border-bottom-color: ${C.red};
        }
        .nb-sidebar-close {
          width: 52px; height: 52px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          background: ${C.black}; border: none; cursor: pointer;
          color: white; font-size: 1.1rem;
        }

        .nb-sidebar-body { flex: 1; overflow-y: auto; }

        .nb-sidebar-row {
          display: flex; align-items: center;
          padding: 0 20px;
          height: 52px;
          border-bottom: 1px solid ${C.border};
          font-family: 'Barlow', sans-serif; font-size: 0.9rem;
          color: ${C.charcoal}; text-decoration: none;
          background: transparent; border-left: none; border-right: none; border-top: none;
          cursor: pointer; width: 100%; text-align: left;
          transition: color 0.15s, background 0.15s;
          gap: 10px;
        }
        .nb-sidebar-row:hover { color: ${C.red}; background: ${C.redLight}; }
        .nb-sidebar-row.active { color: ${C.red}; }
        .nb-sidebar-row-icon {
          margin-left: auto; color: ${C.muted}; flex-shrink: 0;
        }

        .nb-sidebar-cat-row {
          display: flex; align-items: center;
          padding: 0 20px; height: 52px;
          border-bottom: 1px solid ${C.border};
          font-family: 'Barlow', sans-serif; font-size: 0.9rem;
          color: ${C.charcoal}; background: transparent;
          border-left: none; border-right: none; border-top: none;
          cursor: pointer; width: 100%; text-align: left;
          transition: color 0.15s;
        }
        .nb-sidebar-cat-row:hover { color: ${C.red}; }
        .nb-sidebar-cat-row .nb-sidebar-row-icon { margin-left: auto; }
        .nb-sidebar-cat-sub { background: ${C.lightGray}; }
        .nb-sidebar-cat-sub-row {
          display: block; padding: 12px 20px 12px 36px;
          border-bottom: 1px solid ${C.border};
          font-family: 'Barlow', sans-serif; font-size: 0.85rem;
          color: ${C.muted}; text-decoration: none; background: transparent;
          border-left: none; border-right: none; border-top: none;
          cursor: pointer; width: 100%; text-align: left;
          transition: color 0.15s, padding-left 0.15s;
        }
        .nb-sidebar-cat-sub-row:hover { color: ${C.red}; padding-left: 44px; }

        .nb-sidebar-footer {
          flex-shrink: 0;
          padding: 20px;
          border-top: 1px solid ${C.border};
        }
        .nb-sidebar-footer-label {
          font-family: 'Barlow', sans-serif; font-size: 0.75rem;
          font-weight: 600; color: ${C.muted}; letter-spacing: 0.06em;
          text-transform: uppercase; margin-bottom: 10px;
        }
        .nb-sidebar-footer-contact-item {
          display: flex; align-items: center; gap: 8px;
          font-family: 'Barlow', sans-serif; font-size: 0.82rem;
          color: ${C.muted}; text-decoration: none; padding: 4px 0;
          transition: color 0.15s;
        }
        .nb-sidebar-footer-contact-item:hover { color: ${C.red}; }
        .nb-sidebar-footer-contact-item svg { color: ${C.red}; flex-shrink: 0; }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .nb-main { display: none !important; }
          .nb-nav { display: none !important; }
          .nb-mobile-bar { display: grid !important; }
          .nb-bottom-bar { display: block !important; }
          body { padding-bottom: 60px; }
          
          /* Ensure hamburger takes full width of its column */
          .nb-mobile-bar .nb-icon-btn {
            justify-self: start;
          }
        }
        @media (min-width: 769px) {
          .nb-mobile-bar { display: none !important; }
          .nb-bottom-bar { display: none !important; }
          .nb-ham { display: none !important; }
        }
      `}</style>

      {/* ════════════════════════════════
          DESKTOP NAVBAR
      ════════════════════════════════ */}
      <div className={`nb-root${scrolled ? ' scrolled' : ''}`}>

        {/* Desktop Main bar */}
        <div className="nb-main">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <a href={`tel:${process.env.REACT_APP_WHATSAPP_ADMIN_NUMBER}`} className="nb-contact-item">
              <FiPhone size={13} /> {process.env.REACT_APP_WHATSAPP_ADMIN_NUMBER}
            </a>
            <a href="mailto:info@graceware.shop" className="nb-contact-item">
              <FiMail size={13} /> info@graceware.shop
            </a>
          </div>

          <Link to="/" className="nb-logo">
            <img src={logoImage} alt="Logo" />
          </Link>

          <div className="nb-icons">
            <button className="nb-icon-btn" onClick={() => setShowSearch(v => !v)} title="Search">
              <FiSearch size={20} />
            </button>
            {isLoggedIn ? (
              <button className="nb-icon-btn" onClick={handleLogout} title="Logout">
                <FiLogOut size={20} />
              </button>
            ) : (
              <Link to="/login" className="nb-icon-btn" title="Login">
                <FiUser size={20} />
              </Link>
            )}
            <Link to="/wishlist" className="nb-icon-btn" title="Wishlist">
              <FiHeart size={20} />
            </Link>
            <Link to="/cart" className="nb-icon-btn" title="Cart">
              <FiShoppingBag size={20} />
              {cartCount > 0 && <span className="nb-badge">{cartCount}</span>}
            </Link>
          </div>

          {showSearch && (
            <div className="nb-search-overlay">
              <form className="nb-search-form" onSubmit={handleSearch}>
                <input
                  type="text"
                  placeholder="Search products…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                <button type="submit" aria-label="Search"><FiSearch size={15} /></button>
              </form>
            </div>
          )}
        </div>

        {/* Desktop Nav tabs */}
        <nav className="nb-nav">
          {allNavLinks.slice(0, 3).map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`nb-nav-link${isActive(link.path) ? ' active' : ''}`}
            >
              {link.name}
            </Link>
          ))}

          {/* Categories Dropdown */}
          <div className="nb-cat-wrap" ref={categoriesRef}>
            <button
              className={`nb-cat-button${categoriesOpen ? ' active' : ''}`}
              onClick={() => setCategoriesOpen(v => !v)}
              aria-expanded={categoriesOpen}
              aria-haspopup="true"
            >
              Categories{' '}
              {categoriesOpen
                ? <FiChevronUp size={13} style={{ marginLeft: 3 }} />
                : <FiChevronDown size={13} style={{ marginLeft: 3 }} />}
            </button>

            {categoriesOpen && (
              <div className="nb-dropdown">
                <div className="dropdown-header">Shop by Category</div>

                <button
                  className="nb-dropdown-item"
                  onClick={() => {
                    navigate('/category');
                    setCategoriesOpen(false);
                  }}
                >
                  📂 All Categories
                </button>

                <div className="nb-dropdown-divider" />

                {categories.length > 0 ? (
                  categories.map(cat => (
                    <button
                      key={cat._id || cat.name}
                      className="nb-dropdown-item"
                      onClick={() => {
                        navigate(`/category/${getCategorySlug(cat.name)}`);
                        setCategoriesOpen(false);
                      }}
                    >
                      {cat.name}
                    </button>
                  ))
                ) : (
                  <div
                    className="nb-dropdown-item"
                    style={{ color: '#999', fontStyle: 'italic', cursor: 'default' }}
                  >
                    No categories found
                  </div>
                )}
              </div>
            )}
          </div>

          {allNavLinks.slice(3).map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`nb-nav-link${isActive(link.path) ? ' active' : ''}`}
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* ════════════════════════════════
          MOBILE TOP BAR
      ════════════════════════════════ */}
      <div
        className={`nb-mobile-bar${scrolled ? ' scrolled' : ''}`}
        style={{
          position: 'sticky', top: 0, zIndex: 1000,
          boxShadow: scrolled ? '0 2px 12px rgba(0,0,0,0.08)' : 'none',
          transition: 'box-shadow 0.3s'
        }}
      >
        <button
          className="nb-icon-btn"
          onClick={() => { setShowSidebar(true); setSidebarTab('menu'); }}
          aria-label="Open menu"
          style={{ borderRadius: '6px' }}
        >
          <FiMenu size={22} />
        </button>

        <Link to="/" className="nb-mobile-logo">
          <img src={logoImage} alt="Logo" />
        </Link>

        <div className="nb-mobile-right">
          <button className="nb-icon-btn" onClick={() => setShowSearch(v => !v)} title="Search">
            <FiSearch size={20} />
          </button>
          <Link to="/cart" className="nb-icon-btn" title="Cart">
            <FiShoppingBag size={20} />
            {cartCount > 0 && <span className="nb-badge">{cartCount}</span>}
          </Link>
        </div>

        {showSearch && (
          <div className="nb-search-overlay" style={{ padding: '0.75rem 1rem' }}>
            <form className="nb-search-form" onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search products…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <button type="submit" aria-label="Search"><FiSearch size={15} /></button>
            </form>
          </div>
        )}
      </div>

      {/* ════════════════════════════════
          MOBILE BOTTOM BAR
      ════════════════════════════════ */}
      <div className="nb-bottom-bar">
        <div className="nb-bottom-bar-inner">
          <Link to="/catalog" className={`nb-bottom-tab${isActive('/catalog') ? ' active' : ''}`}>
            <FiShoppingBag size={20} />
            Shop
          </Link>
          <Link to="/wishlist" className={`nb-bottom-tab${isActive('/wishlist') ? ' active' : ''}`}>
            <FiHeart size={20} />
            Wishlist
          </Link>
          <Link to="/cart" className={`nb-bottom-tab${isActive('/cart') ? ' active' : ''}`}>
            <FiShoppingBag size={20} />
            {cartCount > 0 && <span className="nb-bottom-tab-badge">{cartCount}</span>}
            Cart
          </Link>
          <Link
            to={isLoggedIn ? '/account' : '/login'}
            className={`nb-bottom-tab${isActive('/account') || isActive('/login') ? ' active' : ''}`}
          >
            <FiUser size={20} />
            Account
          </Link>
          <button className="nb-bottom-tab" onClick={() => setShowSearch(v => !v)}>
            <FiSearch size={20} />
            Search
          </button>
        </div>
      </div>

      {/* ════════════════════════════════
          SIDEBAR (mobile)
      ════════════════════════════════ */}
      {showSidebar && (
        <>
          <div className="nb-overlay" onClick={() => setShowSidebar(false)} />
          <div className="nb-sidebar">

            <div className="nb-sidebar-tabs">
              <button
                className={`nb-sidebar-tab-btn${sidebarTab === 'menu' ? ' active' : ''}`}
                onClick={() => setSidebarTab('menu')}
              >
                Menu
              </button>
              <button
                className={`nb-sidebar-tab-btn${sidebarTab === 'categories' ? ' active' : ''}`}
                onClick={() => setSidebarTab('categories')}
              >
                Categories
              </button>
              <button className="nb-sidebar-close" onClick={() => setShowSidebar(false)}>
                <FiX size={20} />
              </button>
            </div>

            <div className="nb-sidebar-body">

              {/* ── MENU TAB ── */}
              {sidebarTab === 'menu' && (
                <>
                  {allNavLinks.map(link => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`nb-sidebar-row${isActive(link.path) ? ' active' : ''}`}
                      onClick={() => setShowSidebar(false)}
                    >
                      {link.name}
                    </Link>
                  ))}
                  <Link
                    to="/wishlist"
                    className={`nb-sidebar-row${isActive('/wishlist') ? ' active' : ''}`}
                    onClick={() => setShowSidebar(false)}
                  >
                    <FiHeart size={15} style={{ color: '#888', marginRight: 2 }} />
                    Wishlist
                  </Link>
                  <button
                    className="nb-sidebar-row"
                    onClick={() => { setShowSidebar(false); setShowSearch(true); }}
                  >
                    <FiSearch size={15} style={{ color: '#888', marginRight: 2 }} />
                    Search
                  </button>
                </>
              )}

              {/* ── CATEGORIES TAB ── */}
              {sidebarTab === 'categories' && (
                <>
                  <button
                    className="nb-sidebar-cat-row"
                    onClick={() => { navigate('/category'); setShowSidebar(false); }}
                  >
                    All Categories
                  </button>
                  {categories.length > 0 ? (
                    categories.map(cat => (
                      <div key={cat._id || cat.name}>
                        <button
                          className="nb-sidebar-cat-row"
                          onClick={() => {
                            if (cat.subcategories?.length) {
                              toggleCat(cat._id || cat.name);
                            } else {
                              navigate(`/category/${getCategorySlug(cat.name)}`);
                              setShowSidebar(false);
                            }
                          }}
                        >
                          {cat.name}
                          {cat.subcategories?.length > 0 && (
                            <span className="nb-sidebar-row-icon">
                              {expandedCats[cat._id || cat.name]
                                ? <FiMinus size={14} />
                                : <FiPlus size={14} />}
                            </span>
                          )}
                        </button>
                        {cat.subcategories?.length > 0 && expandedCats[cat._id || cat.name] && (
                          <div className="nb-sidebar-cat-sub">
                            {cat.subcategories.map(sub => (
                              <button
                                key={sub._id || sub.name}
                                className="nb-sidebar-cat-sub-row"
                                onClick={() => {
                                  navigate(`/category/${getCategorySlug(sub.name)}`);
                                  setShowSidebar(false);
                                }}
                              >
                                {sub.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="nb-sidebar-cat-row" style={{ color: '#999', fontStyle: 'italic', cursor: 'default' }}>
                      No categories found
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="nb-sidebar-footer">
              <div className="nb-sidebar-footer-label">Need help?</div>
              <a href={`tel:${process.env.REACT_APP_WHATSAPP_ADMIN_NUMBER}`} className="nb-sidebar-footer-contact-item">
                <FiPhone size={13} /> {process.env.REACT_APP_WHATSAPP_ADMIN_NUMBER}
              </a>
              <a href="mailto:info@graceware.shop" className="nb-sidebar-footer-contact-item">
                <FiMail size={13} /> info@graceware.shop
              </a>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;