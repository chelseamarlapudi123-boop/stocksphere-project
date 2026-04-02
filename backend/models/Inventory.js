import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  branchId: { type: String, required: true },
  quantity: { type: Number, default: 0 },
  reorderPoint: { type: Number, default: 10 },
  lastRestock: { type: Date, default: Date.now }
});

export default mongoose.model('Inventory', inventorySchema);
