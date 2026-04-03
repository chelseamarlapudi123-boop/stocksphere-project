import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';

dotenv.config();

const parseNumericPrice = (raw) => {
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  if (typeof raw !== 'string') return null;

  const cleaned = raw.replace(/[^0-9.-]/g, '').trim();
  if (!cleaned) return null;

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeProductPrices = async () => {
  const cursor = Product.find({}).cursor();
  let updated = 0;
  let skipped = 0;

  for await (const product of cursor) {
    const normalized = parseNumericPrice(product.price);

    if (normalized === null) {
      skipped += 1;
      continue;
    }

    if (product.price !== normalized) {
      product.price = normalized;
      await product.save();
      updated += 1;
    }
  }

  return { updated, skipped };
};

const run = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || 'mongodb://localhost:27017/nexusstock',
      { dbName: 'nexusstock' }
    );

    const result = await normalizeProductPrices();
    console.log(`Normalization complete. Updated: ${result.updated}, Skipped: ${result.skipped}`);
  } catch (error) {
    console.error('Normalization failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

run();

