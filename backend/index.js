import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

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
import branchesRoute from './routes/branches.js';

dotenv.config();

const app = express();
const PORT = 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nexusstock';

const allowedOrigins = new Set([
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
]);

const corsOptions = {
  origin(origin, callback) {
    // Allow localhost frontends and non-browser requests (no Origin header).
    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, true);
    }
    return callback(new Error('CORS blocked: only localhost origins are allowed.'));
  }
};

app.use(cors(corsOptions));
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

app.use('/api/reports', reportsRoute);
app.use('/api/users', usersRoute);
app.use('/api/auth', authRoute);
app.use('/api/products', productsRoute);
app.use('/api/inventory', inventoryRoute);
app.use('/api/sales', salesRoute);
app.use('/api/branches', branchesRoute);

app.get('/', (req, res) => {
  res.type('text/plain; charset=utf-8').send('StockSphere API is running...');
});

mongoose.connect(MONGO_URI, { dbName: 'nexusstock' })
  .then(() => {
    console.log('Connected to local MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

