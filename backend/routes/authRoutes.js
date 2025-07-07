const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bcryptjs = require("bcryptjs");
const User = require("../models/User");
const { registerUser, loginUser } = require("../controllers/authController");
const authenticate = require("../middleware/authMiddleware");

// Kayıt ve giriş
router.post("/register", registerUser);
router.post("/login", loginUser);

// Profil bilgisi
router.get("/profile", authenticate, (req, res) => {
  res.json({
    fullName: req.user.fullName,
    email: req.user.email,
    role: req.user.role,
  });
});

// Şifremi unuttum
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "E-posta adresi gereklidir" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "E-posta bulunamadı" });
    }

    // Token ve süre
    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 saat
    await user.save();

    // .env'den gerekli değerler kontrol
    if (!process.env.SENDGRID_API_KEY || !process.env.EMAIL_USER) {
      return res.status(500).json({ error: "E-posta servisi yapılandırılmamış" });
    }

    // SendGrid ile mail gönder
    const transporter = nodemailer.createTransport({
      service: "SendGrid",
      auth: {
        user: "apikey", // sabit
        pass: process.env.SENDGRID_API_KEY,
      },
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    await transporter.sendMail({
      to: user.email,
      from: process.env.EMAIL_USER, // örn: noreply@bootcamp.com
      subject: "Şifre Sıfırlama Bağlantısı",
      html: `
        <p>Merhaba ${user.fullName},</p>
        <p>Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p>Bu bağlantı 1 saat içinde geçerliliğini yitirecektir.</p>
      `,
    });

    res.json({ message: "Şifre sıfırlama bağlantısı gönderildi." });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Şifre sıfırlama işlemi sırasında hata oluştu" });
  }
});

// Şifre sıfırlama
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: "Şifre en az 6 karakter olmalıdır" });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: "Token geçersiz veya süresi dolmuş" });
    }

    // Yeni şifreyi hashle
    user.password = await bcryptjs.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Şifreniz başarıyla güncellendi." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Şifre güncelleme sırasında hata oluştu" });
  }
});

module.exports = router;
