const express = require("express");
const router = express.Router();

const { protect, isMentor } = require("../middleware/authmiddleware");

router.get("/profile", protect, (req, res) => {
  res.json({
    msg: "protected route accessed",
    user: req.user,
  });
});

router.get("/mentor", protect, isMentor, (req, res) => {
  res.json({
    msg: "Welcome Mentor",
    user: req.user,
  });
});

module.exports = router;
