const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ✅ Kayıt işlemi
exports.registerUser = async (req, res) => {
  try {
    const { fullName, email, phone, password, role } = req.body;

    // Daha önce kayıtlı mı kontrol et
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Bu e-posta zaten kayıtlı" });
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    // Yeni kullanıcıyı oluştur
    const newUser = await User.create({
      fullName,
      email,
      phone,
      password: hashedPassword,
      role: "participant"
    });

    res.status(201).json({ message: "Kayıt başarılı" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Kayıt sırasında bir hata oluştu" });
  }
};

// ✅ Giriş işlemi
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body; // ✅ role kaldırıldı

    // Kullanıcıyı bul
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Kullanıcı bulunamadı" });
    }

    // Şifre doğru mu?
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Hatalı şifre" });
    }

    // Token oluştur
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    // ✅ role artık backend’den geliyor
    res.json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Giriş sırasında bir hata oluştu" });
  }
};

