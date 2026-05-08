require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();

// Trust proxy (مطلوب على Railway)
app.set('trust proxy', 1);

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use('/api/', limiter);

// Middleware
app.use(cors());
app.use(express.json());

// Static - uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Static - public
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
const MONGODB_URI = process.env.MONGODB_URI;
console.log('🔄 MONGODB_URI exists:', !!MONGODB_URI);

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not set! Demo mode only.');
  startServer();
} else {
  mongoose.connect(MONGODB_URI)
    .then(() => {
      console.log('✅ Connected to MongoDB successfully!');
      startServer();
    })
    .catch(err => {
      console.error('❌ MongoDB failed:', err.message);
      startServer();
    });
}

function startServer() {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log('🌸 RORO HAND MED started on port ' + PORT);
    console.log('👑 Admin Panel ready');
    console.log('🗄️  DB state: ' + mongoose.connection.readyState);
  });
}

module.exports = app;
