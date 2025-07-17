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
router.post("/", authenticate, async (req, res) => {
  if (req.user.role !== "instructor") {
    return res.status(403).json({ error: "Yetkisiz erişim" });
  }

  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: "Başlık ve içerik zorunludur" });
  }

  try {
    const newAnnouncement = new Announcement({
      title,
      content
    });

    await newAnnouncement.save();
    res.status(201).json({ message: "Duyuru eklendi", announcement: newAnnouncement });
  } catch (err) {
    console.error("❌ Duyuru ekleme hatası:", err);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});


// Delete an announcement
router.delete('/:id', authenticate, async (req, res) => {
  if (req.user.role !== 'instructor') return res.status(403).json({ error: 'Yetkisiz' });

  await Announcement.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;
