import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'manager'], required: true },
  branchId: { type: String }, // Primary branch linkage used in this app (maps to Branch.id)
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' }, // Optional ObjectId linkage
  branchName: { type: String }, // Optional fallback linkage by branch name
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

export default mongoose.model('User', userSchema);
