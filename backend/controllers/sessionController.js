const Session = require("../models/Session");

// creating seesion(by mentors only)
const createSession = async (req, res) => {
  try {
    const session = await Session.create({
      mentorId: req.user.id,
    });
    res.json({
      msg: "Session created",
      session,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const joinSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await Session.findById(sessionId);

    if (!session || !session.isActive) {
      return res.status(404).json({ msg: "session not found" });
    }

    res.json({
      msg: "joined session",
      session,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const endSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({ msg: "Session not found" });
    }

    session.isActive = false;
    await session.save();

    res.json({ msg: "Session ended" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createSession, joinSession, endSession };
