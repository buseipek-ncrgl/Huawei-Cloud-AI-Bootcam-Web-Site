const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/authController");
const authenticate = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);

// Profile endpoint'i
router.get("/profile", authenticate, (req, res) => {
  console.log("📋 Profile route çalıştı");
  console.log("User bilgileri:", req.user);
  
  res.json({
    fullName: req.user.fullName,
    email: req.user.email,
    role: req.user.role,
  });
});
// routes/authRoutes.js
const crypto = require('crypto');
const nodemailer = require('nodemailer');

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(400).json({ error: 'E-posta bulunamadı' });

  // Token oluştur ve süre ver (örneğin 1 saat)
  const token = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 saat
  await user.save();

  // Mail gönder (örn: Gmail SMTP kullanarak)
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER, // .env'de tanımlı
      pass: process.env.EMAIL_PASS
    }
  });

  const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

  await transporter.sendMail({
    to: user.email,
    subject: 'Şifre Sıfırlama Bağlantısı',
    html: `<p>Şifrenizi sıfırlamak için <a href="${resetLink}">buraya tıklayın</a>.</p>`
  });

  res.json({ message: 'Şifre sıfırlama bağlantısı gönderildi.' });
});
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({ error: 'Token geçersiz veya süresi dolmuş' });
  }

  const bcrypt = require('bcryptjs'); // Eğer üstte tanımlı değilse burada ekle
  user.password = await bcrypt.hash(newPassword, 10); // 👈 Şifreyi güvenli olarak hash'le
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();
  res.json({ message: 'Şifreniz başarıyla güncellendi.' });
});
module.exports = router;