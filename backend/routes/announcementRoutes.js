const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const Announcement = require('../models/announcement');

// Get all announcements
router.get('/', authenticate, async (req, res) => {
  const announcements = await Announcement.find().sort({ createdAt: -1 });
  res.json(announcements);
});

// Create a new announcement
router.post('/', authenticate, async (req, res) => {
  if (req.user.role !== 'instructor') return res.status(403).json({ error: 'Yetkisiz' });

  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'İçerik boş olamaz' });

  const newAnnouncement = new Announcement({ content });
  await newAnnouncement.save();
  res.json({ success: true });
});

// Delete an announcement
router.delete('/:id', authenticate, async (req, res) => {
  if (req.user.role !== 'instructor') return res.status(403).json({ error: 'Yetkisiz' });

  await Announcement.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;
