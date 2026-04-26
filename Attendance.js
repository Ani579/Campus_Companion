import express from 'express';
import Attendance from './Attendance.js';
import { protect } from './authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, async (req, res) => {
    try {
      const attendance = await Attendance.find({ userId: req.user._id });
      res.json(attendance);
    } catch (err) { res.status(500).json({ message: err.message }); }
  })
  .post(protect, async (req, res) => {
    try {
      const { subject, attendedClasses, totalClasses } = req.body;
      const attendance = await Attendance.create({ userId: req.user._id, subject, attendedClasses, totalClasses });
      res.status(201).json(attendance);
    } catch (err) { res.status(500).json({ message: err.message }); }
  });

router.route('/:id')
  .put(protect, async (req, res) => {
    try {
      const attendance = await Attendance.findById(req.params.id);
      if (!attendance || attendance.userId.toString() !== req.user._id.toString()) return res.status(404).json({ message: 'Attendance not found' });
      attendance.subject = req.body.subject || attendance.subject;
      attendance.attendedClasses = req.body.attendedClasses !== undefined ? req.body.attendedClasses : attendance.attendedClasses;
      attendance.totalClasses = req.body.totalClasses !== undefined ? req.body.totalClasses : attendance.totalClasses;
      const updatedAttendance = await attendance.save();
      res.json(updatedAttendance);
    } catch (err) { res.status(500).json({ message: err.message }); }
  })
  .delete(protect, async (req, res) => {
    try {
      const attendance = await Attendance.findById(req.params.id);
      if (!attendance || attendance.userId.toString() !== req.user._id.toString()) return res.status(404).json({ message: 'Attendance not found' });
      await attendance.deleteOne();
      res.json({ message: 'Attendance removed' });
    } catch (err) { res.status(500).json({ message: err.message }); }
  });

export default router;
