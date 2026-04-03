const Session = require("../models/Session");

// ✅ CREATE SESSION (MENTOR ONLY)
const createSession = async (req, res) => {
  try {
    // 🔒 only mentor allowed
    if (req.user.role !== "mentor") {
      return res.status(403).json({
        success: false,
        message: "Only mentors can create sessions",
      });
    }

    const session = await Session.create({
      mentorId: req.user.id,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: "Session created successfully",
      sessionId: session._id,
    });
  } catch (error) {
    console.error("Create Session Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ✅ JOIN SESSION
const joinSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findById(sessionId);

    if (!session || !session.isActive) {
      return res.status(404).json({
        success: false,
        message: "Session not found or inactive",
      });
    }

    res.status(200).json({
      success: true,
      message: "Session joined successfully",
    });
  } catch (error) {
    console.error("Join Session Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ✅ END SESSION (ONLY MENTOR WHO CREATED IT)
const endSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    // 🔒 only creator mentor can end
    if (session.mentorId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to end this session",
      });
    }

    session.isActive = false;
    await session.save();

    res.status(200).json({
      success: true,
      message: "Session ended successfully",
    });
  } catch (err) {
    console.error("End Session Error:", err.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = { createSession, joinSession, endSession };
