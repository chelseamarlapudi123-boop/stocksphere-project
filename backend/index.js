import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

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

// Routes
app.use('/api/reports', reportsRoute);
app.use('/api/users', usersRoute);
app.use('/api/auth', authRoute);
app.use('/api/products', productsRoute);
app.use('/api/inventory', inventoryRoute);
app.use('/api/sales', salesRoute);

app.get('/', (req, res) => {
  res.send('StockSphere API is running...');
});

// ✅ Connect to MongoDB + Start Server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });