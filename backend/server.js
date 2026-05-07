const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "*", // allow frontend to connect
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
// Serve static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/gamified-productivity-tool")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/rooms", require("./routes/rooms")); // the new rooms router
app.use("/api/ai", require("./routes/ai")); // chatbot router


// Socket.io matching rooms
io.on("connection", (socket) => {
  console.log("User connected to socket:", socket.id);

  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
    // Broadcast to room that someone joined
    socket.to(roomId).emit("user_joined", { id: socket.id });
  });

  socket.on("leave_room", (roomId) => {
    socket.leave(roomId);
    console.log(`User ${socket.id} left room ${roomId}`);
    socket.to(roomId).emit("user_left", { id: socket.id });
  });

  socket.on("send_message", (data) => {
    // data = { roomId, message, sender... }
    io.to(data.roomId).emit("receive_message", data);
  });

  socket.on("status_change", (data) => {
    // data = { roomId, userId, status }
    io.to(data.roomId).emit("user_status_changed", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
