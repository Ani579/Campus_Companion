import express from 'express';
import multer from 'multer';
import User from './User.js';
import Note from './Note.js';
import Task from './Task.js';
import Attendance from './AttendanceModel.js';
import { protect } from './authMiddleware.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination(req, file, cb) { cb(null, 'uploads/'); },
  filename(req, file, cb) { cb(null, `profile-${Date.now()}-${file.originalname}`); }
});
const upload = multer({ storage });

router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const totalNotes = await Note.countDocuments({ userId: req.user._id });
    const completedTasks = await Task.countDocuments({ userId: req.user._id, status: 'completed' });
    const attendances = await Attendance.find({ userId: req.user._id });

    let totalClasses = 0;
    let attendedClasses = 0;
    attendances.forEach((a) => {
      totalClasses += a.totalClasses || 0;
      attendedClasses += a.attendedClasses || 0;
    });

    const attendancePercent = totalClasses === 0 ? 0 : Math.round((attendedClasses / totalClasses) * 100);

    res.json({
      user,
      stats: {
        totalNotes,
        completedTasks,
        attendancePercent,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/profile', protect, upload.single('profileImage'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = req.body.name || user.name;
    user.college = req.body.college || user.college;
    user.branch = req.body.branch || user.branch;
    user.year = req.body.year || user.year;

    if (req.file) {
      user.profileImage = `/uploads/${req.file.filename}`;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      profileImage: updatedUser.profileImage,
      college: updatedUser.college,
      branch: updatedUser.branch,
      year: updatedUser.year,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
