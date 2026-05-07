const mongoose = require("mongoose");

const MemberSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Can be user _id or a temporary session id
  name: { type: String, required: true },
  avatar: { type: String, default: "🧑‍💻" },
  status: { type: String, enum: ["studying", "idle"], default: "studying" }
}, { _id: false });

const RoomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  isPrivate: { type: Boolean, default: false },
  maxMembers: { type: Number, default: 10 },
  topic: { type: String, default: "" },
  timer: { type: String, default: "00:00:00" },
  members: [MemberSchema]
}, { timestamps: true });

module.exports = mongoose.model("Room", RoomSchema);
