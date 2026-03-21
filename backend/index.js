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

// this is for to handle the socket connectin
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  //join seesion room
  socket.on("joinSession", (sessionId) => {
    socket.join(sessionId);
    console.log("joined room:", sessionId);
  });

  // this is to send message in the room
  socket.on("sendMessage", ({ sessionId, message }) => {
    console.log("Message:", message);

    // emitting message in the same room
    io.to(sessionId).emit("receiveMessage", message);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/session", sessionRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on ${PORT}`));
