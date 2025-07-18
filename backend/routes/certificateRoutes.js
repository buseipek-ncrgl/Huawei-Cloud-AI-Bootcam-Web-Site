// routes/certificateRoutes.js
const express = require("express");
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const Certificate = require("../models/Certificate");

// 🎯 Katılımcının kendi sertifikasını alması
router.get("/my-certificate", authenticate, async (req, res) => {
  try {
    const cert = await Certificate.findOne({ userId: req.user.id });

    if (!cert) {
      return res.status(404).json({ error: "Sertifika bulunamadı" });
    }

    res.json({ url: cert.url });
  } catch (err) {
    console.error("❌ Sertifika alınamadı:", err);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

// 🎓 Eğitmenin sertifika yüklemesi
router.post("/", authenticate, async (req, res) => {
  if (req.user.role !== "instructor") {
    return res.status(403).json({ error: "Yetkisiz erişim" });
  }

  const { userId, url } = req.body;
  if (!userId || !url) return res.status(400).json({ error: "Eksik veri" });

  try {
    const cert = await Certificate.findOneAndUpdate(
      { userId },
      { url, uploadedAt: new Date() },
      { upsert: true, new: true }
    );
    res.json({ success: true, data: cert });
  } catch (err) {
    console.error("Sertifika yükleme hatası:", err);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

// 🎓 Eğitmen tüm sertifikaları görür
router.get("/", authenticate, async (req, res) => {
  if (req.user.role !== "instructor") {
    return res.status(403).json({ error: "Yetkisiz erişim" });
  }

  const certs = await Certificate.find().populate("userId", "fullName email");
  res.json(certs);
});

// 🎓 Eğitmen sertifikayı siler
router.delete("/:id", authenticate, async (req, res) => {
  if (req.user.role !== "instructor") {
    return res.status(403).json({ error: "Yetkisiz erişim" });
  }

  try {
    await Certificate.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Sertifika silindi" });
  } catch (err) {
    console.error("Silme hatası ❌", err);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

module.exports = router;
