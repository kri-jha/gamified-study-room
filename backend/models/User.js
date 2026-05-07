const mongoose = require("mongoose");

const LinkSchema = new mongoose.Schema({
  label: { type: String, default: "" },
  url:   { type: String, default: "" }
}, { _id: false });

const UserSchema = new mongoose.Schema({
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // Profile fields
  username:   { type: String },
  full_name:  { type: String },
  avatar_url: { type: String },
  bio:        { type: String },
  theme:      { type: String, default: "system" },

  // Social links (up to 4)
  links: { type: [LinkSchema], default: [] },

  // Follow system
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  // XP and Stats
  xp:               { type: Number, default: 0 },
  totalStudySeconds:{ type: Number, default: 0 },

  // Streak Tracking: array of ISO date strings ("YYYY-MM-DD") when user studied
  studyDays: [{ type: String }],

  // Analytics
  profileViews: { type: Number, default: 0 },

  // Array of unique room IDs the user has ever joined
  roomsJoined: [{ type: String }],

}, { timestamps: true });

// Virtual for unique room join count
UserSchema.virtual("roomJoins").get(function () {
  return this.roomsJoined ? this.roomsJoined.length : 0;
});

UserSchema.set("toJSON", { virtuals: true });
UserSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("User", UserSchema);
