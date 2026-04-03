const jwt = require("jsonwebtoken");

// 🔐 PROTECT ROUTE
const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // ❌ no token
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    // 🔑 verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // attach user
    req.user = decoded;

    next();
  } catch (err) {
    console.error("Auth error:", err.message);

    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid or expired token",
    });
  }
};

// 👨‍🏫 ROLE CHECK (MENTOR ONLY)
const isMentor = (req, res, next) => {
  try {
    if (!req.user || req.user.role !== "mentor") {
      return res.status(403).json({
        success: false,
        message: "Access denied: Mentor only",
      });
    }

    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = { protect, isMentor };
