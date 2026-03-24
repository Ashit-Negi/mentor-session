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

// middleware
app.use(cors());
app.use(express.json());

connectDB();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// SOCKET LOGIC
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join session room
  socket.on("joinSession", (sessionId) => {
    socket.join(sessionId);
    console.log("Joined room:", sessionId);
  });

  // Send message (REAL-TIME ONLY)
  socket.on("sendMessage", ({ sessionId, message, senderId }) => {
    console.log("incoming message:", message);
    const msgObj = {
      text: message,
      senderId,
      createdAt: new Date(),
    };

    // broadcast to all users in room
    io.to(sessionId).emit("receiveMessage", msgObj);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// routes
app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/session", sessionRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on ${PORT}`));
