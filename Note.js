import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  subject: { type: String, required: true },
  filePath: { type: String },
  fileName: { type: String },
}, { timestamps: true });

export default mongoose.model('Note', noteSchema);
