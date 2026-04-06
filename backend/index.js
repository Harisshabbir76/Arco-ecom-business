const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

// Import routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const bundleRoutes = require('./routes/bundleRoutes');
const orderRoutes = require('./routes/orderRoutes');
const contactRoutes = require('./routes/contactRoutes');
const faqRoutes = require('./routes/faqRoutes');
const discountRoutes = require('./routes/discountRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const heroRoutes = require('./routes/heroRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const whatsappRoutes = require('./routes/whatsappRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();
const PORT = process.env.PORT || 5002;

// Memory monitoring
setInterval(() => {
  const used = process.memoryUsage().heapUsed / 1024 / 1024;
  console.log(`Memory usage: ${Math.round(used * 100) / 100} MB`);
}, 10000);

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Stripe Webhook - raw body parser (must be before express.json)
// This is required for Stripe webhook signature verification
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));

// File uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.json());

const corsOptions = {
  origin: ['http://localhost:3000',  
            'https://zedify-web.vercel.app',
            'https://www.zedify.store'
    
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Use routes
app.use(authRoutes);
app.use(productRoutes);
app.use(categoryRoutes);
app.use(bundleRoutes);
app.use(orderRoutes);
app.use(contactRoutes);
app.use(faqRoutes);
app.use(discountRoutes);
app.use(reviewRoutes);
app.use(heroRoutes);
app.use(settingsRoutes);
app.use(whatsappRoutes);
app.use(paymentRoutes);

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected!');
});

// Error handlers
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the E-Commerce API 🚀');
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    dbState: mongoose.connection.readyState,
    timestamp: new Date()
  });
});

const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});
