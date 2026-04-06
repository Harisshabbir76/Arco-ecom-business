
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "./components/Layout";
import { Toaster } from "react-hot-toast";

// Import your pages
import Home from "./pages/Home";
import Login from "./pages/login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard/index";
import Addproduct from "./pages/Dashboard/add-product/app";
import Catalog from "./pages/catalog";
import Category from "./pages/category/index";
import CategoryProducts from "./pages/category/[categoryName]/app";
import ProductName from "./pages/[productName]/index";
import ContactUs from "./pages/contact-us";
import AboutUs from "./components/About-us";
import NewArrival from './components/new-arrival';
import SearchResultsPage from './components/SearchResults';
import Cart from './components/Cart';
import Checkout from './components/CheckoutPage';
import NotFoundPage from './components/404';
import Logout from './components/Logout';
import OrderManagement from "./components/OrderManagement";
import DashboardContactUs from './components/contact-us';
import DashboardCatalog from './components/dashboardCatalog';
import ForgotPassword from './pages/ForgotPassword';
import ShippingSettings from './pages/Dashboard/ShippingSettings';
import CategoryManagement from "./pages/Dashboard/CategoryManagement";
import HeroManagement from "./pages/Dashboard/HeroManagement";
import DiscountManagement from "./pages/Dashboard/DiscountManagement";
import BundleManagement from "./pages/Dashboard/BundleManagement";
import BundlesPage from "./pages/Bundles";
import FAQManagement from "./pages/Dashboard/FAQManagement";
import BannaerManagement from './pages/Dashboard/Bannermanagement'

const ADMIN_EMAIL = '05harisshabbir@gmail.com';

// AdminRoute - protects dashboard sub-pages, redirects non-admin to /404
function AdminRoute({ children }) {
  const [status, setStatus] = useState('loading'); // 'loading' | 'allowed' | 'denied'

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) { setStatus('denied'); return; }
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.user?.email?.toLowerCase() === ADMIN_EMAIL) {
          setStatus('allowed');
        } else {
          setStatus('denied');
        }
      } catch {
        localStorage.removeItem('token');
        setStatus('denied');
      }
    };
    checkAuth();
  }, []);

  if (status === 'loading') return null;
  if (status === 'denied') return <Navigate to="/404" replace />;
  return children;
}

// ScrollToTop component - scrolls to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// DynamicTitle component - updates document title based on current route
function DynamicTitle() {
  const { pathname } = useLocation();

  useEffect(() => {
    const getTitle = () => {
      // Base title
      const base = "Zedify";
      
      // Exact matches
      if (pathname === "/") return base;
      if (pathname === "/login") return `Login | ${base}`;
      if (pathname === "/signup") return `Signup | ${base}`;
      if (pathname === "/cart") return `Your Cart | ${base}`;
      if (pathname === "/checkout") return `Checkout | ${base}`;
      if (pathname === "/catalog") return `Product Catalog | ${base}`;
      if (pathname === "/category") return `Categories | ${base}`;
      if (pathname === "/about-us") return `About Us | ${base}`;
      if (pathname === "/contact-us") return `Contact Us | ${base}`;
      if (pathname === "/new-arrivals") return `New Arrivals | ${base}`;
      if (pathname === "/search") return `Search Results | ${base}`;
      if (pathname === "/bundles") return `Exclusive Bundles | ${base}`;
      if (pathname === "/forgot-password") return `Reset Password | ${base}`;

      // Pattern matches
      if (pathname.startsWith("/dashboard")) {
        const subPage = pathname.split("/").pop();
        if (subPage === "dashboard") return `Admin Dashboard | ${base}`;
        const formattedSub = subPage.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
        return `${formattedSub} | Admin | ${base}`;
      }

      if (pathname.startsWith("/category/")) {
        const catName = pathname.split("/")[2];
        const formattedCat = decodeURIComponent(catName).split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
        return `${formattedCat} | ${base}`;
      }

      if (pathname.includes("/catalog/")) {
        // Try to get product name from URL if possible, or just default to Product
        return `Product Details | ${base}`;
      }

      if (pathname === "/404") return `Page Not Found | ${base}`;

      return base;
    };

    document.title = getTitle();
  }, [pathname]);

  return null;
}

function App() {


  return (
    <>
      <ScrollToTop />
      <DynamicTitle />
      <Toaster position="top-center" />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/add-product" element={<AdminRoute><Addproduct /></AdminRoute>} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/catalog/:id" element={<ProductName />} />
          <Route path="/category" element={<Category />} />
          <Route path="/category/:categoryName" element={<CategoryProducts />} />
          <Route path="/category/:categoryName/:id" element={<ProductName />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/new-arrivals" element={<NewArrival />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/dashboard/order-management" element={<AdminRoute><OrderManagement /></AdminRoute>} />
          <Route path="/dashboard/contactus" element={<AdminRoute><DashboardContactUs /></AdminRoute>} />
          <Route path="/dashboard/catalog" element={<AdminRoute><DashboardCatalog /></AdminRoute>} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/dashboard/shipping" element={<AdminRoute><ShippingSettings /></AdminRoute>} />
          <Route path="/dashboard/categories" element={<AdminRoute><CategoryManagement /></AdminRoute>} />
          <Route path="/dashboard/hero" element={<AdminRoute><HeroManagement /></AdminRoute>} />
          <Route path="/dashboard/discounts" element={<AdminRoute><DiscountManagement /></AdminRoute>} />
          <Route path="/dashboard/bundles" element={<AdminRoute><BundleManagement /></AdminRoute>} />
          <Route path="/dashboard/faqs" element={<AdminRoute><FAQManagement /></AdminRoute>} />
          <Route path="/dashboard/banners" element={<AdminRoute><BannaerManagement /></AdminRoute>} />
          <Route path="/bundles" element={<BundlesPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Layout>
    </>
  );
}

export default App;
