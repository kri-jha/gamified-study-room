const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const auth = require("../middleware/auth");
const User = require("../models/User");

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, uploadDir); },
  filename: function (req, file, cb) {
    cb(null, req.user.id + "-" + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// ─── Update profile ───────────────────────────────────────────────────────────
// @route   PUT /api/users/profile
router.put("/profile", auth, async (req, res) => {
  const { username, full_name, bio, theme, avatar_url, links } = req.body;
  const fields = {};
  if (username   !== undefined) fields.username   = username;
  if (full_name  !== undefined) fields.full_name  = full_name;
  if (bio        !== undefined) fields.bio        = bio;
  if (theme      !== undefined) fields.theme      = theme;
  if (avatar_url !== undefined) fields.avatar_url = avatar_url;
  if (links      !== undefined) {
    // Validate: max 4 links
    fields.links = (Array.isArray(links) ? links : []).slice(0, 4);
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: fields },
      { new: true }
    ).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// ─── Upload avatar ────────────────────────────────────────────────────────────
// @route   POST /api/users/avatar
router.post("/avatar", auth, upload.single('avatar'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const avatar_url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.json({ avatar_url });
});

// ─── Leaderboard ─────────────────────────────────────────────────────────────
// @route   GET /api/users/leaderboard
router.get("/leaderboard", async (req, res) => {
  try {
    const users = await User.find()
      .sort({ xp: -1 })
      .limit(100)
      .select("username full_name avatar_url xp totalStudySeconds _id");
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// ─── Public profile (increments profileViews) ─────────────────────────────────
// @route   GET /api/users/:id/public
router.get("/:id/public", async (req, res) => {
  try {
    // Increment view count (do NOT count own profile view — handled on frontend by not calling this for own profile)
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $inc: { profileViews: 1 } },
      { new: true }
    ).select("-password").populate("followers", "username full_name avatar_url _id")
     .populate("following", "username full_name avatar_url _id");

    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// ─── Get own profile stats (no view increment) ────────────────────────────────
// @route   GET /api/users/:id/stats
router.get("/:id/stats", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("followers", "username full_name avatar_url _id")
      .populate("following", "username full_name avatar_url _id");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// ─── Follow a user ────────────────────────────────────────────────────────────
// @route   POST /api/users/:id/follow
router.post("/:id/follow", auth, async (req, res) => {
  try {
    const targetId = req.params.id;
    const meId = req.user.id;

    if (targetId === meId) return res.status(400).json({ error: "Cannot follow yourself" });

    const target = await User.findById(targetId);
    const me     = await User.findById(meId);
    if (!target || !me) return res.status(404).json({ error: "User not found" });

    // Check already following
    if (me.following.includes(targetId)) {
      return res.status(400).json({ error: "Already following" });
    }

    await User.findByIdAndUpdate(meId,     { $addToSet: { following: targetId } });
    await User.findByIdAndUpdate(targetId, { $addToSet: { followers: meId } });

    res.json({ success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// ─── Unfollow a user ──────────────────────────────────────────────────────────
// @route   DELETE /api/users/:id/follow
router.delete("/:id/follow", auth, async (req, res) => {
  try {
    const targetId = req.params.id;
    const meId = req.user.id;

    await User.findByIdAndUpdate(meId,     { $pull: { following: targetId } });
    await User.findByIdAndUpdate(targetId, { $pull: { followers: meId } });

    res.json({ success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// ─── Get followers list ───────────────────────────────────────────────────────
// @route   GET /api/users/:id/followers
router.get("/:id/followers", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("followers", "username full_name avatar_url _id");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user.followers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// ─── Get following list ───────────────────────────────────────────────────────
// @route   GET /api/users/:id/following
router.get("/:id/following", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("following", "username full_name avatar_url _id");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user.following);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// ─── Add XP ───────────────────────────────────────────────────────────────────
// @route   POST /api/users/:id/xp
router.post("/:id/xp", async (req, res) => {
  try {
    const { seconds } = req.body;
    const minutes = Math.floor(seconds / 60);
    let xpGain = Math.floor(minutes / 2);
    if (minutes >= 60) xpGain += Math.floor(minutes / 60) * 2;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    user.totalStudySeconds += seconds;
    user.xp += xpGain;

    const today = new Date().toISOString().split("T")[0];
    if (!user.studyDays.includes(today)) user.studyDays.push(today);

    await user.save();
    res.json({ xp: user.xp, totalStudySeconds: user.totalStudySeconds, xpGain });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
