const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// SIGNUP
const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role, // ✅ dynamic role (mentor/student)
    });

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    res.status(201).json({
      msg: "User created successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("Signup Error:", error.message); // 🔥 helpful debug
    res.status(500).json({ msg: "Server error" });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // validation
    if (!email || !password) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ msg: "User not found please register first!" });
    }

    const userIsMatch = await bcrypt.compare(password, user.password);
    if (!userIsMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    res.json({
      msg: "Login successful",
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ msg: "Server error" });
  }
};

module.exports = { signup, login };
