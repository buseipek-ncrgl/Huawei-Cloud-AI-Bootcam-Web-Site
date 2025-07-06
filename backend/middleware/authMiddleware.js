const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authenticate = async (req, res, next) => {
  console.log("🔍 Middleware çalıştı");
  console.log("Headers:", req.headers.authorization);
  
  const token = req.headers.authorization?.split(" ")[1];
  console.log("Token:", token);
  
  if (!token) {
    console.log("❌ Token yok");
    return res.status(401).json({ error: "Token yok" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token doğrulandı:", decoded);
    
    const user = await User.findById(decoded.id);
    console.log("👤 Kullanıcı bulundu:", user ? user.fullName : "Bulunamadı");
    
    if (!user) {
      console.log("❌ Kullanıcı bulunamadı");
      return res.status(401).json({ error: "Kullanıcı bulunamadı" });
    }

    req.user = {
      id: user._id.toString(),
      role: user.role,
      fullName: user.fullName,
      email: user.email
    };

    console.log("✅ Middleware başarılı, devam ediyor");
    next();
  } catch (err) {
    console.log("❌ Token doğrulama hatası:", err.message);
    return res.status(403).json({ error: "Geçersiz token" });
  }
};

module.exports = authenticate;