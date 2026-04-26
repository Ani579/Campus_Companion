import express from 'express';
import Task from './Task.js';
import { protect } from './authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, async (req, res) => {
    try {
      const tasks = await Task.find({ userId: req.user._id }).sort({ deadline: 1 });
      res.json(tasks);
    } catch (err) { res.status(500).json({ message: err.message }); }
  })
  .post(protect, async (req, res) => {
    try {
      const { title, subject, deadline } = req.body;
      const task = await Task.create({ userId: req.user._id, title, subject, deadline });
      res.status(201).json(task);
    } catch (err) { res.status(500).json({ message: err.message }); }
  });

router.route('/:id')
  .put(protect, async (req, res) => {
    try {
      const task = await Task.findById(req.params.id);
      if (!task || task.userId.toString() !== req.user._id.toString()) return res.status(404).json({ message: 'Task not found' });
      task.title = req.body.title || task.title;
      task.subject = req.body.subject || task.subject;
      task.deadline = req.body.deadline || task.deadline;
      task.status = req.body.status || task.status;
      const updatedTask = await task.save();
      res.json(updatedTask);
    } catch (err) { res.status(500).json({ message: err.message }); }
  })
  .delete(protect, async (req, res) => {
    try {
      const task = await Task.findById(req.params.id);
      if (!task || task.userId.toString() !== req.user._id.toString()) return res.status(404).json({ message: 'Task not found' });
      await task.deleteOne();
      res.json({ message: 'Task removed' });
    } catch (err) { res.status(500).json({ message: err.message }); }
  });

export default router;
