const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const db = require('./config/db');

const app = express();
const PORT = process.env.PORT || 9000;

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Serve static frontend (e.g., index.html in public/)
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Test MySQL DB Connection
db.query('SELECT 1')
  .then(() => console.log('✅ MySQL Connected!'))
  .catch((err) => console.error('❌ DB connection failed:', err));

// ✅ Route Imports
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');

// ✅ Route Mounting
app.use('/api/auth', authRoutes);         // Register/Login
app.use('/api/products', productRoutes);  // Product listing, search
app.use('/api/cart', cartRoutes);         // Add, update, remove from cart
app.use('/api/orders', orderRoutes);      // Create orders

// ✅ Serve index.html on root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
