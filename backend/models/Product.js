import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  unit: { type: String, default: 'pcs' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Product', productSchema);
