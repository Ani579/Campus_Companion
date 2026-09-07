import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, sparse: true },
  password: { type: String, required: true },
  resetOtpHash: { type: String },
  resetOtpExpires: { type: Date },
  resetOtpAttempts: { type: Number, default: 0 },
  college: { type: String },
  branch: { type: String },
  year: { type: String },
  profileImage: { type: String },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
