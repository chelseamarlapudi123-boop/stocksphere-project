import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// 🔥 Global error handlers (to catch crashes in Render logs)
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err);
});

import reportsRoute from './routes/reports.js';
import usersRoute from './routes/users.js';
import authRoute from './routes/auth.js';
import productsRoute from './routes/products.js';
import inventoryRoute from './routes/inventory.js';
import salesRoute from './routes/sales.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/reports', reportsRoute);
app.use('/api/users', usersRoute);
app.use('/api/auth', authRoute);
app.use('/api/products', productsRoute);
app.use('/api/inventory', inventoryRoute);
app.use('/api/sales', salesRoute);

// Health route (VERY important for Render)
app.get('/', (req, res) => {
  res.send('StockSphere API is running...');
});

// ✅ Connect DB FIRST, then start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');

    // 🔥 IMPORTANT: bind to 0.0.0.0 for Render
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);

    // ❌ Do NOT crash immediately (for debugging)
    // process.exit(1);

    // Instead still start server to debug
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`⚠️ Server running WITHOUT DB on port ${PORT}`);
    });
  });