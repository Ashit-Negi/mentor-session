require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const authRoutes = require("./routes/authRoutes");
const testRoutes = require("./routes/testRoutes");
const sessionRoutes = require("./routes/sessionRoutes");

const app = express();

// ✅ CORS FIX (secure)
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);

app.use(express.json());

connectDB();

const server = http.createServer(app);

// ✅ SOCKET SETUP
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // ✅ JOIN SESSION
  socket.on("joinSession", (sessionId) => {
    if (!sessionId) return;

    socket.join(sessionId);
    console.log(`User ${socket.id} joined room ${sessionId}`);

    // 🔥 notify others
    socket.to(sessionId).emit("userJoined");
  });

  // 💬 CHAT
  socket.on("sendMessage", ({ sessionId, message, senderId }) => {
    if (!sessionId || !message) return;

    const msgObj = {
      text: message,
      senderId,
      createdAt: new Date(),
    };

    io.to(sessionId).emit("receiveMessage", msgObj);
  });

  // 🔴 END SESSION
  socket.on("endSession", (sessionId) => {
    if (!sessionId) return;

    console.log("Session ended:", sessionId);

    io.to(sessionId).emit("sessionEnded");

    // optional: clear room
    // io.socketsLeave(sessionId);
  });

  // 🎥 WebRTC signaling
  socket.on("offer", ({ sessionId, offer }) => {
    socket.to(sessionId).emit("offer", offer);
  });

  socket.on("answer", ({ sessionId, answer }) => {
    socket.to(sessionId).emit("answer", answer);
  });

  socket.on("ice-candidate", ({ sessionId, candidate }) => {
    socket.to(sessionId).emit("ice-candidate", candidate);
  });

  // ❌ DISCONNECT
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    // 🔥 optional: notify room
    // socket.broadcast.emit("userLeft");
  });
});

// routes
app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/session", sessionRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on ${PORT}`));
