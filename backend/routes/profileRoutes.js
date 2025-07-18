const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authenticate = require("../middleware/authMiddleware");

// PUT /api/profile
router.put("/", authenticate, async (req, res) => {
  const { fullName, email } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { ...(fullName && { fullName }), ...(email && { email }) },
      { new: true }
    );
    res.json({ success: true, user });
  } catch (err) {
    console.error("❌ Profil güncelleme hatası:", err);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

module.exports = router;
