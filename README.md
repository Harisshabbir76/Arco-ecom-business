# Zedify - Premium MERN E-commerce Platform

[![MERN Stack](https://img.shields.io/badge/MERN-Stack-blue.svg)](https://mongodb.com)
[![Stripe Integration](https://img.shields.io/badge/Payments-Stripe-purple.svg)](https://stripe.com)
[![Cloudinary](https://img.shields.io/badge/Images-Cloudinary-orange.svg)](https://cloudinary.com)

A sophisticated, full-stack e-commerce solution built with the MERN stack. Zedify offers a premium shopping experience with modular product variants, promotional bundles, and a robust management dashboard.

---

## ✨ Features

### 🛍️ Shopping Experience
- **Advanced Product Variants**: Support for sizes and colors with real-time selection and visual feedback.
- **Dynamic Bundles**: Specialized bundle offers with "Active Now" toggles for instant visibility.
- **Premium UI/UX**: vibrant gradients, micro-animations, and high-contrast call-to-action buttons.
- **Responsive Design**: Flawess experience across mobile, tablet, and desktop.
- **Smart Search**: Fast, relevant product search results.
- **WhatsApp Integration**: Direct ordering/inquiry support via WhatsApp with auto-formatted product details.

### 💳 Checkout & Payments
- **Secure Payments**: Integrated Stripe payment gateway for seamless card transactions.
- **Cash on Delivery (COD)**: Flexible payment options for various customer preferences.
- **Discount System**: Robust coupon code support with real-time total calculation.
- **Order Tracking**: Comprehensive success pages and email-ready order summaries.

### 🛡️ Admin Dashboard
- **Product Management**: Quick add/edit flow with optional pricing and descriptions.
- **Order Management**: Real-time order tracking with detailed variant views (size, color).
- **Hero Slider Management**: Update homepage banners directly from the dashboard.
- **Category System**: Dynamic category creation and layout management.
- **Shipping Settings**: Global control over delivery costs and minimum order thresholds.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React, React-Bootstrap, React-Icons, Axios, CSS3 (Premium Animations) |
| **Backend** | Node.js, Express.js, JWT Authentication |
| **Database** | MongoDB, Mongoose ODM |
| **Media** | Cloudinary (Image Processing & CDN) |
| **Payments** | Stripe API |

---

## 📦 Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/Harisshabbir76/zedify_web.git
cd zedify_web
```

### 2. Backend Configuration
1. Navigate to the backend directory:
   ```bash
   cd backend
   npm install
   ```
2. Create a `.env` file from the template:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   STRIPE_SECRET_KEY=your_stripe_secret
   STRIPE_WEBHOOK_SECRET=your_webhook_secret
   ```
3. Run the server:
   ```bash
   npm start
   ```

### 3. Frontend Configuration
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   npm install
   ```
2. Create a `.env` file:
   ```env
   REACT_APP_API_URL=http://localhost:5000
   REACT_APP_STRIPE_PUBLIC_KEY=your_stripe_public_key
   ```
3. Launch the application:
   ```bash
   npm start
   ```

---



1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
