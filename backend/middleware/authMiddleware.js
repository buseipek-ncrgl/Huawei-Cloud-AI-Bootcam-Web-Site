const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ✅ Ana authentication middleware
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

// ✅ Eğitmen yetkisi kontrolü
const requireInstructor = (req, res, next) => {
  console.log("🎓 Instructor yetki kontrolü:", req.user?.role);
  
  if (!req.user) {
    console.log("❌ Kullanıcı bilgisi yok");
    return res.status(401).json({ error: "Önce giriş yapmalısınız" });
  }

  if (req.user.role !== "instructor") {
    console.log("❌ Instructor yetkisi yok, mevcut rol:", req.user.role);
    return res.status(403).json({ 
      error: "Bu sayfaya erişim yetkiniz yok. Sadece eğitmenler erişebilir." 
    });
  }

  console.log("✅ Instructor yetkisi onaylandı");
  next();
};

// Admin yok - silindi

// ✅ Participant yetkisi kontrolü
const requireParticipant = (req, res, next) => {
  console.log("👤 Participant yetki kontrolü:", req.user?.role);
  
  if (!req.user) {
    console.log("❌ Kullanıcı bilgisi yok");
    return res.status(401).json({ error: "Önce giriş yapmalısınız" });
  }

  if (req.user.role !== "participant") {
    console.log("❌ Participant yetkisi yok, mevcut rol:", req.user.role);
    return res.status(403).json({ 
      error: "Bu sayfaya erişim yetkiniz yok. Sadece katılımcılar erişebilir." 
    });
  }

  console.log("✅ Participant yetkisi onaylandı");
  next();
};

// ✅ Çoklu rol kontrolü - daha esnek kullanım
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    console.log("🔐 Rol kontrolü:", req.user?.role, "İzin verilen roller:", allowedRoles);
    
    if (!req.user) {
      console.log("❌ Kullanıcı bilgisi yok");
      return res.status(401).json({ error: "Önce giriş yapmalısınız" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      console.log("❌ Rol yetkisi yok, mevcut rol:", req.user.role);
      return res.status(403).json({ 
        error: `Bu işlem için ${allowedRoles.join(' veya ')} yetkisi gerekli` 
      });
    }

    console.log("✅ Rol yetkisi onaylandı");
    next();
  };
};

// ✅ Sadece kendi profili düzenleyebilme kontrolü
const requireSelf = (req, res, next) => {
  console.log("👤 Self kontrolü");
  console.log("Requested user ID:", req.params.id);
  console.log("Current user ID:", req.user.id);
  
  if (!req.user) {
    return res.status(401).json({ error: "Önce giriş yapmalısınız" });
  }

  if (req.user.id === req.params.id) {
    console.log("✅ Self yetkisi onaylandı");
    next();
  } else {
    console.log("❌ Self yetkisi yok");
    return res.status(403).json({ 
      error: "Sadece kendi profilinizi düzenleyebilirsiniz" 
    });
  }
};

// ✅ Tüm middleware'leri export et
module.exports = {
  authenticate,
  requireInstructor,
  requireParticipant,
  requireRole,
  requireSelf
};