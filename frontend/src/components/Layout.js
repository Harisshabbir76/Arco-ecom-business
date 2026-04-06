// src/components/Layout.js
import React from 'react';
import Navbar from './Navbar';
import { useLocation } from 'react-router-dom';
import Footer from './Footer';
const Layout = ({ children }) => {
  const location = useLocation();
  const hideNavbarPaths = ['/login', '/signup'];
  const shouldHideNavbar = hideNavbarPaths.includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col">
      {!shouldHideNavbar && <Navbar />}
      <main className="flex-grow">{children}</main>
      {!shouldHideNavbar && <Footer />}
    </div>
  );
};

export default Layout;