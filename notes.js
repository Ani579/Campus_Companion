import express from 'express';
import multer from 'multer';
import path from 'path';
import Note from './Note.js';
import { protect } from './authMiddleware.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination(req, file, cb) { cb(null, 'uploads/'); },
  filename(req, file, cb) { cb(null, `${Date.now()}-${file.originalname}`); }
});
const upload = multer({ storage });

router.route('/')
  .get(protect, async (req, res) => {
    try {
      const notes = await Note.find({ userId: req.user._id }).sort({ createdAt: -1 });
      res.json(notes);
    } catch (err) { res.status(500).json({ message: err.message }); }
  })
  .post(protect, upload.single('file'), async (req, res) => {
    try {
      const { title, description, subject } = req.body;
      const fileData = req.file ? {
        filePath: `/uploads/${req.file.filename}`,
        fileName: req.file.originalname
      } : {};
      
      const note = await Note.create({ 
        userId: req.user._id, title, description, subject, ...fileData 
      });
      res.status(201).json(note);
    } catch (err) { res.status(500).json({ message: err.message }); }
  });

router.route('/:id')
  .put(protect, async (req, res) => {
    try {
      const note = await Note.findById(req.params.id);
      if (!note || note.userId.toString() !== req.user._id.toString()) return res.status(404).json({ message: 'Note not found' });
      note.title = req.body.title || note.title;
      note.description = req.body.description || note.description;
      note.subject = req.body.subject || note.subject;
      const updatedNote = await note.save();
      res.json(updatedNote);
    } catch (err) { res.status(500).json({ message: err.message }); }
  })
  .delete(protect, async (req, res) => {
    try {
      const note = await Note.findById(req.params.id);
      if (!note || note.userId.toString() !== req.user._id.toString()) return res.status(404).json({ message: 'Note not found' });
      await note.deleteOne();
      res.json({ message: 'Note removed' });
    } catch (err) { res.status(500).json({ message: err.message }); }
  });

export default router;
