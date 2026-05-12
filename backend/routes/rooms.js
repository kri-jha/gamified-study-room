const express = require("express");
const router = express.Router();
const Room = require("../models/Room");
const User = require("../models/User");
const auth = require("../middleware/auth");

const generateUniqueRoomCode = async () => {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const code = String(Math.floor(10000 + Math.random() * 90000));
    const existingRoom = await Room.exists({ code });
    if (!existingRoom) return code;
  }

  throw new Error("Could not generate a unique room code");
};

const sanitizeRoomForUser = (roomDoc, requesterId) => {
  const room = roomDoc.toObject ? roomDoc.toObject() : { ...roomDoc };
  const isOwner = room.owner && room.owner.toString() === requesterId;

  // Public room codes are never exposed. Private room codes are owner-only.
  if (!room.isPrivate || !isOwner) {
    delete room.code;
  }

  return room;
};

const addUserToRoom = async (room, req, memberInfo = {}) => {
  const userId = req.user.id;
  const exists = room.members.find((m) => m.userId === userId);

  if (!exists) {
    room.members.push({
      userId,
      name: memberInfo.name || "Anonymous",
      avatar: memberInfo.avatar || "U",
      status: "studying"
    });
    await room.save();
  }

  await User.findByIdAndUpdate(
    userId,
    { $addToSet: { roomsJoined: room._id.toString() } }
  );
};

// Get all rooms
// Get all rooms (Public rooms + Private rooms owned by user)
router.get("/", auth, async (req, res) => {
  try {
    const rooms = await Room.find({
      $or: [
        { isPrivate: false },
        { isPrivate: true, owner: req.user.id },
        { isPrivate: true, "members.userId": req.user.id }
      ]
    }).sort({ createdAt: -1 });

    const filteredRooms = rooms.map((room) => sanitizeRoomForUser(room, req.user.id));

    res.json(filteredRooms);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Get single room
router.get("/:id", auth, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ msg: "Room not found" });

    // Check if user is owner or member
    const isMember = room.members.some(m => m.userId === req.user.id);
    const isOwner = room.owner && room.owner.toString() === req.user.id;

    if (room.isPrivate && !isOwner && !isMember) {
      return res.status(403).json({ msg: "Access denied" });
    }

    res.json(sanitizeRoomForUser(room, req.user.id));
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Create a new room
router.post("/", auth, async (req, res) => {
  try {
    const { name, topic, isPrivate } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ msg: "Room name is required" });
    }

    const code = await generateUniqueRoomCode();

    const newRoom = new Room({
      name: name.trim(),
      code,
      isPrivate: Boolean(isPrivate),
      topic,
      owner: req.user.id,
      members: [] // Starts empty until someone joins
    });

    const room = await newRoom.save();
    res.json(sanitizeRoomForUser(room, req.user.id));
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Join a private room with only the 5-digit invite code
router.post("/join-by-code", auth, async (req, res) => {
  try {
    const { code, name, avatar } = req.body;
    const roomCode = String(code || "").trim();

    if (!/^\d{5}$/.test(roomCode)) {
      return res.status(400).json({ msg: "Enter a valid 5 digit room code" });
    }

    const room = await Room.findOne({ code: roomCode, isPrivate: true });
    if (!room) {
      return res.status(403).json({ msg: "Invalid room code" });
    }

    await addUserToRoom(room, req, { name, avatar });
    res.json(sanitizeRoomForUser(room, req.user.id));
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Delete a room
router.delete("/:id", auth, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ msg: "Room not found" });
    }

    // Check if user is owner
    if (room.owner && room.owner.toString() !== req.user.id) {
      return res.status(403).json({ msg: "User not authorized to delete this room" });
    }

    await room.deleteOne();
    res.json({ msg: "Room removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Join a room (HTTP fallback)
router.post("/:id/join", auth, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ msg: "Room not found" });
    }

    const { code, name, avatar } = req.body;
    const roomCode = String(code || "").trim();

    // Verify room code only for private rooms
    if (room.isPrivate && room.code !== roomCode) {
      return res.status(403).json({ msg: "Invalid room code" });
    }

    await addUserToRoom(room, req, { name, avatar });

    res.json(sanitizeRoomForUser(room, req.user.id));
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
