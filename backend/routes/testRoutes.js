const express = require("express");
const router = express.Router();

const { protect, isMentor } = require("../middleware/authmiddleware");

// ✅ CURRENT USER
router.get("/me", protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: "User profile fetched",
    user: req.user,
  });
});

// ✅ MENTOR ONLY TEST
router.get("/mentor", protect, isMentor, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome Mentor",
    user: req.user,
  });
});

module.exports = router;
