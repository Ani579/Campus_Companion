import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  attendedClasses: { type: Number, required: true, default: 0 },
  totalClasses: { type: Number, required: true, default: 0 },
}, { timestamps: true });

export default mongoose.model('Attendance', attendanceSchema);
