require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use('/api/', limiter);

// Middleware
app.use(cors());
app.use(express.json());

// Static - uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Static - public (الموقع والأدمن)
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/orders', require('./routes/orders'));

// Admin panel
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Catch all
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Connect MongoDB then listen
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    startServer();
  })
  .catch(err => {
    console.error('❌ MongoDB error:', err.message);
    console.log('⚡ Starting without DB (demo mode)...');
    startServer();
  });

function startServer() {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🌸 RORO HAND MED → http://localhost:${PORT}`);
    console.log(`👑 Admin Panel  → http://localhost:${PORT}/admin`);
  });
}

module.exports = app;
