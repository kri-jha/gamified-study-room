const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");
const User = require("../models/User");

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post("/register", async (req, res) => {
  const { email, password, full_name, username } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: "User already exists" });
    }

    user = new User({
      email,
      password,
      full_name,
      username
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token, 
          user: { id: user.id, email: user.email, full_name: user.full_name, username: user.username, avatar_url: user.avatar_url, bio: user.bio, contact_no: user.contact_no, theme: user.theme } 
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user and get token
// @access  Public
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid Credentials" });
    }

    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token, 
          user: { id: user.id, email: user.email, full_name: user.full_name, username: user.username, avatar_url: user.avatar_url, bio: user.bio, contact_no: user.contact_no, theme: user.theme } 
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   GET api/auth/me
// @desc    Get user by token
// @access  Private
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
