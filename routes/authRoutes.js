const express = require("express");
const router = express.Router();

const validate = require("../middlewares/validate");
const protect = require("../middlewares/auth"); // ✅ للتحقق من التوكن
const restrictTo = require("../middlewares/restrictTo"); // ✅ للـ roles

const { signupSchema, loginSchema } = require("../validation/auth.schema");
const { signup, login } = require("../controllers/authController");

// ✅ Public Routes
router.post("/signup", validate(signupSchema), signup);
router.post("/login", validate(loginSchema), login);

// ✅ Example of Protected Route (لو عايز تضيفه)
router.get("/profile", protect, (req, res) => {
  res.json({
    message: "User profile data",
    user: req.user,
  });
});

// ✅ Example of Role-based Route (admin only)
router.get("/admin", protect, restrictTo("admin"), (req, res) => {
  res.json({
    message: "Welcome Admin",
    user: req.user,
  });
});

module.exports = router;
