import mongoose from 'mongoose';

const branchSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  location: { type: String, required: true },
  manager: { type: String, default: 'Unassigned' },
  health: { type: String, enum: ['good', 'warning', 'critical'], default: 'good' },
}, { timestamps: true });

export default mongoose.model('Branch', branchSchema);

