const express = require("express");
const router = express.Router();

const { signup, login } = require("../controllers/authController");
const { protect } = require("../middleware/authmiddleware");

// ✅ REGISTER
router.post("/register", signup);

// ✅ LOGIN
router.post("/login", login);

// ✅ GET CURRENT USER
router.get("/me", protect, (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;
