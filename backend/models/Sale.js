import mongoose from 'mongoose';

const saleSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  branchId: { type: String, required: true },
  quantity: { type: Number, required: true },
  revenue: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

export default mongoose.model('Sale', saleSchema);
