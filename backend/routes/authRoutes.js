const express = require("express");

const router = express.Router();

const { signup, login } = require("../controllers/authController");
const { protect } = require("../middleware/authmiddleware");

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", protect, (req, res) => {
  res.json(req.user);
});

module.exports = router;
