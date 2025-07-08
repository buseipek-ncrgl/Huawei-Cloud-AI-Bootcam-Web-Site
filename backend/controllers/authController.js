const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ✅ Kayıt işlemi (Sadece participant olarak kayıt)
exports.registerUser = async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body; // role kaldırıldı

    // Daha önce kayıtlı mı kontrol et
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Bu e-posta zaten kayıtlı" });
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    // Yeni kullanıcıyı oluştur (her zaman participant olarak)
    const newUser = await User.create({
      fullName,
      email,
      phone,
      password: hashedPassword,
      role: "participant" // Sabit olarak participant
    });

    res.status(201).json({ 
      message: "Kayıt başarılı",
      redirectTo: "/login" // Frontend'e yönlendirme bilgisi
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Kayıt sırasında bir hata oluştu" });
  }
};

// ✅ Giriş işlemi (Otomatik rol tespiti ve yönlendirme)
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body; // role parametresi kaldırıldı

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

    // Role göre yönlendirme URL'i belirle
    let redirectTo;
    switch (user.role) {
      case "instructor":
        redirectTo = "/instructor/dashboard";
        break;
      case "participant":
      default:
        redirectTo = "/dashboard";
        break;
    }

    res.json({
      token,
      fullName: user.fullName,
      role: user.role,
      redirectTo, // Frontend'e yönlendirme bilgisi
      message: "Giriş başarılı"
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Giriş sırasında bir hata oluştu" });
  }
};

// ✅ Manuel eğitmen ekleme (Database'den veya ayrı bir sistem ile)
exports.createInstructor = async (req, res) => {
  try {
    const { fullName, email, phone, password, specialization, bio, experience } = req.body;

    // E-posta kontrolü
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Bu e-posta zaten kayıtlı" });
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    // Eğitmen oluştur
    const newInstructor = await User.create({
      fullName,
      email,
      phone,
      password: hashedPassword,
      role: "instructor",
      instructorDetails: {
        specialization,
        bio,
        experience
      }
    });

    res.status(201).json({ 
      message: "Eğitmen başarıyla eklendi",
      instructor: {
        id: newInstructor._id,
        fullName: newInstructor.fullName,
        email: newInstructor.email,
        role: newInstructor.role
      }
    });
  } catch (err) {
    console.error("Create instructor error:", err);
    res.status(500).json({ error: "Eğitmen oluşturulurken bir hata oluştu" });
  }
};

// ✅ Kullanıcı profil bilgisi
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı" });
    }

    res.json({
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        instructorDetails: user.instructorDetails || null
      }
    });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ error: "Profil bilgisi alınırken hata oluştu" });
  }
};