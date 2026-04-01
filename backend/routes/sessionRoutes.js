const express = require("express");
const router = express.Router();

const {
  createSession,
  joinSession,
  endSession,
} = require("../controllers/sessionController");

const { protect, isMentor } = require("../middleware/authmiddleware");

// mentor creates session
router.post("/create", protect, createSession);

// student joins
router.get("/join/:sessionId", protect, joinSession);

// mentor ends session
router.post("/end/:sessionId", protect, isMentor, endSession);

module.exports = router;
