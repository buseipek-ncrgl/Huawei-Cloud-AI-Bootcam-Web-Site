const express = require("express");
const router = express.Router();
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcryptjs = require('bcryptjs'); // Add this import
const User = require("../models/User"); // Add this import - adjust path as needed
const { registerUser, loginUser } = require("../controllers/authController");
const authenticate = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);

// Profile endpoint
router.get("/profile", authenticate, (req, res) => {
  console.log("📋 Profile route çalıştı");
  console.log("User bilgileri:", req.user);
  
  res.json({
    fullName: req.user.fullName,
    email: req.user.email,
    role: req.user.role,
  });
});

// Forgot password route
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Validate email input
    if (!email) {
      return res.status(400).json({ error: 'E-posta adresi gereklidir' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: 'E-posta bulunamadı' });
    }

    // Token oluştur ve süre ver (örneğin 1 saat)
    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 saat
    await user.save();

    // Check if email credentials are set
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Email credentials not set in environment variables');
      return res.status(500).json({ error: 'E-posta servisi yapılandırılmamış' });
    }

    // Mail gönder (örn: Gmail SMTP kullanarak)
    const transporter = nodemailer.createTransporter({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
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
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Şifre sıfırlama işlemi sırasında bir hata oluştu' });
  }
});

// Reset password route
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    // Validate inputs
    if (!newPassword) {
      return res.status(400).json({ error: 'Yeni şifre gereklidir' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Şifre en az 6 karakter olmalıdır' });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Token geçersiz veya süresi dolmuş' });
    }

    // Hash the new password
    user.password = await bcryptjs.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
    res.json({ message: 'Şifreniz başarıyla güncellendi.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Şifre güncelleme sırasında bir hata oluştu' });
  }
});

module.exports = router;