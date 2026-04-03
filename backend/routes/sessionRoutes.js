const express = require("express");
const router = express.Router();

const {
  createSession,
  joinSession,
  endSession,
} = require("../controllers/sessionController");

const { protect, isMentor } = require("../middleware/authmiddleware");

// ✅ CREATE SESSION (mentor only)
router.post("/create", protect, isMentor, createSession);

// ✅ JOIN SESSION
router.get("/join/:sessionId", protect, joinSession);

// ✅ END SESSION (mentor only)
router.post("/end/:sessionId", protect, isMentor, endSession);

module.exports = router;
