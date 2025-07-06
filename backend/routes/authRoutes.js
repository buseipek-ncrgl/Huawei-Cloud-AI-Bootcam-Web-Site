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

module.exports = router;